import { DOCUMENT } from '@angular/common';
import { HttpErrorResponse, HttpEvent, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, Observable, switchMap, throwError } from 'rxjs';

import { API_BASE_URL } from '@core/config/api-base-url.token';
import { BYPASS_AUTH, BYPASS_REFRESH } from '../http/http-context-tokens';
import { AccountAuthService } from './account-auth.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const document = inject(DOCUMENT);
  const accountAuthService = inject(AccountAuthService);
  const apiBaseUrl = normalizeBaseUrl(inject(API_BASE_URL));
  const isApiRequest = isApiUrl(request.url, apiBaseUrl);
  const bypassAuth = request.context.get(BYPASS_AUTH);
  const bypassRefresh = request.context.get(BYPASS_REFRESH);
  const authenticatedRequest =
    isApiRequest && !bypassAuth
      ? decorateRequest(request, document)
      : request;

  return executeRequest(authenticatedRequest, next, accountAuthService, isApiRequest && !bypassAuth, bypassRefresh).pipe(
    catchError((error: unknown) => {
      if (
        !isApiRequest ||
        !(error instanceof HttpErrorResponse) ||
        error.status !== 401 ||
        bypassRefresh
      ) {
        return throwError(() => error);
      }

      return accountAuthService.refreshSession().pipe(
        switchMap(() => {
          const retryRequest = decorateRequest(
            request.clone({
              context: request.context.set(BYPASS_REFRESH, true),
            }),
            document,
          );

          return next(retryRequest);
        }),
        catchError((refreshError) => {
          accountAuthService.forceLogout(true);
          return throwError(() => refreshError);
        }),
      );
    }),
  );
};

function executeRequest(
  request: Parameters<HttpInterceptorFn>[0],
  next: Parameters<HttpInterceptorFn>[1],
  accountAuthService: AccountAuthService,
  isApiRequest: boolean,
  bypassRefresh: boolean,
): Observable<HttpEvent<unknown>> {
  if (!isApiRequest || bypassRefresh) {
    return next(request);
  }

  const refreshState = accountAuthService.getAccessTokenRefreshState();
  if (refreshState === 'none') {
    return next(request);
  }

  if (refreshState === 'required') {
    return accountAuthService.refreshSession().pipe(
      switchMap(() => next(request)),
      catchError((refreshError) => {
        accountAuthService.forceLogout(true);
        return throwError(() => createRefreshSessionError(refreshError));
      }),
    );
  }

  return accountAuthService.refreshSession().pipe(
    switchMap(() => next(request)),
    catchError(() => next(request)),
  );
}

function createRefreshSessionError(cause: unknown): Error {
  const error = new Error('SESSION_REFRESH_FAILED');
  Object.defineProperty(error, 'cause', {
    value: cause,
    configurable: true,
    enumerable: false,
    writable: false,
  });
  return error;
}

function decorateRequest(request: Parameters<HttpInterceptorFn>[0], document: Document) {
  let nextRequest = request.clone({ withCredentials: true });

  if (isMutatingMethod(nextRequest.method)) {
    const csrfToken = readCookie(document, 'XSRF-TOKEN');
    if (csrfToken && !nextRequest.headers.has('X-CSRF-TOKEN')) {
      nextRequest = nextRequest.clone({
        setHeaders: {
          'X-CSRF-TOKEN': csrfToken,
        },
      });
    }
  }

  return nextRequest;
}

function readCookie(document: Document, name: string): string | null {
  const prefix = `${name}=`;
  const encoded = document.cookie
    .split(';')
    .map((chunk) => chunk.trim())
    .find((chunk) => chunk.startsWith(prefix));

  if (!encoded) {
    return null;
  }

  return decodeURIComponent(encoded.slice(prefix.length));
}

function isMutatingMethod(method: string): boolean {
  return ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase());
}

function normalizeBaseUrl(value: string): string {
  return value.replace(/\/+$/, '');
}

function isApiUrl(url: string, apiBaseUrl: string): boolean {
  const normalizedUrl = url.trim();

  if (!apiBaseUrl) {
    return normalizedUrl.startsWith('/api/');
  }

  return normalizedUrl.startsWith(`${apiBaseUrl}/api/`);
}
