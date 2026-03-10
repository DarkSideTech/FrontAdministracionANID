import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  UntypedFormGroup,
  UntypedFormBuilder,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';

import {
  NgbNav,
  NgbNavItem,
  NgbNavLink,
  NgbNavContent,
  NgbNavOutlet
} from '@ng-bootstrap/ng-bootstrap';

import { FeatherModule } from 'angular-feather';
import { RouterModule } from '@angular/router';
import { AuthService } from '@core';
import { Login } from '@core/models/accountController';
import { environment } from 'environments/environment';
import { nanoid } from 'nanoid';

@Component({
    selector: 'app-signin',
    templateUrl: './signin.component.html',
    styleUrls: ['./signin.component.scss'],
    imports: [
        FormsModule,
        ReactiveFormsModule,
        RouterModule,
        FeatherModule,
        NgbNav,
        NgbNavItem,
        NgbNavLink,
        NgbNavContent,
        NgbNavOutlet
    ]
})
export class SigninComponent implements OnInit {

  /** PARAMETROS CLAVE UNICA **/
  clientId = environment.clientIdClaveUnica;
  redirectUri = environment.redirecUriClaveUnica;
  claveUnicaUrl = environment.claveUnicaUrl;

  /** FORMULARIO CLAVE ÚNICA **/
  loginForm!: UntypedFormGroup;

  /** FORMULARIO EXTRANJERO **/
  foreignForm!: UntypedFormGroup;

  submitted = false;
  error: string | null = null;
  active: 'claveunica' | 'extranjero' = 'claveunica';
  login: Login = new Login();

  constructor(
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      username: ['administrador@security.com', [Validators.required, Validators.email]],
      password: ['Changeme123#', Validators.required],
      remember: [false],
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;
    this.error = null;

    if (this.loginForm.invalid) {
      this.error = 'Usuario o contraseña incorrectos';
      return;
    }

    this.login.email = this.f['username'].value;
    this.login.password = this.f['password'].value;

    this.authService
      .login({ email: this.login.email, password: this.login.password })
        .subscribe({
                next: (data) => {
                  console.log('Login response data:', data);
                  if (this.authService.isAuthenticated()) {
                    this.router.navigate(['/authentication/selecciona-entidad']);
                  }
                },
                error: (error) => {
                  this.error = error;
                  console.error('There was an error!', error);
                }
              });
  }

  goClaveUnica(): void {
    const encodedUrl = encodeURIComponent(this.redirectUri);
    const state = nanoid();

    const params = `client_id=${this.clientId}&response_type=code&scope=openid run name&redirect_uri=${encodedUrl}&state=${state}`;
    window.location.href =  this.claveUnicaUrl + params;
  }

  selectTab(tab: 'claveunica' | 'extranjero') {
    this.active = tab;
    this.error = null;
  }
}
