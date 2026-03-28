import { Component, OnInit, OnDestroy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

// PrimeNG & UI
import { TableModule } from 'primeng/table';
import { SelectModule } from 'primeng/select';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialog, ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { AutoComplete } from 'primeng/autocomplete';
import { TooltipModule } from 'primeng/tooltip';
import { DatePickerModule } from 'primeng/datepicker';
import { ConfirmationService, MessageService } from 'primeng/api';

// Services & Utils
import { QuoteService } from '../../../services/quote.service';
import { SedeService } from '../../../services/sede.service';
import { QuoteListItem } from '../../../interfaces/quote.interface';
import { getDomingoSemanaActualPeru, getLunesSemanaActualPeru } from '../../../../shared/utils/date-peru.utils';
import { AccionesComprobanteDialogComponent, AccionesComprobanteConfig, AccionComprobante } from '../../../../shared/components/acciones-comprobante-dialog/acciones-comprobante';
import { SharedTableContainerComponent } from '../../../../shared/components/table.componente/shared-table-container.component';

@Component({
  selector: 'app-gestion-cotizaciones',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule, TableModule, SelectModule, CardModule,
    ButtonModule, TagModule, ToastModule, ConfirmDialog, ConfirmDialogModule,
    AutoComplete, TooltipModule, DatePickerModule, DialogModule,
    AccionesComprobanteDialogComponent, SharedTableContainerComponent
  ],
  templateUrl: './gestion-listado.html',
  styleUrl: './gestion-listado.css',
  providers: [MessageService, ConfirmationService]
})
export class GestionCotizacionesComponent implements OnInit, OnDestroy {
  public iconoCabecera   = 'pi pi-shopping-cart';
  public tituloKicker    = 'ADMINISTRACIÓN';
  public subtituloKicker = 'GESTIÓN DE COTIZACIONES DE VENTA';

  private readonly TIPO_FIJO: 'VENTA' | 'COMPRA' = 'VENTA';

  // Servicios
  private quoteService = inject(QuoteService);
  private sedeService = inject(SedeService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private router = inject(Router);

  // Signals de Estado
  buscarValue = signal<string>('');
  cotizacionSugerencias = signal<QuoteListItem[]>([]);
  estadoSeleccionado = signal<string | null>('PENDIENTE');
  sedeSeleccionada = signal<number | null>(null);
  currentPage = signal<number>(1);
  rows = signal<number>(5);
  fechaFin = signal<Date | null>(getDomingoSemanaActualPeru());
  fechaInicio = signal<Date | null>(getLunesSemanaActualPeru());

  // Selectors y PrimeNG Options
  estadosOptions = [
    { label: 'Todos',     value: null       },
    { label: 'Pendiente', value: 'PENDIENTE' },
    { label: 'Aprobada',  value: 'APROBADA'  },
    { label: 'Rechazada', value: 'RECHAZADA' },
    { label: 'Vencida',   value: 'VENCIDA'   },
  ];

  sedesOptions = computed(() => this.sedeService.sedes().map(sede => ({
    label: sede.nombre,
    value: sede.id_sede,
  })));

  cotizaciones = computed(() => this.quoteService.quotes());

  // Resolver cotizacionesFiltradas localmente por fechas
  cotizacionesFiltradas = computed(() => {
    const inicio = this.fechaInicio();
    const fin    = this.fechaFin();
    const lista  = this.cotizaciones();

    if (!inicio && !fin) return lista;

    return lista.filter((c: QuoteListItem) => {
      const fechaStr  = c.fec_emision.substring(0, 10);
      const [y, m, d] = fechaStr.split('-').map(Number);
      const fecSolo   = new Date(y, m - 1, d);

      if (inicio) {
        const iniSolo = new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate());
        if (fecSolo < iniSolo) return false;
      }
      if (fin) {
        const finSolo = new Date(fin.getFullYear(), fin.getMonth(), fin.getDate());
        if (fecSolo > finSolo) return false;
      }
      return true;
    });
  });

  totalPages = computed(() => this.quoteService.totalPages());
  loading = computed(() => this.quoteService.loading());
  totalRecords = computed(() => this.quoteService.kpiTotal());
  totalAprobadas = computed(() => this.quoteService.kpiAprobadas());
  totalPendientes = computed(() => this.quoteService.kpiPendientes());

  // Estado de Diálogos de Acciones (PDF, Email, Térmico)
  accionesVisible = false;
  accionCargando: string | null = null;
  accionesConfig: AccionesComprobanteConfig | null = null;
  private cotizacionAcciones: QuoteListItem | null = null;

