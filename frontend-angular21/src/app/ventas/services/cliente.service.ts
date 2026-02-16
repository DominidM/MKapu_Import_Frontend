import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../enviroments/enviroment';
import { ClienteBusquedaResponse } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private apiUrl = `${environment.apiUrl}/sales`;

  constructor(private http: HttpClient) {}

  buscarCliente(documento: string, tipoComprobante: number): Observable<ClienteBusquedaResponse> {
    console.log('Buscando cliente:', {
      url: `${this.apiUrl}/customers/document/${documento}`,
      documento: documento
    });

    return this.http.get<ClienteBusquedaResponse>(`${this.apiUrl}/customers/document/${documento}`);
  }

  obtenerClientePorId(customerId: string): Observable<ClienteBusquedaResponse> {
    return this.http.get<ClienteBusquedaResponse>(`${this.apiUrl}/customers/${customerId}`);
  }

  listarClientes(page: number = 1, limit: number = 10): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<any>(`${this.apiUrl}/customers`, { params });
  }
}
