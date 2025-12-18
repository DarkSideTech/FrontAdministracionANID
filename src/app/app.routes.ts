import { Route } from '@angular/router';
import { MainLayoutComponent } from './layout/app-layout/main-layout/main-layout.component';
import { AuthLayoutComponent } from './layout/app-layout/auth-layout/auth-layout.component';
import { Page404Component } from './authentication/page404/page404.component';
import { MiPerfilComponent } from './authentication/mi-perfil/mi-perfil.component';
import { isAuthenticatedGuard } from '@core/guard/is-authenticated.guard';

export const APP_ROUTE: Route[] = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', redirectTo: '/authentication/signin', pathMatch: 'full' },
      {
        path: 'dominios',
        canActivate: [isAuthenticatedGuard],
        loadChildren: () =>
          import('./dominios/dominios.routes').then((m) => m.DOMINIOS_ROUTE),
      },
      {
        path: 'paneles',
        canActivate: [isAuthenticatedGuard],
        loadChildren: () =>
          import('./paneles/paneles.routes').then((m) => m.PANELES_ROUTE),
      },
      // 🔹 Nueva ruta para Mi Perfil
      {
        path: 'authentication/mi-perfil',
        component: MiPerfilComponent,
        //canActivate: [isAuthenticatedGuard],
      }
    ],
  },
  {
    path: 'authentication',
    component: AuthLayoutComponent,
    loadChildren: () =>
      import('./authentication/auth.routes').then((m) => m.AUTH_ROUTE),
  }  
];
