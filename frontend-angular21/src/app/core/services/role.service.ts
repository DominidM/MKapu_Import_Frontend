import { Injectable } from '@angular/core';
import { UserRole } from '../constants/roles.constants';
import { RouteConfig } from '../interfaces/route-config.interface';
import { User } from '../interfaces/user.interface';
import { APP_ROUTES } from '../constants/routes.constants';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  
  /**
   * Obtiene el usuario actual desde localStorage
   */
  getCurrentUser(): User | null {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      return null;
    }
  }
  
  /**
   * Obtiene el rol del usuario actual
   */
  getCurrentUserRole(): UserRole | null {
    const user = this.getCurrentUser();
    return user?.roleId ?? null;
  }
  
  /**
   * Verifica si el usuario tiene un rol específico
   */
  hasRole(role: UserRole): boolean {
    const currentRole = this.getCurrentUserRole();
    return currentRole === role;
  }
  
  /**
   * Verifica si el usuario tiene alguno de los roles especificados
   */
  hasAnyRole(roles: UserRole[]): boolean {
    const currentRole = this.getCurrentUserRole();
    return currentRole !== null && roles.includes(currentRole);
  }
  
  /**
   * Verifica si el usuario es Administrador
   */
  isAdmin(): boolean {
    return this.hasRole(UserRole.ADMIN);
  }
  
  /**
   * Verifica si el usuario es de Ventas
   */
  isVentas(): boolean {
    return this.hasRole(UserRole.VENTAS);
  }
  
  /**
   * Verifica si el usuario es de Almacén
   */
  isAlmacen(): boolean {
    return this.hasRole(UserRole.ALMACEN);
  }
  
  /**
   * Obtiene las rutas disponibles según el rol del usuario
   * (Útil para generar menús dinámicos)
   */
  getAvailableRoutes(): RouteConfig[] {
    const currentRole = this.getCurrentUserRole();
    if (!currentRole) return [];
    
    return APP_ROUTES.filter(route => 
      route.allowedRoles.includes(currentRole)
    );
  }
  
  /**
   * Verifica si el usuario puede acceder a una ruta específica
   */
  canAccessRoute(path: string): boolean {
    const currentRole = this.getCurrentUserRole();
    if (!currentRole) return false;
    
    const route = APP_ROUTES.find(r => r.path === path);
    return route ? route.allowedRoles.includes(currentRole) : false;
  }
  
  /**
   * Obtiene la ruta por defecto según el rol del usuario
   */
  getDefaultRoute(): string {
    const currentRole = this.getCurrentUserRole();
    
    const defaultRoutes: Record<UserRole, string> = {
      [UserRole.ADMIN]: '/administracion/dashboard',
      [UserRole.VENTAS]: '/ventas/dashboard-ventas',
      [UserRole.ALMACEN]: '/almacen/dashboard',
      [UserRole.LOGISTICA]: '/logistica/dashboard'
    };
    
    return currentRole ? defaultRoutes[currentRole] : '/login';
  }
  
  /**
   * Verifica si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null && localStorage.getItem('token') !== null;
  }
  
  /**
   * Obtiene el nombre del usuario actual
   */
  getCurrentUsername(): string | null {
    const user = this.getCurrentUser();
    return user?.username ?? null;
  }
  
  /**
   * Obtiene el ID del usuario actual
   */
  getCurrentUserId(): number | null {
    const user = this.getCurrentUser();
    return user?.userId ?? null;
  }
  
  /**
   * Limpia los datos del usuario (útil para logout)
   */
  clearUserData(): void {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }
}
