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

import { ConteoInventario, DetalleConteo } from '../../interfaces/conteo.interface';
import { ConteoInventarioService } from '../../services/conteo-inventario.service';

interface ConteoDetalleRow {
  idDetalle?: number;
  id_detalle?: number;
  idProducto?: number;
  id_producto?: number;
  codProd?: string;
  cod_prod?: string;
  descripcion?: string;
  uniMed?: string;
  unidad_medida?: string;
  stockSistema?: number | string | null;
  stock_sistema?: number | string | null;
  stockConteo?: number | string | null;
  stock_conteo?: number | string | null;
  diferencia?: number | string | null;
  observacion?: string | null;
}

interface ConteoDetalleResponse {
  idConteo?: number;
  id_conteo?: number;
  nomSede?: string;
  nom_sede?: string;
  fechaIni?: string | Date | null;
  fecha_inicio?: string | Date | null;
  fechaFin?: string | Date | null;
  fecha_fin?: string | Date | null;
  estado?: string | null;
  totalItems?: number;
  total_items?: number;
  totalDiferencias?: number;
  total_diferencias?: number;
  nomCategoria?: string | null;
  nom_categoria?: string | null;
  detalles?: ConteoDetalleRow[];
}

function cleanText(value?: string | null, fallback = 'Sin registro'): string {
  const normalized = value?.trim();
  return normalized ? normalized : fallback;
}

function toNumber(value: number | string | null | undefined): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

