import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
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

import { VentasApiService } from '../../../../ventas/services/ventas-api.service';
import { CreditNoteService, RegisterCreditNoteDto } from '../../../services/nota-credito.service';
import { StockSocketService } from '../../../../ventas/services/stock-socket.service';

interface VentaItemUI {
  id_detalle: string | number;
  descripcion: string;
  cantidadOriginal: number;
  precioUnitario: number;
  cantidadADevolver: number;
  seleccionado: boolean;
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
  private readonly ventasService       = inject(VentasApiService);
  private readonly messageService      = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly stockSocket         = inject(StockSocketService);

  readonly tituloKicker    = 'VENTAS';
  readonly subtituloKicker = 'GENERAR NOTAS DE CREDITO';
  readonly iconoCabecera   = 'pi pi-file-edit';
  private subscriptions    = new Subscription();

  readonly tiposComprobante = [
    { label: 'Factura', value: '01' },
    { label: 'Boleta',  value: '03' },
  ];

  // ── Signals ───────────────────────────────────────────────────
  tipoComprobanteRef      = signal<string | null>(null);
  serieCorrelativoRef     = signal<string>('');
  buscandoComprobante     = signal<boolean>(false);
  ventaReferenciaCabecera = signal<any>(null);
  itemsVenta              = signal<VentaItemUI[]>([]);
  motivoSunatSeleccionado = signal<string | null>(null);
  sustentoDescripcion     = signal<string>('');
  guardandoNota           = signal<boolean>(false);

  readonly motivosSunat = [
    { label: 'Anulación de la operación',              value: '01' },
    { label: 'Anulación por error en el RUC',          value: '02' },
    { label: 'Corrección por error en la descripción', value: '03' },
    { label: 'Descuento global',                       value: '04' },
    { label: 'Descuento por ítem',                     value: '05' },
    { label: 'Devolución total',                       value: '06' },
    { label: 'Devolución por ítem',                    value: '07' },
    { label: 'Bonificación',                           value: '08' },
    { label: 'Disminución en el valor',                value: '09' },
  ];

  // ── Computed ──────────────────────────────────────────────────
  esFormularioValido = computed(() => {
    const hayItems = this.itemsVenta().some(
      (i) => i.seleccionado && i.cantidadADevolver > 0,
    );
    return !!(
      this.ventaReferenciaCabecera() &&
      this.motivoSunatSeleccionado() &&
      this.sustentoDescripcion().trim().length >= 5 &&
      hayItems
    );
  });

  private stockListener = (data: any) => {
    this.messageService.add({
      severity: 'info',
      summary:  'Inventario Actualizado',
      detail:   `Se devolvieron ${data.quantity} unidades del producto ID: ${data.productId} al almacén.`,
      life:     6000,
    });
  };

