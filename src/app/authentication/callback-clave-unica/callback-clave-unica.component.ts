import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router, RouterModule } from '@angular/router';
import { LoginClaveUnicaInterface } from '@core/models/login-clave-unica.interface';
import { AccountAuthService } from '@core/auth/account-auth.service';
import { formatApiError } from '@core/service/api-error.util';
import {
  clearAuthProvider,
  consumeClaveUnicaState,
  setClaveUnicaAuthProvider,
} from '@core/auth/clave-unica-session';
import { environment } from 'environments/environment';

@Component({
  selector: 'app-callback-clave-unica',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './callback-clave-unica.component.html',
  styleUrl: './callback-clave-unica.component.scss',
})
export class CallbackClaveUnicaComponent implements OnInit{

  private activateRoute  = inject(ActivatedRoute);
  private accountAuthService = inject(AccountAuthService);
  private router         = inject( Router );

  clientId       = environment.clientIdClaveUnica;
  redirectUri    = environment.redirecUriClaveUnica;
  code:  string  = '';
  state: string  = '';

  ngOnInit(): void {
    this.activateRoute.queryParams.subscribe( (params: Params)  =>{
        if( params['code'] && params['state']){

          this.code  = params['code'];
          this.state = params['state'];
          
          this.loginClaveUnica();
          
        }else{

          void this.router.navigateByUrl('/authentication/signin');
        }
    });
  }

  loginClaveUnica(){
    const expectedState = consumeClaveUnicaState();
    if (!expectedState || expectedState !== this.state) {
      clearAuthProvider();
      void this.router.navigateByUrl('/authentication/signin');
      return;
    }
    
    const loginClaveUnicaInterface :LoginClaveUnicaInterface = {
      clientId : this.clientId,
      redirectUri: this.redirectUri,
      code: this.code,
      state: this.state,
    }

    this.accountAuthService.loginClaveUnica(loginClaveUnicaInterface)
    .subscribe({
      next: () => {
        setClaveUnicaAuthProvider();
        void this.router.navigateByUrl(this.accountAuthService.resolvePostLoginUrl());
      },
      error: (error: unknown) =>{
        console.error(formatApiError(error));
        clearAuthProvider();
        void this.router.navigateByUrl('/authentication/signin');
      },
    });
  }
}
