import { inject } from "@angular/core";
import { CanMatchFn, Route, UrlSegment } from "@angular/router";
import { AuthService } from "@core/service/auth.service";

export const IsAdminEntidadOrUnidadGuard: CanMatchFn = (
    route: Route, 
    segments: UrlSegment[]
) => {

    const authService = inject(AuthService);

    const currentUser = authService.currentUserValue;

    const isAdminEntidad = (currentUser.Token === 'admin-entidad-token');
    const isAdminUnidad = (currentUser.Token === 'admin-unidad-token');

  return isAdminEntidad || isAdminUnidad;
}