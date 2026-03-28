import { Routes } from '@angular/router';
import { pendingChangesGuard } from '../core/guards/pending-changes.guard';
import { CashboxAdminGuard } from '../ventas/guards/cashbox.guard';
import { roleGuard } from '../core/guards/role.guard';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'empresa/configuracion',
    loadComponent: () =>
      import('./pages/empresa/empresa-configuracion').then((m) => m.EmpresaConfiguracion),
    canActivate: [roleGuard],
    data: { permiso: 'MODIFICAR_EMPRESA' },
  },
  {
    path: 'empleados/:id/seguimiento',
    loadComponent: () =>
      import('./pages/usuarios/pages/empleado-seguimiento/seguimiento-empleado').then(
        (m) => m.SeguimientoEmpleado,
      ),
    canActivate: [roleGuard],
    data: { permiso: 'SEGUIMIENTO_EMPLEADO' },
  },
  {
    path: 'dashboard-admin',
    loadComponent: () =>
      import('./pages/dashboard-admin/dashboard-admin').then((m) => m.DashboardAdmin),
    canActivate: [roleGuard],
    data: { permiso: 'VER_DASHBOARD_ADMIN' },
  },
  {
    path: 'dashboard-almacen',
    loadComponent: () =>
      import('../almacen/pages/dashboard-almacen/dashboard-almacen').then(
        (m) => m.DashboardAlmacen,
      ),
    canActivate: [roleGuard],
    data: { permiso: 'VER_DASHBOARD_ALMACEN' },
  },
  {
    path: 'notificaciones',
    loadComponent: () =>
      import('./pages/notificacion-admin/notificacion-admin').then((m) => m.NotificacionAdmin),
    canActivate: [roleGuard],
    data: { permiso: 'VER_DASHBOARD_ADMIN' },
  },

  {
    path: 'usuarios',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/usuarios/pages/administracion-crear-usuario/administracion-crear-usuario').then(
            (m) => m.AdministracionCrearUsuario,
          ),
        canActivate: [roleGuard],
        data: { permiso: 'VER_USUARIOS' },
      },
      {
        path: 'crear-usuario',
        loadComponent: () =>
          import('./pages/usuarios/pages/administracion/administracion').then(
            (m) => m.Administracion,
          ),
        canActivate: [roleGuard],
        data: { permiso: 'CREAR_USUARIOS' },
      },
      {
        path: 'editar-usuario/:id',
        loadComponent: () =>
          import('./pages/usuarios/pages/administracion-editar-usuario/administracion-editar-usuario').then(
            (m) => m.AdministracionEditarUsuario,
          ),
        canActivate: [roleGuard],
        data: { permiso: 'EDITAR_USUARIOS' },
      },
    ],
  },

  {
    path: 'almacen',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/almacen/pages/listar-almacen/almacen').then((m) => m.AlmacenListado),
        canActivate: [roleGuard],
        data: { permiso: 'VER_ALMACEN' },
      },
      {
        path: 'crear-almacen',
        loadComponent: () =>
          import('./pages/almacen/pages/agregar-almacen/agregar-almacen').then(
            (m) => m.AlmacenCrear,
          ),
        canActivate: [roleGuard],
        data: { permiso: 'CREAR_ALMACEN' },
      },
      {
        path: 'editar-almacen/:id',
        loadComponent: () =>
          import('./pages/almacen/pages/editar-almacen/editar-almacen').then(
            (m) => m.AlmacenEditar,
          ),
        canActivate: [roleGuard],
        data: { permiso: 'EDITAR_ALMACEN' },
      },
    ],
  },

  {
    path: 'sedes',
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/sedes/pages/sedes/sedes').then((m) => m.Sedes),
        canActivate: [roleGuard],
        data: { permiso: 'VER_SEDES' },
      },
      {
        path: 'agregar-sede',
        loadComponent: () =>
          import('./pages/sedes/pages/agregar-sede/agregar-sede').then((m) => m.AgregarSede),
        canActivate: [roleGuard],
        data: { permiso: 'CREAR_SEDES' },
      },
      {
        path: 'editar-sede',
        loadComponent: () =>
          import('./pages/sedes/pages/editar-sede/editar-sede').then((m) => m.EditarSede),
        canActivate: [roleGuard],
        data: { permiso: 'EDITAR_SEDES' },
      },
    ],
  },

  {
    path: 'categoria',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/categoria/pages/categoria/categoria').then((m) => m.CategoriaListado),
        canActivate: [roleGuard],
        data: { permiso: 'VER_CATEGORIAS' },
      },
      {
        path: 'agregar-categoria',
        loadComponent: () =>
          import('./pages/categoria/pages/agregar-categoria/agregar-categoria').then(
            (m) => m.AgregarCategoria,
          ),
        canActivate: [roleGuard],
        data: { permiso: 'CREAR_CATEGORIAS' },
      },
      {
        path: 'editar-categoria/:id',
        loadComponent: () =>
          import('./pages/categoria/pages/editar-categoria/editar-categoria').then(
            (m) => m.EditarCategoria,
          ),
        canActivate: [roleGuard],
        data: { permiso: 'EDITAR_CATEGORIAS' },
      },
    ],
  },

  {
    path: 'roles-permisos',
    canActivate: [roleGuard],
    data: { permiso: 'CREAR_PERMISOS' },
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/roles-permisos/pages/roles-permisos-listado/role-permission-listado.component').then(
            (m) => m.RolePermissionListadoComponent,
          ),
      },
      {
        path: 'roles',
        loadComponent: () =>
          import('./pages/roles-permisos/roles/pages/roles-listado/roles-listado.component').then(
            (m) => m.RolesListadoComponent,
          ),
      },
      {
        path: 'agregar-rol',
        loadComponent: () =>
          import('./pages/roles-permisos/roles/pages/agregar-rol/agregar-rol.component').then(
            (m) => m.AgregarRolComponent,
          ),
        canDeactivate: [pendingChangesGuard],
      },
      {
        path: 'editar-rol/:id',
        loadComponent: () =>
          import('./pages/roles-permisos/roles/pages/editar-role/editar-rol.component').then(
            (m) => m.EditarRolComponent,
          ),
        canDeactivate: [pendingChangesGuard],
      },
      {
        path: 'permisos',
        loadComponent: () =>
          import('./pages/roles-permisos/permisos/pages/permisos-listado/permisos-listado.component').then(
            (m) => m.PermisosListadoComponent,
          ),
      },
      {
        path: 'agregar-permiso',
        loadComponent: () =>
          import('./pages/roles-permisos/permisos/pages/agregar-permiso/agregar-permiso.component').then(
            (m) => m.AgregarPermisoComponent,
          ),
        canDeactivate: [pendingChangesGuard],
      },
      {
        path: 'editar-permiso/:id',
        loadComponent: () =>
          import('./pages/roles-permisos/permisos/pages/editar-permiso/editar-permiso.component').then(
            (m) => m.EditarPermisoComponent,
          ),
        canDeactivate: [pendingChangesGuard],
      },
      {
        path: 'agregar-roles-permisos',
        loadComponent: () =>
          import('./pages/roles-permisos/pages/agregar-roles-permisos/agregar-roles-permisos.component').then(
            (m) => m.AgregarRolesPermisosComponent,
          ),
        canDeactivate: [pendingChangesGuard],
      },
      {
        path: 'editar-roles-permisos/:id',
        loadComponent: () =>
          import('./pages/roles-permisos/pages/editar-roles-permisos/editar-rol.component').then(
            (m) => m.EditarRolComponent,
          ),
        canDeactivate: [pendingChangesGuard],
      },
    ],
  },

  {
    path: 'clientes',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/clientes/pages/clientes/clientes').then((m) => m.Clientes),
        canActivate: [roleGuard],
        data: { permiso: 'VER_CLIENTE' },
      },
      {
        path: 'agregar-cliente',
        loadComponent: () =>
          import('./pages/clientes/pages/agregar-cliente/agregar-cliente').then(
            (m) => m.AgregarCliente,
          ),
        canActivate: [roleGuard],
        data: { permiso: 'CREAR_CLIENTE' },
      },
      {
        path: 'editar-cliente/:id',
        loadComponent: () =>
          import('./pages/clientes/pages/editar-cliente/editar-cliente').then(
            (m) => m.EditarCliente,
          ),
        canActivate: [roleGuard],
        data: { permiso: 'EDITAR_CLIENTE' },
      },
      {
        path: 'seguimiento-cliente/:id',
        loadComponent: () =>
          import('./pages/clientes/pages/cliente-seguimiento/cliente-seguimiento').then(
            (m) => m.ClienteSeguimiento,
          ),
        canActivate: [roleGuard],
        data: { permiso: 'SEGUIMIENTO-CLIENTE' },
      },
    ],
  },

  {
    path: 'proveedores',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/gestion-proveedor/proveedor-listado/proveedor-listado').then(
            (m) => m.ProveedorListado,
          ),
        canActivate: [roleGuard],
        data: { permiso: 'VER_PROVEEDORES' },
      },
      {
        path: 'crear',
        loadComponent: () =>
          import('./pages/gestion-proveedor/proveedor-formulario/proveedor-formulario').then(
            (m) => m.ProveedorFormulario,
          ),
        canActivate: [roleGuard],
        data: { permiso: 'CREAR_PROVEEDORES' },
      },
      {
        path: 'editar/:id',
        loadComponent: () =>
          import('./pages/gestion-proveedor/proveedor-formulario/proveedor-formulario').then(
            (m) => m.ProveedorFormulario,
          ),
        canActivate: [roleGuard],
        data: { permiso: 'EDITAR_PROVEEDORES' },
      },
      {
        path: 'ver-detalle/:id',
        loadComponent: () =>
          import('./pages/gestion-proveedor/proveedor-detalles/proveedor-detalles').then(
            (m) => m.ProveedorDetalles,
          ),
        canActivate: [roleGuard],
        data: { permiso: 'VER_PROVEEDORES' },
      },
    ],
  },

  {
    path: 'gestion-productos',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/gestion-productos/productos-listado/gestion-listado').then(
            (m) => m.GestionListado,
          ),
        canActivate: [roleGuard],
        data: { permiso: 'VER_PRODUCTOS' },
      },
      {
        path: 'crear-producto',
        loadComponent: () =>
          import('./pages/gestion-productos/productos-formulario/productos-formulario').then(
            (m) => m.ProductosFormulario,
          ),
        canActivate: [roleGuard],
        data: { permiso: 'CREAR_PRODUCTOS' },
      },
      {
        path: 'editar-producto/:id',
        loadComponent: () =>
          import('./pages/gestion-productos/productos-formulario/productos-formulario').then(
            (m) => m.ProductosFormulario,
          ),
        canActivate: [roleGuard],
        data: { permiso: 'EDITAR_PRODUCTOS' },
      },
      {
        path: 'ver-detalle-producto/:id',
        loadComponent: () =>
          import('./pages/gestion-productos/productos-detalles/productos-detalles').then(
            (m) => m.ProductosDetalles,
          ),
        canActivate: [roleGuard],
        data: { permiso: 'VER_PRODUCTOS' },
      },
    ],
  },

  {
    path: 'transferencia',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/reportes/pages/transferencia/transferencia').then((m) => m.Transferencia),
          canActivate: [roleGuard],
          data: { permiso: 'VER_TRANSFERENCIA' },
      },
      {
        path: 'nueva-transferencia',
        loadComponent: () =>
          import('./pages/reportes/pages/nueva-transferencia/nueva-transferencia').then(
            (m) => m.NuevaTransferencia,
          ),
          canActivate: [roleGuard],
          data: { permiso: 'CREAR_TRANSFERENCIA' },
      },
      {
        path: 'solicitud-transferencia/:id',
        loadComponent: () =>
          import('./pages/reportes/pages/detalle-transferencia/detalle-transferencia').then(
            (m) => m.DetalleTransferencia,
          ),
          canActivate: [roleGuard],
          data: { permiso: 'VER_TRANSFERENCIA' },
      },
    ],
  },
  { path: 'transferencias', redirectTo: 'transferencia', pathMatch: 'full' },
  {
    path: 'transferencias/nueva-transferencia',
    redirectTo: 'transferencia/nueva-transferencia',
    pathMatch: 'full',
  },
  {
    path: 'transferencias/solicitud-transferencia/:id',
    redirectTo: 'transferencia/solicitud-transferencia/:id',
    pathMatch: 'full',
  },
  {
    path: 'transferencias/notificacion',
    redirectTo: 'transferencia/notificacion',
    pathMatch: 'full',
  },

  {
    path: 'caja',
    loadComponent: () => import('../ventas/pages/caja/caja.page').then((m) => m.CajaPage),
    canActivate: [roleGuard],
    data: { permiso: 'VER_CAJA' },
  },
  {
    path: 'generar-ventas-administracion',
    loadComponent: () =>
      import('./pages/generar-ventas-administracion/generar-ventas-administracion').then(
        (m) => m.GenerarVentasAdministracion,
      ),
    canActivate: [roleGuard, CashboxAdminGuard],
    data: { permiso: 'CREAR_VENTA_ADMIN' },
  },
  {
    path: 'historial-ventas-administracion',
    loadComponent: () =>
      import('./pages/historial-ventas-administracion/historial-ventas-administracion').then(
        (m) => m.HistorialVentasAdministracion,
      ),
    canActivate: [roleGuard],
    data: { permiso: 'VER_VENTAS_ADMIN' },
  },
  {
    path: 'detalles-ventas-administracion/:id',
    loadComponent: () =>
      import('./shared/detalles-ventas-administracion/detalles-ventas-administracion').then(
        (m) => m.DetallesVentasAdministracion,
      ),
    canActivate: [roleGuard],
    data: { permiso: 'VER_VENTAS_ADMIN' },
  },
  {
    path: 'nota-credito',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/nota-credito/nota-credito').then((m) => m.NotasCreditoComponent),
          //canActivate: [roleGuard],
          //data: { permiso: 'VER_NOTA_CREDITO' },
      },
      {
        path: 'crear',
        loadComponent: () =>
          import('./pages/nota-credito/agregar-nota-credito/agregar-nota-credito').then((m) => m.AgregarNotaCreditoComponent,),
          //canActivate: [roleGuard],
          //data: { permiso: 'CREAR_NOTA_CREDITO' },
      },
    ],
  },
  {
    path: 'ventas-por-cobrar',
    canActivate: [roleGuard],
    data: { permiso: 'CREAR_VENTA_POR_COBRAR' },
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/ventas-por-cobrar/ventas-por-cobrar-listado/ventas-por-cobrar-listado').then(
            (m) => m.VentasPorCobrarListadoComponent,
          ),
      },
      {
        path: 'agregar',
        loadComponent: () =>
          import('./pages/ventas-por-cobrar/ventas-por-cobrar-formulario/ventas-por-cobrar-formulario').then(
            (m) => m.VentasPorCobrarFormulario,
          ),
      },
      {
        path: 'detalles/:id',
        loadComponent: () =>
          import('./pages/ventas-por-cobrar/detalle-ventas-por-cobrar-formulario/detalle-ventas-por-cobrar-formulario').then(
            (m) => m.DetalleVentaPorCobrar,
          ),
      },
      {
        path: 'pagar/:id',
        loadComponent: () =>
          import('./pages/ventas-por-cobrar/ventas-por-cobrar-pago/ventas-por-cobrar-pago.component').then(
            (m) => m.VentasPorCobrarPagoComponent,
          ),
      },
    ],
  },
  { path: 'agregar-ventas-por-cobrar', redirectTo: 'ventas-por-cobrar/agregar', pathMatch: 'full' },
  {
    path: 'detalles-ventas-por-cobrar/:id',
    redirectTo: 'ventas-por-cobrar/detalles/:id',
    pathMatch: 'full',
  },
  {
    path: 'pagar-ventas-por-cobrar/:id',
    redirectTo: 'ventas-por-cobrar/pagar/:id',
    pathMatch: 'full',
  },

  {
    path: 'cotizaciones-compra',

    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/gestion-cotizacion-compra/gestion-listado/gestion-compras-listado').then(
            (m) => m.GestionComprasComponent,
          ),
          canActivate: [roleGuard],
          data: { permiso: 'VER_COTIZACIONES_COMPRA' },
      },
      {
        path: 'agregar-cotizaciones',
        loadComponent: () =>
          import('./pages/gestion-cotizacion-compra/gestion-formulario/cotizacion-compra-formulario').then(
            (m) => m.CotizacionCompraFormulario,
          ),
          canActivate: [roleGuard],
          data: { permiso: 'CREAR_COTIZACIONES_COMPRA' },
      },
      {
        path: 'ver-detalle-cotizacion/:id',
        loadComponent: () =>
          import('./pages/gestion-cotizacion-compra/detalle-gestion-formulario/detalle-cotizacion-formulario').then(
            (m) => m.DetalleCotizacionComponent,
          ),
          canActivate: [roleGuard],
          data: { permiso: 'VER_COTIZACIONES_COMPRA' },
      },
    ],
  },
  {
    path: 'cotizaciones-venta',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/gestion-cotizacion-venta/gestion-listado/gestion-listado').then(
            (m) => m.GestionCotizacionesComponent,
          ),
          canActivate: [roleGuard],
          data: { permiso: 'VER_COTIZACIONES_VENTA' },
      },
      {
        path: 'agregar-cotizaciones',
        loadComponent: () =>
          import('./pages/gestion-cotizacion-venta/gestion-formulario/cotizacion-formulario').then(
            (m) => m.CotizacionFormulario,
          ),
          canActivate: [roleGuard],
          data: { permiso: 'CREAR_COTIZACIONES_VENTA' },
      },
      {
        path: 'ver-detalle-cotizacion/:id',
        loadComponent: () =>
          import('./pages/gestion-cotizacion-venta/detalle-gestion-formulario/detalle-cotizacion-formulario').then(
            (m) => m.DetalleCotizacionComponent,
          ),
          canActivate: [roleGuard],
          data: { permiso: 'VER_COTIZACIONES_VENTA' },
      },
    ],
  },

  { path: 'agregar-cotizaciones', redirectTo: 'cotizaciones/agregar', pathMatch: 'full' },
  {
    path: 'ver-detalle-cotizacion/:id',
    redirectTo: 'cotizaciones/ver-detalle-cotizacion/:id',
    pathMatch: 'full',
  },

  {
    path: 'promociones',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/gestion-promociones/promociones-listado/promociones-listado').then(
            (m) => m.PromocionesListado,
          ),
          canActivate: [roleGuard],
          data: { permiso: 'VER_PROMOCION' },
      },
      {
        path: 'crear',
        loadComponent: () =>
          import('./pages/gestion-promociones/promociones-formulario/promociones-formulario').then(
            (m) => m.PromocionesFormulario,
          ),
          canActivate: [roleGuard],
          data: { permiso: 'CREAR_PROMOCION' },
      },
      {
        path: 'editar/:id',
        loadComponent: () =>
          import('./pages/gestion-promociones/promociones-formulario/promociones-formulario').then(
            (m) => m.PromocionesFormulario,
          ),
          canActivate: [roleGuard],
          data: { permiso: 'EDITAR_PROMOCION' },
      },
      {
        path: 'ver-detalle/:id',
        loadComponent: () =>
          import('./pages/gestion-promociones/promociones-detalles/promociones-detalles').then(
            (m) => m.PromocionesDetalles,
          ),
          canActivate: [roleGuard],
          data: { permiso: 'VER_PROMOCION' },
      },
    ],
  },

  {
    path: 'descuentos',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/descuento/pages/descuento/descuento').then((m) => m.DescuentoPage),
          canActivate: [roleGuard],
          data: { permiso: 'VER_DESCUENTO' },
      },
      {
        path: 'agregar-descuento',
        loadComponent: () =>
          import('./pages/descuento/pages/agregar-descuento/agregar-descuento').then(
            (m) => m.AgregarDescuento,
          ),
          canActivate: [roleGuard],
          data: { permiso: 'CREAR_DESCUENTO' },
      },
      {
        path: 'editar-descuento/:id',
        loadComponent: () =>
          import('./pages/descuento/pages/editar-descuento/editar-descuento').then(
            (m) => m.EditarDescuento,
          ),
          canActivate: [roleGuard],
          data: { permiso: 'EDITAR_DESCUENTO' },    
      },
    ],
  },

  {
    path: 'comision',
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/comision/comision').then((m) => m.Comision),
          canActivate: [roleGuard],
          data: { permiso: 'VER_COMISIONES' },
      },
      {
        path: 'regla',
        loadComponent: () =>
          import('./pages/comision/comision-regla/comisionregla').then((m) => m.ComisionRegla),
          canActivate: [roleGuard],
          data: { permiso: 'CREAR_COMISIONES' },
      },
      {
        path: 'reportes',
        loadComponent: () =>
          import('./pages/comision/comision-reportes/comisionreportes').then(
            (m) => m.ComisionReportes,
          ),
          canActivate: [roleGuard],
          data: { permiso: 'VER_COMISIONES' },
      },
      {
        path: 'regla/:id',
        loadComponent: () =>
          import('./pages/comision/editar-comision/comisionregla').then((m) => m.ComisionRegla),
          canActivate: [roleGuard],
          data: { permiso: 'EDITAR_COMISIONES' },
      },
    ],
  },
  { path: 'comision-regla', redirectTo: 'comision/regla', pathMatch: 'full' },
  { path: 'comision-reportes', redirectTo: 'comision/reportes', pathMatch: 'full' },

  {
    path: 'mermas',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/mermas/pages/mermas-pr/mermas-pr').then((m) => m.MermasPr),
          canActivate: [roleGuard],
          data: { permiso: 'VER_MERMAS' },
      },
      {
        path: 'registro-merma',
        loadComponent: () =>
          import('./pages/mermas/pages/mermas-registro/mermas-registro').then(
            (m) => m.MermasRegistro,
          ),
          canActivate: [roleGuard],
          data: { permiso: 'CREAR_MERMAS' },
      },
      {
        path: 'edicion-merma/:id',
        loadComponent: () =>
          import('./pages/mermas/pages/mermas-listado/mermas-editar').then((m) => m.MermasEditar),
          canActivate: [roleGuard],
          data: { permiso: 'EDITAR_MERMAS' },
      },
    ],
  },

  {
    path: 'remates',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/remates/pages/remates-pr/remates-pr').then((m) => m.RematesPr),
          canActivate: [roleGuard],
          data: { permiso: 'VER_REMATES' },
      },
      {
        path: 'registro-remate',
        loadComponent: () =>
          import('./pages/remates/pages/remates-registro/remates-registro').then(
            (m) => m.RematesRegistro,
          ),
          canActivate: [roleGuard],
          data: { permiso: 'CREAR_REMATES' },
      },
      {
        path: 'editar-remate/:id',
        loadComponent: () =>
          import('./pages/remates/pages/remates-list/editar-remate').then(
            (m) => m.EditarRemateComponent,
          ),
          canActivate: [roleGuard],
          data: { permiso: 'EDITAR_REMATES' },
      },
    ],
  },

  {
    path: 'documento-contador',
    loadComponent: () =>
      import('./pages/contador/pages/documento-contador/documento-contador').then(
        (m) => m.DocumentoContador,
      ),
    canActivate: [roleGuard],
    data: { permiso: 'AGREGAR_DOCUMENTO' }
  },

  {
    path: 'despacho-productos',
    loadComponent: () =>
      import('./pages/despacho-productos/pages/listado-despacho/listado-despacho').then(
        (m) => m.ListadoDespacho,
      ),
    canActivate: [roleGuard],
    data: { permiso: 'CREAR_DESPACHO' },
  },
  {
    path: 'despacho-productos/detalle-despacho/:id',
    loadComponent: () =>
      import('./pages/despacho-productos/pages/detalles-despacho/detalles-despacho').then(
        (m) => m.DetallesDespacho,
      ),
    canActivate: [roleGuard],
    data: { permiso: 'CREAR_DESPACHO' },
  },
  {
    path: 'despacho-productos/agregar-despacho',
    loadComponent: () =>
      import('./pages/despacho-productos/pages/agregar-despacho/agregar-despacho').then(
        (m) => m.AgregarDespacho,
      ),
    canActivate: [roleGuard],
    data: { permiso: 'CREAR_DESPACHO' },
  },
  {
    path: 'despacho-productos/confirmar-despacho',
    loadComponent: () =>
      import('./pages/despacho-productos/pages/confirmar-despacho/confirmar-despacho').then(
        (m) => m.ConfirmarDespacho,
      ),
    canActivate: [roleGuard],
    data: { permiso: 'CREAR_DESPACHO' },
  },
  {
    path: 'despacho-productos/editar-despacho/:id',
    loadComponent: () =>
      import('./pages/despacho-productos/pages/editar-despacho/editar-despacho').then(
        (m) => m.EditarDespacho,
      ),
    canActivate: [roleGuard],
    data: { permiso: 'CREAR_DESPACHO' },
  },


  {
    path: 'conteo-inventario',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('../logistica/pages/conteo-inventario/conteoinventario').then(
            (m) => m.ConteoInventarios,
          ),
          canActivate: [roleGuard],
          data: { permiso: 'CONTEO_INVENTARIO' },
      },
      {
        path: 'crear',
        loadComponent: () =>
          import('../logistica/pages/conteo-crear/conteocrear').then((m) => m.ConteoCrear),
          canActivate: [roleGuard],
          data: { permiso: 'CREAR_CONTEO_INVENTARIO' },
      },
      {
        path: 'detalle/:id',
        loadComponent: () =>
          import('../logistica/pages/conteo-detalle/conteodetalle').then((m) => m.ConteoDetalle),
          canActivate: [roleGuard],
          data: { permiso: 'CONTEO_INVENTARIO' },
      },
    ],
  },

  { path: 'conteo-crear', redirectTo: 'conteo-inventario/crear', pathMatch: 'full' },
  { path: 'conteo-detalle/:id', redirectTo: 'conteo-inventario/detalle/:id', pathMatch: 'full' },

  {
    path: 'reclamos-listado',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('../ventas/pages/reclamos-garantia/reclamos-listado/reclamos-listado').then(
            (m) => m.ReclamosListado,
          ),
          canActivate: [roleGuard],
          data: { permiso: 'VER_RECLAMO' },
      },
      {
        path: 'crear',
        loadComponent: () =>
          import('../ventas/pages/reclamos-garantia/reclamos-crear/reclamos-crear').then(
            (m) => m.ReclamosCrear,
          ),
          canActivate: [roleGuard],
          data: { permiso: 'CREAR_RECLAMO' },
      },
      {
        path: 'editar/:id',
        loadComponent: () =>
          import('../ventas/pages/reclamos-garantia/reclamos-editar/reclamos-editar').then(
            (m) => m.ReclamosEditar,
          ),
          canActivate: [roleGuard],
          data: { permiso: 'EDITAR_RECLAMO' },
      },
      {
        path: 'detalle/:id',
        loadComponent: () =>
          import('../ventas/pages/reclamos-garantia/reclamos-detalles/reclamos-detalles').then(
            (m) => m.ReclamosDetalles,
          ),
          canActivate: [roleGuard],
          data: { permiso: 'VER_RECLAMO' },
      },
    ],
  },

  {
    path: 'terminos-condiciones',
    loadComponent: () =>
      import('./pages/reportes/pages/terminos-condiciones/terminos-condiciones').then(
        (m) => m.TerminosCondicionesComponent,
      ),
  },
  {
    path: 'editar-condiciones',
    canActivate: [roleGuard],
    data: { permiso: 'EDITAR_TERMINOS_CONDICIONES' },
    loadComponent: () =>
      import('./pages/reportes/pages/terminos-condiciones/editar-terminos-condiciones/editar-terminos-condiciones').then(
        (m) => m.EditarTerminosCondicionesComponent,
      ),
  },

  {
    path: 'gestion-delivery',
    canActivate: [roleGuard],
    data: { permiso: 'ASIGNAR_DELIVERY' },
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/gestion-delivery/delivery-listado/delivery-listado').then(
            (m) => m.DeliveryListado,
          ),
      },
      {
        path: 'formulario-delivery',
        loadComponent: () =>
          import('./pages/gestion-delivery/delivery-formulario/delivery-formulario').then(
            (m) => m.DeliveryFormulario,
          ),
      },
      {
        path: 'detalle-delivery/:id',
        loadComponent: () =>
          import('./pages/gestion-delivery/delivery-detalles/delivery-detalles').then(
            (m) => m.DeliveryDetalles,
          ),
      },
    ],
  },
];
