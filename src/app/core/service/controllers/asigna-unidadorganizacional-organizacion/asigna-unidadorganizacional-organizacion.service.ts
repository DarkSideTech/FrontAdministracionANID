import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { OrganizacionApi } from '@core/service/controllers/organizacion.api';
import { ServicioDeDominioApi } from '@core/service/controllers/serviciodedominio.api';
import type {
  OrganizacionViewModel,
  UnidadOrganizacionalParaAsignarOrganizacionViewModel,
} from '@core/service/openapi.models';
import {
  AsignaUnidadOrganizacionOrganizacionItem,
  AsignaUnidadOrganizacionUnidadItem,
  SincronizarUnidadesOrganizacionResult,
} from './asigna-unidadorganizacional-organizacion.models';

@Injectable({ providedIn: 'root' })
export class AsignaUnidadOrganizacionalOrganizacionService {
  private readonly organizacionApi = inject(OrganizacionApi);
  private readonly servicioDeDominioApi = inject(ServicioDeDominioApi);

  buscarOrganizaciones(): Observable<AsignaUnidadOrganizacionOrganizacionItem[]> {
    return this.organizacionApi.buscarTodos().pipe(
      map((items) =>
        (items ?? [])
          .map((item) => normalizeOrganization(item))
          .filter((item) => item.id && item.activo)
          .sort((left, right) => left.codigo.localeCompare(right.codigo, 'es')),
      ),
    );
  }

  buscarUnidades(idOrganizacion: string): Observable<AsignaUnidadOrganizacionUnidadItem[]> {
    return this.servicioDeDominioApi.buscarUnidadesOrganizacionalesParaAsignarOrganizacion({
      body: { id_Organizacion: idOrganizacion },
    }).pipe(
      map((response) => unwrapCommandResponse<unknown[]>(response)),
      map((items) =>
        (items ?? [])
          .map((item) => normalizeUnit(item as UnidadOrganizacionalParaAsignarOrganizacionViewModel))
          .filter((item) => item.idUnidadOrganizacional)
          .sort((left, right) =>
            Number(right.asignadaAOrganizacion) - Number(left.asignadaAOrganizacion)
            || left.codigoOrganizacionActual.localeCompare(right.codigoOrganizacionActual, 'es')
            || left.codigoUnidadOrganizacional.localeCompare(right.codigoUnidadOrganizacional, 'es'),
          ),
      ),
    );
  }

  sincronizar(
    idOrganizacion: string,
    unidadesAsignar: string[],
    unidadesDesasignar: string[],
  ): Observable<SincronizarUnidadesOrganizacionResult> {
    return this.servicioDeDominioApi.sincronizarUnidadesOrganizacionalesOrganizacion({
      body: {
        id_Organizacion: idOrganizacion,
        unidadesAsignar,
        unidadesDesasignar,
      },
    }).pipe(
      map((response) => unwrapCommandResponse<unknown>(response)),
      map((data) => normalizeSyncResult(data)),
    );
  }
}

function normalizeOrganization(value: OrganizacionViewModel): AsignaUnidadOrganizacionOrganizacionItem {
  const parsed = toRecord(value);
  return {
    id: normalizeString(pick(parsed, 'id', 'Id')),
    codigo: normalizeString(pick(parsed, 'codigo', 'Codigo')),
    nombre: normalizeString(pick(parsed, 'nombre', 'Nombre')),
    descripcion: normalizeString(pick(parsed, 'descripcion', 'Descripcion')),
    activo: normalizeBoolean(pick(parsed, 'activo', 'Activo')),
  };
}

function normalizeUnit(value: UnidadOrganizacionalParaAsignarOrganizacionViewModel): AsignaUnidadOrganizacionUnidadItem {
  const parsed = toRecord(value);
  return {
    idUnidadOrganizacional: normalizeString(pick(parsed, 'idUnidadOrganizacional', 'IdUnidadOrganizacional')),
    idOrganizacionActual: normalizeString(pick(parsed, 'idOrganizacionActual', 'IdOrganizacionActual')),
    codigoUnidadOrganizacional: normalizeString(pick(parsed, 'codigoUnidadOrganizacional', 'CodigoUnidadOrganizacional')),
    nombreUnidadOrganizacional: normalizeString(pick(parsed, 'nombreUnidadOrganizacional', 'NombreUnidadOrganizacional')),
    descripcionUnidadOrganizacional: normalizeString(pick(parsed, 'descripcionUnidadOrganizacional', 'DescripcionUnidadOrganizacional')),
    unidadOrganizacionalBase: normalizeBoolean(pick(parsed, 'unidadOrganizacionalBase', 'UnidadOrganizacionalBase')),
    activo: normalizeBoolean(pick(parsed, 'activo', 'Activo')),
    codigoOrganizacionActual: normalizeString(pick(parsed, 'codigoOrganizacionActual', 'CodigoOrganizacionActual')),
    nombreOrganizacionActual: normalizeString(pick(parsed, 'nombreOrganizacionActual', 'NombreOrganizacionActual')),
    asignadaAOrganizacion: normalizeBoolean(pick(parsed, 'asignadaAOrganizacion', 'AsignadaAOrganizacion')),
    tieneEntidadPrincipal: normalizeBoolean(pick(parsed, 'tieneEntidadPrincipal', 'TieneEntidadPrincipal')),
    cantidadEntidadesPrincipales: normalizeNumber(pick(parsed, 'cantidadEntidadesPrincipales', 'CantidadEntidadesPrincipales')),
  };
}

function normalizeSyncResult(value: unknown): SincronizarUnidadesOrganizacionResult {
  const parsed = toRecord(value);
  const errores = pick(parsed, 'errores', 'Errores');
  return {
    asignadas: normalizeNumber(pick(parsed, 'asignadas', 'Asignadas')),
    reasignadas: normalizeNumber(pick(parsed, 'reasignadas', 'Reasignadas')),
    entidadesEliminadas: normalizeNumber(pick(parsed, 'entidadesEliminadas', 'EntidadesEliminadas')),
    politicasAsignadasEliminadas: normalizeNumber(pick(parsed, 'politicasAsignadasEliminadas', 'PoliticasAsignadasEliminadas')),
    omitidasPorExistir: normalizeNumber(pick(parsed, 'omitidasPorExistir', 'OmitidasPorExistir')),
    omitidasPorError: normalizeNumber(pick(parsed, 'omitidasPorError', 'OmitidasPorError')),
    errores: Array.isArray(errores) ? errores.map((item) => normalizeString(item)).filter(Boolean) : [],
  };
}

function unwrapCommandResponse<T>(value: unknown): T {
  const envelope = toRecord(parseMaybeJson(value));
  const result = normalizeBoolean(pick(envelope, 'Result', 'result'), true);
  const data = parseMaybeJson(pick(envelope, 'Data', 'data'));

  if (!result) {
    const message = normalizeString(data)
      || normalizeString(pick(envelope, 'Message', 'message', 'Title', 'title'))
      || readValidationError(envelope)
      || 'La operacion no se pudo completar.';
    throw new Error(message);
  }

  return data as T;
}

function readValidationError(envelope: Record<string, unknown>): string {
  const validation = toRecord(pick(envelope, 'ValidationResult', 'validationResult'));
  const errors = pick(validation, 'Errors', 'errors');
  if (!Array.isArray(errors)) {
    return '';
  }

  return errors
    .map((error) => normalizeString(pick(toRecord(error), 'ErrorMessage', 'errorMessage')))
    .filter(Boolean)
    .join(' ');
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

function normalizeBoolean(value: unknown, fallback = false): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function normalizeNumber(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}
