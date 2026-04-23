import { UnidadOrganizacionalCrudFormValue } from './unidadorganizacional-crud.models';

export interface UnidadOrganizacionalCrudPageTexts {
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
    unidadOrganizacionalBase: string;
  };
  modal: {
    createTitle: string;
    editTitle: string;
  };
  fields: {
    id_Organizacion: string;
    codigo: string;
    nombre: string;
    descripcion: string;
  };
  placeholders: {
    id_Organizacion: string;
    codigo: string;
    nombre: string;
    descripcion: string;
  };
  validation: {
    idOrganizacionRequired: string;
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
    organizationOptionsLoadError: string;
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

export interface UnidadOrganizacionalCrudPageConfig {
  texts: UnidadOrganizacionalCrudPageTexts;
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
  initialFormValue: UnidadOrganizacionalCrudFormValue;
}

export const UNIDAD_ORGANIZACIONAL_CRUD_PAGE_CONFIG: UnidadOrganizacionalCrudPageConfig = {
  texts: {
    breadcrumbHome: 'Home',
    breadcrumbDomain: 'Administración',
    breadcrumbCurrent: 'Unidad Organizacional',
    searchLabel: 'Buscar',
    searchPlaceholder: 'Filtra por codigo, nombre, descripcion o estado',
    searchIconAlt: 'Icono de búsqueda',
    clearSearchAction: 'Limpiar',
    detailToggleTitle: 'Expandir o contraer fila',
    modalCloseAction: 'Cerrar',
    createAction: 'Nueva unidad organizacional',
    deleteSelectedAction: 'Eliminar seleccionados',
    emptyTitle: 'No hay unidades organizacionales disponibles.',
    emptyDescription: 'Crea la primera unidad organizacional para comenzar.',
    columns: {
      codigo: 'Codigo',
      nombre: 'Nombre',
      descripcion: 'Descripcion',
      activo: 'Activo',
      acciones: 'Acciones',
    },
    detail: {
      id: 'Id',
      idOrganizacion: 'Id_Organizacion',
      unidadOrganizacionalBase: 'UnidadOrganizacionalBase',
    },
    modal: {
      createTitle: 'Nueva Unidad Organizacional',
      editTitle: 'Editar Unidad Organizacional',
    },
    fields: {
      id_Organizacion: 'Organizacion',
      codigo: 'Codigo',
      nombre: 'Nombre',
      descripcion: 'Descripcion',
    },
    placeholders: {
      id_Organizacion: 'Selecciona una organizacion',
      codigo: 'Codigo',
      nombre: 'Nombre',
      descripcion: 'Descripcion',
    },
    validation: {
      idOrganizacionRequired: 'Organizacion es requerida',
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
      loadError: 'No fue posible cargar las unidades organizacionales.',
      organizationOptionsLoadError: 'No fue posible cargar las organizaciones disponibles.',
      createSuccess: 'Unidad organizacional creada correctamente.',
      updateSuccess: 'Unidad organizacional modificada correctamente.',
      deleteSuccess: 'Unidad organizacional eliminada correctamente.',
      deleteSelectedSuccess: 'Unidades organizacionales eliminadas correctamente.',
      activateSuccess: 'Unidad organizacional activada correctamente.',
      deactivateSuccess: 'Unidad organizacional desactivada correctamente.',
      protectedRow: 'La unidad organizacional base no permite esta accion.',
      partialDeleteError: 'Una o mas unidades organizacionales no se pudieron eliminar.',
    },
    confirm: {
      accept: 'Aceptar',
      cancel: 'Cancelar',
      deleteTitle: '¿Eliminar unidad organizacional?',
      deleteText: 'Los elementos se eliminarán de forma permanente,no se puede deshacer.',
      deleteSelectedTitle: '¿Eliminar unidades organizacionales seleccionadas?',
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
    id_Organizacion: '',
    codigo: '',
    nombre: '',
    descripcion: '',
  },
};
