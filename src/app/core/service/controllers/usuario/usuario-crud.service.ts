import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { AccountApi } from '@core/service/controllers/account.api';
import type {
  ActivarUsuarioViewModel,
  AdminModificaCorreoElectronicoViewModel,
  BuscarUsuariosPaginadosResponse,
  BuscarUsuariosPaginadosViewModel,
  DesactivarUsuarioViewModel,
  ModificaUsuarioViewModel,
  UsuarioPaginadoItemResponse,
} from '@core/service/openapi.models';
import { UsuarioCrudItem, UsuarioCrudPageResult } from './usuario-crud.models';

@Injectable({ providedIn: 'root' })
export class UsuarioCrudService {
  private readonly accountApi = inject(AccountApi);

  buscarUsuariosPaginados(payload: BuscarUsuariosPaginadosViewModel): Observable<UsuarioCrudPageResult> {
    return this.accountApi.buscarUsuariosPaginados({ body: payload }).pipe(
      map((response) => normalizeUsuarioCrudPage(response)),
    );
  }

  modificarUsuario(payload: ModificaUsuarioViewModel): Observable<void> {
    return this.accountApi.modificaUsuario({ body: payload }).pipe(
      map((response) => unwrapUsuarioCrudCommandResponse(response)),
    );
  }

  activarUsuario(payload: ActivarUsuarioViewModel): Observable<void> {
    return this.accountApi.activarUsuario({ body: payload }).pipe(
      map((response) => unwrapUsuarioCrudCommandResponse(response)),
    );
  }

  desactivarUsuario(payload: DesactivarUsuarioViewModel): Observable<void> {
    return this.accountApi.desactivarUsuario({ body: payload }).pipe(
      map((response) => unwrapUsuarioCrudCommandResponse(response)),
    );
  }

  adminModificarCorreoElectronico(payload: AdminModificaCorreoElectronicoViewModel): Observable<void> {
    return this.accountApi.adminModificaCorreoElectronico({ body: payload }).pipe(
      map((response) => unwrapUsuarioCrudCommandResponse(response)),
    );
  }
}

function normalizeUsuarioCrudPage(value: unknown): UsuarioCrudPageResult {
  const envelope = toRecord(parseMaybeJson(value));
  const result = normalizeBoolean(pick(envelope, 'Result', 'result'), true);
  if (!result) {
    throw new Error(normalizeString(pick(envelope, 'Data', 'data')) || 'No fue posible cargar los usuarios.');
  }

  const data = toRecord(parseMaybeJson(pick(envelope, 'Data', 'data'))) as BuscarUsuariosPaginadosResponse;
  const items = Array.isArray(data.items)
    ? data.items.map((item) => normalizeUsuarioCrudItem(item))
    : Array.isArray((data as Record<string, unknown>)['Items'])
      ? ((data as Record<string, unknown>)['Items'] as unknown[]).map((item) => normalizeUsuarioCrudItem(item))
      : [];

  return {
    numeroDePagina: normalizeNumber(pick(data as Record<string, unknown>, 'numeroDePagina', 'NumeroDePagina'), 1),
    cantidadPorPagina: normalizeNumber(pick(data as Record<string, unknown>, 'cantidadPorPagina', 'CantidadPorPagina'), 10),
    total: normalizeNumber(pick(data as Record<string, unknown>, 'total', 'Total'), 0),
    items,
  };
}

