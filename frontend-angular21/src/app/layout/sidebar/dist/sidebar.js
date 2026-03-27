"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.Sidebar = void 0;
var core_1 = require("@angular/core");
var common_1 = require("@angular/common");
var avatar_1 = require("primeng/avatar");
var badge_1 = require("primeng/badge");
var button_1 = require("primeng/button");
var drawer_1 = require("primeng/drawer");
var api_1 = require("primeng/api");
var router_1 = require("@angular/router");
var confirmdialog_1 = require("primeng/confirmdialog");
var toast_1 = require("primeng/toast");
var cashbox_socket_service_1 = require("../../ventas/services/cashbox-socket.service");
var empresa_service_1 = require("../../administracion/services/empresa.service");
var Sidebar = /** @class */ (function () {
    function Sidebar(confirmationService, messageService, router, authService, roleService) {
        this.confirmationService = confirmationService;
        this.messageService = messageService;
        this.router = router;
        this.authService = authService;
        this.roleService = roleService;
        this.visible = true;
        this.activeMenu = null;
        this.menuSections = [];
        this.roleName = 'Invitado';
        this.username = '';
        this.cashboxSocket = core_1.inject(cashbox_socket_service_1.CashboxSocketService);
        this.cdr = core_1.inject(core_1.ChangeDetectorRef);
        this.empresaService = core_1.inject(empresa_service_1.EmpresaService);
        this.empresa = this.empresaService.empresaActual;
        // ── Permisos que existen en BD pero NO tienen página en el frontend ────────
        this.SIN_PAGINA = new Set([
            'VENTAS', 'ALMACEN', 'PRINCIPAL',
            'VER_LIBRO_VENTAS', 'VER_REPORTES', 'VER_NOTAS_CREDITO',
            'CREAR_NOTA_CREDITO',
        ]);
        // ── Mapa permiso → datos del item (única fuente de verdad) ────────────────
        this.ITEM = {
            // Ventas Admin
            VER_DASHBOARD_ADMIN: { path: '/admin/dashboard-admin', label: 'Dashboard', icon: 'pi pi-home' },
            VER_CAJA: { path: '/admin/caja', label: 'Caja', icon: 'pi pi-money-bill' },
            CREAR_VENTA_ADMIN: { path: '/admin/generar-ventas-administracion', label: 'Crear Venta', icon: 'pi pi-plus-circle' },
            VER_VENTAS_ADMIN: { path: '/admin/historial-ventas-administracion', label: 'Historial Ventas', icon: 'pi pi-list' },
            CREAR_NC: { path: '/admin/nota-credito', label: 'Notas de Crédito', icon: 'pi pi-credit-card' },
            CREAR_DESCUENTO: { path: '/admin/descuentos', label: 'Descuentos', icon: 'pi pi-tag' },
            CREAR_PROMOCION: { path: '/admin/promociones', label: 'Promociones', icon: 'pi pi-percentage' },
            CREAR_VENTA_POR_COBRAR: { path: '/admin/ventas-por-cobrar', label: 'Ventas por Cobrar', icon: 'pi pi-wallet' },
            CREAR_CLIENTE: { path: '/admin/clientes', label: 'Clientes', icon: 'pi pi-users' },
            CREAR_COTIZACIONES: { path: '/admin/cotizaciones-venta', label: 'Cotizaciones Venta', icon: 'pi pi-id-card' },
            CREAR_COTIZACIONES_COMPRA: { path: '/admin/cotizaciones-compra', label: 'Cotizaciones Compra', icon: 'pi pi-id-card' },
            CREAR_RECLAMO: { path: '/admin/reclamos-listado', label: 'Reclamos', icon: 'pi pi-exclamation-circle' },
            // Almacén
            VER_DASHBOARD_ALMACEN: { path: '/admin/dashboard-almacen', label: 'Dashboard Almacén', icon: 'pi pi-chart-bar' },
            CREAR_ALMACEN: { path: '/admin/almacen', label: 'Almacén', icon: 'pi pi-box' },
            CREAR_REMISION: { path: '/logistica/remision', label: 'Remisión', icon: 'pi pi-truck' },
            CONTEO_INVENTARIO: { path: '/admin/conteo-inventario', label: 'Conteo Inventario', icon: 'pi pi-folder' },
            CREAR_MOV_INVENTARIO: { path: '/logistica/movimiento-inventario', label: 'Mov. Inventario', icon: 'pi pi-database' },
            CREAR_AJUSTE_INVENTARIO: { path: '/logistica/ajuste-inventario', label: 'Ajuste Inventario', icon: 'pi pi-cog' },
            // Administración
            CREAR_TRANSFERENCIA: { path: '/admin/transferencia', label: 'Transferencias', icon: 'pi pi-arrows-h' },
            CREAR_DESPACHO: { path: '/admin/despacho-productos', label: 'Despacho', icon: 'pi pi-truck' },
            CREAR_USUARIOS: { path: '/admin/usuarios', label: 'Empleados', icon: 'pi pi-user-plus' },
            CREAR_PRODUCTOS: { path: '/admin/gestion-productos', label: 'Productos', icon: 'pi pi-tags' },
            CREAR_CATEGORIAS: { path: '/admin/categoria', label: 'Categorías', icon: 'pi pi-list' },
            CREAR_SEDES: { path: '/admin/sedes', label: 'Sedes', icon: 'pi pi-building' },
            CREAR_COMISIONES: { path: '/admin/comision', label: 'Comisiones', icon: 'pi pi-wallet' },
            CREAR_MERMAS: { path: '/admin/mermas', label: 'Mermas', icon: 'pi pi-exclamation-triangle' },
            CREAR_REMATES: { path: '/admin/remates', label: 'Remates', icon: 'pi pi-tag' },
            CREAR_PROVEEDORES: { path: '/admin/proveedores', label: 'Proveedores', icon: 'pi pi-truck' },
            AGREGAR_DOCUMENTO: { path: '/admin/documento-contador', label: 'Documentos', icon: 'pi pi-file' },
            CREAR_PERMISOS: { path: '/admin/roles-permisos', label: 'Permisos', icon: 'pi pi-key' },
            ASIGNAR_DELIVERY: { path: '/admin/gestion-delivery', label: 'DELIVERY', icon: 'pi pi-key' }
        };
        // ── Secciones fijas: definen qué permisos pertenecen a cada categoría ─────
        this.SECCIONES = [
            {
                label: 'VENTAS', icon: 'pi pi-shopping-cart', permisoSeccion: 'VENTAS',
                permisos: ['VER_DASHBOARD_ADMIN', 'VER_CAJA', 'CREAR_VENTA_ADMIN', 'VER_VENTAS_ADMIN',
                    'CREAR_NC', 'CREAR_PROMOCION', 'CREAR_VENTA_POR_COBRAR',
                    'CREAR_CLIENTE', 'CREAR_COTIZACIONES', 'CREAR_COTIZACIONES_COMPRA', 'CREAR_RECLAMO']
            },
            {
                label: 'ALMACÉN', icon: 'pi pi-box', permisoSeccion: 'ALMACEN',
                permisos: ['VER_DASHBOARD_ALMACEN', 'CREAR_ALMACEN', 'CREAR_REMISION',
                    'CONTEO_INVENTARIO', 'CREAR_MOV_INVENTARIO', 'CREAR_AJUSTE_INVENTARIO']
            },
            {
                label: 'ADMINISTRADOR', icon: 'pi pi-cog', permisoSeccion: 'ADMINISTRACION',
                permisos: ['CREAR_PERMISOS', 'CREAR_TRANSFERENCIA', 'CREAR_DESPACHO', 'CREAR_PRODUCTOS',
                    'CREAR_CATEGORIAS', 'CREAR_SEDES', 'CREAR_MERMAS',
                    'CREAR_REMATES', 'SEGUIMIENTO_EMPLEADO', 'CREAR_PROVEEDORES', 'ADMINISTRACION', 'MODIFICAR_EMPRESA']
            },
            {
                label: 'DELIVERY', icon: 'pi pi-truck', permisoSeccion: 'ADMINISTRACION',
                permisos: ['CREAR_USUARIOS']
            },
            {
                label: 'CONTABILIDAD', icon: 'pi pi-money-bill', permisoSeccion: 'ADMINISTRACION',
                permisos: ['AGREGAR_DOCUMENTO']
            },
            {
                label: 'RRHH', icon: 'pi pi-users', permisoSeccion: 'ADMINISTRACION',
                permisos: ['CREAR_USUARIOS', 'CREAR_COMISIONES', 'CREAR_DESCUENTO']
            },
        ];
    }
    Sidebar.prototype.ngOnInit = function () {
        this.loadUserInfo();
        this.loadMenu();
        this.iniciarSuscripcionReactiva();
        this.cargarEmpresa();
    };
    Sidebar.prototype.cargarEmpresa = function () {
        this.empresaService.getEmpresa().subscribe({
            error: function (err) { return console.error('Error cargando empresa en sidebar:', err); }
        });
    };
    Sidebar.prototype.iniciarSuscripcionReactiva = function () {
        var _this = this;
        this.authService.permisosActualizados$.subscribe(function () {
            _this.loadUserInfo();
            _this.loadMenu();
            _this.cdr.detectChanges();
        });
    };
    Sidebar.prototype.loadUserInfo = function () {
        var _a;
        var raw = localStorage.getItem('user');
        if (raw) {
            var user = JSON.parse(raw);
            this.username = user.username;
            this.roleName = (_a = user.roleName) !== null && _a !== void 0 ? _a : 'Invitado';
        }
    };
    Sidebar.prototype.loadMenu = function () {
        var _this = this;
        var raw = localStorage.getItem('user');
        var user = raw ? JSON.parse(raw) : null;
        var permisosRaw = (user === null || user === void 0 ? void 0 : user.permisos) || [];
        var roleName = (user === null || user === void 0 ? void 0 : user.roleName) || 'Invitado';
        if (!permisosRaw.length) {
            this.menuSections = [];
            return;
        }
        // Expandir CREAR_COTIZACIONES en dos entradas para mostrar ambas páginas
        var permisos = permisosRaw.includes('CREAR_COTIZACIONES')
            ? __spreadArrays(permisosRaw, ['CREAR_COTIZACIONES_COMPRA']) : permisosRaw;
        var esAdmin = roleName.toUpperCase() === 'ADMINISTRADOR';
        if (esAdmin) {
            this.menuSections = this.SECCIONES
                .map(function (s) { return ({
                label: s.label, icon: s.icon, permisoSeccion: s.permisoSeccion,
                items: s.permisos
                    .filter(function (p) { return permisos.includes(p) && _this.ITEM[p]; })
                    .map(function (p) { return (__assign({ permiso: p }, _this.ITEM[p])); })
            }); })
                .filter(function (s) { return s.items.length > 0; });
        }
        else {
            var cubiertos = new Set(this.SECCIONES.flatMap(function (s) { return s.permisos; }));
            var items = permisos
                .filter(function (p) { return !_this.SIN_PAGINA.has(p) && _this.ITEM[p]; })
                .map(function (p) { return (__assign({ permiso: p }, _this.ITEM[p])); });
            this.menuSections = items.length > 0
                ? [{ label: roleName.toUpperCase(), icon: 'pi pi-user', permisoSeccion: 'ROL', items: items }]
                : [];
        }
    };
    Sidebar.prototype.toggleMenu = function (menu) {
        this.activeMenu = this.activeMenu === menu ? null : menu;
    };
    Sidebar.prototype.navigateTo = function (event, path) {
        var requierenCaja = ['/ventas/generar-ventas', '/admin/generar-ventas-administracion'];
        if (requierenCaja.includes(path)) {
            var caja = this.cashboxSocket.caja();
            if (!caja || caja.estado !== 'ABIERTA') {
                event.preventDefault();
                event.stopPropagation();
                this.messageService.add({
                    severity: 'warn', summary: 'Caja Cerrada',
                    detail: 'Debes abrir la caja antes de poder realizar ventas.', life: 3500
                });
            }
        }
    };
    Sidebar.prototype.confirm2 = function (event) {
        var _this = this;
        this.confirmationService.confirm({
            target: event.target,
            message: '¿Estás seguro de que deseas cerrar sesión?',
            header: 'Alerta', icon: 'pi pi-info-circle',
            rejectLabel: 'Cancelar', acceptLabel: 'Aceptar',
            acceptButtonProps: { severity: 'danger' },
            rejectButtonProps: { severity: 'secondary', outlined: true },
            accept: function () {
                _this.authService.logout();
                _this.messageService.add({ severity: 'success', summary: 'Confirmación', detail: 'Cierre de sesión exitoso' });
                setTimeout(function () { return _this.router.navigate(['/login']); }, 1000);
            },
            reject: function () {
                _this.messageService.add({ severity: 'info', summary: 'Cancelado', detail: 'Cierre de sesión cancelado' });
            }
        });
    };
    Sidebar = __decorate([
        core_1.Component({
            selector: 'app-sidebar',
            standalone: true,
            imports: [common_1.CommonModule, button_1.ButtonModule, avatar_1.AvatarModule, drawer_1.DrawerModule, badge_1.BadgeModule,
                router_1.RouterModule, toast_1.ToastModule, confirmdialog_1.ConfirmDialog, common_1.TitleCasePipe],
            templateUrl: './sidebar.html',
            styleUrl: './sidebar.css',
            providers: [api_1.ConfirmationService, api_1.MessageService]
        })
    ], Sidebar);
    return Sidebar;
}());
exports.Sidebar = Sidebar;
