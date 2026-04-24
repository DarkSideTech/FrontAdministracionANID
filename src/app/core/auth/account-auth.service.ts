import { HttpContext, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, finalize, map, Observable, of, shareReplay, tap, throwError } from 'rxjs';

import { BYPASS_REFRESH } from '../http/http-context-tokens';
import { LoginClaveUnicaInterface } from '@core/models/login-clave-unica.interface';
import { AccountApi } from '@core/service/controllers/account.api';
import {
  ConfirmaCambioClaveViewModel,
  ConfirmaRecuperacionClaveViewModel,
  ConfirmEmailRequest,
  LoginViewModel,
  ModificaCorreoElectronicoViewModel,
  ModificaUsuarioViewModel,
  ReenviaCodigoCambioClaveViewModel,
  ReenviaCodigoRecuperacionClaveViewModel,
  RegisterViewModel,
  ResendEmailConfirmationTokenRequest,
  SolicitaCambioClaveViewModel,
  SolicitaRecuperacionClaveViewModel,
} from '@core/service/openapi.models';
import { AuthStore } from './auth-store.service';
import {
  ActiveProcess,
  ApiResult,
  AuthSnapshot,
  AuthenticatedUser,
  CurrentUserPayload,
  EmailConfirmationDispatchResultPayload,
  EmailConfirmationResultPayload,
  ModifyUserResultPayload,
  OrganizationOption,
  OrganizationalUnitEntityRoleOption,
  PasswordChangeChallengeDispatchResultPayload,
  PasswordChangeResultPayload,
  ProfileLoginPayload,
  RegisterResultPayload,
  SelectedEntityRole,
} from './auth.models';

const ACCESS_TOKEN_REFRESH_BUFFER_MS = 60_000;

