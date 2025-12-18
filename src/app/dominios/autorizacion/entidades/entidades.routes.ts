import { Route } from '@angular/router';
import { UsuarioComponent } from './usuario/usuario.component';
import { ProveedorComponent } from './proveedor/proveedor.component';
import { EntidadComponent } from './entidad/entidad.component';
import { RolComponent } from './rol/rol.component';
import { AuthGuard } from '@core/guard/auth.guard';
import { IsAdminAnidGuard } from '@core/guard/is_admin_anid.guard';
import { IsAdminAnidOrEntidadGuard} from '@core/guard/is_admin_anid_or_entidad.guard';
import { IsAdminAnidOrEntidadOrUnidadGuard} from '@core/guard/is_admin_anid_or_entidad_or_unidad.guard';

export const ENTIDADES_ROUTE: Route[] = [
  {
    path: 'usuario',
    component: UsuarioComponent,
    canMatch: [IsAdminAnidOrEntidadOrUnidadGuard],
  },
  {
    path: 'proveedor',
    component: ProveedorComponent,
    canMatch: [IsAdminAnidGuard],
  },
  {
    path: 'entidad',
    component: EntidadComponent,
    canMatch: [IsAdminAnidOrEntidadGuard],
  },
  {
    path: 'rol',
    component: RolComponent,
    canMatch: [IsAdminAnidGuard],
  },
];