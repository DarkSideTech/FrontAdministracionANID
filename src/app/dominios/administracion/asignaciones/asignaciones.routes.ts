import { Route } from '@angular/router';

import { AsignaRolProcesoAEntidadComponent } from './asigna-rol-proceso-a-entidad/asigna-rol-proceso-a-entidad.component';
import { UsuarioAUnidadOrganizacionalComponent } from './usuario-a-unidad-organizacional/usuario-a-unidad-organizacional.component';

export const ASIGNACIONES_ADMINISTRACION_ROUTE: Route[] = [
  {
    path: 'usuario-a-unidad-organizacional',
    component: UsuarioAUnidadOrganizacionalComponent,
  },
  {
    path: 'asigna-rol-proceso-a-entidad',
    component: AsignaRolProcesoAEntidadComponent,
  },
];