@Injectable({ providedIn: 'root' })
export class AccountAuthService {
  private readonly accountApi = inject(AccountApi);
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);
  private refreshRequest$: Observable<void> | null = null;
  private initializeRequest$: Observable<void> | null = null;

  initialize(): Observable<void> {
    if (this.initializeRequest$) {
      return this.initializeRequest$;
    }

    this.initializeRequest$ = this.initializeSession().pipe(
      catchError(() => {
        this.authStore.clear();
        return of(void 0);
      }),
      shareReplay({ bufferSize: 1, refCount: false }),
      finalize(() => {
        this.initializeRequest$ = null;
      }),
    );

    return this.initializeRequest$;
  }

  login(credentials: LoginViewModel): Observable<AuthSnapshot> {
    return this.accountApi
      .login({
        body: credentials,
        context: this.contextWithoutRefresh(),
      })
      .pipe(
        map((response) => this.unwrapSuccess(response, normalizeProfileLoginPayload)),
        tap((payload) => this.authStore.applyProfile(payload)),
        map(() => this.authStore.snapshot()),
      );
  }

  ensureCsrfToken(): Observable<void> {
    return this.accountApi.csrf({ context: this.contextWithoutRefresh() }).pipe(
      map(() => void 0),
    );
  }

  register(payload: RegisterViewModel): Observable<RegisterResultPayload> {
    return this.accountApi
      .register({
        body: payload,
        context: this.contextWithoutRefresh(),
      })
      .pipe(
        map((response) => this.unwrapSuccess(response, normalizeRegisterResponse)),
      );
  }

  confirmEmail(payload: ConfirmEmailRequest): Observable<EmailConfirmationResultPayload> {
    return this.accountApi
      .confirmEmail({
        body: payload,
        context: this.contextWithoutRefresh(),
      })
      .pipe(
        map((response) => this.unwrapSuccess(response, normalizeEmailConfirmationResult)),
      );
  }

  resendConfirmationEmail(email: string): Observable<EmailConfirmationDispatchResultPayload> {
    const payload: ResendEmailConfirmationTokenRequest = { email };

    return this.accountApi
      .resendConfirmationEmail({
        body: payload,
        context: this.contextWithoutRefresh(),
      })
      .pipe(
        map((response) => this.unwrapSuccess(response, normalizeEmailConfirmationDispatchResponse)),
      );
  }

  loginClaveUnica(payload: LoginClaveUnicaInterface): Observable<AuthSnapshot> {
    return this.accountApi
      .loginClaveUnica({
        body: payload,
        context: this.contextWithoutRefresh(),
      })
      .pipe(
        map((response) => this.unwrapSuccess(response, normalizeProfileLoginPayload)),
        tap((profile) => this.authStore.applyProfile(profile)),
        map(() => this.authStore.snapshot()),
      );
  }

  loginOrganizacion(codigoOrganizacion: string): Observable<AuthSnapshot> {
    return this.accountApi
      .loginOrganizacion({
        body: { organizacion: codigoOrganizacion },
      })
      .pipe(
        map((response) => this.unwrapSuccess(response, normalizeProfileLoginPayload)),
        tap((payload) => this.authStore.applyProfile(payload)),
        map(() => this.authStore.snapshot()),
      );
  }

  cambioUnidadOrganizacionalEntidadRol(idEntidad: string, idRol: string): Observable<AuthSnapshot> {
    return this.accountApi
      .cambioUnidadOrganizacionalEntidadRol({
        body: {
          id_Entidad: idEntidad,
          id_Rol: idRol,
        },
      })
      .pipe(
        map((response) => this.unwrapSuccess(response, normalizeProfileLoginPayload)),
        tap((payload) => this.authStore.applyProfile(payload)),
        map(() => this.authStore.snapshot()),
      );
  }

  loadCurrentUser(): Observable<AuthSnapshot> {
    return this.accountApi
      .currentUser({ context: this.contextWithoutRefresh() })
      .pipe(
        map((response) => this.unwrapSuccess(response, normalizeCurrentUserPayload)),
        tap((payload) => this.authStore.applyCurrentUser(payload)),
        map(() => this.authStore.snapshot()),
      );
  }

  loadMyInformation(): Observable<AuthSnapshot> {
    return this.accountApi
      .miInformacion({ context: this.contextWithoutRefresh() })
      .pipe(
        map((response) => this.unwrapSuccess(response, normalizeProfileLoginPayload)),
        tap((payload) => this.authStore.applyProfile(payload)),
        map(() => this.authStore.snapshot()),
      );
  }

  modificaUsuario(payload: ModificaUsuarioViewModel): Observable<ModifyUserResultPayload> {
    return this.accountApi
      .modificaUsuario({
        body: payload,
      })
      .pipe(
        map((response) => this.unwrapSuccess(response, normalizeModifyUserResponse)),
      );
  }

  modificaCorreoElectronico(payload: ModificaCorreoElectronicoViewModel): Observable<EmailConfirmationDispatchResultPayload> {
    return this.accountApi
      .modificaCorreoElectronico({
        body: payload,
      })
      .pipe(
        map((response) => this.unwrapSuccess(response, normalizeEmailConfirmationDispatchResponse)),
      );
  }

  solicitaCambioClave(payload: SolicitaCambioClaveViewModel): Observable<PasswordChangeChallengeDispatchResultPayload> {
    return this.accountApi
      .solicitaCambioClave({
        body: payload,
      })
      .pipe(
        map((response) => this.unwrapSuccess(response, normalizePasswordChangeDispatchResponse)),
      );
  }

  reenviaCodigoCambioClave(payload: ReenviaCodigoCambioClaveViewModel): Observable<PasswordChangeChallengeDispatchResultPayload> {
    return this.accountApi
      .reenviaCodigoCambioClave({
        body: payload,
      })
      .pipe(
        map((response) => this.unwrapSuccess(response, normalizePasswordChangeDispatchResponse)),
      );
  }

  confirmaCambioClave(payload: ConfirmaCambioClaveViewModel): Observable<PasswordChangeResultPayload> {
    return this.accountApi
      .confirmaCambioClave({
        body: payload,
      })
      .pipe(
        map((response) => this.unwrapSuccess(response, normalizePasswordChangeResult)),
      );
  }

  solicitaRecuperacionClave(payload: SolicitaRecuperacionClaveViewModel): Observable<PasswordChangeChallengeDispatchResultPayload> {
    return this.accountApi
      .solicitaRecuperacionClave({
        body: payload,
        context: this.contextWithoutRefresh(),
      })
      .pipe(
        map((response) => this.unwrapSuccess(response, normalizePasswordChangeDispatchResponse)),
      );
  }

  reenviaCodigoRecuperacionClave(payload: ReenviaCodigoRecuperacionClaveViewModel): Observable<PasswordChangeChallengeDispatchResultPayload> {
    return this.accountApi
      .reenviaCodigoRecuperacionClave({
        body: payload,
        context: this.contextWithoutRefresh(),
      })
      .pipe(
        map((response) => this.unwrapSuccess(response, normalizePasswordChangeDispatchResponse)),
      );
  }

  confirmaRecuperacionClave(payload: ConfirmaRecuperacionClaveViewModel): Observable<PasswordChangeResultPayload> {
    return this.accountApi
      .confirmaRecuperacionClave({
        body: payload,
        context: this.contextWithoutRefresh(),
      })
      .pipe(
        map((response) => this.unwrapSuccess(response, normalizePasswordChangeResult)),
      );
  }

  refreshSession(): Observable<void> {
    if (this.refreshRequest$) {
      return this.refreshRequest$;
    }

    this.refreshRequest$ = this.accountApi
      .refreshToken({ body: {}, context: this.contextWithoutRefresh() })
      .pipe(
        map((response) => this.unwrapSuccess(response, normalizeProfileLoginPayload)),
        tap((payload) => this.authStore.applyProfile(payload)),
        map(() => void 0),
        shareReplay({ bufferSize: 1, refCount: false }),
        finalize(() => {
          this.refreshRequest$ = null;
        }),
      );

    return this.refreshRequest$;
  }

  getAccessTokenRefreshState(): 'none' | 'recommended' | 'required' {
    if (!this.authStore.hasSession()) {
      return 'none';
    }

    const expiration = this.getAccessTokenExpirationTime();
    if (expiration === null) {
      return 'none';
    }

    const remainingTime = expiration - Date.now();
    if (remainingTime <= 0) {
      return 'required';
    }

    return remainingTime <= ACCESS_TOKEN_REFRESH_BUFFER_MS ? 'recommended' : 'none';
  }

  logout(redirectToLogin = true): Observable<void> {
    return this.accountApi.logout({ context: this.contextWithoutRefresh() }).pipe(
      map(() => void 0),
      catchError(() => of(void 0)),
      tap(() => this.forceLogout(redirectToLogin)),
    );
  }

  forceLogout(redirectToLogin = true): void {
    this.authStore.clear();

    if (redirectToLogin) {
      void this.router.navigateByUrl('/authentication/signin');
    }
  }

  resolvePostLoginUrl(): string {
    return '/authentication/selecciona-organizacion';
  }

  resolveAuthenticatedUrl(snapshot = this.authStore.snapshot()): string {
    return snapshot.organizationSelectionRequired || !snapshot.selectedOrganizationCode
      ? '/authentication/selecciona-organizacion'
      : '/paneles/estadisticas-usuarios';
  }

  private contextWithoutRefresh(): HttpContext {
    return new HttpContext().set(BYPASS_REFRESH, true);
  }

  private initializeSession(): Observable<void> {
    const refreshState = this.getAccessTokenRefreshState();

    if (refreshState === 'required') {
      return this.refreshSession();
    }

    if (refreshState === 'recommended') {
      return this.refreshSession().pipe(
        catchError(() => this.loadCurrentUserWithRefreshFallback()),
      );
    }

    return this.loadCurrentUserWithRefreshFallback();
  }

  private loadCurrentUserWithRefreshFallback(): Observable<void> {
    return this.loadCurrentUser().pipe(
      map(() => void 0),
      catchError((error) => {
        if (!this.isUnauthorizedError(error)) {
          return throwError(() => error);
        }

        return this.refreshSession();
      }),
    );
  }

  private getAccessTokenExpirationTime(): number | null {
    const expiration = this.authStore.accessTokenExpiration();
    if (!expiration) {
      return null;
    }

    const parsedExpiration = Date.parse(expiration);
    return Number.isFinite(parsedExpiration) ? parsedExpiration : null;
  }

  private isUnauthorizedError(error: unknown): error is HttpErrorResponse {
    return error instanceof HttpErrorResponse && error.status === 401;
  }

  private unwrapSuccess<T>(response: unknown, mapper: (value: unknown) => T): T {
    const envelope = unwrapEnvelope(response);

    if (!envelope.Result) {
      throw new Error(normalizeString(envelope.Data) || 'La operacion no devolvio un resultado exitoso.');
    }

    return mapper(envelope.Data);
  }
}