@Component({
  selector: 'app-conteo-detalle',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    TableModule,
    TagModule,
    ToastModule,
    ConfirmDialogModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './conteodetalle.html',
  styleUrl: './conteodetalle.css',
})
export class ConteoDetalle {
  private readonly conteoService = inject(ConteoInventarioService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  private readonly paramMap = toSignal(this.route.paramMap, {
    initialValue: convertToParamMap({}),
  });

  readonly loading = signal(true);
  readonly errorMsg = signal<string | null>(null);
  readonly detalle = signal<ConteoDetalleResponse | null>(null);
  readonly isDownloadingPdf = signal(false);
  readonly isDownloadingExcel = signal(false);
  readonly actionLoading = signal(false);

  readonly conteoId = computed(() => {
    const id = Number(this.paramMap().get('id'));
    return Number.isInteger(id) && id > 0 ? id : null;
  });

  readonly detalleRows = computed(() => this.detalle()?.detalles ?? []);
  readonly conteoCode = computed(() => {
    const id = this.detalle()?.idConteo ?? this.detalle()?.id_conteo;
    return id ? `CNT-${id.toString().padStart(4, '0')}` : 'CNT-0000';
  });
  readonly sedeLabel = computed(() => cleanText(this.detalle()?.nomSede ?? this.detalle()?.nom_sede, 'Sede no disponible'));
  readonly categoriaLabel = computed(() => cleanText(this.detalle()?.nomCategoria ?? this.detalle()?.nom_categoria, 'Varias familias'));
  readonly fechaInicio = computed(() => this.detalle()?.fechaIni ?? this.detalle()?.fecha_inicio ?? null);
  readonly fechaFin = computed(() => this.detalle()?.fechaFin ?? this.detalle()?.fecha_fin ?? null);
  readonly estadoKey = computed(() => cleanText(this.detalle()?.estado, 'SIN ESTADO').toUpperCase());
  readonly estadoLabel = computed(() => this.estadoKey().replace(/_/g, ' '));
  readonly canContinue = computed(() => ['PENDIENTE', 'INICIADO'].includes(this.estadoKey()));
  readonly canAnnul = computed(() => ['PENDIENTE', 'INICIADO'].includes(this.estadoKey()));
  readonly totalSistema = computed(() =>
    this.detalleRows().reduce((acc, item) => acc + toNumber(item.stockSistema ?? item.stock_sistema), 0),
  );
  readonly totalReal = computed(() =>
    this.detalleRows().reduce((acc, item) => acc + toNumber(item.stockConteo ?? item.stock_conteo), 0),
  );
  readonly diferenciaNeta = computed(() => this.totalReal() - this.totalSistema());
  readonly totalItems = computed(() => {
    const explicitTotal = this.detalle()?.totalItems ?? this.detalle()?.total_items;
    if (explicitTotal != null) return toNumber(explicitTotal);
    return this.detalleRows().length;
  });
  readonly desviacionesCount = computed(() =>
    this.detalleRows().filter((item) => toNumber(item.diferencia) !== 0).length,
  );
  readonly totalDiferencias = computed(() => {
    const explicitTotal = this.detalle()?.totalDiferencias ?? this.detalle()?.total_diferencias;
    if (explicitTotal != null) return toNumber(explicitTotal);
    return this.detalleRows().reduce((acc, item) => acc + Math.abs(toNumber(item.diferencia)), 0);
  });
  readonly exactitud = computed(() => {
    const sistema = this.totalSistema();
    if (sistema <= 0) return 100;
    const delta = Math.abs(this.diferenciaNeta());
    const percentage = Math.max(0, 100 - Math.round((delta / sistema) * 100));
    return Math.min(100, percentage);
  });
  readonly exactitudDetalle = computed(() => {
    if (this.desviacionesCount() === 0) return 'Sin diferencias detectadas';
    return `${this.desviacionesCount()} productos con diferencia`;
  });

  constructor() {
    effect((onCleanup) => {
      const id = this.conteoId();

      if (!id) {
        this.detalle.set(null);
        this.loading.set(false);
        this.errorMsg.set('ID de conteo invalido.');
        return;
      }

      this.loading.set(true);
      this.errorMsg.set(null);

      const subscription = this.conteoService.obtenerDetalle(id).subscribe({
        next: (response) => {
          this.detalle.set((response?.data ?? response) as ConteoDetalleResponse);
          this.loading.set(false);
        },
        error: (error) => {
          this.detalle.set(null);
          this.loading.set(false);
          this.errorMsg.set(error?.error?.message ?? 'No se pudo cargar el detalle del conteo.');
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo cargar el detalle del conteo.',
          });
        },
      });

      onCleanup(() => subscription.unsubscribe());
    });
  }

  volver(): void {
    this.router.navigate(['/logistica/conteo-inventario']);
  }

  retomarConteo(): void {
    const id = this.conteoId();
    if (!id) return;
    this.router.navigate(['/logistica/conteo-crear'], { queryParams: { idRetomar: id } });
  }

  anularConteo(): void {
    const id = this.conteoId();
    if (!id || !this.canAnnul()) return;

    this.confirmationService.confirm({
      message: 'Esta accion cerrara el conteo sin ajustar stock. Deseas continuar?',
      header: 'Anular Conteo',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Si, anular',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.actionLoading.set(true);
        this.conteoService.finalizarYajustar(id, 'ANULADO', []).subscribe({
          next: () => {
            this.actionLoading.set(false);
            this.messageService.add({
              severity: 'success',
              summary: 'Conteo anulado',
              detail: 'El conteo fue anulado correctamente.',
            });
            this.volver();
          },
          error: (error) => {
            this.actionLoading.set(false);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error?.error?.message ?? 'No se pudo anular el conteo.',
            });
          },
        });
      },
    });
  }

  descargarExcel(): void {
    const id = this.conteoId();
    if (!id) return;

    this.isDownloadingExcel.set(true);
    this.conteoService.exportarExcel(id).subscribe({
      next: (blob) => {
        this.downloadBlob(blob, `Conteo_Inventario_${id}.xlsx`);
        this.isDownloadingExcel.set(false);
      },
      error: () => {
        this.isDownloadingExcel.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo descargar el Excel.',
        });
      },
    });
  }

  descargarPdf(): void {
    const id = this.conteoId();
    if (!id) return;

    this.isDownloadingPdf.set(true);
    this.conteoService.exportarPdf(id).subscribe({
      next: (blob) => {
        this.downloadBlob(blob, `Conteo_Inventario_${id}.pdf`);
        this.isDownloadingPdf.set(false);
      },
      error: () => {
        this.isDownloadingPdf.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo descargar el PDF.',
        });
      },
    });
  }

  getEstadoSeverity(estado: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    switch (estado) {
      case 'AJUSTADO':
      case 'FINALIZADO':
      case 'CONTADO':
        return 'success';
      case 'INICIADO':
      case 'PENDIENTE':
        return 'warn';
      case 'ANULADO':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  codigoProducto(item: ConteoDetalleRow): string {
    return cleanText(item.codProd ?? item.cod_prod, 'N/A');
  }

  descripcionProducto(item: ConteoDetalleRow): string {
    return cleanText(item.descripcion, 'Producto sin descripcion');
  }

  unidadMedida(item: ConteoDetalleRow): string {
    return cleanText(item.uniMed ?? item.unidad_medida, 'UND');
  }

  stockSistema(item: ConteoDetalleRow): number {
    return toNumber(item.stockSistema ?? item.stock_sistema);
  }

  stockConteo(item: ConteoDetalleRow): number {
    return toNumber(item.stockConteo ?? item.stock_conteo);
  }

  diferencia(item: ConteoDetalleRow): number {
    return toNumber(item.diferencia);
  }

  trackDetalle(item: ConteoDetalleRow, index: number): number | string {
    return item.idDetalle ?? item.id_detalle ?? `${this.codigoProducto(item)}-${index}`;
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