  // ── Ciclo de vida ─────────────────────────────────────────────
  ngOnInit(): void {
    this.stockSocket.onStockActualizado(this.stockListener);

    const navigation = this.router.getCurrentNavigation();
    const state      = navigation?.extras?.state || history.state;

    if (state?.autoCargar && state?.serieCorrelativo) {
      this.serieCorrelativoRef.set(state.serieCorrelativo);
      // ✅ Autodetecta tipo desde la serie del estado de navegación
      const serie = String(state.serieCorrelativo).toUpperCase().split('-')[0];
      const tipo  = serie.startsWith('F') ? '01' : serie.startsWith('B') ? '03' : (state.tipoComprobante || '01');
      this.tipoComprobanteRef.set(tipo);
      setTimeout(() => this.buscarComprobante(), 100);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.stockSocket.offStockActualizado(this.stockListener);
  }

  // ── Búsqueda ──────────────────────────────────────────────────
  buscarComprobante(): void {
    if (!this.serieCorrelativoRef() || !this.serieCorrelativoRef().includes('-')) {
      this.messageService.add({
        severity: 'error',
        summary:  'Formato inválido',
        detail:   'Use el formato Serie-Número (Ej: F001-123).',
      });
      return;
    }

    // ✅ Autodetecta el tipo por la primera letra de la serie
    const serie = this.serieCorrelativoRef().trim().toUpperCase().split('-')[0];
    if (serie.startsWith('F')) {
      this.tipoComprobanteRef.set('01');
    } else if (serie.startsWith('B')) {
      this.tipoComprobanteRef.set('03');
    } else if (!this.tipoComprobanteRef()) {
      this.messageService.add({
        severity: 'warn',
        summary:  'Atención',
        detail:   'No se pudo detectar el tipo. Selecciónelo manualmente.',
      });
      return;
    }

    this.buscandoComprobante.set(true);
    this.limpiarBuscadorBase();

    const correlativoLimpio = this.serieCorrelativoRef().trim().toUpperCase();

    const sub = this.ventasService.getSaleReceiptByCorrelative(correlativoLimpio).subscribe({
      next: (res: any) => {
        try {
          if (!res) throw new Error('Respuesta vacía del servidor');

          const cabecera = res.data ? res.data : res;

          this.ventaReferenciaCabecera.set({
            id:               cabecera.id_comprobante,
            clienteNombre:    cabecera.cliente?.nombre    || 'Cliente sin nombre',
            clienteDocumento: cabecera.cliente?.documento || 'S/D',
            fechaEmision:     cabecera.fec_emision,
            total:            Number(cabecera.total    || 0),
            subtotal:         Number(cabecera.subtotal || 0),
            igv:              Number(cabecera.igv      || 0),
          });

          const itemsMapeados = (cabecera.productos || []).map((p: any) => ({
            id_detalle:        p.id_producto || p.productId || p.id_prod_ref || p.id,
            descripcion:       p.descripcion || 'Producto Desconocido',
            cantidadOriginal:  Number(p.cantidad   || 0),
            precioUnitario:    Number(p.precio_unit || 0),
            cantidadADevolver: 0,
            seleccionado:      false,
          }));

          this.itemsVenta.set(itemsMapeados);
          this.buscandoComprobante.set(false);

          this.messageService.add(
            itemsMapeados.length > 0
              ? { severity: 'success', summary: 'Éxito',     detail: 'Comprobante cargado correctamente.' }
              : { severity: 'warn',    summary: 'Atención',  detail: 'El comprobante no tiene productos para devolver.' },
          );
        } catch (e) {
          console.error('Error mapeando la data:', e);
          this.buscandoComprobante.set(false);
          this.messageService.add({
            severity: 'error',
            summary:  'Error',
            detail:   'Estructura de comprobante irreconocible.',
          });
        }
      },
      error: (err) => {
        console.error(err);
        this.buscandoComprobante.set(false);
        this.messageService.add({
          severity: 'error',
          summary:  'No encontrado',
          detail:   'No se pudo localizar el comprobante.',
        });
      },
    });
    this.subscriptions.add(sub);
  }

  limpiarBuscadorBase(): void {
    this.ventaReferenciaCabecera.set(null);
    this.itemsVenta.set([]);
    this.motivoSunatSeleccionado.set(null);
    this.sustentoDescripcion.set('');
  }

  // ── Handlers de tabla ─────────────────────────────────────────
  onMotivoChange(): void {
    const motivo     = this.motivoSunatSeleccionado();
    const totalRefund = motivo === '01' || motivo === '06';
    this.itemsVenta.set(
      this.itemsVenta().map((item) =>
        totalRefund
          ? { ...item, seleccionado: true,  cantidadADevolver: item.cantidadOriginal }
          : { ...item, seleccionado: false, cantidadADevolver: 0 },
      ),
    );
  }

  onCantidadChange(item: VentaItemUI): void {
    const cant = Math.min(Math.max(item.cantidadADevolver, 0), item.cantidadOriginal);
    this.itemsVenta.set(
      this.itemsVenta().map((i) =>
        i.id_detalle === item.id_detalle
          ? { ...i, cantidadADevolver: cant, seleccionado: cant > 0 }
          : i,
      ),
    );
  }

  onCheckboxChange(item: VentaItemUI): void {
    this.itemsVenta.set(
      this.itemsVenta().map((i) => {
        if (i.id_detalle !== item.id_detalle) return i;
        const cant = i.seleccionado && i.cantidadADevolver === 0
          ? 1
          : !i.seleccionado ? 0 : i.cantidadADevolver;
        return { ...i, cantidadADevolver: cant };
      }),
    );
  }

  // ── Emisión ───────────────────────────────────────────────────
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
      header:                  'Confirmar Emisión a SUNAT',
      message:                 '¿Está seguro que desea emitir la Nota de Crédito? Esta acción no se puede deshacer.',
      icon:                    'pi pi-exclamation-triangle',
      acceptLabel:             'Sí, Emitir NC',
      rejectLabel:             'Cancelar',
      acceptButtonStyleClass:  'p-button-success',
      rejectButtonStyleClass:  'p-button-text p-button-secondary',
      accept: () => this.emitirNotaCredito(),
    });
  }

  private emitirNotaCredito(): void {
    this.guardandoNota.set(true);

    const payload: RegisterCreditNoteDto = {
      salesReceiptId:    this.ventaReferenciaCabecera().id,
      reasonCode:        this.motivoSunatSeleccionado()!,
      reasonDescription: this.sustentoDescripcion().trim(),
      clientName:        this.ventaReferenciaCabecera().clienteNombre,
      clientDocument:    this.ventaReferenciaCabecera().clienteDocumento,
      clientId:          this.ventaReferenciaCabecera().clienteId || 1,
      items: this.itemsVenta()
        .filter((i) => i.seleccionado && i.cantidadADevolver > 0)
        .map((item) => ({
          itemId:   Number(item.id_detalle),
          quantity: item.cantidadADevolver,
        })),
    };

    const sub = this.creditNoteService.registrar(payload).subscribe({
      next: () => {
        this.guardandoNota.set(false);
        this.messageService.add({
          severity: 'success',
          summary:  'Éxito',
          detail:   'Nota de Crédito emitida correctamente',
          life:     4000,
        });
        setTimeout(() => this.volverListado(), 2000);
      },
      error: (err) => {
        this.guardandoNota.set(false);
        this.messageService.add({
          severity: 'error',
          summary:  'Error',
          detail:   err?.error?.message || 'No se pudo emitir la nota de crédito',
          life:     5000,
        });
      },
    });
    this.subscriptions.add(sub);
  }

  volverListado(): void {
    this.router.navigate(['/admin/nota-credito']);
  }
}