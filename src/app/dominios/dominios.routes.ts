import { Route } from '@angular/router';
import { AuthGuard } from '@core/guard/auth.guard';
import { IsAdminAnidGuard } from '@core/guard/is_admin_anid.guard';

export const DOMINIOS_ROUTE : Route[] = [
  {
    path: 'autorizacion',
    loadChildren: () =>
      import('./autorizacion/autorizacion.routes').then(
        (m) => m.AUTORIZACION_ROUTE
      ),
    // canActivate: [AuthGuard],
  },
];

