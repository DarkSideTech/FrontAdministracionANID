/* eslint-disable @typescript-eslint/no-empty-object-type */

// Generated from swagger.json. Do not edit manually.

export interface ActivarAutenticadorExternoViewModel {
  id?: string | null;
}

export interface ActivarOrganizacionViewModel {
  id?: string | null;
}

export interface ActivarProcesoViewModel {
  id?: string | null;
}

export interface ActivarProveedorViewModel {
  id?: string | null;
}

export interface ActivarUnidadOrganizacionalViewModel {
  id?: string | null;
}

export interface ActivarValidacionEnrrolamientoViewModel {
  id?: string | null;
}

export interface AutenticadorExternoViewModel {
  id?: string | null;
  id_Proveedor?: string | null;
  id_Usuario?: string | null;
  nombreUsuario?: string | null;
  claveDeAcceso?: string | null;
  nombreADesplegar?: string | null;
  validadorPrimario?: boolean | null;
  autenticadorExternoBase?: boolean | null;
  activo?: boolean | null;
}

export interface CrearAutenticadorExternoViewModel {
  id_Proveedor?: string | null;
  id_Usuario?: string | null;
  nombreUsuario?: string | null;
  claveDeAcceso?: string | null;
  nombreADesplegar?: string | null;
}

export interface CrearEntidadServicioDeDominioViewModel {
  id_UnidadOrganizacional?: string | null;
  id_Usuario?: string | null;
  tipoDeEntidad?: string | null;
  correoElectronico?: string | null;
}

export interface CrearOrganizacionViewModel {
  idOrganizacion?: string | null;
  codigo?: string | null;
  nombre?: string | null;
  descripcion?: string | null;
}

export interface CrearPoliticaAsignadaViewModel {
  id_Entidad?: string | null;
  id_Rol?: string | null;
  id_Proceso?: string | null;
  rolRequiereValidacion?: boolean | null;
}

export interface CrearProcesoViewModel {
  idMacro_Proceso?: string | null;
  codigo?: string | null;
  nombre?: string | null;
  descripcion?: string | null;
  contexto?: string | null;
  nivelDeProceso?: string | null;
  url?: string | null;
  token?: string | null;
  comoDesplegarUrlDeProceso?: string | null;
  maximaAsignacionDeRoles?: number | null;
}

export interface CrearProveedorViewModel {
  codigo?: string | null;
  nombre?: string | null;
  descripcion?: string | null;
  apiDeAutenticacion?: string | null;
}

export interface CrearUnidadOrganizacionalViewModel {
  id_Organizacion?: string | null;
  codigo?: string | null;
  nombre?: string | null;
  descripcion?: string | null;
}

export interface CrearValidacionEnrrolamientoViewModel {
  idValidado_Usuario?: string | null;
  idValidaEnrrolamiento_Usuario?: string | null;
  enrrolamientoAceptado?: boolean | null;
  fechaValidacion?: string | null;
}

export interface DatosUsuarioDTO {
  nombreADesplegar?: string | null;
  codigoOrganizaicon?: string | null;
  nombreOrganizaicon?: string | null;
  codigoUnidadOrganizacional?: string | null;
  nombreUnidadOrganizacional?: string | null;
  procesosActivos?: ProcesoActivoDTO[] | null;
}

export interface DesactivarAutenticadorExternoViewModel {
  id?: string | null;
}

export interface DesactivarOrganizacionViewModel {
  id?: string | null;
}

export interface DesactivarProcesoViewModel {
  id?: string | null;
}

export interface DesactivarProveedorViewModel {
  id?: string | null;
}

export interface DesactivarUnidadOrganizacionalViewModel {
  id?: string | null;
}

export interface DesactivarValidacionEnrrolamientoViewModel {
  id?: string | null;
}

export interface EliminarAutenticadorExternoViewModel {
  id?: string | null;
}

