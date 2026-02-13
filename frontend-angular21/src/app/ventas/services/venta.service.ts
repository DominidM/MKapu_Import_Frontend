import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../enviroments/enviroment';
import { RegistroVentaRequest, RegistroVentaResponse } from '../interfaces/venta.interface';

@Injectable({
  providedIn: 'root'
})
export class VentaService {
  private apiUrl = `${environment.apiUrl}/sales`;

  constructor(private http: HttpClient) {}

  registrarVenta(request: RegistroVentaRequest): Observable<RegistroVentaResponse> {
    console.log('Endpoint:', `${this.apiUrl}/receipts`);
    console.log('Request:', request);
    
    return this.http.post<RegistroVentaResponse>(`${this.apiUrl}/receipts`, request);
  }

  listarVentas(page: number = 1, limit: number = 10): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<any>(this.apiUrl, { params });
  }

  obtenerVentaPorId(ventaId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${ventaId}`);
  }

  anularVenta(ventaId: string, motivo: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${ventaId}/anular`, { motivo });
  }
}
