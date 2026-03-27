import {
  Component,
  OnInit,
  inject,
  signal
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { MessageService, ConfirmationService } from 'primeng/api';
import { CardModule }          from 'primeng/card';
import { ButtonModule }        from 'primeng/button';
import { InputTextModule }     from 'primeng/inputtext';
import { TextareaModule }      from 'primeng/textarea';
import { ToastModule }         from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DividerModule }       from 'primeng/divider';
import { SkeletonModule }      from 'primeng/skeleton';

import { TerminosCondicionesService } from '../../../../../services/terminos-condiciones.service';
import {
  TerminosDto,
  TerminosResponse,
  TerminosSeccionDto
} from '../../../../../interfaces/terminos-condiciones.interface';

@Component({
  selector: 'app-editar-terminos-condiciones',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    CardModule, ButtonModule, InputTextModule, TextareaModule,
    ToastModule, ConfirmDialogModule, DividerModule, SkeletonModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './editar-terminos-condiciones.html',
  styleUrls: ['./editar-terminos-condiciones.css'],
})
export class EditarTerminosCondicionesComponent implements OnInit {

  private service    = inject(TerminosCondicionesService);
  private router     = inject(Router);
  private msgSvc     = inject(MessageService);
  private confirmSvc = inject(ConfirmationService);

  // ── Signals ───────────────────────────────
  cargando  = signal(true);
  guardando = signal(false);
  terminosId = signal<number | null>(null);

  form = signal<TerminosDto>({
    version: '',
    fechaVigencia: '',
    activo: false,
    secciones: [],
  });

  // ── Init ──────────────────────────────────
  ngOnInit(): void {
    this.service.getActivo().subscribe({
      next: (data) => {
        this.terminosId.set(data.id);
        this.form.set(this.responseToForm(data));
        this.cargando.set(false);
      },
      error: () => {
        this.agregarSeccion();
        this.cargando.set(false);
      },
    });
  }

  // ── Mapper ────────────────────────────────
  private responseToForm(data: TerminosResponse): TerminosDto {
    return {
      version: data.version,
      fechaVigencia: data.fechaVigencia,
      activo: data.activo,
      secciones: data.secciones.map(s => ({
        id: s.id,
        numero: s.numero,
        titulo: s.titulo,
        orden: s.orden,
        parrafos: s.parrafos.map(p => ({
          id: p.id,
          contenido: p.contenido,
          orden: p.orden
        })),
        items: s.items.map(i => ({
          id: i.id,
          contenido: i.contenido,
          orden: i.orden
        })),
      })),
    };
  }

  // ── Secciones ─────────────────────────────
  agregarSeccion(): void {
    const f = this.form();
    const orden = f.secciones.length + 1;

    f.secciones.push({
      numero: String(orden).padStart(2, '0'),
      titulo: '',
      orden,
      parrafos: [{ contenido: '', orden: 1 }],
      items: [],
    });

    this.form.set({ ...f });
  }

  eliminarSeccion(index: number): void {
    this.confirmSvc.confirm({
      message: '¿Eliminar esta sección?',
      header: 'Confirmar',
      icon: 'pi pi-trash',
      accept: () => {
        const f = this.form();
        f.secciones.splice(index, 1);
        this.recalcularOrdenes(f);
        this.form.set({ ...f });
      },
    });
  }

  moverSeccion(index: number, dir: -1 | 1): void {
    const f = this.form();
    const swap = index + dir;

    if (swap < 0 || swap >= f.secciones.length) return;

    [f.secciones[index], f.secciones[swap]] =
    [f.secciones[swap], f.secciones[index]];

    this.recalcularOrdenes(f);
    this.form.set({ ...f });
  }

  private recalcularOrdenes(f: TerminosDto): void {
    f.secciones.forEach((s, i) => {
      s.orden  = i + 1;
      s.numero = String(i + 1).padStart(2, '0');
    });
  }

  // ── Párrafos ──────────────────────────────
  agregarParrafo(sec: TerminosSeccionDto): void {
    sec.parrafos.push({
      contenido: '',
      orden: sec.parrafos.length + 1
    });
    this.form.set({ ...this.form() });
  }

  eliminarParrafo(sec: TerminosSeccionDto, i: number): void {
    sec.parrafos.splice(i, 1);
    this.form.set({ ...this.form() });
  }

  // ── Ítems ─────────────────────────────────
  agregarItem(sec: TerminosSeccionDto): void {
    sec.items.push({
      contenido: '',
      orden: sec.items.length + 1
    });
    this.form.set({ ...this.form() });
  }

  eliminarItem(sec: TerminosSeccionDto, i: number): void {
    sec.items.splice(i, 1);
    this.form.set({ ...this.form() });
  }

  // ── Guardar ───────────────────────────────
  guardar(): void {
    if (!this.validar()) return;

    this.guardando.set(true);

    const op$ = this.terminosId()
      ? this.service.actualizar(this.terminosId()!, this.form())
      : this.service.crear(this.form());

    op$.subscribe({
      next: () => {
        this.msgSvc.add({
          severity: 'success',
          summary: 'Guardado',
          detail: 'Términos actualizados.',
        });

        this.guardando.set(false);
        this.router.navigate(['admin/terminos-condiciones']);
      },
      error: () => {
        this.msgSvc.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo guardar.',
        });

        this.guardando.set(false);
      },
    });
  }

  cancelar(): void {
    this.router.navigate(['admin/terminos-condiciones']);
  }

  private validar(): boolean {
    const f = this.form();

    if (!f.version.trim()) {
      this.msgSvc.add({ severity: 'warn', summary: 'Validación', detail: 'Ingresa la versión.' });
      return false;
    }

    if (!f.fechaVigencia.trim()) {
      this.msgSvc.add({ severity: 'warn', summary: 'Validación', detail: 'Ingresa la fecha.' });
      return false;
    }

    if (f.secciones.some(s => !s.titulo.trim())) {
      this.msgSvc.add({ severity: 'warn', summary: 'Validación', detail: 'Secciones sin título.' });
      return false;
    }

    return true;
  }
}