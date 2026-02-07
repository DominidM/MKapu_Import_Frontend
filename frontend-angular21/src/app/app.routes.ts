import { Routes } from '@angular/router';
import { Login } from './auth/pages/login/login';
import { Main } from './layout/main/main';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { UserRole } from './core/constants/roles.constants';
import { ADMIN_ROUTES } from './administracion/admin.routes';
import { VENTAS_ROUTES } from './ventas/ventas.routes';
import { ALMACEN_ROUTES } from './almacen/almacen.routes';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },

  /* =======================
     ADMINISTRACIÓN
  ======================= */
  {
    path: 'admin',
    component: Main,

    canActivate: [authGuard, roleGuard],
    data: { allowedRoles: [UserRole.ADMIN] },
    children: ADMIN_ROUTES,
  },
// ✅ Dashboard con layout (sin guards temporalmente)
  {
    path: 'dashboard-admin',
    component: Main,  // ✅ Esto trae el sidebar y header
    // canActivate: [authGuard, roleGuard],  // ❌ Comentar temporalmente
    // data: { allowedRoles: [UserRole.ADMIN] },
    children: [
      {
        path: '',
        loadComponent: () => import('./administracion/pages/dashboard/dashboard').then((m) => m.Dashboard),
      }
    ]
  },

  /* =======================
     ALMACÉN
  ======================= */
  {
    path: 'almacen',
    component: Main,
    canActivate: [authGuard, roleGuard],
    data: { allowedRoles: [UserRole.ALMACEN] },
    children: ALMACEN_ROUTES,
  },

  /* =======================
     VENTAS
  ======================= */
  {
    path: 'ventas',
    component: Main,
    canActivate: [authGuard, roleGuard],
    data: { allowedRoles: [UserRole.VENTAS] },
    children: VENTAS_ROUTES,
  },

];
