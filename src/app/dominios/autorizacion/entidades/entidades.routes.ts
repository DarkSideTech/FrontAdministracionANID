import { Route } from '@angular/router';
import { UsuarioComponent } from './usuario/usuario.component';
import { EntidadComponent } from './entidad/entidad.component';
import { RolComponent } from './rol/rol.component';

export const ENTIDADES_ROUTE: Route[] = [
  {
    path: 'usuario',
    component: UsuarioComponent,
  },
  {
    path: 'entidad',
    component: EntidadComponent,
  },
  {
    path: 'rol',
    component: RolComponent,
  },
];
