export interface UsuarioCrudItem {
  idUsuario: string;
  numeroDeTelefono: string;
  descripcion: string;
  nacionalidad: string;
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
  correoElectronico: string;
  tipoDeUsuario: string;
  nombreUsuarioNormalizado: string;
  correoElectronicoConfirmado: boolean;
  numeroDeTelefonoConfirmado: boolean;
  dobleFactorHabilitado: boolean;
  idPersona: string;
  nombreADesplegar: string;
  activo: boolean;
  usuarioBase: boolean;
  requiereValidacionEnrrolamiento: boolean;
  estadoDeUsuario: string;
}

export interface UsuarioCrudQuery {
  numeroDePagina: number;
  cantidadPorPagina: number;
  busqueda: string;
}

export interface UsuarioCrudPageResult {
  numeroDePagina: number;
  cantidadPorPagina: number;
  total: number;
  items: UsuarioCrudItem[];
}

export interface UsuarioCrudFormValue {
  idUsuario: string;
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
}

export interface UsuarioEmailChangeFormValue {
  idUsuario: string;
  correoElectronicoActual: string;
  nuevoCorreoElectronico: string;
}
