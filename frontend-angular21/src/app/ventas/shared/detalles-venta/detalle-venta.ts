/* frontend-angular21/src/app/ventas/pages/detalle-venta/detalle-venta.ts */

import {
  Component,
  OnInit,
  OnDestroy,
  signal,
  computed,
  inject,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';
import { Subscription } from 'rxjs';

import { Card } from 'primeng/card';
import { Button } from 'primeng/button';
import { Divider } from 'primeng/divider';
import { Tag } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { Skeleton } from 'primeng/skeleton';
import { Tooltip } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';

import { VentasApiService } from '../../services/ventas-api.service';

import type {
  SalesReceiptWithHistoryDto,
  SalesReceiptResponseDto,
  CustomerPurchaseHistoryDto,
} from '../../interfaces/ventas-historial.interface';

interface ComprobanteVenta {
  id: number;
  id_comprobante: number;
  id_cliente: string;
  id_sede: number;
  id_promocion?: number;
  codigo_promocion?: string;
  descuento_promocion?: number;
  descripcion_promocion?: string;
  serie: string;
  numero: number;
  tipo_comprobante: string;
  fec_emision: string;
  fec_venc?: string;
  cliente_nombre: string;
  cliente_doc: string;
  responsable: string;
  subtotal: number;
  igv: number;
  isc: number;
  total: number;
  moneda: string;
  cdr_cpe: string;
  estado: boolean;
  detalles: DetalleComprobante[];
}

interface DetalleComprobante {
  cod_prod: string;
  descripcion: string;
  cantidad: number;
  valor_unit: number;
  pre_uni: number;
  total: number;
}

interface Cliente {
  id_cliente: string;
  nombre: string;
  direccion?: string;
  email?: string;
  telefono?: string;
  tipo_doc: string;
}

interface Pago {
  med_pago: string;
  monto: number;
  banco?: string;
  num_operacion?: string;
}

interface Sede {
  id_sede: number;
  nombre: string;
}

interface Promocion {
  descripcion: string;
}

interface CompraHistorial {
  id: number;
  serie: string;
  numero: number;
  fec_emision: string;
  responsable: string;
  tipo_comprobante: string;
  total: number;
}

@Component({
  selector: 'app-detalle-venta',
  standalone: true,
  imports: [CommonModule, Card, Button, Divider, Tag, TableModule, Skeleton, Tooltip],
  providers: [MessageService],
  templateUrl: './detalle-venta.html',
  styleUrls: ['./detalle-venta.css'],
})
export class DetalleVenta implements OnInit, OnDestroy {
  // Inyección de dependencias
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly ventasApi = inject(VentasApiService);
  private readonly messageService = inject(MessageService);

  // Constantes
  readonly tituloKicker = 'VENTAS - HISTORIAL DE VENTAS - DETALLE DE VENTA';
  readonly subtituloKicker = 'DETALLE DE VENTA';
  readonly iconoCabecera = 'pi pi-file-edit';
  readonly returnUrl = signal('/ventas/historial-ventas');

  // ✅ Signals principales
  comprobante = signal<ComprobanteVenta | null>(null);
  cliente = signal<Cliente | null>(null);
  pagos = signal<Pago[]>([]);
  sedes = signal<Sede[]>([]);
  promocion = signal<Promocion | null>(null);

  historialCompras = signal<CompraHistorial[]>([]);
  
  loading = signal(true);
  loadingHistorial = signal(false);

  private routeSubscription: Subscription | null = null;

  // ✅ Computed signals para estadísticas del historial
  totalComprasCliente = computed(() => {
    return this.historialCompras().reduce((sum, c) => sum + c.total, 0);
  });

  cantidadComprasCliente = computed(() => {
    return this.historialCompras().length;
  });

  sedesVisitadas = computed(() => {
    // Este valor debería venir del backend, por ahora retornamos un array vacío
    return [];
  });

  // ✅ Computed signals para información del comprobante
  tienePromocion = computed(() => {
    const comp = this.comprobante();
    return !!(
      comp?.codigo_promocion &&
      comp?.descuento_promocion &&
      comp.descuento_promocion > 0
    );
  });

  ngOnInit(): void {
    this.routeSubscription = this.route.paramMap.subscribe((params) => {
      const id = params.get('id');

      if (id) {
        this.cargarDetalle(+id);
      } else {
        this.volver();
      }
    });

    this.route.queryParams.subscribe((params) => {
      if (params['returnUrl']) {
        this.returnUrl.set(params['returnUrl']);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }

  cargarDetalle(id: number): void {
    this.loading.set(true);

    // Limpiar datos anteriores
    this.comprobante.set(null);
    this.cliente.set(null);
    this.pagos.set([]);
    this.historialCompras.set([]);
    this.promocion.set(null);

    this.ventasApi.obtenerVentaConHistorial(id).subscribe({
      next: (res: SalesReceiptWithHistoryDto) => {
        this.mapearDatosComprobante(res.receipt);
        this.mapearDatosCliente(res.receipt);
        this.mapearHistorialCliente(res.customerHistory);

        // Actualizar loading de forma reactiva
        this.loading.set(false);
      },
      error: (err: any) => {
        console.error('Error al cargar detalle:', err);

        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cargar el detalle de la venta',
          life: 3000,
        });

        this.loading.set(false);
        setTimeout(() => this.volver(), 2000);
      },
    });
  }

  private mapearDatosComprobante(receipt: SalesReceiptResponseDto): void {
    const comprobanteData: ComprobanteVenta = {
      id: receipt.idComprobante,
      id_comprobante: receipt.idComprobante,
      id_cliente: receipt.cliente.id,
      id_sede: receipt.sede.id,
      serie: receipt.serie,
      numero: receipt.numero,
      tipo_comprobante: this.mapTipoComprobanteToCode(receipt.tipoComprobante.codigoSunat),
      fec_emision: receipt.fecEmision,
      fec_venc: receipt.fecVenc,
      cliente_nombre: receipt.cliente.name,
      cliente_doc: receipt.cliente.documentValue,
      responsable: receipt.responsable.nombreCompleto,
      subtotal: receipt.subtotal,
      igv: receipt.igv,
      isc: receipt.isc,
      total: receipt.total,
      moneda: receipt.moneda.codigo,
      cdr_cpe: receipt.estado === 'EMITIDO' ? 'Aceptado' : receipt.estado,
      estado: receipt.estado === 'EMITIDO',
      detalles: receipt.items.map((item) => ({
        cod_prod: item.codigoProducto?.toString() || item.productId,
        descripcion: item.productName,
        cantidad: item.quantity,
        valor_unit: item.unitValue || item.unitPrice,
        pre_uni: item.unitPrice,
        total: item.total,
      })),
    };

    this.comprobante.set(comprobanteData);

    this.sedes.set([
      {
        id_sede: receipt.sede.id,
        nombre: receipt.sede.nombre,
      },
    ]);

    if (receipt.metodoPago) {
      this.pagos.set([
        {
          med_pago: receipt.metodoPago.descripcion,
          monto: receipt.total,
        },
      ]);
    }
  }

  private mapearDatosCliente(receipt: SalesReceiptResponseDto): void {
    const clienteData: Cliente = {
      id_cliente: receipt.cliente.id,
      nombre: receipt.cliente.name,
      direccion: receipt.cliente.address,
      email: receipt.cliente.email,
      telefono: receipt.cliente.phone,
      tipo_doc: receipt.cliente.documentTypeDescription,
    };

    this.cliente.set(clienteData);
  }

  private mapearHistorialCliente(history?: CustomerPurchaseHistoryDto): void {
    if (!history) {
      this.historialCompras.set([]);
      return;
    }

    const historial = history.recentPurchases.map((compra) => {
      const [serie, numero] = compra.numeroCompleto.split('-');

      return {
        id: compra.idComprobante,
        serie: serie,
        numero: parseInt(numero, 10),
        fec_emision: compra.fecha,
        responsable: compra.responsableNombre,
        tipo_comprobante: this.mapTipoComprobanteDescToCode(compra.tipoComprobante),
        total: compra.total,
      };
    });

    this.historialCompras.set(historial);
  }

  private mapTipoComprobanteToCode(codigoSunat: string): string {
    return codigoSunat;
  }

  private mapTipoComprobanteDescToCode(descripcion: string): string {
    const map: Record<string, string> = {
      FACTURA: '01',
      BOLETA: '03',
      'NOTA DE CREDITO': '07',
      'NOTA DE DEBITO': '08',
    };
    return map[descripcion] || '03';
  }

  volver(): void {
    this.location.back();
  }

  irHistorialVentas(): void {
    this.router.navigate(['/ventas/historial-ventas']);
  }

  verDetalleHistorial(idComprobante: number): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.router.navigate(['/ventas/ver-detalle', idComprobante]);
  }

  imprimirComprobante(): void {
    const comp = this.comprobante();
    if (!comp) return;

    this.router.navigate(['/ventas/imprimir-comprobante'], {
      state: {
        comprobante: comp,
        rutaRetorno: `/ventas/ver-detalle/${comp.id}`,
      },
    });
  }

  imprimirComprobanteHistorial(venta: CompraHistorial): void {
    const comp = this.comprobante();
    this.router.navigate(['/ventas/imprimir-comprobante'], {
      state: {
        comprobante: venta,
        rutaRetorno: `/ventas/ver-detalle/${comp?.id}`,
      },
    });
  }

  descargarPDFHistorial(venta: CompraHistorial): void {
    const comp = this.comprobante();
    this.router.navigate(['/ventas/imprimir-comprobante'], {
      state: {
        comprobante: venta,
        rutaRetorno: `/ventas/ver-detalle/${comp?.id}`,
      },
    });
  }

  enviarEmailHistorial(venta: CompraHistorial): void {
    const clienteData = this.cliente();
    
    if (!clienteData?.email) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Sin email',
        detail: 'El cliente no tiene un correo electrónico registrado',
        life: 3000,
      });
      return;
    }

    console.log('Enviando comprobante a:', clienteData.email);
    console.log('Comprobante:', venta.id);

    this.messageService.add({
      severity: 'success',
      summary: 'Email enviado',
      detail: `Comprobante enviado a: ${clienteData.email}`,
      life: 3000,
    });
  }

  getSede(comprobante: ComprobanteVenta): string {
    const sedesData = this.sedes();
    const sede = sedesData.find((s) => s.id_sede === comprobante.id_sede);
    return sede ? sede.nombre : 'N/A';
  }

  getTipoComprobanteLabel(): string {
    const comp = this.comprobante();
    return comp?.tipo_comprobante === '03' ? 'BOLETA' : 'FACTURA';
  }

  getTipoComprobanteIcon(): string {
    const comp = this.comprobante();
    return comp?.tipo_comprobante === '03' ? 'pi pi-file' : 'pi pi-file-edit';
  }

  getEstadoSeverity(): 'success' | 'danger' {
    const comp = this.comprobante();
    return comp?.estado ? 'success' : 'danger';
  }

  getEstadoLabel(): string {
    const comp = this.comprobante();
    return comp?.estado ? 'ACTIVO' : 'ANULADO';
  }

  getTipoDocumento(): string {
    const clienteData = this.cliente();
    const comp = this.comprobante();
    return clienteData?.tipo_doc || (comp?.tipo_comprobante === '03' ? 'DNI' : 'RUC');
  }

  getIconoMedioPago(medio: string): string {
    const iconos: { [key: string]: string } = {
      EFECTIVO: 'pi pi-money-bill',
      TARJETA: 'pi pi-credit-card',
      YAPE: 'pi pi-mobile',
      PLIN: 'pi pi-mobile',
      TRANSFERENCIA: 'pi pi-arrow-right-arrow-left',
    };
    return iconos[medio] || 'pi pi-wallet';
  }

  formatearSerieNumero(serie: string, numero: number): string {
    return `${serie}-${numero.toString().padStart(8, '0')}`;
  }

  calcularTotalItem(cantidad: number, precio: number): number {
    return cantidad * precio;
  }

  getDescripcionPromocion(): string {
    const comp = this.comprobante();
    const prom = this.promocion();

    if (comp?.descripcion_promocion) {
      return comp.descripcion_promocion;
    }

    if (prom?.descripcion) {
      return prom.descripcion;
    }

    return 'Descuento especial';
  }

  getCodigoPromocion(): string {
    const comp = this.comprobante();
    return comp?.codigo_promocion || '';
  }

  getDescuentoPromocion(): number {
    const comp = this.comprobante();
    return comp?.descuento_promocion || 0;
  }

  getSubtotalAntesDescuento(): number {
    const comp = this.comprobante();
    if (!comp) return 0;

    if (this.tienePromocion()) {
      return comp.subtotal + (comp.descuento_promocion || 0);
    }

    return comp.subtotal;
  }
}
