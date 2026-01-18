import { Routes } from '@angular/router';
import { Login } from './auth/pages/login/login';
import { Main } from './layout/main/main';
import { Clientes } from './administracion/pages/clientes/pages/clientes/clientes';
import { ReporteInventario } from './administracion/pages/reportes/pages/reporte-inventario/reporte-inventario';

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
            path: 'reporte-inventario',
            loadComponent: () => import('./administracion/pages/reportes/pages/reporte-inventario/reporte-inventario').then(m => m.ReporteInventario)
          },
        ]

      },

      {
        path: 'reporte-inventario',
        loadComponent: () => import('./administracion/pages/reportes/pages/reporte-inventario/reporte-inventario').then(m => m.ReporteInventario)
      },


      {   path: 'gestion-productos',
          loadComponent: () => import('./administracion/pages/gestion-productos/productos-listado/gestion-listado').then(m => m.GestionListado),
          children: [
            { path: '', redirectTo: '', pathMatch: 'full' },
            { path: 'ver-detalle-producto/:id', loadComponent: () => import('./administracion/pages/gestion-productos/productos-detalles/productos-detalles').then(m => m.ProductosDetalles) },
            { path: 'crear-producto', loadComponent: () => import('./administracion/pages/gestion-productos/productos-formulario/productos-formulario').then(m => m.ProductosFormulario) },
            { path: 'editar-producto/:id', loadComponent: () => import('./administracion/pages/gestion-productos/productos-formulario/productos-formulario').then(m => m.ProductosFormulario) }
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
            loadComponent: () => import('./administracion/pages/sedes/pages/agregar-sede/agregar-sede').then(m => m.AgregarSede)
          },
          {
            path: 'editar-sede',
            loadComponent: () => import('./administracion/pages/sedes/pages/editar-sede/editar-sede').then(m => m.EditarSede)
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
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'administracion', loadComponent: () => import('./administracion/pages/administracion/administracion').then(m => m.Administracion) },
      { path: 'almacen', loadComponent: () => import('./almacen/pages/almacen/almacen').then(m => m.Almacen) },
      { path: 'ventas', loadComponent: () => import('./ventas/pages/ventas/ventas').then(m => m.Ventas) },
      { path: 'cliente', loadComponent: () => import('./ventas/pages/clientes/clientes').then(m => m.Clientes) },
    ]
  }
];
