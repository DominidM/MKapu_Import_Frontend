import { Injectable } from '@angular/core';
import { EmpleadosService, Empleado } from './empleados.service';

interface UserSession {
  username: string;
  role: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private user: UserSession | null = null;

constructor(private empleadosService: EmpleadosService) {
  // 🔄 Recuperar sesión al recargar (F5)
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    this.user = JSON.parse(storedUser);
  }

  // 🔐 Verificar sesión activa (si necesitas lógica adicional)
  this.verificarSesionActiva();
}

  /**
   * Verifica si hay una sesión activa en localStorage
   */
  private verificarSesionActiva(): void {
    const empleado = this.empleadosService.getEmpleadoActual();
    if (empleado) {
      this.user = {
        username: empleado.usuario,
        role: this.mapearCargoARol(empleado.cargo),
      };
    }
  }

  /**
   * Mapea el cargo del empleado al rol del sistema
   */
  private mapearCargoARol(cargo: Empleado['cargo']): string {
    const mapeo = {
      ADMIN: 'admin',
      VENTAS: 'ventas',
      ALMACENERO: 'almacen',
    };
    return mapeo[cargo];
  }

  /**
   * Login del usuario
   */
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

  /**
   * Obtiene el rol del usuario actual
   */
  getRole(): string | null {
    return this.user?.role || null;
  }

  getUsername(): string | null {
    return this.user?.username || null;
  }

  isLoggedIn(): boolean {
    return this.user !== null;
  }

  /**
   * Obtiene el empleado actual (datos completos)
   */
  getEmpleadoActual(): Empleado | null {
    return this.empleadosService.getEmpleadoActual();
  }

  /**
   * Obtiene el nombre completo del usuario
   */
  getNombreCompleto(): string {
    return this.empleadosService.getNombreCompletoEmpleadoActual();
  }

  /**
   * Verifica si el usuario tiene un rol específico
   */
  hasRole(role: string): boolean {
    return this.user?.role === role;
  }
}
