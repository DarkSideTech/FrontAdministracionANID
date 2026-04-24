import { AbstractControl, FormBuilder, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

import { AuthenticatedUser } from '@core/auth/auth.models';
import { EnumerationOption } from '@core/enumerations/enumeration.models';
import { ModificaUsuarioViewModel, RegisterViewModel } from '@core/service/openapi.models';

export function createUserProfileForm(formBuilder: FormBuilder) {
  return formBuilder.nonNullable.group(
    {
      idUsuario: [''],
      correoElectronico: ['', [Validators.required, Validators.email, Validators.minLength(5)]],
      numeroDeTelefono: ['', [Validators.minLength(8), Validators.maxLength(100)]],
      nacionalidad: ['', Validators.required],
      tipoDeUsuario: ['', Validators.required],
      documentoDeIdentidad: ['', Validators.required],
      numeroDeDocumento: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
      codigoValidadorDocumento: ['', [Validators.required, Validators.maxLength(100)]],
      primerNombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      segundoNombre: [''],
      primerApellido: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      segundoApellido: [''],
      sexoDeclarativo: ['', Validators.required],
      sexoRegistral: ['', Validators.required],
      fechaDeNacimiento: ['', Validators.required],
      password: ['', [Validators.required, passwordPolicyValidator()]],
      confirmaPassword: ['', Validators.required],
      terminosYCondiciones: [false, Validators.requiredTrue],
    },
    {
      validators: [matchingPasswordsValidator('password', 'confirmaPassword')],
    },
  );
}

export function createModificaUsuarioProfileForm(formBuilder: FormBuilder) {
  return formBuilder.nonNullable.group({
    idUsuario: [''],
    correoElectronico: ['', [Validators.required, Validators.email, Validators.minLength(5)]],
    numeroDeTelefono: ['', [Validators.minLength(8), Validators.maxLength(100)]],
    nacionalidad: ['', Validators.required],
    tipoDeUsuario: ['', Validators.required],
    documentoDeIdentidad: ['', Validators.required],
    numeroDeDocumento: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
    codigoValidadorDocumento: ['', [Validators.required, Validators.maxLength(100)]],
    primerNombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    segundoNombre: [''],
    primerApellido: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    segundoApellido: [''],
    sexoDeclarativo: ['', Validators.required],
    sexoRegistral: ['', Validators.required],
    fechaDeNacimiento: ['', Validators.required],
  });
}

export function buildRegisterPayload(value: UserProfileFormValue): RegisterViewModel {
  return {
    correoElectronico: value.correoElectronico.trim(),
    numeroDeTelefono: emptyToNull(value.numeroDeTelefono),
    nacionalidad: value.nacionalidad,
    tipoDeUsuario: value.tipoDeUsuario,
    documentoDeIdentidad: value.documentoDeIdentidad,
    numeroDeDocumento: value.numeroDeDocumento.trim(),
    codigoValidadorDocumento: value.codigoValidadorDocumento.trim(),
    primerNombre: value.primerNombre.trim(),
    segundoNombre: emptyToNull(value.segundoNombre),
    primerApellido: value.primerApellido.trim(),
    segundoApellido: emptyToNull(value.segundoApellido),
    sexoDeclarativo: value.sexoDeclarativo,
    sexoRegistral: value.sexoRegistral,
    fechaDeNacimiento: value.fechaDeNacimiento,
    contraseña: value.password,
    confirmaContraseña: value.confirmaPassword,
    terminosYCondiciones: value.terminosYCondiciones,
  };
}

export function buildModificaUsuarioPayload(value: ModificaUsuarioProfileFormValue): ModificaUsuarioViewModel {
  return {
    idUsuario: value.idUsuario.trim(),
    numeroDeTelefono: emptyToNull(value.numeroDeTelefono),
    nacionalidad: value.nacionalidad,
    documentoDeIdentidad: value.documentoDeIdentidad,
    numeroDeDocumento: value.numeroDeDocumento.trim(),
    codigoValidadorDocumento: value.codigoValidadorDocumento.trim(),
    primerNombre: value.primerNombre.trim(),
    segundoNombre: emptyToNull(value.segundoNombre),
    primerApellido: value.primerApellido.trim(),
    segundoApellido: emptyToNull(value.segundoApellido),
    sexoDeclarativo: value.sexoDeclarativo,
    sexoRegistral: value.sexoRegistral,
    fechaDeNacimiento: value.fechaDeNacimiento,
  };
}

export function patchUserProfileForm(
  form: ReturnType<typeof createUserProfileForm>,
  user: AuthenticatedUser,
): void {
  form.patchValue({
    idUsuario: user.id ?? '',
    correoElectronico: user.email ?? '',
    numeroDeTelefono: user.numeroDeTelefono ?? '',
    nacionalidad: user.nacionalidad ?? '',
    tipoDeUsuario: user.tipoDeUsuario ?? '',
    documentoDeIdentidad: user.documentoDeIdentidad ?? '',
    numeroDeDocumento: user.numeroDeDocumento ?? '',
    codigoValidadorDocumento: user.codigoValidadorDocumento ?? '',
    primerNombre: user.primerNombre ?? '',
    segundoNombre: user.segundoNombre ?? '',
    primerApellido: user.primerApellido ?? '',
    segundoApellido: user.segundoApellido ?? '',
    sexoDeclarativo: user.sexoDeclarativo ?? '',
    sexoRegistral: user.sexoRegistral ?? '',
    fechaDeNacimiento: normalizeDateForInput(user.fechaDeNacimiento),
    password: '',
    confirmaPassword: '',
    terminosYCondiciones: true,
  });
}

export function patchModificaUsuarioProfileForm(
  form: ReturnType<typeof createModificaUsuarioProfileForm>,
  user: AuthenticatedUser,
): void {
  form.patchValue({
    idUsuario: user.id ?? '',
    correoElectronico: user.email ?? '',
    numeroDeTelefono: user.numeroDeTelefono ?? '',
    nacionalidad: user.nacionalidad ?? '',
    tipoDeUsuario: user.tipoDeUsuario ?? '',
    documentoDeIdentidad: user.documentoDeIdentidad ?? '',
    numeroDeDocumento: user.numeroDeDocumento ?? '',
    codigoValidadorDocumento: user.codigoValidadorDocumento ?? '',
    primerNombre: user.primerNombre ?? '',
    segundoNombre: user.segundoNombre ?? '',
    primerApellido: user.primerApellido ?? '',
    segundoApellido: user.segundoApellido ?? '',
    sexoDeclarativo: user.sexoDeclarativo ?? '',
    sexoRegistral: user.sexoRegistral ?? '',
    fechaDeNacimiento: normalizeDateForInput(user.fechaDeNacimiento),
  });
}

export function getDefaultUserProfileFormValue(options: {
  tipoDeUsuario: EnumerationOption[];
  nacionalidades: EnumerationOption[];
}, preferredTipoDeUsuario: string, preferredNacionalidad: string) {
  return {
    idUsuario: '',
    correoElectronico: '',
    numeroDeTelefono: '',
    nacionalidad: resolveDefaultOption(options.nacionalidades, preferredNacionalidad),
    tipoDeUsuario: resolveDefaultOption(options.tipoDeUsuario, preferredTipoDeUsuario),
    documentoDeIdentidad: '',
    numeroDeDocumento: '',
    codigoValidadorDocumento: '',
    primerNombre: '',
    segundoNombre: '',
    primerApellido: '',
    segundoApellido: '',
    sexoDeclarativo: '',
    sexoRegistral: '',
    fechaDeNacimiento: '',
    password: '',
    confirmaPassword: '',
    terminosYCondiciones: false,
  };
}

export function resolveDefaultOption(options: EnumerationOption[], preferredValue: string): string {
  return options.some((option) => option.value === preferredValue)
    ? preferredValue
    : (options[0]?.value ?? '');
}

export function isNationalUser(tipoDeUsuario: string | null | undefined): boolean {
  return (tipoDeUsuario ?? '').trim().toUpperCase() === 'NACIONAL';
}

function normalizeDateForInput(value: string | null | undefined): string {
  return value ? value.slice(0, 10) : '';
}

function emptyToNull(value: string): string | null {
  const trimmedValue = value.trim();
  return trimmedValue ? trimmedValue : null;
}

export function passwordPolicyValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = (control.value ?? '') as string;
    if (!value) {
      return null;
    }

    const validPassword =
      value.length >= 8 &&
      value.length <= 12 &&
      /[A-Z]/.test(value) &&
      /[a-z]/.test(value) &&
      /[0-9]/.test(value) &&
      /[!?.*@%$]/.test(value);

    return validPassword ? null : { passwordPolicy: true };
  };
}

export function matchingPasswordsValidator(passwordControlName: string, confirmPasswordControlName: string): ValidatorFn {
  return (formGroup: AbstractControl): ValidationErrors | null => {
    const password = formGroup.get(passwordControlName)?.value;
    const confirmPassword = formGroup.get(confirmPasswordControlName)?.value;

    if (!password || !confirmPassword) {
      return null;
    }

    return password === confirmPassword ? null : { passwordMismatch: true };
  };
}

type UserProfileFormValue = ReturnType<ReturnType<typeof createUserProfileForm>['getRawValue']>;
type ModificaUsuarioProfileFormValue = ReturnType<ReturnType<typeof createModificaUsuarioProfileForm>['getRawValue']>;
