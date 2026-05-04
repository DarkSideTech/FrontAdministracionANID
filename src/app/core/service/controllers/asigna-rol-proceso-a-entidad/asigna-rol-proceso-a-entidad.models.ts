export interface AsignaRolProcesoOrganizacionItem {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  activo: boolean;
}

export interface AsignaRolProcesoEntidadItem {
  idEntidad: string;
  idUsuario: string;
  nombreUsuario: string;
  idUnidadOrganizacional: string;
  codigoUnidadOrganizacional: string;
  nombreUnidadOrganizacional: string;
  tipoDeEntidad: string;
  correoElectronico: string;
  principal: boolean;
}

export interface AsignaRolProcesoRolItem {
  id: string;
  nombreNormalizado: string;
}

export interface AsignaRolProcesoProcesoItem {
  id: string;
  codigo: string;
  nombre: string;
}

export interface AsignaRolProcesoPoliticaItem {
  idPoliticaAsignada: string;
  idEntidad: string;
  idRol: string;
  nombreRol: string;
  idProceso: string;
  codigoProceso: string;
  nombreProceso: string;
  rolRequiereValidacion: boolean;
  rolAsignadoValidado: boolean;
}

export interface PoliticaAsignadaKeyParts {
  idRol: string;
  idProceso: string;
}
