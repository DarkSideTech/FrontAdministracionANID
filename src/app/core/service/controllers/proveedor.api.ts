import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpContext, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '@core/config/api-base-url.token';
import type * as Models from '../openapi.models';

@Injectable({ providedIn: 'root' })
export class ProveedorApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL).replace(/\/+$/, '');
  private readonly proveedorUrl = `${this.baseUrl}/api/proveedor`;

  crear(options: { body?: Models.CrearProveedorViewModel; headers?: Record<string, string>; context?: HttpContext } = {}): Observable<unknown> {
    return this.http.request<unknown>('POST', `${this.proveedorUrl}/Crear`, {
      body: options.body as Models.CrearProveedorViewModel,
      headers: options.headers ? new HttpHeaders(options.headers) : undefined,
      context: options.context,
    });
  }

  modificar(options: { body?: Models.ModificarProveedorViewModel; headers?: Record<string, string>; context?: HttpContext } = {}): Observable<unknown> {
    return this.http.request<unknown>('PUT', `${this.proveedorUrl}/Modificar`, {
      body: options.body as Models.ModificarProveedorViewModel,
      headers: options.headers ? new HttpHeaders(options.headers) : undefined,
      context: options.context,
    });
  }

  eliminar(options: { body?: Models.EliminarProveedorViewModel; headers?: Record<string, string>; context?: HttpContext } = {}): Observable<unknown> {
    return this.http.request<unknown>('DELETE', `${this.proveedorUrl}/Eliminar`, {
      body: options.body as Models.EliminarProveedorViewModel,
      headers: options.headers ? new HttpHeaders(options.headers) : undefined,
      context: options.context,
    });
  }

  eliminarPorCodigo(options: { body?: Models.EliminarPor_CodigoProveedorViewModel; headers?: Record<string, string>; context?: HttpContext } = {}): Observable<unknown> {
    return this.http.request<unknown>('DELETE', `${this.proveedorUrl}/EliminarPor_Codigo`, {
      body: options.body as Models.EliminarPor_CodigoProveedorViewModel,
      headers: options.headers ? new HttpHeaders(options.headers) : undefined,
      context: options.context,
    });
  }

  activar(options: { body?: Models.ActivarProveedorViewModel; headers?: Record<string, string>; context?: HttpContext } = {}): Observable<unknown> {
    return this.http.request<unknown>('PUT', `${this.proveedorUrl}/Activar`, {
      body: options.body as Models.ActivarProveedorViewModel,
      headers: options.headers ? new HttpHeaders(options.headers) : undefined,
      context: options.context,
    });
  }

  desactivar(options: { body?: Models.DesactivarProveedorViewModel; headers?: Record<string, string>; context?: HttpContext } = {}): Observable<unknown> {
    return this.http.request<unknown>('PUT', `${this.proveedorUrl}/Desactivar`, {
      body: options.body as Models.DesactivarProveedorViewModel,
      headers: options.headers ? new HttpHeaders(options.headers) : undefined,
      context: options.context,
    });
  }

  buscarTodos(options: { headers?: Record<string, string>; context?: HttpContext } = {}): Observable<Models.ProveedorViewModel[]> {
    return this.http.request<Models.ProveedorViewModel[]>('GET', `${this.proveedorUrl}/BuscarTodos`, {
      headers: options.headers ? new HttpHeaders(options.headers) : undefined,
      context: options.context,
    });
  }

  buscarPorId(options: { id: string; headers?: Record<string, string>; context?: HttpContext }): Observable<Models.ProveedorViewModel> {
    const params = new HttpParams().set('id', options.id);

    return this.http.request<Models.ProveedorViewModel>('GET', `${this.proveedorUrl}/BuscarPor_Id`, {
      params,
      headers: options.headers ? new HttpHeaders(options.headers) : undefined,
      context: options.context,
    });
  }

  buscarPorCodigo(options: { codigo: string; headers?: Record<string, string>; context?: HttpContext }): Observable<Models.ProveedorViewModel> {
    const params = new HttpParams().set('codigo', options.codigo);

    return this.http.request<Models.ProveedorViewModel>('GET', `${this.proveedorUrl}/BuscarPor_Codigo`, {
      params,
      headers: options.headers ? new HttpHeaders(options.headers) : undefined,
      context: options.context,
    });
  }
}
