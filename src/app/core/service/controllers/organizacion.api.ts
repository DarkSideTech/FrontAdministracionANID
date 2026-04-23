import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpContext, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '@core/config/api-base-url.token';
import type * as Models from '../openapi.models';

@Injectable({ providedIn: 'root' })
export class OrganizacionApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL).replace(/\/+$/, '');
  private readonly organizacionUrl = `${this.baseUrl}/api/organizacion`;

  crear(options: { body?: Models.CrearOrganizacionViewModel; headers?: Record<string, string>; context?: HttpContext } = {}): Observable<unknown> {
    return this.http.request<unknown>('POST', `${this.organizacionUrl}/Crear`, {
      body: options.body as Models.CrearOrganizacionViewModel,
      headers: options.headers ? new HttpHeaders(options.headers) : undefined,
      context: options.context,
    });
  }

  modificar(options: { body?: Models.ModificarOrganizacionViewModel; headers?: Record<string, string>; context?: HttpContext } = {}): Observable<unknown> {
    return this.http.request<unknown>('PUT', `${this.organizacionUrl}/Modificar`, {
      body: options.body as Models.ModificarOrganizacionViewModel,
      headers: options.headers ? new HttpHeaders(options.headers) : undefined,
      context: options.context,
    });
  }

  eliminar(options: { body?: Models.EliminarOrganizacionViewModel; headers?: Record<string, string>; context?: HttpContext } = {}): Observable<unknown> {
    return this.http.request<unknown>('DELETE', `${this.organizacionUrl}/Eliminar`, {
      body: options.body as Models.EliminarOrganizacionViewModel,
      headers: options.headers ? new HttpHeaders(options.headers) : undefined,
      context: options.context,
    });
  }

  eliminarPorCodigo(options: { body?: Models.EliminarPor_CodigoOrganizacionViewModel; headers?: Record<string, string>; context?: HttpContext } = {}): Observable<unknown> {
    return this.http.request<unknown>('DELETE', `${this.organizacionUrl}/EliminarPor_Codigo`, {
      body: options.body as Models.EliminarPor_CodigoOrganizacionViewModel,
      headers: options.headers ? new HttpHeaders(options.headers) : undefined,
      context: options.context,
    });
  }

  activar(options: { body?: Models.ActivarOrganizacionViewModel; headers?: Record<string, string>; context?: HttpContext } = {}): Observable<unknown> {
    return this.http.request<unknown>('PUT', `${this.organizacionUrl}/Activar`, {
      body: options.body as Models.ActivarOrganizacionViewModel,
      headers: options.headers ? new HttpHeaders(options.headers) : undefined,
      context: options.context,
    });
  }

  desactivar(options: { body?: Models.DesactivarOrganizacionViewModel; headers?: Record<string, string>; context?: HttpContext } = {}): Observable<unknown> {
    return this.http.request<unknown>('PUT', `${this.organizacionUrl}/Desactivar`, {
      body: options.body as Models.DesactivarOrganizacionViewModel,
      headers: options.headers ? new HttpHeaders(options.headers) : undefined,
      context: options.context,
    });
  }

  buscarTodos(options: { headers?: Record<string, string>; context?: HttpContext } = {}): Observable<Models.OrganizacionViewModel[]> {
    return this.http.request<Models.OrganizacionViewModel[]>('GET', `${this.organizacionUrl}/BuscarTodos`, {
      headers: options.headers ? new HttpHeaders(options.headers) : undefined,
      context: options.context,
    });
  }

  buscarPorId(options: { id: string; headers?: Record<string, string>; context?: HttpContext }): Observable<Models.OrganizacionViewModel> {
    const params = new HttpParams().set('id', options.id);

    return this.http.request<Models.OrganizacionViewModel>('GET', `${this.organizacionUrl}/BuscarPor_Id`, {
      params,
      headers: options.headers ? new HttpHeaders(options.headers) : undefined,
      context: options.context,
    });
  }

  buscarPorCodigo(options: { codigo: string; headers?: Record<string, string>; context?: HttpContext }): Observable<Models.OrganizacionViewModel> {
    const params = new HttpParams().set('codigo', options.codigo);

    return this.http.request<Models.OrganizacionViewModel>('GET', `${this.organizacionUrl}/BuscarPor_Codigo`, {
      params,
      headers: options.headers ? new HttpHeaders(options.headers) : undefined,
      context: options.context,
    });
  }
}
