export interface ApiResult<T> {
  Result?: boolean | null;
  Data?: T;
  result?: boolean | null;
  data?: T;
}

export interface ValidationProblemDetails {
  title?: string;
  status?: number;
  errors?: Record<string, string[]>;
}

export interface OrganizationOption {
  Codigo_Organizacion?: string | null;
  Nombre_Organizacion?: string | null;
}

export interface OrganizationalUnitEntityRoleOption {
  Codigo_UnidadOrganizacional?: string | null;
  Nombre_UnidadOrganizacional?: string | null;
  Id_Entidad?: string | null;
  Id_Rol?: string | null;
  Nombre_Rol?: string | null;
}

export interface SelectedEntityRole {
  Codigo_UnidadOrganizacional?: string | null;
  Id_Entidad?: string | null;
  Id_Rol?: string | null;
}

export interface AuthenticatedUser {
  id?: string | null;
  email?: string | null;
  nombreADesplegar?: string | null;
  numeroDeTelefono?: string | null;
  tipoDeUsuario?: string | null;
  nacionalidad?: string | null;
  documentoDeIdentidad?: string | null;
  numeroDeDocumento?: string | null;
  codigoValidadorDocumento?: string | null;
  primerNombre?: string | null;
  segundoNombre?: string | null;
  primerApellido?: string | null;
  segundoApellido?: string | null;
  sexoDeclarativo?: string | null;
  sexoRegistral?: string | null;
  fechaDeNacimiento?: string | null;
  roles?: string[] | null;
  unidadesOrganizacionales?: string[] | null;
}

export type ProcessLevel = 'NIVEL_MACRO' | 'NIVEL_SISTEMA' | string;
export type ProcessUrlDisplayMode = 'NO_DESPLEGAR' | 'IFRAME' | 'VENTANA' | 'REDIRECCION' | string;

export interface ActiveProcess {
  IdProceso?: string | null;
  IdMacroProceso?: string | null;
  Codigo?: string | null;
  Roles?: string[] | null;
  NombreProceso?: string | null;
  NivelDeProceso?: ProcessLevel | null;
  Url?: string | null;
  Token?: string | null;
  ComoDesplegarUrlDeProceso?: ProcessUrlDisplayMode | null;
}

export interface ProfileLoginPayload {
  AccessTokenExpiracion?: string | null;
  OrganizacionesPorUsuario?: OrganizationOption[] | null;
  UnidadesOrganizacionalesPorUsuario?: OrganizationalUnitEntityRoleOption[] | null;
  User?: AuthenticatedUser | null;
  ProcesosActivos?: ActiveProcess[] | null;
  CodigoOrganizacionSeleccionada?: string | null;
  NombreOrganizacionSeleccionada?: string | null;
  CodigoUnidadOrganizacionalSeleccionada?: string | null;
  NombreUnidadOrganizacionalSeleccionada?: string | null;
  IdEntidadSeleccionada?: string | null;
  EntidadRolSeleccionado?: SelectedEntityRole | null;
  SeleccionOrganizacionRequerida?: boolean | null;
}

export interface CurrentUserPayload {
  IsAuthenticated?: boolean | null;
  UserId?: string | null;
  Email?: string | null;
  NombreADesplegar?: string | null;
  User?: AuthenticatedUser | null;
  OrganizacionesPorUsuario?: OrganizationOption[] | null;
  UnidadesOrganizacionalesPorUsuario?: OrganizationalUnitEntityRoleOption[] | null;
  ProcesosActivos?: ActiveProcess[] | null;
  ExpiresAtUtc?: string | null;
  OrganizacionSeleccionada?: string | null;
  NombreOrganizacionSeleccionada?: string | null;
  CodigoUnidadOrganizacionalSeleccionada?: string | null;
  NombreUnidadOrganizacionalSeleccionada?: string | null;
  EntidadIdSeleccionada?: string | null;
  EntidadRolSeleccionado?: SelectedEntityRole | null;
  SeleccionOrganizacionRequerida?: boolean | null;
  SeleccionOrganizacionrequerida?: boolean | null;
}

export interface RegisterResultPayload {
  Email?: string | null;
  RequiresEmailConfirmation?: boolean | null;
  CanResendConfirmationEmail?: boolean | null;
  Message?: string | null;
  ConfirmationUrl?: string | null;
  ValidationToken?: string | null;
}

export interface EmailConfirmationDispatchResultPayload {
  Email?: string | null;
  Message?: string | null;
  ConfirmationUrl?: string | null;
  ValidationToken?: string | null;
}

export interface EmailConfirmationResultPayload {
  Message: string;
}

export interface ModifyUserResultPayload {
  UserId?: string | null;
  Message?: string | null;
}

export interface PasswordChangeChallengeDispatchResultPayload {
  Email?: string | null;
  Message?: string | null;
  ExpiresAtUtc?: string | null;
  CanResendAtUtc?: string | null;
}

export interface PasswordChangeResultPayload {
  Message?: string | null;
}

export type SessionKind = 'LOGIN' | 'LOGIN_ORGANIZATION' | null;

export interface AuthSnapshot {
  isAuthenticated: boolean;
  accessTokenExpiration: string | null;
  user: AuthenticatedUser | null;
  sessionKind: SessionKind;
  organizations: OrganizationOption[];
  organizationalUnits: OrganizationalUnitEntityRoleOption[];
  activeProcesses: ActiveProcess[];
  selectedOrganizationCode: string | null;
  selectedOrganizationName: string | null;
  selectedUnitCode: string | null;
  selectedUnitName: string | null;
  selectedEntityId: string | null;
  selectedEntityRole: SelectedEntityRole | null;
  organizationSelectionRequired: boolean;
}
