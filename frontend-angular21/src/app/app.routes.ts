import { Routes } from '@angular/router';
import { Login } from './auth/pages/login/login';
import { Main } from './layout/main/main';
import { pendingChangesGuard } from './core/guards/pending-changes.guard';
import { VENTAS_ROUTES } from './ventas/ventas.routes';


export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },

  {
    path: 'admin',
    component: Main,
    children: [
      {
        path: 'notificaciones',
        loadComponent: () =>
          import('./administracion/pages/dashboard/dashboard')
            .then(m => m.Dashboard)
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./administracion/pages/dashboard/dashboard')
            .then(m => m.Dashboard)
      },

      /* =======================
         USUARIOS
      ======================= */
      {
        path: 'usuarios',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./administracion/pages/administracion-crear-usuario/administracion-crear-usuario')
                .then(m => m.AdministracionCrearUsuario)
          },
          {
            path: 'crear-usuario',
            loadComponent: () =>
              import('./administracion/pages/administracion/administracion')
            
                .then(m => m.Administracion)
          }
        ]
      },

      /* =======================
         TRANSFERENCIAS
      ======================= */
      {
        path: 'transferencia',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./administracion/pages/reportes/pages/transferencia/transferencia')
                .then(m => m.Transferencia)
          },
          {
            path: 'nueva-transferencia',
            loadComponent: () => import('./administracion/pages/reportes/pages/nueva-transferencia/nueva-transferencia').then(m => m.NuevaTransferencia)
          },
          {
            path: 'detalle-transferencia',
            loadComponent: () => import('./administracion/pages/reportes/pages/detalle-transferencia/detalle-transferencia').then(m => m.DetalleTransferencia)
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
            },
      ]},

      {
        path: 'sedes',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./administracion/pages/sedes/pages/sedes/sedes')
                .then(m => m.Sedes)
          },
          {
            path: 'agregar-sede',
            loadComponent: () =>
              import('./administracion/pages/sedes/pages/agregar-sede/agregar-sede')
                .then(m => m.AgregarSede),
            canDeactivate: [pendingChangesGuard]
          },
          {
            path: 'editar-sede',
            loadComponent: () =>
              import('./administracion/pages/sedes/pages/editar-sede/editar-sede')
                .then(m => m.EditarSede),
            canDeactivate: [pendingChangesGuard]
          }
        ]
      },

      /* =======================
         CLIENTES
      ======================= */
      {
        path: 'clientes',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./administracion/pages/clientes/pages/clientes/clientes')
                .then(m => m.Clientes)
          },
          {
            path: 'agregar-cliente',
            loadComponent: () =>
              import('./administracion/pages/clientes/pages/agregar-cliente/agregar-cliente')
                .then(m => m.AgregarCliente)
          },
          {
            path: 'editar-cliente',
            loadComponent: () =>
              import('./administracion/pages/clientes/pages/editar-cliente/editar-cliente')
                .then(m => m.EditarCliente)
          }
        ]
      },

      {
        path: 'ingresos-almacen',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./administracion/pages/ingresos-almacen/pages/ingresos-almacen/ingresos-almacen')
                .then(m => m.IngresosAlmacen)
          },
          {
            path: 'ingresos-agregar',
            loadComponent: () =>
              import('./administracion/pages/ingresos-almacen/pages/ingresos-agregar/ingresos-agregar')
                .then(m => m.IngresosAgregar)
          }
        ]
      }
    ]
  },

  /* =======================
     ALMACÉN
  ======================= */
  {
    path: 'almacen',
    component: Main,
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./almacen/pages/almacen/almacen')
            .then(m => m.Almacen)
      }
    ]
  },


  {
    path: 'ventas',
    component: Main,
    children: VENTAS_ROUTES
  }

];
