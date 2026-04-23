import { Route } from '@angular/router';
import { ValidaEnrrolamientoComponent } from './valida-enrrolamiento/valida-enrrolamiento.component';
import { ValidaAsignacionRolAPerfilEntidadComponent } from './valida-asignacion-rol-a-perfil-entidad/valida-asignacion-rol-a-perfil-entidad.component';

export const VALIDACIONES_ROUTE: Route[] = [
  {
    path: 'valida-enrrolamiento',
    component: ValidaEnrrolamientoComponent,
  },
  {
    path: 'valida-asignacion-rol-a-perfil-entidad',
    component: ValidaAsignacionRolAPerfilEntidadComponent,
  },
];
