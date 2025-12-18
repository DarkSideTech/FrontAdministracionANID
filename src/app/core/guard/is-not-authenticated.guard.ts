import { inject } from "@angular/core";
import { CanMatchFn, Route, UrlSegment } from "@angular/router";
import { AuthService } from "@core/service/auth.service";

export const IsNotAuthenticatedGuard: CanMatchFn = (
    route: Route, 
    segments: UrlSegment[]
) => {

    const authService = inject(AuthService);

    const currentUser = authService.currentUserValue;

    if (!currentUser) {
        return false;
    }

  return true;
}