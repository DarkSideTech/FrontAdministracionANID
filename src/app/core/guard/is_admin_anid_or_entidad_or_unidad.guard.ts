import { inject } from "@angular/core";
import { CanMatchFn, Route, UrlSegment } from "@angular/router";
import { AuthService } from "@core/service/auth.service";

export const IsAdminAnidOrEntidadOrUnidadGuard: CanMatchFn = (
    route: Route, 
    segments: UrlSegment[]
) => {

    const authService = inject(AuthService);

    const currentUser = authService.currentUserValue;

    const isAdminAnid = (currentUser.Token === 'admin-anid-token');
    const isAdminEntidad = (currentUser.Token === 'admin-entidad-token');
    const isAdminUnidad = (currentUser.Token === 'admin-unidad-token');

  return isAdminAnid || isAdminEntidad || isAdminUnidad;
}