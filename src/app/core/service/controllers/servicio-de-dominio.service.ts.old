import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { DataRequest } from '@core/models/dataRequest';
import { OrganizacionPorUsuario } from '@core/models/servicioDeDominioController';
import { environment } from 'environments/environment';
import { catchError, Observable, of, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ServicioDeDominioService {
  private http = inject(HttpClient);
  private apiUrl: string = environment.apiUrl;
  dataResponse: DataRequest | null = null;
  data: OrganizacionPorUsuario[] = [];
  errorMessage: string | null = null;
  
  constructor() { }

  buscarOrganizacionesPor_Id_Usuario(id_Usuario: string){
    let params = new HttpParams();

    params = params.append('id_Usuario', id_Usuario);

    return this.http.get<any>(`${this.apiUrl}/ServicioDeDominio/BuscarOrganizacionesPor_Id_Usuario`, { params });
  }



  // buscarOrganizacionesPor_Id_Usuario(id_Usuario: string) {
  //   let params = new HttpParams();

  //   params = params.append('id_Usuario', id_Usuario);

  //   this.http.get(`${this.apiUrl}/ServicioDeDominio/BuscarOrganizacionesPor_Id_Usuario`, { params }).subscribe({
  //     next: (request)=> {
  //         this.dataResponse = request as DataRequest;
          
  //         if (this.dataResponse == null) {
  //           console.log('Error Respuesta de la API:', this.dataResponse);
  //         } else {
  //           console.log('Respuesta de la API:', this.dataResponse);
  //           return this.dataResponse;
  //         }
  //         return [];
  //     },
  //     error: (error) => {
  //         console.error(error);
  //         this.error('Error al momento de buscar la informacion: ' + error);
  //     }
  //   }
  // );
  // return of([]);
  // }
  
  ok(body?: {
    OrganizacionesPorusUaro: OrganizacionPorUsuario[];
  }) {
    return of(new HttpResponse({ status: 200, body }));
  }

  error(message: string) {
    return throwError(() => new Error(message));
  }

}
