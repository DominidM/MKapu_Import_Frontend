import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageService, ConfirmationService } from 'primeng/api';

import { CreditNoteService, RegisterCreditNoteDto } from '../../../services/nota-credito.service';
import { StockSocketService } from '../../../../ventas/services/stock-socket.service';
import { VentasAdminService } from '../../../services/ventas.service';

interface VentaItemUI {
  id_detalle: number;
  descripcion: string;
  cantidadOriginal: number;
  precioUnitario: number;
  cantidadADevolver: number;
  seleccionado: boolean;
}

// Shape del state que inyecta historial-ventas-administracion.ts
interface NavState {
  autoCargar?:       boolean;
  idComprobante?:    number;   // ID del comprobante de VENTA (sales receipt)
  serieCorrelativo?: string;   // solo informativo para la UI
  rutaRetorno?:      string;
}

@Component({
  selector: 'app-agregar-nota-credito',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    SelectModule,
    TableModule,
    TagModule,
    ToastModule,
    InputTextModule,
    ConfirmDialogModule,
    InputNumberModule,
    CheckboxModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './agregar-nota-credito.html',
  styleUrl: './agregar-nota-credito.css',
})
export class AgregarNotaCreditoComponent implements OnInit, OnDestroy {
  private readonly router              = inject(Router);
  private readonly creditNoteService   = inject(CreditNoteService);
  private readonly ventasAdminService  = inject(VentasAdminService);
  private readonly messageService      = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly cdr                 = inject(ChangeDetectorRef);
  private readonly stockSocket         = inject(StockSocketService);

  private subscriptions = new Subscription();
  private rutaRetorno   = '/admin/nota-credito';
  readonly tituloKicker    = 'VENTAS';
  readonly subtituloKicker = 'REGISTRAR NOTA DE CRÉDITO';
  readonly iconoCabecera   = 'pi pi-file-edit';

  // ── Buscador manual ───────────────────────────────────────────────
  readonly tiposComprobante = [
    { label: 'Factura', value: '01' },
    { label: 'Boleta',  value: '03' },
  ];

  tipoComprobanteRef: string | null = null;
  serieCorrelativoRef               = '';
  buscandoComprobante               = false;

  // ── Datos cargados ────────────────────────────────────────────────
  ventaReferenciaCabecera: any = null;
  itemsVenta: VentaItemUI[]    = [];

  readonly motivosSunat = [
    { label: 'Anulación de la operación',              value: '01' },
    { label: 'Anulación por error en el RUC',           value: '02' },
    { label: 'Corrección por error en la descripción',  value: '03' },
    { label: 'Descuento global',                        value: '04' },
    { label: 'Descuento por ítem',                      value: '05' },
    { label: 'Devolución total',                        value: '06' },
    { label: 'Devolución por ítem',                     value: '07' },
    { label: 'Bonificación',                            value: '08' },
    { label: 'Disminución en el valor',                 value: '09' },
  ];

  motivoSunatSeleccionado: string | null = null;
  sustentoDescripcion                    = '';
  guardandoNota                          = false;

  // ── Socket stock ──────────────────────────────────────────────────
  private stockListener = (data: any) => {
    this.messageService.add({
      severity: 'info',
      summary:  'Inventario Actualizado',
      detail:   `Se devolvieron ${data.quantity} unidades del producto ID: ${data.productId} al almacén.`,
      life: 6000,
    });
    this.cdr.markForCheck();
  };

  // ── Lifecycle ─────────────────────────────────────────────────────
  ngOnInit(): void {
    this.stockSocket.onStockActualizado(this.stockListener);
    this.verificarAutoCargar();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.stockSocket.offStockActualizado(this.stockListener);
  }

  // ── AUTO-CARGA desde historial ────────────────────────────────────
  /**
   * Lee history.state inyectado por historial-ventas-administracion.ts.
   * Usa VentasAdminService.getDetalleCompleto(id) → GET /sales/receipts/:id/detalle
   * El mismo endpoint que ya funciona en el detalle de ventas.
   */
  private verificarAutoCargar(): void {
    const state = history.state as NavState;

    if (state?.rutaRetorno) {
      this.rutaRetorno = state.rutaRetorno;
    }

    if (state?.autoCargar && state.idComprobante) {
      this.serieCorrelativoRef = state.serieCorrelativo ?? '';
      this.buscandoComprobante = true;
      this.cdr.markForCheck();

      setTimeout(() => this.cargarPorId(state.idComprobante!), 150);
    }
  }

