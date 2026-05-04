import { Route } from '@angular/router';

import { validaAsignacionRolesGuard, validaEnrrolamientoGuard } from '@core/auth/auth.guard';
import { ValidaAsignaRolesComponent } from './valida-asigna-roles/valida-asigna-roles.component';
import { ValidaUsuarioNuevoComponent } from './valida-usuario-nuevo/valida-usuario-nuevo.component';

export const VALIDACIONES_ADMINISTRACION_ROUTE: Route[] = [
  {
    path: 'valida-usuario-nuevo',
    canMatch: [validaEnrrolamientoGuard],
    component: ValidaUsuarioNuevoComponent,
  },
  {
    path: 'valida-asigna-roles',
    canMatch: [validaAsignacionRolesGuard],
    component: ValidaAsignaRolesComponent,
  },
];
