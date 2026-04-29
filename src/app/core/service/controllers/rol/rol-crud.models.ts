export interface RolCrudItem {
  id: string;
  nombre: string;
  nombreNormalizado: string;
  descripcion: string;
  activaDetalleDeAutorizaciones: boolean;
  requiereValidacionDeAsignacion: boolean;
  validaAsignacionDeRoles: boolean;
  validaEnrrolamiento: boolean;
  rolBase: boolean;
  activo: boolean;
}

export interface RolCrudPageResult {
  numeroDePagina: number;
  cantidadPorPagina: number;
  total: number;
  items: RolCrudItem[];
}

export interface RolCrudFormValue {
  idRol: string;
  nombreNormalizado: string;
  descripcion: string;
  validaEnrrolamiento: boolean;
  validaAsignacionDeRoles: boolean;
}
