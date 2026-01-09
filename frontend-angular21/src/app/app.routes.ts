import { Routes } from '@angular/router';
import { Login } from './auth/pages/login/login';
import { Main } from './layout/main/main';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  {
    path: 'inicio',
    component: Main, // layout principal
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./dashboard/pages/dashboard/dashboard').then(m => m.Dashboard) },
      { path: 'administracion',
        children: [
          {
            path: '',
            loadComponent: () => import('./administracion/pages/administracion/administracion').then(m => m.Administracion)
          },
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
      { path: 'almacen', loadComponent: () => import('./almacen/pages/almacen/almacen').then(m => m.Almacen) },
      { path: 'ventas', loadComponent: () => import('./ventas/pages/ventas/ventas').then(m => m.Ventas) },
    ]
  }
];
