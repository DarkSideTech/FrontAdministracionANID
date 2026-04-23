export interface ProveedorCrudItem {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  apiDeAutenticacion: string;
  proveedorBase: boolean;
  activo: boolean;
}

export interface ProveedorCrudFormValue {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  apiDeAutenticacion: string;
}
