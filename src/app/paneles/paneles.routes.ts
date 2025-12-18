import { Route } from "@angular/router";
import { EstadisticasUsuariosComponent } from "./estadisticas-usuarios/estadisticas-usuarios.component";
export const PANELES_ROUTE: Route[] = [
  {
    path: 'estadisticas-usuarios',
    component: EstadisticasUsuariosComponent,
  },
];
