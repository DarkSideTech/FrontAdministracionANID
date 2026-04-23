import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpContext, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '@core/config/api-base-url.token';
import type * as Models from '../openapi.models';

@Injectable({ providedIn: 'root' })
export class UnidadOrganizacionalApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL).replace(/\/+$/, '');
  private readonly unidadOrganizacionalUrl = `${this.baseUrl}/api/unidadorganizacional`;

  crear(options: { body?: Models.CrearUnidadOrganizacionalViewModel; headers?: Record<string, string>; context?: HttpContext } = {}): Observable<unknown> {
    return this.http.request<unknown>('POST', `${this.unidadOrganizacionalUrl}/Crear`, {
      body: options.body as Models.CrearUnidadOrganizacionalViewModel,
      headers: options.headers ? new HttpHeaders(options.headers) : undefined,
      context: options.context,
    });
  }

  modificar(options: { body?: Models.ModificarUnidadOrganizacionalViewModel; headers?: Record<string, string>; context?: HttpContext } = {}): Observable<unknown> {
    return this.http.request<unknown>('PUT', `${this.unidadOrganizacionalUrl}/Modificar`, {
      body: options.body as Models.ModificarUnidadOrganizacionalViewModel,
      headers: options.headers ? new HttpHeaders(options.headers) : undefined,
      context: options.context,
    });
  }

  eliminar(options: { body?: Models.EliminarUnidadOrganizacionalViewModel; headers?: Record<string, string>; context?: HttpContext } = {}): Observable<unknown> {
    return this.http.request<unknown>('DELETE', `${this.unidadOrganizacionalUrl}/Eliminar`, {
      body: options.body as Models.EliminarUnidadOrganizacionalViewModel,
      headers: options.headers ? new HttpHeaders(options.headers) : undefined,
      context: options.context,
    });
  }

  eliminarPorCodigoIdOrganizacion(options: { body?: Models.EliminarPor_Codigo_Id_OrganizacionUnidadOrganizacionalViewModel; headers?: Record<string, string>; context?: HttpContext } = {}): Observable<unknown> {
    return this.http.request<unknown>('DELETE', `${this.unidadOrganizacionalUrl}/EliminarPor_Codigo_Id_Organizacion`, {
      body: options.body as Models.EliminarPor_Codigo_Id_OrganizacionUnidadOrganizacionalViewModel,
      headers: options.headers ? new HttpHeaders(options.headers) : undefined,
      context: options.context,
    });
  }

  activar(options: { body?: Models.ActivarUnidadOrganizacionalViewModel; headers?: Record<string, string>; context?: HttpContext } = {}): Observable<unknown> {
    return this.http.request<unknown>('PUT', `${this.unidadOrganizacionalUrl}/Activar`, {
      body: options.body as Models.ActivarUnidadOrganizacionalViewModel,
      headers: options.headers ? new HttpHeaders(options.headers) : undefined,
      context: options.context,
    });
  }

  desactivar(options: { body?: Models.DesactivarUnidadOrganizacionalViewModel; headers?: Record<string, string>; context?: HttpContext } = {}): Observable<unknown> {
    return this.http.request<unknown>('PUT', `${this.unidadOrganizacionalUrl}/Desactivar`, {
      body: options.body as Models.DesactivarUnidadOrganizacionalViewModel,
      headers: options.headers ? new HttpHeaders(options.headers) : undefined,
      context: options.context,
    });
  }

  buscarTodos(options: { headers?: Record<string, string>; context?: HttpContext } = {}): Observable<Models.UnidadOrganizacionalViewModel[]> {
    return this.http.request<Models.UnidadOrganizacionalViewModel[]>('GET', `${this.unidadOrganizacionalUrl}/BuscarTodos`, {
      headers: options.headers ? new HttpHeaders(options.headers) : undefined,
      context: options.context,
    });
  }

  buscarPorId(options: { id: string; headers?: Record<string, string>; context?: HttpContext }): Observable<Models.UnidadOrganizacionalViewModel> {
    const params = new HttpParams().set('id', options.id);

    return this.http.request<Models.UnidadOrganizacionalViewModel>('GET', `${this.unidadOrganizacionalUrl}/BuscarPor_Id`, {
      params,
      headers: options.headers ? new HttpHeaders(options.headers) : undefined,
      context: options.context,
    });
  }

  buscarPorCodigoIdOrganizacion(options: { codigo: string; id_Organizacion: string; headers?: Record<string, string>; context?: HttpContext }): Observable<Models.UnidadOrganizacionalViewModel> {
    const params = new HttpParams()
      .set('codigo', options.codigo)
      .set('id_Organizacion', options.id_Organizacion);

    return this.http.request<Models.UnidadOrganizacionalViewModel>('GET', `${this.unidadOrganizacionalUrl}/BuscarPor_Codigo_Id_Organizacion`, {
      params,
      headers: options.headers ? new HttpHeaders(options.headers) : undefined,
      context: options.context,
    });
  }

  buscarPorIdOrganizacion(options: { id_Organizacion: string; headers?: Record<string, string>; context?: HttpContext }): Observable<Models.UnidadOrganizacionalViewModel[]> {
    const params = new HttpParams().set('id_Organizacion', options.id_Organizacion);

    return this.http.request<Models.UnidadOrganizacionalViewModel[]>('GET', `${this.unidadOrganizacionalUrl}/BuscarPor_Id_Organizacion`, {
      params,
      headers: options.headers ? new HttpHeaders(options.headers) : undefined,
      context: options.context,
    });
  }
}
