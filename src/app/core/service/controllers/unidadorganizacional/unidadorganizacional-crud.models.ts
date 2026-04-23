export interface UnidadOrganizacionalCrudItem {
  id: string;
  id_Organizacion: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  unidadOrganizacionalBase: boolean;
  activo: boolean;
}

export interface UnidadOrganizacionalCrudFormValue {
  id: string;
  id_Organizacion: string;
  codigo: string;
  nombre: string;
  descripcion: string;
}

export interface UnidadOrganizacionalOrganizacionOption {
  id: string;
  nombre: string;
}
