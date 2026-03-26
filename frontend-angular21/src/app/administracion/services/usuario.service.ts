import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../enviroments/enviroment';
import {
  AccountCredentialsResponse,
  ChangeCredentialsRequest,
  CuentaUsuarioRequest,
  CuentaUsuarioResponse,
  UsuarioInterfaceResponse,
  UsuarioRequest,
  UsuarioResponse,
  UsuarioStatusUpdateRequest,
  UsuarioUpdateRequest,
} from '../interfaces/usuario.interface';

export interface ConsultaDocumentoResponse {
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  nombreCompleto: string;
  tipoDocumento: string;
}

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private api = environment.apiUrl;
  private readonly salesUrl = `${environment.apiUrl}/sales`;

  constructor(private http: HttpClient) {}

  getUsuarios(page: number = 1, pageSize: number = 1000): Observable<UsuarioResponse> {
    const params = new HttpParams().set('page', page).set('pageSize', pageSize);
    return this.http.get<UsuarioResponse>(`${this.api}/admin/users`, { params });
  }

  getAllUsuarios(): Observable<UsuarioInterfaceResponse[]> {
    return this.http.get<UsuarioInterfaceResponse[]>(`${this.api}/admin/users/all`);
  }

  getUsuariosPorEstado(activo: boolean): Observable<UsuarioResponse> {
    const params = new HttpParams().set('activo', String(activo)).set('pageSize', '1000');
    return this.http.get<UsuarioResponse>(`${this.api}/admin/users`, { params });
  }

  getUsuarioById(id: number): Observable<UsuarioInterfaceResponse> {
    return this.http.get<UsuarioInterfaceResponse>(`${this.api}/admin/users/${id}`);
  }

  postUsuarios(body: UsuarioRequest): Observable<UsuarioResponse> {
    const headers = new HttpHeaders({ 'x-role': 'Administrador' });
    return this.http.post<UsuarioResponse>(`${this.api}/admin/users`, body, { headers });
  }

  postCuentaUsuario(body: CuentaUsuarioRequest): Observable<CuentaUsuarioResponse> {
    return this.http.post<CuentaUsuarioResponse>(`${this.api}/auth/create-account`, body);
  }

  updateUsuarioStatus(
    id: number,
    body: UsuarioStatusUpdateRequest,
  ): Observable<UsuarioInterfaceResponse> {
    return this.http.put<UsuarioInterfaceResponse>(`${this.api}/admin/users/${id}/status`, body);
  }

  updateUsuario(id: number, body: UsuarioUpdateRequest): Observable<UsuarioInterfaceResponse> {
    return this.http.put<UsuarioInterfaceResponse>(`${this.api}/admin/users/${id}`, body);
  }

  getAccountByUserId(id: number): Observable<AccountCredentialsResponse> {
    return this.http.get<AccountCredentialsResponse>(`${this.api}/admin/users/${id}/account`);
  }

  changeCredentials(
    id: number,
    body: ChangeCredentialsRequest,
  ): Observable<AccountCredentialsResponse> {
    return this.http.patch<AccountCredentialsResponse>(
      `${this.api}/admin/users/${id}/account/credentials`,
      body,
    );
  }

  consultarDocumentoIdentidad(numero: string): Observable<ConsultaDocumentoResponse> {
    return this.http
      .get<ConsultaDocumentoResponse>(`${this.salesUrl}/reniec/consultar/${numero}`)
      .pipe(
        catchError(() =>
          of({
            nombres: '',
            apellidoPaterno: '',
            apellidoMaterno: '',
            nombreCompleto: '',
            tipoDocumento: '',
          }),
        ),
      );
  }
}
