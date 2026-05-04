import { Route } from '@angular/router';

export const DOMINIOS_ROUTE : Route[] = [
  {
    path: 'administracion',
    loadChildren: () =>
      import('./administracion/administracion.routes').then(
        (m) => m.ADMINISTRACION_ROUTE
      ),
  },
];