function normalizeProfileLoginPayload(value: unknown): ProfileLoginPayload {
  const parsed = toRecord(parseMaybeJson(value));

  return {
    AccessTokenExpiracion: normalizeString(pick(parsed, 'AccessTokenExpiracion', 'accessTokenExpiracion')),
    OrganizacionesPorUsuario: normalizeOrganizationOptions(
      pick(parsed, 'OrganizacionesPorUsuario', 'organizacionesPorUsuario'),
    ),
    UnidadesOrganizacionalesPorUsuario: normalizeOrganizationalUnitOptions(
      pick(parsed, 'UnidadesOrganizacionalesPorUsuario', 'unidadesOrganizacionalesPorUsuario'),
    ),
    User: normalizeUser(pick(parsed, 'User', 'user')),
    ProcesosActivos: normalizeProcesses(pick(parsed, 'ProcesosActivos', 'procesosActivos')),
    CodigoOrganizacionSeleccionada: normalizeString(
      pick(parsed, 'CodigoOrganizacionSeleccionada', 'codigoOrganizacionSeleccionada'),
    ),
    NombreOrganizacionSeleccionada: normalizeString(
      pick(parsed, 'NombreOrganizacionSeleccionada', 'nombreOrganizacionSeleccionada'),
    ),
    CodigoUnidadOrganizacionalSeleccionada: normalizeString(
      pick(parsed, 'CodigoUnidadOrganizacionalSeleccionada', 'codigoUnidadOrganizacionalSeleccionada'),
    ),
    NombreUnidadOrganizacionalSeleccionada: normalizeString(
      pick(parsed, 'NombreUnidadOrganizacionalSeleccionada', 'nombreUnidadOrganizacionalSeleccionada'),
    ),
    IdEntidadSeleccionada: normalizeString(
      pick(parsed, 'IdEntidadSeleccionada', 'idEntidadSeleccionada'),
    ),
    EntidadRolSeleccionado: normalizeSelectedEntityRole(
      pick(
        parsed,
        'EntidadRolSeleccionado',
        'entidadRolSeleccionado',
        'PoliticaAsignadaPorEntidadSeleccionada',
        'politicaAsignadaPorEntidadSeleccionada',
      ),
    ),
    SeleccionOrganizacionRequerida: normalizeBoolean(
      pick(parsed, 'SeleccionOrganizacionRequerida', 'seleccionOrganizacionRequerida'),
    ),
  };
}

