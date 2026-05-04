import { Route } from '@angular/router';

import { authenticatedMatchGuard, validaEnrrolamientoGuard } from '@core/auth/auth.guard';

export const ADMINISTRACION_ROUTE: Route[] = [
  {
    path: 'entidades',
    canMatch: [authenticatedMatchGuard],
    loadChildren: () =>
      import('./entidades/entidades.routes').then(
        (m) => m.ENTIDADES_ADMINISTRACION_ROUTE,
      ),
  },
  {
    path: 'asignaciones',
    canMatch: [authenticatedMatchGuard],
    loadChildren: () =>
      import('./asignaciones/asignaciones.routes').then(
        (m) => m.ASIGNACIONES_ADMINISTRACION_ROUTE,
      ),
  },
  {
    path: 'validaciones',
    canMatch: [validaEnrrolamientoGuard],
    loadChildren: () =>
      import('./validaciones/validaciones.routes').then(
        (m) => m.VALIDACIONES_ADMINISTRACION_ROUTE,
      ),
  },
];
