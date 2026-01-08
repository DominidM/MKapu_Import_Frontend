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
      { path: 'dashboard', loadComponent: () => 
        import('./dashboard/pages/dashboard/dashboard').then(m => m.Dashboard) },
      { path: 'administracion', loadComponent: () => 
        import('./administracion/pages/administracion/administracion').then(m => m.Administracion) },
      { path: 'almacen', loadComponent: () => 
        import('./almacen/pages/almacen/almacen').then(m => m.Almacen) },
      { path: 'ventas', loadComponent: () => 
        import('./ventas/pages/ventas/ventas').then(m => m.Ventas) },
        {
          path: 'administracion',
          children: [
            {
              path: '',
              loadComponent: () =>
                import('./administracion/pages/administracion/administracion')
                  .then(m => m.Administracion)
            },
            {
              path: 'usuario',
              loadComponent: () =>
                import('./administracion/pages/administracion-usuario/administracion-usuario')
                  .then(m => m.AdministracionUsuario)
            },
            {
              path: 'roles',
              loadComponent: () =>
                import('./administracion/pages/administracion-roles/administracion-roles')
                  .then(m => m.AdministracionRoles)
            },
           
            
          ]
        },
        {
          path: 'almacen',
          children: [
            {
              path: '',
              loadComponent: () =>
                import('./almacen/pages/almacen/almacen')
                  .then(m => m.Almacen)
            },
            {
              path: 'productos',
              loadComponent: () =>
                import('./almacen/pages/almacen-productos/almacen-productos')
                  .then(m => m.AlmacenProductos)
            },
            {
              path: 'categorias',
              loadComponent: () =>
                import('./almacen/pages/almacen-categorias/almacen-categorias')
                  .then(m => m.AlmacenCategorias)
            },
           
            
          ]
        },
        {
          path: 'ventas',
          children: [
            {
              path: '',
              loadComponent: () =>
                import('./ventas/pages/ventas/ventas')
                  .then(m => m.Ventas)
            },
            {
              path: 'clientes',
              loadComponent: () =>
                import('./ventas/pages/ventas-clientes/ventas-clientes')
                  .then(m => m.VentasClientes)
            },
            {
              path: 'facturas',
              loadComponent: () =>
                import('./ventas/pages/ventas-facturas/ventas-facturas')
                  .then(m => m.VentasFacturas)
            },
           
            
          ]
        },
    ]
  }
];
