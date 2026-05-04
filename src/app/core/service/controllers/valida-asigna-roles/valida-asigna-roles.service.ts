import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

import { API_BASE_URL } from '@core/config/api-base-url.token';
import {
  BuscarAsignacionesRolesPendientesValidacionRequest,
  ValidaAsignacionDeRolRequest,
  ValidaAsignaRolesItem,
  ValidaAsignaRolesPageResult,
} from './valida-asigna-roles.models';

@Injectable({ providedIn: 'root' })
export class ValidaAsignaRolesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL).replace(/\/+$/, '');
  private readonly servicioDeDominioUrl = `${this.baseUrl}/api/ServicioDeDominio`;

  buscarAsignacionesPendientes(
    request: BuscarAsignacionesRolesPendientesValidacionRequest,
  ): Observable<ValidaAsignaRolesPageResult> {
    return this.http
      .post<unknown>(`${this.servicioDeDominioUrl}/BuscarAsignacionesRolesPendientesValidacion`, request)
      .pipe(map((response) => normalizePendingAssignmentsResponse(response)));
  }

  validaAsignacionDeRol(request: ValidaAsignacionDeRolRequest): Observable<void> {
    return this.http
      .post<unknown>(`${this.servicioDeDominioUrl}/ValidaAsignacionDeRol`, request)
      .pipe(map((response) => unwrapCommandResponse(response)));
  }
}

function normalizePendingAssignmentsResponse(value: unknown): ValidaAsignaRolesPageResult {
  const data = unwrapCommandData(value);
  const parsed = toRecord(data);
  const rawItems = pick(parsed, 'items', 'Items');
  const items = Array.isArray(rawItems) ? rawItems.map((item) => normalizePendingAssignment(item)) : [];

  return {
    numeroDePagina: normalizeNumber(pick(parsed, 'numeroDePagina', 'NumeroDePagina'), 1),
    cantidadPorPagina: normalizeNumber(pick(parsed, 'cantidadPorPagina', 'CantidadPorPagina'), items.length),
    total: normalizeNumber(pick(parsed, 'total', 'Total'), items.length),
    items,
  };
}

function normalizePendingAssignment(value: unknown): ValidaAsignaRolesItem {
  const item = toRecord(value);

  return {
    idPoliticaAsignada: normalizeString(pick(item, 'idPoliticaAsignada', 'IdPoliticaAsignada')),
    idEntidad: normalizeString(pick(item, 'idEntidad', 'IdEntidad')),
    idUsuario: normalizeString(pick(item, 'idUsuario', 'IdUsuario')),
    nombreUsuario: normalizeString(pick(item, 'nombreUsuario', 'NombreUsuario')),
    correoElectronico: normalizeString(pick(item, 'correoElectronico', 'CorreoElectronico')),
    idOrganizacion: normalizeString(pick(item, 'idOrganizacion', 'IdOrganizacion')),
    codigoOrganizacion: normalizeString(pick(item, 'codigoOrganizacion', 'CodigoOrganizacion')),
    nombreOrganizacion: normalizeString(pick(item, 'nombreOrganizacion', 'NombreOrganizacion')),
    idUnidadOrganizacional: normalizeString(pick(item, 'idUnidadOrganizacional', 'IdUnidadOrganizacional')),
    codigoUnidadOrganizacional: normalizeString(pick(item, 'codigoUnidadOrganizacional', 'CodigoUnidadOrganizacional')),
    nombreUnidadOrganizacional: normalizeString(pick(item, 'nombreUnidadOrganizacional', 'NombreUnidadOrganizacional')),
    tipoDeEntidad: normalizeString(pick(item, 'tipoDeEntidad', 'TipoDeEntidad')),
    idRol: normalizeString(pick(item, 'idRol', 'IdRol')),
    nombreRol: normalizeString(pick(item, 'nombreRol', 'NombreRol')),
    idProceso: normalizeString(pick(item, 'idProceso', 'IdProceso')),
    codigoProceso: normalizeString(pick(item, 'codigoProceso', 'CodigoProceso')),
    nombreProceso: normalizeString(pick(item, 'nombreProceso', 'NombreProceso')),
    fechaCreacion: normalizeString(pick(item, 'fechaCreacion', 'FechaCreacion')),
    fechaInicioAsignacion: normalizeString(pick(item, 'fechaInicioAsignacion', 'FechaInicioAsignacion')),
    fechaTerminoAsignacion: normalizeString(pick(item, 'fechaTerminoAsignacion', 'FechaTerminoAsignacion')),
    rolRequiereValidacion: normalizeBoolean(pick(item, 'rolRequiereValidacion', 'RolRequiereValidacion')),
    rolAsignadoValidado: normalizeBoolean(pick(item, 'rolAsignadoValidado', 'RolAsignadoValidado')),
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