  /**
   * Carga los datos del comprobante de VENTA usando su ID numérico.
   * Endpoint: GET /sales/receipts/:id/detalle  (VentasAdminService.getDetalleCompleto)
   */
  private cargarPorId(id: number): void {
    const sub = this.ventasAdminService.getDetalleCompleto(id).subscribe({
      next: (detalle: any) => {
        // getDetalleCompleto devuelve SalesReceiptDetalleCompletoDto
        // Normalizamos los campos que pueden venir con distintos nombres
        const clienteNombre =
          detalle.clienteNombre   ??
          detalle.cliente?.nombre ??
          detalle.nombre_cliente  ??
          'Cliente sin nombre';

        const clienteDocumento =
          detalle.clienteDocumento   ??
          detalle.cliente?.documento ??
          detalle.cliente_documento  ??
          '—';

        const fechaEmision =
          detalle.fecEmision   ??
          detalle.fechaEmision ??
          detalle.fec_emision  ??
          null;

        const total    = Number(detalle.total    ?? 0);
        const subtotal = Number(detalle.subtotal ?? detalle.subTotal ?? total / 1.18);
        const igv      = Number(detalle.igv      ?? detalle.igvTotal ?? total - subtotal);

        // Los ítems pueden venir como detalle.items o detalle.detalles
        const listaItems: any[] = detalle.items ?? detalle.detalles ?? [];

        this.ventaReferenciaCabecera = {
          id:               id,
          clienteNombre,
          clienteDocumento,
          fechaEmision,
          total,
          subtotal,
          igv,
        };

        this.itemsVenta = listaItems.map((item: any) => ({
          // El id del ítem puede venir como id_detalle, idDetalle, id, itemId, id_producto
          id_detalle:        item.id_detalle   ?? item.idDetalle  ?? item.itemId ?? item.id_producto ?? item.id,
          descripcion:       item.descripcion  ?? item.nombre     ?? item.description ?? item.cod_prod ?? 'Producto',
          cantidadOriginal:  Number(item.cantidad   ?? item.quantity  ?? 0),
          precioUnitario:    Number(item.precioUnitario ?? item.precio_unitario ?? item.unitPrice ?? item.peso_unitario ?? 0),
          cantidadADevolver: 0,
          seleccionado:      false,
        }));

        this.buscandoComprobante = false;
        this.cdr.markForCheck();

        this.messageService.add({
          severity: this.itemsVenta.length > 0 ? 'success' : 'warn',
          summary:  this.itemsVenta.length > 0 ? 'Comprobante cargado' : 'Atención',
          detail:   this.itemsVenta.length > 0
            ? `${this.serieCorrelativoRef} — ${clienteNombre}`
            : 'El comprobante no tiene ítems registrados.',
          life: 4000,
        });
      },
      error: (err) => {
        this.buscandoComprobante = false;
        console.error('[NC] Error al cargar comprobante por ID:', err);
        this.messageService.add({
          severity: 'error',
          summary:  'Error al cargar comprobante',
          detail:   err?.error?.message ?? 'No se pudo obtener el detalle. Intente buscar manualmente.',
          life: 5000,
        });
        this.cdr.markForCheck();
      },
    });

    this.subscriptions.add(sub);
  }

