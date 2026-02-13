import { Component, OnInit } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Router, RouterModule } from '@angular/router';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { AuthService } from '../../auth/services/auth.service';
import { RoleService } from '../../core/services/role.service';
import { RouteConfig } from '../../core/interfaces/route-config.interface';
import { UserRole, ROLE_NAMES } from '../../core/constants/roles.constants';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    AvatarModule,
    DrawerModule,
    BadgeModule,
    RouterModule,
    ToastModule,
    ConfirmDialog,
    TitleCasePipe,
  ],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
  providers: [ConfirmationService, MessageService],
})
export class Sidebar implements OnInit {
  visible = true;
  activeMenu: string | null = null;

  menuItems: RouteConfig[] = [];

  roleName: string = 'Invitado';
  username: string = '';

  // Definición de rutas del menú
  private readonly SIDEBAR_ROUTES: RouteConfig[] = [
    // ==================== ADMIN ====================
    {
      path: '/admin/dashboard',
      allowedRoles: [UserRole.ADMIN],
      label: 'Dashboard',
      icon: 'pi pi-home',
    },

    // SECCIÓN VENTAS (solo para Admin)
    {
      path: '',
      allowedRoles: [UserRole.ADMIN],
      label: 'VENTAS',
      isSection: true,
    },
    {
      path: '/ventas/dashboard-ventas',
      allowedRoles: [UserRole.ADMIN],
      label: 'Dashboard Ventas',
      icon: 'pi pi-chart-line',
    },
    {
      path: '/admin/generar-ventas-administracion',
      allowedRoles: [UserRole.ADMIN],
      label: 'Crear Venta Administración',
      icon: 'pi pi-plus-circle',
    },
    {
      path: '/admin/historial-ventas-administracion',
      allowedRoles: [UserRole.ADMIN],
      label: 'Historial Ventas Administración',
      icon: 'pi pi-list',
    },
    {
      path: '/almacen/dashboard',
      allowedRoles: [UserRole.ADMIN],
      label: 'Dashboard Almacén',
      icon: 'pi pi-box',
    },
    {
      path: '/admin/ingresos-almacen',
      allowedRoles: [UserRole.ADMIN],
      label: 'Ingresos Almacén',
      icon: 'pi pi-download',
    },
    {
      path: '/admin/transferencia',
      allowedRoles: [UserRole.ADMIN],
      label: 'Transferencias',
      icon: 'pi pi-arrows-h',
    },
    {
      path: '/admin/despacho-productos',
      allowedRoles: [UserRole.ADMIN],
      label: 'Despacho',
      icon: 'pi pi-truck',
    },

    {
      path: '',
      allowedRoles: [UserRole.ADMIN],
      label: 'ADMINISTRACIÓN',
      isSection: true,
    },
    {
      path: '/admin/usuarios',
      allowedRoles: [UserRole.ADMIN],
      label: 'Usuarios',
      icon: 'pi pi-user-plus',
    },
    {
      path: '/admin/gestion-productos',
      allowedRoles: [UserRole.ADMIN],
      label: 'Productos',
      icon: 'pi pi-tags',
    },
    {
      path: '/admin/sedes',
      allowedRoles: [UserRole.ADMIN],
      label: 'Sedes',
      icon: 'pi pi-building',
    },
    {
      path: '/admin/comision',
      allowedRoles: [UserRole.ADMIN],
      label: 'Comisiones',
      icon: 'pi pi-wallet',
    },
    {
      path: '/admin/mermas-remates',
      allowedRoles: [UserRole.ADMIN],
      label: 'Mermas / Remates',
      icon: 'pi pi-trash',
    },

    // ==================== VENTAS ====================
    {
      path: '/ventas/dashboard-ventas',
      allowedRoles: [UserRole.VENTAS],
      label: 'Dashboard',
      icon: 'pi pi-bookmark',
    },
    {
      path: '/ventas/generar-ventas',
      allowedRoles: [UserRole.VENTAS],
      label: 'Generar Venta',
      icon: 'pi pi-bookmark',
    },
    {
      path: '/ventas/historial-ventas',
      allowedRoles: [UserRole.VENTAS],
      label: 'Historial Ventas',
      icon: 'pi pi-bookmark',
    },
    {
      path: '/ventas/reclamos-listado',
      allowedRoles: [UserRole.VENTAS],
      label: 'Reclamos y Garantías',
      icon: 'pi pi-shield',
    },


    // ==================== ALMACÉN ====================
    {
      path: '/almacen/dashboard',
      allowedRoles: [UserRole.ALMACEN],
      label: 'Dashboard',
      icon: 'pi pi-chart-line',
    },
    {
      path: '',
      allowedRoles: [UserRole.ADMIN],
      label: 'LOGISTICA',
      isSection: true,
    },
    
    {
      path: '/logistica/conteo-inventario',
      allowedRoles: [UserRole.ADMIN],
      label: 'Conteo inventario',
      icon: 'pi pi-bookmark',
    },
  ];

  constructor(
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private router: Router,
    private authService: AuthService,
    private roleService: RoleService,
  ) {}

  ngOnInit(): void {
    this.loadUserInfo();
    this.loadMenu();
  }

  /**
   * Carga la información del usuario actual
   */
  private loadUserInfo(): void {
    const user = this.roleService.getCurrentUser();

    if (user) {
      this.username = user.username;
      this.roleName = ROLE_NAMES[user.roleId] || 'Invitado';
      console.log('👤 Usuario actual:', { username: this.username, role: this.roleName });
    }
  }

  /**
   * Carga el menú filtrado según el rol del usuario
   */
  private loadMenu(): void {
    const currentRole = this.roleService.getCurrentUserRole();

    if (!currentRole) {
      console.warn('⚠️ No hay rol activo');
      return;
    }

    // Filtrar rutas según el rol actual
    this.menuItems = this.SIDEBAR_ROUTES.filter((route) =>
      route.allowedRoles.includes(currentRole),
    );

    console.log('📋 Menú cargado:', this.menuItems);
  }

  /**
   * Verifica si un item es una sección (título)
   */
  isSection(item: RouteConfig): boolean {
    return item.isSection === true;
  }

  /**
   * Navega a una ruta
   */
  navigateTo(path: string): void {
    if (path) {
      this.router.navigate([path]);
    }
  }

  /**
   * Toggle de submenús (si los implementas)
   */
  toggleMenu(menu: string): void {
    this.activeMenu = this.activeMenu === menu ? null : menu;
  }

  /**
   * Confirmación de cierre de sesión
   */
  confirm2(event: Event): void {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: '¿Estás seguro de que deseas cerrar sesión?',
      header: 'Alerta',
      icon: 'pi pi-info-circle',
      rejectLabel: 'Cancelar',
      acceptLabel: 'Aceptar',
      acceptButtonProps: {
        severity: 'danger',
      },
      rejectButtonProps: {
        severity: 'secondary',
        outlined: true,
      },
      accept: () => {
        this.authService.logout();

        this.messageService.add({
          severity: 'success',
          summary: 'Confirmación',
          detail: 'Cierre de sesión exitoso',
        });

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1000);
      },
      reject: () => {
        this.messageService.add({
          severity: 'info',
          summary: 'Cancelado',
          detail: 'Cierre de sesión cancelado',
        });
      },
    });
  }
}
