import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../enviroments/enviroment';
import {
  TransferenciaBulkStatusRequest,
  TransferenciaInterfaceResponse,
  TransferenciaRequest,
} from '../interfaces/transferencia.interface';

@Injectable({
  providedIn: 'root',
})
export class TransferenciaService {

  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getTransferencias(): Observable<TransferenciaInterfaceResponse[]> {
    return this.http.get<TransferenciaInterfaceResponse[]>(`${this.api}/logistics/warehouse/transfer`);
  }

  getTransferenciaById(id: number | string): Observable<TransferenciaInterfaceResponse> {
    return this.http.get<TransferenciaInterfaceResponse>(`${this.api}/logistics/warehouse/transfer/${id}`);
  }

  postTransferencia(payload: TransferenciaRequest): Observable<TransferenciaInterfaceResponse> {
    return this.http.post<TransferenciaInterfaceResponse>(
      `${this.api}/logistics/warehouse/transfer/request`,
      payload,
    );
  }

  patchTransferenciaStatusBulk(
    transferId: number | string,
    payload: TransferenciaBulkStatusRequest,
  ): Observable<unknown> {
    return this.http.patch<unknown>(
      `${this.api}/logistics/units/status/bulk/${transferId}`,
      payload,
    );
  }

}
