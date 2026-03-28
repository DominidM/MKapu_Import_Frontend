import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Router, RouterModule } from '@angular/router';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';

import { AuthService } from '../../auth/services/auth.service';
import { RoleService } from '../../core/services/role.service';
import { CashboxSocketService } from '../../ventas/services/cashbox-socket.service';
import { EmpresaService } from '../../administracion/services/empresa.service';

interface MenuItem    { path: string; label: string; icon: string; permiso: string; }
interface MenuSection { label: string; icon: string; permisoSeccion: string; items: MenuItem[]; }

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule, ButtonModule, AvatarModule, DrawerModule, BadgeModule,
    RouterModule, ToastModule, ConfirmDialog, TitleCasePipe,
  ],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
  providers: [ConfirmationService, MessageService],
})
export class Sidebar implements OnInit {

  visible     = true;
  activeMenu: string | null = null;
  menuSections: MenuSection[] = [];
  roleName  = 'Invitado';
  username  = '';

  private cashboxSocket  = inject(CashboxSocketService);
  private cdr            = inject(ChangeDetectorRef);
  private empresaService = inject(EmpresaService);
  empresa = this.empresaService.empresaActual;

  // ── Dashboard item — siempre visible, sin permiso requerido ──────
  private readonly DASHBOARD_ITEM: MenuItem = {
    path:    '/admin/dashboard-admin',
    label:   'Dashboard',
    icon:    'pi pi-home',
    permiso: '', 
  };

  // ── Permisos que existen en BD pero NO tienen página frontend ─────
  private readonly SIN_PAGINA = new Set([
    'VENTAS', 'ALMACEN', 'PRINCIPAL',
    'VER_LIBRO_VENTAS', 'VER_REPORTES', 'VER_NOTAS_CREDITO',
    'CREAR_NOTA_CREDITO',
    'VER_DASHBOARD_ADMIN', // ← ya no es un permiso funcional, es el home global
  ]);

  // ── Mapa permiso → datos del item ────────────────────────────────
  private readonly ITEM: Record<string, Omit<MenuItem, 'permiso'>> = {
    // Ventas Admin
    VER_CAJA:                { path: '/admin/caja',                            label: 'Caja',               icon: 'pi pi-money-bill' },
    CREAR_VENTA_ADMIN:       { path: '/admin/generar-ventas-administracion',   label: 'Crear Venta',        icon: 'pi pi-plus-circle' },
    VER_VENTAS_ADMIN:        { path: '/admin/historial-ventas-administracion', label: 'Historial Ventas',   icon: 'pi pi-list' },
    CREAR_NC:                { path: '/admin/nota-credito',                    label: 'Notas de Crédito',   icon: 'pi pi-credit-card' },
    VER_DESCUENTO:           { path: '/admin/descuentos',                      label: 'Descuentos',         icon: 'pi pi-tag' },
    VER_PROMOCION:           { path: '/admin/promociones',                     label: 'Promociones',        icon: 'pi pi-percentage' },
    CREAR_VENTA_POR_COBRAR:  { path: '/admin/ventas-por-cobrar',               label: 'Ventas por Cobrar',  icon: 'pi pi-wallet' },
    VER_CLIENTE:             { path: '/admin/clientes',                        label: 'Clientes',           icon: 'pi pi-users' },
    VER_COTIZACIONES_VENTA:  { path: '/admin/cotizaciones-venta',              label: 'Cotizaciones Venta', icon: 'pi pi-id-card' },
    VER_COTIZACIONES_COMPRA: { path: '/admin/cotizaciones-compra',             label: 'Cotizaciones Compra',icon: 'pi pi-id-card' },
    VER_RECLAMO:             { path: '/admin/reclamos-listado',                label: 'Reclamos',           icon: 'pi pi-exclamation-circle' },

    // Almacén
    VER_DASHBOARD_ALMACEN:   { path: '/admin/dashboard-almacen',               label: 'Dashboard Almacén',  icon: 'pi pi-chart-bar' },
    VER_ALMACEN:             { path: '/admin/almacen',                         label: 'Almacén',            icon: 'pi pi-box' },
    CREAR_REMISION:          { path: '/logistica/remision',                    label: 'Remisión',           icon: 'pi pi-truck' },
    CONTEO_INVENTARIO:       { path: '/admin/conteo-inventario',               label: 'Conteo Inventario',  icon: 'pi pi-folder' },
    CREAR_MOV_INVENTARIO:    { path: '/logistica/movimiento-inventario',       label: 'Mov. Inventario',    icon: 'pi pi-database' },
    CREAR_AJUSTE_INVENTARIO: { path: '/logistica/ajuste-inventario',           label: 'Ajuste Inventario',  icon: 'pi pi-cog' },

    // Administración
    VER_TRANSFERENCIA:       { path: '/admin/transferencia',                   label: 'Transferencias',     icon: 'pi pi-arrows-h' },
    CREAR_DESPACHO:          { path: '/admin/despacho-productos',              label: 'Despacho',           icon: 'pi pi-truck' },
    VER_USUARIOS:            { path: '/admin/usuarios',                        label: 'Empleados',          icon: 'pi pi-user-plus' },
    VER_PRODUCTOS:           { path: '/admin/gestion-productos',               label: 'Productos',          icon: 'pi pi-tags' },
    VER_CATEGORIAS:          { path: '/admin/categoria',                       label: 'Categorías',         icon: 'pi pi-list' },
    VER_SEDES:               { path: '/admin/sedes',                           label: 'Sedes',              icon: 'pi pi-building' },
    VER_COMISIONES:          { path: '/admin/comision',                        label: 'Comisiones',         icon: 'pi pi-wallet' },
    VER_MERMAS:              { path: '/admin/mermas',                          label: 'Mermas',             icon: 'pi pi-exclamation-triangle' },
    VER_REMATES:             { path: '/admin/remates',                         label: 'Remates',            icon: 'pi pi-tag' },
    VER_PROVEEDORES:         { path: '/admin/proveedores',                     label: 'Proveedores',        icon: 'pi pi-truck' },
    AGREGAR_DOCUMENTO:       { path: '/admin/documento-contador',              label: 'Documentos',         icon: 'pi pi-file' },
    CREAR_PERMISOS:          { path: '/admin/roles-permisos',                  label: 'Permisos',           icon: 'pi pi-key' },
    ASIGNAR_DELIVERY:        { path: '/admin/gestion-delivery',                label: 'Control Delivery',   icon: 'pi pi-car' },
  };

