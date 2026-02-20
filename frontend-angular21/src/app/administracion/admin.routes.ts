import { Routes } from '@angular/router';
import { pendingChangesGuard } from '../core/guards/pending-changes.guard';

export const ADMIN_ROUTES: Routes = [
  {
    path: 'notificaciones',
    loadComponent: () =>
      import('./pages/reportes/pages/notificacion-transferencia/notificacion-transferencia').then((m) => m.NotificacionTransferencia),
  },
  {
    path: 'dashboard-admin',
    loadComponent: () =>
      import('./pages/dashboard-admin/dashboard-admin').then((m) => m.DashboardAdmin),
  },

  /* =======================
    USUARIOS
  ======================= */
  {
    path: 'usuarios',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/usuarios/pages/administracion-crear-usuario/administracion-crear-usuario').then(
            (m) => m.AdministracionCrearUsuario,
          ),
      },
      {
        path: 'crear-usuario',
        loadComponent: () =>
          import('./pages/usuarios/pages/administracion/administracion').then(
            (m) => m.Administracion,
          ),
      },
      {
        path: 'editar-usuario/:id',
        loadComponent: () =>
          import('./pages/usuarios/pages/administracion-editar-usuario/administracion-editar-usuario').then(
            (m) => m.AdministracionEditarUsuario,
          ),
      },
    ],
  },

  /* =======================
    TRANSFERENCIAS
  ======================= */
  {
    path: 'transferencia',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/reportes/pages/transferencia/transferencia').then(
            (m) => m.Transferencia,
          ),
      },
      {
        path: 'nueva-transferencia',
        loadComponent: () =>
          import('./pages/reportes/pages/nueva-transferencia/nueva-transferencia').then(
            (m) => m.NuevaTransferencia,
          ),
      },
      {
        path: 'solicitud-transferencia/:id',
        loadComponent: () =>
          import('./pages/reportes/pages/detalle-transferencia/detalle-transferencia').then(
            (m) => m.DetalleTransferencia,
          ),
      },
      {
        path: 'notificacion',
        loadComponent: () =>
          import('./pages/reportes/pages/notificacion-transferencia/notificacion-transferencia').then(
            (m) => m.NotificacionTransferencia,
          ),
      },
    ],
  },

  /* =======================
    GESTIÓN DE PRODUCTOS
  ======================= */
  {
    path: 'gestion-productos',
    loadComponent: () => import('./pages/gestion-productos/productos-listado/gestion-listado')
      .then((m) => m.GestionListado),
  },
  {
    path: 'gestion-productos/crear-producto',
    loadComponent: () => import('./pages/gestion-productos/productos-formulario/productos-formulario')
      .then((m) => m.ProductosFormulario),
  },
  {
    path: 'gestion-productos/editar-producto/:id',
    loadComponent: () => import('./pages/gestion-productos/productos-formulario/productos-formulario')
      .then((m) => m.ProductosFormulario),
  },
  {
    path: 'gestion-productos/ver-detalle-producto/:id',
    loadComponent: () => import('./pages/gestion-productos/productos-detalles/productos-detalles')
      .then((m) => m.ProductosDetalles),
  },

  /* =======================
    SEDES
  ======================= */
  {
    path: 'sedes',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/sedes/pages/sedes/sedes').then((m) => m.Sedes),
      },
      {
        path: 'agregar-sede',
        loadComponent: () =>
          import('./pages/sedes/pages/agregar-sede/agregar-sede').then(
            (m) => m.AgregarSede,
          ),
        canDeactivate: [pendingChangesGuard],
      },
      {
        path: 'editar-sede',
        loadComponent: () =>
          import('./pages/sedes/pages/editar-sede/editar-sede').then(
            (m) => m.EditarSede,
          ),
        canDeactivate: [pendingChangesGuard],
      },
    ],
  },

  /* =======================
    CLIENTES
  ======================= */
  {
    path: 'clientes',
    loadComponent: () =>
      import('./pages/clientes/pages/clientes/clientes').then(
        (m) => m.Clientes,
      ),
    children: [
      {
        path: 'agregar-cliente',
        loadComponent: () =>
          import('./pages/clientes/pages/agregar-cliente/agregar-cliente').then(
            (m) => m.AgregarCliente,
          ),
      },
      {
        path: 'editar-cliente',
        loadComponent: () =>
          import('./pages/clientes/pages/editar-cliente/editar-cliente').then(
            (m) => m.EditarCliente,
          ),
      },
    ],
  },

  /* =======================
    INGRESOS ALMACÉN
  ======================= */
  {
    path: 'ingresos-almacen',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/ingresos-almacen/pages/ingresos-almacen/ingresos-almacen').then(
            (m) => m.IngresosAlmacen,
          ),
      },
      {
        path: 'ingresos-agregar',
        loadComponent: () =>
          import('./pages/ingresos-almacen/pages/ingresos-agregar/ingresos-agregar').then(
            (m) => m.IngresosAgregar,
          ),
      },
    ],
  },

  /* =======================
    VENTAS ADMINISTRACIÓN
  ======================= */
  {
    path: 'generar-ventas-administracion',
    loadComponent: () =>
      import('./pages/generar-ventas-administracion/generar-ventas-administracion').then(
        (m) => m.GenerarVentasAdministracion,
      ),
  },
  {
    path: 'historial-ventas-administracion',
    loadComponent: () =>
      import('./pages/historial-ventas-administracion/historial-ventas-administracion').then(
        (m) => m.HistorialVentasAdministracion,
      ),
  },
  {
    path: 'detalles-ventas-administracion/:id',
    loadComponent: () =>
      import('./shared/detalles-ventas-administracion/detalles-ventas-administracion').then(
        (m) => m.DetallesVentasAdministracion,
      ),
  },
  {
    path: 'imprimir-comprobante-administracion',
    loadComponent: () =>
      import('./shared/imprimir-comprobante-administracion/imprimir-comprobante-administracion').then(
        (m) => m.ImprimirComprobanteAdministracion,
      ),
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },

  /* =======================
    COMISIONES
  ======================= */
  {
    path: 'comision',
    loadComponent: () =>
      import('./pages/comision/comision')
        .then((m) => m.Comision
        ),

  },



  {
    path: 'comision-regla',
    loadComponent: () =>
      import('./pages/comision-regla/comisionregla')
        .then((m) => m.ComisionRegla),
  },


  {
    path: 'comision-reportes',
    loadComponent: () =>
      import('./pages/comision-reportes/comisionreportes')
        .then((m) => m.ComisionReportes),
  },

  /* =======================
  GESTIÓN DE Conteos
======================= */
  {
    path: 'conteo-inventario',
    loadComponent: () =>
      import('./pages/conteo-inventario/conteoinventario')
        .then((m) => m.ConteoInventarios),
  },

  {
    path: 'conteo-crear',
    loadComponent: () =>
      import('./pages/conteo-crear/conteocrear')
        .then((m) => m.ConteoCrear),
  },
  {
    path: 'conteo-detalle',
    loadComponent: () =>
      import('./pages/conteo-detalle/conteodetalle')
        .then((m) => m.ConteoDetalle),
  },




  /* =======================
    MERMAS 
  ======================= */
  {
    path: 'mermas',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/mermas/pages/mermas-pr/mermas-pr').then(
            (m) => m.MermasPr,
          ),
      },
      {
        path: 'registro-merma',
        loadComponent: () =>
          import('./pages/mermas/pages/mermas-registro/mermas-registro').then(
            (m) => m.MermasRegistro,
          ),
      },
    ],
  },


  /* =======================
    REMATES 
  ======================= */
  {
    path: 'remates',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/remates/pages/remates-pr/remates-pr').then(
            (m) => m.RematesPr,
          ),
      },
      {
        path: 'registro-remate',
        loadComponent: () =>
          import('./pages/remates/pages/remates-registro/remates-registro').then(
            (m) => m.RematesRegistro,
          ),
      },
    ],
  },

  /* =======================
    DESPACHO PRODUCTOS
  ======================= */
  {
    path: 'despacho-productos',
    loadComponent: () =>
      import('./pages/despacho-productos/pages/listado-despacho/listado-despacho').then(
        (m) => m.ListadoDespacho,
      ),
  },
  {
    path: 'despacho-productos/detalle-despacho/:id',
    loadComponent: () =>
      import('./pages/despacho-productos/pages/detalles-despacho/detalles-despacho').then(
        (m) => m.DetallesDespacho,
      ),
  },


  {
    path: 'proveedores',
    loadComponent: () => import('./pages/gestion-proveedor/proveedor-listado/proveedor-listado').then(m => m.ProveedorListado),
    children: [
      {
        path: 'crear',
        loadComponent: () => import('./pages/gestion-proveedor/proveedor-formulario/proveedor-formulario').then(m => m.ProveedorFormulario)
      },
      {
        path: 'editar/:id',
        loadComponent: () => import('./pages/gestion-proveedor/proveedor-formulario/proveedor-formulario').then(m => m.ProveedorFormulario)
      },
      {
        path: 'ver-detalle/:id',
        loadComponent: () => import('./pages/gestion-proveedor/proveedor-detalles/proveedor-detalles').then(m => m.ProveedorDetalles)
      }
    ]
  },
];
