import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { OrganizacionPorUsuarioDTO } from '@core/models/organizacion-por-usuario-dto';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class ServiciosDeDominioService {

  private http = inject(HttpClient);

  apiUrl: string = environment.apiUrl;

  constructor() { }

  public buscarOrganizacionesPor_Id_Usuario(id_Usuario: string): Observable<OrganizacionPorUsuarioDTO[]> {
    return this.http.get<OrganizacionPorUsuarioDTO[]>(`${this.apiUrl}/ServicioDeDominioController/BuscarOrganizacionesPor_Id_Usuario/${id_Usuario}`);
  }
}
