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

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss'],
  standalone: true,
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
  ],
})
export class SigninComponent implements OnInit {

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

    this.foreignForm = this.formBuilder.group({
      passport: ['', Validators.required],
      country: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
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
      .login(this.login!)
      .subscribe({
        next: (res) => {
          if (res) {
            if (res) {
              const token = this.authService.currentUserValue.Token;
              console.log('Usuario despues de ir al servicio de login:', this.authService.currentUserValue);
              if (token) {
                this.router.navigate(['/authentication/selecciona-entidad']);
              }
            } else {
              this.error = 'Invalid Login';
            }
          } else {
            this.error = 'Invalid Login';
          }
        },
        error: (error) => {
          console.error(error);
          this.error = 'No se puede validar credenciales en este momento, consulte con algun administrador';
          this.submitted = false;
        },
      });
  }

  /*********************
   * FORM EXTRANJERO
   ********************/
  onForeignSubmit(): void {
    if (this.foreignForm.invalid) {
      this.foreignForm.markAllAsTouched();
      return;
    }

    console.log('Formulario Extranjero:', this.foreignForm.value);



    this.router.navigate(['/authentication/selecciona-entidad']);
  }

  /*********************
   * CLAVE ÚNICA (BOTÓN)
   ********************/
  goNextStep(): void {
    console.log('Clave Única pulsada');
    this.router.navigate(['/authentication/selecciona-entidad']);
  }

  selectTab(tab: 'claveunica' | 'extranjero') {
    this.active = tab;
    this.error = null;
  }
}
