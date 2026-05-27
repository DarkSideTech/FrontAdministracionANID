import { Route } from '@angular/router';
import { AsignaRolAPerfilComponent } from './asigna-rol-a-perfil/asigna-rol-a-perfil.component';
import { DependenciaEntidadComponent } from './dependencia-entidad/dependencia-entidad.component';
import { CreaPerfilUsuarioEntidadComponent } from './crea-perfil-usuario-entidad/crea-perfil-usuario-entidad.component';

export const ASIGNACIONES_ROUTE: Route[] = [
  {
    path: 'crea-perfil-usuario-entidad',
    component: CreaPerfilUsuarioEntidadComponent,
  },
  {
    path: 'asigna-rol-a-perfil',
    component: AsignaRolAPerfilComponent,
  },
  {
    path: 'dependencia-entidad',
    component: DependenciaEntidadComponent,
  },
];
