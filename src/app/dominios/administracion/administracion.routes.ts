import { Route } from '@angular/router';

import { authenticatedMatchGuard } from '@core/auth/auth.guard';

export const ADMINISTRACION_ROUTE: Route[] = [
  {
    path: 'entidades',
    canMatch: [authenticatedMatchGuard],
    loadChildren: () =>
      import('./entidades/entidades.routes').then(
        (m) => m.ENTIDADES_ADMINISTRACION_ROUTE,
      ),
  },
];
