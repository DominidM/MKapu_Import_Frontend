import { Routes } from '@angular/router';
export const LOGISTICA_ROUTES:Routes = [
    {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard-logistica/dashboard-logistica').then((m)=> m.DashboardLogistica)
    },
    {
        path:'conteo-inventario',
        loadComponent: () => import('./pages/conteo-inventario/conteo-inventario').then((m)=>m.ConteoInventario)
    }
]
