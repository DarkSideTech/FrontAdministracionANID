import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable, of, switchMap, throwError } from 'rxjs';

import { AuthStore } from '@core/auth/auth-store.service';
import { EnumRolesBase } from '@core/enumerations/enum-roles';
import { AccountApi } from '@core/service/controllers/account.api';
import { OrganizacionApi } from '@core/service/controllers/organizacion.api';
import { ProcesoApi } from '@core/service/controllers/proceso.api';
import { ServicioDeDominioApi } from '@core/service/controllers/serviciodedominio.api';
import type {
  BuscarRolesResponse,
  EntidadParaAsignarPoliticaViewModel,
  OrganizacionViewModel,
  PoliticaAsignadaParaEntidadViewModel,
  ProcesoSeleccionViewModel,
  SincronizarPoliticasAsignadasServicioDeDominioViewModel,
} from '@core/service/openapi.models';
import {
  AsignaRolProcesoEntidadItem,
  AsignaRolProcesoOrganizacionItem,
  AsignaRolProcesoPoliticaItem,
  AsignaRolProcesoProcesoItem,
  AsignaRolProcesoRolItem,
  PoliticaAsignadaKeyParts,
} from './asigna-rol-proceso-a-entidad.models';

@Injectable({ providedIn: 'root' })
export class AsignaRolProcesoAEntidadService {
  private readonly accountApi = inject(AccountApi);
  private readonly organizacionApi = inject(OrganizacionApi);
  private readonly procesoApi = inject(ProcesoApi);
  private readonly servicioDeDominioApi = inject(ServicioDeDominioApi);
  private readonly authStore = inject(AuthStore);

  buscarOrganizaciones(): Observable<AsignaRolProcesoOrganizacionItem[]> {
    if (this.authStore.hasRole(EnumRolesBase.Administrador)) {
      return this.organizacionApi.buscarTodos().pipe(
        map((items) => normalizeOrganizationList(items ?? [])),
      );
    }

    const sessionOrganizations = this.authStore.organizations();
    const organizationCodes = sessionOrganizations
      .map((item) => normalizeString(item.Codigo_Organizacion))
      .filter(Boolean);

    if (organizationCodes.length === 0) {
      const selectedOrganizationCode = normalizeString(this.authStore.selectedOrganizationCode());
      if (!selectedOrganizationCode) {
        return of([]);
      }

      return this.organizacionApi.buscarPorCodigo({ codigo: selectedOrganizationCode }).pipe(
        map((item) => normalizeOrganizationList([item])),
      );
    }

    return forkJoin(organizationCodes.map((codigo) => this.organizacionApi.buscarPorCodigo({ codigo }))).pipe(
      map((items) => normalizeOrganizationList(items)),
    );
  }

  buscarEntidadesPorOrganizacion(idOrganizacion: string): Observable<AsignaRolProcesoEntidadItem[]> {
    if (!idOrganizacion) {
      return throwError(() => new Error('Debe seleccionar una organización.'));
    }

    return this.servicioDeDominioApi.buscarEntidadesParaAsignarPoliticaPorOrganizacion({
      id_Organizacion: idOrganizacion,
    }).pipe(
      map((items) => normalizeEntityList(items ?? [])),
    );
  }

  buscarRoles(): Observable<AsignaRolProcesoRolItem[]> {
    return this.accountApi.buscarRoles({ body: { estado: 'ACTIVOS' } }).pipe(
      map((response) => normalizeRoleList(response)),
    );
  }

  buscarProcesos(): Observable<AsignaRolProcesoProcesoItem[]> {
    return this.procesoApi.buscarActivosParaSeleccion().pipe(
      map((items) => normalizeProcessList(items ?? [])),
    );
  }

  buscarPoliticasAsignadas(idEntidad: string): Observable<AsignaRolProcesoPoliticaItem[]> {
    if (!idEntidad) {
      return of([]);
    }

    return this.servicioDeDominioApi.buscarPoliticasAsignadasPorEntidad({ id_Entidad: idEntidad }).pipe(
      map((items) => normalizeAssignedPolicies(items ?? [])),
    );
  }

  sincronizarPoliticasAsignadas(
    accion: 'CREAR' | 'ELIMINAR',
    idEntidad: string,
    politicas: PoliticaAsignadaKeyParts[],
  ): Observable<void> {
    if (politicas.length === 0) {
      return of(void 0);
    }

    const payload: SincronizarPoliticasAsignadasServicioDeDominioViewModel = {
      accion,
      items: [
        {
          idEntidad,
          politicas: politicas.map((item) => ({
            idRol: item.idRol,
            idProceso: item.idProceso,
            rolRequiereValidacion: false,
          })),
        },
      ],
    };

    return this.servicioDeDominioApi.sincronizarPoliticasAsignadas({ body: payload }).pipe(
      map((response) => unwrapCommandResponse(response)),
    );
  }
}

function normalizeOrganizationList(items: OrganizacionViewModel[]): AsignaRolProcesoOrganizacionItem[] {
  return items
    .map((item) => {
      const parsed = toRecord(item);
      return {
        id: normalizeString(pick(parsed, 'id', 'Id')),
        codigo: normalizeString(pick(parsed, 'codigo', 'Codigo')),
        nombre: normalizeString(pick(parsed, 'nombre', 'Nombre')),
        descripcion: normalizeString(pick(parsed, 'descripcion', 'Descripcion')),
        activo: normalizeBoolean(pick(parsed, 'activo', 'Activo')),
      };
    })
    .filter((item) => item.id && item.activo)
    .sort((left, right) => left.codigo.localeCompare(right.codigo, 'es'));
}