  // Estado de Diálogo WhatsApp
  mostrarDialogWsp = false;
  enviandoWsp = false;
  wspReady = false;
  wspQr: string | null = null;
  cotizacionWsp: QuoteListItem | null = null;
  private pollingInterval: any = null;

  // Pipeline de Búsqueda (RxJS)
  private searchSubject$ = new Subject<string>();

  constructor() {
    this.searchSubject$.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      switchMap(query => {
        if (query.length < 2) return [[]];
        return this.quoteService.autocomplete(query, this.TIPO_FIJO, this.sedeSeleccionada() ?? undefined);
      }),
      takeUntilDestroyed()
    ).subscribe(items => this.cotizacionSugerencias.set(items as any[]));
  }

  ngOnInit() {
    this.inicializarSede();
    this.cargarCotizacion();
    this.sedeService.loadSedes().subscribe({
      error: (err) => console.error('Error cargando sedes', err),
    });
  }

  ngOnDestroy() {
    if (this.pollingInterval) clearInterval(this.pollingInterval);
  }

  private inicializarSede() {
    try {
      const userString = localStorage.getItem('user');
      if (userString) {
        const user = JSON.parse(userString);
        if (user.idSede) this.sedeSeleccionada.set(user.idSede);
      }
    } catch (e) {
      console.error('Error parseando usuario', e);
    }
  }

  cargarCotizacion() {
    const search = this.buscarValue()?.trim() || undefined;
    this.quoteService.loadQuotes({
      estado:  this.estadoSeleccionado(),
      tipo:    this.TIPO_FIJO,
      id_sede: this.sedeSeleccionada(),
      search,                        
      page:    this.currentPage(),
      limit:   this.rows(),
    }).subscribe();
  }
  // --- Filtros y Fechas ---

  onSedeChange(nuevaSedeId: number | null) {
    this.sedeSeleccionada.set(nuevaSedeId);
    this.currentPage.set(1);
    this.cargarCotizacion();
  }

  onEstadoChange(estado: string | null) {
    this.estadoSeleccionado.set(estado);
    this.currentPage.set(1);
    this.cargarCotizacion();
  }

  onFechaChange() { 
    // Filtro local gestionado por la señal computada `cotizacionesFiltradas`
  }

  limpiarFiltros() {
    this.buscarValue.set('');
    this.cotizacionSugerencias.set([]);
    this.fechaInicio.set(null);
    this.fechaFin.set(null);
    this.sedeSeleccionada.set(null);
    this.estadoSeleccionado.set(null);
    this.currentPage.set(1);
    this.cargarCotizacion();
  }

  onPageChange(page: number)   { this.currentPage.set(page); this.cargarCotizacion(); }
  onLimitChange(limit: number) { this.rows.set(limit); this.currentPage.set(1); this.cargarCotizacion(); }

  // --- Eventos del Buscador ---

  searchCotizacion(event: { query: string }) {
    this.searchSubject$.next(event.query.trim());
  }

  seleccionarCotizacionBusqueda(event: any) {
    // event puede ser { value: QuoteListItem } o directamente QuoteListItem
    const item: QuoteListItem = event?.value ?? event;
    this.buscarValue.set(item.codigo);
    this.cotizacionSugerencias.set([]);
    this.currentPage.set(1);
    this.cargarCotizacion(); // filtra la tabla, no navega
  }

  onBuscarChange(value: string | QuoteListItem | null) {
    // Cuando seleccionas del dropdown llega el objeto, cuando escribes llega string
    const texto = typeof value === 'object' && value !== null
      ? (value as QuoteListItem).codigo
      : (value ?? '');

    this.buscarValue.set(texto);

    if (!texto?.trim()) {
      this.cotizacionSugerencias.set([]);
      this.currentPage.set(1);
      this.cargarCotizacion();
    }
  }

  onBuscarKeyUp(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.cotizacionSugerencias.set([]);
      this.currentPage.set(1);
      this.cargarCotizacion();
    }
  }

  limpiarBusquedaCotizacion() {
    this.buscarValue.set('');
    this.cotizacionSugerencias.set([]);
    this.currentPage.set(1);
    this.cargarCotizacion();
  }

  // --- Visual Tags ---

  mapEstadoTag(estado: string | null | undefined): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' | null | undefined {
    switch (estado) {
      case 'APROBADA':  return 'success';
      case 'PENDIENTE': return 'warn';
      case 'RECHAZADA': return 'danger';
      case 'VENCIDA':   return 'secondary';
      default:          return 'secondary';
    }
  }

  // --- Acciones sobre Cotizaciones ---

  rechazarCotizacion(id: number) {
    this.confirmationService.confirm({
      message: '¿Estás seguro de rechazar esta cotización? El estado cambiará a <strong>RECHAZADA</strong>.',
      header: 'Confirmar rechazo', icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, rechazar', rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary p-button-outlined',
      accept: () => {
        this.quoteService.updateQuoteStatus(id, 'RECHAZADA').subscribe({
          next:  () => { this.messageService.add({ severity: 'success', summary: 'Cotización rechazada', detail: 'El estado fue actualizado a RECHAZADA.' }); this.cargarCotizacion(); },
          error: () => { this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar el estado.' }); },
        });
      },
    });
  }

  reactivarCotizacion(id: number) {
    this.confirmationService.confirm({
      message: '¿Deseas reactivar esta cotización? El estado volverá a <strong>PENDIENTE</strong>.',
      header: 'Confirmar reactivación', icon: 'pi pi-refresh',
      acceptLabel: 'Sí, reactivar', rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-success',
      rejectButtonStyleClass: 'p-button-secondary p-button-outlined',
      accept: () => {
        this.quoteService.updateQuoteStatus(id, 'PENDIENTE').subscribe({
          next:  () => { this.messageService.add({ severity: 'success', summary: 'Cotización reactivada', detail: 'El estado volvió a PENDIENTE.' }); this.cargarCotizacion(); },
          error: () => { this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo reactivar la cotización.' }); },
        });
      },
    });
  }

  eliminarCotizacion(id: number) {
    this.confirmationService.confirm({
      message: '¿Estás seguro de <strong>eliminar permanentemente</strong> esta cotización? Esta acción no se puede deshacer.',
      header: 'Eliminar cotización', icon: 'pi pi-trash',
      acceptLabel: 'Sí, eliminar', rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary p-button-outlined',
      accept: () => {
        this.quoteService.deleteQuote(id).subscribe({
          next:  () => { this.messageService.add({ severity: 'success', summary: 'Eliminada', detail: 'La cotización fue eliminada permanentemente.' }); this.cargarCotizacion(); },
          error: () => { this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar la cotización.' }); },
        });
      },
    });
  }

  // --- Diálogo Impresiones ---

  abrirAcciones(c: QuoteListItem): void {
    this.cotizacionAcciones = c;
    this.accionesConfig = {
      titulo:       c.codigo,
      subtitulo:    c.cliente_nombre,
      labelPdf:     'PDF Cotización',
      labelVoucher: 'Voucher',
    };
    this.accionCargando  = null;
    this.accionesVisible = true;
  }

  onAccion(accion: AccionComprobante): void {
    const c = this.cotizacionAcciones!;
    switch (accion) {
      case 'wsp':
        this.accionesVisible = false;
        this.abrirDialogWsp(c);
        break;
      case 'email':
        this.accionCargando = 'email';
        this.quoteService.sendByEmail(c.id_cotizacion).subscribe({
          next:  (res) => { this.accionCargando = null; this.accionesVisible = false; this.messageService.add({ severity: 'success', summary: 'Email enviado', detail: `Cotización enviada a su correo.`, life: 4000 }); },
          error: ()    => { this.accionCargando = null; this.accionesVisible = false; this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo enviar. Verifique el email del cliente.', life: 3000 }); },
        });
        break;
      case 'pdf-imprimir':
      case 'pdf-descargar':
        this.accionCargando = accion;
        this.quoteService.downloadPdf(c.id_cotizacion).subscribe({
          next:  () => { this.accionCargando = null; this.accionesVisible = false; },
          error: () => { this.accionCargando = null; this.accionesVisible = false; }
        });
        break;
    }
  }

  // --- WhatsApp Dialog ---

  abrirDialogWsp(c: QuoteListItem): void {
    this.cotizacionWsp = c;
    this.mostrarDialogWsp = true;
    this.wspReady = false;
    this.wspQr = null;
    this.verificarEstadoWsp();
  }

  cerrarDialogWsp(): void {
    this.mostrarDialogWsp = false;
    this.cotizacionWsp = null;
    if (this.pollingInterval) { clearInterval(this.pollingInterval); this.pollingInterval = null; }
  }

  private verificarEstadoWsp(): void {
    this.quoteService.getWhatsAppStatus().subscribe({
      next: (res) => {
        this.wspReady = res.ready;
        this.wspQr = res.qr ?? null;
        if (!res.ready) {
          this.pollingInterval = setInterval(() => {
            this.quoteService.getWhatsAppStatus().subscribe({
              next: (r) => {
                this.wspReady = r.ready;
                this.wspQr = r.qr ?? null;
                if (r.ready) { clearInterval(this.pollingInterval); this.pollingInterval = null; }
              },
            });
          }, 3000);
        }
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo conectar con el servicio de WhatsApp.', life: 4000 }),
    });
  }

  enviarPorWsp(): void {
    if (!this.cotizacionWsp) return;
    this.enviandoWsp = true;
    this.quoteService.sendByWhatsApp(this.cotizacionWsp.id_cotizacion).subscribe({
      next: (res) => {
        this.enviandoWsp = false;
        this.cerrarDialogWsp();
        this.messageService.add({ severity: 'success', summary: '¡Enviado!', detail: `Cotización enviada.`, life: 5000 });
      },
      error: (err) => {
        this.enviandoWsp = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo enviar por WhatsApp.', life: 5000 });
      },
    });
  }

  // --- Helpers de Tiempo y Badges ---

  getDiasRestantes(fecVenc: string | Date | null): number {
    if (!fecVenc) return 0;
    const hoy  = new Date(); hoy.setHours(0, 0, 0, 0);
    const venc = new Date(fecVenc); venc.setHours(0, 0, 0, 0);
    return Math.round((venc.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
  }

  getDiasLabel(fecVenc: string | Date | null): string {
    const dias = this.getDiasRestantes(fecVenc);
    if (dias < 0)   return 'Vencido';
    if (dias === 0) return 'Hoy';
    if (dias === 1) return '1d';
    return `${dias}d`;
  }

  getDiasBadgeClass(fecVenc: string | Date | null): string {
    const dias = this.getDiasRestantes(fecVenc);
    if (dias < 0)   return 'dias-badge--vencido';
    if (dias === 0) return 'dias-badge--hoy';
    if (dias <= 3)  return 'dias-badge--urgente';
    if (dias <= 7)  return 'dias-badge--proximo';
    return 'dias-badge--ok';
  }

  getDiasColor(fecVenc: string | Date | null): string {
    const dias = this.getDiasRestantes(fecVenc);
    if (dias < 0)  return '#f87171';
    if (dias <= 3) return '#fb923c';
    if (dias <= 7) return '#facc15';
    return 'var(--text-muted)';
  }

  // --- Generación de Ventas Directas ---

  irAgregarVenta(id: number) {
    const c = this.cotizacionesFiltradas().find((x: QuoteListItem) => x.id_cotizacion === id);
    const tipoCot = c?.tipo ?? 'VENTA';
    const impacto = '<br><br><span style="color:#f87171">↓ Restará stock a los productos</span>';

    this.confirmationService.confirm({
      message:  `¿Confirmas generar una <strong>venta al contado</strong> a partir de esta cotización?${impacto}`,
      header:   'Generar Venta (Contado)',
      icon:     'pi pi-shopping-cart',
      acceptLabel: 'Sí, continuar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-success',
      rejectButtonStyleClass: 'p-button-secondary p-button-outlined',
      accept: () => {
        this.router.navigate(
          ['/admin/generar-ventas-administracion'],
          { queryParams: { cotizacion: id, tipo: 'contado', tipoCot } }
        );
      },
    });
  }

  irAgregarVentaPorCobrar(id: number) {
    const c = this.cotizacionesFiltradas().find((x: QuoteListItem) => x.id_cotizacion === id);
    const tipoCot = c?.tipo ?? 'VENTA';
    const impacto = '<br><br><span style="color:#f87171">↓ Restará stock a los productos</span>';

    this.confirmationService.confirm({
      message:  `¿Confirmas generar una <strong>venta a crédito</strong> a partir de esta cotización?${impacto}`,
      header:   'Generar Venta (Crédito)',
      icon:     'pi pi-credit-card',
      acceptLabel: 'Sí, continuar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-success',
      rejectButtonStyleClass: 'p-button-secondary p-button-outlined',
      accept: () => {
        this.router.navigate(
          ['/admin/generar-ventas-administracion'],
          { queryParams: { cotizacion: id, tipo: 'credito', tipoCot } }
        );
      },
    });
  }

  // --- Navegación ---

  irCrear() { this.router.navigate(['/admin/cotizaciones-venta/agregar-cotizaciones'], { queryParams: { tipo: 'VENTA' } }); }
  irEditar(id: number)  { this.router.navigate(['/admin/cotizaciones-venta/editar-cotizacion', id]); }
  irDetalle(id: number) { this.router.navigate(['/admin/cotizaciones-venta/ver-detalle-cotizacion', id]); }
}