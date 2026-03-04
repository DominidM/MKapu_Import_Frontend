import { Component, inject, computed, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { RouterModule } from '@angular/router';
import { CommissionService, CommissionRule } from '../../services/commission.service';
import { CategoriaService } from '../../services/categoria.service';

@Component({
  selector: 'app-comision',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ButtonModule,
    InputTextModule, TableModule, TagModule,
    SelectModule, CardModule, RouterModule,
  ],
  templateUrl: './comision.html',
  styleUrls: ['./comision.css'],
})
export class Comision implements OnInit {
  private readonly commissionService = inject(CommissionService);
  private readonly categoriaService  = inject(CategoriaService);

  readonly activeRules = this.commissionService.activeRules;
  readonly loading     = this.commissionService.loading;
  readonly error       = this.commissionService.error;
  readonly categorias  = this.categoriaService.categorias;

  // ── Filtros ────────────────────────────────────────────────────────────────
  filtroBusqueda   = '';
  filtroTipo:       string | null = null;
  filtroRecompensa: string | null = null;

  tiposObjetivo = [
    { label: 'Categoría', value: 'CATEGORIA' },
    { label: 'Producto',  value: 'PRODUCTO' },
  ];

  tiposRecompensa = [
    { label: 'Monto Fijo',  value: 'MONTO_FIJO' },
    { label: 'Porcentaje',  value: 'PORCENTAJE' },
  ];

  limpiarFiltros() {
    this.filtroBusqueda   = '';
    this.filtroTipo       = null;
    this.filtroRecompensa = null;
  }

  // ── Computed rows ──────────────────────────────────────────────────────────
  readonly reglas = computed(() => {
    const catMap = new Map(
      this.categorias().map(c => [c.id_categoria, c.nombre])
    );
    return this.activeRules().map(r => ({
      id:           `RC-${String(r.id_regla).padStart(3, '0')}`,
      nombre:       r.nombre,
      descripcion:  r.descripcion ?? '',
      familia:      catMap.get(r.id_objetivo) ?? `ID: ${r.id_objetivo}`,
      tipo:         r.tipo_objetivo === 'PRODUCTO' ? 'Producto' : 'Categoría',
      tipoSeverity: r.tipo_objetivo === 'PRODUCTO' ? 'info' : 'success' as any,
      condicion:    r.meta_unidades > 1 ? `Lote (≥${r.meta_unidades} uds.)` : 'Por Unidad',
      recompensa:   r.tipo_recompensa === 'PORCENTAJE' ? '%' : 'S/',
      comision:     Number(r.valor_recompensa),
      activo:       r.activo,
      raw:          r,
    }));
  });

  readonly reglasFiltradas = computed(() => {
    let data = this.reglas();

    if (this.filtroBusqueda.trim()) {
      const q = this.filtroBusqueda.toLowerCase();
      data = data.filter(r => r.nombre.toLowerCase().includes(q));
    }
    if (this.filtroTipo) {
      data = data.filter(r => r.raw.tipo_objetivo === this.filtroTipo);
    }
    if (this.filtroRecompensa) {
      data = data.filter(r => r.raw.tipo_recompensa === this.filtroRecompensa);
    }
    return data;
  });

  // ── KPIs ───────────────────────────────────────────────────────────────────
  readonly totalReglasActivas = computed(() => this.activeRules().length);

  readonly totalCategorias = computed(() =>
    new Set(
      this.activeRules()
        .filter(r => r.tipo_objetivo === 'CATEGORIA')
        .map(r => r.id_objetivo)
    ).size
  );

  readonly promedioComision = computed(() => {
    const lista = this.activeRules();
    if (!lista.length) return 0;
    return lista.reduce((acc, r) => acc + Number(r.valor_recompensa), 0) / lista.length;
  });

  readonly reglasConMeta = computed(() =>
    this.activeRules().filter(r => r.meta_unidades > 1).length
  );

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  ngOnInit() {
    this.commissionService.loadRules().subscribe();
    this.categoriaService.loadCategorias().subscribe();
  }

  onToggleStatus(rule: CommissionRule) {
    this.commissionService.toggleRuleStatus(rule.id_regla, !rule.activo).subscribe();
  }
}