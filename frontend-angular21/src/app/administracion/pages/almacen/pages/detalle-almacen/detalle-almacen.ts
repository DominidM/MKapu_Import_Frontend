import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';

import { AuthService } from '../../../../../auth/services/auth.service';
import { Headquarter, SedeBasica } from '../../../../interfaces/almacen.interface';
import { AlmacenService } from '../../../../services/almacen.service';

type SedeRelacionResponse =
  | {
      id_sede?: number | null;
      sede?: SedeBasica | null;
    }
  | SedeBasica
  | null;

function normalizeSede(value: SedeRelacionResponse): SedeBasica | null {
  if (!value) {
    return null;
  }

  if ('sede' in value) {
    return value.sede ?? null;
  }

  if ('id_sede' in value && 'nombre' in value) {
    return value;
  }

  return null;
}

function cleanLabel(value?: string | null, fallback = 'Sin registro'): string {
  const normalized = value?.trim();
  return normalized ? normalized : fallback;
}

@Component({
  selector: 'app-detalle-almacen',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, TagModule],
  templateUrl: './detalle-almacen.html',
  styleUrl: './detalle-almacen.css',
})
export class DetalleAlmacen {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly almacenService = inject(AlmacenService);
  private readonly authService = inject(AuthService);

  private readonly paramMap = toSignal(this.route.paramMap, {
    initialValue: convertToParamMap({}),
  });

  readonly loading = signal(true);
  readonly errorMsg = signal<string | null>(null);
  readonly detalle = signal<Headquarter | null>(null);

  readonly almacenId = computed(() => {
    const id = Number(this.paramMap().get('id'));
    return Number.isInteger(id) && id > 0 ? id : null;
  });

  readonly canEdit = computed(() => this.authService.hasPermiso('EDITAR_ALMACEN'));
  readonly nombreAlmacen = computed(() => cleanLabel(this.detalle()?.nombre, 'ALMACÉN SIN NOMBRE'));
  readonly codigoAlmacen = computed(() => cleanLabel(this.detalle()?.codigo, 'SIN CÓDIGO'));
  readonly departamentoLabel = computed(() => cleanLabel(this.detalle()?.departamento));
  readonly provinciaLabel = computed(() => cleanLabel(this.detalle()?.provincia));
  readonly ciudadLabel = computed(() => cleanLabel(this.detalle()?.ciudad));
  readonly telefonoLabel = computed(() => cleanLabel(this.detalle()?.telefono, 'Sin teléfono registrado'));
  readonly direccionLabel = computed(() => cleanLabel(this.detalle()?.direccion, 'Sin dirección registrada'));
  readonly sedeNombre = computed(() => cleanLabel(this.detalle()?.sede?.nombre, 'SIN SEDE'));
  readonly sedeCodigo = computed(() => cleanLabel(this.detalle()?.sede?.codigo, 'Sin código de sede'));
  readonly estadoLabel = computed(() => (this.detalle()?.activo ? 'Activo' : 'Inactivo'));

  readonly ubicacionResumen = computed(() => {
    const detail = this.detalle();
    if (!detail) {
      return 'Sin ubicación registrada';
    }

    const parts = [detail.departamento, detail.provincia, detail.ciudad]
      .map((value) => value?.trim())
      .filter((value): value is string => !!value);

    return parts.length > 0 ? parts.join(' · ') : 'Sin ubicación registrada';
  });

  readonly sedeDetalle = computed(() => {
    const sede = this.detalle()?.sede;
    if (!sede) {
      return 'Sin sede asignada';
    }

    return sede.codigo?.trim() ? `Código ${sede.codigo}` : 'Sede asignada';
  });

  constructor() {
    effect((onCleanup) => {
      const id = this.almacenId();

      if (!id) {
        this.detalle.set(null);
        this.loading.set(false);
        this.errorMsg.set('ID de almacén inválido.');
        return;
      }

      this.loading.set(true);
      this.errorMsg.set(null);

      const subscription = forkJoin({
        almacen: this.almacenService.getAlmacenById(id),
        sedeRelacion: this.almacenService.getSedeDeAlmacen(id),
      }).subscribe({
        next: ({ almacen, sedeRelacion }) => {
          this.detalle.set({
            ...almacen,
            sede: normalizeSede(sedeRelacion) ?? almacen.sede ?? null,
          });
          this.loading.set(false);
        },
        error: (error) => {
          this.detalle.set(null);
          this.loading.set(false);
          this.errorMsg.set(
            error?.error?.message ?? 'No se pudo cargar el detalle del almacén.',
          );
        },
      });

      onCleanup(() => subscription.unsubscribe());
    });
  }

  volver(): void {
    this.router.navigate(['/admin/almacen']);
  }

  irEditar(): void {
    const id = this.almacenId();
    if (!id || !this.canEdit()) {
      return;
    }

    this.router.navigate(['/admin/almacen/editar-almacen', id]);
  }
}