import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';

import { CreditNoteDetail, CreditNoteItem, CreditNoteService } from '../../../services/nota-credito.service';

function cleanText(value?: string | null, fallback = 'Sin registro'): string {
  const normalized = value?.trim();
  return normalized ? normalized : fallback;
}

@Component({
  selector: 'app-detalle-nota-credito',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, TagModule],
  templateUrl: './detalle-nota-credito.html',
  styleUrl: './detalle-nota-credito.css',
})
export class DetalleNotaCreditoComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly creditNoteService = inject(CreditNoteService);

  private readonly paramMap = toSignal(this.route.paramMap, {
    initialValue: convertToParamMap({}),
  });

  readonly loading = signal(true);
  readonly errorMsg = signal<string | null>(null);
  readonly detalle = signal<CreditNoteDetail | null>(null);

  readonly noteId = computed(() => {
    const id = Number(this.paramMap().get('id'));
    return Number.isInteger(id) && id > 0 ? id : null;
  });

  readonly correlativo = computed(() => cleanText(this.detalle()?.correlative, 'NC-0000'));
  readonly documentoRef = computed(() => {
    const detalle = this.detalle();
    if (!detalle) return 'Sin referencia';
    const serie = cleanText(detalle.serieRef, '---');
    const numero = cleanText(detalle.numberDocRef, '---');
    return `${serie}-${numero}`;
  });
  readonly clienteNombre = computed(() => cleanText(this.detalle()?.customerName, 'Cliente no registrado'));
  readonly clienteDocumento = computed(() => cleanText(this.detalle()?.customerDocument, 'Documento no registrado'));
  readonly tipoDevolucion = computed(() => this.detalle()?.businessType === 'DEVOLUCION_PARCIAL' ? 'Parcial' : 'Total');
  readonly tipoDetalle = computed(() =>
    this.detalle()?.businessType === 'DEVOLUCION_PARCIAL'
      ? 'Ajuste parcial sobre el comprobante base'
      : 'Anulacion total del comprobante base',
  );
  readonly estadoLabel = computed(() => cleanText(this.detalle()?.status, 'SIN ESTADO'));
  readonly monedaLabel = computed(() => cleanText(this.detalle()?.currency, 'S/'));
  readonly issueDate = computed(() => this.detalle()?.issueDate ?? null);
  readonly items = computed(() => this.detalle()?.items ?? []);
  readonly itemsCount = computed(() => this.items().length);
  readonly totalCantidad = computed(() => this.items().reduce((sum, item) => sum + Number(item.quantity ?? 0), 0));
  readonly valorVenta = computed(() => Number(this.detalle()?.saleValue ?? 0));
  readonly igv = computed(() => Number(this.detalle()?.igv ?? 0));
  readonly isc = computed(() => Number(this.detalle()?.isc ?? 0));
  readonly totalFinal = computed(() => Number(this.detalle()?.totalAmount ?? 0));
  readonly promedioPorItem = computed(() => {
    const count = this.itemsCount();
    if (!count) return 0;
    return this.totalFinal() / count;
  });

  constructor() {
    effect((onCleanup) => {
      const id = this.noteId();

      if (!id) {
        this.detalle.set(null);
        this.loading.set(false);
        this.errorMsg.set('ID de nota de credito invalido.');
        return;
      }

      this.loading.set(true);
      this.errorMsg.set(null);

      const subscription = this.creditNoteService.detalle(id).subscribe({
        next: (response) => {
          this.detalle.set(response);
          this.loading.set(false);
        },
        error: (error) => {
          this.detalle.set(null);
          this.loading.set(false);
          this.errorMsg.set(error?.error?.message ?? 'No se pudo cargar el detalle de la nota de credito.');
        },
      });

      onCleanup(() => subscription.unsubscribe());
    });
  }

  volver(): void {
    this.router.navigate(['/admin/nota-credito']);
  }

  getSeveridadEstado(status: string): 'success' | 'warn' | 'danger' | 'info' | 'secondary' {
    switch (status?.toUpperCase()) {
      case 'EMITIDA':
        return 'info';
      case 'ACEPTADA':
        return 'success';
      case 'OBSERVADA':
        return 'warn';
      case 'RECHAZADA':
        return 'danger';
      case 'REVERTIDA':
        return 'secondary';
      default:
        return 'secondary';
    }
  }

  getSeveridadTipo(tipo: string): 'info' | 'warn' {
    return tipo === 'Parcial' ? 'warn' : 'info';
  }

  trackItem(item: CreditNoteItem): number {
    return item.itemId;
  }
}