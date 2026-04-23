import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpContext, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '@core/config/api-base-url.token';

@Injectable({ providedIn: 'root' })
export class EnumerationApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL).replace(/\/+$/, '');
  private readonly enumerationUrl = `${this.baseUrl}/api/enumeration`;

  buscarTodosLosValoresEnumEstadoDeUsuario(options: { headers?: Record<string, string>; context?: HttpContext } = {}): Observable<string[]> {
    return this.http.request<string[]>('GET', `${this.enumerationUrl}/BuscarTodosLosValores_EnumEstadoDeUsuario`, {
      headers: options.headers ? new HttpHeaders(options.headers) : undefined,
      context: options.context,
    });
  }

  buscarTodosLosValoresEnumTipoDeUsuario(options: { headers?: Record<string, string>; context?: HttpContext } = {}): Observable<string[]> {
    return this.http.request<string[]>('GET', `${this.enumerationUrl}/BuscarTodosLosValores_EnumTipoDeUsuario`, {
      headers: options.headers ? new HttpHeaders(options.headers) : undefined,
      context: options.context,
    });
  }

  buscarTodosLosValoresEnumTipoDeEntidad(options: { headers?: Record<string, string>; context?: HttpContext } = {}): Observable<string[]> {
    return this.http.request<string[]>('GET', `${this.enumerationUrl}/BuscarTodosLosValores_EnumTipoDeEntidad`, {
      headers: options.headers ? new HttpHeaders(options.headers) : undefined,
      context: options.context,
    });
  }

  buscarTodosLosValoresEnumNivelDeProceso(options: { headers?: Record<string, string>; context?: HttpContext } = {}): Observable<string[]> {
    return this.http.request<string[]>('GET', `${this.enumerationUrl}/BuscarTodosLosValores_EnumNivelDeProceso`, {
      headers: options.headers ? new HttpHeaders(options.headers) : undefined,
      context: options.context,
    });
  }

  buscarTodosLosValoresEnumComoDesplegarUrlDeProceso(options: { headers?: Record<string, string>; context?: HttpContext } = {}): Observable<string[]> {
    return this.http.request<string[]>('GET', `${this.enumerationUrl}/BuscarTodosLosValores_EnumComoDesplegarUrlDeProceso`, {
      headers: options.headers ? new HttpHeaders(options.headers) : undefined,
      context: options.context,
    });
  }

  buscarTodosLosValoresEnumRolesBase(options: { headers?: Record<string, string>; context?: HttpContext } = {}): Observable<string[]> {
    return this.http.request<string[]>('GET', `${this.enumerationUrl}/BuscarTodosLosValores_EnumRolesBase`, {
      headers: options.headers ? new HttpHeaders(options.headers) : undefined,
      context: options.context,
    });
  }

  buscarTodosLosValoresEnumUsuariosBase(options: { headers?: Record<string, string>; context?: HttpContext } = {}): Observable<string[]> {
    return this.http.request<string[]>('GET', `${this.enumerationUrl}/BuscarTodosLosValores_EnumUsuariosBase`, {
      headers: options.headers ? new HttpHeaders(options.headers) : undefined,
      context: options.context,
    });
  }

  buscarTodosLosValoresEnumNacionalidad(options: { headers?: Record<string, string>; context?: HttpContext } = {}): Observable<string[]> {
    return this.http.request<string[]>('GET', `${this.enumerationUrl}/BuscarTodosLosValores_EnumNacionalidad`, {
      headers: options.headers ? new HttpHeaders(options.headers) : undefined,
      context: options.context,
    });
  }

  buscarTodosLosValoresEnumDocumentoDeIdentidad(options: { headers?: Record<string, string>; context?: HttpContext } = {}): Observable<string[]> {
    return this.http.request<string[]>('GET', `${this.enumerationUrl}/BuscarTodosLosValores_EnumDocumentoDeIdentidad`, {
      headers: options.headers ? new HttpHeaders(options.headers) : undefined,
      context: options.context,
    });
  }

  buscarTodosLosValoresEnumSexoDeclarativo(options: { headers?: Record<string, string>; context?: HttpContext } = {}): Observable<string[]> {
    return this.http.request<string[]>('GET', `${this.enumerationUrl}/BuscarTodosLosValores_EnumSexoDeclarativo`, {
      headers: options.headers ? new HttpHeaders(options.headers) : undefined,
      context: options.context,
    });
  }

  buscarTodosLosValoresEnumSexoRegistral(options: { headers?: Record<string, string>; context?: HttpContext } = {}): Observable<string[]> {
    return this.http.request<string[]>('GET', `${this.enumerationUrl}/BuscarTodosLosValores_EnumSexoRegistral`, {
      headers: options.headers ? new HttpHeaders(options.headers) : undefined,
      context: options.context,
    });
  }

  buscarTodosLosValoresEnumProcesosBase(options: { headers?: Record<string, string>; context?: HttpContext } = {}): Observable<string[]> {
    return this.http.request<string[]>('GET', `${this.enumerationUrl}/BuscarTodosLosValores_EnumProcesosBase`, {
      headers: options.headers ? new HttpHeaders(options.headers) : undefined,
      context: options.context,
    });
  }

  buscarTodosLosValoresEnumUnidadOrganizacionalBase(options: { headers?: Record<string, string>; context?: HttpContext } = {}): Observable<string[]> {
    return this.http.request<string[]>('GET', `${this.enumerationUrl}/BuscarTodosLosValores_EnumUnidadOrganizacionalBase`, {
      headers: options.headers ? new HttpHeaders(options.headers) : undefined,
      context: options.context,
    });
  }

  buscarTodosLosValoresEnumOrganizacionBase(options: { headers?: Record<string, string>; context?: HttpContext } = {}): Observable<string[]> {
    return this.http.request<string[]>('GET', `${this.enumerationUrl}/BuscarTodosLosValores_EnumOrganizacionBase`, {
      headers: options.headers ? new HttpHeaders(options.headers) : undefined,
      context: options.context,
    });
  }

  buscarTodosLosValoresEnumAuthCookie(options: { headers?: Record<string, string>; context?: HttpContext } = {}): Observable<string[]> {
    return this.http.request<string[]>('GET', `${this.enumerationUrl}/BuscarTodosLosValores_EnumAuthCookie`, {
      headers: options.headers ? new HttpHeaders(options.headers) : undefined,
      context: options.context,
    });
  }

  buscarTodosLosValoresEnumBusinessClaimTypes(options: { headers?: Record<string, string>; context?: HttpContext } = {}): Observable<string[]> {
    return this.http.request<string[]>('GET', `${this.enumerationUrl}/BuscarTodosLosValores_EnumBusinessClaimTypes`, {
      headers: options.headers ? new HttpHeaders(options.headers) : undefined,
      context: options.context,
    });
  }

  buscarTodosLosValoresEnumPartialBusinessClaimTypes(options: { headers?: Record<string, string>; context?: HttpContext } = {}): Observable<string[]> {
    return this.http.request<string[]>('GET', `${this.enumerationUrl}/BuscarTodosLosValores_EnumPartialBusinessClaimTypes`, {
      headers: options.headers ? new HttpHeaders(options.headers) : undefined,
      context: options.context,
    });
  }

  buscarTodosLosValoresEnumAccessTokenType(options: { headers?: Record<string, string>; context?: HttpContext } = {}): Observable<string[]> {
    return this.http.request<string[]>('GET', `${this.enumerationUrl}/BuscarTodosLosValores_EnumAccessTokenType`, {
      headers: options.headers ? new HttpHeaders(options.headers) : undefined,
      context: options.context,
    });
  }
}
