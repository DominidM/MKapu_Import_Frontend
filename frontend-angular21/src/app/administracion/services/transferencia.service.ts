import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from '../../../enviroments/enviroment';
import { TransferenciaInterfaceResponse, TransferenciaRequest } from '../interfaces/transferencia.interface';

@Injectable({
  providedIn: 'root',
})
export class TransferenciaService {

  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getTransferencias(): Observable<TransferenciaInterfaceResponse[]> {
    return this.http.get<TransferenciaInterfaceResponse[]>(`${this.api}/logistics/warehouse/transfer`);
  }

  postTransferencia(payload: TransferenciaRequest): Observable<TransferenciaInterfaceResponse> {
    return this.http.post<TransferenciaInterfaceResponse>(
      `${this.api}/logistics/warehouse/transfer/request`,
      payload,
    );
  }



}
