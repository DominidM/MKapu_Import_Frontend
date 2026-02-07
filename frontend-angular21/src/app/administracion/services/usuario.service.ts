import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UsuarioInterfaceResponse, UsuarioResponse } from '../interfaces/usuario.interface';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../enviroments/enviroment';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  
  private api = environment.apiUrl;
  constructor(private http: HttpClient) {}

  getUsuarios(): Observable<UsuarioResponse> {
    return this.http.get<UsuarioResponse>(`${this.api}/admin/users`);
  }
}