export interface EliminarEntidadViewModel {
  id?: string | null;
}

export interface EliminarOrganizacionViewModel {
  id?: string | null;
}

export interface EliminarPoliticaAsignadaViewModel {
  id?: string | null;
}

export interface EliminarPor_CodigoOrganizacionViewModel {
  codigo?: string | null;
}

export interface EliminarPor_CodigoProveedorViewModel {
  codigo?: string | null;
}

export interface EliminarPor_Codigo_Id_OrganizacionUnidadOrganizacionalViewModel {
  codigo?: string | null;
  id_Organizacion?: string | null;
}

export interface EliminarProcesoViewModel {
  id?: string | null;
}

export interface EliminarProveedorViewModel {
  id?: string | null;
}

export interface EliminarUnidadOrganizacionalViewModel {
  id?: string | null;
}

export interface EliminarValidacionEnrrolamientoViewModel {
  id?: string | null;
}

export interface EntidadViewModel {
  id?: string | null;
  id_UnidadOrganizacional?: string | null;
  id_Usuario?: string | null;
  tipoDeEntidad?: string | null;
  correoElectronico?: string | null;
  fechaInicioAutorizacion?: string | null;
  fechaTerminoAutorizacion?: string | null;
  fechaCreacion?: string | null;
  principal?: boolean | null;
  entidadBase?: boolean | null;
}

export interface FinalizaAsignacionPoliticaAsignadaViewModel {
  id?: string | null;
}

export interface FinalizaAutorizacionEntidadViewModel {
  id?: string | null;
}

export interface LoginOrganizacionViewModel {
  organizacion?: string | null;
}

export interface CambioUnidadOrganizacionalEntidadRolViewModel {
  id_Entidad?: string | null;
  id_Rol?: string | null;
}

export interface ConfirmEmailRequest {
  userId?: string | null;
  token?: string | null;
}

export interface LoginViewModel {
  email?: string | null;
  password?: string | null;
}

export interface MarcarComoValidadorPrimarioAutenticadorExternoViewModel {
  id?: string | null;
}

export interface MarcarEntidadComoPrincipalServicioDeDominioViewModel {
  id_Entidad?: string | null;
}

export interface ModificarAutenticadorExternoViewModel {
  id?: string | null;
  claveDeAcceso?: string | null;
  nombreADesplegar?: string | null;
}

export interface ModificarEntidadViewModel {
  id?: string | null;
  correoElectronico?: string | null;
}

export interface ModificaUsuarioViewModel {
  idUsuario?: string | null;
  correoElectronico?: string | null;
  numeroDeTelefono?: string | null;
  nacionalidad?: string | null;
  tipoDeUsuario?: string | null;
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
  contraseña?: string | null;
  confirmaContraseña?: string | null;
  terminosYCondiciones?: boolean | null;
}

export interface ModificaCorreoElectronicoViewModel {
  idUsuario?: string | null;
  nuevoCorreoElectronico?: string | null;
}

export interface SolicitaCambioClaveViewModel {
  idUsuario?: string | null;
  claveActual?: string | null;
  nuevaClave?: string | null;
  confirmaNuevaClave?: string | null;
}

export interface ReenviaCodigoCambioClaveViewModel {
  idUsuario?: string | null;
}

export interface ConfirmaCambioClaveViewModel {
  idUsuario?: string | null;
  claveActual?: string | null;
  nuevaClave?: string | null;
  confirmaNuevaClave?: string | null;
  codigoValidacion?: string | null;
}

export interface ModificarOrganizacionViewModel {
  id?: string | null;
  idOrganizacion?: string | null;
  nombre?: string | null;
  descripcion?: string | null;
}

export interface ModificarProcesoViewModel {
  id?: string | null;
  nombre?: string | null;
  descripcion?: string | null;
  contexto?: string | null;
  nivelDeProceso?: string | null;
  url?: string | null;
  token?: string | null;
  comoDesplegarUrlDeProceso?: string | null;
  maximaAsignacionDeRoles?: number | null;
}

