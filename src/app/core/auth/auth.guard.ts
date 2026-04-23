import { CanActivateFn, CanMatchFn, Router } from '@angular/router';
import { inject } from '@angular/core';

import { EnumRolesBase } from '@core/enumerations/enum-roles';
import { AuthStore } from './auth-store.service';

export const guestGuard: CanActivateFn = () => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  if (authStore.hasOrganizationSession()) {
    return router.createUrlTree(['/paneles/estadisticas-usuarios']);
  }

  if (authStore.hasSession()) {
    return router.createUrlTree(['/authentication/selecciona-organizacion']);
  }

  return true;
};

export const pendingOrganizationGuard: CanActivateFn = () => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  if (authStore.hasOrganizationSession()) {
    return router.createUrlTree(['/paneles/estadisticas-usuarios']);
  }

  return authStore.hasSession() ? true : router.createUrlTree(['/authentication/signin']);
};

export const authenticatedGuard: CanActivateFn = () => {
  return resolveAuthenticatedNavigation(inject(AuthStore), inject(Router));
};

export const authenticatedMatchGuard: CanMatchFn = () => {
  return resolveAuthenticatedNavigation(inject(AuthStore), inject(Router));
};

export const adminAnidGuard: CanMatchFn = () => {
  return resolveRoleNavigation(inject(AuthStore), inject(Router), [EnumRolesBase.Administrador]);
};

export const adminAnidOrEntidadGuard: CanMatchFn = () => {
  return resolveRoleNavigation(inject(AuthStore), inject(Router), [
    EnumRolesBase.Administrador,
    EnumRolesBase.AdministradorEntidad,
  ]);
};

export const adminAnidOrEntidadOrUnidadGuard: CanMatchFn = () => {
  return resolveRoleNavigation(inject(AuthStore), inject(Router), [
    EnumRolesBase.Administrador,
    EnumRolesBase.AdministradorEntidad,
    EnumRolesBase.AdministradorUnidad,
  ]);
};

export const adminEntidadOrUnidadGuard: CanMatchFn = () => {
  return resolveRoleNavigation(inject(AuthStore), inject(Router), [
    EnumRolesBase.AdministradorEntidad,
    EnumRolesBase.AdministradorUnidad,
  ]);
};

export const validaAsignacionRolesGuard: CanMatchFn = () => {
  return resolveRoleNavigation(inject(AuthStore), inject(Router), [EnumRolesBase.ValidaAsignacionRoles]);
};

export const validaEnrrolamientoGuard: CanMatchFn = () => {
  return resolveRoleNavigation(inject(AuthStore), inject(Router), [EnumRolesBase.ValidaEnrrolamiento]);
};

function resolveAuthenticatedNavigation(authStore: AuthStore, router: Router) {
  if (authStore.hasOrganizationSession()) {
    return true;
  }

  if (authStore.hasSession()) {
    return router.createUrlTree(['/authentication/selecciona-organizacion']);
  }

  return router.createUrlTree(['/authentication/signin']);
}

function resolveRoleNavigation(
  authStore: AuthStore,
  router: Router,
  requiredRoles: string[],
) {
  const authenticatedNavigation = resolveAuthenticatedNavigation(authStore, router);
  if (authenticatedNavigation !== true) {
    return authenticatedNavigation;
  }

  const hasRequiredRole = requiredRoles.some((role) => authStore.hasRole(role));
  return hasRequiredRole ? true : router.createUrlTree(['/paneles/estadisticas-usuarios']);
}
