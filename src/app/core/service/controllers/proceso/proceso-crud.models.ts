import { EnumerationOption } from '@core/enumerations/enumeration.models';

export interface ProcesoCrudItem {
  id: string;
  idMacro_Proceso: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  contexto: string;
  nivelDeProceso: string;
  url: string;
  token: string;
  comoDesplegarUrlDeProceso: string;
  procesoBase: boolean;
  maximaAsignacionDeRoles: number | null;
  activo: boolean;
}

export interface ProcesoCrudFormValue {
  id: string;
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
}

export interface ProcesoCrudCatalogs {
  nivelesDeProceso: EnumerationOption[];
  modosDeDespliegue: EnumerationOption[];
}
