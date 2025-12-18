import { Route } from '@angular/router';
import { AsignaRolAValidaAsignacionComponent } from './asigna-rol-a-valida-asignacion/asigna-rol-a-valida-asignacion.component';
import { AsignaRolAPerfilComponent } from './asigna-rol-a-perfil/asigna-rol-a-perfil.component';
import { AsignaPerfilAValidaEnrrolamientoComponent } from './asigna-perfil-a-valida-enrrolamiento/asigna-perfil-a-valida-enrrolamiento.component';
import { DependenciaEntidadComponent } from './dependencia-entidad/dependencia-entidad.component';
import { CreaPerfilUsuarioEntidadComponent } from './crea-perfil-usuario-entidad/crea-perfil-usuario-entidad.component';
import { AuthGuard } from '@core/guard/auth.guard';
import { IsAdminAnidGuard } from '@core/guard/is_admin_anid.guard';
import { IsAdminAnidOrEntidadOrUnidadGuard } from '@core/guard/is_admin_anid_or_entidad_or_unidad.guard';
import { IsAdminEntidadOrUnidadGuard } from '@core/guard/is_admin_entidad_or_unidad.guard';

export const ASIGNACIONES_ROUTE: Route[] = [
  {
    path: 'crea-perfil-usuario-entidad',
    component: CreaPerfilUsuarioEntidadComponent,
    canMatch: [IsAdminAnidOrEntidadOrUnidadGuard],
  },
  {
    path: 'asigna-rol-a-perfil',
    component: AsignaRolAPerfilComponent,
    canMatch: [IsAdminEntidadOrUnidadGuard],
  },
  {
    path: 'dependencia-entidad',
    component: DependenciaEntidadComponent,
    canActivate: [AuthGuard],
    canMatch: [IsAdminAnidGuard],
  },
];