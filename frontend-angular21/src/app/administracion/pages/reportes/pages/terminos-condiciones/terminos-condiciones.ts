import {
  Component,
  OnInit,
  inject,
  HostListener,
  ViewChild,
  ElementRef,
  signal,
  computed
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { SkeletonModule } from 'primeng/skeleton';

import { TerminosCondicionesService } from '../../../../services/terminos-condiciones.service';
import {
  TerminosResponse,
  TerminosSeccionResponse
} from '../../../../interfaces/terminos-condiciones.interface';

@Component({
  selector: 'app-terminos-condiciones',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CardModule,
    ButtonModule,
    DividerModule,
    SkeletonModule
  ],
  templateUrl: './terminos-condiciones.html',
  styleUrls: ['./terminos-condiciones.css'],
})
export class TerminosCondicionesComponent implements OnInit {

  @ViewChild('contenidoRef') contenidoRef!: ElementRef;

  private service = inject(TerminosCondicionesService);

  // ── Datos empresa ───────────────────────────────
  readonly nombreEmpresa  = 'Mkapu Import S.A.C.';
  readonly direccionEmpresa = 'Av. Example 123, Lima, Perú';
  readonly emailContacto  = 'contacto@mkapu.com';
  readonly telefonoContacto = '+51 987 654 321';
  readonly anioActual     = new Date().getFullYear();

  // ── Signals ────────────────────────────────────
  cargando = signal(true);
  error = signal(false);
  terminos = signal<TerminosResponse | null>(null);
  secciones = signal<TerminosSeccionResponse[]>([]);
  seccionActiva = signal('');

  // ── Computed ───────────────────────────────────
  version = computed(() => this.terminos()?.version ?? '—');

  fechaVigencia = computed(() =>
    this.terminos()?.fechaVigencia ?? '—'
  );

  fechaActualizacion = computed(() => {
    const t = this.terminos();
    if (!t?.actualizadoEn) return '—';

    return new Date(t.actualizadoEn).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
    });
  });

  // ── Init ───────────────────────────────────────
  ngOnInit(): void {
    this.service.getActivo().subscribe({
      next: (data) => {
        this.terminos.set(data);
        this.secciones.set(data.secciones);

        if (data.secciones.length > 0) {
          this.seccionActiva.set(`sec-${data.secciones[0].id}`);
        }

        this.cargando.set(false);
      },
      error: () => {
        this.error.set(true);
        this.cargando.set(false);
      },
    });
  }

  // ── Helpers ────────────────────────────────────
  seccionId(sec: TerminosSeccionResponse): string {
    return `sec-${sec.id}`;
  }

  @HostListener('window:scroll')
  onScroll(): void {
    for (const sec of this.secciones()) {
      const el = document.getElementById(this.seccionId(sec));

      if (el) {
        const rect = el.getBoundingClientRect();

        if (rect.top <= 120 && rect.bottom > 120) {
          this.seccionActiva.set(this.seccionId(sec));
          break;
        }
      }
    }
  }

  irASeccion(id: string): void {
    this.seccionActiva.set(id);

    document.getElementById(id)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }
}