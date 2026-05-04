import { inject, Injectable } from '@angular/core';
import { map, Observable, switchMap, throwError } from 'rxjs';

import { AuthStore } from '@core/auth/auth-store.service';
import { EntidadApi } from '@core/service/controllers/entidad.api';
import { OrganizacionApi } from '@core/service/controllers/organizacion.api';
import { ServicioDeDominioApi } from '@core/service/controllers/serviciodedominio.api';
import { UnidadOrganizacionalApi } from '@core/service/controllers/unidadorganizacional.api';
import type {
  CrearEntidadServicioDeDominioViewModel,
  EliminarEntidadServicioDeDominioViewModel,
  EntidadViewModel,
  OrganizacionViewModel,
  UnidadOrganizacionalViewModel,
} from '@core/service/openapi.models';
import { UsuarioCrudService } from '../usuario/usuario-crud.service';
import {
  UsuarioUnidadEntidadAssignment,
  UsuarioUnidadOrganizacionItem,
  UsuarioUnidadOrganizacionalItem,
  UsuarioUnidadUsuarioPageResult,
} from './usuario-a-unidad-organizacional.models';

@Injectable({ providedIn: 'root' })
export class UsuarioAUnidadOrganizacionalService {
  private readonly usuarioCrudService = inject(UsuarioCrudService);
  private readonly entidadApi = inject(EntidadApi);
  private readonly organizacionApi = inject(OrganizacionApi);
  private readonly unidadOrganizacionalApi = inject(UnidadOrganizacionalApi);
  private readonly servicioDeDominioApi = inject(ServicioDeDominioApi);
  private readonly authStore = inject(AuthStore);

  buscarUsuarios(payload: { numeroDePagina: number; cantidadPorPagina: number; busqueda: string }): Observable<UsuarioUnidadUsuarioPageResult> {
    return this.usuarioCrudService.buscarUsuariosPaginados(payload).pipe(
      map((page) => ({
        ...page,
        items: page.items.map((item) => ({
          idUsuario: item.idUsuario,
          correoElectronico: item.correoElectronico,
          nombreADesplegar: item.nombreADesplegar,
          nacionalidad: item.nacionalidad,
          activo: item.activo,
        })),
      })),
    );
  }

  buscarOrganizaciones(): Observable<UsuarioUnidadOrganizacionItem[]> {
    return this.organizacionApi.buscarTodos().pipe(
      map((items) =>
        (items ?? [])
          .map((item) => normalizeOrganization(item))
          .filter((item) => item.activo)
          .sort((left, right) => left.codigo.localeCompare(right.codigo, 'es')),
      ),
    );
  }

  buscarUnidadesDelContexto(): Observable<UsuarioUnidadOrganizacionalItem[]> {
    const selectedOrganizationCode = this.authStore.selectedOrganizationCode();
    if (!selectedOrganizationCode) {
      return throwError(() => new Error('No existe una organización seleccionada en la sesión actual.'));
    }

    return this.organizacionApi.buscarPorCodigo({ codigo: selectedOrganizationCode }).pipe(
      map((organizacion) => resolveOrganizationId(organizacion)),
      switchMap((idOrganizacion) => this.unidadOrganizacionalApi.buscarPorIdOrganizacion({ id_Organizacion: idOrganizacion })),
      map((items) => this.filterUnitsByLoginContext(items ?? [])),
    );
  }

  buscarUnidadesPorOrganizacion(idOrganizacion: string): Observable<UsuarioUnidadOrganizacionalItem[]> {
    if (!idOrganizacion) {
      return throwError(() => new Error('Debe seleccionar una organización.'));
    }

    return this.unidadOrganizacionalApi.buscarPorIdOrganizacion({ id_Organizacion: idOrganizacion }).pipe(
      map((items) =>
        (items ?? [])
          .map((item) => normalizeUnit(item))
          .filter((item) => item.activo)
          .sort((left, right) => left.codigo.localeCompare(right.codigo, 'es')),
      ),
    );
  }

