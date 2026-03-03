import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from 'environments/environment';
import { ProfileModel } from '@core/models/profileModel';
import { User } from '@core/models/user';
import { DataRequest } from '@core/models/dataRequest';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  apiUrl: string = environment.apiUrl;

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

  checkAuthStatus(): Observable<boolean> | null {
    return null;
  }

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
   * Proceso de refresco de tokens
   */
  refreshToken(): Observable<DataRequest> {
    const refreshToken = this.#refreshToken();
    
    return this.http.post<DataRequest>(`${this.apiUrl}/refresh`, { 
      refreshToken: refreshToken 
    }).pipe(
      tap({
        next: (res) => this.setSession(res),
        error: () => this.logout() // Si falla el refresco, sesión expirada
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
    this.router.navigate(['/login']);
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

  get accessToken(): string | null {
    return this.#accessToken();
  }
}


// import { inject, Injectable } from '@angular/core';
// import { BehaviorSubject, catchError, finalize, lastValueFrom, Observable, of, tap, throwError } from 'rxjs';
// import { User } from '../models/user';
// import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
// import { DataRequest } from '@core/models/dataRequest';
// import { environment } from 'environments/environment';
// import { Router } from '@angular/router';
// import { CheckAuthStatusRequest } from '@core/models/CheckAuthStatusRequest';
// import { Login, LoginOrganizacion } from '@core/models/accountController';

// @Injectable({
//   providedIn: 'root',
// })
// export class AuthService {
//   private currentUserSubject: BehaviorSubject<User>;
//   public currentUser: Observable<User>;
  
//   apiUrl: string = environment.apiUrl;

//   private router = inject(Router);
//   private http = inject(HttpClient);
//   private isRefreshing = false;
//   private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  
//   dataRequest: DataRequest | null = null;
//   errorMessage: string | null = null;
//   user: User;

//   constructor() {
//     this.currentUserSubject = new BehaviorSubject<User>(
//       JSON.parse(localStorage.getItem('currentUser') || '{}')
//     );
//     this.currentUser = this.currentUserSubject.asObservable();
//   }

//   public get currentUserValue(): User {
//     return this.currentUserSubject.value;
//   }
  
//   login(credentials: Login) {
//     // Angular añadirá withCredentials debido a la configuración global en app.config.ts
    
//     //Solo para pruebas, forzamos el logout antes de login
//     //localStorage.removeItem('currentUser');
//     //this.currentUserSubject.next(this.currentUserValue);

//     console.log('Antes de hacer el post del login, credenciales:', credentials);
//     return this.http.post(`${this.apiUrl}/account/login`, credentials)
//     .pipe(
//       tap(response => {
//         this.dataRequest = response as DataRequest;
//         console.log('Response desde el servicio de login:', response);

//         if (this.dataRequest == null || this.dataRequest.Result == null || this.dataRequest.Result == false) {
//           console.log('Respuesta de la API (error):', this.dataRequest);
//           if (this.dataRequest != null) 
//           {
//             return this.error(JSON.stringify(this.dataRequest));
//           } else {
//             return this.error('Username or password is incorrect');
//           }
//         } else {
//           localStorage.setItem("currentUser", this.dataRequest.Data);
//           this.user = this.dataRequest.Data ? JSON.parse(this.dataRequest.Data) : null;
//           this.currentUserSubject.next(this.user);
//           console.log("Login successful, cookies are set by backend.")
//           return this.ok({
//             Id: this.user.Id,
//             UserName: this.user.UserName,
//             NombreADesplegar: this.user.NombreADesplegar,
//             CodigoOrganizacion: this.user.CodigoOrganizacion,
//             NombreOrganizacion: this.user.NombreOrganizacion,
//             CodigoUnidadOrganizacional: this.user.CodigoUnidadOrganizacional,
//             NombreUnidadOrganizacional: this.user.NombreUnidadOrganizacional,
//             Token: this.user.Token
//           });
//         }
//       })
//     );
//   }

// loginOrganizacion(credentials: LoginOrganizacion){
//     // Angular añadirá withCredentials debido a la configuración global en app.config.ts
//     console.log('Antes de hacer el post del login, credenciales:', credentials);
//     return this.http.post(`${this.apiUrl}/account/loginOrganizacion`, credentials)
//     .pipe(
//       tap(response => {
//         this.dataRequest = response as DataRequest;

//         if (this.dataRequest == null || this.dataRequest.Result == null || this.dataRequest.Result == false) {
//           console.log('Respuesta de la API (error):', this.dataRequest);
//           if (this.dataRequest != null) 
//           {
//             return this.error(JSON.stringify(this.dataRequest));
//           } else {
//             return this.error('Username or password is incorrect');
//           }
//         } else {
//           localStorage.setItem("currentUser", this.dataRequest.Data);
//           this.user = this.dataRequest.Data ? JSON.parse(this.dataRequest.Data) : null;
//           this.currentUserSubject.next(this.user);
//           console.log("Login Organzacion successfull, cookies are set by backend.")
//           return this.ok({
//             Id: this.user.Id,
//             UserName: this.user.UserName,
//             NombreADesplegar: this.user.NombreADesplegar,
//             CodigoOrganizacion: this.user.CodigoOrganizacion,
//             NombreOrganizacion: this.user.NombreOrganizacion,
//             CodigoUnidadOrganizacional: this.user.CodigoUnidadOrganizacional,
//             NombreUnidadOrganizacional: this.user.NombreUnidadOrganizacional,
//             Token: this.user.Token
//           });
//         }
//       })
//     );
//   }

//   refreshToken() {
//     const refreshToken = localStorage.getItem('refresh_token');

//     return this.http.post<{Token: string, RefreshToken: string}>(
//       `${this.apiUrl}/account/refreshtoken`,
//       { refreshToken }
//     ).pipe(
//       tap((response) => {
//         console.log('Refresh token response:', JSON.stringify(response));
//         localStorage.setItem('access_token', response.Token);
//         localStorage.setItem('refresh_token', response.RefreshToken);
//       }),
//       catchError((error) => {
//         console.error('Refresh token failed:', error);
//         this.logout();
//         return throwError(() => error);
//       })
//     );
//   }

//   refreshTokenOld(): Observable<any> {
//     if (this.isRefreshing) {
//       return this.refreshTokenSubject.asObservable();
//     }
      
//     this.isRefreshing = true;
//     this.refreshTokenSubject.next(null);

//     return this.http.post(`${this.apiUrl}/account/refreshtoken`, {})
//       .pipe(
//         tap(response => {
//           this.dataRequest = response as DataRequest;
//           if (this.dataRequest == null || this.dataRequest.Result == null || this.dataRequest.Result == false) {
//             console.log('Respuesta de la API (error):', this.dataRequest);
//             if (this.dataRequest != null) 
//             {
//               return this.error("Respuesta de la API (error): " + JSON.stringify(this.dataRequest));
//             } else {
//               return this.error('Refresh token failed');
//             }
//           } else {
//             this.isRefreshing = false;
//             this.refreshTokenSubject.next("refresh success");
//             localStorage.setItem("currentUser", this.dataRequest.Data);
//             this.user = this.dataRequest.Data ? JSON.parse(this.dataRequest.Data) : null;
//             this.currentUserSubject.next(this.user);
//             console.log("Login successful, cookies are set by backend., response:", JSON.stringify(response));
//             return this.ok({
//               Id: this.user.Id,
//               UserName: this.user.UserName,
//               NombreADesplegar: this.user.NombreADesplegar,
//               CodigoOrganizacion: this.user.CodigoOrganizacion,
//               NombreOrganizacion: this.user.NombreOrganizacion,
//               CodigoUnidadOrganizacional: this.user.CodigoUnidadOrganizacional,
//               NombreUnidadOrganizacional: this.user.NombreUnidadOrganizacional,
//               Token: this.user.Token
//             });
//           }
//         }),
//         catchError((error) => {
//           this.isRefreshing = false;
//           this.refreshTokenSubject.next(null);
//           console.log("Refresh token failed, logging out.");
//           //this.logout();
//           return throwError(() => error);
//         }),
//         finalize(() => this.isRefreshing = false)
//       );
//   }

//   ok(body?: {
//     Id: string;
//     UserName: string;
//     NombreADesplegar: string;
//     CodigoOrganizacion: string;
//     NombreOrganizacion: string;
//     CodigoUnidadOrganizacional: string;
//     NombreUnidadOrganizacional: string;
//     Token: string;
//   }) {
//     return of(new HttpResponse({ status: 200, body }));
//   }

//   error(message: string) {
//     return throwError(() => new Error(message));
//   }

//   logout(): void {
//     this.http.post(`${this.apiUrl}/account/logout`, {}).subscribe({
//         next: () => {
//             console.log("Logged out successfully.");
//             localStorage.removeItem('currentUser');
//             localStorage.removeItem('access_token');
//             localStorage.removeItem('refresh_token');
//             localStorage.clear();
//             this.currentUserSubject.next(this.currentUserValue);
//             this.router.navigate(['/authentication/signin']);
//         },
//         error: () => this.router.navigate(['/authentication/signin'])
//     });

//   }

//   checkAuthStatus(): Observable<boolean> | null {
//     console.log("Checking session validity...: " + `${this.apiUrl}/account/validarSesion`);
//     this.http.get(`${this.apiUrl}/account/validarSesion`, {}).subscribe({
//       next: (request)=> {
//           console.log("Session is valid:", request);
//           const checkAuthStatusRequest = request as CheckAuthStatusRequest;
//           console.log(checkAuthStatusRequest.message);
//           return checkAuthStatusRequest.isAuthenticated;
//       },
//       error: () => {
//         console.log("Error to validate session.");
//         return false;
//       }
//     });
//     return null
//   }

//   // checkAuthStatus(){
//   //   console.log("Ejecutando checkAuthStatus en: " + `${this.apiUrl}/account/validarSesion`);
//   //   this.http.post(`${this.apiUrl}/account/validarSesion`, {})
//   //   .pipe(
//   //     tap(request => {
//   //       console.log("TAP Session is valid:", JSON.stringify(request));
//   //         const checkAuthStatusRequest = request as CheckAuthStatusRequest;
//   //         console.log(" estamos en el TAP - checkAuthStatusRequest:", JSON.stringify(checkAuthStatusRequest));
//   //         if (checkAuthStatusRequest.isAuthenticated == null || checkAuthStatusRequest.isAuthenticated == false) {
//   //           console.log("Session is not valid, logging out.");
//   //           return false;
//   //         }
//   //         return true;
//   //     }),
//   //     catchError((error) => {
//   //       console.log("catch error Error to validate session:", error);
//   //       return throwError(() => error);
//   //     }),
//   //     finalize(() => { 
//   //       console.log("finalize checkAuthStatus");
//   //       return false;
//   //     })
//   //   );
//   // }

//   // checkAuthStatus(): Observable<any> {
//   //   console.log("Ejecutando checkAuthStatus en: " + `${this.apiUrl}/account/validarSesion`);
//   //   return this.http.get(`${this.apiUrl}/account/validarSesion`, {});
//     // .pipe(
//     //   tap(request => {
//     //     console.log("TAP Session is valid:", JSON.stringify(request));
//     //       const checkAuthStatusRequest = request as CheckAuthStatusRequest;
//     //       console.log(" estamos en el TAP - checkAuthStatusRequest:", JSON.stringify(checkAuthStatusRequest));
//     //       if (checkAuthStatusRequest.isAuthenticated == null || checkAuthStatusRequest.isAuthenticated == false) {
//     //         console.log("Session is not valid, logging out.");
//     //         return false;
//     //       }
//     //       return true;
//     //   }),
//     //   catchError((error) => {
//     //     console.log("catch error Error to validate session:", error);
//     //     return throwError(() => error);
//     //   }),
//     //   finalize(() => { 
//     //     console.log("finalize checkAuthStatus");
//     //     return false;
//     //   })
//     // );
//   //}


// }
