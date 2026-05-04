import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpContext, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '@core/config/api-base-url.token';
import type * as Models from '../openapi.models';

@Injectable({ providedIn: 'root' })
export class EntidadApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL).replace(/\/+$/, '');
  private readonly entidadUrl = `${this.baseUrl}/api/Entidad`;

  buscarPorIdUsuarioIdOrganizacion(options: { id_Usuario: string; id_Organizacion: string; headers?: Record<string, string>; context?: HttpContext }): Observable<Models.EntidadViewModel[]> {
    const params = new HttpParams()
      .set('id_Usuario', options.id_Usuario)
      .set('id_Organizacion', options.id_Organizacion);

    return this.http.request<Models.EntidadViewModel[]>('GET', `${this.entidadUrl}/BuscarPor_Id_Usuario_Id_Organizacion`, {
      params,
      headers: options.headers ? new HttpHeaders(options.headers) : undefined,
      context: options.context,
    });
  }
}
