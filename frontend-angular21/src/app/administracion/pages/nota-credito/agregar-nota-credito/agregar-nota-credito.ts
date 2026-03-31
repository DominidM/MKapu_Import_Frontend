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
  id_detalle: string | number; // Cambiado para soportar cod_prod si es string
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
  private readonly router = inject(Router);
  private readonly creditNoteService = inject(CreditNoteService);
  private readonly ventasService = inject(VentasApiService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly stockSocket = inject(StockSocketService);

  private subscriptions = new Subscription();

  readonly tiposComprobante = [
    { label: 'Factura', value: '01' },
    { label: 'Boleta', value: '03' },
  ];

  // ── Signals ──────────────────────────────────────────────────
  tipoComprobanteRef = signal<string | null>(null);
  serieCorrelativoRef = signal<string>('');
  buscandoComprobante = signal<boolean>(false);

  ventaReferenciaCabecera = signal<any>(null);
  itemsVenta = signal<VentaItemUI[]>([]);

  motivoSunatSeleccionado = signal<string | null>(null);
  sustentoDescripcion = signal<string>('');
  guardandoNota = signal<boolean>(false);

  readonly motivosSunat = [
    { label: 'Anulación de la operación', value: '01' },
    { label: 'Anulación por error en el RUC', value: '02' },
    { label: 'Corrección por error en la descripción', value: '03' },
    { label: 'Descuento global', value: '04' },
    { label: 'Descuento por ítem', value: '05' },
    { label: 'Devolución total', value: '06' },
    { label: 'Devolución por ítem', value: '07' },
    { label: 'Bonificación', value: '08' },
    { label: 'Disminución en el valor', value: '09' },
  ];

  // ── Computed ──────────────────────────────────────────────────
  esFormularioValido = computed(() => {
    const hayItemsSeleccionados = this.itemsVenta().some(
      (i) => i.seleccionado && i.cantidadADevolver > 0,
    );
    return !!(
      this.ventaReferenciaCabecera() &&
      this.motivoSunatSeleccionado() &&
      this.sustentoDescripcion().trim().length >= 5 &&
      hayItemsSeleccionados
    );
  });

  private stockListener = (data: any) => {
    this.messageService.add({
      severity: 'info',
      summary: 'Inventario Actualizado',
      detail: `Se devolvieron ${data.quantity} unidades del producto ID: ${data.productId} al almacén.`,
      life: 6000
    });
  };

  ngOnInit(): void {
    this.stockSocket.onStockActualizado(this.stockListener);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.stockSocket.offStockActualizado(this.stockListener);
  }

  buscarComprobante(): void {
    if (!this.tipoComprobanteRef()) {
      this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'Seleccione el tipo de comprobante.' });
      return;
    }
    if (!this.serieCorrelativoRef() || !this.serieCorrelativoRef().includes('-')) {
      this.messageService.add({ severity: 'error', summary: 'Formato inválido', detail: 'Use el formato Serie-Número (Ej: F001-123).' });
      return;
    }

    this.buscandoComprobante.set(true);
    this.limpiarBuscadorBase();
    
    const correlativoLimpio = this.serieCorrelativoRef().trim().toUpperCase();

    const sub = this.ventasService.getSaleReceiptByCorrelative(correlativoLimpio).subscribe({
      next: (res: any) => {
        try {
          if (!res) throw new Error('Respuesta vacía del servidor');

          // Como el backend ya devuelve detailResponse.data directo, 'res' es la cabecera
          const cabecera = res.data ? res.data : res;

          // Asignamos la data EXACTA que arroja getDetalleCompleto()
          this.ventaReferenciaCabecera.set({
            id: cabecera.id_comprobante,
            clienteNombre: cabecera.cliente?.nombre || 'Cliente sin nombre',
            clienteDocumento: cabecera.cliente?.documento || 'S/D',
            fechaEmision: cabecera.fec_emision,
            total: Number(cabecera.total || 0),
            subtotal: Number(cabecera.subtotal || 0),
            igv: Number(cabecera.igv || 0)            
          });

          // Mapeamos los productos según la estructura de getDetalleCompleto()
          const listaProductos = cabecera.productos || [];

          const itemsMapeados = listaProductos.map((p: any) => {
            return {
              id_detalle: p.id_producto || p.productId || p.id_prod_ref || p.id, 
              descripcion: p.descripcion || 'Producto Desconocido',
              cantidadOriginal: Number(p.cantidad || 0),
              precioUnitario: Number(p.precio_unit || 0), // getDetalleCompleto lo llama precio_unit
              cantidadADevolver: 0,
              seleccionado: false,
            };
          });

          this.itemsVenta.set(itemsMapeados);
          this.buscandoComprobante.set(false);

          if (this.itemsVenta().length > 0) {
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Comprobante cargado correctamente.' });
          } else {
            this.messageService.add({ severity: 'warn', summary: 'Atención', detail: 'El comprobante no tiene productos para devolver.' });
          }

        } catch (e) {
          console.error("Error mapeando la data:", e);
          this.buscandoComprobante.set(false);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Estructura de comprobante irreconocible.' });
        }
      },
      error: (err) => {
        console.error(err);
        this.buscandoComprobante.set(false);
        this.messageService.add({ severity: 'error', summary: 'No encontrado', detail: 'No se pudo localizar el comprobante.' });
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

  onMotivoChange(): void {
    const motivo = this.motivoSunatSeleccionado();
    const nuevosItems = this.itemsVenta().map(item => {
      if (motivo === '01' || motivo === '06') {
        return { ...item, seleccionado: true, cantidadADevolver: item.cantidadOriginal };
      } else {
        return { ...item, seleccionado: false, cantidadADevolver: 0 };
      }
    });
    this.itemsVenta.set(nuevosItems);
  }

  onCantidadChange(item: VentaItemUI): void {
    let cant = item.cantidadADevolver;
    if (cant > item.cantidadOriginal) cant = item.cantidadOriginal;
    if (cant < 0) cant = 0;

    const nuevosItems = this.itemsVenta().map(i => {
      if (i.id_detalle === item.id_detalle) {
        return { ...i, cantidadADevolver: cant, seleccionado: cant > 0 };
      }
      return i;
    });
    this.itemsVenta.set(nuevosItems);
  }

  onCheckboxChange(item: VentaItemUI): void {
    const nuevosItems = this.itemsVenta().map(i => {
      if (i.id_detalle === item.id_detalle) {
        const cant = i.seleccionado && i.cantidadADevolver === 0 ? 1 : (!i.seleccionado ? 0 : i.cantidadADevolver);
        return { ...i, cantidadADevolver: cant };
      }
      return i;
    });
    this.itemsVenta.set(nuevosItems);
  }

  confirmarEmision(): void {
    if (!this.esFormularioValido()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Formulario Incompleto',
        detail: 'Verifique motivo, sustento (mín. 5 chars) y que haya productos seleccionados.',
      });
      return;
    }

    this.confirmationService.confirm({
      header: 'Confirmar Emisión a SUNAT',
      message: `¿Está seguro que desea emitir la Nota de Crédito? Esta acción no se puede deshacer y el documento será enviado a SUNAT de inmediato.`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, Emitir NC',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-success',
      rejectButtonStyleClass: 'p-button-text p-button-secondary',
      accept: () => {
        this.emitirNotaCredito();
      },
    });
  }

  private emitirNotaCredito(): void {
    this.guardandoNota.set(true);

    const itemsParaDevolver = this.itemsVenta().filter(
      (i) => i.seleccionado && i.cantidadADevolver > 0,
    );

    const payload: RegisterCreditNoteDto = {
      salesReceiptId: this.ventaReferenciaCabecera().id,
      reasonCode: this.motivoSunatSeleccionado()!,
      reasonDescription: this.sustentoDescripcion().trim(),
      clientName: this.ventaReferenciaCabecera().clienteNombre,
      clientDocument: this.ventaReferenciaCabecera().clienteDocumento,
      clientId: this.ventaReferenciaCabecera().clienteId || 1,
      items: itemsParaDevolver.map((item) => ({
        itemId: Number(item.id_detalle),
        quantity: item.cantidadADevolver,
      })),
    };
    console.log("Payload a enviar:", payload);

    const sub = this.creditNoteService.registrar(payload).subscribe({
      next: (res) => {
        this.guardandoNota.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Nota de Crédito emitida correctamente',
          life: 4000,
        });
        setTimeout(() => this.volverListado(), 2000); 
      },
      error: (err) => {
        this.guardandoNota.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err?.error?.message || 'No se pudo emitir la nota de crédito',
          life: 5000,
        });
      },
    });
    this.subscriptions.add(sub);
  }

  volverListado(): void {
    this.router.navigate(['/admin/nota-credito']);
  }
}
