/* frontend-angular21/src/app/ventas/pages/historial-ventas/historial-ventas.ts */

import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
} from '@angular/core';
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
  tituloKicker = 'VENTAS - HISTORIAL DE VENTAS';
  subtituloKicker = 'CONSULTA Y GESTIÓN DE VENTAS';
  iconoCabecera = 'pi pi-list';

  private subscriptions = new Subscription();

  comprobantes: ComprobanteVentaVM[] = [];
  comprobantesFiltrados: ComprobanteVentaVM[] = [];
  comprobanteSeleccionado: ComprobanteVentaVM | null = null;

  sedes: Sede[] = [];
  sedeActual: Sede | null = null;

  filtros: FiltroVentas = {
    tipoComprobante: null,
    estado: null,
    fechaInicio: null,
    fechaFin: null,
    busqueda: '',
    tipoPago: null,
  };

  tiposComprobante: any[] = [];
  estadosComprobante: any[] = [];
  tiposPago: any[] = [];

  sugerenciasBusqueda: string[] = [];
  todasLasSugerencias: string[] = [];

  loading = false;
  mostrarDetalle = false;

  totalVentas = 0;
  numeroVentas = 0;
  totalBoletas = 0;
  totalFacturas = 0;

  inicioSemana: Date = new Date();
  finSemana: Date = new Date();

  totalRecords = 0;

  private currentUser: User | null = null;
  private sedeRefEmpleado: number | null = null;

  constructor(
    private router: Router,
    private ventasApi: VentasApiService,
    private authService: AuthService,
    private sedeService: SedeService,
    private comprobantesService: ComprobantesService,
    private posService: PosService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private cdr: ChangeDetectorRef,
  ) {}

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
    this.currentUser = this.authService.getCurrentUser();
    this.sedeRefEmpleado = this.currentUser?.idSede ?? null;

    if (!this.currentUser) {
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
      detail: `Mostrando ventas de: ${this.currentUser.sedeNombre || 'Sede'}`,
      life: 2000,
    });
  }

  private cargarHistorialDesdeBackend(): void {
    this.loading = true;

    const dateFrom = this.filtros.fechaInicio ? new Date(this.filtros.fechaInicio) : null;
    const dateTo = this.filtros.fechaFin ? new Date(this.filtros.fechaFin) : null;
    if (dateTo) dateTo.setHours(23, 59, 59, 999);

    const query: SalesReceiptsQuery = {
      page: 1,
      limit: 100,
      status: this.filtros.estado ?? undefined,
      search: this.filtros.busqueda?.trim() || undefined,
      dateFrom: dateFrom ? dateFrom.toISOString() : undefined,
      dateTo: dateTo ? dateTo.toISOString() : undefined,
      receiptTypeId: this.mapTipoComprobanteToReceiptTypeId(this.filtros.tipoComprobante),
      sedeId: this.sedeRefEmpleado ?? undefined,
    };

    const sub = this.ventasApi.listarHistorialVentas(query).subscribe({
      next: (res: SalesReceiptSummaryListResponse) => {
        // ✅ El backend ya trae los datos enriquecidos con TCP
        this.comprobantes = res.receipts.map((r) => this.toVM(r));
        this.comprobantesFiltrados = [...this.comprobantes];
        this.totalRecords = res.total;

        this.cargarSugerenciasBusqueda();
        this.calcularEstadisticas();

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err: unknown) => {
        console.error('Error historial:', err);
        this.loading = false;

        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cargar el historial de ventas',
          life: 3000,
        });

        this.cdr.detectChanges();
      },
    });

    this.subscriptions.add(sub);
  }

  private toVM(r: SalesReceiptSummaryDto): ComprobanteVentaVM {
    // ✅ Mapeo de tipo de comprobante a código SUNAT
    const tipoComprobanteMap: Record<string, string> = {
      'FACTURA': '01',
      'BOLETA': '03',
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

      idCliente: r.clienteNombre, // Para compatibilidad
      idResponsableRef: Number(r.idResponsable),

      // ✅ Datos enriquecidos por TCP
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
    if (tipo === '01') return 1; // Factura
    if (tipo === '03') return 2; // Boleta
    if (tipo === '07') return 3; // Nota de crédito
    return undefined;
  }

  // ====== UI existente ======
  calcularRangoSemana(): void {
    const hoy = new Date();
    const diaSemana = hoy.getDay();
    const diasDesdeInicio = diaSemana === 0 ? 6 : diaSemana - 1;

    this.inicioSemana = new Date(hoy);
    this.inicioSemana.setDate(hoy.getDate() - diasDesdeInicio);
    this.inicioSemana.setHours(0, 0, 0, 0);

    this.finSemana = new Date(this.inicioSemana);
    this.finSemana.setDate(this.inicioSemana.getDate() + 6);
    this.finSemana.setHours(23, 59, 59, 999);
  }

  cargarOpcionesFiltros(): void {
    this.tiposComprobante = this.comprobantesService.getTiposComprobanteOptions();
    this.estadosComprobante = this.comprobantesService.getEstadosComprobanteOptions();
    this.tiposPago = this.posService.getTiposPagoOptions();
  }

  cargarSedes(): void {
    const sub = this.sedeService.getSedes().subscribe({
      next: (sedes) => (this.sedes = sedes),
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

  cargarSugerenciasBusqueda(): void {
    const sugerencias = new Set<string>();

    this.comprobantesFiltrados.forEach((c) => {
      sugerencias.add(this.getNumeroFormateado(c));
      if (c.cliente_nombre?.trim()) sugerencias.add(c.cliente_nombre.trim());
      if (c.cliente_doc?.trim()) sugerencias.add(c.cliente_doc.trim());
    });

    this.todasLasSugerencias = Array.from(sugerencias).sort();
  }

  buscarSugerencias(event: any): void {
    const query = (event.query || '').toLowerCase().trim();

    if (!query) this.sugerenciasBusqueda = this.todasLasSugerencias.slice(0, 10);
    else {
      this.sugerenciasBusqueda = this.todasLasSugerencias
        .filter((item) => item.toLowerCase().includes(query))
        .slice(0, 15);
    }
  }

  aplicarFiltros(): void {
    this.cargarHistorialDesdeBackend();
  }

  limpiarFiltros(): void {
    this.filtros = {
      tipoComprobante: null,
      estado: null,
      fechaInicio: null,
      fechaFin: null,
      busqueda: '',
      tipoPago: null,
    };
    this.cargarHistorialDesdeBackend();

    this.messageService.add({
      severity: 'info',
      summary: 'Filtros limpiados',
      detail: 'Se restablecieron todos los filtros',
      life: 2000,
    });
  }

  calcularEstadisticas(): void {
    const ventasSemana = this.comprobantesFiltrados.filter((c) => {
      const fechaVenta = new Date(c.fec_emision);
      return fechaVenta >= this.inicioSemana && fechaVenta <= this.finSemana;
    });

    this.totalVentas = ventasSemana.reduce((sum, c) => sum + (c.total || 0), 0);
    this.numeroVentas = ventasSemana.length;
    this.totalBoletas = ventasSemana.filter((c) => c.tipo_comprobante === '03').length;
    this.totalFacturas = ventasSemana.filter((c) => c.tipo_comprobante === '01').length;
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
    this.mostrarDetalle = false;
    this.comprobanteSeleccionado = null;
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
        comprobante.estadoSunat = 'ANULADO';
        comprobante.estado = false;

        this.messageService.add({
          severity: 'success',
          summary: 'Comprobante anulado',
          detail: `${this.getNumeroFormateado(comprobante)} fue anulado exitosamente`,
          life: 3000,
        });

        this.cdr.detectChanges();
      },
    });
  }

  nuevaVenta(): void {
    this.router.navigate(['/ventas/generar-venta']);
  }
}
