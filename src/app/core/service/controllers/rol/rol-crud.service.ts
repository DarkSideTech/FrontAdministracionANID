import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { AccountApi } from '@core/service/controllers/account.api';
import type {
  ActivaDetalleDeAutorizacionesViewModel,
  ActivaValidacionDeAsignacionDeRolesViewModel,
  ActivarRolViewModel,
  BuscarRolesPaginadosResponse,
  BuscarRolesPaginadosViewModel,
  DesactivaDetalleDeAutorizacionesViewModel,
  DesactivaValidacionDeAsignacionDeRolesViewModel,
  DesactivarRolViewModel,
  ModificaRolViewModel,
  NoRequiereValidacionAlSerAsignadoViewModel,
  RequiereValidacionAlSerAsignadoViewModel,
  RolPaginadoItemResponse,
} from '@core/service/openapi.models';
import { RolCrudItem, RolCrudPageResult } from './rol-crud.models';

@Injectable({ providedIn: 'root' })
export class RolCrudService {
  private readonly accountApi = inject(AccountApi);

  buscarRolesPaginados(payload: BuscarRolesPaginadosViewModel): Observable<RolCrudPageResult> {
    return this.accountApi.buscarRolesPaginados({ body: payload }).pipe(
      map((response) => normalizeRolCrudPage(response)),
    );
  }

  modificarRol(payload: ModificaRolViewModel): Observable<void> {
    return this.accountApi.modificarRol({ body: payload }).pipe(
      map((response) => unwrapRolCrudCommandResponse(response)),
    );
  }

  activarRol(payload: ActivarRolViewModel): Observable<void> {
    return this.accountApi.activarRol({ body: payload }).pipe(
      map((response) => unwrapRolCrudCommandResponse(response)),
    );
  }

  desactivarRol(payload: DesactivarRolViewModel): Observable<void> {
    return this.accountApi.desactivarRol({ body: payload }).pipe(
      map((response) => unwrapRolCrudCommandResponse(response)),
    );
  }

  requiereValidacionAlSerAsignado(payload: RequiereValidacionAlSerAsignadoViewModel): Observable<void> {
    return this.accountApi.requiereValidacionAlSerAsignado({ body: payload }).pipe(
      map((response) => unwrapRolCrudCommandResponse(response)),
    );
  }

  noRequiereValidacionAlSerAsignado(payload: NoRequiereValidacionAlSerAsignadoViewModel): Observable<void> {
    return this.accountApi.noRequiereValidacionAlSerAsignado({ body: payload }).pipe(
      map((response) => unwrapRolCrudCommandResponse(response)),
    );
  }

  activaValidacionDeAsignacionDeRoles(payload: ActivaValidacionDeAsignacionDeRolesViewModel): Observable<void> {
    return this.accountApi.activaValidacionDeAsignacionDeRoles({ body: payload }).pipe(
      map((response) => unwrapRolCrudCommandResponse(response)),
    );
  }

  desactivaValidacionDeAsignacionDeRoles(payload: DesactivaValidacionDeAsignacionDeRolesViewModel): Observable<void> {
    return this.accountApi.desactivaValidacionDeAsignacionDeRoles({ body: payload }).pipe(
      map((response) => unwrapRolCrudCommandResponse(response)),
    );
  }

  activaDetalleDeAutorizaciones(payload: ActivaDetalleDeAutorizacionesViewModel): Observable<void> {
    return this.accountApi.activaDetalleDeAutorizaciones({ body: payload }).pipe(
      map((response) => unwrapRolCrudCommandResponse(response)),
    );
  }

  desactivaDetalleDeAutorizaciones(payload: DesactivaDetalleDeAutorizacionesViewModel): Observable<void> {
    return this.accountApi.desactivaDetalleDeAutorizaciones({ body: payload }).pipe(
      map((response) => unwrapRolCrudCommandResponse(response)),
    );
  }
}

function normalizeRolCrudPage(value: unknown): RolCrudPageResult {
  const envelope = toRecord(parseMaybeJson(value));
  const result = normalizeBoolean(pick(envelope, 'Result', 'result'), true);
  if (!result) {
    throw new Error(normalizeString(pick(envelope, 'Data', 'data')) || 'No fue posible cargar los roles.');
  }

  const data = toRecord(parseMaybeJson(pick(envelope, 'Data', 'data'))) as BuscarRolesPaginadosResponse;
  const items = Array.isArray(data.items)
    ? data.items.map((item) => normalizeRolCrudItem(item))
    : Array.isArray((data as Record<string, unknown>)['Items'])
      ? ((data as Record<string, unknown>)['Items'] as unknown[]).map((item) => normalizeRolCrudItem(item))
      : [];

  return {
    numeroDePagina: normalizeNumber(pick(data as Record<string, unknown>, 'numeroDePagina', 'NumeroDePagina'), 1),
    cantidadPorPagina: normalizeNumber(pick(data as Record<string, unknown>, 'cantidadPorPagina', 'CantidadPorPagina'), 10),
    total: normalizeNumber(pick(data as Record<string, unknown>, 'total', 'Total'), 0),
    items,
  };
}

function normalizeRolCrudItem(value: unknown): RolCrudItem {
  const parsed = toRecord(value as RolPaginadoItemResponse);

  return {
    id: normalizeString(pick(parsed, 'id', 'Id')),
    nombre: normalizeString(pick(parsed, 'nombre', 'Nombre')),
    nombreNormalizado: normalizeString(pick(parsed, 'nombreNormalizado', 'NombreNormalizado')),
    descripcion: normalizeString(pick(parsed, 'descripcion', 'Descripcion')),
    activaDetalleDeAutorizaciones: normalizeBoolean(pick(parsed, 'activaDetalleDeAutorizaciones', 'ActivaDetalleDeAutorizaciones')),
    requiereValidacionDeAsignacion: normalizeBoolean(pick(parsed, 'requiereValidacionDeAsignacion', 'RequiereValidacionDeAsignacion')),
    validaAsignacionDeRoles: normalizeBoolean(pick(parsed, 'validaAsignacionDeRoles', 'ValidaAsignacionDeRoles')),
    validaEnrrolamiento: normalizeBoolean(pick(parsed, 'validaEnrrolamiento', 'ValidaEnrrolamiento')),
    rolBase: normalizeBoolean(pick(parsed, 'rolBase', 'RolBase')),
    activo: normalizeBoolean(pick(parsed, 'activo', 'Activo')),
  };
}

function unwrapRolCrudCommandResponse(value: unknown): void {
  const envelope = toRecord(parseMaybeJson(value));
  const result = normalizeBoolean(pick(envelope, 'Result', 'result'), true);

  if (!result) {
    const message = normalizeString(pick(envelope, 'Data', 'data', 'Message', 'message', 'Title', 'title'));
    throw new Error(message || 'La operacion sobre el rol no se pudo completar.');
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

function normalizeBoolean(value: unknown, fallback = false): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function normalizeNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}
