// src/app/ventas/services/clientes-ventas.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../enviroments/enviroment';
import { ClienteBusquedaResponse, ClienteErrorResponse } from '../interfaces/venta.interface';

@Injectable({
  providedIn: 'root'
})
export class ClientesVentasService {
  private readonly API_URL = `${environment.apiUrl}/sales/customers`;

  constructor(private http: HttpClient) {}

  buscarPorDocumento(numeroDocumento: string): Observable<ClienteBusquedaResponse> {
    return this.http.get<ClienteBusquedaResponse>(
      `${this.API_URL}/document/${numeroDocumento}`
    ).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ocurrió un error desconocido';

    if (error.status === 404) {
      const errorBody = error.error as ClienteErrorResponse;
      errorMessage = errorBody.message || 'Cliente no encontrado';
    } else if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = error.error?.message || `Error ${error.status}: ${error.statusText}`;
    }

    console.error('Error en ClientesVentasService:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
