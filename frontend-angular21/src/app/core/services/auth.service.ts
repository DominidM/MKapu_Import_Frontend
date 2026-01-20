import { Injectable } from '@angular/core';

interface UserSession {
  username: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private user: UserSession | null = null;

  constructor() {
    // ✅ Recupera sesión al recargar (F5)
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      this.user = JSON.parse(storedUser);
    }
  }

  login(username: string, password: string): boolean {

    if (username === 'admin' && password === 'admin') {
      this.setSession({ username, role: 'admin' });
      return true;
    }

    if (username === 'almacen' && password === 'almacen') {
      this.setSession({ username, role: 'almacen' });
      return true;
    }

    if (username === 'ventas' && password === 'ventas') {
      this.setSession({ username, role: 'ventas' });
      return true;
    }

    return false;
  }

  private setSession(user: UserSession): void {
    this.user = user;
    localStorage.setItem('user', JSON.stringify(user)); // ✅ GUARDA TODO
  }

  logout(): void {
    this.user = null;
    localStorage.removeItem('user');
  }

  getRole(): string | null {
    return this.user?.role || null;
  }

  getUsername(): string | null {
    return this.user?.username || null;
  }

  isLoggedIn(): boolean {
    return this.user !== null;
  }
}
