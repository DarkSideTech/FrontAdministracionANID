import { Route } from '@angular/router';

import { OrganizacionComponent } from './organizacion/organizacion.component';
import { ProcesoComponent } from './proceso/proceso.component';
import { ProveedorComponent } from './proveedor/proveedor.component';
import { RolComponent } from './rol/rol.component';
import { UnidadOrganizacionalComponent } from './unidadorganizacional/unidadorganizacional.component';
import { UsuarioComponent } from './usuario/usuario.component';

export const ENTIDADES_ADMINISTRACION_ROUTE: Route[] = [
  {
    path: 'usuario',
    component: UsuarioComponent,
  },
  {
    path: 'rol',
    component: RolComponent,
  },
  {
    path: 'organizacion',
    component: OrganizacionComponent,
  },
  {
    path: 'proceso',
    component: ProcesoComponent,
  },
  {
    path: 'unidadorganizacional',
    component: UnidadOrganizacionalComponent,
  },
  {
    path: 'proveedor',
    component: ProveedorComponent,
  },
];
