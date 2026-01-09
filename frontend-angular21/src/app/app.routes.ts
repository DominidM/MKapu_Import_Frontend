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
          loadComponent: () => import('./administracion/pages/gestion-productos/gestion-productos').then(m => m.GestionProductos),
          children: [
            { path: '', redirectTo: '', pathMatch: 'full' },
            { path: 'crear-producto', loadComponent: () => import('./administracion/pages/gestion-productos/productos-form/productos-form').then(m => m.ProductosForm) },
            { path: 'editar-producto/:id', loadComponent: () => import('./administracion/pages/gestion-productos/productos-form/productos-form').then(m => m.ProductosForm) },
            { path: 'productos-eliminados', loadComponent: () => import('./administracion/pages/gestion-productos/productos-eliminados/productos-eliminados').then(m => m.ProductosEliminados) }
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
      { path: 'dashboard', loadComponent: () => import('./ventas/pages/ventas/ventas').then(m => m.Ventas) }

    ]
  }
];
