import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpContext, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '@core/config/api-base-url.token';
import type * as Models from '../openapi.models';

@Injectable({ providedIn: 'root' })
export class ServicioDeDominioApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL).replace(/\/+$/, '');
  private readonly servicioDeDominioUrl = `${this.baseUrl}/api/ServicioDeDominio`;

  crearEntidad(options: { body?: Models.CrearEntidadServicioDeDominioViewModel; headers?: Record<string, string>; context?: HttpContext } = {}): Observable<unknown> {
    return this.http.request<unknown>('POST', `${this.servicioDeDominioUrl}/CrearEntidad`, {
      body: options.body as Models.CrearEntidadServicioDeDominioViewModel,
      headers: options.headers ? new HttpHeaders(options.headers) : undefined,
      context: options.context,
    });
  }

  eliminarEntidad(options: { body?: Models.EliminarEntidadServicioDeDominioViewModel; headers?: Record<string, string>; context?: HttpContext } = {}): Observable<unknown> {
    return this.http.request<unknown>('POST', `${this.servicioDeDominioUrl}/EliminarEntidad`, {
      body: options.body as Models.EliminarEntidadServicioDeDominioViewModel,
      headers: options.headers ? new HttpHeaders(options.headers) : undefined,
      context: options.context,
    });
  }

  sincronizarPoliticasAsignadas(options: { body?: Models.SincronizarPoliticasAsignadasServicioDeDominioViewModel; headers?: Record<string, string>; context?: HttpContext } = {}): Observable<unknown> {
    return this.http.request<unknown>('POST', `${this.servicioDeDominioUrl}/SincronizarPoliticasAsignadas`, {
      body: options.body as Models.SincronizarPoliticasAsignadasServicioDeDominioViewModel,
      headers: options.headers ? new HttpHeaders(options.headers) : undefined,
      context: options.context,
    });
  }

  buscarUnidadesOrganizacionalesParaAsignarOrganizacion(options: { body?: Models.BuscarUnidadesOrganizacionalesParaAsignarOrganizacionServicioDeDominioViewModel; headers?: Record<string, string>; context?: HttpContext } = {}): Observable<unknown> {
    return this.http.request<unknown>('POST', `${this.servicioDeDominioUrl}/BuscarUnidadesOrganizacionalesParaAsignarOrganizacion`, {
      body: options.body as Models.BuscarUnidadesOrganizacionalesParaAsignarOrganizacionServicioDeDominioViewModel,
      headers: options.headers ? new HttpHeaders(options.headers) : undefined,
      context: options.context,
    });
  }

  sincronizarUnidadesOrganizacionalesOrganizacion(options: { body?: Models.SincronizarUnidadesOrganizacionalesOrganizacionServicioDeDominioViewModel; headers?: Record<string, string>; context?: HttpContext } = {}): Observable<unknown> {
    return this.http.request<unknown>('POST', `${this.servicioDeDominioUrl}/SincronizarUnidadesOrganizacionalesOrganizacion`, {
      body: options.body as Models.SincronizarUnidadesOrganizacionalesOrganizacionServicioDeDominioViewModel,
      headers: options.headers ? new HttpHeaders(options.headers) : undefined,
      context: options.context,
    });
  }

  buscarEntidadesParaAsignarPoliticaPorOrganizacion(options: { id_Organizacion: string; headers?: Record<string, string>; context?: HttpContext }): Observable<Models.EntidadParaAsignarPoliticaViewModel[]> {
    const params = new HttpParams().set('id_Organizacion', options.id_Organizacion);

    return this.http.request<Models.EntidadParaAsignarPoliticaViewModel[]>('GET', `${this.servicioDeDominioUrl}/BuscarEntidadesParaAsignarPoliticaPorOrganizacion`, {
      params,
      headers: options.headers ? new HttpHeaders(options.headers) : undefined,
      context: options.context,
    });
  }

  buscarPoliticasAsignadasPorEntidad(options: { id_Entidad: string; headers?: Record<string, string>; context?: HttpContext }): Observable<Models.PoliticaAsignadaParaEntidadViewModel[]> {
    const params = new HttpParams().set('id_Entidad', options.id_Entidad);

    return this.http.request<Models.PoliticaAsignadaParaEntidadViewModel[]>('GET', `${this.servicioDeDominioUrl}/BuscarPoliticasAsignadasPorEntidad`, {
      params,
      headers: options.headers ? new HttpHeaders(options.headers) : undefined,
      context: options.context,
    });
  }
}
