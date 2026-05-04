export interface AsignaUnidadOrganizacionOrganizacionItem {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  activo: boolean;
}

export interface AsignaUnidadOrganizacionUnidadItem {
  idUnidadOrganizacional: string;
  idOrganizacionActual: string;
  codigoUnidadOrganizacional: string;
  nombreUnidadOrganizacional: string;
  descripcionUnidadOrganizacional: string;
  unidadOrganizacionalBase: boolean;
  activo: boolean;
  codigoOrganizacionActual: string;
  nombreOrganizacionActual: string;
  asignadaAOrganizacion: boolean;
  tieneEntidadPrincipal: boolean;
  cantidadEntidadesPrincipales: number;
}

export interface SincronizarUnidadesOrganizacionResult {
  asignadas: number;
  reasignadas: number;
  entidadesEliminadas: number;
  politicasAsignadasEliminadas: number;
  omitidasPorExistir: number;
  omitidasPorError: number;
  errores: string[];
}
