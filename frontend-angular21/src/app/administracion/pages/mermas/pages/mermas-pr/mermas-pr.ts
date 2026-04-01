import { Component, signal, computed, inject, OnInit, effect } from '@angular/core';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { Select } from 'primeng/select';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectButtonModule } from 'primeng/selectbutton';
import { CommonModule } from '@angular/common';
import { SedeService } from '../../../../services/sede.service';
import {
  WastageService,
  WastageResponseDto,
  WastageTypeDto,
  WastageSuggestionDto,
} from '../../../../services/wastage.service';
import { SharedTableContainerComponent } from '../../../../../shared/components/table.componente/shared-table-container.component';
import { AuthService } from '../../../../../auth/services/auth.service';
import { UserRole } from '../../../../../core/constants/roles.constants';

interface WastageDetail {
  id_detalle:    number;
  id_producto:   number;
  cod_prod:      string;
  desc_prod:     string;
  cantidad:      number;
  pre_unit:      number;
  observacion?:  string;
  id_tipo_merma: number;
}

interface MermaUI {
  id_merma:      number;
  codigo:        string;
  motivo:        string;
  tipoMerma:     string;
  tipoMermaId:   number;
  cantidad:      number;
  responsable:   string;
  fechaRegistro: Date;
  observacion?:  string;
  detalles:      WastageDetail[];
  valorTotal:    number;
  id_sede:       number;
}

type Severity = 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast';

@Component({
  selector: 'app-mermas-pr',
  standalone: true,
  imports: [
    CardModule, ButtonModule, RouterModule, FormsModule,
    InputTextModule, AutoCompleteModule, Select,
    ConfirmDialogModule, ToastModule, TableModule,
    TooltipModule, TagModule, DialogModule,
    InputNumberModule, SelectButtonModule, CommonModule,
    SharedTableContainerComponent,
  ],
  templateUrl: './mermas-pr.html',
  styleUrl: './mermas-pr.css',
  providers: [ConfirmationService, MessageService],
})
export class MermasPr implements OnInit {
  private readonly wastageService      = inject(WastageService);
  private readonly messageService      = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly router              = inject(Router);
  private readonly sedeService         = inject(SedeService);
  private readonly authService         = inject(AuthService);

  
  readonly esAdmin:      boolean;
  readonly sedeNombre:   string;
  readonly sedePropiaId: string;


  puedeCrearMermas  = false;
  puedeEditarMermas = false;
  puedeVerMermas    = false;

  mesActual = signal(this.obtenerMesActual());
  cargando  = this.wastageService.loading;


  busquedaObj: WastageSuggestionDto | string | null = null;
  sugeridos     = signal<WastageSuggestionDto[]>([]);
  mermaIdFiltro = signal<number | null>(null);


  tiposMermaOpciones = computed(() => [
    { label: 'Todos los tipos', value: '' },
    ...this.wastageService.tiposMerma().map((t: WastageTypeDto) => ({
      label: t.tipo,
      value: t.tipo,
    })),
  ]);

  sedesOpciones = computed(() => [
    { label: 'Todas las sedes', value: '' },
    ...this.sedeService.sedes().map((s) => ({
      label: s.nombre,
      value: String(s.id_sede),
    })),
  ]);


  tipoMermaFiltro = signal('');
  sedeFiltro      = signal(String(this.authService.getCurrentUser()?.idSede ?? ''));

  readonly paginaActual = signal<number>(1);
  readonly limitePagina = signal<number>(5);


  mermaSeleccionada   = signal<MermaUI | null>(null);
  mostrarModalDetalle = signal(false);

  constructor() {
    const user = this.authService.getCurrentUser();

    this.esAdmin      = this.authService.getRoleId() === UserRole.ADMIN;
    this.sedeNombre   = user?.sedeNombre ?? 'Mi sede';
    this.sedePropiaId = String(user?.idSede ?? '');

    effect(() => {
      const sede   = this.sedeFiltro();
      const idSede = sede ? Number(sede) : 0;
      this.wastageService.loadWastages(1, this.limitePagina(), idSede).subscribe();
      this.paginaActual.set(1);
    });
  }


  mermas = computed(() => this.wastageService.wastages().map((m) => this.mapToUI(m)));

  mermasFiltradas = computed(() => {
    let lista     = this.mermas();
    const idFiltro   = this.mermaIdFiltro();
    const tipoFiltro = this.tipoMermaFiltro();

    if (idFiltro !== null) lista = lista.filter((m) => m.id_merma === idFiltro);
    if (tipoFiltro)        lista = lista.filter((m) => m.tipoMerma === tipoFiltro);

    return lista;
  });

  readonly mermasPaginadas = computed(() => {
    const inicio = (this.paginaActual() - 1) * this.limitePagina();
    return this.mermasFiltradas().slice(inicio, inicio + this.limitePagina());
  });

  readonly totalPaginas = computed(() =>
    Math.ceil(this.mermasFiltradas().length / this.limitePagina()),
  );

  totalMermas    = computed(() => this.mermas().length);
  totalProductos = computed(() => this.mermas().reduce((sum, m) => sum + m.cantidad, 0));

  mermasMesActual = computed(() => {
    const mes  = new Date().getMonth();
    const year = new Date().getFullYear();
    return this.mermas().filter((m) => {
      const f = new Date(m.fechaRegistro);
      return f.getMonth() === mes && f.getFullYear() === year;
    }).length;
  });


  ngOnInit(): void {

    this.puedeCrearMermas  = this.authService.hasPermiso('CREAR_MERMAS');
    this.puedeEditarMermas = this.authService.hasPermiso('EDITAR_MERMAS');
    this.puedeVerMermas    = this.authService.hasPermiso('VER_MERMAS');

    this.cargarTiposMerma();
    this.sedeService.loadSedes().subscribe();
  }


