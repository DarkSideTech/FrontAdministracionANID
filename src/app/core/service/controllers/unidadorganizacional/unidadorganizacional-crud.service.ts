import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { UnidadOrganizacionalApi } from '@core/service/controllers/unidadorganizacional.api';
import type {
  ActivarUnidadOrganizacionalViewModel,
  CrearUnidadOrganizacionalViewModel,
  DesactivarUnidadOrganizacionalViewModel,
  EliminarUnidadOrganizacionalViewModel,
  ModificarUnidadOrganizacionalViewModel,
  UnidadOrganizacionalViewModel,
} from '@core/service/openapi.models';
import { UnidadOrganizacionalCrudItem } from './unidadorganizacional-crud.models';

@Injectable({ providedIn: 'root' })
export class UnidadOrganizacionalCrudService {
  private readonly unidadOrganizacionalApi = inject(UnidadOrganizacionalApi);

  buscarUnidadOrganizacionalLista(): Observable<UnidadOrganizacionalCrudItem[]> {
    return this.unidadOrganizacionalApi.buscarTodos().pipe(
      map((response) => normalizeUnidadOrganizacionalCrudList(response)),
    );
  }

  crearUnidadOrganizacional(payload: CrearUnidadOrganizacionalViewModel): Observable<void> {
    return this.unidadOrganizacionalApi.crear({ body: payload }).pipe(
      map((response) => unwrapUnidadOrganizacionalCrudCommandResponse(response)),
    );
  }

  modificarUnidadOrganizacional(payload: ModificarUnidadOrganizacionalViewModel): Observable<void> {
    return this.unidadOrganizacionalApi.modificar({ body: payload }).pipe(
      map((response) => unwrapUnidadOrganizacionalCrudCommandResponse(response)),
    );
  }

  activarUnidadOrganizacional(payload: ActivarUnidadOrganizacionalViewModel): Observable<void> {
    return this.unidadOrganizacionalApi.activar({ body: payload }).pipe(
      map((response) => unwrapUnidadOrganizacionalCrudCommandResponse(response)),
    );
  }

  desactivarUnidadOrganizacional(payload: DesactivarUnidadOrganizacionalViewModel): Observable<void> {
    return this.unidadOrganizacionalApi.desactivar({ body: payload }).pipe(
      map((response) => unwrapUnidadOrganizacionalCrudCommandResponse(response)),
    );
  }

  eliminarUnidadOrganizacional(payload: EliminarUnidadOrganizacionalViewModel): Observable<void> {
    return this.unidadOrganizacionalApi.eliminar({ body: payload }).pipe(
      map((response) => unwrapUnidadOrganizacionalCrudCommandResponse(response)),
    );
  }
}

function normalizeUnidadOrganizacionalCrudList(value: unknown): UnidadOrganizacionalCrudItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => normalizeUnidadOrganizacionalCrudItem(item as UnidadOrganizacionalViewModel))
    .sort((left, right) => left.codigo.localeCompare(right.codigo, 'es'));
}

function normalizeUnidadOrganizacionalCrudItem(value: unknown): UnidadOrganizacionalCrudItem {
  const parsed = toRecord(value);

  return {
    id: normalizeString(pick(parsed, 'id', 'Id')),
    id_Organizacion: normalizeString(pick(parsed, 'id_Organizacion', 'Id_Organizacion')),
    codigo: normalizeString(pick(parsed, 'codigo', 'Codigo')),
    nombre: normalizeString(pick(parsed, 'nombre', 'Nombre')),
    descripcion: normalizeString(pick(parsed, 'descripcion', 'Descripcion')),
    unidadOrganizacionalBase: normalizeBoolean(pick(parsed, 'unidadOrganizacionalBase', 'UnidadOrganizacionalBase')),
    activo: normalizeBoolean(pick(parsed, 'activo', 'Activo')),
  };
}

function unwrapUnidadOrganizacionalCrudCommandResponse(value: unknown): void {
  const envelope = toRecord(parseMaybeJson(value));
  const result = normalizeBoolean(pick(envelope, 'Result', 'result'), true);

  if (!result) {
    const message = normalizeString(
      pick(envelope, 'Data', 'data', 'Message', 'message', 'Title', 'title'),
    );
    throw new Error(message || 'La operación sobre la unidad organizacional no se pudo completar.');
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
