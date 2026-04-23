import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { ProveedorApi } from '@core/service/controllers/proveedor.api';
import type {
  ActivarProveedorViewModel,
  CrearProveedorViewModel,
  DesactivarProveedorViewModel,
  EliminarProveedorViewModel,
  ModificarProveedorViewModel,
  ProveedorViewModel,
} from '@core/service/openapi.models';
import { ProveedorCrudItem } from './proveedor-crud.models';

@Injectable({ providedIn: 'root' })
export class ProveedorCrudService {
  private readonly proveedorApi = inject(ProveedorApi);

  buscarProveedorLista(): Observable<ProveedorCrudItem[]> {
    return this.proveedorApi.buscarTodos().pipe(
      map((response) => normalizeProveedorCrudList(response)),
    );
  }

  crearProveedor(payload: CrearProveedorViewModel): Observable<void> {
    return this.proveedorApi.crear({ body: payload }).pipe(
      map((response) => unwrapProveedorCrudCommandResponse(response)),
    );
  }

  modificarProveedor(payload: ModificarProveedorViewModel): Observable<void> {
    return this.proveedorApi.modificar({ body: payload }).pipe(
      map((response) => unwrapProveedorCrudCommandResponse(response)),
    );
  }

  activarProveedor(payload: ActivarProveedorViewModel): Observable<void> {
    return this.proveedorApi.activar({ body: payload }).pipe(
      map((response) => unwrapProveedorCrudCommandResponse(response)),
    );
  }

  desactivarProveedor(payload: DesactivarProveedorViewModel): Observable<void> {
    return this.proveedorApi.desactivar({ body: payload }).pipe(
      map((response) => unwrapProveedorCrudCommandResponse(response)),
    );
  }

  eliminarProveedor(payload: EliminarProveedorViewModel): Observable<void> {
    return this.proveedorApi.eliminar({ body: payload }).pipe(
      map((response) => unwrapProveedorCrudCommandResponse(response)),
    );
  }
}

function normalizeProveedorCrudList(value: unknown): ProveedorCrudItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => normalizeProveedorCrudItem(item as ProveedorViewModel))
    .sort((left, right) => left.codigo.localeCompare(right.codigo, 'es'));
}

function normalizeProveedorCrudItem(value: unknown): ProveedorCrudItem {
  const parsed = toRecord(value);

  return {
    id: normalizeString(pick(parsed, 'id', 'Id')),
    codigo: normalizeString(pick(parsed, 'codigo', 'Codigo')),
    nombre: normalizeString(pick(parsed, 'nombre', 'Nombre')),
    descripcion: normalizeString(pick(parsed, 'descripcion', 'Descripcion')),
    apiDeAutenticacion: normalizeString(pick(parsed, 'apiDeAutenticacion', 'APIDeAutenticacion')),
    proveedorBase: normalizeBoolean(pick(parsed, 'proveedorBase', 'ProveedorBase')),
    activo: normalizeBoolean(pick(parsed, 'activo', 'Activo')),
  };
}

function unwrapProveedorCrudCommandResponse(value: unknown): void {
  const envelope = toRecord(parseMaybeJson(value));
  const result = normalizeBoolean(pick(envelope, 'Result', 'result'), true);

  if (!result) {
    const message = normalizeString(
      pick(envelope, 'Data', 'data', 'Message', 'message', 'Title', 'title'),
    );
    throw new Error(message || 'La operación sobre el proveedor no se pudo completar.');
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
