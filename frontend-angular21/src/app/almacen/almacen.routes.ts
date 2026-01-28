import { Routes } from '@angular/router';

export const ALMACEN_ROUTES: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => 
      import('./pages/almacen/almacen').then((m) => m.Almacen),
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
];
