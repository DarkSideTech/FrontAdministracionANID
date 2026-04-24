import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize, switchMap } from 'rxjs';

import { AccountAuthService } from '@core/auth/account-auth.service';
import { PasswordChangeChallengeDispatchResultPayload } from '@core/auth/auth.models';
import { formatApiError } from '@core/service/api-error.util';
import { matchingPasswordsValidator, passwordPolicyValidator } from '../shared/user-profile-form';

@Component({
    selector: 'app-reset',
    templateUrl: './reset.component.html',
    styleUrls: ['./reset.component.sass'],
    imports: [CommonModule, ReactiveFormsModule, RouterLink]
})
export class ResetComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly accountAuthService = inject(AccountAuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly resetForm = this.formBuilder.nonNullable.group(
    {
      correoElectronico: ['', [Validators.required, Validators.email, Validators.minLength(5)]],
      codigoValidacion: ['', [Validators.required, Validators.maxLength(20)]],
      nuevaClave: ['', [Validators.required, passwordPolicyValidator()]],
      confirmaNuevaClave: ['', Validators.required],
    },
    {
      validators: [matchingPasswordsValidator('nuevaClave', 'confirmaNuevaClave')],
    },
  );

  submitted = false;
  loading = false;
  resending = false;
  error = '';
  success = '';
  dispatch: PasswordChangeChallengeDispatchResultPayload | null = null;

  ngOnInit(): void {
    const email = this.route.snapshot.queryParamMap.get('email')?.trim() ?? '';
    if (email) {
      this.resetForm.patchValue({ correoElectronico: email });
    }

    const navigationState = history.state as { passwordRecoveryDispatch?: PasswordChangeChallengeDispatchResultPayload } | undefined;
    this.dispatch = navigationState?.passwordRecoveryDispatch ?? null;
    this.success = this.dispatch?.Message ?? '';
  }

  onConfirm(): void {
    this.submitted = true;
    this.error = '';
    this.success = '';

    if (this.loading || this.resending) {
      return;
    }

    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      this.error = 'Completa los campos obligatorios y corrige los errores del formulario.';
      return;
    }

    const formValue = this.resetForm.getRawValue();
    this.loading = true;

    this.accountAuthService
      .ensureCsrfToken()
      .pipe(
        switchMap(() => this.accountAuthService.confirmaRecuperacionClave({
          correoElectronico: formValue.correoElectronico.trim(),
          codigoValidacion: formValue.codigoValidacion.trim(),
          nuevaClave: formValue.nuevaClave,
          confirmaNuevaClave: formValue.confirmaNuevaClave,
        })),
        finalize(() => (this.loading = false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => {
          void this.router.navigate(['/authentication/signin'], {
            state: {
              passwordChangeMessage: response.Message ?? 'Clave recuperada correctamente. Debes iniciar sesion con tu nueva clave.',
            },
          });
        },
        error: (error: unknown) => {
          this.error = formatApiError(error);
        },
      });
  }

  onResend(): void {
    this.error = '';
    this.success = '';

    const emailControl = this.resetForm.get('correoElectronico');
    if (!emailControl || emailControl.invalid || this.loading || this.resending) {
      emailControl?.markAsTouched();
      this.error = 'Ingresa un correo electronico valido para reenviar el codigo.';
      return;
    }

    const correoElectronico = emailControl.value.trim();
    this.resending = true;

    this.accountAuthService
      .ensureCsrfToken()
      .pipe(
        switchMap(() => this.accountAuthService.reenviaCodigoRecuperacionClave({ correoElectronico })),
        finalize(() => (this.resending = false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => {
          this.dispatch = response;
          this.success = response.Message ?? 'Solicitud procesada correctamente.';
        },
        error: (error: unknown) => {
          this.error = formatApiError(error);
        },
      });
  }

  isInvalid(controlName: ResetFormControlName): boolean {
    const control = this.resetForm.get(controlName);
    const formMismatch = controlName === 'confirmaNuevaClave' && this.resetForm.hasError('passwordMismatch');
    return Boolean(control && (this.submitted || control.touched || control.dirty) && (control.invalid || formMismatch));
  }

  errorFor(controlName: ResetFormControlName): string {
    const control = this.resetForm.get(controlName);
    if (!control || !this.isInvalid(controlName)) {
      return '';
    }

    if (controlName === 'confirmaNuevaClave' && this.resetForm.hasError('passwordMismatch')) {
      return 'La confirmacion de la nueva clave no corresponde.';
    }

    if (control.errors?.['required']) {
      return 'Este campo es obligatorio.';
    }

    if (control.errors?.['email']) {
      return 'Ingresa un correo electronico valido.';
    }

    if (control.errors?.['minlength']) {
      return `Debe contener al menos ${control.errors['minlength'].requiredLength} caracteres.`;
    }

    if (control.errors?.['maxlength']) {
      return `No puede exceder ${control.errors['maxlength'].requiredLength} caracteres.`;
    }

    if (control.errors?.['passwordPolicy']) {
      return 'La clave debe tener entre 8 y 12 caracteres, una mayuscula, una minuscula, un numero y uno de (!?*.@%$).';
    }

    return 'El valor ingresado no es valido.';
  }
}

type ResetFormControlName = 'correoElectronico' | 'codigoValidacion' | 'nuevaClave' | 'confirmaNuevaClave';