  buscarEntidadesUsuarioOrganizacion(idUsuario: string, idOrganizacion?: string): Observable<UsuarioUnidadEntidadAssignment[]> {
    if (idOrganizacion) {
      return this.entidadApi.buscarPorIdUsuarioIdOrganizacion({
        id_Usuario: idUsuario,
        id_Organizacion: idOrganizacion,
      }).pipe(
        map((items) => normalizeAssignments(items ?? [])),
      );
    }

    const selectedOrganizationCode = this.authStore.selectedOrganizationCode();
    if (!selectedOrganizationCode) {
      return throwError(() => new Error('No existe una organización seleccionada en la sesión actual.'));
    }

    return this.organizacionApi.buscarPorCodigo({ codigo: selectedOrganizationCode }).pipe(
      map((organizacion) => resolveOrganizationId(organizacion)),
      switchMap((idOrganizacion) =>
        this.entidadApi.buscarPorIdUsuarioIdOrganizacion({
          id_Usuario: idUsuario,
          id_Organizacion: idOrganizacion,
        }),
      ),
      map((items) => normalizeAssignments(items ?? [])),
    );
  }

  crearEntidad(payload: CrearEntidadServicioDeDominioViewModel): Observable<void> {
    return this.servicioDeDominioApi.crearEntidad({ body: payload }).pipe(
      map((response) => unwrapCommandResponse(response)),
    );
  }

  eliminarEntidad(payload: EliminarEntidadServicioDeDominioViewModel): Observable<void> {
    return this.servicioDeDominioApi.eliminarEntidad({ body: payload }).pipe(
      map((response) => unwrapCommandResponse(response)),
    );
  }

  private filterUnitsByLoginContext(items: UnidadOrganizacionalViewModel[]): UsuarioUnidadOrganizacionalItem[] {
    const contextUnitCodes = new Set(
      this.authStore.organizationalUnits()
        .map((item) => normalizeString(item.Codigo_UnidadOrganizacional))
        .filter(Boolean),
    );

    return items
      .map((item) => normalizeUnit(item))
      .filter((item) => item.activo)
      .filter((item) => contextUnitCodes.size === 0 || contextUnitCodes.has(item.codigo))
      .sort((left, right) => left.codigo.localeCompare(right.codigo, 'es'));
  }
}

function resolveOrganizationId(value: unknown): string {
  const idOrganizacion = normalizeString(pick(toRecord(value), 'id', 'Id'));
  if (!idOrganizacion) {
    throw new Error('No fue posible resolver la organización seleccionada.');
  }

  return idOrganizacion;
}

function normalizeOrganization(value: OrganizacionViewModel): UsuarioUnidadOrganizacionItem {
  const parsed = toRecord(value);
  return {
    id: normalizeString(pick(parsed, 'id', 'Id')),
    codigo: normalizeString(pick(parsed, 'codigo', 'Codigo')),
    nombre: normalizeString(pick(parsed, 'nombre', 'Nombre')),
    descripcion: normalizeString(pick(parsed, 'descripcion', 'Descripcion')),
    activo: normalizeBoolean(pick(parsed, 'activo', 'Activo')),
  };
}

function normalizeAssignments(items: EntidadViewModel[]): UsuarioUnidadEntidadAssignment[] {
  return items
    .map((item) => {
      const parsed = toRecord(item);
      return {
        idEntidad: normalizeString(pick(parsed, 'id', 'Id')),
        idUnidadOrganizacional: normalizeString(pick(parsed, 'id_UnidadOrganizacional', 'Id_UnidadOrganizacional')),
      };
    })
    .filter((item) => item.idEntidad && item.idUnidadOrganizacional);
}

function unwrapCommandResponse(value: unknown): void {
  const envelope = toRecord(parseMaybeJson(value));
  const result = normalizeBoolean(pick(envelope, 'Result', 'result'), true);

  if (!result) {
    const message = normalizeString(pick(envelope, 'Data', 'data', 'Message', 'message', 'Title', 'title'));
    throw new Error(message || 'La operación no se pudo completar.');
  }
}

function normalizeUnit(value: UnidadOrganizacionalViewModel): UsuarioUnidadOrganizacionalItem {
  const parsed = toRecord(value);
  return {
    id: normalizeString(pick(parsed, 'id', 'Id')),
    id_Organizacion: normalizeString(pick(parsed, 'id_Organizacion', 'Id_Organizacion')),
    codigo: normalizeString(pick(parsed, 'codigo', 'Codigo')),
    nombre: normalizeString(pick(parsed, 'nombre', 'Nombre')),
    descripcion: normalizeString(pick(parsed, 'descripcion', 'Descripcion')),
    activo: normalizeBoolean(pick(parsed, 'activo', 'Activo')),
  };
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