function normalizeCurrentUserPayload(value: unknown): CurrentUserPayload {
  const parsed = toRecord(parseMaybeJson(value));
  const normalizedUser = normalizeUser(pick(parsed, 'User', 'user'));

  return {
    IsAuthenticated: normalizeBoolean(pick(parsed, 'IsAuthenticated', 'isAuthenticated')),
    UserId: normalizeString(pick(parsed, 'UserId', 'userId')),
    Email: normalizeString(pick(parsed, 'Email', 'email')),
    NombreADesplegar: normalizeString(pick(parsed, 'NombreADesplegar', 'nombreADesplegar')),
    User: normalizedUser,
    OrganizacionesPorUsuario: normalizeOrganizationOptions(
      pick(parsed, 'OrganizacionesPorUsuario', 'organizacionesPorUsuario'),
    ),
    UnidadesOrganizacionalesPorUsuario: normalizeOrganizationalUnitOptions(
      pick(parsed, 'UnidadesOrganizacionalesPorUsuario', 'unidadesOrganizacionalesPorUsuario'),
    ),
    ProcesosActivos: normalizeProcesses(pick(parsed, 'ProcesosActivos', 'procesosActivos')),
    ExpiresAtUtc: normalizeString(pick(parsed, 'ExpiresAtUtc', 'expiresAtUtc')),
    OrganizacionSeleccionada: normalizeString(
      pick(parsed, 'OrganizacionSeleccionada', 'organizacionSeleccionada'),
    ),
    NombreOrganizacionSeleccionada: normalizeString(
      pick(parsed, 'NombreOrganizacionSeleccionada', 'nombreOrganizacionSeleccionada'),
    ),
    CodigoUnidadOrganizacionalSeleccionada: normalizeString(
      pick(parsed, 'CodigoUnidadOrganizacionalSeleccionada', 'codigoUnidadOrganizacionalSeleccionada'),
    ),
    NombreUnidadOrganizacionalSeleccionada: normalizeString(
      pick(parsed, 'NombreUnidadOrganizacionalSeleccionada', 'nombreUnidadOrganizacionalSeleccionada'),
    ),
    EntidadIdSeleccionada: normalizeString(
      pick(parsed, 'EntidadIdSeleccionada', 'entidadIdSeleccionada'),
    ),
    EntidadRolSeleccionado: normalizeSelectedEntityRole(
      pick(
        parsed,
        'EntidadRolSeleccionado',
        'entidadRolSeleccionado',
        'PoliticaAsignadaPorEntidadSeleccionada',
        'politicaAsignadaPorEntidadSeleccionada',
      ),
    ),
    SeleccionOrganizacionRequerida: normalizeBoolean(
      pick(parsed, 'SeleccionOrganizacionRequerida', 'seleccionOrganizacionRequerida'),
    ),
    SeleccionOrganizacionrequerida: normalizeBoolean(
      pick(parsed, 'SeleccionOrganizacionrequerida', 'seleccionOrganizacionrequerida'),
    ),
  };
}

