export interface BuscarUsuariosPendientesEnrrolamientoRequest {
  NumeroDePagina: number;
  CantidadPorPagina: number;
  Busqueda?: string | null;
}

export interface ValidaEnrrolamientoRequest {
  id_Usuario_Validado: string;
  id_Usuario_Valida_Enrrolamiento: string;
}

export interface ValidaUsuarioNuevoItem {
  idUsuario: string;
  correoElectronico: string;
  nombreADesplegar: string;
  tipoDeUsuario: string;
  estadoDeUsuario: string;
  requiereValidacionEnrrolamiento: boolean;
  correoElectronicoConfirmado: boolean;
  nacionalidad: string;
  documentoDeIdentidad: string;
  numeroDeDocumento: string;
  codigoValidadorDocumento: string;
  primerNombre: string;
  segundoNombre: string;
  primerApellido: string;
  segundoApellido: string;
  fechaDeNacimiento: string;
}

export interface ValidaUsuarioNuevoPageResult {
  numeroDePagina: number;
  cantidadPorPagina: number;
  total: number;
  items: ValidaUsuarioNuevoItem[];
}
