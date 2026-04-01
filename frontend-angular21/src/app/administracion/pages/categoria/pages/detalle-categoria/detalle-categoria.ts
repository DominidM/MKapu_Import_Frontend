import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';

import { AuthService } from '../../../../../auth/services/auth.service';
import { Categoria } from '../../../../interfaces/categoria.interface';
import { CategoriaService } from '../../../../services/categoria.service';

function cleanText(value?: string | null, fallback = 'Sin registro'): string {
  const normalized = value?.trim();
  return normalized ? normalized : fallback;
}

@Component({
  selector: 'app-detalle-categoria',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, TagModule],
  templateUrl: './detalle-categoria.html',
  styleUrl: './detalle-categoria.css',
})
export class DetalleCategoria {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly categoriaService = inject(CategoriaService);
  private readonly authService = inject(AuthService);

  private readonly paramMap = toSignal(this.route.paramMap, {
    initialValue: convertToParamMap({}),
  });

  readonly loading = signal(true);
  readonly errorMsg = signal<string | null>(null);
  readonly detalle = signal<Categoria | null>(null);

  readonly categoriaId = computed(() => {
    const id = Number(this.paramMap().get('id'));
    return Number.isInteger(id) && id > 0 ? id : null;
  });

  readonly canEdit = computed(() => this.authService.hasPermiso('EDITAR_CATEGORIAS'));
  readonly categoriaCode = computed(() => {
    const id = this.detalle()?.id_categoria;
    return id ? `CAT-${id.toString().padStart(3, '0')}` : 'CAT-000';
  });
  readonly categoriaNombre = computed(() => cleanText(this.detalle()?.nombre, 'CATEGORÍA SIN NOMBRE'));
  readonly categoriaDescripcion = computed(() => cleanText(this.detalle()?.descripcion, 'Sin descripción registrada.'));
  readonly descripcionCorta = computed(() => {
    const text = this.detalle()?.descripcion?.trim();
    if (!text) {
      return 'Sin descripción registrada';
    }
    return text.length > 72 ? `${text.slice(0, 72).trimEnd()}...` : text;
  });
  readonly hasDescription = computed(() => !!this.detalle()?.descripcion?.trim());
  readonly descripcionStatus = computed(() => this.hasDescription() ? 'Registrada' : 'Sin descripción');
  readonly descripcionMeta = computed(() => {
    const length = this.detalle()?.descripcion?.trim().length ?? 0;
    if (length === 0) return 'Completa el detalle para dar más contexto operativo';
    if (length === 1) return '1 carácter registrado';
    return `${length} caracteres registrados`;
  });
  readonly estadoLabel = computed(() => this.detalle()?.activo ? 'Activo' : 'Inactivo');

  constructor() {
    effect((onCleanup) => {
      const id = this.categoriaId();

      if (!id) {
        this.detalle.set(null);
        this.loading.set(false);
        this.errorMsg.set('ID de categoría inválido.');
        return;
      }

      this.loading.set(true);
      this.errorMsg.set(null);

      const subscription = this.categoriaService.getCategoriaById(id).subscribe({
        next: (categoria) => {
          this.detalle.set(categoria);
          this.loading.set(false);
        },
        error: (error) => {
          this.detalle.set(null);
          this.loading.set(false);
          this.errorMsg.set(
            error?.error?.message ?? 'No se pudo cargar el detalle de la categoría.',
          );
        },
      });

      onCleanup(() => subscription.unsubscribe());
    });
  }

  volver(): void {
    this.router.navigate(['/admin/categoria']);
  }

  irEditar(): void {
    const id = this.categoriaId();
    if (!id || !this.canEdit()) {
      return;
    }

    this.router.navigate(['/admin/categoria/editar-categoria', id]);
  }
}