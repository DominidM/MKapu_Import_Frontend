"use strict";
exports.__esModule = true;
exports.ADMIN_ROUTES = void 0;
var pending_changes_guard_1 = require("../core/guards/pending-changes.guard");
var cashbox_guard_1 = require("../ventas/guards/cashbox.guard");
var role_guard_1 = require("../core/guards/role.guard");
exports.ADMIN_ROUTES = [
    {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
    },
    {
        path: 'empresa/configuracion',
        loadComponent: function () {
            return Promise.resolve().then(function () { return require('./pages/empresa/empresa-configuracion'); }).then(function (m) { return m.EmpresaConfiguracion; });
        },
        canActivate: [role_guard_1.roleGuard],
        data: { permiso: 'MODIFICAR_EMPRESA' }
    },
    {
        path: 'empleados/:id/seguimiento',
        loadComponent: function () {
            return Promise.resolve().then(function () { return require('./pages/usuarios/pages/empleado-seguimiento/seguimiento-empleado'); }).then(function (m) { return m.SeguimientoEmpleado; });
        },
        canActivate: [role_guard_1.roleGuard],
        data: { permiso: 'SEGUIMIENTO_EMPLEADO' }
    },
    {
        path: 'dashboard-admin',
        loadComponent: function () {
            return Promise.resolve().then(function () { return require('./pages/dashboard-admin/dashboard-admin'); }).then(function (m) { return m.DashboardAdmin; });
        }
    },
    {
        path: 'dashboard-almacen',
        loadComponent: function () {
            return Promise.resolve().then(function () { return require('../almacen/pages/dashboard-almacen/dashboard-almacen'); }).then(function (m) { return m.DashboardAlmacen; });
        },
        canActivate: [role_guard_1.roleGuard],
        data: { permiso: 'VER_DASHBOARD_ALMACEN' }
    },
    {
        path: 'notificaciones',
        loadComponent: function () {
            return Promise.resolve().then(function () { return require('./pages/notificacion-admin/notificacion-admin'); }).then(function (m) { return m.NotificacionAdmin; });
        }
    },
    {
        path: 'usuarios',
        children: [
            {
                path: '',
                loadComponent: function () {
                    return Promise.resolve().then(function () { return require('./pages/usuarios/pages/administracion-crear-usuario/administracion-crear-usuario'); }).then(function (m) { return m.AdministracionCrearUsuario; });
                },
                canActivate: [role_guard_1.roleGuard],
                data: { permiso: 'VER_USUARIOS' }
            },
            {
                path: 'crear-usuario',
                loadComponent: function () {
                    return Promise.resolve().then(function () { return require('./pages/usuarios/pages/administracion/administracion'); }).then(function (m) { return m.Administracion; });
                },
                canActivate: [role_guard_1.roleGuard],
                data: { permiso: 'CREAR_USUARIOS' }
            },
            {
                path: 'editar-usuario/:id',
                loadComponent: function () {
                    return Promise.resolve().then(function () { return require('./pages/usuarios/pages/administracion-editar-usuario/administracion-editar-usuario'); }).then(function (m) { return m.AdministracionEditarUsuario; });
                },
                canActivate: [role_guard_1.roleGuard],
                data: { permiso: 'EDITAR_USUARIOS' }
            },
        ]
    },
    {
        path: 'almacen',
        children: [
            {
                path: '',
                loadComponent: function () {
                    return Promise.resolve().then(function () { return require('./pages/almacen/pages/listar-almacen/almacen'); }).then(function (m) { return m.AlmacenListado; });
                },
                canActivate: [role_guard_1.roleGuard],
                data: { permiso: 'VER_ALMACEN' }
            },
            {
                path: 'crear-almacen',
                loadComponent: function () {
                    return Promise.resolve().then(function () { return require('./pages/almacen/pages/agregar-almacen/agregar-almacen'); }).then(function (m) { return m.AlmacenCrear; });
                },
                canActivate: [role_guard_1.roleGuard],
                data: { permiso: 'CREAR_ALMACEN' }
            },
            {
                path: 'editar-almacen/:id',
                loadComponent: function () {
                    return Promise.resolve().then(function () { return require('./pages/almacen/pages/editar-almacen/editar-almacen'); }).then(function (m) { return m.AlmacenEditar; });
                },
                canActivate: [role_guard_1.roleGuard],
                data: { permiso: 'EDITAR_ALMACEN' }
            },
            {
                path: 'detalle-almacen/:id',
                loadComponent: function () {
                    return Promise.resolve().then(function () { return require('./pages/almacen/pages/detalle-almacen/detalle-almacen'); }).then(function (m) { return m.DetalleAlmacen; });
                },
                canActivate: [role_guard_1.roleGuard],
                data: { permiso: 'VER_ALMACEN' }
            },
        ]
    },
    {
        path: 'sedes',
        children: [
            {
                path: '',
                loadComponent: function () {
                    return Promise.resolve().then(function () { return require('./pages/sedes/pages/sedes/sedes'); }).then(function (m) { return m.Sedes; });
                },
                canActivate: [role_guard_1.roleGuard],
                data: { permiso: 'VER_SEDES' }
            },
            {
                path: 'agregar-sede',
                loadComponent: function () {
                    return Promise.resolve().then(function () { return require('./pages/sedes/pages/formulario-sede/formulario-sede'); }).then(function (m) { return m.FormularioSede; });
                },
                canActivate: [role_guard_1.roleGuard],
                data: { permiso: 'CREAR_SEDES' }
            },
            {
                path: 'editar-sede',
                loadComponent: function () {
                    return Promise.resolve().then(function () { return require('./pages/sedes/pages/formulario-sede/formulario-sede'); }).then(function (m) { return m.FormularioSede; });
                },
                canActivate: [role_guard_1.roleGuard],
                data: { permiso: 'EDITAR_SEDES' }
            },
            {
                path: ':id',
                loadComponent: function () {
                    return Promise.resolve().then(function () { return require('./pages/sedes/pages/detalle-sede/detalle-sede'); }).then(function (m) { return m.DetalleSede; });
                }
            },
        ]
    },
    {
        path: 'categoria',
        children: [
            {
                path: '',
                loadComponent: function () {
                    return Promise.resolve().then(function () { return require('./pages/categoria/pages/categoria/categoria'); }).then(function (m) { return m.CategoriaListado; });
                },
                canActivate: [role_guard_1.roleGuard],
                data: { permiso: 'VER_CATEGORIAS' }
            },
            {
                path: 'agregar-categoria',
                loadComponent: function () {
                    return Promise.resolve().then(function () { return require('./pages/categoria/pages/agregar-categoria/agregar-categoria'); }).then(function (m) { return m.AgregarCategoria; });
                },
                canActivate: [role_guard_1.roleGuard],
                data: { permiso: 'CREAR_CATEGORIAS' }
            },
            {
                path: 'editar-categoria/:id',
                loadComponent: function () {
                    return Promise.resolve().then(function () { return require('./pages/categoria/pages/editar-categoria/editar-categoria'); }).then(function (m) { return m.EditarCategoria; });
                },
                canActivate: [role_guard_1.roleGuard],
                data: { permiso: 'EDITAR_CATEGORIAS' }
            },
            {
                path: 'detalle-categoria/:id',
                loadComponent: function () {
                    return Promise.resolve().then(function () { return require('./pages/categoria/pages/detalle-categoria/detalle-categoria'); }).then(function (m) { return m.DetalleCategoria; });
                },
                canActivate: [role_guard_1.roleGuard],
                data: { permiso: 'VER_CATEGORIAS' }
            },
        ]
    },
    {
        path: 'roles-permisos',
        canActivate: [role_guard_1.roleGuard],
        data: { permiso: 'CREAR_PERMISOS' },
        children: [
            {
                path: '',
                loadComponent: function () {
                    return Promise.resolve().then(function () { return require('./pages/roles-permisos/pages/roles-permisos-listado/role-permission-listado.component'); }).then(function (m) { return m.RolePermissionListadoComponent; });
                }
            },
            {
                path: 'roles',
                loadComponent: function () {
                    return Promise.resolve().then(function () { return require('./pages/roles-permisos/roles/pages/roles-listado/roles-listado.component'); }).then(function (m) { return m.RolesListadoComponent; });
                }
            },
            {
                path: 'agregar-rol',
                loadComponent: function () {
                    return Promise.resolve().then(function () { return require('./pages/roles-permisos/roles/pages/agregar-rol/agregar-rol.component'); }).then(function (m) { return m.AgregarRolComponent; });
                },
                canDeactivate: [pending_changes_guard_1.pendingChangesGuard]
            },
            {
                path: 'editar-rol/:id',
                loadComponent: function () {
                    return Promise.resolve().then(function () { return require('./pages/roles-permisos/roles/pages/editar-role/editar-rol.component'); }).then(function (m) { return m.EditarRolComponent; });
                },
                canDeactivate: [pending_changes_guard_1.pendingChangesGuard]
            },
            {
                path: 'permisos',
                loadComponent: function () {
                    return Promise.resolve().then(function () { return require('./pages/roles-permisos/permisos/pages/permisos-listado/permisos-listado.component'); }).then(function (m) { return m.PermisosListadoComponent; });
                }
            },
            {
                path: 'agregar-permiso',
                loadComponent: function () {
                    return Promise.resolve().then(function () { return require('./pages/roles-permisos/permisos/pages/agregar-permiso/agregar-permiso.component'); }).then(function (m) { return m.AgregarPermisoComponent; });
                },
                canDeactivate: [pending_changes_guard_1.pendingChangesGuard]
            },
            {
                path: 'editar-permiso/:id',
                loadComponent: function () {
                    return Promise.resolve().then(function () { return require('./pages/roles-permisos/permisos/pages/editar-permiso/editar-permiso.component'); }).then(function (m) { return m.EditarPermisoComponent; });
                },
                canDeactivate: [pending_changes_guard_1.pendingChangesGuard]
            },
            {
                path: 'detalle-roles-permisos/:id',
                loadComponent: function () {
                    return Promise.resolve().then(function () { return require('./pages/roles-permisos/pages/detalle-roles-permisos/detalle-roles-permisos'); }).then(function (m) { return m.DetalleRolesPermisos; });
                }
            },
            {
                path: 'agregar-roles-permisos',
                loadComponent: function () {
                    return Promise.resolve().then(function () { return require('./pages/roles-permisos/pages/agregar-roles-permisos/agregar-roles-permisos.component'); }).then(function (m) { return m.AgregarRolesPermisosComponent; });
                },
                canDeactivate: [pending_changes_guard_1.pendingChangesGuard]
            },
            {
                path: 'editar-roles-permisos/:id',
                loadComponent: function () {
                    return Promise.resolve().then(function () { return require('./pages/roles-permisos/pages/editar-roles-permisos/editar-rol.component'); }).then(function (m) { return m.EditarRolComponent; });
                },
                canDeactivate: [pending_changes_guard_1.pendingChangesGuard]
            },
        ]
    },
    {
        path: 'clientes',
        children: [
            {
                path: '',
                loadComponent: function () {
                    return Promise.resolve().then(function () { return require('./pages/clientes/pages/clientes/clientes'); }).then(function (m) { return m.Clientes; });
                },
                canActivate: [role_guard_1.roleGuard],
                data: { permiso: 'VER_CLIENTE' }
            },
            {
                path: 'agregar-cliente',
                loadComponent: function () {
                    return Promise.resolve().then(function () { return require('./pages/clientes/pages/agregar-cliente/agregar-cliente'); }).then(function (m) { return m.AgregarCliente; });
                },
                canActivate: [role_guard_1.roleGuard],
                data: { permiso: 'CREAR_CLIENTE' }
            },
            {
                path: 'editar-cliente/:id',
                loadComponent: function () {
                    return Promise.resolve().then(function () { return require('./pages/clientes/pages/editar-cliente/editar-cliente'); }).then(function (m) { return m.EditarCliente; });
                },
                canActivate: [role_guard_1.roleGuard],
                data: { permiso: 'EDITAR_CLIENTE' }
            },
            {
                path: 'seguimiento-cliente/:id',
                loadComponent: function () {
                    return Promise.resolve().then(function () { return require('./pages/clientes/pages/cliente-seguimiento/cliente-seguimiento'); }).then(function (m) { return m.ClienteSeguimiento; });
                },
                canActivate: [role_guard_1.roleGuard],
                data: { permiso: 'SEGUIMIENTO-CLIENTE' }
            },
        ]
    },
    {
        path: 'proveedores',
        children: [
            {
                path: '',
                loadComponent: function () {
                    return Promise.resolve().then(function () { return require('./pages/gestion-proveedor/proveedor-listado/proveedor-listado'); }).then(function (m) { return m.ProveedorListado; });
                },
                canActivate: [role_guard_1.roleGuard],
                data: { permiso: 'VER_PROVEEDORES' }
            },
            {
                path: 'crear',
                loadComponent: function () {
                    return Promise.resolve().then(function () { return require('./pages/gestion-proveedor/proveedor-formulario/proveedor-formulario'); }).then(function (m) { return m.ProveedorFormulario; });
                },
                canActivate: [role_guard_1.roleGuard],
                data: { permiso: 'CREAR_PROVEEDORES' }
            },
            {
                path: 'editar/:id',
                loadComponent: function () {
                    return Promise.resolve().then(function () { return require('./pages/gestion-proveedor/proveedor-formulario/proveedor-formulario'); }).then(function (m) { return m.ProveedorFormulario; });
                },
                canActivate: [role_guard_1.roleGuard],
                data: { permiso: 'EDITAR_PROVEEDORES' }
            },
            {
                path: 'ver-detalle/:id',
                loadComponent: function () {
                    return Promise.resolve().then(function () { return require('./pages/gestion-proveedor/proveedor-detalles/proveedor-detalles'); }).then(function (m) { return m.ProveedorDetalles; });
                },
                canActivate: [role_guard_1.roleGuard],
                data: { permiso: 'VER_PROVEEDORES' }
            },
        ]
    },
    {
        path: 'gestion-productos',
        children: [
            {
                path: '',
                loadComponent: function () {
                    return Promise.resolve().then(function () { return require('./pages/gestion-productos/productos-listado/gestion-listado'); }).then(function (m) { return m.GestionListado; });
                },
                canActivate: [role_guard_1.roleGuard],
                data: { permiso: 'VER_PRODUCTOS' }
            },
            {
                path: 'crear-producto',
                loadComponent: function () {
                    return Promise.resolve().then(function () { return require('./pages/gestion-productos/productos-formulario/productos-formulario'); }).then(function (m) { return m.ProductosFormulario; });
                },
                canActivate: [role_guard_1.roleGuard],
                data: { permiso: 'CREAR_PRODUCTOS' }
            },
            {
                path: 'editar-producto/:id',
                loadComponent: function () {
                    return Promise.resolve().then(function () { return require('./pages/gestion-productos/productos-formulario/productos-formulario'); }).then(function (m) { return m.ProductosFormulario; });
                },
                canActivate: [role_guard_1.roleGuard],
                data: { permiso: 'EDITAR_PRODUCTOS' }
            },
            {
                path: 'ver-detalle-producto/:id',
                loadComponent: function () {
                    return Promise.resolve().then(function () { return require('./pages/gestion-productos/productos-detalles/productos-detalles'); }).then(function (m) { return m.ProductosDetalles; });
                },
                canActivate: [role_guard_1.roleGuard],
                data: { permiso: 'VER_PRODUCTOS' }
            },
        ]
    },
    {
        path: 'transferencia',
        children: [
            {
                path: '',
                loadComponent: function () {
                    return Promise.resolve().then(function () { return require('./pages/reportes/pages/transferencia/transferencia'); }).then(function (m) { return m.Transferencia; });
                },
                canActivate: [role_guard_1.roleGuard],
                data: { permiso: 'VER_TRANSFERENCIA' }
            },
            {
                path: 'nueva-transferencia',
                loadComponent: function () {
                    return Promise.resolve().then(function () { return require('./pages/reportes/pages/nueva-transferencia/nueva-transferencia'); }).then(function (m) { return m.NuevaTransferencia; });
                },
                canActivate: [role_guard_1.roleGuard],
                data: { permiso: 'CREAR_TRANSFERENCIA' }
            },
            {
                path: 'solicitud-transferencia/:id',
                loadComponent: function () {
                    return Promise.resolve().then(function () { return require('./pages/reportes/pages/detalle-transferencia/detalle-transferencia'); }).then(function (m) { return m.DetalleTransferencia; });
                },
                canActivate: [role_guard_1.roleGuard],
                data: { permiso: 'VER_TRANSFERENCIA' }
            },
        ]
    },
    { path: 'transferencias', redirectTo: 'transferencia', pathMatch: 'full' },
    {
        path: 'transferencias/nueva-transferencia',
        redirectTo: 'transferencia/nueva-transferencia',
        pathMatch: 'full'
    },
    {
        path: 'transferencias/solicitud-transferencia/:id',
        redirectTo: 'transferencia/solicitud-transferencia/:id',
        pathMatch: 'full'
    },
    {
        path: 'transferencias/notificacion',
        redirectTo: 'transferencia/notificacion',
        pathMatch: 'full'
    },
    {
        path: 'caja',
        loadComponent: function () { return Promise.resolve().then(function () { return require('../ventas/pages/caja/caja.page'); }).then(function (m) { return m.CajaPage; }); }
    },
    {
        path: 'generar-ventas-administracion',
        loadComponent: function () {
            return Promise.resolve().then(function () { return require('./pages/generar-ventas-administracion/generar-ventas-administracion'); }).then(function (m) { return m.GenerarVentasAdministracion; });
        },
        canActivate: [role_guard_1.roleGuard, cashbox_guard_1.CashboxAdminGuard],
        data: { permiso: 'CREAR_VENTA' }
    },
    {
        path: 'historial-ventas-administracion',
        loadComponent: function () {
            return Promise.resolve().then(function () { return require('./pages/historial-ventas-administracion/historial-ventas-administracion'); }).then(function (m) { return m.HistorialVentasAdministracion; });
        },
        canActivate: [role_guard_1.roleGuard],
        data: { permiso: 'VER_VENTAS' }
    },
    {
        path: 'detalles-ventas-administracion/:id',
        loadComponent: function () {
            return Promise.resolve().then(function () { return require('./shared/detalles-ventas-administracion/detalles-ventas-administracion'); }).then(function (m) { return m.DetallesVentasAdministracion; });
        },
        canActivate: [role_guard_1.roleGuard],
        data: { permiso: 'VER_VENTAS' }
    },
    {
        path: 'nota-credito',
        children: [
            {
                path: '',
                loadComponent: function () {
                    return Promise.resolve().then(function () { return require('./pages/nota-credito/nota-credito'); }).then(function (m) { return m.NotasCreditoComponent; });
                },
                canActivate: [role_guard_1.roleGuard],
                data: { permiso: 'VER_NC' }
            },
            {
                path: 'detalle-nota-credito/:id',
                loadComponent: function () {
                    return Promise.resolve().then(function () { return require('./pages/nota-credito/detalle-nota-credito/detalle-nota-credito'); }).then(function (m) { return m.DetalleNotaCreditoComponent; });
                },
                canActivate: [role_guard_1.roleGuard],
                data: { permiso: 'VER_NC' }
            },
            {
                path: 'crear',
                loadComponent: function () {
                    return Promise.resolve().then(function () { return require('./pages/nota-credito/agregar-nota-credito/agregar-nota-credito'); }).then(function (m) { return m.AgregarNotaCreditoComponent; });
                },
                canActivate: [role_guard_1.roleGuard],
                data: { permiso: 'VER_NC' }
            },
        ]
    },
    {
        path: 'ventas-por-cobrar',
        canActivate: [role_guard_1.roleGuard],
        data: { permiso: 'VER_VENTA_POR_COBRAR' },
        children: [
            {
                path: '',
                loadComponent: function () {
                    return Promise.resolve().then(function () { return require('./pages/ventas-por-cobrar/ventas-por-cobrar-listado/ventas-por-cobrar-listado'); }).then(function (m) { return m.VentasPorCobrarListadoComponent; });
                }
            },
            {
                path: 'agregar',
                loadComponent: function () {
                    return Promise.resolve().then(function () { return require('./pages/ventas-por-cobrar/ventas-por-cobrar-formulario/ventas-por-cobrar-formulario'); }).then(function (m) { return m.VentasPorCobrarFormulario; });
                }
            },
            {
                path: 'detalles/:id',
                loadComponent: function () {
                    return Promise.resolve().then(function () { return require('./pages/ventas-por-cobrar/detalle-ventas-por-cobrar-formulario/detalle-ventas-por-cobrar-formulario'); }).then(function (m) { return m.DetalleVentaPorCobrar; });
                }
            },
            {
                path: 'pagar/:id',
                loadComponent: function () {
                    return Promise.resolve().then(function () { return require('./pages/ventas-por-cobrar/ventas-por-cobrar-pago/ventas-por-cobrar-pago.component'); }).then(function (m) { return m.VentasPorCobrarPagoComponent; });
                }
            },
        ]
    },
    { path: 'agregar-ventas-por-cobrar', redirectTo: 'ventas-por-cobrar/agregar', pathMatch: 'full' },
    {
        path: 'detalles-ventas-por-cobrar/:id',
        redirectTo: 'ventas-por-cobrar/detalles/:id',
        pathMatch: 'full'
    },
    {
        path: 'pagar-ventas-por-cobrar/:id',
        redirectTo: 'ventas-por-cobrar/pagar/:id',
        pathMatch: 'full'
    },
    {
        path: 'cotizaciones-compra',
        children: [
            {
                path: '',
                loadComponent: function () {
                    return Promise.resolve().then(function () { return require('./pages/gestion-cotizacion-compra/gestion-listado/gestion-compras-listado'); }).then(function (m) { return m.GestionComprasComponent; });
                },
                canActivate: [role_guard_1.roleGuard],
                data: { permiso: 'VER_COTIZACIONES_COMPRA' }
            },
            {
                path: 'agregar-cotizaciones',
                loadComponent: function () {
                    return Promise.resolve().then(function () { return require('./pages/gestion-cotizacion-compra/gestion-formulario/cotizacion-compra-formulario'); }).then(function (m) { return m.CotizacionCompraFormulario; });
                },
                canActivate: [role_guard_1.roleGuard],
                data: { permiso: 'CREAR_COTIZACIONES_COMPRA' }
            },
            {
                path: 'ver-detalle-cotizacion/:id',
                loadComponent: function () {
                    return Promise.resolve().then(function () { return require('./pages/gestion-cotizacion-compra/detalle-gestion-formulario/detalle-cotizacion-formulario'); }).then(function (m) { return m.DetalleCotizacionComponent; });
                },
                canActivate: [role_guard_1.roleGuard],
                data: { permiso: 'VER_COTIZACIONES_COMPRA' }
            },
        ]
    },
    {
        path: 'cotizaciones-venta',
        children: [
            {
                path: '',
                loadComponent: function () {
                    return Promise.resolve().then(function () { return require('./pages/gestion-cotizacion-venta/gestion-listado/gestion-listado'); }).then(function (m) { return m.GestionCotizacionesComponent; });
                },
                canActivate: [role_guard_1.roleGuard],
                data: { permiso: 'VER_COTIZACIONES_VENTA' }
            },
            {
                path: 'agregar-cotizaciones',
                loadComponent: function () {
                    return Promise.resolve().then(function () { return require('./pages/gestion-cotizacion-venta/gestion-formulario/cotizacion-formulario'); }).then(function (m) { return m.CotizacionFormulario; });
                },
                canActivate: [role_guard_1.roleGuard],
                data: { permiso: 'CREAR_COTIZACIONES_VENTA' }
            },
            {
                path: 'ver-detalle-cotizacion/:id',
                loadComponent: function () {
                    return Promise.resolve().then(function () { return require('./pages/gestion-cotizacion-venta/detalle-gestion-formulario/detalle-cotizacion-formulario'); }).then(function (m) { return m.DetalleCotizacionComponent; });
                },
                canActivate: [role_guard_1.roleGuard],
                data: { permiso: 'VER_COTIZACIONES_VENTA' }
            },
        ]
    },
    { path: 'agregar-cotizaciones', redirectTo: 'cotizaciones/agregar', pathMatch: 'full' },
    {
        path: 'ver-detalle-cotizacion/:id',
        redirectTo: 'cotizaciones/ver-detalle-cotizacion/:id',
        pathMatch: 'full'
    },
    {
        path: 'promociones',
        children: [
            {
                path: '',
                loadComponent: function () {
                    return Promise.resolve().then(function () { return require('./pages/gestion-promociones/promociones-listado/promociones-listado'); }).then(function (m) { return m.PromocionesListado; });
                },
                canActivate: [role_guard_1.roleGuard],
                data: { permiso: 'VER_PROMOCION' }
            },
            {
                path: 'crear',
                loadComponent: function () {
                    return Promise.resolve().then(function () { return require('./pages/gestion-promociones/promociones-formulario/promociones-formulario'); }).then(function (m) { return m.PromocionesFormulario; });
                },
                canActivate: [role_guard_1.roleGuard],
                data: { permiso: 'CREAR_PROMOCION' }
            },
            {
                path: 'editar/:id',
                loadComponent: function () {
                    return Promise.resolve().then(function () { return require('./pages/gestion-promociones/promociones-formulario/promociones-formulario'); }).then(function (m) { return m.PromocionesFormulario; });
                },
                canActivate: [role_guard_1.roleGuard],
                data: { permiso: 'EDITAR_PROMOCION' }
            },
            {
                path: 'ver-detalle/:id',
                loadComponent: function () {
                    return Promise.resolve().then(function () { return require('./pages/gestion-promociones/promociones-detalles/promociones-detalles'); }).then(function (m) { return m.PromocionesDetalles; });
                },
                canActivate: [role_guard_1.roleGuard],
                data: { permiso: 'VER_PROMOCION' }
            },
        ]
    },
    {
        path: 'descuentos',
        children: [
            {
                path: '',
                loadComponent: function () {
                    return Promise.resolve().then(function () { return require('./pages/descuento/pages/descuento/descuento'); }).then(function (m) { return m.DescuentoPage; });
                },
                canActivate: [role_guard_1.roleGuard],
                data: { permiso: 'VER_DESCUENTO' }
            },
            {
                path: 'agregar-descuento',
                loadComponent: function () {
                    return Promise.resolve().then(function () { return require('./pages/descuento/pages/agregar-descuento/agregar-descuento'); }).then(function (m) { return m.AgregarDescuento; });
                },
                canActivate: [role_guard_1.roleGuard],
                data: { permiso: 'CREAR_DESCUENTO' }
            },
            {
                path: 'editar-descuento/:id',
                loadComponent: function () {
                    return Promise.resolve().then(function () { return require('./pages/descuento/pages/editar-descuento/editar-descuento'); }).then(function (m) { return m.EditarDescuento; });
                },
                canActivate: [role_guard_1.roleGuard],
                data: { permiso: 'EDITAR_DESCUENTO' }
            },
        ]
    },
    {
        path: 'comision',
        children: [
            {
                path: '',
                loadComponent: function () { return Promise.resolve().then(function () { return require('./pages/comision/comision'); }).then(function (m) { return m.Comision; }); },
                canActivate: [role_guard_1.roleGuard],
                data: { permiso: 'VER_COMISIONES' }
            },
            {
                path: 'regla',
                loadComponent: function () {
                    return Promise.resolve().then(function () { return require('./pages/comision/comision-regla/comisionregla'); }).then(function (m) { return m.ComisionRegla; });
                },
                canActivate: [role_guard_1.roleGuard],
                data: { permiso: 'CREAR_COMISIONES' }
            },
            {
                path: 'reportes',
                loadComponent: function () {
                    return Promise.resolve().then(function () { return require('./pages/comision/comision-reportes/comisionreportes'); }).then(function (m) { return m.ComisionReportes; });
                },
                canActivate: [role_guard_1.roleGuard],
                data: { permiso: 'VER_COMISIONES' }
            },
            {
                path: 'regla/:id',
                loadComponent: function () {
                    return Promise.resolve().then(function () { return require('./pages/comision/editar-comision/comisionregla'); }).then(function (m) { return m.ComisionRegla; });
                },
                canActivate: [role_guard_1.roleGuard],
                data: { permiso: 'EDITAR_COMISIONES' }
            },
        ]
    },
    { path: 'comision-regla', redirectTo: 'comision/regla', pathMatch: 'full' },
    { path: 'comision-reportes', redirectTo: 'comision/reportes', pathMatch: 'full' },
    {
        path: 'mermas',
        children: [
            {
                path: '',
                loadComponent: function () {
                    return Promise.resolve().then(function () { return require('./pages/mermas/pages/mermas-pr/mermas-pr'); }).then(function (m) { return m.MermasPr; });
                },
                canActivate: [role_guard_1.roleGuard],
                data: { permiso: 'VER_MERMAS' }
            },
            {
                path: 'detalle-merma/:id',
                loadComponent: function () {
                    return Promise.resolve().then(function () { return require('./pages/mermas/pages/mermas-detalle/mermas-detalle'); }).then(function (m) { return m.MermasDetalle; });
                },
                canActivate: [role_guard_1.roleGuard],
                data: { permiso: 'VER_MERMAS' }
            },
            {
                path: 'registro-merma',
                loadComponent: function () {
                    return Promise.resolve().then(function () { return require('./pages/mermas/pages/mermas-registro/mermas-registro'); }).then(function (m) { return m.MermasRegistro; });
                },
                canActivate: [role_guard_1.roleGuard],
                data: { permiso: 'CREAR_MERMAS' }
            },
            {
                path: 'edicion-merma/:id',
                loadComponent: function () {
                    return Promise.resolve().then(function () { return require('./pages/mermas/pages/mermas-listado/mermas-editar'); }).then(function (m) { return m.MermasEditar; });
                },
                canActivate: [role_guard_1.roleGuard],
                data: { permiso: 'EDITAR_MERMAS' }
            },
        ]
    },
    {
        path: 'remates',
        children: [
            {
                path: '',
                loadComponent: function () {
                    return Promise.resolve().then(function () { return require('./pages/remates/pages/remates-pr/remates-pr'); }).then(function (m) { return m.RematesPr; });
                },
                canActivate: [role_guard_1.roleGuard],
                data: { permiso: 'VER_REMATES' }
            },
            {
                path: 'registro-remate',
                loadComponent: function () {
                    return Promise.resolve().then(function () { return require('./pages/remates/pages/remates-registro/remates-registro'); }).then(function (m) { return m.RematesRegistro; });
                },
                canActivate: [role_guard_1.roleGuard],
                data: { permiso: 'CREAR_REMATES' }
            },
            {
                path: 'editar-remate/:id',
                loadComponent: function () {
                    return Promise.resolve().then(function () { return require('./pages/remates/pages/remates-list/editar-remate'); }).then(function (m) { return m.EditarRemateComponent; });
                },
                canActivate: [role_guard_1.roleGuard],
                data: { permiso: 'EDITAR_REMATES' }
            },
            {
                path: 'detalle-remate/:id',
                loadComponent: function () {
                    return Promise.resolve().then(function () { return require('./pages/remates/pages/remates-detalle/remates-detalle'); }).then(function (m) { return m.DetalleRemateComponent; });
                },
                canActivate: [role_guard_1.roleGuard],
                data: { permiso: 'VER_REMATES' }
            },
        ]
    },
    {
        path: 'documento-contador',
        children: [
            {
                path: '',
                loadComponent: function () {
                    return Promise.resolve().then(function () { return require('./pages/contador/pages/documento-contador/documento-contador'); }).then(function (m) { return m.DocumentoContador; });
                },
                canActivate: [role_guard_1.roleGuard],
                data: { permiso: 'AGREGAR_DOCUMENTO' }
            },
            {
                path: ':id',
                loadComponent: function () {
                    return Promise.resolve().then(function () { return require('./pages/contador/pages/detalle-comprobante/detalle-comprobante'); }).then(function (m) { return m.DetalleComprobante; });
                },
                canActivate: [role_guard_1.roleGuard],
                data: { permiso: 'AGREGAR_DOCUMENTO' }
            },
        ]
    },
    {
        path: 'despacho-productos',
        loadComponent: function () {
            return Promise.resolve().then(function () { return require('./pages/despacho-productos/pages/listado-despacho/listado-despacho'); }).then(function (m) { return m.ListadoDespacho; });
        },
        canActivate: [role_guard_1.roleGuard],
        data: { permiso: 'VER_DESPACHO' }
    },
    {
        path: 'despacho-productos/detalle-despacho/:id',
        loadComponent: function () {
            return Promise.resolve().then(function () { return require('./pages/despacho-productos/pages/detalles-despacho/detalles-despacho'); }).then(function (m) { return m.DetallesDespacho; });
        },
        canActivate: [role_guard_1.roleGuard],
        data: { permiso: 'VER_DESPACHO' }
    },
    {
        path: 'despacho-productos/agregar-despacho',
        loadComponent: function () {
            return Promise.resolve().then(function () { return require('./pages/despacho-productos/pages/agregar-despacho/agregar-despacho'); }).then(function (m) { return m.AgregarDespacho; });
        },
        canActivate: [role_guard_1.roleGuard],
        data: { permiso: 'VER_DESPACHO' }
    },
    {
        path: 'despacho-productos/confirmar-despacho',
        loadComponent: function () {
            return Promise.resolve().then(function () { return require('./pages/despacho-productos/pages/confirmar-despacho/confirmar-despacho'); }).then(function (m) { return m.ConfirmarDespacho; });
        },
        canActivate: [role_guard_1.roleGuard],
        data: { permiso: 'CONFIRMAR_DESPACHO' }
    },
    {
        path: 'despacho-productos/editar-despacho/:id',
        loadComponent: function () {
            return Promise.resolve().then(function () { return require('./pages/despacho-productos/pages/editar-despacho/editar-despacho'); }).then(function (m) { return m.EditarDespacho; });
        },
        canActivate: [role_guard_1.roleGuard],
        data: { permiso: 'EDITAR_DESPACHO' }
    },
    {
        path: 'conteo-inventario',
        children: [
            {
                path: '',
                loadComponent: function () {
                    return Promise.resolve().then(function () { return require('../logistica/pages/conteo-inventario/conteoinventario'); }).then(function (m) { return m.ConteoInventarios; });
                },
                canActivate: [role_guard_1.roleGuard],
                data: { permiso: 'CONTEO_INVENTARIO' }
            },
            {
                path: 'crear',
                loadComponent: function () {
                    return Promise.resolve().then(function () { return require('../logistica/pages/conteo-crear/conteocrear'); }).then(function (m) { return m.ConteoCrear; });
                },
                canActivate: [role_guard_1.roleGuard],
                data: { permiso: 'CREAR_CONTEO_INVENTARIO' }
            },
            {
                path: 'detalle/:id',
                loadComponent: function () {
                    return Promise.resolve().then(function () { return require('../logistica/pages/conteo-detalle/conteodetalle'); }).then(function (m) { return m.ConteoDetalle; });
                },
                canActivate: [role_guard_1.roleGuard],
                data: { permiso: 'CONTEO_INVENTARIO' }
            },
        ]
    },
    { path: 'conteo-crear', redirectTo: 'conteo-inventario/crear', pathMatch: 'full' },
    { path: 'conteo-detalle/:id', redirectTo: 'conteo-inventario/detalle/:id', pathMatch: 'full' },
    {
        path: 'reclamos-listado',
        children: [
            {
                path: '',
                loadComponent: function () {
                    return Promise.resolve().then(function () { return require('../ventas/pages/reclamos-garantia/reclamos-listado/reclamos-listado'); }).then(function (m) { return m.ReclamosListado; });
                },
                canActivate: [role_guard_1.roleGuard],
                data: { permiso: 'VER_RECLAMO' }
            },
            {
                path: 'crear',
                loadComponent: function () {
                    return Promise.resolve().then(function () { return require('../ventas/pages/reclamos-garantia/reclamos-crear/reclamos-crear'); }).then(function (m) { return m.ReclamosCrear; });
                },
                canActivate: [role_guard_1.roleGuard],
                data: { permiso: 'CREAR_RECLAMO' }
            },
            {
                path: 'editar/:id',
                loadComponent: function () {
                    return Promise.resolve().then(function () { return require('../ventas/pages/reclamos-garantia/reclamos-editar/reclamos-editar'); }).then(function (m) { return m.ReclamosEditar; });
                },
                canActivate: [role_guard_1.roleGuard],
                data: { permiso: 'EDITAR_RECLAMO' }
            },
            {
                path: 'detalle/:id',
                loadComponent: function () {
                    return Promise.resolve().then(function () { return require('../ventas/pages/reclamos-garantia/reclamos-detalles/reclamos-detalles'); }).then(function (m) { return m.ReclamosDetalles; });
                },
                canActivate: [role_guard_1.roleGuard],
                data: { permiso: 'VER_RECLAMO' }
            },
        ]
    },
    {
        path: 'terminos-condiciones',
        loadComponent: function () {
            return Promise.resolve().then(function () { return require('./pages/reportes/pages/terminos-condiciones/terminos-condiciones'); }).then(function (m) { return m.TerminosCondicionesComponent; });
        }
    },
    {
        path: 'editar-condiciones',
        canActivate: [role_guard_1.roleGuard],
        data: { permiso: 'EDITAR_TERMINOS_CONDICIONES' },
        loadComponent: function () {
            return Promise.resolve().then(function () { return require('./pages/reportes/pages/terminos-condiciones/editar-terminos-condiciones/editar-terminos-condiciones'); }).then(function (m) { return m.EditarTerminosCondicionesComponent; });
        }
    },
    {
        path: 'gestion-delivery',
        canActivate: [role_guard_1.roleGuard],
        data: { permiso: 'ASIGNAR_DELIVERY' },
        children: [
            {
                path: '',
                loadComponent: function () {
                    return Promise.resolve().then(function () { return require('./pages/gestion-delivery/delivery-listado/delivery-listado'); }).then(function (m) { return m.DeliveryListado; });
                }
            },
            {
                path: 'formulario-delivery',
                loadComponent: function () {
                    return Promise.resolve().then(function () { return require('./pages/gestion-delivery/delivery-formulario/delivery-formulario'); }).then(function (m) { return m.DeliveryFormulario; });
                }
            },
            {
                path: 'detalle-delivery/:id',
                loadComponent: function () {
                    return Promise.resolve().then(function () { return require('./pages/gestion-delivery/delivery-detalles/delivery-detalles'); }).then(function (m) { return m.DeliveryDetalles; });
                }
            },
        ]
    },
];
