import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { of, Subject, Subscription, debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs';
import { timeout, catchError } from 'rxjs/operators';

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
import { Dialog } from 'primeng/dialog';
import { MessageService, ConfirmationService } from 'primeng/api';

import { LoadingOverlayComponent } from '../../../shared/components/loading-overlay/loading-overlay.component';
import { PaginadorComponent } from '../../../shared/components/paginador/paginador.components';
import { VentasAdminService } from '../../services/ventas.service';
import { AuthService } from '../../../auth/services/auth.service';
import { ExcelUtils } from '../../utils/excel.utils';
import { UserRole } from '../../../core/constants/roles.constants';
import {
  getLunesSemanaActualPeru,
  getDomingoSemanaActualPeru,
} from '../../../shared/utils/date-peru.utils';

import {
  SalesReceiptSummaryAdmin,
  SalesReceiptsQueryAdmin,
  SedeAdmin,
  MetodoPagoAdmin,
  TipoComprobanteAdmin,
} from '../../interfaces/ventas.interface';

import {
  AccionesComprobanteDialogComponent,
  AccionesComprobanteConfig,
  AccionComprobante,
} from '../../../shared/components/acciones-comprobante-dialog/acciones-comprobante';

interface FiltroVentasAdmin {
  sedeSeleccionada: number | null;
  tipoComprobante: number | null;
  estado: string | null;
  fechaInicio: Date | null;
  fechaFin: Date | null;
  busqueda: string;
  tipoPago: number | null;
}

@Component({
  selector: 'app-historial-ventas-administracion',
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
    Dialog,
    LoadingOverlayComponent,
    PaginadorComponent,
    AccionesComprobanteDialogComponent,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './historial-ventas-administracion.html',
  styleUrl: './historial-ventas-administracion.css',
})
export class HistorialVentasAdministracion implements OnInit, OnDestroy {
  private readonly router              = inject(Router);
  private readonly ventasService       = inject(VentasAdminService);
  private readonly authService         = inject(AuthService);
  private readonly messageService      = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly cdr                 = inject(ChangeDetectorRef);

  readonly tituloKicker    = 'VENTAS - HISTORIAL DE VENTAS';
  readonly subtituloKicker = 'CONSULTA Y GESTIÓN DE VENTAS';
  readonly iconoCabecera   = 'pi pi-list';

  private subscriptions   = new Subscription();
  private busquedaSubject = new Subject<string>();
  private readonly cancelCargar$ = new Subject<void>();

  comprobantes: SalesReceiptSummaryAdmin[]          = [];
  comprobantesFiltrados: SalesReceiptSummaryAdmin[] = [];

  sedes: SedeAdmin[]                                          = [];
  sedesOptions: { label: string; value: number | null }[]    = [];
  tiposComprobante: { label: string; value: number | null }[] = [{ label: 'Todos', value: null }];
  metodosPago: { label: string; value: number | null }[]      = [{ label: 'Todos', value: null }];

  accionesCargando = signal<number | null>(null);

  readonly esAdmin: boolean;
  readonly sedeNombreVentas: string;
  private readonly sedePropiaId: number | null;

  // ── Dialog acciones ───────────────────────────────────────────────
  dialogVisible                                    = false;
  dialogConfig: AccionesComprobanteConfig | null   = null;
  dialogAccionCargando: string | null              = null;
  private comprobanteDialogActual: SalesReceiptSummaryAdmin | null = null;

  // ── Dialog WhatsApp — signals ─────────────────────────────────────
  wspDialogVisible     = signal<boolean>(false);
  wspReady             = signal<boolean>(false);
  wspQr                = signal<string | null>(null);
  wspConsultando       = signal<boolean>(false);
  wspComprobanteActual = signal<SalesReceiptSummaryAdmin | null>(null);
  private wspPollingInterval: any = null;

  readonly estadosComprobante = [
    { label: 'Todos',     value: null },
    { label: 'Emitido',   value: 'EMITIDO' },
    { label: 'Anulado',   value: 'ANULADO' },
    { label: 'Rechazado', value: 'RECHAZADO' },
    { label: 'Pendiente', value: 'PENDIENTE' },
  ];

  filtros: FiltroVentasAdmin = {
    sedeSeleccionada: null,
    tipoComprobante:  null,
    estado:           'EMITIDO',
    fechaInicio:      getLunesSemanaActualPeru(),
    fechaFin:         getDomingoSemanaActualPeru(),
    busqueda:         '',
    tipoPago:         null,
  };

  sugerenciasBusqueda: string[] = [];
  todasLasSugerencias: string[] = [];

  loading         = false;
  paginaActual    = 1;
  limitePorPagina = 5;
  totalRegistros  = 0;
  totalPaginas    = 0;
  totalVentas     = 0;
  numeroVentas    = 0;
  totalBoletas    = 0;
  totalFacturas   = 0;

  constructor() {
    const user = this.authService.getCurrentUser();
    this.esAdmin          = this.authService.getRoleId() === UserRole.ADMIN;
    this.sedeNombreVentas = user?.sedeNombre ?? 'Mi sede';
    this.sedePropiaId     = user?.idSede ?? null;
  }

  ngOnInit(): void {
    this.filtros.sedeSeleccionada = this.sedePropiaId;
    this.cargarTiposComprobante();
    this.cargarMetodosPago();

    if (this.esAdmin) {
      this.cargarSedes();
    } else {
      this.cargarComprobantes();
      this.cargarKpis();
    }

    this.configurarBusqueda();

    this.messageService.add({
      severity: 'success',
      summary: this.esAdmin ? 'Modo Administración' : 'Historial de Ventas',
      detail:  `Visualizando ventas de: ${this.sedeNombreVentas}`,
      life: 3000,
    });
  }

  ngOnDestroy(): void {
    this.cancelCargar$.next();
    this.cancelCargar$.complete();
    this.busquedaSubject.complete();
    this.subscriptions.unsubscribe();
    this.detenerPollingWsp();
  }

  // ── Búsqueda ──────────────────────────────────────────────────────
  private configurarBusqueda(): void {
    const sub = this.busquedaSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((query) => {
        if (query.length < 3) return [];
        return this.ventasService.listarHistorialVentas({
          page: 1, limit: 10, search: query,
          sedeId: this.filtros.sedeSeleccionada ?? undefined,
        });
      }),
    ).subscribe({
      next: (res: any) => {
        const data: SalesReceiptSummaryAdmin[] = res?.receipts ?? res?.data ?? res?.items ?? [];
        const set = new Set<string>();
        data.forEach((c) => {
          const nombre = c.clienteNombre?.trim();
          const doc    = c.clienteDocumento?.trim();
          if (nombre && doc) set.add(`${nombre} - ${doc}`);
          else if (nombre)   set.add(nombre);
          else if (doc)      set.add(doc);
        });
        this.sugerenciasBusqueda = Array.from(set).slice(0, 15);
        this.cdr.markForCheck();
      },
      error: () => (this.sugerenciasBusqueda = []),
    });
    this.subscriptions.add(sub);
  }

  // ── Paginación ────────────────────────────────────────────────────
  onPageChange(page: number): void {
    this.paginaActual = page;
    this.cargarComprobantes();
  }

  onLimitChange(nuevoLimite: number): void {
    this.limitePorPagina = nuevoLimite;
    this.paginaActual    = 1;
    this.cargarComprobantes();
  }

  // ── Filtros ───────────────────────────────────────────────────────
  aplicarFiltros(): void {
    if (!this.esAdmin) this.filtros.sedeSeleccionada = this.sedePropiaId;
    this.paginaActual = 1;
    this.cargarComprobantes();
    this.cargarKpis();
  }

  limpiarFiltros(): void {
    this.filtros = {
      sedeSeleccionada: this.sedePropiaId,
      tipoComprobante:  null,
      estado:           null,
      fechaInicio:      null,
      fechaFin:         null,
      busqueda:         '',
      tipoPago:         null,
    };
    this.aplicarFiltros();
    this.messageService.add({ severity: 'info', summary: 'Filtros limpiados', detail: 'Se restablecieron los filtros', life: 2000 });
  }

  onSeleccionarSugerencia(event: any): void {
    const valor: string = event.value ?? '';
    this.filtros.busqueda = valor.split(' - ')[0].trim();
    this.aplicarFiltros();
  }

  onBusquedaKeyUp(event: KeyboardEvent): void {
    if (event.key === 'Enter') this.aplicarFiltros();
  }

  onBusquedaLimpiada(): void {
    this.filtros.busqueda = '';
    this.paginaActual = 1;
    this.cargarComprobantes();
    this.cargarKpis();
  }

  buscarSugerencias(event: any): void {
    const query = (event.query ?? '').trim();
    if (query.length < 3) { this.sugerenciasBusqueda = this.todasLasSugerencias.slice(0, 10); return; }
    this.busquedaSubject.next(query);
  }

  // ── Carga de datos ────────────────────────────────────────────────
  cargarComprobantes(): void {
    this.loading = true;
    this.cancelCargar$.next();

    const query: SalesReceiptsQueryAdmin = {
      page:            this.paginaActual,
      limit:           this.limitePorPagina,
      sedeId:          this.filtros.sedeSeleccionada  ?? undefined,
      receiptTypeId:   this.filtros.tipoComprobante   ?? undefined,
      status:          (this.filtros.estado as any)   ?? undefined,
      paymentMethodId: this.filtros.tipoPago          ?? undefined,
      dateFrom:        this.filtros.fechaInicio ? this.filtros.fechaInicio.toISOString().split('T')[0] : undefined,
      dateTo:          this.filtros.fechaFin    ? this.filtros.fechaFin.toISOString().split('T')[0]    : undefined,
      search:          this.filtros.busqueda.trim() || undefined,
      _t:              Date.now(),
    };

    const sub = this.ventasService.listarHistorialVentas(query)
      .pipe(takeUntil(this.cancelCargar$))
      .subscribe({
        next: (res: any) => {
          const data = res?.receipts ?? res?.data ?? res?.items ?? [];
          this.comprobantes          = Array.isArray(data) ? data : [];
          this.comprobantesFiltrados = [...this.comprobantes];
          this.cargarSugerenciasBusqueda();
          this.loading = false;
          setTimeout(() => {
            this.totalRegistros = res?.total ?? this.comprobantes.length;
            this.totalPaginas   = res?.total_pages ?? 1;
            this.cdr.markForCheck();
          });
        },
        error: () => {
          this.loading = false;
          this.comprobantes          = [];
          this.comprobantesFiltrados = [];
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar el historial de ventas', life: 3000 });
        },
      });
    this.subscriptions.add(sub);
  }

  cargarKpis(): void {
    const f = this.filtros;
    const sub = this.ventasService.getKpiPorFiltros({
      sedeId:          f.sedeSeleccionada   ?? undefined,
      dateFrom:        f.fechaInicio ? f.fechaInicio.toISOString().split('T')[0] : undefined,
      dateTo:          f.fechaFin    ? f.fechaFin.toISOString().split('T')[0]    : undefined,
      status:          f.estado             ?? undefined,
      paymentMethodId: f.tipoPago           ?? undefined,
      receiptTypeId:   f.tipoComprobante    ?? undefined,
      search:          f.busqueda.trim()    || undefined,
    }).subscribe({
      next: (kpi) => {
        this.totalVentas   = kpi.total_ventas     ?? 0;
        this.numeroVentas  = kpi.cantidad_ventas   ?? 0;
        this.totalBoletas  = kpi.cantidad_boletas  ?? 0;
        this.totalFacturas = kpi.cantidad_facturas ?? 0;
        this.cdr.markForCheck();
      },
      error: () => console.warn('No se pudieron cargar KPIs'),
    });
    this.subscriptions.add(sub);
  }

  private cargarSedes(): void {
    const sub = this.ventasService.obtenerSedes().subscribe({
      next: (data) => {
        this.sedes        = data.filter((s) => s.activo);
        this.sedesOptions = [
          { label: 'Todas las sedes', value: null },
          ...this.sedes.map((s) => ({ label: s.nombre, value: s.id_sede })),
        ];
        if (this.sedePropiaId) this.filtros.sedeSeleccionada = this.sedePropiaId;
        this.cdr.markForCheck();
        this.cargarComprobantes();
        this.cargarKpis();
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar las sedes', life: 3000 }),
    });
    this.subscriptions.add(sub);
  }

  private cargarTiposComprobante(): void {
    const sub = this.ventasService.obtenerTiposComprobante().subscribe({
      next: (tipos: TipoComprobanteAdmin[]) => {
        this.tiposComprobante = [{ label: 'Todos', value: null }, ...tipos.map((t) => ({ label: t.descripcion, value: t.id }))];
        this.cdr.markForCheck();
      },
      error: () => console.warn('No se pudieron cargar los tipos de comprobante'),
    });
    this.subscriptions.add(sub);
  }

  private cargarMetodosPago(): void {
    const sub = this.ventasService.obtenerMetodosPago().subscribe({
      next: (metodos: MetodoPagoAdmin[]) => {
        this.metodosPago = [{ label: 'Todos', value: null }, ...metodos.map((m) => ({ label: m.descripcion, value: m.id }))];
        this.cdr.markForCheck();
      },
      error: () => console.warn('No se pudieron cargar los métodos de pago'),
    });
    this.subscriptions.add(sub);
  }

  private cargarSugerenciasBusqueda(): void {
    const set = new Set<string>();
    this.comprobantes.forEach((c) => {
      const nombre = c.clienteNombre?.trim();
      const doc    = c.clienteDocumento?.trim();
      if (nombre && doc) set.add(`${nombre} - ${doc}`);
      else if (nombre)   set.add(nombre);
      else if (doc)      set.add(doc);
    });
    this.todasLasSugerencias = Array.from(set).sort();
  }

  // ── Dialog acciones ───────────────────────────────────────────────
  abrirDialogAcciones(comprobante: SalesReceiptSummaryAdmin): void {
    this.comprobanteDialogActual = comprobante;
    this.dialogAccionCargando    = null;
    this.dialogConfig = {
      titulo:           this.getNumeroFormateado(comprobante),
      subtitulo:        comprobante.clienteNombre,
      mostrarWsp:       true,
      mostrarEmail:     true,
      labelPdf:         'PDF',
      labelVoucher:     'Voucher',
      mostrarNotaVenta: true,
      labelNotaVenta:   'Nota de Venta',
    };
    this.dialogVisible = true;
    this.cdr.markForCheck();
  }

  onAccionDialog(accion: AccionComprobante): void {
    const comprobante = this.comprobanteDialogActual;
    if (!comprobante) return;

    switch (accion) {
      case 'wsp':
        this.dialogVisible        = false;
        this.dialogAccionCargando = null;
        this.abrirDialogWsp(comprobante);
        break;

      case 'email':
        this.dialogAccionCargando = 'email';
        this.cdr.markForCheck();
        this.ventasService.enviarComprobantePorEmail(comprobante.idComprobante).subscribe({
          next: (res) => {
            this.dialogAccionCargando = null;
            this.dialogVisible        = false;
            this.messageService.add({ severity: 'success', summary: 'Email enviado', detail: res.message ?? `Comprobante enviado a ${res.sentTo}`, life: 4000 });
            this.cdr.markForCheck();
          },
          error: () => {
            this.dialogAccionCargando = null;
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo enviar el comprobante por email', life: 3000 });
            this.cdr.markForCheck();
          },
        });
        break;

      case 'pdf-imprimir':
        this.ventasService.verComprobantePdfEnPestana(comprobante.idComprobante).subscribe();
        break;

      case 'pdf-descargar': {
        const nombre = `comprobante-${comprobante.serie}-${String(comprobante.numero).padStart(8, '0')}.pdf`;
        this.ventasService.descargarComprobantePdf(comprobante.idComprobante, nombre).subscribe();
        break;
      }

      case 'voucher-imprimir':
        this.ventasService.generarVoucher(comprobante.idComprobante, true).subscribe();
        break;

      case 'voucher-descargar':
        this.ventasService.generarVoucher(comprobante.idComprobante, false).subscribe();
        break;

      case 'nota-venta-imprimir':
        this.ventasService.verNotaVentaPdfEnPestana(comprobante.idComprobante).subscribe();
        break;

      case 'nota-venta-descargar': {
        const nombre = `NOTA_VENTA-${comprobante.serie}-${String(comprobante.numero).padStart(8, '0')}.pdf`;
        this.ventasService.descargarNotaVentaPdf(comprobante.idComprobante, nombre).subscribe();
        break;
      }
    }
  }

  onDialogCerrar(): void {
    this.dialogVisible           = false;
    this.dialogAccionCargando    = null;
    this.comprobanteDialogActual = null;
    this.cdr.markForCheck();
  }

  // ── Dialog WhatsApp ───────────────────────────────────────────────
  abrirDialogWsp(comprobante: SalesReceiptSummaryAdmin): void {
    this.wspComprobanteActual.set(comprobante);
    this.wspDialogVisible.set(true);
    this.wspReady.set(false);
    this.wspQr.set(null);
    this.wspConsultando.set(true);
    this.verificarEstadoWsp();
  }

  private verificarEstadoWsp(): void {
    this.ventasService.obtenerEstadoWhatsApp().pipe(
      timeout(5000),
      catchError(() => of({ ready: false, qr: null })),
    ).subscribe({
      next: ({ ready, qr }) => {
        this.wspConsultando.set(false);
        this.wspReady.set(ready);
        this.wspQr.set(qr ?? null);
        this.cdr.markForCheck();
        if (!ready) this.iniciarPollingWsp();
      },
    });
  }

  private iniciarPollingWsp(): void {
    this.detenerPollingWsp();
    this.wspPollingInterval = setInterval(() => {
      this.ventasService.obtenerEstadoWhatsApp().pipe(
        timeout(4000),
        catchError(() => of({ ready: false, qr: null })),
      ).subscribe({
        next: ({ ready, qr }) => {
          this.wspReady.set(ready);
          this.wspQr.set(qr ?? null);
          this.cdr.markForCheck();
          if (ready) this.detenerPollingWsp();
        },
      });
    }, 3000);
  }

  private detenerPollingWsp(): void {
    if (this.wspPollingInterval) {
      clearInterval(this.wspPollingInterval);
      this.wspPollingInterval = null;
    }
  }

  cerrarDialogWsp(): void {
    this.wspDialogVisible.set(false);
    this.wspComprobanteActual.set(null);
    this.wspReady.set(false);
    this.wspQr.set(null);
    this.wspConsultando.set(false);
    this.detenerPollingWsp();
  }

  confirmarEnvioWsp(): void {
    const comprobante = this.wspComprobanteActual();
    if (!comprobante) return;

    this.wspDialogVisible.set(false);
    this.detenerPollingWsp();

    this.ventasService.enviarComprobantePorWhatsApp(comprobante.idComprobante).subscribe({
      next: (res) => {
        this.messageService.add({
          severity: 'success',
          summary: 'WhatsApp enviado',
          detail: res.message ?? `Comprobante enviado a ${res.sentTo}`,
          life: 4000,
        });
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo enviar el comprobante por WhatsApp', life: 3000 });
      },
    });
  }

  // ── Navegación ────────────────────────────────────────────────────
  GenerarVenta(): void { this.router.navigate(['./admin/generar-ventas-administracion']); }

  verDetalleVenta(comprobante: SalesReceiptSummaryAdmin): void {
    this.router.navigate(['/admin/detalles-ventas-administracion', comprobante.idComprobante], {
      state: { rutaRetorno: '/admin/historial-ventas-administracion' },
    });
  }

  crearGuiaRemision(comprobante: any): void {
    this.router.navigate(['/logistica/remision/nueva'], {
      queryParams: { ventaId: comprobante.id, comprobanteRef: this.getNumeroFormateado(comprobante) },
    });
  }

  // ── NOTA DE CRÉDITO ───────────────────────────────────────────────
  /**
   * Navega a la pantalla de nota de crédito pasando el idComprobante via state.
   * El componente destino llama a CreditNoteService.detalle(id) directamente,
   * sin ninguna búsqueda por correlativo (que generaba el 404).
   */
  anularComprobante(comprobante: SalesReceiptSummaryAdmin): void {
    if (comprobante.estado !== 'EMITIDO') return;

    this.router.navigate(['/admin/nota-credito/crear'], {
      state: {
        autoCargar:       true,
        idComprobante:    comprobante.idComprobante,          // ← ID numérico directo
        serieCorrelativo: this.getNumeroFormateado(comprobante), // solo para mostrar en UI
        rutaRetorno:      '/admin/historial-ventas-administracion',
      },
    });
  }
    
  crearNotaCredito(comprobante: SalesReceiptSummaryAdmin): void {
    if (comprobante.estado !== 'EMITIDO') return;

    // Pass the formatted series-correlative instead of ID
    const serieCorrelativo = this.getNumeroFormateado(comprobante);

    this.router.navigate(['/admin/nota-credito/crear'], {
      state: {
        autoCargar:       true,
        serieCorrelativo: serieCorrelativo,  // Use this instead of ID
        idComprobante:    comprobante.idComprobante,
        rutaRetorno:      '/admin/historial-ventas-administracion',
      },
    });
  }

  exportarExcel(): void {
    if (this.comprobantesFiltrados.length === 0) {
      this.messageService.add({ severity: 'warn', summary: 'Sin datos', detail: 'No hay registros para exportar', life: 3000 });
      return;
    }
    const datosExcel = this.comprobantesFiltrados.map((c) => ({
      'N° Comprobante': this.getNumeroFormateado(c),
      Tipo:             this.getTipoComprobanteLabel(c.tipoComprobante),
      'Fecha Emisión':  new Date(c.fecEmision).toLocaleString('es-PE'),
      Cliente:          c.clienteNombre,
      Documento:        c.clienteDocumento,
      'Tipo Pago':      this.getTipoPagoLabel(c.metodoPago),
      Sede:             c.sedeNombre,
      Total:            c.total,
      Estado:           c.estado,
    }));
    const nombreArchivo = ExcelUtils.generarNombreConFecha('ventas');
    ExcelUtils.exportarAExcel(datosExcel, nombreArchivo, 'Comprobantes');
    this.messageService.add({ severity: 'success', summary: 'Exportación exitosa', detail: `Archivo ${nombreArchivo}.xlsx descargado`, life: 3000 });
  }

  // ── Helpers ───────────────────────────────────────────────────────
  getSeverityEstado(estado: string): 'success' | 'danger' | 'warn' | 'info' {
    switch (estado) {
      case 'EMITIDO':   return 'success';
      case 'ANULADO':   return 'danger';
      case 'RECHAZADO': return 'warn';
      default:          return 'info';
    }
  }

  getTipoComprobanteLabel(tipo: string): string {
    if (!tipo) return 'N/A';
    const t = tipo.toUpperCase();
    if (t.includes('BOLETA')       || tipo === '03') return 'Boleta';
    if (t.includes('FACTURA')      || tipo === '01') return 'Factura';
    if (t.includes('NOTA DE VENTA'))                 return 'Nota de Venta';
    return tipo;
  }

  getNumeroFormateado(c: SalesReceiptSummaryAdmin): string {
    return `${c.serie}-${String(c.numero).padStart(8, '0')}`;
  }

  getTipoPagoLabel(metodo: string): string {
    return metodo ?? 'N/A';
  }

  getSeverityTipoPago(metodo: string): 'success' | 'info' | 'warn' | 'secondary' {
    if (!metodo) return 'secondary';
    const m = metodo.toLowerCase();
    if (m.includes('efectivo'))                       return 'success';
    if (m.includes('yape') || m.includes('plin'))     return 'info';
    if (m.includes('tarjeta'))                        return 'warn';
    return 'secondary';
  }
}