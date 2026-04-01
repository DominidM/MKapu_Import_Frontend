import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';

import { AuthService } from '../../../../../auth/services/auth.service';
import { SedeService } from '../../../../services/sede.service';
import { WastageDetail, WastageResponseDto, WastageService } from '../../../../services/wastage.service';

function cleanText(value?: string | null, fallback = 'Sin registro'): string {
  const normalized = value?.trim();
  return normalized ? normalized : fallback;
}

function normalizeKey(value?: string | null): string {
  return (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toUpperCase();
}

@Component({
  selector: 'app-mermas-detalle',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, TagModule],
  templateUrl: './mermas-detalle.html',
  styleUrl: './mermas-detalle.css',
})
export class MermasDetalle {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly wastageService = inject(WastageService);
  private readonly sedeService = inject(SedeService);
  private readonly authService = inject(AuthService);

  private readonly paramMap = toSignal(this.route.paramMap, {
    initialValue: convertToParamMap({}),
  });

  readonly loading = signal(true);
  readonly errorMsg = signal<string | null>(null);
  readonly detalle = signal<WastageResponseDto | null>(null);

  readonly mermaId = computed(() => {
    const id = Number(this.paramMap().get('id'));
    return Number.isInteger(id) && id > 0 ? id : null;
  });

  readonly canEdit = computed(() => this.authService.hasPermiso('EDITAR_MERMAS'));
  readonly productos = computed(() => this.detalle()?.detalles ?? []);
  readonly mermaCode = computed(() => {
    const id = this.detalle()?.id_merma;
    return id ? `MER-${id.toString().padStart(4, '0')}` : 'MER-0000';
  });
  readonly motivoLabel = computed(() => cleanText(this.detalle()?.motivo, 'Sin motivo registrado.'));
  readonly tipoMermaLabel = computed(() => cleanText(this.detalle()?.tipo_merma_label, 'Sin clasificacion'));
  readonly responsableLabel = computed(() => cleanText(this.detalle()?.responsable, 'Sin responsable asignado'));
  readonly fechaRegistro = computed(() => this.detalle()?.fec_merma ?? null);
  readonly estadoLabel = computed(() => this.detalle()?.estado ? 'Activo' : 'Inactivo');
  readonly estadoDetalle = computed(() =>
    this.detalle()?.estado ? 'Registro disponible para seguimiento' : 'Registro fuera de operacion',
  );
  readonly sedeLabel = computed(() => {
    const idSede = this.detalle()?.id_sede_ref;
    if (!idSede) return 'Sede no disponible';
    const sede = this.sedeService.sedes().find((item) => item.id_sede === idSede);
    return cleanText(sede?.nombre, 'Sede no disponible');
  });
  readonly detalleCount = computed(() => this.productos().length);
  readonly totalItems = computed(() => Number(this.detalle()?.total_items ?? 0) || 0);
  readonly valorTotal = computed(() =>
    this.productos().reduce((sum, item) => sum + Number(item.cantidad ?? 0) * Number(item.pre_unit ?? 0), 0),
  );
  readonly observaciones = computed(() => {
    const unique = new Set(
      this.productos()
        .map((item) => item.observacion?.trim())
        .filter((item): item is string => !!item),
    );
    return Array.from(unique);
  });
  readonly observacionesCount = computed(() => this.observaciones().length);
  readonly observacionesLabel = computed(() =>
    this.observaciones().length > 0
      ? this.observaciones().join(' | ')
      : 'Sin observaciones registradas.',
  );
  readonly promedioUnidades = computed(() => {
    const productos = this.detalleCount();
    if (!productos) return 0;
    return this.totalItems() / productos;
  });

  constructor() {
    this.sedeService.loadSedes().subscribe({ error: () => void 0 });

    effect((onCleanup) => {
      const id = this.mermaId();

      if (!id) {
        this.detalle.set(null);
        this.loading.set(false);
        this.errorMsg.set('ID de merma invalido.');
        return;
      }

      this.loading.set(true);
      this.errorMsg.set(null);

      const subscription = this.wastageService.getWastageById(id).subscribe({
        next: (response) => {
          this.detalle.set(response);
          this.loading.set(false);
        },
        error: (error) => {
          this.detalle.set(null);
          this.loading.set(false);
          this.errorMsg.set(error?.error?.message ?? 'No se pudo cargar el detalle de la merma.');
        },
      });

      onCleanup(() => subscription.unsubscribe());
    });
  }

  volver(): void {
    this.router.navigate(['/admin/mermas']);
  }

  irEditar(): void {
    const id = this.mermaId();
    if (!id || !this.canEdit()) {
      return;
    }

    this.router.navigate(['/admin/mermas/edicion-merma', id]);
  }

  getTipoMermaSeverity(tipo: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    switch (normalizeKey(tipo)) {
      case 'DANO':
      case 'ROBO':
        return 'danger';
      case 'VENCIMIENTO':
      case 'DEVOLUCION':
        return 'warn';
      case 'DETERIORO':
        return 'info';
      case 'ERROR_CONTEO':
      case 'SIN CLASIFICACION':
        return 'secondary';
      default:
        return 'info';
    }
  }

  trackDetalle(item: WastageDetail, index: number): number | string {
    return item.id_detalle ?? `${item.id_producto}-${index}`;
  }
}