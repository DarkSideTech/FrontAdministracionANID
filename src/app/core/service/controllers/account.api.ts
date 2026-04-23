import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpContext, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '@core/config/api-base-url.token';
import type * as Models from '../openapi.models';

@Injectable({ providedIn: 'root' })
export class AccountApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL).replace(/\/+$/, '');
  private readonly accountUrl = `${this.baseUrl}/api/account`;

  register(options: { body?: Models.RegisterViewModel; headers?: Record<string, string>; context?: HttpContext } = {}): Observable<unknown> {
    return this.http.request<unknown>('POST', `${this.accountUrl}/register`, {
      body: options.body as Models.RegisterViewModel,
      headers: options.headers ? new HttpHeaders(options.headers) : undefined,
      context: options.context,
    });
  }

  login(options: { body?: Models.LoginViewModel; headers?: Record<string, string>; context?: HttpContext } = {}): Observable<unknown> {
    return this.http.request<unknown>('POST', `${this.accountUrl}/login`, {
      body: options.body as Models.LoginViewModel,
      headers: options.headers ? new HttpHeaders(options.headers) : undefined,
      context: options.context,
    });
  }

  loginClaveUnica(options: { body?: { clientId?: string; redirectUri?: string; code?: string; state?: string }; headers?: Record<string, string>; context?: HttpContext } = {}): Observable<unknown> {
    return this.http.request<unknown>('POST', `${this.accountUrl}/loginclaveunica`, {
      body: options.body,
      headers: options.headers ? new HttpHeaders(options.headers) : undefined,
      context: options.context,
    });
  }

  loginOrganizacion(options: { body?: Models.LoginOrganizacionViewModel; headers?: Record<string, string>; context?: HttpContext } = {}): Observable<unknown> {
    return this.http.request<unknown>('POST', `${this.accountUrl}/loginorganizacion`, {
      body: options.body as Models.LoginOrganizacionViewModel,
      headers: options.headers ? new HttpHeaders(options.headers) : undefined,
      context: options.context,
    });
  }

  cambioUnidadOrganizacionalEntidadRol(options: { body?: Models.CambioUnidadOrganizacionalEntidadRolViewModel; headers?: Record<string, string>; context?: HttpContext } = {}): Observable<unknown> {
    return this.http.request<unknown>('POST', `${this.accountUrl}/cambiounidadorganizacionalentidadrol`, {
      body: options.body as Models.CambioUnidadOrganizacionalEntidadRolViewModel,
      headers: options.headers ? new HttpHeaders(options.headers) : undefined,
      context: options.context,
    });
  }

  refreshToken(options: { body?: Models.RefreshTokenViewModel; headers?: Record<string, string>; context?: HttpContext } = {}): Observable<unknown> {
    return this.http.request<unknown>('POST', `${this.accountUrl}/refreshtoken`, {
      body: options.body as Models.RefreshTokenViewModel,
      headers: options.headers ? new HttpHeaders(options.headers) : undefined,
      context: options.context,
    });
  }

  logout(options: { headers?: Record<string, string>; context?: HttpContext } = {}): Observable<unknown> {
    return this.http.request<unknown>('POST', `${this.accountUrl}/logout`, {
      headers: options.headers ? new HttpHeaders(options.headers) : undefined,
      context: options.context,
    });
  }

  confirmEmail(options: { body?: Models.ConfirmEmailRequest; headers?: Record<string, string>; context?: HttpContext } = {}): Observable<unknown> {
    return this.http.request<unknown>('POST', `${this.accountUrl}/confirmemail`, {
      body: options.body as Models.ConfirmEmailRequest,
      headers: options.headers ? new HttpHeaders(options.headers) : undefined,
      context: options.context,
    });
  }

  resendConfirmationEmail(options: { body?: Models.ResendEmailConfirmationTokenRequest; headers?: Record<string, string>; context?: HttpContext } = {}): Observable<unknown> {
    return this.http.request<unknown>('POST', `${this.accountUrl}/resendconfirmationemail`, {
      body: options.body as Models.ResendEmailConfirmationTokenRequest,
      headers: options.headers ? new HttpHeaders(options.headers) : undefined,
      context: options.context,
    });
  }

  csrf(options: { headers?: Record<string, string>; context?: HttpContext } = {}): Observable<void> {
    return this.http.request<void>('GET', `${this.accountUrl}/csrf`, {
      headers: options.headers ? new HttpHeaders(options.headers) : undefined,
      context: options.context,
    });
  }

  miInformacion(options: { headers?: Record<string, string>; context?: HttpContext } = {}): Observable<unknown> {
    return this.http.request<unknown>('GET', `${this.accountUrl}/miinformacion`, {
      headers: options.headers ? new HttpHeaders(options.headers) : undefined,
      context: options.context,
    });
  }

  currentUser(options: { headers?: Record<string, string>; context?: HttpContext } = {}): Observable<unknown> {
    return this.http.request<unknown>('GET', `${this.accountUrl}/currentuser`, {
      headers: options.headers ? new HttpHeaders(options.headers) : undefined,
      context: options.context,
    });
  }

  modificaUsuario(options: { body?: Models.ModificaUsuarioViewModel; headers?: Record<string, string>; context?: HttpContext } = {}): Observable<unknown> {
    return this.http.request<unknown>('POST', `${this.accountUrl}/modificausuario`, {
      body: options.body as Models.ModificaUsuarioViewModel,
      headers: options.headers ? new HttpHeaders(options.headers) : undefined,
      context: options.context,
    });
  }

  modificaCorreoElectronico(options: { body?: Models.ModificaCorreoElectronicoViewModel; headers?: Record<string, string>; context?: HttpContext } = {}): Observable<unknown> {
    return this.http.request<unknown>('POST', `${this.accountUrl}/modificacorreoelectronico`, {
      body: options.body as Models.ModificaCorreoElectronicoViewModel,
      headers: options.headers ? new HttpHeaders(options.headers) : undefined,
      context: options.context,
    });
  }

  solicitaCambioClave(options: { body?: Models.SolicitaCambioClaveViewModel; headers?: Record<string, string>; context?: HttpContext } = {}): Observable<unknown> {
    return this.http.request<unknown>('POST', `${this.accountUrl}/solicitacambioclave`, {
      body: options.body as Models.SolicitaCambioClaveViewModel,
      headers: options.headers ? new HttpHeaders(options.headers) : undefined,
      context: options.context,
    });
  }

  reenviaCodigoCambioClave(options: { body?: Models.ReenviaCodigoCambioClaveViewModel; headers?: Record<string, string>; context?: HttpContext } = {}): Observable<unknown> {
    return this.http.request<unknown>('POST', `${this.accountUrl}/reenviacodigocambioclave`, {
      body: options.body as Models.ReenviaCodigoCambioClaveViewModel,
      headers: options.headers ? new HttpHeaders(options.headers) : undefined,
      context: options.context,
    });
  }

  confirmaCambioClave(options: { body?: Models.ConfirmaCambioClaveViewModel; headers?: Record<string, string>; context?: HttpContext } = {}): Observable<unknown> {
    return this.http.request<unknown>('POST', `${this.accountUrl}/confirmacambioclave`, {
      body: options.body as Models.ConfirmaCambioClaveViewModel,
      headers: options.headers ? new HttpHeaders(options.headers) : undefined,
      context: options.context,
    });
  }
}