  // ── BÚSQUEDA MANUAL (flujo original, sigue disponible) ───────────
  buscarComprobante(): void {
    if (!this.tipoComprobanteRef) {
      this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'Seleccione el tipo de comprobante.' });
      return;
    }
    if (!this.serieCorrelativoRef || !this.serieCorrelativoRef.includes('-')) {
      this.messageService.add({ severity: 'error', summary: 'Formato inválido', detail: 'Use el formato Serie-Número (Ej: F001-123).' });
      return;
    }

    this.buscandoComprobante = true;
    this.limpiarDatosComprobante();

    const correlativoLimpio = this.serieCorrelativoRef.trim().toUpperCase();

    // En la búsqueda manual buscamos por historial y tomamos el primer resultado
    const sub = this.ventasAdminService.listarHistorialVentas({
      page:   1,
      limit:  1,
      search: correlativoLimpio,
    }).subscribe({
      next: (res: any) => {
        const lista = res?.receipts ?? res?.data ?? res?.items ?? [];

        if (!lista.length) {
          this.buscandoComprobante = false;
          this.messageService.add({ severity: 'error', summary: 'No encontrado', detail: 'No se encontró el comprobante.' });
          this.cdr.markForCheck();
          return;
        }

        const item = lista[0];

        // Validar coherencia tipo vs serie
        const esFactura = correlativoLimpio.startsWith('F');
        if (
          (this.tipoComprobanteRef === '01' && !esFactura) ||
          (this.tipoComprobanteRef === '03' &&  esFactura)
        ) {
          this.buscandoComprobante = false;
          this.messageService.add({ severity: 'error', summary: 'Error de Coherencia', detail: 'El tipo seleccionado no coincide con la serie buscada.' });
          return;
        }

        // Con el ID obtenido del listado, cargamos el detalle completo
        this.cargarPorId(item.idComprobante ?? item.id_comprobante ?? item.id);
      },
      error: () => {
        this.buscandoComprobante = false;
        this.messageService.add({ severity: 'error', summary: 'No encontrado', detail: 'No se pudo localizar el comprobante.' });
        this.cdr.markForCheck();
      },
    });

    this.subscriptions.add(sub);
  }

  private limpiarDatosComprobante(): void {
    this.ventaReferenciaCabecera = null;
    this.itemsVenta              = [];
    this.motivoSunatSeleccionado = null;
    this.sustentoDescripcion     = '';
  }

  limpiarBuscadorBase(): void {
    this.tipoComprobanteRef  = null;
    this.serieCorrelativoRef = '';
    this.limpiarDatosComprobante();
  }

  // ── Motivos / cantidades ──────────────────────────────────────────
  onMotivoChange(): void {
    if (this.motivoSunatSeleccionado === '01' || this.motivoSunatSeleccionado === '06') {
      this.itemsVenta.forEach((item) => {
        item.seleccionado      = true;
        item.cantidadADevolver = item.cantidadOriginal;
      });
    } else {
      this.itemsVenta.forEach((item) => {
        item.seleccionado      = false;
        item.cantidadADevolver = 0;
      });
    }
  }

  onCantidadChange(item: VentaItemUI): void {
    if (item.cantidadADevolver > item.cantidadOriginal) item.cantidadADevolver = item.cantidadOriginal;
    if (item.cantidadADevolver < 0)                     item.cantidadADevolver = 0;
    item.seleccionado = item.cantidadADevolver > 0;
  }

  onCheckboxChange(item: VentaItemUI): void {
    if (item.seleccionado && item.cantidadADevolver === 0) {
      item.cantidadADevolver = 1;
    } else if (!item.seleccionado) {
      item.cantidadADevolver = 0;
    }
  }

  // ── Validación ────────────────────────────────────────────────────
  esFormularioValido(): boolean {
    const hayItemsSeleccionados = this.itemsVenta.some(
      (i) => i.seleccionado && i.cantidadADevolver > 0,
    );
    return !!(
      this.ventaReferenciaCabecera &&
      this.motivoSunatSeleccionado &&
      this.sustentoDescripcion.trim().length >= 5 &&
      hayItemsSeleccionados
    );
  }

  // ── Emisión ───────────────────────────────────────────────────────
  confirmarEmision(): void {
    if (!this.esFormularioValido()) {
      this.messageService.add({
        severity: 'warn',
        summary:  'Formulario Incompleto',
        detail:   'Verifique motivo, sustento (mín. 5 chars) y que haya productos seleccionados.',
      });
      return;
    }

    this.confirmationService.confirm({
      header:                 'Confirmar Emisión a SUNAT',
      message:                '¿Está seguro que desea emitir la Nota de Crédito? Esta acción no se puede deshacer y el documento será enviado a SUNAT de inmediato.',
      icon:                   'pi pi-exclamation-triangle',
      acceptLabel:            'Sí, Emitir NC',
      rejectLabel:            'Cancelar',
      acceptButtonStyleClass: 'p-button-success',
      rejectButtonStyleClass: 'p-button-text p-button-secondary',
      accept: () => this.emitirNotaCredito(),
    });
  }

  private emitirNotaCredito(): void {
    this.guardandoNota = true;

    const itemsParaDevolver = this.itemsVenta.filter(
      (i) => i.seleccionado && i.cantidadADevolver > 0,
    );

    const payload: RegisterCreditNoteDto = {
      salesReceiptId:    this.ventaReferenciaCabecera.id,
      reasonCode:        this.motivoSunatSeleccionado!,
      reasonDescription: this.sustentoDescripcion.trim(),
      items: itemsParaDevolver.map((item) => ({
        itemId:   item.id_detalle,
        quantity: item.cantidadADevolver,
      })),
    };

    const sub = this.creditNoteService.registrar(payload).subscribe({
      next: () => {
        this.guardandoNota = false;
        this.messageService.add({
          severity: 'success',
          summary:  'Éxito',
          detail:   'Nota de Crédito emitida correctamente',
          life: 4000,
        });
        setTimeout(() => this.volverListado(), 2000);
      },
      error: (err) => {
        this.guardandoNota = false;
        this.messageService.add({
          severity: 'error',
          summary:  'Error',
          detail:   err?.error?.message || 'No se pudo emitir la nota de crédito',
          life: 5000,
        });
      },
    });

    this.subscriptions.add(sub);
  }

  // ── Navegación ────────────────────────────────────────────────────
  volverListado(): void {
    this.router.navigate([this.rutaRetorno]);
  }
}