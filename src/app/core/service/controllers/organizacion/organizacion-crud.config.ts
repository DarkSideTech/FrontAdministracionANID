import { OrganizacionCrudFormValue } from './organizacion-crud.models';

export interface OrganizacionCrudPageTexts {
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
    idOrganizacion: string;
    organizacionBase: string;
  };
  modal: {
    createTitle: string;
    editTitle: string;
  };
  fields: {
    idOrganizacion: string;
    codigo: string;
    nombre: string;
    descripcion: string;
  };
  placeholders: {
    idOrganizacion: string;
    codigo: string;
    nombre: string;
    descripcion: string;
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

export interface OrganizacionCrudPageConfig {
  texts: OrganizacionCrudPageTexts;
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
  initialFormValue: OrganizacionCrudFormValue;
}

export const ORGANIZACION_CRUD_PAGE_CONFIG: OrganizacionCrudPageConfig = {
  texts: {
    breadcrumbHome: 'Home',
    breadcrumbDomain: 'Administración',
    breadcrumbCurrent: 'Organizacion',
    searchLabel: 'Buscar',
    searchPlaceholder: 'Filtra por codigo, nombre, descripcion o estado',
    searchIconAlt: 'Icono de búsqueda',
    clearSearchAction: 'Limpiar',
    detailToggleTitle: 'Expandir o contraer fila',
    modalCloseAction: 'Cerrar',
    createAction: 'Nueva organizacion',
    deleteSelectedAction: 'Eliminar seleccionados',
    emptyTitle: 'No hay organizaciones disponibles.',
    emptyDescription: 'Crea la primera organizacion para comenzar.',
    columns: {
      codigo: 'Codigo',
      nombre: 'Nombre',
      descripcion: 'Descripcion',
      activo: 'Activo',
      acciones: 'Acciones',
    },
    detail: {
      id: 'Id',
      idOrganizacion: 'IdOrganizacion',
      organizacionBase: 'OrganizacionBase',
    },
    modal: {
      createTitle: 'Nueva Organizacion',
      editTitle: 'Editar Organizacion',
    },
    fields: {
      idOrganizacion: 'Id Organizacion',
      codigo: 'Codigo',
      nombre: 'Nombre',
      descripcion: 'Descripcion',
    },
    placeholders: {
      idOrganizacion: 'IdOrganizacion',
      codigo: 'Codigo',
      nombre: 'Nombre',
      descripcion: 'Descripcion',
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
      loadError: 'No fue posible cargar las organizaciones.',
      createSuccess: 'Organizacion creada correctamente.',
      updateSuccess: 'Organizacion modificada correctamente.',
      deleteSuccess: 'Organizacion eliminada correctamente.',
      deleteSelectedSuccess: 'Organizaciones eliminadas correctamente.',
      activateSuccess: 'Organizacion activada correctamente.',
      deactivateSuccess: 'Organizacion desactivada correctamente.',
      protectedRow: 'La organizacion base no permite esta accion.',
      partialDeleteError: 'Una o mas organizaciones no se pudieron eliminar.',
    },
    confirm: {
      accept: 'Aceptar',
      cancel: 'Cancelar',
      deleteTitle: '¿Eliminar organizacion?',
      deleteText: 'Los elementos se eliminarán de forma permanente,no se puede deshacer.',
      deleteSelectedTitle: '¿Eliminar organizaciones seleccionadas?',
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
    idOrganizacion: '',
    codigo: '',
    nombre: '',
    descripcion: '',
  },
};
