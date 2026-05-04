export interface UsuarioUnidadUsuarioItem {
  idUsuario: string;
  correoElectronico: string;
  nombreADesplegar: string;
  nacionalidad: string;
  activo: boolean;
}

export interface UsuarioUnidadUsuarioPageResult {
  numeroDePagina: number;
  cantidadPorPagina: number;
  total: number;
  items: UsuarioUnidadUsuarioItem[];
}

export interface UsuarioUnidadOrganizacionItem {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  activo: boolean;
}

export interface UsuarioUnidadOrganizacionalItem {
  id: string;
  id_Organizacion: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  activo: boolean;
}

export interface UsuarioUnidadEntidadAssignment {
  idEntidad: string;
  idUnidadOrganizacional: string;
}
