import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { Subscription } from 'rxjs';

import { Card } from 'primeng/card';
import { Button } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { Skeleton } from 'primeng/skeleton';
import { Tooltip } from 'primeng/tooltip';

import { DispatchService, EnrichedDispatch } from '../../../../services/dispatch.service';
import { UsuarioService } from '../../../../services/usuario.service';
import { UsuarioInterfaceResponse } from '../../../../interfaces/usuario.interface';

interface DetalleProductoRow {
  codigo:         string;
  descripcion:    string;
  cantidad:       number;
  precioUnitario: number;
  total:          number;
}

@Component({
  selector: 'app-detalles-despacho',
  standalone: true,
  imports: [CommonModule, Card, Button, Tag, TableModule, Skeleton, Tooltip],
  templateUrl: './detalles-despacho.html',
  styleUrl: './detalles-despacho.css',
})
export class DetallesDespacho implements OnInit, OnDestroy {

  despacho: EnrichedDispatch | null = null;
  detalleProductos: DetalleProductoRow[] = [];

  despachador = 'Sin asignar';
  asesor      = 'Sin asignar';

  loading   = true;
  errorMsg: string | null = null;

  tituloKicker    = 'ADMINISTRACIÓN - DESPACHO - DETALLE';
  subtituloKicker = 'DETALLE DE DESPACHO';
  iconoCabecera   = 'pi pi-truck';

  private routeSub: Subscription | null = null;

  constructor(
    private readonly route:           ActivatedRoute,
    private readonly router:          Router,
    private readonly location:        Location,
    private readonly dispatchService: DispatchService,
    private readonly usuarioService:  UsuarioService,
  ) {}

  ngOnInit(): void {
    this.cargarUsuarios();

    this.routeSub = this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) this.cargarDetalle(+id);
      else    this.volver();
    });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }

  private cargarUsuarios(): void {
    this.usuarioService.getAllUsuarios().subscribe({
      next: (lista) => {
        this.despachador = this.obtenerNombreUsuario(lista, 'ALMACENERO');
        this.asesor      = this.obtenerNombreUsuario(lista, 'VENTAS');
      },
      error: () => {},
    });
  }

  cargarDetalle(id: number): void {
    this.loading  = true;
    this.errorMsg = null;
    this.despacho = null;
    this.detalleProductos = [];

    this.dispatchService.getDispatchById(id).subscribe({
      next: (d) => {
        this.despacho         = d as EnrichedDispatch;
        this.detalleProductos = this.mapearProductos(d as EnrichedDispatch);
        this.loading          = false;
      },
      error: () => {
        this.errorMsg = 'No se pudo cargar el despacho.';
        this.loading  = false;
      },
    });
  }

  private mapearProductos(d: EnrichedDispatch): DetalleProductoRow[] {
    if (d.productosDetalle?.length) {
      return d.productosDetalle.map(p => ({
        codigo:         p.cod_prod,
        descripcion:    p.descripcion,
        cantidad:       p.cantidad,
        precioUnitario: p.precio_unit,
        total:          p.total,
      }));
    }

    return (d.detalles ?? []).map(det => ({
      codigo:         `#${det.id_producto}`,
      descripcion:    `Producto #${det.id_producto}`,
      cantidad:       det.cantidad_solicitada,
      precioUnitario: 0,
      total:          0,
    }));
  }

  // ── Helpers ─────────────────────────────────

  get numeroComprobante(): string {
    return (this.despacho as any)?.comprobante ?? `#${this.despacho?.id_venta_ref ?? '—'}`;
  }

  get tipoComprobanteLabel(): string {
    const num = this.numeroComprobante;
    if (num.startsWith('F')) return 'FACTURA';
    if (num.startsWith('B')) return 'BOLETA';
    return 'COMPROBANTE';
  }

  get tipoComprobanteIcon(): string {
    return this.tipoComprobanteLabel === 'FACTURA' ? 'pi pi-file-edit' : 'pi pi-file';
  }

  getEstadoSeverity(): 'success' | 'warn' | 'danger' | 'secondary' | 'info' {
    switch (this.despacho?.estado) {
      case 'ENTREGADO':      return 'success';
      case 'EN_TRANSITO':    return 'warn';
      case 'CANCELADO':      return 'danger';
      case 'EN_PREPARACION': return 'info';
      default:               return 'secondary';
    }
  }

  getEstadoLabel(): string {
    const labels: Record<string, string> = {
      GENERADO:       'Generado',
      EN_PREPARACION: 'En preparación',
      EN_TRANSITO:    'En tránsito',
      ENTREGADO:      'Entregado',
      CANCELADO:      'Cancelado',
    };
    return labels[this.despacho?.estado ?? ''] ?? (this.despacho?.estado ?? '—');
  }

  get totalItems(): number {
    return this.detalleProductos.reduce((acc, p) => acc + p.cantidad, 0);
  }

  volver(): void { this.location.back(); }
  irListadoDespacho(): void { this.router.navigate(['/admin/despacho-productos']); }

  private obtenerNombreUsuario(lista: UsuarioInterfaceResponse[], rolNombre: string): string {
    const u = lista.find(
      u => (u.rolNombre ?? u.rol_nombre ?? u.rol ?? '').toUpperCase() === rolNombre.toUpperCase()
        && u.activo
    );
    return u ? `${u.usu_nom} ${u.ape_pat} ${u.ape_mat}`.trim() : 'Sin asignar';
  }

  // ── 🔥 AGREGADOS PARA QUE EL HTML FUNCIONE ─────────────────

  get comprobante(): any {
    return (this.despacho as any)?.comprobante ?? {};
  }

  get cliente(): any {
    return {
      direccion: this.comprobante?.direccion,
      email: this.comprobante?.email,
      telefono: this.comprobante?.telefono,
    };
  }

  get pagos(): any[] {
    return (this.despacho as any)?.pagos ?? [];
  }

  get despachoInfo(): any {
    return {
      salida: this.despacho?.fecha_salida ?? '—',
      ubicacion: (this.despacho as any)?.ubicacion ?? '—',
      agencia: (this.despacho as any)?.agencia ?? '—',
      hora: (this.despacho as any)?.hora ?? '—',
    };
  }

  getTipoComprobanteLabel(): string {
    return this.tipoComprobanteLabel;
  }

  getTipoComprobanteIcon(): string {
    return this.tipoComprobanteIcon;
  }

  formatearSerieNumero(serie: string, numero: string): string {
    if (!serie || !numero) return '—';
    return `${serie}-${numero}`;
  }

  getTipoDocumento(): string {
    const doc = this.comprobante?.cliente_doc ?? '';
    return doc.length === 11 ? 'RUC' : 'DNI';
  }

  getSede(comp: any): string {
    return comp?.sede ?? 'Principal';
  }

  getIconoMedioPago(medio: string): string {
    switch ((medio ?? '').toLowerCase()) {
      case 'efectivo': return 'pi pi-money-bill';
      case 'tarjeta':  return 'pi pi-credit-card';
      case 'yape':
      case 'plin':     return 'pi pi-mobile';
      default:         return 'pi pi-wallet';
    }
  }

  tienePromocion(): boolean {
    return !!(this.despacho as any)?.promocion;
  }

  getCodigoPromocion(): string {
    return (this.despacho as any)?.promocion?.codigo ?? '';
  }

  getDescripcionPromocion(): string {
    return (this.despacho as any)?.promocion?.descripcion ?? '';
  }

  getDescuentoPromocion(): number {
    return (this.despacho as any)?.promocion?.descuento ?? 0;
  }
}