import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private user: { username: string; role: string } | null = null;

  login(username: string, password: string): boolean {
    if (username === 'admin' && password === 'admin') {
      this.user = { username, role: 'admin' };
      return true;
    }

    if (username === 'almacen' && password === 'almacen') {
      this.user = { username, role: 'almacen' };
      return true;
    }

    if (username === 'ventas' && password === 'ventas') {
      this.user = { username, role: 'ventas' };
      return true;
    }

    return false;
  }

  logout(): void {
    this.user = null;
  }

  getRole(): string | null {
    return this.user?.role || null;
  }

  isLoggedIn(): boolean {
    return this.user !== null;
  }
}