function normalizeRegisterResponse(value: unknown): RegisterResultPayload {
  const parsed = toRecord(parseMaybeJson(value));

  return {
    Email: normalizeString(pick(parsed, 'Email', 'email')),
    RequiresEmailConfirmation: normalizeBoolean(
      pick(parsed, 'RequiresEmailConfirmation', 'requiresEmailConfirmation'),
    ),
    CanResendConfirmationEmail: normalizeBoolean(
      pick(parsed, 'CanResendConfirmationEmail', 'canResendConfirmationEmail'),
    ),
    Message: normalizeString(pick(parsed, 'Message', 'message')),
    ConfirmationUrl: normalizeString(pick(parsed, 'ConfirmationUrl', 'confirmationUrl')),
    ValidationToken: normalizeString(pick(parsed, 'ValidationToken', 'validationToken')),
  };
}

function normalizeEmailConfirmationDispatchResponse(value: unknown): EmailConfirmationDispatchResultPayload {
  const parsed = toRecord(parseMaybeJson(value));

  return {
    Email: normalizeString(pick(parsed, 'Email', 'email')),
    Message: normalizeString(pick(parsed, 'Message', 'message')),
    ConfirmationUrl: normalizeString(pick(parsed, 'ConfirmationUrl', 'confirmationUrl')),
    ValidationToken: normalizeString(pick(parsed, 'ValidationToken', 'validationToken')),
  };
}

function normalizeEmailConfirmationResult(value: unknown): EmailConfirmationResultPayload {
  const parsed = toRecord(parseMaybeJson(value));
  const message = normalizeString(pick(parsed, 'Message', 'message', 'Data', 'data'));

  if (message) {
    return { Message: message };
  }

  if (typeof value === 'string' && value.trim()) {
    return { Message: value.trim() };
  }

  return {
    Message: 'La validacion del correo electronico fue procesada correctamente.',
  };
}

function normalizeModifyUserResponse(value: unknown): ModifyUserResultPayload {
  const parsed = toRecord(parseMaybeJson(value));

  return {
    UserId: normalizeString(pick(parsed, 'UserId', 'userId')),
    Message: normalizeString(pick(parsed, 'Message', 'message')),
  };
}

