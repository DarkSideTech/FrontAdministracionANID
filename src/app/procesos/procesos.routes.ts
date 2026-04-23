import { Route } from '@angular/router';

import { authenticatedGuard } from '@core/auth/auth.guard';
import { ProcesoIframeComponent } from './proceso-iframe/proceso-iframe.component';

export const PROCESOS_ROUTE: Route[] = [
  {
    path: ':code',
    component: ProcesoIframeComponent,
    canActivate: [authenticatedGuard],
  },
];
