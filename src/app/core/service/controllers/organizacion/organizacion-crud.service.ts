import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { OrganizacionApi } from '@core/service/controllers/organizacion.api';
import type {
  ActivarOrganizacionViewModel,
  CrearOrganizacionViewModel,
  DesactivarOrganizacionViewModel,
  EliminarOrganizacionViewModel,
  ModificarOrganizacionViewModel,
  OrganizacionViewModel,
} from '@core/service/openapi.models';
import { OrganizacionCrudItem } from './organizacion-crud.models';

@Injectable({ providedIn: 'root' })
export class OrganizacionCrudService {
  private readonly organizacionApi = inject(OrganizacionApi);

  buscarOrganizacionLista(): Observable<OrganizacionCrudItem[]> {
    return this.organizacionApi.buscarTodos().pipe(
      map((response) => normalizeOrganizacionCrudList(response)),
    );
  }

  crearOrganizacion(payload: CrearOrganizacionViewModel): Observable<void> {
    return this.organizacionApi.crear({ body: payload }).pipe(
      map((response) => unwrapOrganizacionCrudCommandResponse(response)),
    );
  }

  modificarOrganizacion(payload: ModificarOrganizacionViewModel): Observable<void> {
    return this.organizacionApi.modificar({ body: payload }).pipe(
      map((response) => unwrapOrganizacionCrudCommandResponse(response)),
    );
  }

  activarOrganizacion(payload: ActivarOrganizacionViewModel): Observable<void> {
    return this.organizacionApi.activar({ body: payload }).pipe(
      map((response) => unwrapOrganizacionCrudCommandResponse(response)),
    );
  }

  desactivarOrganizacion(payload: DesactivarOrganizacionViewModel): Observable<void> {
    return this.organizacionApi.desactivar({ body: payload }).pipe(
      map((response) => unwrapOrganizacionCrudCommandResponse(response)),
    );
  }

  eliminarOrganizacion(payload: EliminarOrganizacionViewModel): Observable<void> {
    return this.organizacionApi.eliminar({ body: payload }).pipe(
      map((response) => unwrapOrganizacionCrudCommandResponse(response)),
    );
  }
}

function normalizeOrganizacionCrudList(value: unknown): OrganizacionCrudItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => normalizeOrganizacionCrudItem(item as OrganizacionViewModel))
    .sort((left, right) => left.codigo.localeCompare(right.codigo, 'es'));
}

function normalizeOrganizacionCrudItem(value: unknown): OrganizacionCrudItem {
  const parsed = toRecord(value);

  return {
    id: normalizeString(pick(parsed, 'id', 'Id')),
    idOrganizacion: normalizeString(pick(parsed, 'idOrganizacion', 'IdOrganizacion')),
    codigo: normalizeString(pick(parsed, 'codigo', 'Codigo')),
    nombre: normalizeString(pick(parsed, 'nombre', 'Nombre')),
    descripcion: normalizeString(pick(parsed, 'descripcion', 'Descripcion')),
    organizacionBase: normalizeBoolean(pick(parsed, 'organizacionBase', 'OrganizacionBase')),
    activo: normalizeBoolean(pick(parsed, 'activo', 'Activo')),
  };
}

function unwrapOrganizacionCrudCommandResponse(value: unknown): void {
  const envelope = toRecord(parseMaybeJson(value));
  const result = normalizeBoolean(pick(envelope, 'Result', 'result'), true);

  if (!result) {
    const message = normalizeString(
      pick(envelope, 'Data', 'data', 'Message', 'message', 'Title', 'title'),
    );
    throw new Error(message || 'La operación sobre la organizacion no se pudo completar.');
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
