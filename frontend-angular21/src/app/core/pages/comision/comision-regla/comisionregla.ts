import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DividerModule } from 'primeng/divider';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { CommissionService, CreateCommissionRuleDto } from '../../../services/commission.service';
import { CategoriaService } from '../../../services/categoria.service';

interface FamiliaOption {
  label: string;
  value: number;
}

@Component({
  selector: 'app-comision-regla',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule,
    CardModule, ButtonModule, AutoCompleteModule,
    CheckboxModule, InputTextModule, InputNumberModule,
    DividerModule, ToastModule,
  ],
  providers: [MessageService],
  templateUrl: './comisionregla.html',
  styleUrls: ['./comisionregla.css'],
})
export class ComisionRegla implements OnInit {
  private readonly commissionService = inject(CommissionService);
  private readonly categoriaService  = inject(CategoriaService);
  private readonly router            = inject(Router);
  private readonly messageService    = inject(MessageService);

  readonly loading   = this.commissionService.loading;
  readonly submitted = signal(false);

  // ── Autocomplete ───────────────────────────────────────────────────────────
  familias: FamiliaOption[] = [];
  familiasFiltradas: FamiliaOption[] = [];
  familiaSeleccionada: FamiliaOption | null = null;

  filtrarFamilias(event: any) {
    const query = event.query.toLowerCase();
    this.familiasFiltradas = this.familias.filter(f =>
      f.label.toLowerCase().includes(query)
    );
  }

  // ── Form fields ────────────────────────────────────────────────────────────
  nombre           = '';
  descripcion      = '';
  tipoVenta: 'general' | 'remate' | 'unitarias' = 'general';
  tipoRecompensa: 'PORCENTAJE' | 'MONTO_FIJO'   = 'MONTO_FIJO';
  comisionPorLote  = false;
  metaUnidades     = 1;
  montoComision: number | null = null;
  fechaInicio      = new Date().toISOString().split('T')[0];
  fechaFin         = '';

  // ── Validaciones ───────────────────────────────────────────────────────────
  get familiaValida()  { return !!this.familiaSeleccionada; }
  get montoValido()    { return this.montoComision !== null && this.montoComision > 0; }
  get nombreValido()   { return this.nombre.trim().length >= 3; }
  get metaValida()     { return !this.comisionPorLote || this.metaUnidades >= 2; }

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  ngOnInit() {
    this.categoriaService.loadCategorias().subscribe({
      next: () => {
        this.familias = this.categoriaService.categorias().map(c => ({
          label: c.nombre,
          value: c.id_categoria,
        }));
      },
    });
  }

  // ── Acciones ───────────────────────────────────────────────────────────────
  guardarRegla() {
    this.submitted.set(true);

    if (!this.familiaValida || !this.montoValido || !this.nombreValido || !this.metaValida) {
      return;
    }

    const idObjetivo = typeof this.familiaSeleccionada === 'object'
      ? Number((this.familiaSeleccionada as any).value ?? (this.familiaSeleccionada as any).id_categoria)
      : Number(this.familiaSeleccionada);

    const dto: CreateCommissionRuleDto = {
      nombre:           this.nombre.trim(),
      descripcion:      this.descripcion.trim() || undefined,
      tipo_objetivo:    'CATEGORIA',
      id_objetivo:      idObjetivo,
      meta_unidades:    this.comisionPorLote ? this.metaUnidades : 1,
      tipo_recompensa:  this.tipoRecompensa,
      valor_recompensa: this.montoComision!,
      fecha_inicio:     this.fechaInicio,
      ...(this.fechaFin ? { fecha_fin: this.fechaFin } : {}),
    };

    this.commissionService.createCategoryRule(dto).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Regla creada',
          detail: 'La regla de comisión fue registrada correctamente.',
        });
        setTimeout(() => this.router.navigate(['/admin/comision']), 1200);
      },
      error: (err) => {
        const msg = err?.error?.message ?? 'Error al crear la regla';
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: Array.isArray(msg) ? msg.join(', ') : msg,
        });
      },
    });
  }

  cancelar() {
    this.router.navigate(['/admin/comision']);
  }
}