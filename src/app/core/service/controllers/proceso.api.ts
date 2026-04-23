import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpContext, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '@core/config/api-base-url.token';
import type * as Models from '../openapi.models';

@Injectable({ providedIn: 'root' })
export class ProcesoApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL).replace(/\/+$/, '');
  private readonly procesoUrl = `${this.baseUrl}/api/proceso`;

  crear(options: { body?: Models.CrearProcesoViewModel; headers?: Record<string, string>; context?: HttpContext } = {}): Observable<unknown> {
    return this.http.request<unknown>('POST', `${this.procesoUrl}/Crear`, {
      body: options.body as Models.CrearProcesoViewModel,
      headers: options.headers ? new HttpHeaders(options.headers) : undefined,
      context: options.context,
    });
  }

  modificar(options: { body?: Models.ModificarProcesoViewModel; headers?: Record<string, string>; context?: HttpContext } = {}): Observable<unknown> {
    return this.http.request<unknown>('PUT', `${this.procesoUrl}/Modificar`, {
      body: options.body as Models.ModificarProcesoViewModel,
      headers: options.headers ? new HttpHeaders(options.headers) : undefined,
      context: options.context,
    });
  }

  eliminar(options: { body?: Models.EliminarProcesoViewModel; headers?: Record<string, string>; context?: HttpContext } = {}): Observable<unknown> {
    return this.http.request<unknown>('DELETE', `${this.procesoUrl}/Eliminar`, {
      body: options.body as Models.EliminarProcesoViewModel,
      headers: options.headers ? new HttpHeaders(options.headers) : undefined,
      context: options.context,
    });
  }

  activar(options: { body?: Models.ActivarProcesoViewModel; headers?: Record<string, string>; context?: HttpContext } = {}): Observable<unknown> {
    return this.http.request<unknown>('PUT', `${this.procesoUrl}/Activar`, {
      body: options.body as Models.ActivarProcesoViewModel,
      headers: options.headers ? new HttpHeaders(options.headers) : undefined,
      context: options.context,
    });
  }

  desactivar(options: { body?: Models.DesactivarProcesoViewModel; headers?: Record<string, string>; context?: HttpContext } = {}): Observable<unknown> {
    return this.http.request<unknown>('PUT', `${this.procesoUrl}/Desactivar`, {
      body: options.body as Models.DesactivarProcesoViewModel,
      headers: options.headers ? new HttpHeaders(options.headers) : undefined,
      context: options.context,
    });
  }

  buscarTodos(options: { headers?: Record<string, string>; context?: HttpContext } = {}): Observable<Models.ProcesoViewModel[]> {
    return this.http.request<Models.ProcesoViewModel[]>('GET', `${this.procesoUrl}/BuscarTodos`, {
      headers: options.headers ? new HttpHeaders(options.headers) : undefined,
      context: options.context,
    });
  }

  buscarPorId(options: { id: string; headers?: Record<string, string>; context?: HttpContext }): Observable<Models.ProcesoViewModel> {
    const params = new HttpParams().set('id', options.id);

    return this.http.request<Models.ProcesoViewModel>('GET', `${this.procesoUrl}/BuscarPor_Id`, {
      params,
      headers: options.headers ? new HttpHeaders(options.headers) : undefined,
      context: options.context,
    });
  }

  buscarPorCodigo(options: { codigo: string; headers?: Record<string, string>; context?: HttpContext }): Observable<Models.ProcesoViewModel> {
    const params = new HttpParams().set('codigo', options.codigo);

    return this.http.request<Models.ProcesoViewModel>('GET', `${this.procesoUrl}/BuscarPor_Codigo`, {
      params,
      headers: options.headers ? new HttpHeaders(options.headers) : undefined,
      context: options.context,
    });
  }

  buscarPorIdMacroProceso(options: { idMacro_Proceso: string; headers?: Record<string, string>; context?: HttpContext }): Observable<Models.ProcesoViewModel[]> {
    const params = new HttpParams().set('idMacro_Proceso', options.idMacro_Proceso);

    return this.http.request<Models.ProcesoViewModel[]>('GET', `${this.procesoUrl}/BuscarPor_IdMacro_Proceso`, {
      params,
      headers: options.headers ? new HttpHeaders(options.headers) : undefined,
      context: options.context,
    });
  }
}
