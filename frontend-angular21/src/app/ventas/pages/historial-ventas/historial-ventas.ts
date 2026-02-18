/* frontend-angular21/src/app/ventas/pages/historial-ventas/historial-ventas.ts */

import { Component, OnInit, OnDestroy, signal, computed, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { Card } from 'primeng/card';
import { Button } from 'primeng/button';
import { Select } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { Toast } from 'primeng/toast';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { DatePicker } from 'primeng/datepicker';
import { Tooltip } from 'primeng/tooltip';
import { AutoComplete } from 'primeng/autocomplete';

import { VentasApiService } from '../../services/ventas-api.service';

import { SedeService, Sede } from '../../../core/services/sede.service';
import { ComprobantesService } from '../../../core/services/comprobantes.service';
import { PosService } from '../../../core/services/pos.service';
import { MessageService, ConfirmationService } from 'primeng/api';

import { AuthService } from '../../../auth/services/auth.service';
import type { User } from '../../../core/interfaces/user.interface';

import type {
  SalesReceiptSummaryListResponse,
  SalesReceiptSummaryDto,
  SalesReceiptsQuery,
  ReceiptStatus,
} from '../../interfaces/ventas-historial.interface';

interface FiltroVentas {
  tipoComprobante: string | null;
  estado: ReceiptStatus | null;
  fechaInicio: Date | null;
  fechaFin: Date | null;
  busqueda: string;
  tipoPago: string | null;
}

interface ComprobanteVentaVM {
  id: number;
  id_sede: number;
  serie: string;
  numero: number;
  fec_emision: string;
  tipo_comprobante: string;
  tipo_pago: string;
  idCliente: string;
  idResponsableRef: number;
  cliente_nombre: string;
  cliente_doc: string;
  responsable: string;
  total: number;
  estado: boolean;
  estadoSunat: ReceiptStatus;
}

@Component({
  selector: 'app-historial-ventas',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    Card,
    Button,
    Select,
    TableModule,
    Tag,
    Toast,
    ConfirmDialog,
    DatePicker,
    Tooltip,
    AutoComplete,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './historial-ventas.html',
  styleUrls: ['./historial-ventas.css'],
})
export class HistorialVentas implements OnInit, OnDestroy {
  // Inyección de dependencias
  private readonly router = inject(Router);
  private readonly ventasApi = inject(VentasApiService);
  private readonly authService = inject(AuthService);
  private readonly sedeService = inject(SedeService);
  private readonly comprobantesService = inject(ComprobantesService);
  private readonly posService = inject(PosService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  // Constantes
  readonly tituloKicker = 'VENTAS - HISTORIAL DE VENTAS';
  readonly subtituloKicker = 'CONSULTA Y GESTIÓN DE VENTAS';
  readonly iconoCabecera = 'pi pi-list';

  // Subscriptions
  private subscriptions = new Subscription();

  // ✅ Signals principales
  comprobantes = signal<ComprobanteVentaVM[]>([]);
  comprobanteSeleccionado = signal<ComprobanteVentaVM | null>(null);

  sedes = signal<Sede[]>([]);
  sedeActual = signal<Sede | null>(null);

  filtros = signal<FiltroVentas>({
    tipoComprobante: null,
    estado: null,
    fechaInicio: null,
    fechaFin: null,
    busqueda: '',
    tipoPago: null,
  });

  tiposComprobante = signal<any[]>([]);
  estadosComprobante = signal<any[]>([]);
  tiposPago = signal<any[]>([]);

  sugerenciasBusqueda = signal<string[]>([]);
  todasLasSugerencias = signal<string[]>([]);

  loading = signal(false);
  mostrarDetalle = signal(false);

  totalRecords = signal(0);

  inicioSemana = signal(new Date());
  finSemana = signal(new Date());

  private currentUser = signal<User | null>(null);
  private sedeRefEmpleado = signal<number | null>(null);

  // ✅ Computed signals
  comprobantesFiltrados = computed(() => {
    return this.comprobantes();
  });

  ventasSemana = computed(() => {
    const inicio = this.inicioSemana();
    const fin = this.finSemana();

    return this.comprobantesFiltrados().filter((c) => {
      const fechaVenta = new Date(c.fec_emision);
      return fechaVenta >= inicio && fechaVenta <= fin;
    });
  });

  totalVentas = computed(() => {
    return this.ventasSemana().reduce((sum, c) => sum + (c.total || 0), 0);
  });

  numeroVentas = computed(() => {
    return this.ventasSemana().length;
  });

  totalBoletas = computed(() => {
    return this.ventasSemana().filter((c) => c.tipo_comprobante === '03').length;
  });

  totalFacturas = computed(() => {
    return this.ventasSemana().filter((c) => c.tipo_comprobante === '01').length;
  });

  // ✅ Effect para actualizar sugerencias cuando cambien los comprobantes
  constructor() {
    effect(() => {
      const comprobantes = this.comprobantesFiltrados();
      this.actualizarSugerenciasBusqueda(comprobantes);
    });
  }

  ngOnInit(): void {
    this.calcularRangoSemana();
    this.cargarOpcionesFiltros();
    this.cargarUsuarioYSede();
    this.cargarSedes();

    setTimeout(() => this.cargarHistorialDesdeBackend(), 0);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private cargarUsuarioYSede(): void {
    const user = this.authService.getCurrentUser();
    this.currentUser.set(user);
    this.sedeRefEmpleado.set(user?.idSede ?? null);

    if (!user) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error de autenticación',
        detail: 'No hay un usuario autenticado. Redirigiendo...',
        life: 3000,
      });
      setTimeout(() => this.router.navigate(['/login']), 1000);
      return;
    }

    this.messageService.add({
      severity: 'info',
      summary: 'Sede actual',
      detail: `Mostrando ventas de: ${user.sedeNombre || 'Sede'}`,
      life: 2000,
    });
  }

  private cargarHistorialDesdeBackend(): void {
    this.loading.set(true);

    const filtros = this.filtros();
    const dateFrom = filtros.fechaInicio ? new Date(filtros.fechaInicio) : null;
    const dateTo = filtros.fechaFin ? new Date(filtros.fechaFin) : null;
    if (dateTo) dateTo.setHours(23, 59, 59, 999);

    const query: SalesReceiptsQuery = {
      page: 1,
      limit: 100,
      status: filtros.estado ?? undefined,
      search: filtros.busqueda?.trim() || undefined,
      dateFrom: dateFrom ? dateFrom.toISOString() : undefined,
      dateTo: dateTo ? dateTo.toISOString() : undefined,
      receiptTypeId: this.mapTipoComprobanteToReceiptTypeId(filtros.tipoComprobante),
      sedeId: this.sedeRefEmpleado() ?? undefined,
    };

    const sub = this.ventasApi.listarHistorialVentas(query).subscribe({
      next: (res: SalesReceiptSummaryListResponse) => {
        const comprobantes = res.receipts.map((r) => this.toVM(r));
        this.comprobantes.set(comprobantes);
        this.totalRecords.set(res.total);
        this.loading.set(false);
      },
      error: (err: unknown) => {
        console.error('Error historial:', err);
        this.loading.set(false);

        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cargar el historial de ventas',
          life: 3000,
        });
      },
    });

    this.subscriptions.add(sub);
  }

  private toVM(r: SalesReceiptSummaryDto): ComprobanteVentaVM {
    const tipoComprobanteMap: Record<string, string> = {
      FACTURA: '01',
      BOLETA: '03',
      'NOTA DE CREDITO': '07',
      'NOTA DE DEBITO': '08',
    };

    const tipoSunat = tipoComprobanteMap[r.tipoComprobante] || '03';

    return {
      id: r.idComprobante,
      id_sede: r.idSede,
      serie: r.serie,
      numero: r.numero,
      fec_emision: r.fecEmision,
      tipo_comprobante: tipoSunat,
      tipo_pago: r.metodoPago || 'N/A',
      idCliente: r.clienteNombre,
      idResponsableRef: Number(r.idResponsable),
      cliente_nombre: r.clienteNombre,
      cliente_doc: r.clienteDocumento,
      responsable: r.responsableNombre,
      total: r.total,
      estadoSunat: r.estado,
      estado: r.estado === 'EMITIDO',
    };
  }

  private mapTipoComprobanteToReceiptTypeId(tipo: string | null): number | undefined {
    if (!tipo) return undefined;
    if (tipo === '01') return 1;
    if (tipo === '03') return 2;
    if (tipo === '07') return 3;
    return undefined;
  }

  private actualizarSugerenciasBusqueda(comprobantes: ComprobanteVentaVM[]): void {
    const sugerencias = new Set<string>();

    comprobantes.forEach((c) => {
      sugerencias.add(this.getNumeroFormateado(c));
      if (c.cliente_nombre?.trim()) sugerencias.add(c.cliente_nombre.trim());
      if (c.cliente_doc?.trim()) sugerencias.add(c.cliente_doc.trim());
    });

    this.todasLasSugerencias.set(Array.from(sugerencias).sort());
  }

  calcularRangoSemana(): void {
    const hoy = new Date();
    const diaSemana = hoy.getDay();
    const diasDesdeInicio = diaSemana === 0 ? 6 : diaSemana - 1;

    const inicio = new Date(hoy);
    inicio.setDate(hoy.getDate() - diasDesdeInicio);
    inicio.setHours(0, 0, 0, 0);

    const fin = new Date(inicio);
    fin.setDate(inicio.getDate() + 6);
    fin.setHours(23, 59, 59, 999);

    this.inicioSemana.set(inicio);
    this.finSemana.set(fin);
  }

  cargarOpcionesFiltros(): void {
    this.tiposComprobante.set(this.comprobantesService.getTiposComprobanteOptions());
    this.estadosComprobante.set(this.comprobantesService.getEstadosComprobanteOptions());
    this.tiposPago.set(this.posService.getTiposPagoOptions());
  }

  cargarSedes(): void {
    const sub = this.sedeService.getSedes().subscribe({
      next: (sedes) => this.sedes.set(sedes),
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar las sedes',
          life: 3000,
        });
      },
    });
    this.subscriptions.add(sub);
  }

  buscarSugerencias(event: any): void {
    const query = (event.query || '').toLowerCase().trim();
    const todas = this.todasLasSugerencias();

    if (!query) {
      this.sugerenciasBusqueda.set(todas.slice(0, 10));
    } else {
      const filtradas = todas.filter((item) => item.toLowerCase().includes(query)).slice(0, 15);
      this.sugerenciasBusqueda.set(filtradas);
    }
  }

  aplicarFiltros(): void {
    this.cargarHistorialDesdeBackend();
  }

  limpiarFiltros(): void {
    this.filtros.set({
      tipoComprobante: null,
      estado: null,
      fechaInicio: null,
      fechaFin: null,
      busqueda: '',
      tipoPago: null,
    });
    this.cargarHistorialDesdeBackend();

    this.messageService.add({
      severity: 'info',
      summary: 'Filtros limpiados',
      detail: 'Se restablecieron todos los filtros',
      life: 2000,
    });
  }

  getEstadoComprobante(comprobante: ComprobanteVentaVM): string {
    return comprobante.estadoSunat;
  }

  getSeverityEstado(estado: string): 'success' | 'danger' | 'warn' | 'info' {
    if (estado === 'EMITIDO') return 'success';
    if (estado === 'ANULADO') return 'warn';
    if (estado === 'RECHAZADO') return 'danger';
    return 'info';
  }

  getTipoComprobanteLabel(tipo: string): string {
    return this.comprobantesService.getTipoComprobanteLabel(tipo as '01' | '03');
  }

  getNumeroFormateado(comprobante: ComprobanteVentaVM): string {
    return this.comprobantesService.getNumeroFormateado(comprobante.serie, comprobante.numero);
  }

  getTipoPagoLabel(tipoPago: string): string {
    if (tipoPago === 'N/A') return 'N/A';
    return this.posService.getTipoPagoLabel(tipoPago);
  }

  getSeverityTipoPago(tipoPago: string): 'success' | 'info' | 'warn' | 'secondary' {
    if (tipoPago === 'N/A') return 'secondary';
    return this.posService.getSeverityTipoPago(tipoPago);
  }

  cerrarDetalle(): void {
    this.mostrarDetalle.set(false);
    this.comprobanteSeleccionado.set(null);
  }

  imprimirComprobante(comprobante: ComprobanteVentaVM): void {
    this.router.navigate(['/ventas/imprimir-comprobante'], {
      state: { comprobante, rutaRetorno: '/ventas/historial-ventas' },
    });
  }

  verDetalleVenta(comprobante: ComprobanteVentaVM): void {
    this.router.navigate(['/ventas/ver-detalle', comprobante.id]);
  }

  anularComprobante(comprobante: ComprobanteVentaVM): void {
    this.confirmationService.confirm({
      message: `¿Está seguro de anular el comprobante ${this.getNumeroFormateado(comprobante)}?`,
      header: 'Confirmar Anulación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, anular',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        const comprobantes = this.comprobantes();
        const index = comprobantes.findIndex((c) => c.id === comprobante.id);

        if (index !== -1) {
          comprobantes[index].estadoSunat = 'ANULADO';
          comprobantes[index].estado = false;
          this.comprobantes.set([...comprobantes]);
        }

        this.messageService.add({
          severity: 'success',
          summary: 'Comprobante anulado',
          detail: `${this.getNumeroFormateado(comprobante)} fue anulado exitosamente`,
          life: 3000,
        });
      },
    });
  }

  nuevaVenta(): void {
    this.router.navigate(['/ventas/generar-venta']);
  }

  actualizarFiltroBusqueda(valor: string): void {
    this.filtros.update((f) => ({ ...f, busqueda: valor }));
  }

  actualizarFiltroFechaInicio(valor: Date | null): void {
    this.filtros.update((f) => ({ ...f, fechaInicio: valor }));
  }

  actualizarFiltroFechaFin(valor: Date | null): void {
    this.filtros.update((f) => ({ ...f, fechaFin: valor }));
  }

  actualizarFiltroTipoComprobante(valor: string | null): void {
    this.filtros.update((f) => ({ ...f, tipoComprobante: valor }));
  }

  actualizarFiltroTipoPago(valor: string | null): void {
    this.filtros.update((f) => ({ ...f, tipoPago: valor }));
  }

  actualizarFiltroEstado(valor: ReceiptStatus | null): void {
    this.filtros.update((f) => ({ ...f, estado: valor }));
  }
}