function normalizeUsuarioCrudItem(value: unknown): UsuarioCrudItem {
  const parsed = toRecord(value as UsuarioPaginadoItemResponse);

  return {
    idUsuario: normalizeString(pick(parsed, 'idUsuario', 'IdUsuario')),
    numeroDeTelefono: normalizeString(pick(parsed, 'numeroDeTelefono', 'NumeroDeTelefono')),
    descripcion: normalizeString(pick(parsed, 'descripcion', 'Descripcion')),
    nacionalidad: normalizeString(pick(parsed, 'nacionalidad', 'Nacionalidad')),
    documentoDeIdentidad: normalizeString(pick(parsed, 'documentoDeIdentidad', 'DocumentoDeIdentidad')),
    numeroDeDocumento: normalizeString(pick(parsed, 'numeroDeDocumento', 'NumeroDeDocumento')),
    codigoValidadorDocumento: normalizeString(pick(parsed, 'codigoValidadorDocumento', 'CodigoValidadorDocumento')),
    primerNombre: normalizeString(pick(parsed, 'primerNombre', 'PrimerNombre')),
    segundoNombre: normalizeString(pick(parsed, 'segundoNombre', 'SegundoNombre')),
    primerApellido: normalizeString(pick(parsed, 'primerApellido', 'PrimerApellido')),
    segundoApellido: normalizeString(pick(parsed, 'segundoApellido', 'SegundoApellido')),
    sexoDeclarativo: normalizeString(pick(parsed, 'sexoDeclarativo', 'SexoDeclarativo')),
    sexoRegistral: normalizeString(pick(parsed, 'sexoRegistral', 'SexoRegistral')),
    fechaDeNacimiento: normalizeDateString(pick(parsed, 'fechaDeNacimiento', 'FechaDeNacimiento')),
    correoElectronico: normalizeString(pick(parsed, 'correoElectronico', 'CorreoElectronico')),
    tipoDeUsuario: normalizeString(pick(parsed, 'tipoDeUsuario', 'TipoDeUsuario')),
    nombreUsuarioNormalizado: normalizeString(pick(parsed, 'nombreUsuarioNormalizado', 'NombreUsuarioNormalizado')),
    correoElectronicoConfirmado: normalizeBoolean(pick(parsed, 'correoElectronicoConfirmado', 'CorreoElectronicoConfirmado')),
    numeroDeTelefonoConfirmado: normalizeBoolean(pick(parsed, 'numeroDeTelefonoConfirmado', 'NumeroDeTelefonoConfirmado')),
    dobleFactorHabilitado: normalizeBoolean(pick(parsed, 'dobleFactorHabilitado', 'DobleFactorHabilitado')),
    idPersona: normalizeString(pick(parsed, 'idPersona', 'IdPersona')),
    nombreADesplegar: normalizeString(pick(parsed, 'nombreADesplegar', 'NombreADesplegar')),
    activo: normalizeBoolean(pick(parsed, 'activo', 'Activo')),
    usuarioBase: normalizeBoolean(pick(parsed, 'usuarioBase', 'UsuarioBase')),
    requiereValidacionEnrrolamiento: normalizeBoolean(pick(parsed, 'requiereValidacionEnrrolamiento', 'RequiereValidacionEnrrolamiento')),
    estadoDeUsuario: normalizeString(pick(parsed, 'estadoDeUsuario', 'EstadoDeUsuario')),
  };
}

function unwrapUsuarioCrudCommandResponse(value: unknown): void {
  const envelope = toRecord(parseMaybeJson(value));
  const result = normalizeBoolean(pick(envelope, 'Result', 'result'), true);

  if (!result) {
    const message = normalizeString(pick(envelope, 'Data', 'data', 'Message', 'message', 'Title', 'title'));
    throw new Error(message || 'La operación sobre el usuario no se pudo completar.');
  }
}

function parseMaybeJson(value: unknown): unknown {
  if (typeof value !== 'string') {
    return value;
  }

  try {
    return JSON.parse(value) as unknown;
  } catch {
    return value;
  }
}

function toRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function pick(source: Record<string, unknown>, ...keys: string[]): unknown {
  for (const key of keys) {
    if (source[key] !== undefined) {
      return source[key];
    }
  }

  return undefined;
}

function normalizeString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeDateString(value: unknown): string {
  return typeof value === 'string' && value.trim() ? value.trim().slice(0, 10) : '';
}

function normalizeBoolean(value: unknown, fallback = false): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function normalizeNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}
