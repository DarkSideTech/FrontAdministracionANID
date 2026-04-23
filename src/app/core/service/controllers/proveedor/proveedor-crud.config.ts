import { ProveedorCrudFormValue } from './proveedor-crud.models';

export interface ProveedorCrudPageTexts {
  breadcrumbHome: string;
  breadcrumbDomain: string;
  breadcrumbCurrent: string;
  searchLabel: string;
  searchPlaceholder: string;
  searchIconAlt: string;
  clearSearchAction: string;
  detailToggleTitle: string;
  modalCloseAction: string;
  createAction: string;
  deleteSelectedAction: string;
  emptyTitle: string;
  emptyDescription: string;
  columns: {
    codigo: string;
    nombre: string;
    descripcion: string;
    activo: string;
    acciones: string;
  };
  detail: {
    id: string;
    proveedorBase: string;
  };
  modal: {
    createTitle: string;
    editTitle: string;
  };
  fields: {
    codigo: string;
    nombre: string;
    descripcion: string;
    apiDeAutenticacion: string;
  };
  placeholders: {
    codigo: string;
    nombre: string;
    descripcion: string;
    apiDeAutenticacion: string;
  };
  validation: {
    codigoRequired: string;
    nombreRequired: string;
  };
  actions: {
    saveCreate: string;
    saveEdit: string;
    clear: string;
    cancel: string;
    traceability: string;
    edit: string;
    delete: string;
    activate: string;
    deactivate: string;
  };
  status: {
    active: string;
    inactive: string;
    yes: string;
    no: string;
  };
  feedback: {
    loadError: string;
    createSuccess: string;
    updateSuccess: string;
    deleteSuccess: string;
    deleteSelectedSuccess: string;
    activateSuccess: string;
    deactivateSuccess: string;
    protectedRow: string;
    partialDeleteError: string;
  };
  confirm: {
    accept: string;
    cancel: string;
    deleteTitle: string;
    deleteText: string;
    deleteSelectedTitle: string;
    deleteSelectedText: string;
  };
  footer: {
    selectedLabel: string;
    totalLabel: string;
    rowsPerPage: string;
  };
}

export interface ProveedorCrudPageConfig {
  texts: ProveedorCrudPageTexts;
  actionVisibility: {
    traceability: boolean;
    edit: boolean;
    delete: boolean;
    toggleStatus: boolean;
  };
  pageSizeOptions: readonly number[];
  defaultPageLimit: number;
  tableHeaderHeight: number;
  tableFooterHeight: number;
  detailRowHeight: number;
  initialFormValue: ProveedorCrudFormValue;
}

export const PROVEEDOR_CRUD_PAGE_CONFIG: ProveedorCrudPageConfig = {
  texts: {
    breadcrumbHome: 'Home',
    breadcrumbDomain: 'Administración',
    breadcrumbCurrent: 'Proveedor',
    searchLabel: 'Buscar',
    searchPlaceholder: 'Filtra por codigo, nombre, descripcion o estado',
    searchIconAlt: 'Icono de búsqueda',
    clearSearchAction: 'Limpiar',
    detailToggleTitle: 'Expandir o contraer fila',
    modalCloseAction: 'Cerrar',
    createAction: 'Nuevo proveedor',
    deleteSelectedAction: 'Eliminar seleccionados',
    emptyTitle: 'No hay proveedores disponibles.',
    emptyDescription: 'Crea el primer proveedor para comenzar.',
    columns: {
      codigo: 'Codigo',
      nombre: 'Nombre',
      descripcion: 'Descripcion',
      activo: 'Activo',
      acciones: 'Acciones',
    },
    detail: {
      id: 'Id',
      proveedorBase: 'ProveedorBase',
    },
    modal: {
      createTitle: 'Nuevo Proveedor',
      editTitle: 'Editar Proveedor',
    },
    fields: {
      codigo: 'Codigo',
      nombre: 'Nombre',
      descripcion: 'Descripcion',
      apiDeAutenticacion: 'API De Autenticacion',
    },
    placeholders: {
      codigo: 'Codigo',
      nombre: 'Nombre',
      descripcion: 'Descripcion',
      apiDeAutenticacion: 'APIDeAutenticacion',
    },
    validation: {
      codigoRequired: 'Codigo es requerido',
      nombreRequired: 'Nombre es requerido',
    },
    actions: {
      saveCreate: 'Guardar',
      saveEdit: 'Modificar',
      clear: 'Limpiar',
      cancel: 'Cancelar',
      traceability: 'Mostrar información de trazabilidad',
      edit: 'Modificar informacion',
      delete: 'Eliminar Registro',
      activate: 'Activar Registro',
      deactivate: 'Desactivar Registro',
    },
    status: {
      active: 'Verdadero',
      inactive: 'Falso',
      yes: 'Si',
      no: 'No',
    },
    feedback: {
      loadError: 'No fue posible cargar los proveedores.',
      createSuccess: 'Proveedor creado correctamente.',
      updateSuccess: 'Proveedor modificado correctamente.',
      deleteSuccess: 'Proveedor eliminado correctamente.',
      deleteSelectedSuccess: 'Proveedores eliminados correctamente.',
      activateSuccess: 'Proveedor activado correctamente.',
      deactivateSuccess: 'Proveedor desactivado correctamente.',
      protectedRow: 'El proveedor base no permite esta accion.',
      partialDeleteError: 'Uno o mas proveedores no se pudieron eliminar.',
    },
    confirm: {
      accept: 'Aceptar',
      cancel: 'Cancelar',
      deleteTitle: '¿Eliminar proveedor?',
      deleteText: 'Los elementos se eliminarán de forma permanente,no se puede deshacer.',
      deleteSelectedTitle: '¿Eliminar proveedores seleccionados?',
      deleteSelectedText: 'Los elementos se eliminarán de forma permanente,no se puede deshacer.',
    },
    footer: {
      selectedLabel: 'seleccionadas',
      totalLabel: 'total',
      rowsPerPage: 'Filas por pagina',
    },
  },
  actionVisibility: {
    traceability: true,
    edit: true,
    delete: true,
    toggleStatus: true,
  },
  pageSizeOptions: [10, 20, 50, 100],
  defaultPageLimit: 10,
  tableHeaderHeight: 60,
  tableFooterHeight: 80,
  detailRowHeight: 140,
  initialFormValue: {
    id: '',
    codigo: '',
    nombre: '',
    descripcion: '',
    apiDeAutenticacion: '',
  },
};
