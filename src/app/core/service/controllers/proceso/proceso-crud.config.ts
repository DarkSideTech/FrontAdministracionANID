import { ProcesoCrudFormValue } from './proceso-crud.models';

export interface ProcesoCrudPageTexts {
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
    nivelDeProceso: string;
    comoDesplegarUrlDeProceso: string;
    activo: string;
    acciones: string;
  };
  detail: {
    id: string;
    idMacroProceso: string;
    contexto: string;
    url: string;
    token: string;
    procesoBase: string;
    maximaAsignacionDeRoles: string;
  };
  modal: {
    createTitle: string;
    editTitle: string;
  };
  fields: {
    idMacro_Proceso: string;
    codigo: string;
    nombre: string;
    descripcion: string;
    contexto: string;
    nivelDeProceso: string;
    url: string;
    token: string;
    comoDesplegarUrlDeProceso: string;
    maximaAsignacionDeRoles: string;
  };
  placeholders: {
    idMacro_Proceso: string;
    codigo: string;
    nombre: string;
    descripcion: string;
    contexto: string;
    nivelDeProceso: string;
    url: string;
    token: string;
    comoDesplegarUrlDeProceso: string;
    maximaAsignacionDeRoles: string;
  };
  validation: {
    idMacroProcesoRequired: string;
    codigoRequired: string;
    nombreRequired: string;
    nivelDeProcesoRequired: string;
    urlRequired: string;
    tokenRequired: string;
    comoDesplegarRequired: string;
    maximaAsignacionRequired: string;
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
    catalogsLoadError: string;
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

export interface ProcesoCrudPageConfig {
  texts: ProcesoCrudPageTexts;
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
  initialFormValue: ProcesoCrudFormValue;
}

export const PROCESO_CRUD_PAGE_CONFIG: ProcesoCrudPageConfig = {
  texts: {
    breadcrumbHome: 'Home',
    breadcrumbDomain: 'Administración',
    breadcrumbCurrent: 'Proceso',
    searchLabel: 'Buscar',
    searchPlaceholder: 'Filtra por codigo, nombre, descripcion, nivel, despliegue o estado',
    searchIconAlt: 'Icono de búsqueda',
    clearSearchAction: 'Limpiar',
    detailToggleTitle: 'Expandir o contraer fila',
    modalCloseAction: 'Cerrar',
    createAction: 'Nuevo proceso',
    deleteSelectedAction: 'Eliminar seleccionados',
    emptyTitle: 'No hay procesos disponibles.',
    emptyDescription: 'Crea el primer proceso para comenzar.',
    columns: {
      codigo: 'Codigo',
      nombre: 'Nombre',
      descripcion: 'Descripcion',
      nivelDeProceso: 'Nivel De Proceso',
      comoDesplegarUrlDeProceso: 'Como Desplegar',
      activo: 'Activo',
      acciones: 'Acciones',
    },
    detail: {
      id: 'Id',
      idMacroProceso: 'IdMacro_Proceso',
      contexto: 'Contexto',
      url: 'Url',
      token: 'Token',
      procesoBase: 'ProcesoBase',
      maximaAsignacionDeRoles: 'MaximaAsignacionDeRoles',
    },
    modal: {
      createTitle: 'Nuevo Proceso',
      editTitle: 'Editar Proceso',
    },
    fields: {
      idMacro_Proceso: 'Id Macro Proceso',
      codigo: 'Codigo',
      nombre: 'Nombre',
      descripcion: 'Descripcion',
      contexto: 'Contexto',
      nivelDeProceso: 'Nivel De Proceso',
      url: 'Url',
      token: 'Token',
      comoDesplegarUrlDeProceso: 'Como Desplegar Url De Proceso',
      maximaAsignacionDeRoles: 'Maxima Asignacion De Roles',
    },
    placeholders: {
      idMacro_Proceso: 'IdMacro_Proceso',
      codigo: 'Codigo',
      nombre: 'Nombre',
      descripcion: 'Descripcion',
      contexto: 'Contexto',
      nivelDeProceso: 'Selecciona un nivel de proceso',
      url: 'Url',
      token: 'Token',
      comoDesplegarUrlDeProceso: 'Selecciona una forma de despliegue',
      maximaAsignacionDeRoles: 'MaximaAsignacionDeRoles',
    },
    validation: {
      idMacroProcesoRequired: 'Id Macro Proceso es requerido',
      codigoRequired: 'Codigo es requerido',
      nombreRequired: 'Nombre es requerido',
      nivelDeProcesoRequired: 'Nivel De Proceso es requerido',
      urlRequired: 'Url es requerida',
      tokenRequired: 'Token es requerido',
      comoDesplegarRequired: 'Como Desplegar Url De Proceso es requerido',
      maximaAsignacionRequired: 'Maxima Asignacion De Roles es requerida',
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
      loadError: 'No fue posible cargar los procesos.',
      catalogsLoadError: 'No fue posible cargar los catálogos del proceso.',
      createSuccess: 'Proceso creado correctamente.',
      updateSuccess: 'Proceso modificado correctamente.',
      deleteSuccess: 'Proceso eliminado correctamente.',
      deleteSelectedSuccess: 'Procesos eliminados correctamente.',
      activateSuccess: 'Proceso activado correctamente.',
      deactivateSuccess: 'Proceso desactivado correctamente.',
      protectedRow: 'El proceso base no permite esta accion.',
      partialDeleteError: 'Uno o mas procesos no se pudieron eliminar.',
    },
    confirm: {
      accept: 'Aceptar',
      cancel: 'Cancelar',
      deleteTitle: '¿Eliminar proceso?',
      deleteText: 'Los elementos se eliminarán de forma permanente,no se puede deshacer.',
      deleteSelectedTitle: '¿Eliminar procesos seleccionados?',
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
  detailRowHeight: 220,
  initialFormValue: {
    id: '',
    idMacro_Proceso: '',
    codigo: '',
    nombre: '',
    descripcion: '',
    contexto: '',
    nivelDeProceso: '',
    url: '',
    token: '',
    comoDesplegarUrlDeProceso: '',
    maximaAsignacionDeRoles: '',
  },
};
