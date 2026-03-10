import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router, RouterModule } from '@angular/router';
import { LoginClaveUnicaInterface } from '@core/models/login-clave-unica.interface';
import { AuthService } from '@core/service/auth.service';
import { environment } from 'environments/environment';

@Component({
  selector: 'app-callback-clave-unica',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './callback-clave-unica.component.html',
  styleUrl: './callback-clave-unica.component.scss',
})
export default class CallbackClaveUnicaComponent implements OnInit{

  private activateRoute  = inject(ActivatedRoute);
  private authService    = inject(AuthService);
  private router         = inject( Router );

  clientId       = environment.clientIdClaveUnica;
  redirectUri    = environment.redirecUriClaveUnica;
  claveUnicaUrl = environment.claveUnicaUrl;
  code:  string  = '';
  state: string  = '';

  ngOnInit(): void {
    this.activateRoute.queryParams.subscribe( (params: Params)  =>{
        if( params['code'] && params['state']){

          this.code  = params['code'];
          this.state = params['state'];
          
          this.loginClaveUnica();
          
        }else{

          this.router.navigateByUrl("login");
        }
    });
  }

  loginClaveUnica(){
    
    const loginClaveUnicaInterface :LoginClaveUnicaInterface = {
      clientId : this.clientId,
      redirectUri: encodeURIComponent(this.redirectUri),
      code: this.code,
      state: this.state,
    }

    this.authService.loginClaveUnica(loginClaveUnicaInterface)
    .subscribe({
      next: (response) => {
        console.log(response);
        const url = this.claveUnicaUrl + 'api/v1/accounts/app/logout?redirect='+encodeURIComponent( environment.uriLogoutClaveUnica); 
        window.location.href = url;
      },
      error: (error) =>{
        console.log(error);
        const url = this.claveUnicaUrl + 'api/v1/accounts/app/logout?redirect='+ encodeURIComponent(environment.uriLogoutClaveUnica); 
        window.location.href = url;
      },
    });
  }
}