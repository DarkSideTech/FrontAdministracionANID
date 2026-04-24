import { UsuarioCrudFormValue } from './usuario-crud.models';

export interface UsuarioCrudPageTexts {
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
    correoElectronico: string;
    nombreADesplegar: string;
    nacionalidad: string;
    activo: string;
    acciones: string;
  };
  detail: {
    idUsuario: string;
    numeroDeTelefono: string;
    descripcion: string;
    documentoDeIdentidad: string;
    numeroDeDocumento: string;
    codigoValidadorDocumento: string;
    primerNombre: string;
    segundoNombre: string;
    primerApellido: string;
    segundoApellido: string;
    sexoDeclarativo: string;
    sexoRegistral: string;
    fechaDeNacimiento: string;
    tipoDeUsuario: string;
    nombreUsuarioNormalizado: string;
    correoElectronicoConfirmado: string;
    numeroDeTelefonoConfirmado: string;
    dobleFactorHabilitado: string;
    idPersona: string;
    usuarioBase: string;
    requiereValidacionEnrrolamiento: string;
    estadoDeUsuario: string;
  };
  modal: {
    editTitle: string;
    emailTitle: string;
    emailDescription: string;
  };
  fields: {
    correoElectronico: string;
    numeroDeTelefono: string;
    nacionalidad: string;
    tipoDeUsuario: string;
    documentoDeIdentidad: string;
    numeroDeDocumento: string;
    codigoValidadorDocumento: string;
    primerNombre: string;
    segundoNombre: string;
    primerApellido: string;
    segundoApellido: string;
    sexoDeclarativo: string;
    sexoRegistral: string;
    fechaDeNacimiento: string;
    nuevoCorreoElectronico: string;
  };
  placeholders: {
    correoElectronico: string;
    nuevoCorreoElectronico: string;
    numeroDeTelefono: string;
    numeroDeDocumento: string;
    codigoValidadorDocumento: string;
    primerNombre: string;
    segundoNombre: string;
    primerApellido: string;
    segundoApellido: string;
  };
  validation: {
    numeroDeTelefono: string;
    nacionalidad: string;
    tipoDeUsuario: string;
    documentoDeIdentidad: string;
    numeroDeDocumento: string;
    codigoValidadorDocumento: string;
    primerNombre: string;
    primerApellido: string;
    sexoDeclarativo: string;
    sexoRegistral: string;
    fechaDeNacimiento: string;
    nuevoCorreoElectronico: string;
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
    changeEmail: string;
    saveEmail: string;
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
    emailChangeSuccess: string;
  };
  footer: {
    selectedLabel: string;
    totalLabel: string;
    rowsPerPage: string;
  };
}

export interface UsuarioCrudPageConfig {
  texts: UsuarioCrudPageTexts;
  actionVisibility: {
    traceability: boolean;
    edit: boolean;
    changeEmail: boolean;
    delete: boolean;
    toggleStatus: boolean;
  };
  pageSizeOptions: readonly number[];
  defaultPageLimit: number;
  tableHeaderHeight: number;
  tableFooterHeight: number;
  detailRowHeight: number;
  initialFormValue: UsuarioCrudFormValue;
}

