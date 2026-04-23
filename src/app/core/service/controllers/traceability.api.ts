import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpContext, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '@core/config/api-base-url.token';

@Injectable({ providedIn: 'root' })
export class TraceabilityApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL).replace(/\/+$/, '');
  private readonly traceabilityUrl = `${this.baseUrl}/api/traceability`;

  getEntities(options: { headers?: Record<string, string>; context?: HttpContext } = {}): Observable<unknown> {
    return this.http.request<unknown>('GET', `${this.traceabilityUrl}/entidades`, {
      headers: options.headers ? new HttpHeaders(options.headers) : undefined,
      context: options.context,
    });
  }

  getFilterOptions(options: {
    body?: unknown;
    headers?: Record<string, string>;
    context?: HttpContext;
  } = {}): Observable<unknown> {
    return this.http.request<unknown>('POST', `${this.traceabilityUrl}/filtros`, {
      body: options.body,
      headers: options.headers ? new HttpHeaders(options.headers) : undefined,
      context: options.context,
    });
  }

  search(options: {
    body?: unknown;
    headers?: Record<string, string>;
    context?: HttpContext;
  } = {}): Observable<unknown> {
    return this.http.request<unknown>('POST', `${this.traceabilityUrl}/buscar`, {
      body: options.body,
      headers: options.headers ? new HttpHeaders(options.headers) : undefined,
      context: options.context,
    });
  }

  getAggregateTimeline(options: {
    aggregateId: string;
    entityKey?: string | null;
    fromUtc?: string | null;
    toUtc?: string | null;
    headers?: Record<string, string>;
    context?: HttpContext;
  }): Observable<unknown> {
    let params = new HttpParams();

    if (options.entityKey?.trim()) {
      params = params.set('entityKey', options.entityKey.trim());
    }

    if (options.fromUtc?.trim()) {
      params = params.set('fromUtc', options.fromUtc.trim());
    }

    if (options.toUtc?.trim()) {
      params = params.set('toUtc', options.toUtc.trim());
    }

    return this.http.request<unknown>('GET', `${this.traceabilityUrl}/aggregate/${options.aggregateId}`, {
      params,
      headers: options.headers ? new HttpHeaders(options.headers) : undefined,
      context: options.context,
    });
  }

  getEvent(options: {
    id: string;
    headers?: Record<string, string>;
    context?: HttpContext;
  }): Observable<unknown> {
    return this.http.request<unknown>('GET', `${this.traceabilityUrl}/eventos/${options.id}`, {
      headers: options.headers ? new HttpHeaders(options.headers) : undefined,
      context: options.context,
    });
  }
}
