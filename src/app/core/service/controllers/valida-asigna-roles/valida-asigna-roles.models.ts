export interface BuscarAsignacionesRolesPendientesValidacionRequest {
  NumeroDePagina: number;
  CantidadPorPagina: number;
  Busqueda?: string | null;
}

export interface ValidaAsignacionDeRolRequest {
  id_PoliticaAsignada: string;
  id_Usuario_ValidaAsignacionRol: string;
}

export interface ValidaAsignaRolesItem {
  idPoliticaAsignada: string;
  idEntidad: string;
  idUsuario: string;
  nombreUsuario: string;
  correoElectronico: string;
  idOrganizacion: string;
  codigoOrganizacion: string;
  nombreOrganizacion: string;
  idUnidadOrganizacional: string;
  codigoUnidadOrganizacional: string;
  nombreUnidadOrganizacional: string;
  tipoDeEntidad: string;
  idRol: string;
  nombreRol: string;
  idProceso: string;
  codigoProceso: string;
  nombreProceso: string;
  fechaCreacion: string;
  fechaInicioAsignacion: string;
  fechaTerminoAsignacion: string;
  rolRequiereValidacion: boolean;
  rolAsignadoValidado: boolean;
}

export interface ValidaAsignaRolesPageResult {
  numeroDePagina: number;
  cantidadPorPagina: number;
  total: number;
  items: ValidaAsignaRolesItem[];
}