export const USUARIO_CRUD_PAGE_CONFIG: UsuarioCrudPageConfig = {
  texts: {
    breadcrumbHome: 'Home',
    breadcrumbDomain: 'Administración',
    breadcrumbCurrent: 'Usuario',
    searchLabel: 'Buscar',
    searchPlaceholder: 'Filtra por correo, nombre, nacionalidad o estado',
    searchIconAlt: 'Icono de búsqueda',
    clearSearchAction: 'Limpiar',
    detailToggleTitle: 'Expandir o contraer fila',
    modalCloseAction: 'Cerrar',
    emptyTitle: 'No hay usuarios disponibles.',
    emptyDescription: 'No se encontraron usuarios para los filtros seleccionados.',
    columns: {
      correoElectronico: 'CorreoElectronico',
      nombreADesplegar: 'NombreADesplegar',
      nacionalidad: 'Nacionalidad',
      activo: 'Activo',
      acciones: 'Acciones',
    },
    detail: {
      idUsuario: 'IdUsuario',
      numeroDeTelefono: 'NumeroDeTelefono',
      descripcion: 'Descripcion',
      documentoDeIdentidad: 'DocumentoDeIdentidad',
      numeroDeDocumento: 'NumeroDeDocumento',
      codigoValidadorDocumento: 'CodigoValidadorDocumento',
      primerNombre: 'PrimerNombre',
      segundoNombre: 'SegundoNombre',
      primerApellido: 'PrimerApellido',
      segundoApellido: 'SegundoApellido',
      sexoDeclarativo: 'SexoDeclarativo',
      sexoRegistral: 'SexoRegistral',
      fechaDeNacimiento: 'FechaDeNacimiento',
      tipoDeUsuario: 'TipoDeUsuario',
      nombreUsuarioNormalizado: 'NombreUsuarioNormalizado',
      correoElectronicoConfirmado: 'CorreoElectronicoConfirmado',
      numeroDeTelefonoConfirmado: 'NumeroDeTelefonoConfirmado',
      dobleFactorHabilitado: 'DobleFactorHabilitado',
      idPersona: 'IdPersona',
      usuarioBase: 'UsuarioBase',
      requiereValidacionEnrrolamiento: 'RequiereValidacionEnrrolamiento',
      estadoDeUsuario: 'EstadoDeUsuario',
    },
    modal: {
      editTitle: 'Editar Usuario',
      emailTitle: 'Modificar correo electronico',
      emailDescription: 'Al modificar el correo electronico se activara el proceso normal de modificacion de correo electronico enviando un correo al nuevo correo electronico ingresado y se marcara el usuario para espera de validacion, luego el usuario debe seguir los pasos normales',
    },
    fields: {
      correoElectronico: 'Correo Electronico',
      numeroDeTelefono: 'NumeroDeTelefono',
      nacionalidad: 'Nacionalidad',
      tipoDeUsuario: 'TipoDeUsuario',
      documentoDeIdentidad: 'DocumentoDeIdentidad',
      numeroDeDocumento: 'NumeroDeDocumento',
      codigoValidadorDocumento: 'CodigoValidadorDocumento',
      primerNombre: 'PrimerNombre',
      segundoNombre: 'SegundoNombre',
      primerApellido: 'PrimerApellido',
      segundoApellido: 'SegundoApellido',
      sexoDeclarativo: 'SexoDeclarativo',
      sexoRegistral: 'SexoRegistral',
      fechaDeNacimiento: 'FechaDeNacimiento',
      nuevoCorreoElectronico: 'Nuevo correo electronico',
    },
    placeholders: {
      correoElectronico: 'Correo Electronico',
      nuevoCorreoElectronico: 'Nuevo correo electronico',
      numeroDeTelefono: 'NumeroDeTelefono',
      numeroDeDocumento: 'NumeroDeDocumento',
      codigoValidadorDocumento: 'CodigoValidadorDocumento',
      primerNombre: 'PrimerNombre',
      segundoNombre: 'SegundoNombre',
      primerApellido: 'PrimerApellido',
      segundoApellido: 'SegundoApellido',
    },
    validation: {
      numeroDeTelefono: 'NumeroDeTelefono invalido',
      nacionalidad: 'Nacionalidad es requerida',
      tipoDeUsuario: 'TipoDeUsuario es requerido',
      documentoDeIdentidad: 'DocumentoDeIdentidad es requerido',
      numeroDeDocumento: 'NumeroDeDocumento es requerido',
      codigoValidadorDocumento: 'CodigoValidadorDocumento es requerido',
      primerNombre: 'PrimerNombre es requerido',
      primerApellido: 'PrimerApellido es requerido',
      sexoDeclarativo: 'SexoDeclarativo es requerido',
      sexoRegistral: 'SexoRegistral es requerido',
      fechaDeNacimiento: 'FechaDeNacimiento es requerida',
      nuevoCorreoElectronico: 'Ingresa un correo electronico valido',
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
      changeEmail: 'Modifica correo electronico',
      saveEmail: 'Modificar',
    },
    status: {
      active: 'Verdadero',
      inactive: 'Falso',
      yes: 'Si',
      no: 'No',
    },
    feedback: {
      loadError: 'No fue posible cargar los usuarios.',
      updateSuccess: 'Usuario modificado correctamente.',
      activateSuccess: 'Usuario activado correctamente.',
      deactivateSuccess: 'Usuario desactivado correctamente.',
      emailChangeSuccess: 'Correo electronico modificado correctamente. El usuario queda pendiente de validacion.',
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
    changeEmail: true,
    delete: true,
    toggleStatus: true,
  },
  pageSizeOptions: [10, 20, 50, 100],
  defaultPageLimit: 10,
  tableHeaderHeight: 60,
  tableFooterHeight: 80,
  detailRowHeight: 430,
  initialFormValue: {
    idUsuario: '',
    correoElectronico: '',
    numeroDeTelefono: '',
    nacionalidad: '',
    tipoDeUsuario: '',
    documentoDeIdentidad: '',
    numeroDeDocumento: '',
    codigoValidadorDocumento: '',
    primerNombre: '',
    segundoNombre: '',
    primerApellido: '',
    segundoApellido: '',
    sexoDeclarativo: '',
    sexoRegistral: '',
    fechaDeNacimiento: '',
  },
};