  buscarSugeridos(event: { query: string }): void {
    const idSede = this.sedeFiltro() ? Number(this.sedeFiltro()) : 0;
    this.wastageService.searchWastages(event.query, idSede, 8).subscribe({
      next:  (res) => this.sugeridos.set(res),
      error: ()    => this.sugeridos.set([]),
    });
  }

  onSugeridoSeleccionado(event: { value: WastageSuggestionDto }): void {
    const item = event.value;
    this.busquedaObj = item;
    this.mermaIdFiltro.set(item.id_merma);
    const existe = this.mermas().find((m) => m.id_merma === item.id_merma);
    if (!existe) {
      const idSede = this.sedeFiltro() ? Number(this.sedeFiltro()) : 0;
      this.wastageService.loadWastages(1, 100, idSede).subscribe();
    }
    this.paginaActual.set(1);
  }

  onBusquedaLimpiada(): void {
    this.busquedaObj = null;
    this.mermaIdFiltro.set(null);
    this.sugeridos.set([]);
    this.paginaActual.set(1);
  }


  recargarConFiltros(): void {
    const idSede = this.sedeFiltro() ? Number(this.sedeFiltro()) : 0;
    this.busquedaObj = null;
    this.mermaIdFiltro.set(null);
    this.wastageService.loadWastages(1, this.limitePagina(), idSede).subscribe();
    this.paginaActual.set(1);
  }

  limpiarFiltros(): void {
    this.busquedaObj = null;
    this.sugeridos.set([]);
    this.mermaIdFiltro.set(null);
    this.tipoMermaFiltro.set('');
    this.sedeFiltro.set(this.esAdmin ? '' : this.sedePropiaId);
    this.paginaActual.set(1);
    this.messageService.add({
      severity: 'info', summary: 'Filtros limpiados',
      detail: 'Se muestran todas las mermas', life: 2000,
    });
  }


  private cargarTiposMerma(): void {
    this.wastageService.loadTiposMerma().subscribe({
      error: () => this.messageService.add({
        severity: 'warn', summary: 'Aviso',
        detail: 'No se pudieron cargar los tipos de merma.', life: 3000,
      }),
    });
  }

  cargarMermas(id_sede = 0): void {
    this.wastageService.loadWastages(1, this.limitePagina(), id_sede).subscribe({
      error: () => this.messageService.add({
        severity: 'error', summary: 'Error',
        detail: 'No se pudieron cargar las mermas', life: 3000,
      }),
    });
  }


  private mapToUI(merma: WastageResponseDto): MermaUI {
    const valorTotal = merma.detalles?.reduce((sum, d) => sum + d.cantidad * d.pre_unit, 0) ?? 0;
    return {
      id_merma:      merma.id_merma,
      codigo:        `MER-${merma.id_merma.toString().padStart(4, '0')}`,
      motivo:        merma.motivo,
      tipoMerma:     merma.tipo_merma_label || 'SIN CLASIFICAR',
      tipoMermaId:   merma.tipo_merma_id,
      cantidad:      merma.total_items,
      responsable:   merma.responsable || 'Sin asignar',
      fechaRegistro: new Date(merma.fec_merma),
      observacion:   merma.detalles?.[0]?.observacion || '',
      id_sede:       merma.id_sede_ref ?? 0,
      detalles:      merma.detalles?.map((d) => ({
        id_detalle:    d.id_detalle ?? 0,
        id_producto:   d.id_producto,
        cod_prod:      d.cod_prod,
        desc_prod:     d.desc_prod,
        cantidad:      d.cantidad,
        pre_unit:      d.pre_unit,
        observacion:   d.observacion,
        id_tipo_merma: d.id_tipo_merma,
      })) ?? [],
      valorTotal,
    };
  }


  irRegistro(): void { this.router.navigate(['/admin', 'mermas', 'registro-merma']); }
  irEditar(merma: MermaUI): void { this.router.navigate(['/admin/mermas', 'edicion-merma', merma.id_merma]); }


  verDetalleMerma(merma: MermaUI): void {
    this.router.navigate(['/admin/mermas', 'detalle-merma', merma.id_merma]);
  }

  cerrarModalDetalle(): void {
    this.mostrarModalDetalle.set(false);
    this.mermaSeleccionada.set(null);
  }


  getNombreSede(id_sede: number): string {
    const sede = this.sedeService.sedes().find((s) => s.id_sede === id_sede);
    return sede ? sede.nombre : 'Ã¢â‚¬â€';
  }

  obtenerMesActual(): string {
    const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                   'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
    return meses[new Date().getMonth()];
  }

  getTipoMermaLabel(tipo: string): string {
    const found = this.wastageService.tiposMerma().find((t: WastageTypeDto) => t.tipo === tipo);
    return found ? found.tipo : tipo || 'SIN CLASIFICAR';
  }

  getTipoMermaSeverity(tipo: string): Severity {
    const normalized = (tipo ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toUpperCase();

    const map: Record<string, Severity> = {
      DANO: 'danger',
      VENCIMIENTO: 'warn',
      ROBO: 'danger',
      DETERIORO: 'info',
      ERROR_CONTEO: 'secondary',
      DEVOLUCION: 'warn',
      OTRO: 'secondary',
      'SIN CLASIFICAR': 'secondary',
      'SIN CLASIFICACION': 'secondary',
    };

    return map[normalized] || 'info';
  }

  refrescarLista(): void { this.cargarMermas(this.sedeFiltro() ? Number(this.sedeFiltro()) : 0); }

  onPageChange(page: number):   void { this.paginaActual.set(page); }
  onLimitChange(limit: number): void { this.limitePagina.set(limit); this.paginaActual.set(1); }
}
