import { Route } from '@angular/router';
import { EstadisticasUsuariosComponent } from './estadisticas-usuarios/estadisticas-usuarios.component';
import { AuthGuard } from '@core/guard/auth.guard';

export const PANELES_ROUTE: Route[] = [
  {
    path: 'estadisticas-usuarios',
    component: EstadisticasUsuariosComponent,
    canActivate: [AuthGuard],
  },
];