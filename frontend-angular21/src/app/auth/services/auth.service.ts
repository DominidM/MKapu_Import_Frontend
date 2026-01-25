import { Injectable } from '@angular/core';
import { environment } from '../../../enviroments/enviroment';
import { Observable, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AuthInterface, AuthInterfaceResponse } from '../interfaces/auth.interface';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  
  private api = environment.apiUrl;
  constructor(private http: HttpClient) {}

    // POST
  loginUser(data: AuthInterface): Observable<AuthInterfaceResponse> {
    return this.http.post<AuthInterfaceResponse>(`${this.api}/auth/auth/login`, data).pipe(
      tap((response) => {
        // Guardamos el token en el LocalStorage para usarlo después
        localStorage.setItem('token', response.token);
        // Opcional: Guardar datos del usuario
        localStorage.setItem('user', JSON.stringify(response.user));
      })
    );
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getRole(): string | null {
    const userStr = localStorage.getItem('user');

    if (!userStr) {
      return null;
    }

    const user = JSON.parse(userStr);
    return user.rol_nombre ?? null;
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

}
