import { Route } from '@angular/router';

export const AUTORIZACION_ROUTE : Route[] = [
  {
    path: 'asignaciones',
    loadChildren: () =>
      import('./asignaciones/asignaciones.routes').then(
        (m) => m.ASIGNACIONES_ROUTE
      ),
  },
  {
    path: 'paneles',
    loadChildren: () =>
      import('./paneles/paneles.routes').then(
        (m) => m.PANELES_ROUTE
      ),
  },
  {
    path: 'validaciones',
    loadChildren: () =>
      import('./validaciones/validaciones.routes').then(
        (m) => m.VALIDACIONES_ROUTE
      ),
  },
];