  // ── Secciones fijas ───────────────────────────────────────────────
  private readonly SECCIONES: {
    label: string; icon: string; permisoSeccion: string; permisos: string[];
  }[] = [
    {
      label: 'VENTAS', icon: 'pi pi-shopping-cart', permisoSeccion: 'VENTAS',
      permisos: [
        'VER_CAJA', 'CREAR_VENTA_ADMIN', 'VER_VENTAS_ADMIN',
        'CREAR_NC', 'VER_PROMOCION', 'CREAR_VENTA_POR_COBRAR',
        'VER_CLIENTE', 'VER_COTIZACIONES_VENTA', 'VER_COTIZACIONES_COMPRA', 'VER_RECLAMO',
      ],
    },
    {
      label: 'ALMACÉN', icon: 'pi pi-box', permisoSeccion: 'ALMACEN',
      permisos: [
        'VER_DASHBOARD_ALMACEN', 'VER_ALMACEN', 'CREAR_REMISION',
        'CONTEO_INVENTARIO', 'CREAR_MOV_INVENTARIO', 'CREAR_AJUSTE_INVENTARIO',
      ],
    },
    {
      label: 'ADMINISTRADOR', icon: 'pi pi-cog', permisoSeccion: 'ADMINISTRACION',
      permisos: [
        'CREAR_PERMISOS', 'VER_TRANSFERENCIA', 'CREAR_DESPACHO', 'VER_PRODUCTOS',
        'VER_CATEGORIAS', 'VER_SEDES', 'VER_MERMAS',
        'VER_REMATES', 'SEGUIMIENTO_EMPLEADO', 'VER_PROVEEDORES',
        'EDITAR_TERMINOS_CONDICIONES', 'ADMINISTRACION', 'MODIFICAR_EMPRESA',
      ],
    },
    {
      label: 'DELIVERY', icon: 'pi pi-truck', permisoSeccion: 'ADMINISTRACION',
      permisos: ['ASIGNAR_DELIVERY'],
    },
    {
      label: 'CONTABILIDAD', icon: 'pi pi-money-bill', permisoSeccion: 'ADMINISTRACION',
      permisos: ['AGREGAR_DOCUMENTO'],
    },
    {
      label: 'RRHH', icon: 'pi pi-users', permisoSeccion: 'ADMINISTRACION',
      permisos: ['VER_USUARIOS', 'VER_COMISIONES', 'VER_DESCUENTO'],
    },
  ];

