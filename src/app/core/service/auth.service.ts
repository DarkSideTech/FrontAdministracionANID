import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from 'environments/environment';
import { ProfileModel } from '@core/models/profileModel';
import { User } from '@core/models/user';
import { DataRequest } from '@core/models/dataRequest';
import { LoginClaveUnicaInterface } from '@core/models/login-clave-unica.interface';
import { LoginResponseInterface } from '@core/models/login-response.interface';
import { OrganizacionPorUsuarioDTO } from '@core/models/organizacion-por-usuario-dto';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private http = inject(HttpClient);
  private router = inject(Router);

  apiUrl: string = environment.apiUrl;
  baseUrl: string = environment.baseUrl;

  #accessToken = signal<string | null>(localStorage.getItem('token'));
  #refreshToken = signal<string | null>(localStorage.getItem('refreshToken'));

  isAuthenticated = computed(() => !!this.#accessToken());

  private currentUserSubject: BehaviorSubject<User>;
  public currentUser: Observable<User>;
  
  constructor() {
    this.currentUserSubject = new BehaviorSubject<User>(
      JSON.parse(localStorage.getItem('currentUser') || '{}')
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User {
    return this.currentUserSubject.value;
  }

  /**
  * Valida el estado de la sesion
  */
  checkAuthStatus(): Observable<boolean> | null {
    return this.isAuthenticated() ? this.http.get<boolean>(`${this.apiUrl}/account/validarSesion`) : null;
  }

  /**
  * Login con email y password para extranjeros
  */
  login(credentials: { email: string; password: string }): Observable<DataRequest> {
    return this.http.post<DataRequest>(`${this.apiUrl}/account/login`, credentials)
      .pipe(
        tap(res => {
          console.log('Login successful, tokens stored.', res);  
          this.setSession(res);
        }
        )
      );
  }

  /**
  * Login con Clave Única
  */
  loginClaveUnica(loginClaveUnicaInterface: LoginClaveUnicaInterface): Observable<LoginResponseInterface>{
    const url = `${this.baseUrl}/auth/loginClaveUnica`;
    return this.http.post<LoginResponseInterface>( url, loginClaveUnicaInterface);
  }

  /**
  * Envia el RefreshToken para generar un AccessToke y RefreshToken nuevo
  */
  refreshToken(): Observable<DataRequest> {
    const refreshToken = this.#refreshToken();
    
    return this.http.post<DataRequest>(`${this.apiUrl}/account/refreshtoken`, { 
      refreshToken: refreshToken 
    }).pipe(
      tap({
        next: (res) => 
          this.setSession(res),
        error: () => this.logout()
      })
    );
  }

  /**
   * Cierra la sesión y limpia el estado
   */
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    this.#accessToken.set(null);
    this.#refreshToken.set(null);
    this.router.navigate(['/authentication/signin']);
  }

  /**
   * Helpers de persistencia
   */
  private setSession(authResult: DataRequest): void {
    if (authResult && authResult.Result) {
      const profileModel: ProfileModel = JSON.parse(authResult.Data || '{}');
      localStorage.setItem('accessToken', profileModel.AccessToken);
      localStorage.setItem('refreshToken', profileModel.RefreshToken);
      
      this.#accessToken.set(profileModel.AccessToken);
      this.#refreshToken.set(profileModel.RefreshToken);
    } else {
      this.logout();
    }
  }

  /**
  * Obtiene el AccessToken actual
  */
  getAccessToken(): string | null {
    return this.#accessToken();
  }

  /**
  * Obtiene el AccessToken actual
  */
  getDatosUsuario(): Observable<OrganizacionPorUsuarioDTO[]> {
    return this.http.get<OrganizacionPorUsuarioDTO[]>(`${this.apiUrl}/ServicioDeDominio/BuscarOrganizacionesPor_Usuario`);
  }


}