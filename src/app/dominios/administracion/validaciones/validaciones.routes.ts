import { Route } from '@angular/router';

import { validaEnrrolamientoGuard } from '@core/auth/auth.guard';
import { ValidaUsuarioNuevoComponent } from './valida-usuario-nuevo/valida-usuario-nuevo.component';

export const VALIDACIONES_ADMINISTRACION_ROUTE: Route[] = [
  {
    path: 'valida-usuario-nuevo',
    canMatch: [validaEnrrolamientoGuard],
    component: ValidaUsuarioNuevoComponent,
  },
];
