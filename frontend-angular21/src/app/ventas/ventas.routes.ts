import { Routes } from '@angular/router';

export const VENTAS_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'dashboard-ventas',
    pathMatch: 'full',
  },
  {
    path: 'dashboard-ventas',
    loadComponent: () =>
      import('./pages/dashboard-ventas/dashboard-ventas').then((m) => m.DashboardVentas),
  },
  {
    path: 'generar-ventas',
    loadComponent: () =>
      import('./pages/generar-venta/generar-venta').then((m) => m.GenerarVenta),
  },
  {
    path: 'historial-ventas',
    loadComponent: () =>
      import('./pages/historial-ventas/historial-ventas').then((m) => m.HistorialVentas),
  },
  {
    path: 'imprimir-comprobante',
    loadComponent: () =>
      import('./shared/imprimir-comprobante/imprimir-comprobante').then(
        (m) => m.ImprimirComprobante,
      ),
  },
  {
    path: 'ver-detalle/:id',
    loadComponent: () =>
      import('./shared/detalles-venta/detalle-venta').then((m) => m.DetalleVenta),
  },
  {
    path: 'reclamos-listado',
    loadComponent: () =>
      import('./pages/reclamos-garantia/reclamos-listado/reclamos-listado').then(
        (m) => m.ReclamosListado,
      ),
  },
  {
    path: 'reclamos/crear',
    loadComponent: () =>
      import('./pages/reclamos-garantia/reclamos-crear/reclamos-crear').then(
        (m) => m.ReclamosCrear,
      ),
  },
  {
    path: 'reclamos/editar/:id',
    loadComponent: () =>
      import('./pages/reclamos-garantia/reclamos-editar/reclamos-editar').then(
        (m) => m.ReclamosEditar,
      ),
  },
  {
    path: 'reclamos/detalle/:id',
    loadComponent: () =>
      import('./pages/reclamos-garantia/reclamos-detalles/reclamos-detalles').then(
        (m) => m.ReclamosDetalles,
      ),
  },

  // ─── COTIZACIONES ───────────────────────────────────────────
  {
    path: 'cotizaciones',
    loadComponent: () =>
      import('./pages/cotizaciones/listado-cotizacion/listado-cotizacion')
        .then((m) => m.ListadoCotizacion),
  },
  {
    path: 'cotizaciones/crear',
    loadComponent: () =>
      import('./pages/cotizaciones/formulario-cotizacion/formulario-cotizacion')
        .then((m) => m.FormularioCotizacion),
  },
  {
    path: 'cotizaciones/editar/:id',
    loadComponent: () =>
      import('./pages/cotizaciones/formulario-cotizacion/formulario-cotizacion')
        .then((m) => m.FormularioCotizacion),
  },
  {
    path: 'cotizaciones/detalle/:id',
    loadComponent: () =>
      import('./pages/cotizaciones/detalle-cotizacion/detalle-cotizacion')
        .then((m) => m.DetalleCotizacion),
  },
];
