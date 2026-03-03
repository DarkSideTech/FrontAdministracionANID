import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { OrganizacionPorUsuarioDTO } from '@core/models/organizacion-por-usuario-dto';
import { environment } from 'environments/environment';
import { catchError, Observable, tap } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class ServiciosDeDominioService {

  private http = inject(HttpClient);

  apiUrl: string = environment.apiUrl;

  constructor() { }

  getBuscarOrganizacionesPor_Usuario(): Observable<OrganizacionPorUsuarioDTO[]> {
    return this.http.get<OrganizacionPorUsuarioDTO[]>(`${this.apiUrl}/ServicioDeDominio/BuscarOrganizacionesPor_Usuario`);
  }
}
