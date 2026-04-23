import { Route } from "@angular/router";
import { SigninComponent } from "./signin/signin.component";
import { SignupComponent } from "./signup/signup.component";
import { Page404Component } from "./page404/page404.component";
import { Page500Component } from "./page500/page500.component";
import { ForgotComponent } from "./forgot/forgot.component";
import { ResetComponent } from "./reset/reset.component";
import { MiPerfilComponent } from "./mi-perfil/mi-perfil.component";
import { LogoutComponent } from "./logout/logout.component";
import { CallbackClaveUnicaComponent } from "./callback-clave-unica/callback-clave-unica.component";
import { UnauthorizedComponent } from "./unauthorized/unauthorized.component";
import { SeleccionaOrganizacionComponent } from "./selecciona-organizacion/selecciona-organizacion.component";
import { ConfirmEmailComponent } from "./confirm-email/confirm-email.component";
import { authenticatedGuard, guestGuard, pendingOrganizationGuard } from "@core/auth/auth.guard";
export const AUTH_ROUTE: Route[] = [
  {
    path: '',
    redirectTo: 'signin',
    pathMatch: 'full',
  },
  {
    path: 'mi-perfil',
    component: MiPerfilComponent,
    canActivate: [authenticatedGuard],
  },
  {
    path: 'signin',
    component: SigninComponent,
    canActivate: [guestGuard],
  },
  {
    path: 'selecciona-organizacion',
    component: SeleccionaOrganizacionComponent,
    canActivate: [pendingOrganizationGuard],
  },
  {
    path: 'selecciona-entidad',
    redirectTo: 'selecciona-organizacion',
    pathMatch: 'full',
  },
  {
    path: 'signup',
    component: SignupComponent,
  },
  {
    path: 'confirm-email',
    component: ConfirmEmailComponent,
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
  {
    path: 'logout',
    component: LogoutComponent,
  },
  {
    path: 'callback-clave-unica',
    component: CallbackClaveUnicaComponent,
  },
  {
    path: 'unauthorized',
    component: UnauthorizedComponent,
  }
];