function normalizeEntityList(items: EntidadParaAsignarPoliticaViewModel[]): AsignaRolProcesoEntidadItem[] {
  return items
    .map((item) => {
      const parsed = toRecord(item);
      return {
        idEntidad: normalizeString(pick(parsed, 'idEntidad', 'IdEntidad')),
        idUsuario: normalizeString(pick(parsed, 'idUsuario', 'IdUsuario')),
        nombreUsuario: normalizeString(pick(parsed, 'nombreUsuario', 'NombreUsuario')),
        idUnidadOrganizacional: normalizeString(pick(parsed, 'idUnidadOrganizacional', 'IdUnidadOrganizacional')),
        codigoUnidadOrganizacional: normalizeString(pick(parsed, 'codigoUnidadOrganizacional', 'CodigoUnidadOrganizacional')),
        nombreUnidadOrganizacional: normalizeString(pick(parsed, 'nombreUnidadOrganizacional', 'NombreUnidadOrganizacional')),
        tipoDeEntidad: normalizeString(pick(parsed, 'tipoDeEntidad', 'TipoDeEntidad')),
        correoElectronico: normalizeString(pick(parsed, 'correoElectronico', 'CorreoElectronico')),
        principal: normalizeBoolean(pick(parsed, 'principal', 'Principal')),
      };
    })
    .filter((item) => item.idEntidad)
    .sort((left, right) =>
      `${left.nombreUsuario}${left.codigoUnidadOrganizacional}`.localeCompare(`${right.nombreUsuario}${right.codigoUnidadOrganizacional}`, 'es'),
    );
}

function normalizeRoleList(value: unknown): AsignaRolProcesoRolItem[] {
  const envelope = toRecord(parseMaybeJson(value));
  const result = normalizeBoolean(pick(envelope, 'Result', 'result'), true);
  if (!result) {
    throw new Error(normalizeString(pick(envelope, 'Data', 'data')) || 'No fue posible cargar los roles.');
  }

  const data = toRecord(parseMaybeJson(pick(envelope, 'Data', 'data'))) as BuscarRolesResponse;
  const roles = Array.isArray(data.items)
    ? data.items
    : Array.isArray((data as Record<string, unknown>)['Items'])
      ? ((data as Record<string, unknown>)['Items'] as unknown[])
      : [];

  return roles
    .map((item) => {
      const parsed = toRecord(item);
      return {
        id: normalizeString(pick(parsed, 'id', 'Id')),
        nombreNormalizado: normalizeString(pick(parsed, 'nombreNormalizado', 'NombreNormalizado')),
      };
    })
    .filter((item) => item.id && item.nombreNormalizado)
    .sort((left, right) => left.nombreNormalizado.localeCompare(right.nombreNormalizado, 'es'));
}

function normalizeProcessList(items: ProcesoSeleccionViewModel[]): AsignaRolProcesoProcesoItem[] {
  return items
    .map((item) => {
      const parsed = toRecord(item);
      return {
        id: normalizeString(pick(parsed, 'id', 'Id')),
        codigo: normalizeString(pick(parsed, 'codigo', 'Codigo')),
        nombre: normalizeString(pick(parsed, 'nombre', 'Nombre')),
      };
    })
    .filter((item) => item.id)
    .sort((left, right) => left.codigo.localeCompare(right.codigo, 'es'));
}

function normalizeAssignedPolicies(items: PoliticaAsignadaParaEntidadViewModel[]): AsignaRolProcesoPoliticaItem[] {
  return items
    .map((item) => {
      const parsed = toRecord(item);
      return {
        idPoliticaAsignada: normalizeString(pick(parsed, 'idPoliticaAsignada', 'IdPoliticaAsignada')),
        idEntidad: normalizeString(pick(parsed, 'idEntidad', 'IdEntidad')),
        idRol: normalizeString(pick(parsed, 'idRol', 'IdRol')),
        nombreRol: normalizeString(pick(parsed, 'nombreRol', 'NombreRol')),
        idProceso: normalizeString(pick(parsed, 'idProceso', 'IdProceso')),
        codigoProceso: normalizeString(pick(parsed, 'codigoProceso', 'CodigoProceso')),
        nombreProceso: normalizeString(pick(parsed, 'nombreProceso', 'NombreProceso')),
        rolRequiereValidacion: normalizeBoolean(pick(parsed, 'rolRequiereValidacion', 'RolRequiereValidacion')),
        rolAsignadoValidado: normalizeBoolean(pick(parsed, 'rolAsignadoValidado', 'RolAsignadoValidado')),
      };
    })
    .filter((item) => item.idRol && item.idProceso);
}

function unwrapCommandResponse(value: unknown): void {
  const envelope = toRecord(parseMaybeJson(value));
  const result = normalizeBoolean(pick(envelope, 'Result', 'result'), true);

  if (!result) {
    const message = normalizeString(pick(envelope, 'Data', 'data', 'Message', 'message', 'Title', 'title'));
    throw new Error(message || 'La operación no se pudo completar.');
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
