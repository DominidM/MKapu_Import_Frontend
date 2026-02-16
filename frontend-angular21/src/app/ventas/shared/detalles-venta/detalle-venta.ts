import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
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
  comprobante: ComprobanteVenta | null = null;
  cliente: Cliente | null = null;
  pagos: Pago[] = [];
  sedes: Sede[] = [];
  promocion: Promocion | null = null;

  historialCompras: CompraHistorial[] = [];
  totalComprasCliente: number = 0;
  cantidadComprasCliente: number = 0;
  sedesVisitadas: string[] = [];

  loading: boolean = true;
  loadingHistorial: boolean = false;
  returnUrl: string = '/ventas/historial-ventas';

  tituloKicker = 'VENTAS - HISTORIAL DE VENTAS - DETALLE DE VENTA';
  subtituloKicker = 'DETALLE DE VENTA';
  iconoCabecera = 'pi pi-file-edit';

  private routeSubscription: Subscription | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private ventasApi: VentasApiService,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef,
  ) {}

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
        this.returnUrl = params['returnUrl'];
      }
    });
  }

  ngOnDestroy(): void {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }

  cargarDetalle(id: number): void {
    this.loading = true;

    this.comprobante = null;
    this.cliente = null;
    this.pagos = [];
    this.historialCompras = [];
    this.promocion = null;

    this.ventasApi.obtenerVentaConHistorial(id).subscribe({
      next: (res: SalesReceiptWithHistoryDto) => {
        this.mapearDatosComprobante(res.receipt);
        this.mapearDatosCliente(res.receipt);
        this.mapearHistorialCliente(res.customerHistory);

        setTimeout(() => {
          this.loading = false;
          this.cdr.detectChanges();
        }, 0);
      },
      error: (err: any) => {
        console.error('Error al cargar detalle:', err);

        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cargar el detalle de la venta',
          life: 3000,
        });

        setTimeout(() => {
          this.loading = false;
          this.cdr.detectChanges();
        }, 0);

        setTimeout(() => this.volver(), 2000);
      },
    });
  }

  private mapearDatosComprobante(receipt: SalesReceiptResponseDto): void {
    this.comprobante = {
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

    this.sedes = [
      {
        id_sede: receipt.sede.id,
        nombre: receipt.sede.nombre,
      },
    ];

    this.cliente = {
      id_cliente: receipt.cliente.id,
      nombre: receipt.cliente.name,
      direccion: receipt.cliente.address,
      email: receipt.cliente.email,
      telefono: receipt.cliente.phone,
      tipo_doc: receipt.cliente.documentTypeDescription,
    };

    if (receipt.metodoPago) {
      this.pagos = [
        {
          med_pago: receipt.metodoPago.descripcion,
          monto: receipt.total,
        },
      ];
    }
  }

  private mapearDatosCliente(receipt: SalesReceiptResponseDto): void {}

  private mapearHistorialCliente(history?: CustomerPurchaseHistoryDto): void {
    if (!history) {
      this.historialCompras = [];
      this.totalComprasCliente = 0;
      this.cantidadComprasCliente = 0;
      this.sedesVisitadas = [];
      return;
    }

    this.totalComprasCliente = history.statistics.montoEmitido;
    this.cantidadComprasCliente = history.statistics.totalEmitidos;

    const sedesUnicas = [...new Set(history.recentPurchases.map((p) => p.sedeNombre))];
    this.sedesVisitadas = sedesUnicas;

    this.historialCompras = history.recentPurchases.map((compra) => {
      const [serie, numero] = compra.numeroCompleto.split('-');

      return {
        id: compra.idComprobante,
        serie: serie,
        numero: parseInt(numero, 10),
        fec_emision: compra.fecha,
        responsable: compra.responsableNombre, // ← CAMBIAR AQUÍ
        tipo_comprobante: this.mapTipoComprobanteDescToCode(compra.tipoComprobante),
        total: compra.total,
      };
    });
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
    if (!this.comprobante) return;

    this.router.navigate(['/ventas/imprimir-comprobante'], {
      state: {
        comprobante: this.comprobante,
        rutaRetorno: `/ventas/ver-detalle/${this.comprobante.id}`,
      },
    });
  }

  imprimirComprobanteHistorial(venta: CompraHistorial): void {
    this.router.navigate(['/ventas/imprimir-comprobante'], {
      state: {
        comprobante: venta,
        rutaRetorno: `/ventas/ver-detalle/${this.comprobante?.id}`,
      },
    });
  }

  descargarPDFHistorial(venta: CompraHistorial): void {
    this.router.navigate(['/ventas/imprimir-comprobante'], {
      state: {
        comprobante: venta,
        rutaRetorno: `/ventas/ver-detalle/${this.comprobante?.id}`,
      },
    });
  }

  enviarEmailHistorial(venta: CompraHistorial): void {
    if (!this.cliente?.email) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Sin email',
        detail: 'El cliente no tiene un correo electrónico registrado',
        life: 3000,
      });
      return;
    }

    console.log('Enviando comprobante a:', this.cliente.email);
    console.log('Comprobante:', venta.id);

    this.messageService.add({
      severity: 'success',
      summary: 'Email enviado',
      detail: `Comprobante enviado a: ${this.cliente.email}`,
      life: 3000,
    });
  }

  getSede(comprobante: ComprobanteVenta): string {
    const sede = this.sedes.find((s) => s.id_sede === comprobante.id_sede);
    return sede ? sede.nombre : 'N/A';
  }

  getTipoComprobanteLabel(): string {
    return this.comprobante?.tipo_comprobante === '03' ? 'BOLETA' : 'FACTURA';
  }

  getTipoComprobanteIcon(): string {
    return this.comprobante?.tipo_comprobante === '03' ? 'pi pi-file' : 'pi pi-file-edit';
  }

  getEstadoSeverity(): 'success' | 'danger' {
    return this.comprobante?.estado ? 'success' : 'danger';
  }

  getEstadoLabel(): string {
    return this.comprobante?.estado ? 'ACTIVO' : 'ANULADO';
  }

  getTipoDocumento(): string {
    return this.cliente?.tipo_doc || (this.comprobante?.tipo_comprobante === '03' ? 'DNI' : 'RUC');
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

  tienePromocion(): boolean {
    return !!(
      this.comprobante?.codigo_promocion &&
      this.comprobante?.descuento_promocion &&
      this.comprobante.descuento_promocion > 0
    );
  }

  getDescripcionPromocion(): string {
    if (this.comprobante?.descripcion_promocion) {
      return this.comprobante.descripcion_promocion;
    }

    if (this.promocion?.descripcion) {
      return this.promocion.descripcion;
    }

    return 'Descuento especial';
  }

  getCodigoPromocion(): string {
    return this.comprobante?.codigo_promocion || '';
  }

  getDescuentoPromocion(): number {
    return this.comprobante?.descuento_promocion || 0;
  }

  getSubtotalAntesDescuento(): number {
    if (!this.comprobante) return 0;

    if (this.tienePromocion()) {
      return this.comprobante.subtotal + (this.comprobante.descuento_promocion || 0);
    }

    return this.comprobante.subtotal;
  }
}