function normalizePasswordChangeDispatchResponse(value: unknown): PasswordChangeChallengeDispatchResultPayload {
  const parsed = toRecord(parseMaybeJson(value));

  return {
    Email: normalizeString(pick(parsed, 'Email', 'email')),
    Message: normalizeString(pick(parsed, 'Message', 'message')),
    ExpiresAtUtc: normalizeString(pick(parsed, 'ExpiresAtUtc', 'expiresAtUtc')),
    CanResendAtUtc: normalizeString(pick(parsed, 'CanResendAtUtc', 'canResendAtUtc')),
  };
}

function normalizePasswordChangeResult(value: unknown): PasswordChangeResultPayload {
  const parsed = toRecord(parseMaybeJson(value));

  return {
    Message: normalizeString(pick(parsed, 'Message', 'message', 'Data', 'data')),
  };
}

function normalizeOrganizationOptions(value: unknown): OrganizationOption[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => {
    const parsed = toRecord(item);
    return {
      Codigo_Organizacion: normalizeString(
        pick(parsed, 'Codigo_Organizacion', 'codigo_Organizacion', 'codigoOrganizacion'),
      ),
      Nombre_Organizacion: normalizeString(
        pick(parsed, 'Nombre_Organizacion', 'nombre_Organizacion', 'nombreOrganizacion'),
      ),
    };
  });
}

function normalizeOrganizationalUnitOptions(value: unknown): OrganizationalUnitEntityRoleOption[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => {
    const parsed = toRecord(item);
    return {
      Codigo_UnidadOrganizacional: normalizeString(
        pick(parsed, 'Codigo_UnidadOrganizacional', 'codigo_UnidadOrganizacional', 'codigoUnidadOrganizacional'),
      ),
      Nombre_UnidadOrganizacional: normalizeString(
        pick(parsed, 'Nombre_UnidadOrganizacional', 'nombre_UnidadOrganizacional', 'nombreUnidadOrganizacional'),
      ),
      Id_Entidad: normalizeString(
        pick(parsed, 'Id_Entidad', 'id_Entidad', 'idEntidad'),
      ),
      Id_Rol: normalizeString(
        pick(parsed, 'Id_Rol', 'id_Rol', 'idRol'),
      ),
      Nombre_Rol: normalizeString(
        pick(parsed, 'Nombre_Rol', 'nombre_Rol', 'nombreRol', 'Rol', 'rol'),
      ),
    };
  });
}

function normalizeSelectedEntityRole(value: unknown): SelectedEntityRole | null {
  const parsed = toRecord(value);
  if (!Object.keys(parsed).length) {
    return null;
  }

  return {
    Codigo_UnidadOrganizacional: normalizeString(
      pick(parsed, 'Codigo_UnidadOrganizacional', 'codigo_UnidadOrganizacional', 'codigoUnidadOrganizacional'),
    ),
    Id_Entidad: normalizeString(
      pick(parsed, 'Id_Entidad', 'id_Entidad', 'idEntidad'),
    ),
    Id_Rol: normalizeString(
      pick(parsed, 'Id_Rol', 'id_Rol', 'idRol', 'IdRol'),
    ),
  };
}