  // ─────────────────────────────────────────────────────────────────

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
    this.iniciarSuscripcionReactiva();
    this.cargarEmpresa();
  }

  private cargarEmpresa(): void {
    this.empresaService.getEmpresa().subscribe({
      error: (err) => console.error('Error cargando empresa en sidebar:', err),
    });
  }

  private iniciarSuscripcionReactiva(): void {
    this.authService.permisosActualizados$.subscribe(() => {
      this.loadUserInfo();
      this.loadMenu();
      this.cdr.detectChanges();
    });
  }

  private loadUserInfo(): void {
    const raw = localStorage.getItem('user');
    if (raw) {
      const user    = JSON.parse(raw);
      this.username = user.username;
      this.roleName = user.roleName ?? 'Invitado';
    }
  }

  private loadMenu(): void {
    const raw  = localStorage.getItem('user');
    const user = raw ? JSON.parse(raw) : null;

    const permisosRaw: string[] = user?.permisos || [];
    const roleName: string      = user?.roleName  || 'Invitado';

    // ── Sección INICIO — siempre visible, sin restricción de permiso ──
    const seccionInicio: MenuSection = {
      label:         'INICIO',
      icon:          'pi pi-home',
      permisoSeccion: 'INICIO',
      items:         [this.DASHBOARD_ITEM],
    };

    // Sin permisos → solo Dashboard
    if (!permisosRaw.length) {
      this.menuSections = [seccionInicio];
      return;
    }

    // Expandir CREAR_COTIZACIONES en dos entradas si aplica
    const permisos = permisosRaw.includes('CREAR_COTIZACIONES')
      ? [...permisosRaw, 'CREAR_COTIZACIONES_COMPRA']
      : permisosRaw;

    const esAdmin = roleName.toUpperCase() === 'ADMINISTRADOR';

    if (esAdmin) {
      this.menuSections = [
        seccionInicio,
        ...this.SECCIONES
          .map(s => ({
            label:          s.label,
            icon:           s.icon,
            permisoSeccion: s.permisoSeccion,
            items: s.permisos
              .filter(p => permisos.includes(p) && this.ITEM[p])
              .map(p => ({ permiso: p, ...this.ITEM[p] })),
          }))
          .filter(s => s.items.length > 0),
      ];
    } else {
      const items: MenuItem[] = permisos
        .filter(p => !this.SIN_PAGINA.has(p) && this.ITEM[p])
        .map(p => ({ permiso: p, ...this.ITEM[p] }));

      this.menuSections = [
        seccionInicio,
        ...(items.length > 0
          ? [{ label: roleName.toUpperCase(), icon: 'pi pi-user', permisoSeccion: 'ROL', items }]
          : []),
      ];
    }
  }

  toggleMenu(menu: string): void {
    this.activeMenu = this.activeMenu === menu ? null : menu;
  }

  navigateTo(event: Event, path: string): void {
    const requierenCaja = ['/ventas/generar-ventas', '/admin/generar-ventas-administracion'];
    if (requierenCaja.includes(path)) {
      const caja = this.cashboxSocket.caja();
      if (!caja || caja.estado !== 'ABIERTA') {
        event.preventDefault();
        event.stopPropagation();
        this.messageService.add({
          severity: 'warn',
          summary:  'Caja Cerrada',
          detail:   'Debes abrir la caja antes de poder realizar ventas.',
          life:     3500,
        });
      }
    }
  }

  confirm2(event: Event): void {
    this.confirmationService.confirm({
      target:  event.target as EventTarget,
      message: '¿Estás seguro de que deseas cerrar sesión?',
      header:  'Alerta',
      icon:    'pi pi-info-circle',
      rejectLabel:         'Cancelar',
      acceptLabel:         'Aceptar',
      acceptButtonProps:   { severity: 'danger' },
      rejectButtonProps:   { severity: 'secondary', outlined: true },
      accept: () => {
        this.authService.logout();
        this.messageService.add({
          severity: 'success',
          summary:  'Confirmación',
          detail:   'Cierre de sesión exitoso',
        });
        setTimeout(() => this.router.navigate(['/login']), 1000);
      },
      reject: () => {
        this.messageService.add({
          severity: 'info',
          summary:  'Cancelado',
          detail:   'Cierre de sesión cancelado',
        });
      },
    });
  }
}