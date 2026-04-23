import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { ProcesoApi } from '@core/service/controllers/proceso.api';
import type {
  ActivarProcesoViewModel,
  CrearProcesoViewModel,
  DesactivarProcesoViewModel,
  EliminarProcesoViewModel,
  ModificarProcesoViewModel,
  ProcesoViewModel,
} from '@core/service/openapi.models';
import { ProcesoCrudItem } from './proceso-crud.models';

@Injectable({ providedIn: 'root' })
export class ProcesoCrudService {
  private readonly procesoApi = inject(ProcesoApi);

  buscarProcesoLista(): Observable<ProcesoCrudItem[]> {
    return this.procesoApi.buscarTodos().pipe(
      map((response) => normalizeProcesoCrudList(response)),
    );
  }

  crearProceso(payload: CrearProcesoViewModel): Observable<void> {
    return this.procesoApi.crear({ body: payload }).pipe(
      map((response) => unwrapProcesoCrudCommandResponse(response)),
    );
  }

  modificarProceso(payload: ModificarProcesoViewModel): Observable<void> {
    return this.procesoApi.modificar({ body: payload }).pipe(
      map((response) => unwrapProcesoCrudCommandResponse(response)),
    );
  }

  activarProceso(payload: ActivarProcesoViewModel): Observable<void> {
    return this.procesoApi.activar({ body: payload }).pipe(
      map((response) => unwrapProcesoCrudCommandResponse(response)),
    );
  }

  desactivarProceso(payload: DesactivarProcesoViewModel): Observable<void> {
    return this.procesoApi.desactivar({ body: payload }).pipe(
      map((response) => unwrapProcesoCrudCommandResponse(response)),
    );
  }

  eliminarProceso(payload: EliminarProcesoViewModel): Observable<void> {
    return this.procesoApi.eliminar({ body: payload }).pipe(
      map((response) => unwrapProcesoCrudCommandResponse(response)),
    );
  }
}

function normalizeProcesoCrudList(value: unknown): ProcesoCrudItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => normalizeProcesoCrudItem(item as ProcesoViewModel))
    .sort((left, right) => left.codigo.localeCompare(right.codigo, 'es'));
}

function normalizeProcesoCrudItem(value: unknown): ProcesoCrudItem {
  const parsed = toRecord(value);

  return {
    id: normalizeString(pick(parsed, 'id', 'Id')),
    idMacro_Proceso: normalizeString(pick(parsed, 'idMacro_Proceso', 'IdMacro_Proceso')),
    codigo: normalizeString(pick(parsed, 'codigo', 'Codigo')),
    nombre: normalizeString(pick(parsed, 'nombre', 'Nombre')),
    descripcion: normalizeString(pick(parsed, 'descripcion', 'Descripcion')),
    contexto: normalizeString(pick(parsed, 'contexto', 'Contexto')),
    nivelDeProceso: normalizeString(pick(parsed, 'nivelDeProceso', 'NivelDeProceso')),
    url: normalizeString(pick(parsed, 'url', 'Url')),
    token: normalizeString(pick(parsed, 'token', 'Token')),
    comoDesplegarUrlDeProceso: normalizeString(pick(parsed, 'comoDesplegarUrlDeProceso', 'ComoDesplegarUrlDeProceso')),
    procesoBase: normalizeBoolean(pick(parsed, 'procesoBase', 'ProcesoBase')),
    maximaAsignacionDeRoles: normalizeNumber(pick(parsed, 'maximaAsignacionDeRoles', 'MaximaAsignacionDeRoles')),
    activo: normalizeBoolean(pick(parsed, 'activo', 'Activo')),
  };
}

function unwrapProcesoCrudCommandResponse(value: unknown): void {
  const envelope = toRecord(parseMaybeJson(value));
  const result = normalizeBoolean(pick(envelope, 'Result', 'result'), true);

  if (!result) {
    const message = normalizeString(
      pick(envelope, 'Data', 'data', 'Message', 'message', 'Title', 'title'),
    );
    throw new Error(message || 'La operación sobre el proceso no se pudo completar.');
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

function pick(source: Record<string, unknown>, ...keys: string[]): unknown {
  for (const key of keys) {
    if (source[key] !== undefined) {
      return source[key];
    }
  }

  return undefined;
}

function toRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function normalizeString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeBoolean(value: unknown, fallback = false): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function normalizeNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}
