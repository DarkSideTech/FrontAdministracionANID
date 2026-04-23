import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { FeatherModule } from 'angular-feather';
import { finalize, forkJoin, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { AccountAuthService } from '@core/auth/account-auth.service';
import { RegisterResultPayload } from '@core/auth/auth.models';
import { EnumerationOption } from '@core/enumerations/enumeration.models';
import { EnumerationService } from '@core/enumerations/enumeration.service';
import { formatApiError } from '@core/service/api-error.util';
import {
  buildRegisterPayload,
  createUserProfileForm,
  getDefaultUserProfileFormValue,
  resolveDefaultOption,
} from '../shared/user-profile-form';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.sass'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    FeatherModule,
    RouterLink,
  ],
})
export class SignupComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly accountAuthService = inject(AccountAuthService);
  private readonly enumerationService = inject(EnumerationService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly defaultTipoDeUsuario = 'EXTRANJERO';
  readonly defaultNacionalidad = 'Chileno_a';

  readonly registerForm = createUserProfileForm(this.formBuilder);

  tipoDeUsuarioOptions: EnumerationOption[] = [];
  nacionalidadOptions: EnumerationOption[] = [];
  documentoDeIdentidadOptions: EnumerationOption[] = [];
  sexoDeclarativoOptions: EnumerationOption[] = [];
  sexoRegistralOptions: EnumerationOption[] = [];

  submitted = false;
  loadingCatalogs = false;
  loading = false;
  error = '';

  ngOnInit(): void {
    this.loadCatalogs();
  }

  onSubmit(): void {
    this.submitted = true;
    this.error = '';

    if (this.loadingCatalogs || this.loading) {
      return;
    }

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      this.error = 'Completa los campos obligatorios y corrige los errores del formulario.';
      return;
    }

    this.loading = true;
    const payload = buildRegisterPayload(this.registerForm.getRawValue());

    this.accountAuthService
      .ensureCsrfToken()
      .pipe(
        switchMap(() => this.accountAuthService.register(payload)),
        finalize(() => (this.loading = false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => {
          void this.navigateToConfirmation(response);
        },
        error: (error: unknown) => {
          void this.handleRegisterError(error);
        },
      });
  }

  isInvalid(controlName: string): boolean {
    const control = this.registerForm.get(controlName);
    if (!control) {
      return false;
    }

    const shouldShow = this.submitted || control.touched || control.dirty;
    if (!shouldShow) {
      return false;
    }

    if (control.invalid) {
      return true;
    }

    return controlName === 'confirmaPassword' && this.registerForm.hasError('passwordMismatch');
  }

  errorFor(controlName: string): string {
    const control = this.registerForm.get(controlName);
    if (!control || !this.isInvalid(controlName)) {
      return '';
    }

    if (controlName === 'confirmaPassword' && this.registerForm.hasError('passwordMismatch')) {
      return 'La confirmación de la contraseña no coincide.';
    }

    if (control.errors?.['required']) {
      return 'Este campo es obligatorio.';
    }

    if (control.errors?.['requiredTrue']) {
      return 'Debes aceptar los términos y condiciones.';
    }

    if (control.errors?.['email']) {
      return 'Ingresa un correo electrónico válido.';
    }

    if (control.errors?.['minlength']) {
      return `Debe contener al menos ${control.errors['minlength'].requiredLength} caracteres.`;
    }

    if (control.errors?.['maxlength']) {
      return `No puede exceder ${control.errors['maxlength'].requiredLength} caracteres.`;
    }

    if (control.errors?.['passwordPolicy']) {
      return 'La contraseña debe tener entre 8 y 12 caracteres, una mayúscula, una minúscula, un número y uno de (!?*.@%$).';
    }

    return 'El valor ingresado no es válido.';
  }

  private loadCatalogs(): void {
    this.loadingCatalogs = true;

    forkJoin({
      csrf: this.accountAuthService.ensureCsrfToken(),
      catalogs: this.enumerationService.loadSignupCatalogs(),
    })
      .pipe(
        finalize(() => (this.loadingCatalogs = false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: ({ catalogs }) => {
          this.tipoDeUsuarioOptions = catalogs.tipoDeUsuario;
          this.nacionalidadOptions = catalogs.nacionalidades;
          this.documentoDeIdentidadOptions = catalogs.documentosDeIdentidad;
          this.sexoDeclarativoOptions = catalogs.sexoDeclarativo;
          this.sexoRegistralOptions = catalogs.sexoRegistral;

          this.registerForm.patchValue({
            tipoDeUsuario: resolveDefaultOption(this.tipoDeUsuarioOptions, this.defaultTipoDeUsuario),
            nacionalidad: resolveDefaultOption(this.nacionalidadOptions, this.defaultNacionalidad),
          });
        },
        error: (error: unknown) => {
          this.error = formatApiError(error);
        },
      });
  }

  private getDefaultFormValue() {
    return getDefaultUserProfileFormValue(
      {
        tipoDeUsuario: this.tipoDeUsuarioOptions,
        nacionalidades: this.nacionalidadOptions,
      },
      this.defaultTipoDeUsuario,
      this.defaultNacionalidad,
    );
  }

  private async navigateToConfirmation(response: RegisterResultPayload): Promise<void> {
    await this.router.navigate(['/authentication/confirm-email'], {
      queryParams: {
        email: response.Email ?? this.registerForm.getRawValue().correoElectronico.trim(),
      },
      state: {
        registerResult: response,
      },
    });
  }

  private async handleRegisterError(error: unknown): Promise<void> {
    const message = formatApiError(error);
    const email = this.registerForm.getRawValue().correoElectronico.trim();

    if (message.includes('pendiente de confirmacion')) {
      await this.router.navigate(['/authentication/confirm-email'], {
        queryParams: { email },
      });
      return;
    }

    if (message.includes('Debe iniciar sesion')) {
      await this.router.navigate(['/authentication/signin']);
      return;
    }

    this.error = message;
  }
}
