import { Route } from "@angular/router";
import { EstadisticasUsuariosComponent } from "./estadisticas-usuarios/estadisticas-usuarios.component";
import { TrazabilidadDashboardComponent } from "./trazabilidad-dashboard/trazabilidad-dashboard.component";
import { authenticatedGuard } from "@core/auth/auth.guard";
export const PANELES_ROUTE: Route[] = [
  {
    path: 'estadisticas-usuarios',
    component: EstadisticasUsuariosComponent,
    canActivate: [authenticatedGuard],
  },
  {
    path: 'trazabilidad',
    component: TrazabilidadDashboardComponent,
    canActivate: [authenticatedGuard],
  },
];
