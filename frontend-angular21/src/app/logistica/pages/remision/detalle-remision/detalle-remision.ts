import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';

import {
  RemissionItemDto,
  RemissionResponse,
  RemissionType,
  TransportMode,
} from '../../../interfaces/remision.interface';
import { RemissionService } from '../../../services/remission.service';

interface RemissionDetailItem extends RemissionItemDto {
  codigo?: string | null;
  descripcion?: string | null;
}

interface RemissionDetail extends RemissionResponse {
  direccion_partida?: string | null;
  ubigeo_partida?: string | null;
  direccion_llegada?: string | null;
  ubigeo_llegada?: string | null;
  observaciones?: string | null;
  fecha_inicio_traslado?: string | Date | null;
  items?: RemissionDetailItem[];
}

function normalizeEstado(value: number | string | null | undefined): string {
  if (value === 0 || value === '0') return 'EMITIDO';
  if (typeof value === 'string') return value.toUpperCase();
  if (typeof value === 'number') return String(value);
  return 'SIN_ESTADO';
}

function cleanText(value?: string | null, fallback = 'Sin registro'): string {
  const normalized = value?.trim();
  return normalized ? normalized : fallback;
}

@Component({
  selector: 'app-detalle-remision',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, TagModule, TableModule, ToastModule, ConfirmDialogModule],
  providers: [MessageService, ConfirmationService],
  templateUrl: './detalle-remision.html',
  styleUrl: './detalle-remision.css',
})
export class DetalleRemision {
  private readonly remissionService = inject(RemissionService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly paramMap = toSignal(this.route.paramMap, {
    initialValue: convertToParamMap({}),
  });

  readonly loading = signal(true);
  readonly errorMsg = signal<string | null>(null);
  readonly remision = signal<RemissionDetail | null>(null);

  readonly remisionId = computed(() => this.paramMap().get('id'));
  readonly items = computed(() => this.remision()?.items ?? []);
  readonly serieNumero = computed(() => {
    const data = this.remision();
    if (!data) return '---';
    return `${cleanText(data.serie, 'GR')}-${data.numero ?? '000000'}`;
  });
  readonly estadoKey = computed(() => normalizeEstado(this.remision()?.estado));
  readonly estadoLabel = computed(() => this.estadoKey().replace(/_/g, ' '));
  readonly tipoGuiaLabel = computed(() =>
    this.remision()?.tipo_guia === RemissionType.REMITENTE ? 'Remitente' : 'Transportista',
  );
  readonly modalidadLabel = computed(() =>
    this.remision()?.modalidad === TransportMode.PUBLICO ? 'Público' : 'Privado',
  );
  readonly motivoLabel = computed(() => cleanText(this.remision()?.motivo_traslado, 'Sin motivo'));
  readonly descripcionLabel = computed(() => cleanText(this.remision()?.descripcion, 'Sin descripción registrada.'));
  readonly comprobanteLabel = computed(() => {
    const id = this.remision()?.id_comprobante_ref;
    return id ? `#${id}` : 'Sin comprobante asociado';
  });
  readonly direccionPartida = computed(() => cleanText(this.remision()?.direccion_partida, 'Punto de partida no registrado'));
  readonly ubigeoPartida = computed(() => cleanText(this.remision()?.ubigeo_partida, 'Ubigeo no registrado'));
  readonly direccionLlegada = computed(() => cleanText(this.remision()?.direccion_llegada, 'Punto de llegada no registrado'));
  readonly ubigeoLlegada = computed(() => cleanText(this.remision()?.ubigeo_llegada, 'Ubigeo no registrado'));
  readonly fechaInicio = computed(() => this.remision()?.fecha_inicio ?? this.remision()?.fecha_inicio_traslado ?? null);
  readonly itemsCount = computed(() => {
    const detail = this.remision();
    const fromItems = this.items().length;
    if (fromItems > 0) return fromItems;
    return Number(detail?.cantidad ?? 0) || 0;
  });
  readonly itemsCountLabel = computed(() => {
    const count = this.itemsCount();
    return count === 1 ? '1 bien' : `${count} bienes`;
  });
  readonly fileBaseName = computed(() => {
    const detail = this.remision();
    if (!detail) return 'Guia_remision';
    return `Guia_${detail.serie}-${detail.numero}`;
  });
  readonly canDispatch = computed(() => this.estadoKey() === 'EMITIDO');
  readonly canComplete = computed(() => this.estadoKey() === 'EN_CAMINO');
  readonly showActionState = computed(() => this.canDispatch() || this.canComplete());

  constructor() {
    effect((onCleanup) => {
      const id = this.remisionId();
      if (!id) {
        this.remision.set(null);
        this.loading.set(false);
        this.errorMsg.set('ID de guí­a inválido.');
        return;
      }
      const subscription = this.fetchDetalle(id);
      onCleanup(() => subscription.unsubscribe());
    });
  }

  private fetchDetalle(id: string) {
    this.loading.set(true);
    this.errorMsg.set(null);
    return this.remissionService.getRemisionById(id).subscribe({
      next: (data) => {
        this.remision.set(data as RemissionDetail);
        this.loading.set(false);
      },
      error: (error) => {
        this.remision.set(null);
        this.loading.set(false);
        this.errorMsg.set(error?.error?.message ?? 'No se pudo cargar el detalle de la guí­a.');
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar el detalle de la guía.' });
      },
    });
  }

  actualizarEstado(nuevoEstado: string): void {
    const currentData = this.remision();
    if (!currentData) return;

    let accionTexto = '';
    if (nuevoEstado === 'EN_CAMINO') accionTexto = 'iniciar el traslado';
    if (nuevoEstado === 'ENTREGADO') accionTexto = 'confirmar la entrega';
    if (nuevoEstado === 'RECHAZADO') accionTexto = 'rechazar la guí­a';

    this.confirmationService.confirm({
      message: `¿Estás seguro de ${accionTexto}?`,
      header: 'Confirmar Acción',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí­, continuar',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.loading.set(true);
        this.remissionService.cambiarEstado(currentData.id_guia, nuevoEstado).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'éxito', detail: `Estado actualizado a ${nuevoEstado.replace(/_/g, ' ')}` });
            this.fetchDetalle(currentData.id_guia);
          },
          error: () => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar el estado.' });
            this.loading.set(false);
          },
        });
      },
    });
  }

  descargarPdf(): void {
    const data = this.remision();
    if (!data) return;
    this.messageService.add({ severity: 'info', summary: 'Generando PDF', detail: 'Iniciando descarga...' });
    this.remissionService.exportPdf(data.id_guia).subscribe({
      next: (blob) => this.downloadBlob(blob, `${this.fileBaseName()}.pdf`),
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo descargar el PDF.' });
      },
    });
  }

  descargarExcel(): void {
    const data = this.remision();
    if (!data) return;
    this.messageService.add({ severity: 'info', summary: 'Generando Excel', detail: 'Iniciando descarga...' });
    this.remissionService.exportExcel(data.id_guia).subscribe({
      next: (blob) => this.downloadBlob(blob, `${this.fileBaseName()}.xlsx`),
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo descargar el Excel.' });
      },
    });
  }

  volver(): void {
    this.router.navigate(['/logistica/remision']);
  }

  getSeverity(estado: number | string | null | undefined): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    switch (normalizeEstado(estado)) {
      case 'ENTREGADO': return 'success';
      case 'EN_CAMINO': return 'warn';
      case 'EMITIDO': return 'info';
      case 'ANULADO':
      case 'RECHAZADO': return 'danger';
      default: return 'secondary';
    }
  }

  itemCode(item: RemissionDetailItem): string {
    return cleanText(item.cod_prod ?? item.codigo ?? null, 'SIN CÓDIGO');
  }

  itemDescription(item: RemissionDetailItem): string {
    return cleanText(item.descripcion, 'Producto sin descripción');
  }

  private downloadBlob(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    window.URL.revokeObjectURL(url);
  }
}