function normalizeUser(value: unknown): AuthenticatedUser | null {
  const parsed = toRecord(parseMaybeJson(value));
  if (!Object.keys(parsed).length) {
    return null;
  }

  return {
    id: normalizeString(pick(parsed, 'Id', 'id')),
    email: normalizeString(pick(parsed, 'Email', 'email')),
    nombreADesplegar: normalizeString(pick(parsed, 'NombreADesplegar', 'nombreADesplegar')),
    numeroDeTelefono: normalizeString(pick(parsed, 'NumeroDeTelefono', 'numeroDeTelefono')),
    tipoDeUsuario: normalizeString(pick(parsed, 'TipoDeUsuario', 'tipoDeUsuario')),
    nacionalidad: normalizeString(pick(parsed, 'Nacionalidad', 'nacionalidad')),
    documentoDeIdentidad: normalizeString(pick(parsed, 'DocumentoDeIdentidad', 'documentoDeIdentidad')),
    numeroDeDocumento: normalizeString(pick(parsed, 'NumeroDeDocumento', 'numeroDeDocumento')),
    codigoValidadorDocumento: normalizeString(
      pick(parsed, 'CodigoValidadorDocumento', 'codigoValidadorDocumento'),
    ),
    primerNombre: normalizeString(pick(parsed, 'PrimerNombre', 'primerNombre')),
    segundoNombre: normalizeString(pick(parsed, 'SegundoNombre', 'segundoNombre')),
    primerApellido: normalizeString(pick(parsed, 'PrimerApellido', 'primerApellido')),
    segundoApellido: normalizeString(pick(parsed, 'SegundoApellido', 'segundoApellido')),
    sexoDeclarativo: normalizeString(pick(parsed, 'SexoDeclarativo', 'sexoDeclarativo')),
    sexoRegistral: normalizeString(pick(parsed, 'SexoRegistral', 'sexoRegistral')),
    fechaDeNacimiento: normalizeDateString(pick(parsed, 'FechaDeNacimiento', 'fechaDeNacimiento')),
    roles: normalizeStringArray(pick(parsed, 'Roles', 'roles')),
    unidadesOrganizacionales: normalizeStringArray(
      pick(parsed, 'UnidadesOrganizacionales', 'unidadesOrganizacionales'),
    ),
  };
}

function normalizeProcesses(value: unknown): ActiveProcess[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => {
    const parsed = toRecord(item);
    return {
      IdProceso: normalizeString(pick(parsed, 'IdProceso', 'idProceso')),
      IdMacroProceso: normalizeString(pick(parsed, 'IdMacroProceso', 'idMacroProceso')),
      Codigo: normalizeString(pick(parsed, 'Codigo', 'codigo')),
      Roles: normalizeStringArray(pick(parsed, 'Roles', 'roles')),
      NombreProceso: normalizeString(pick(parsed, 'NombreProceso', 'nombreProceso')),
      NivelDeProceso: normalizeEnumString(pick(parsed, 'NivelDeProceso', 'nivelDeProceso')),
      Url: normalizeString(pick(parsed, 'Url', 'url')),
      Token: normalizeString(pick(parsed, 'Token', 'token')),
      ComoDesplegarUrlDeProceso: normalizeEnumString(
        pick(parsed, 'ComoDesplegarUrlDeProceso', 'comoDesplegarUrlDeProceso'),
      ),
    };
  });
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => normalizeString(item)).filter((item): item is string => Boolean(item));
}

function normalizeString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeDateString(value: unknown): string {
  return typeof value === 'string' && value.trim() ? value.trim().slice(0, 10) : '';
}

function normalizeEnumString(value: unknown): string {
  return normalizeString(value).toUpperCase();
}

function normalizeBoolean(value: unknown): boolean {
  return typeof value === 'boolean' ? value : false;
}

function pick(source: Record<string, unknown>, ...keys: string[]): unknown {
  for (const key of keys) {
    if (source[key] !== undefined) {
      return source[key];
    }
  }

  return undefined;
}

function parseMaybeJson<T>(value: T): T | unknown {
  if (typeof value !== 'string') {
    return value;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return value;
  }

  try {
    return JSON.parse(trimmed);
  } catch {
    return value;
  }
}

function toRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function isApiResult(value: unknown): value is ApiResult<unknown> {
  return Boolean(
    value &&
    typeof value === 'object' &&
    ('Result' in (value as Record<string, unknown>) ||
      'result' in (value as Record<string, unknown>) ||
      'Data' in (value as Record<string, unknown>) ||
      'data' in (value as Record<string, unknown>)),
  );
}

function unwrapEnvelope(value: unknown): ApiResult<unknown> {
  if (!isApiResult(value)) {
    return { Result: true, Data: value };
  }

  const envelope = value as Record<string, unknown>;

  return {
    Result: normalizeEnvelopeResult(pick(envelope, 'Result', 'result')),
    Data: pick(envelope, 'Data', 'data'),
  };
}

function normalizeEnvelopeResult(value: unknown): boolean {
  return typeof value === 'boolean' ? value : true;
}
