import { Route } from '@angular/router';

import { OrganizacionComponent } from './organizacion/organizacion.component';
import { ProcesoComponent } from './proceso/proceso.component';
import { ProveedorComponent } from './proveedor/proveedor.component';
import { UnidadOrganizacionalComponent } from './unidadorganizacional/unidadorganizacional.component';

export const ENTIDADES_ADMINISTRACION_ROUTE: Route[] = [
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
