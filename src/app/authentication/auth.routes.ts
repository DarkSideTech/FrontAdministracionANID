import { Route } from "@angular/router";
import { SigninComponent } from "./signin/signin.component";
import { SignupComponent } from "./signup/signup.component";
import { Page404Component } from "./page404/page404.component";
import { Page500Component } from "./page500/page500.component";
import { ForgotComponent } from "./forgot/forgot.component";
import { ResetComponent } from "./reset/reset.component";
import { SeleccionaEntidadComponent } from "./selecciona-entidad/selecciona-entidad.component";
import { MiPerfilComponent } from "./mi-perfil/mi-perfil.component";
import { isAuthenticatedGuard } from "@core/guard/is-authenticated.guard";
export const AUTH_ROUTE: Route[] = [
  {
    path: '',
    redirectTo: 'signin',
    pathMatch: 'full',
  },
  {
    path: 'mi-perfil',
    component: MiPerfilComponent,
    //canMatch: [isAuthenticatedGuard],
  },
  {
    path: 'signin',
    component: SigninComponent,
  },
  {
    path: 'selecciona-entidad',
    component: SeleccionaEntidadComponent,
    //canActivate: [isAuthenticatedGuard],
  },
  {
    path: 'signup',
    component: SignupComponent,
  },
  {
    path: 'forgot',
    component: ForgotComponent,
  },
  {
    path: 'reset',
    component: ResetComponent,
  },
  {
    path: 'page404',
    component: Page404Component,
  },
  {
    path: 'page500',
    component: Page500Component,
  },
];
