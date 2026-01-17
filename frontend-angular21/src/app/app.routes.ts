import { Routes } from '@angular/router';
import { Login } from './auth/pages/login/login';
import { Main } from './layout/main/main';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },

  {
    path: 'admin',
    component: Main,
    children: [
      { path: 'dashboard', loadComponent: () => import('./administracion/pages/dashboard/dashboard').then(m => m.Dashboard) },
      { path: 'usuarios', loadComponent: () => import('./administracion/pages/administracion/administracion').then(m => m.Administracion) },

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
      { 
        path: '', 
        redirectTo: 'generar-venta', 
        pathMatch: 'full' 
      },
      { 
        path: 'generar-venta',
        loadComponent: () => import('./ventas/pages/ventas').then(m => m.Ventas),
        children: [
          { 
            path: '', // Ruta vacía muestra la pantalla principal
            pathMatch: 'full',
            children: [] // Importante para que se muestre el contenido del padre
          },
          { 
            path: 'listar', 
            loadComponent: () => import('./ventas/pages/generar-venta/lista-ventas/lista-ventas').then(m => m.ListaVentas) 
          },
          { 
            path: 'crear',
            loadComponent: () => import('./ventas/pages/generar-venta/crear-venta/crear-venta').then(m => m.CrearVenta) 
          },
          { 
            path: 'detalle/:id', 
            loadComponent: () => import('./ventas/pages/generar-venta/detalles-venta/detalles-venta').then(m => m.DetallesVenta) 
          },
          { 
            path: 'buscar-cliente', 
            loadComponent: () => import('./ventas/pages/generar-venta/buscar-cliente/buscar-cliente').then(m => m.BuscarCliente) 
          }
        ]
      }
    ]
  }
];
 