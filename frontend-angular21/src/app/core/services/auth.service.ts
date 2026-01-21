import { Injectable } from '@angular/core';
import { EmpleadosService, Empleado } from './empleados.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private user: { username: string; role: string } | null = null;

  constructor(private empleadosService: EmpleadosService) {
    // Verificar si hay sesión activa al iniciar
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
    // Intentar login con EmpleadosService
    const loginExitoso = this.empleadosService.login(username, password);

    if (loginExitoso) {
      const empleado = this.empleadosService.getEmpleadoActual();
      if (empleado) {
        this.user = {
          username: empleado.usuario,
          role: this.mapearCargoARol(empleado.cargo),
        };
        return true;
      }
    }

    return false;
  }

  /**
   * Cierra la sesión
   */
  logout(): void {
    this.user = null;
    this.empleadosService.logout();
  }

  /**
   * Obtiene el rol del usuario actual
   */
  getRole(): string | null {
    return this.user?.role || null;
  }

  /**
   * Verifica si el usuario está logueado
   */
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
