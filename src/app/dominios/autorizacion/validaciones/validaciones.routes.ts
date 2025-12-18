import { Route } from '@angular/router';
import { ValidaEnrrolamientoComponent } from './valida-enrrolamiento/valida-enrrolamiento.component';
import { ValidaAsignacionRolAPerfilEntidadComponent } from './valida-asignacion-rol-a-perfil-entidad/valida-asignacion-rol-a-perfil-entidad.component';
import { IsAdminAnidGuard } from '@core/guard/is_admin_anid.guard';
import { IsAdminAnidOrEntidadGuard } from '@core/guard/is_admin_anid_or_entidad.guard';

export const VALIDACIONES_ROUTE: Route[] = [
  {
    path: 'valida-enrrolamiento',
    component: ValidaEnrrolamientoComponent,
    canActivate: [IsAdminAnidGuard],
  },
  {
    path: 'valida-asignacion-rol-a-perfil-entidad',
    component: ValidaAsignacionRolAPerfilEntidadComponent,
    canActivate: [IsAdminAnidOrEntidadGuard],
  },
];