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
      { path: 'administracion', loadComponent: () => import('./administracion/pages/administracion/administracion').then(m => m.Administracion) },
      { path: 'almacen', loadComponent: () => import('./almacen/pages/almacen/almacen').then(m => m.Almacen) },
    ]
  }
];
