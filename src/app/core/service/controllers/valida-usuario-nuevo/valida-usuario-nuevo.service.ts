import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

import { API_BASE_URL } from '@core/config/api-base-url.token';
import {
  BuscarUsuariosPendientesEnrrolamientoRequest,
  ValidaEnrrolamientoRequest,
  ValidaUsuarioNuevoItem,
  ValidaUsuarioNuevoPageResult,
} from './valida-usuario-nuevo.models';

@Injectable({ providedIn: 'root' })
export class ValidaUsuarioNuevoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL).replace(/\/+$/, '');
  private readonly servicioDeDominioUrl = `${this.baseUrl}/api/ServicioDeDominio`;

  buscarUsuariosPendientes(
    request: BuscarUsuariosPendientesEnrrolamientoRequest,
  ): Observable<ValidaUsuarioNuevoPageResult> {
    return this.http
      .post<unknown>(`${this.servicioDeDominioUrl}/BuscarUsuariosPendientesEnrrolamiento`, request)
      .pipe(map((response) => normalizePendingUsersResponse(response)));
  }

  validaEnrrolamiento(request: ValidaEnrrolamientoRequest): Observable<void> {
    return this.http
      .post<unknown>(`${this.servicioDeDominioUrl}/ValidaEnrrolamiento`, request)
      .pipe(map((response) => unwrapCommandResponse(response)));
  }
}

function normalizePendingUsersResponse(value: unknown): ValidaUsuarioNuevoPageResult {
  const data = unwrapCommandData(value);
  const parsed = toRecord(data);
  const rawItems = pick(parsed, 'items', 'Items');
  const items = Array.isArray(rawItems) ? rawItems.map((item) => normalizePendingUser(item)) : [];

  return {
    numeroDePagina: normalizeNumber(pick(parsed, 'numeroDePagina', 'NumeroDePagina'), 1),
    cantidadPorPagina: normalizeNumber(pick(parsed, 'cantidadPorPagina', 'CantidadPorPagina'), items.length),
    total: normalizeNumber(pick(parsed, 'total', 'Total'), items.length),
    items,
  };
}

function normalizePendingUser(value: unknown): ValidaUsuarioNuevoItem {
  const item = toRecord(value);

  return {
    idUsuario: normalizeString(pick(item, 'idUsuario', 'IdUsuario')),
    correoElectronico: normalizeString(pick(item, 'correoElectronico', 'CorreoElectronico')),
    nombreADesplegar: normalizeString(pick(item, 'nombreADesplegar', 'NombreADesplegar')),
    tipoDeUsuario: normalizeString(pick(item, 'tipoDeUsuario', 'TipoDeUsuario')),
    estadoDeUsuario: normalizeString(pick(item, 'estadoDeUsuario', 'EstadoDeUsuario')),
    requiereValidacionEnrrolamiento: normalizeBoolean(pick(item, 'requiereValidacionEnrrolamiento', 'RequiereValidacionEnrrolamiento')),
    correoElectronicoConfirmado: normalizeBoolean(pick(item, 'correoElectronicoConfirmado', 'CorreoElectronicoConfirmado')),
    nacionalidad: normalizeString(pick(item, 'nacionalidad', 'Nacionalidad')),
    documentoDeIdentidad: normalizeString(pick(item, 'documentoDeIdentidad', 'DocumentoDeIdentidad')),
    numeroDeDocumento: normalizeString(pick(item, 'numeroDeDocumento', 'NumeroDeDocumento')),
    codigoValidadorDocumento: normalizeString(pick(item, 'codigoValidadorDocumento', 'CodigoValidadorDocumento')),
    primerNombre: normalizeString(pick(item, 'primerNombre', 'PrimerNombre')),
    segundoNombre: normalizeString(pick(item, 'segundoNombre', 'SegundoNombre')),
    primerApellido: normalizeString(pick(item, 'primerApellido', 'PrimerApellido')),
    segundoApellido: normalizeString(pick(item, 'segundoApellido', 'SegundoApellido')),
    fechaDeNacimiento: normalizeString(pick(item, 'fechaDeNacimiento', 'FechaDeNacimiento')),
  };
}

function unwrapCommandResponse(value: unknown): void {
  unwrapCommandData(value);
}

function unwrapCommandData(value: unknown): unknown {
  const parsedValue = parseMaybeJson(value);
  const envelope = toRecord(parsedValue);
  const result = pick(envelope, 'result', 'Result');

  if (result !== undefined && !normalizeBoolean(result)) {
    throw new Error(resolveCommandErrorMessage(envelope));
  }

  const data = pick(envelope, 'data', 'Data');
  return data === undefined ? parsedValue : parseMaybeJson(data);
}

function resolveCommandErrorMessage(envelope: Record<string, unknown>): string {
  const directMessage = normalizeString(pick(envelope, 'message', 'Message', 'title', 'Title', 'data', 'Data'));
  if (directMessage) {
    return directMessage;
  }

  const validation = toRecord(pick(envelope, 'validationResult', 'ValidationResult'));
  const errors = pick(validation, 'errors', 'Errors');
  if (!Array.isArray(errors)) {
    return 'La operacion no se pudo completar.';
  }

  const messages = errors
    .map((error) => normalizeString(pick(toRecord(error), 'errorMessage', 'ErrorMessage')))
    .filter(Boolean);

  return messages.join(' ') || 'La operacion no se pudo completar.';
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

function normalizeNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function normalizeBoolean(value: unknown): boolean {
  return typeof value === 'boolean' ? value : false;
}