export interface ModificarProveedorViewModel {
  id?: string | null;
  nombre?: string | null;
  descripcion?: string | null;
  apiDeAutenticacion?: string | null;
}

export interface ModificarUnidadOrganizacionalViewModel {
  id?: string | null;
  nombre?: string | null;
  descripcion?: string | null;
}

export interface OrganizacionPorUsuarioViewModel {
  codigo_Organizacion?: string | null;
  nombre_Organizacion?: string | null;
}

export interface OrganizacionViewModel {
  id?: string | null;
  idOrganizacion?: string | null;
  codigo?: string | null;
  nombre?: string | null;
  descripcion?: string | null;
  organizacionBase?: boolean | null;
  activo?: boolean | null;
}

export interface PoliticaAsignadaViewModel {
  id?: string | null;
  id_Entidad?: string | null;
  id_Rol?: string | null;
  id_Proceso?: string | null;
  fechaInicioAsignacion?: string | null;
  fechaTerminoAsignacion?: string | null;
  fechaCreacion?: string | null;
  rolRequiereValidacion?: boolean | null;
  rolAsignadoValidado?: boolean | null;
  politicaAsignadaBase?: boolean | null;
}

export interface ProcesoActivoDTO {
  codigo?: string | null;
  roles?: string[] | null;
  nombreProceso?: string | null;
  url?: string | null;
  comoDesplegarUrlDeProceso?: string | null;
}

export interface ProcesoViewModel {
  id?: string | null;
  idMacro_Proceso?: string | null;
  codigo?: string | null;
  nombre?: string | null;
  descripcion?: string | null;
  contexto?: string | null;
  nivelDeProceso?: string | null;
  url?: string | null;
  token?: string | null;
  comoDesplegarUrlDeProceso?: string | null;
  procesoBase?: boolean | null;
  maximaAsignacionDeRoles?: number | null;
  activo?: boolean | null;
}

export interface ProveedorViewModel {
  id?: string | null;
  codigo?: string | null;
  nombre?: string | null;
  descripcion?: string | null;
  apiDeAutenticacion?: string | null;
  proveedorBase?: boolean | null;
  activo?: boolean | null;
}

export interface RefreshTokenViewModel {
  [key: string]: never;
}

export interface RegisterViewModel {
  correoElectronico?: string | null;
  numeroDeTelefono?: string | null;
  nacionalidad?: string | null;
  tipoDeUsuario?: string | null;
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
  "contraseña"?: string | null;
  "confirmaContraseña"?: string | null;
  terminosYCondiciones?: boolean | null;
}

export interface ResendEmailConfirmationTokenRequest {
  email?: string | null;
}

export interface UnidadOrganizacionalViewModel {
  id?: string | null;
  id_Organizacion?: string | null;
  codigo?: string | null;
  nombre?: string | null;
  descripcion?: string | null;
  unidadOrganizacionalBase?: boolean | null;
  activo?: boolean | null;
}

export interface ValidaAsignacionDeRolPoliticaAsignadaViewModel {
  id?: string | null;
}

export interface ValidaAsignacionDeRolServicioDeDominioViewModel {
  id_PoliticaAsignada?: string | null;
  id_Usuario_ValidaAsignacionRol?: string | null;
}

export interface ValidaEnrrolamientoServicioDeDominioViewModel {
  id_Usuario_Validado?: string | null;
  id_Usuario_Valida_Enrrolamiento?: string | null;
}

export interface ValidacionEnrrolamientoViewModel {
  id?: string | null;
  idValidado_Usuario?: string | null;
  idValidaEnrrolamiento_Usuario?: string | null;
  enrrolamientoAceptado?: boolean | null;
  fechaValidacion?: string | null;
  fechaRegistro?: string | null;
  activo?: boolean | null;
}
