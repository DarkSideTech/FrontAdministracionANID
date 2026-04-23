export interface OrganizacionCrudItem {
  id: string;
  idOrganizacion: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  organizacionBase: boolean;
  activo: boolean;
}

export interface OrganizacionCrudFormValue {
  id: string;
  idOrganizacion: string;
  codigo: string;
  nombre: string;
  descripcion: string;
}
