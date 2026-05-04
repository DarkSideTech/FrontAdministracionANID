import { Route } from '@angular/router';

import { adminAnidGuard } from '@core/auth/auth.guard';
import { AsignaUnidadOrganizacionalOrganizacionComponent } from './asigna-unidadorganizacional-organizacion/asigna-unidadorganizacional-organizacion.component';
import { AsignaRolProcesoAEntidadComponent } from './asigna-rol-proceso-a-entidad/asigna-rol-proceso-a-entidad.component';
import { UsuarioAUnidadOrganizacionalComponent } from './usuario-a-unidad-organizacional/usuario-a-unidad-organizacional.component';

export const ASIGNACIONES_ADMINISTRACION_ROUTE: Route[] = [
  {
    path: 'asigna-unidadorganizacional-organizacion',
    canMatch: [adminAnidGuard],
    component: AsignaUnidadOrganizacionalOrganizacionComponent,
  },
  {
    path: 'usuario-a-unidad-organizacional',
    component: UsuarioAUnidadOrganizacionalComponent,
  },
  {
    path: 'asigna-rol-proceso-a-entidad',
    component: AsignaRolProcesoAEntidadComponent,
  },
];
