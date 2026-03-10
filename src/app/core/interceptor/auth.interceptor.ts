import { HttpErrorResponse, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from "@angular/common/http";
import { inject } from "@angular/core";
import { AuthService } from "@core/service/auth.service";
import { BehaviorSubject, catchError, filter, switchMap, take, throwError } from "rxjs";

let isRefreshing = false;
const refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
    const authService = inject(AuthService);
    const token = authService.getAccessToken;

    let authReq = req;
    if (token) {
      authReq = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });
    }

    return next(authReq).pipe(
      catchError((error) => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          return handle401Error(authReq, next, authService);
        }
        return throwError(() => error);
      })
    );
};

function handle401Error(req: HttpRequest<unknown>, next: HttpHandlerFn, authService: AuthService) {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    return authService.refreshToken().pipe(
      switchMap((newToken: any) => {
        isRefreshing = false;
        refreshTokenSubject.next(newToken.accessToken);
        
        // Reintentar la petición original con el nuevo token
        return next(req.clone({
          setHeaders: { Authorization: `Bearer ${newToken.accessToken}` }
        }));
      }),
      catchError((err) => {
        isRefreshing = false;
        authService.logout(); // Si falla el refresco, cerrar sesión
        return throwError(() => err);
      })
    );
  } else {
    // Si ya se está refrescando, esperar a que el nuevo token esté listo
    return refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap((token) => next(req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      })))
    );
  }
}