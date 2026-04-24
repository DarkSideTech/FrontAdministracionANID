import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  NgbNav,
  NgbNavContent,
  NgbNavItem,
  NgbNavItemRole,
  NgbNavLink,
  NgbNavLinkBase,
  NgbNavModule,
  NgbNavOutlet,
} from '@ng-bootstrap/ng-bootstrap';
import { finalize, forkJoin } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { AccountAuthService } from '@core/auth/account-auth.service';
import {
  AuthenticatedUser,
  PasswordChangeChallengeDispatchResultPayload,
} from '@core/auth/auth.models';
import { EnumerationOption } from '@core/enumerations/enumeration.models';
import { EnumerationService } from '@core/enumerations/enumeration.service';
import { formatApiError } from '@core/service/api-error.util';
import {
  buildModificaUsuarioPayload,
  createModificaUsuarioProfileForm,
  isNationalUser,
  matchingPasswordsValidator,
  patchModificaUsuarioProfileForm,
  passwordPolicyValidator,
} from '../shared/user-profile-form';

@Component({
  selector: 'app-mi-perfil',
  imports: [
    RouterLink,
    ReactiveFormsModule,
    NgbNav,
    NgbNavItem,
    NgbNavItemRole,
    NgbNavLinkBase,
    NgbNavLink,
    NgbNavContent,
    NgbNavOutlet,
    NgbNavModule,
  ],
  templateUrl: './mi-perfil.component.html',
  styleUrl: './mi-perfil.component.scss',
})
export class MiPerfilComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly accountAuthService = inject(AccountAuthService);
  private readonly enumerationService = inject(EnumerationService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly profileForm = createModificaUsuarioProfileForm(this.formBuilder);
  readonly emailChangeForm = this.formBuilder.nonNullable.group({
    idUsuario: [''],
    nuevoCorreoElectronico: ['', [Validators.required, Validators.email, Validators.minLength(5)]],
  });
  readonly passwordChangeForm = this.formBuilder.nonNullable.group(
    {
      idUsuario: [''],
      claveActual: ['', Validators.required],
      nuevaClave: ['', [Validators.required, passwordPolicyValidator()]],
      confirmaNuevaClave: ['', Validators.required],
      codigoValidacion: [''],
    },
    {
      validators: [matchingPasswordsValidator('nuevaClave', 'confirmaNuevaClave')],
    },
  );

  active = 1;
  submitted = false;
  emailChangeSubmitted = false;
  loading = false;
  saving = false;
  changingEmail = false;
  error = '';
  success = '';
  emailChangeError = '';
  passwordChangeError = '';
  passwordChangeSuccess = '';
  passwordChangeSubmitted = false;
  requestingPasswordChangeCode = false;
  resendingPasswordChangeCode = false;
  confirmingPasswordChange = false;
  passwordChangeDispatch: PasswordChangeChallengeDispatchResultPayload | null = null;

  profile: AuthenticatedUser | null = null;
  tipoDeUsuarioOptions: EnumerationOption[] = [];
  nacionalidadOptions: EnumerationOption[] = [];
  documentoDeIdentidadOptions: EnumerationOption[] = [];
  sexoDeclarativoOptions: EnumerationOption[] = [];
  sexoRegistralOptions: EnumerationOption[] = [];

  ngOnInit(): void {
    this.loadProfile();
  }

  get isNationalProfile(): boolean {
    return isNationalUser(this.profile?.tipoDeUsuario);
  }

  get telefonoDisplay(): string {
    return this.profile?.numeroDeTelefono?.trim() || 'No informado';
  }

  onSubmit(): void {
    this.submitted = true;
    this.error = '';
    this.success = '';

    if (this.loading || this.saving) {
      return;
    }

    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      this.error = 'Completa los campos obligatorios y corrige los errores del formulario.';
      return;
    }

    this.saving = true;
    this.accountAuthService
      .modificaUsuario(buildModificaUsuarioPayload(this.profileForm.getRawValue()))
      .pipe(
        finalize(() => (this.saving = false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => {
          this.success = response.Message || 'Los datos del usuario fueron actualizados correctamente.';
          this.reloadProfileData();
        },
        error: (error: unknown) => {
          this.error = formatApiError(error);
        },
      });
  }

  onChangeEmail(): void {
    this.emailChangeSubmitted = true;
    this.emailChangeError = '';

    if (this.loading || this.saving || this.changingEmail) {
      return;
    }

    if (this.emailChangeForm.invalid) {
      this.emailChangeForm.markAllAsTouched();
      this.emailChangeError = 'Ingresa un correo electrónico válido para continuar.';
      return;
    }

    const payload = this.emailChangeForm.getRawValue();
    const nuevoCorreoElectronico = payload.nuevoCorreoElectronico.trim();
    const correoActual = this.profile?.email?.trim() ?? '';

    if (!payload.idUsuario.trim()) {
      this.emailChangeError = 'No fue posible determinar el usuario autenticado.';
      return;
    }

    if (correoActual && nuevoCorreoElectronico.localeCompare(correoActual, undefined, { sensitivity: 'accent' }) === 0) {
      this.emailChangeError = 'El nuevo correo electrónico debe ser distinto al actual.';
      return;
    }

    this.changingEmail = true;
    this.accountAuthService
      .modificaCorreoElectronico({
        idUsuario: payload.idUsuario.trim(),
        nuevoCorreoElectronico,
      })
      .pipe(
        finalize(() => (this.changingEmail = false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: async (response) => {
          this.accountAuthService.forceLogout(false);
          await this.router.navigate(['/authentication/confirm-email'], {
            queryParams: { email: response.Email ?? nuevoCorreoElectronico },
            state: { emailDispatchResult: response },
          });
        },
        error: (error: unknown) => {
          this.emailChangeError = formatApiError(error);
        },
      });
  }

  onRequestPasswordChangeCode(): void {
    this.passwordChangeSubmitted = true;
    this.passwordChangeError = '';
    this.passwordChangeSuccess = '';

    if (this.loading || this.requestingPasswordChangeCode || this.confirmingPasswordChange) {
      return;
    }

    const idUsuario = this.passwordChangeForm.get('idUsuario')?.value.trim() ?? '';
    const claveActual = this.passwordChangeForm.get('claveActual');
    const nuevaClave = this.passwordChangeForm.get('nuevaClave');
    const confirmaNuevaClave = this.passwordChangeForm.get('confirmaNuevaClave');

    if (!idUsuario || !claveActual || !nuevaClave || !confirmaNuevaClave) {
      this.passwordChangeError = 'No fue posible determinar el usuario autenticado.';
      return;
    }

    claveActual.markAsTouched();
    nuevaClave.markAsTouched();
    confirmaNuevaClave.markAsTouched();

    if (claveActual.invalid || nuevaClave.invalid || confirmaNuevaClave.invalid || this.passwordChangeForm.hasError('passwordMismatch')) {
      this.passwordChangeError = 'Completa la clave actual y la nueva clave con un formato válido.';
      return;
    }

    this.requestingPasswordChangeCode = true;
    this.accountAuthService
      .solicitaCambioClave({
        idUsuario,
        claveActual: claveActual.value,
        nuevaClave: nuevaClave.value,
        confirmaNuevaClave: confirmaNuevaClave.value,
      })
      .pipe(
        finalize(() => (this.requestingPasswordChangeCode = false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => {
          this.passwordChangeDispatch = response;
          this.passwordChangeSuccess = response.Message || 'Se envió el código de validación al correo electrónico registrado.';
        },
        error: (error: unknown) => {
          this.passwordChangeError = formatApiError(error);
        },
      });
  }

  onResendPasswordChangeCode(): void {
    this.passwordChangeError = '';
    this.passwordChangeSuccess = '';

    if (this.loading || this.resendingPasswordChangeCode || this.requestingPasswordChangeCode || this.confirmingPasswordChange) {
      return;
    }

    const idUsuario = this.passwordChangeForm.get('idUsuario')?.value.trim() ?? '';
    if (!idUsuario) {
      this.passwordChangeError = 'No fue posible determinar el usuario autenticado.';
      return;
    }

    this.resendingPasswordChangeCode = true;
    this.accountAuthService
      .reenviaCodigoCambioClave({ idUsuario })
      .pipe(
        finalize(() => (this.resendingPasswordChangeCode = false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => {
          this.passwordChangeDispatch = response;
          this.passwordChangeSuccess = response.Message || 'Se envió un nuevo código de validación al correo electrónico registrado.';
        },
        error: (error: unknown) => {
          this.passwordChangeError = formatApiError(error);
        },
      });
  }

  async onConfirmPasswordChange(): Promise<void> {
    this.passwordChangeSubmitted = true;
    this.passwordChangeError = '';
    this.passwordChangeSuccess = '';

    if (this.loading || this.confirmingPasswordChange || this.requestingPasswordChangeCode || this.resendingPasswordChangeCode) {
      return;
    }

    const idUsuario = this.passwordChangeForm.get('idUsuario')?.value.trim() ?? '';
    const claveActual = this.passwordChangeForm.get('claveActual');
    const nuevaClave = this.passwordChangeForm.get('nuevaClave');
    const confirmaNuevaClave = this.passwordChangeForm.get('confirmaNuevaClave');
    const codigoValidacion = this.passwordChangeForm.get('codigoValidacion');

    if (!idUsuario || !claveActual || !nuevaClave || !confirmaNuevaClave || !codigoValidacion) {
      this.passwordChangeError = 'No fue posible determinar el usuario autenticado.';
      return;
    }

    this.passwordChangeForm.markAllAsTouched();

    if (
      claveActual.invalid ||
      nuevaClave.invalid ||
      confirmaNuevaClave.invalid ||
      !codigoValidacion.value.trim() ||
      this.passwordChangeForm.hasError('passwordMismatch')
    ) {
      this.passwordChangeError = 'Completa todos los campos requeridos antes de confirmar el cambio de clave.';
      return;
    }

    this.confirmingPasswordChange = true;
    this.accountAuthService
      .confirmaCambioClave({
        idUsuario,
        claveActual: claveActual.value,
        nuevaClave: nuevaClave.value,
        confirmaNuevaClave: confirmaNuevaClave.value,
        codigoValidacion: codigoValidacion.value.trim(),
      })
      .pipe(
        finalize(() => (this.confirmingPasswordChange = false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: async (response) => {
          this.accountAuthService.forceLogout(false);
          await this.router.navigate(['/authentication/signin'], {
            state: {
              passwordChangeMessage: response.Message || 'Clave modificada correctamente. Debes iniciar sesión nuevamente.',
            },
          });
        },
        error: (error: unknown) => {
          this.passwordChangeError = formatApiError(error);
        },
      });
  }

  isInvalid(controlName: string): boolean {
    const control = this.profileForm.get(controlName);
    if (!control || control.disabled) {
      return false;
    }

    const shouldShow = this.submitted || control.touched || control.dirty;
    if (!shouldShow) {
      return false;
    }

    if (control.invalid) {
      return true;
    }

    return controlName === 'confirmaPassword' && this.profileForm.hasError('passwordMismatch');
  }

  errorFor(controlName: string): string {
    const control = this.profileForm.get(controlName);
    if (!control || !this.isInvalid(controlName)) {
      return '';
    }

    if (controlName === 'confirmaPassword' && this.profileForm.hasError('passwordMismatch')) {
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

  isEmailChangeInvalid(): boolean {
    const control = this.emailChangeForm.get('nuevoCorreoElectronico');
    if (!control) {
      return false;
    }

    return (this.emailChangeSubmitted || control.touched || control.dirty) && control.invalid;
  }

  emailChangeErrorFor(): string {
    const control = this.emailChangeForm.get('nuevoCorreoElectronico');
    if (!control || !this.isEmailChangeInvalid()) {
      return '';
    }

    if (control.errors?.['required']) {
      return 'Este campo es obligatorio.';
    }

    if (control.errors?.['email']) {
      return 'Ingresa un correo electrónico válido.';
    }

    if (control.errors?.['minlength']) {
      return `Debe contener al menos ${control.errors['minlength'].requiredLength} caracteres.`;
    }

    return 'El valor ingresado no es válido.';
  }

  isPasswordChangeInvalid(controlName: 'claveActual' | 'nuevaClave' | 'confirmaNuevaClave' | 'codigoValidacion'): boolean {
    const control = this.passwordChangeForm.get(controlName);
    if (!control) {
      return false;
    }

    const shouldShow = this.passwordChangeSubmitted || control.touched || control.dirty;
    if (!shouldShow) {
      return false;
    }

    if (control.invalid) {
      return true;
    }

    return controlName === 'confirmaNuevaClave' && this.passwordChangeForm.hasError('passwordMismatch');
  }

  passwordChangeErrorFor(controlName: 'claveActual' | 'nuevaClave' | 'confirmaNuevaClave' | 'codigoValidacion'): string {
    const control = this.passwordChangeForm.get(controlName);
    if (!control || !this.isPasswordChangeInvalid(controlName)) {
      return '';
    }

    if (controlName === 'confirmaNuevaClave' && this.passwordChangeForm.hasError('passwordMismatch')) {
      return 'La confirmación de la nueva clave no coincide.';
    }

    if (control.errors?.['required']) {
      return 'Este campo es obligatorio.';
    }

    if (control.errors?.['passwordPolicy']) {
      return 'La contraseña debe tener entre 8 y 12 caracteres, una mayúscula, una minúscula, un número y uno de (!?*.@%$).';
    }

    return 'El valor ingresado no es válido.';
  }

  private loadProfile(): void {
    this.loading = true;
    this.error = '';

    forkJoin({
      csrf: this.accountAuthService.ensureCsrfToken(),
      session: this.accountAuthService.loadMyInformation(),
      catalogs: this.enumerationService.loadProfileCatalogs(),
    })
      .pipe(
        finalize(() => (this.loading = false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: ({ session, catalogs }) => {
          this.tipoDeUsuarioOptions = catalogs.tipoDeUsuario;
          this.nacionalidadOptions = catalogs.nacionalidades;
          this.documentoDeIdentidadOptions = catalogs.documentosDeIdentidad;
          this.sexoDeclarativoOptions = catalogs.sexoDeclarativo;
          this.sexoRegistralOptions = catalogs.sexoRegistral;

          this.bindProfile(session.user);
        },
        error: (error: unknown) => {
          this.error = formatApiError(error);
        },
      });
  }

  private reloadProfileData(): void {
    this.accountAuthService
      .loadMyInformation()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (session) => {
          this.bindProfile(session.user);
        },
        error: (error: unknown) => {
          this.error = formatApiError(error);
        },
      });
  }

  private bindProfile(profile: AuthenticatedUser | null): void {
    this.profile = profile;
    if (!profile) {
      this.error = 'No fue posible cargar la información del usuario.';
      return;
    }

    patchModificaUsuarioProfileForm(this.profileForm, profile);
    this.emailChangeForm.reset(
      {
        idUsuario: profile.id ?? '',
        nuevoCorreoElectronico: '',
      },
      { emitEvent: false },
    );
    this.emailChangeSubmitted = false;
    this.emailChangeError = '';
    this.passwordChangeForm.reset(
      {
        idUsuario: profile.id ?? '',
        claveActual: '',
        nuevaClave: '',
        confirmaNuevaClave: '',
        codigoValidacion: '',
      },
      { emitEvent: false },
    );
    this.passwordChangeSubmitted = false;
    this.passwordChangeError = '';
    this.passwordChangeSuccess = '';
    this.passwordChangeDispatch = null;
    this.applyEditabilityRules(profile);
  }

  private applyEditabilityRules(profile: AuthenticatedUser): void {
    const controlsToDisable = [
      'idUsuario',
      'correoElectronico',
      'tipoDeUsuario',
    ] as const;

    this.profileForm.enable({ emitEvent: false });

    controlsToDisable.forEach((controlName) => {
      this.profileForm.get(controlName)?.disable({ emitEvent: false });
    });

    if (isNationalUser(profile.tipoDeUsuario)) {
      [
        'numeroDeTelefono',
        'nacionalidad',
        'documentoDeIdentidad',
        'numeroDeDocumento',
        'codigoValidadorDocumento',
        'primerNombre',
        'segundoNombre',
        'primerApellido',
        'segundoApellido',
        'sexoDeclarativo',
        'fechaDeNacimiento',
      ].forEach((controlName) => {
        this.profileForm.get(controlName)?.disable({ emitEvent: false });
      });

      this.profileForm.get('sexoRegistral')?.enable({ emitEvent: false });
      return;
    }

    [
      'numeroDeTelefono',
      'nacionalidad',
      'documentoDeIdentidad',
      'numeroDeDocumento',
      'codigoValidadorDocumento',
      'primerNombre',
      'segundoNombre',
      'primerApellido',
      'segundoApellido',
      'sexoDeclarativo',
      'sexoRegistral',
      'fechaDeNacimiento',
    ].forEach((controlName) => {
      this.profileForm.get(controlName)?.enable({ emitEvent: false });
    });
  }
}
