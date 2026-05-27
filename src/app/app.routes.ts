import { Route } from '@angular/router';
import { MainLayoutComponent } from './layout/app-layout/main-layout/main-layout.component';
import { AuthLayoutComponent } from './layout/app-layout/auth-layout/auth-layout.component';
import { MiPerfilComponent } from './authentication/mi-perfil/mi-perfil.component';
import { authenticatedGuard } from '@core/auth/auth.guard';

export const APP_ROUTE: Route[] = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', redirectTo: '/authentication/signin', pathMatch: 'full' },
      {
        path: 'dominios',
        canActivate: [authenticatedGuard],
        loadChildren: () =>
          import('./dominios/dominios.routes').then((m) => m.DOMINIOS_ROUTE),
      },
      {
        path: 'paneles',
        canActivate: [authenticatedGuard],
        loadChildren: () =>
          import('./paneles/paneles.routes').then((m) => m.PANELES_ROUTE),
      },
      {
        path: 'procesos',
        canActivate: [authenticatedGuard],
        loadChildren: () =>
          import('./procesos/procesos.routes').then((m) => m.PROCESOS_ROUTE),
      },
      // 🔹 Nueva ruta para Mi Perfil
      {
        path: 'authentication/mi-perfil',
        component: MiPerfilComponent,
        canActivate: [authenticatedGuard],
      }
    ],
  },
  {
    path: 'authentication',
    component: AuthLayoutComponent,
    loadChildren: () =>
      import('./authentication/auth.routes').then((m) => m.AUTH_ROUTE),
  },
  {
    path: '**',
    redirectTo: '/authentication/signin',
  },
];
