import { inject } from "@angular/core";
import { CanMatchFn, Route, UrlSegment } from "@angular/router";
import { AuthService } from "@core/service/auth.service";

export const IsAdminAnidGuard: CanMatchFn = (
    route: Route, 
    segments: UrlSegment[]
) => {

    const authService = inject(AuthService);

    const currentUser = authService.currentUserValue;

    const isAdminAnid = (currentUser.Token === 'admin-anid-token');

  return isAdminAnid;
}