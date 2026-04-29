import { RolCrudFormValue } from './rol-crud.models';

export interface RolCrudPageTexts {
  breadcrumbHome: string;
  breadcrumbDomain: string;
  breadcrumbCurrent: string;
  searchLabel: string;
  searchPlaceholder: string;
  searchIconAlt: string;
  clearSearchAction: string;
  detailToggleTitle: string;
  modalCloseAction: string;
  emptyTitle: string;
  emptyDescription: string;
  columns: {
    nombreNormalizado: string;
    descripcion: string;
    requiereValidacionDeAsignacion: string;
    validaAsignacionDeRoles: string;
    validaEnrrolamiento: string;
    activo: string;
    acciones: string;
  };
  detail: {
    id: string;
    nombre: string;
    activaDetalleDeAutorizaciones: string;
    rolBase: string;
  };
  modal: {
    editTitle: string;
  };
  fields: {
    nombreNormalizado: string;
    descripcion: string;
    validaEnrrolamiento: string;
    validaAsignacionDeRoles: string;
  };
  placeholders: {
    descripcion: string;
  };
  validation: {
    descripcion: string;
  };
  actions: {
    clear: string;
    cancel: string;
    saveEdit: string;
    traceability: string;
    edit: string;
    delete: string;
    activate: string;
    deactivate: string;
    requireAssignmentValidation: string;
    noRequireAssignmentValidation: string;
    activateRoleAssignmentValidation: string;
    deactivateRoleAssignmentValidation: string;
    activateAuthorizationDetail: string;
    deactivateAuthorizationDetail: string;
  };
  status: {
    active: string;
    inactive: string;
    yes: string;
    no: string;
  };
  feedback: {
    loadError: string;
    updateSuccess: string;
    activateSuccess: string;
    deactivateSuccess: string;
    requireAssignmentValidationSuccess: string;
    noRequireAssignmentValidationSuccess: string;
    activateRoleAssignmentValidationSuccess: string;
    deactivateRoleAssignmentValidationSuccess: string;
    activateAuthorizationDetailSuccess: string;
    deactivateAuthorizationDetailSuccess: string;
  };
  footer: {
    selectedLabel: string;
    totalLabel: string;
    rowsPerPage: string;
  };
}

export interface RolCrudPageConfig {
  texts: RolCrudPageTexts;
  actionVisibility: {
    traceability: boolean;
    edit: boolean;
    delete: boolean;
    toggleStatus: boolean;
    toggleAssignmentValidation: boolean;
    toggleRoleAssignmentValidation: boolean;
    toggleAuthorizationDetail: boolean;
  };
  pageSizeOptions: readonly number[];
  defaultPageLimit: number;
  tableHeaderHeight: number;
  tableFooterHeight: number;
  detailRowHeight: number;
  initialFormValue: RolCrudFormValue;
}

export const ROL_CRUD_PAGE_CONFIG: RolCrudPageConfig = {
  texts: {
    breadcrumbHome: 'Home',
    breadcrumbDomain: 'Administración',
    breadcrumbCurrent: 'Rol',
    searchLabel: 'Buscar',
    searchPlaceholder: 'Filtra por nombre, descripcion o estado',
    searchIconAlt: 'Icono de búsqueda',
    clearSearchAction: 'Limpiar',
    detailToggleTitle: 'Expandir o contraer fila',
    modalCloseAction: 'Cerrar',
    emptyTitle: 'No hay roles disponibles.',
    emptyDescription: 'No se encontraron roles para los filtros seleccionados.',
    columns: {
      nombreNormalizado: 'NombreNormalizado',
      descripcion: 'Descripcion',
      requiereValidacionDeAsignacion: 'RequiereValidacionDeAsignacion',
      validaAsignacionDeRoles: 'ValidaAsignacionDeRoles',
      validaEnrrolamiento: 'ValidaEnrrolamiento',
      activo: 'Activo',
      acciones: 'Acciones',
    },
    detail: {
      id: 'Id',
      nombre: 'Nombre',
      activaDetalleDeAutorizaciones: 'ActivaDetalleDeAutorizaciones',
      rolBase: 'RolBase',
    },
    modal: {
      editTitle: 'Editar Rol',
    },
    fields: {
      nombreNormalizado: 'NombreNormalizado',
      descripcion: 'Descripcion',
      validaEnrrolamiento: 'ValidaEnrrolamiento',
      validaAsignacionDeRoles: 'ValidaAsignacionDeRoles',
    },
    placeholders: {
      descripcion: 'Descripcion',
    },
    validation: {
      descripcion: 'Descripcion no puede superar los 1000 caracteres',
    },
    actions: {
      clear: 'Limpiar',
      cancel: 'Cancelar',
      saveEdit: 'Modificar',
      traceability: 'Mostrar información de trazabilidad',
      edit: 'Modificar informacion',
      delete: 'Eliminar Registro',
      activate: 'Activar Registro',
      deactivate: 'Desactivar Registro',
      requireAssignmentValidation: 'Requiere validacion al ser asignado',
      noRequireAssignmentValidation: 'No requiere validacion al ser asignado',
      activateRoleAssignmentValidation: 'Activar validacion de asignacion de roles',
      deactivateRoleAssignmentValidation: 'Desactivar validacion de asignacion de roles',
      activateAuthorizationDetail: 'Activar detalle de autorizaciones',
      deactivateAuthorizationDetail: 'Desactivar detalle de autorizaciones',
    },
    status: {
      active: 'Verdadero',
      inactive: 'Falso',
      yes: 'Si',
      no: 'No',
    },
    feedback: {
      loadError: 'No fue posible cargar los roles.',
      updateSuccess: 'Rol modificado correctamente.',
      activateSuccess: 'Rol activado correctamente.',
      deactivateSuccess: 'Rol desactivado correctamente.',
      requireAssignmentValidationSuccess: 'Validacion al asignar rol activada correctamente.',
      noRequireAssignmentValidationSuccess: 'Validacion al asignar rol desactivada correctamente.',
      activateRoleAssignmentValidationSuccess: 'Validacion de asignacion de roles activada correctamente.',
      deactivateRoleAssignmentValidationSuccess: 'Validacion de asignacion de roles desactivada correctamente.',
      activateAuthorizationDetailSuccess: 'Detalle de autorizaciones activado correctamente.',
      deactivateAuthorizationDetailSuccess: 'Detalle de autorizaciones desactivado correctamente.',
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
    toggleAssignmentValidation: true,
    toggleRoleAssignmentValidation: true,
    toggleAuthorizationDetail: true,
  },
  pageSizeOptions: [10, 20, 50, 100],
  defaultPageLimit: 10,
  tableHeaderHeight: 60,
  tableFooterHeight: 80,
  detailRowHeight: 170,
  initialFormValue: {
    idRol: '',
    nombreNormalizado: '',
    descripcion: '',
    validaEnrrolamiento: false,
    validaAsignacionDeRoles: false,
  },
};
