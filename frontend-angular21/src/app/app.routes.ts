import { Routes } from '@angular/router';
import { Login } from './auth/pages/login/login';
import { Main } from './layout/main/main';
import { Clientes } from './administracion/pages/clientes/pages/clientes/clientes';
import { NuevaTransferencia } from './administracion/pages/reportes/pages/nueva-transferencia/nueva-transferencia';
import { pendingChangesGuard } from './core/guards/pending-changes.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },

  {
    path: 'admin',
    component: Main,
    children: [
      { path: 'notificaciones', loadComponent: () => import('./administracion/pages/dashboard/dashboard').then(m => m.Dashboard) },
      { path: 'dashboard', loadComponent: () => import('./administracion/pages/dashboard/dashboard').then(m => m.Dashboard) },
      { path: 'usuarios', loadComponent: () => import('./administracion/pages/administracion/administracion').then(m => m.Administracion) },

      {
        path: 'transferencia',
        children: [
          {
            path: '',
            loadComponent: () => import('./administracion/pages/reportes/pages/transferencia/transferencia').then(m => m.Transferencia)
          },
          {
            path: 'nueva-transferencia',
            loadComponent: () => import('./administracion/pages/reportes/pages/nueva-transferencia/nueva-transferencia').then(m => m.NuevaTransferencia)
          },
        ]

      },

      {   path: 'gestion-productos',
          loadComponent: () => import('./administracion/pages/gestion-productos/productos-listado/gestion-listado').then(m => m.GestionListado),
          children: [
            {
              path: '', redirectTo: '', pathMatch: 'full'
            },
            {
              path: 'ver-detalle-producto/:id', loadComponent: () => import('./administracion/pages/gestion-productos/productos-detalles/productos-detalles').then(m => m.ProductosDetalles)
            },
            {
              path: 'crear-producto', loadComponent: () => import('./administracion/pages/gestion-productos/productos-formulario/productos-formulario').then(m => m.ProductosFormulario)
            },
            {
              path: 'editar-producto/:id', loadComponent: () => import('./administracion/pages/gestion-productos/productos-formulario/productos-formulario').then(m => m.ProductosFormulario)
            }
      ]},
      {
        path: 'sedes',
        children: [
          {
            path: '',
            loadComponent: () => import('./administracion/pages/sedes/pages/sedes/sedes').then(m => m.Sedes)
          },
          {
            path: 'agregar-sede',
            loadComponent: () => import('./administracion/pages/sedes/pages/agregar-sede/agregar-sede').then(m => m.AgregarSede),
            canDeactivate: [pendingChangesGuard]
          },
          {
            path: 'editar-sede',
            loadComponent: () => import('./administracion/pages/sedes/pages/editar-sede/editar-sede').then(m => m.EditarSede),
            canDeactivate: [pendingChangesGuard]
          }
        ]
      },
      {
        path: 'clientes',
        children: [
          {
            path: '',
            loadComponent: () => import('./administracion/pages/clientes/pages/clientes/clientes').then(m => m.Clientes)
          },
          {
            path: 'agregar-cliente',
            loadComponent: () => import('./administracion/pages/clientes/pages/agregar-cliente/agregar-cliente').then(m => m.AgregarCliente)
          },
          {
            path: 'editar-cliente',
            loadComponent: () => import('./administracion/pages/clientes/pages/editar-cliente/editar-cliente').then(m => m.EditarCliente)
          }
        ]
      },
      {
        path: 'ingresos-almacen',
        children: [
          {
            path: '',
            loadComponent: () => import('./administracion/pages/ingresos-almacen/pages/ingresos-almacen/ingresos-almacen').then(m => m.IngresosAlmacen)
          },
          {
            path: 'ingresos-agregar',
            loadComponent: () => import('./administracion/pages/ingresos-almacen/pages/ingresos-agregar/ingresos-agregar').then(m => m.IngresosAgregar)
          },
        ]
      },
    ]
  },

  {
    path: 'almacen',
    component: Main,
    children: [
      { path: 'dashboard', loadComponent: () => import('./almacen/pages/almacen/almacen').then(m => m.Almacen) }
    ]
  },

  {
    path: 'ventas',
    component: Main,
    children: [
      {
        path: '',
        redirectTo: 'dashboard-ventas',
        pathMatch: 'full'
      },
      { path: 'dashboard-ventas', loadComponent: () => import('./ventas/pages/dashboard-ventas/dashboard-ventas').then(m => m. DashboardVentas)
      },
      { path: 'generar-venta', loadComponent: () => import('./ventas/pages/generar-venta/generar-venta').then(m => m.GenerarVenta)
      },
      {
        path: 'historial-ventas', loadComponent: () => import('./ventas/pages/historial-ventas/historial-ventas').then(m => m.HistorialVentas)
      },
      {
        path: 'imprimir-comprobante',
        loadComponent: () => import('./ventas/pages/imprimir-comprobante/imprimir-comprobante').then(m => m.ImprimirComprobante)
      },
      {
        path: 'ver-detalle/:id',
        loadComponent: () => import('./ventas/pages/detalles-venta/detalle-venta').then(m => m.DetalleVenta)
      },
    ]
  }
];
