import { HttpInterceptorFn, HttpErrorResponse, HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '@core/service/auth.service';
import { catchError, switchMap, throwError, Observable } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error) => {
      // Si es un 401 y no es la petición de refresco misma, intentamos refrescar.
      if (error instanceof HttpErrorResponse && error.status === 401 && !req.url.includes('refreshtoken')) {
        return authService.refreshToken().pipe(
          switchMap(() => {
            // Reintentamos la petición original. El navegador adjuntará las nuevas cookies.
            return next(req);
          }),
          catchError((errRefresh) => {
            // Si el refresh falla, redirigimos al login
            console.log("Refresh token failed in interceptor, logging out.", errRefresh);
            //authService.logout();
            return throwError(() => errRefresh);
          })
        );
      } else {
        return throwError(() => error);
      }
    })
  );
};
