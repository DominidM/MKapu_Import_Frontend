import { ApplicationRef, Injectable, NgZone, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../enviroments/enviroment';
import { User } from '../../core/interfaces/user.interface';
import { EmpleadosService } from '../../core/services/empleados.service';
import {
  AuthInterface,
  AuthInterfaceResponse,
  AuthAccountBackend,
} from '../interfaces/auth.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private empleadosService = inject(EmpleadosService);
  private appRef = inject(ApplicationRef);
  private ngZone = inject(NgZone);
  public permisosActualizados$ = new BehaviorSubject<boolean>(true);
  private api = environment.apiUrl || 'http://localhost:3000';
  private currentUser: User | null = null;

  constructor() {
    this.verificarSesionActiva();
  }

  // ================= SESION ACTIVA =================

  private verificarSesionActiva(): void {
    try {
      const userStr = localStorage.getItem('user');
      const token   = localStorage.getItem('token');
      if (userStr && token) {
        this.currentUser = JSON.parse(userStr);
        this.empleadosService.sincronizarDesdeAuth();
      }
    } catch (error) {
      console.error('Error al recuperar sesión:', error);
      this.logout();
    }
  }

  // ================= TRANSFORM USER =================

  private transformUser(account: AuthAccountBackend): User {
    return {
      userId:     account.usuario.id_usuario,
      idCuenta:   account.id_cuenta, 
      username:   account.username,
      email:      account.email_emp,
      roleId:     account.roles[0]?.id_rol,
      roleName:   account.roles[0]?.nombre,
      idSede:     account.id_sede,
      sedeNombre: account.sede_nombre,
      permisos:   account.permisos.map((p) => p.nombre),
      nombres:    account.usuario.nombres,
      apellidos:  `${account.usuario.ape_pat} ${account.usuario.ape_mat}`,
    };
  }

  private redirectByPermisos(user: User): void {
    const permisos = user.permisos || [];

    setTimeout(() => {
      // ── Redirecciones especiales por rol ──────────────────────────
      if (permisos.includes('VER_DASHBOARD_ALMACEN')) {
        this.ngZone.run(() =>
          this.router.navigate(['/admin/dashboard-admin']).catch(e => console.error('Nav error:', e)),
        );
        return;
      }

      if (permisos.includes('VER_DASHBOARD_VENTAS')) {
        this.ngZone.run(() =>
          this.router.navigate(['/ventas/dashboard-ventas']).catch(e => console.error('Nav error:', e)),
        );
        return;
      }

      // ── Fallback universal: dashboard-admin es el HOME de todos ───
      // No requiere permiso VER_DASHBOARD_ADMIN — es una ruta pública interna.
      this.ngZone.run(() =>
        this.router.navigate(['/admin/dashboard-admin']).catch(e => console.error('Nav error:', e)),
      );
    }, 0);
  }

  login(username: string, password: string): Observable<AuthInterfaceResponse> {
    const loginData: AuthInterface = { username, password };

    return this.http
      .post<AuthInterfaceResponse>(`${this.api}/auth/auth/login`, loginData)
      .pipe(
        tap((response) => {
          const account         = response.account;
          const transformedUser = this.transformUser(account);

          this.currentUser = transformedUser;

          localStorage.setItem('token', response.access_token);
          localStorage.setItem('user', JSON.stringify(transformedUser));

          this.empleadosService.sincronizarDesdeAuth();

          this.redirectByPermisos(transformedUser);
        }),
      );
  }

  logout(): void {
    this.currentUser = null;
    this.empleadosService.logout();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return this.currentUser !== null && !!localStorage.getItem('token');
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  getUsername(): string | null {
    return this.currentUser?.username || null;
  }

  getEmail(): string | null {
    return this.currentUser?.email || null;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getRoleId(): number | null {
    return this.currentUser?.roleId || null;
  }

  getIdCuenta(): number {
    return this.currentUser?.idCuenta ?? 0;
  }
  
  hasPermiso(permiso: string): boolean {
    return this.currentUser?.permisos?.includes(permiso) ?? false;
  }

  isAdmin(): boolean {
    return this.hasPermiso('ADMINISTRACION');
  }

  isVentas(): boolean {
    return this.hasPermiso('PRINCIPAL') && this.hasPermiso('CREAR_VENTA');
  }

  isAlmacen(): boolean {
    return this.hasPermiso('ALMACEN');
  }

  refrescarPermisosSilenciosamente() {
    const token = this.getToken();
    if (!token) return;

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.ngZone.run(() => {
      this.http
        .get<any>(`${this.api}/auth/auth/refresh-profile`, { headers })
        .subscribe({
          next: (res) => {
            if (res && res.account) {
              const updatedUser = this.transformUser(res.account);
              this.currentUser  = updatedUser;
              localStorage.setItem('user',     JSON.stringify(updatedUser));
              localStorage.setItem('permisos', JSON.stringify(updatedUser.permisos));

              this.permisosActualizados$.next(true);
              setTimeout(() => this.appRef.tick(), 0);
            }
          },
          error: (err) => console.error('❌ Error refrescando perfil:', err),
        });
    });
  }
}