import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  ChangeDetectorRef,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { Card } from 'primeng/card';
import { Button } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { Tooltip } from 'primeng/tooltip';
import { Toast } from 'primeng/toast';
import { DatePicker } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { Divider } from 'primeng/divider';
import { MessageService } from 'primeng/api';

import {
  ClaimService,
  ClaimResponseDto,
  ClaimStatus,
} from '../../../../core/services/claim.service';
import { SharedTableContainerComponent } from '../../../../shared/components/table.componente/shared-table-container.component';
import {
  getLunesSemanaActualPeru,
  getDomingoSemanaActualPeru,
} from '../../../../shared/utils/date-peru.utils';
import { AuthService } from '../../../../auth/services/auth.service';
import { UserRole } from '../../../../core/constants/roles.constants';
import { VentasAdminService } from '../../../../administracion/services/ventas.service';
import { SalesReceiptDetalleCompletoDto } from '../../../../administracion/interfaces/ventas.interface';
import { LoadingOverlayComponent } from '../../../../shared/components/loading-overlay/loading-overlay.component';
import {
  AccionesComprobanteDialogComponent,
  AccionesComprobanteConfig,
  AccionComprobante,
} from '../../../../shared/components/acciones-comprobante-dialog/acciones-comprobante';

@Component({
  selector: 'app-reclamos-listado',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    Card,
    Button,
    TableModule,
    Tag,
    InputText,
    Select,
    Tooltip,
    Toast,
    DatePicker,
    DialogModule,
    Divider,
    SharedTableContainerComponent,
    AccionesComprobanteDialogComponent,
    LoadingOverlayComponent,
  ],
  providers: [MessageService],
  templateUrl: './reclamos-listado.html',
  styleUrl: './reclamos-listado.css',
})
export class ReclamosListado implements OnInit, OnDestroy {
  tituloKicker    = 'VENTAS - RECLAMOS Y GARANTÍAS';
  subtituloKicker = 'GESTIÓN DE RECLAMOS';
  iconoCabecera   = 'pi pi-shield';

  accionesVisible  = false;
  accionCargando: string | null = null;
  accionesConfig: AccionesComprobanteConfig | null = null;
  private reclamoAcciones: ClaimResponseDto | null = null;

  // ── Modal detalle comprobante ─────────────────────────────────────
  detalleComprobanteVisible = signal(false);
  detalleComprobanteLoading = signal(false);
  detalleComprobanteData    = signal<SalesReceiptDetalleCompletoDto | null>(null);

  // ── Dialog WhatsApp ───────────────────────────────────────────────
  mostrarDialogWsp                    = false;
  enviandoWsp                         = false;
  wspReady                            = false;
  wspQr: string | null                = null;
  reclamoWsp: ClaimResponseDto | null = null;
  private pollingInterval: any        = null;

  private readonly router         = inject(Router);
  private readonly cdr            = inject(ChangeDetectorRef);
  private readonly messageService = inject(MessageService);
  readonly claimService           = inject(ClaimService);
  private readonly authService    = inject(AuthService);
  private readonly ventasService  = inject(VentasAdminService);

  private subscriptions = new Subscription();

  // ── Permisos y sede ──────────────────────────────────────────────
  readonly esAdmin:      boolean;
  readonly sedeNombre:   string;
  private readonly sedePropiaId: number | null;

  // ── Filtros ──────────────────────────────────────────────────────
  filtroEstado: ClaimStatus | null = null;
  filtroMotivo: string | null      = null;
  filtroBusqueda                   = '';
  filtroFechaInicio: Date | null   = getLunesSemanaActualPeru();
  filtroFechaFin: Date | null      = getDomingoSemanaActualPeru();
  filtroSede: number | null        = null;

  estadosOptions = [
    { label: 'Todos',      value: null },
    { label: 'Registrado', value: ClaimStatus.REGISTRADO },
    { label: 'En Proceso', value: ClaimStatus.EN_PROCESO },
    { label: 'Resuelto',   value: ClaimStatus.RESUELTO },
    { label: 'Rechazado',  value: ClaimStatus.RECHAZADO },
  ];

  motivosOptions = [
    { label: 'Todos',                     value: null },
    { label: 'Producto defectuoso',        value: 'Producto defectuoso' },
    { label: 'No funciona correctamente',  value: 'No funciona correctamente' },
    { label: 'Producto dañado',            value: 'Producto dañado' },
    { label: 'No cumple especificaciones', value: 'No cumple especificaciones' },
    { label: 'Piezas faltantes',           value: 'Piezas faltantes' },
    { label: 'Otro motivo',                value: 'Otro motivo' },
  ];

  sedesOptions: { label: string; value: number | null }[] = [];

  paginaActual = signal<number>(1);
  limitePagina = signal<number>(5);

  constructor() {
    const user        = this.authService.getCurrentUser();
    this.esAdmin      = this.authService.getRoleId() === UserRole.ADMIN;
    this.sedeNombre   = user?.sedeNombre || 'Sede Desconocida';
    this.sedePropiaId = user?.idSede ?? null;
    this.filtroSede   = this.sedePropiaId;
  }

  // ── Lifecycle ────────────────────────────────────────────────────
  async ngOnInit(): Promise<void> {
    if (this.esAdmin) {
      await this.cargarSedes();
    } else {
      await this.cargarClaimsConSede(this.sedePropiaId);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    if (this.pollingInterval) clearInterval(this.pollingInterval);
  }

  // ── Carga de sedes ────────────────────────────────────────────────
  private cargarSedes(): Promise<void> {
    return new Promise((resolve) => {
      const sub = this.ventasService.obtenerSedes().subscribe({
        next: (data: any[]) => {
          const activas       = data.filter((s) => s.activo);
          const sedePropiaObj = activas.find((s) => s.id_sede === this.sedePropiaId);
          const ordenadas     = sedePropiaObj
            ? [sedePropiaObj, ...activas.filter((s) => s.id_sede !== this.sedePropiaId)]
            : activas;

          this.sedesOptions = [
            { label: 'Todas las sedes', value: null },
            ...ordenadas.map((s) => ({ label: s.nombre, value: s.id_sede })),
          ];

          this.filtroSede = this.sedePropiaId;
          this.cdr.markForCheck();
          resolve();
          this.cargarClaimsConSede(this.sedePropiaId);
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar las sedes', life: 3000 });
          resolve();
          this.cargarClaimsConSede(this.sedePropiaId);
        },
      });
      this.subscriptions.add(sub);
    });
  }

  private async cargarClaimsConSede(sedeId: number | null): Promise<void> {
    const id = (sedeId ?? this.sedePropiaId)?.toString();
    if (!id) {
      this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: 'No se encontró la sede del usuario actual.', life: 3000 });
      return;
    }
    try {
      await this.claimService.loadClaims(id);
    } catch {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los reclamos', life: 3000 });
    }
  }

  async onCambiarSede(): Promise<void> {
    this.paginaActual.set(1);
    await this.cargarClaimsConSede(this.filtroSede);
  }

  // ── Filtrado local ────────────────────────────────────────────────
  get reclamosFiltrados(): ClaimResponseDto[] {
    const q     = this.filtroBusqueda.toLowerCase().trim();
    const desde = this.filtroFechaInicio ? new Date(this.filtroFechaInicio).setHours(0, 0, 0, 0)    : null;
    const hasta = this.filtroFechaFin    ? new Date(this.filtroFechaFin).setHours(23, 59, 59, 999)  : null;

    return this.claimService.claims().filter((c) => {
      const matchQ     = !q || (c.saleReceiptId?.toLowerCase().includes(q)) || (c.description?.toLowerCase().includes(q));
      const matchEst   = !this.filtroEstado || c.status === this.filtroEstado;
      const matchMot   = !this.filtroMotivo || c.reason === this.filtroMotivo;
      const fechaReg   = c.registerDate ? new Date(c.registerDate).getTime() : null;
      const matchDesde = !desde || (fechaReg !== null && fechaReg >= desde);
      const matchHasta = !hasta || (fechaReg !== null && fechaReg <= hasta);
      return matchQ && matchEst && matchMot && matchDesde && matchHasta;
    });
  }

  get reclamosPaginados(): ClaimResponseDto[] {
    const desde = (this.paginaActual() - 1) * this.limitePagina();
    return this.reclamosFiltrados.slice(desde, desde + this.limitePagina());
  }

  get totalFiltrados(): number { return this.reclamosFiltrados.length; }
  get totalPaginas():   number { return Math.ceil(this.totalFiltrados / this.limitePagina()) || 1; }

  onPageChange(page: number):   void { this.paginaActual.set(page); }
  onLimitChange(limit: number): void { this.limitePagina.set(limit); this.paginaActual.set(1); }

  // ── Navegación ────────────────────────────────────────────────────
  nuevoReclamo(): void            { this.router.navigate([`${this.routeBase}/crear`]);       }
  verDetalle(id: string): void    { this.router.navigate([`${this.routeBase}/detalle`, id]); }
  editarReclamo(id: string): void { this.router.navigate([`${this.routeBase}/editar`, id]);  }

  verDetalleComprobante(reclamo: ClaimResponseDto): void {
    this.detalleComprobanteLoading.set(true);
    this.detalleComprobanteVisible.set(true);
    const sub = this.ventasService.getDetalleCompleto(Number(reclamo.saleReceiptId), 1).subscribe({
      next:  (data) => { this.detalleComprobanteData.set(data); this.detalleComprobanteLoading.set(false); },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar el detalle del comprobante', life: 3000 });
        this.detalleComprobanteLoading.set(false);
      },
    });
    this.subscriptions.add(sub);
  }

  irADetalleVenta(saleReceiptId: string): void {
    this.detalleComprobanteVisible.set(false);
    this.router.navigate(['/admin/detalles-ventas-administracion', saleReceiptId]);
  }

  get detalleComprobanteId(): string {
    return this.detalleComprobanteData()?.id_comprobante?.toString() || '';
  }

  // ── Acciones dialog ───────────────────────────────────────────────
  abrirAcciones(reclamo: ClaimResponseDto): void {
    this.reclamoAcciones = reclamo;
    this.accionesConfig  = {
      titulo:         `Reclamo #${reclamo.id}`,
      subtitulo:      `Comp. #${reclamo.saleReceiptId}`,
      labelPdf:       'PDF Reclamo',
      mostrarVoucher: false,
      mostrarWsp:     true,
      mostrarEmail:   true,
    };
    this.accionCargando  = null;
    this.accionesVisible = true;
  }

  onAccion(accion: AccionComprobante): void {
    const r = this.reclamoAcciones!;

    switch (accion) {
      // ── WhatsApp ─────────────────────────────────────────────────
      case 'wsp':
        this.accionesVisible = false;
        this.abrirDialogWsp(r);
        break;

      // ── Email ─────────────────────────────────────────────────────
      case 'email':
        this.accionCargando = 'email';
        this.claimService.sendByEmail(r.id).subscribe({
          next: (res) => {
            this.accionCargando  = null;
            this.accionesVisible = false;
            this.messageService.add({ severity: 'success', summary: 'Email enviado', detail: `Enviado a ${res.sentTo}`, life: 4000 });
          },
          error: (err) => {
            this.accionCargando  = null;
            this.accionesVisible = false;
            this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.error?.message ?? 'No se pudo enviar el email.', life: 3000 });
          },
        });
        break;

      // ── PDF ───────────────────────────────────────────────────────
      case 'pdf-imprimir':
      case 'pdf-descargar':
        this.accionCargando = accion;
        const sub = this.claimService.imprimirReclamo(r.id).subscribe({
          next: (blob: Blob) => {
            const url = window.URL.createObjectURL(blob);
            if (accion === 'pdf-imprimir') {
              window.open(url, '_blank');
            } else {
              const a = document.createElement('a');
              a.href     = url;
              a.download = `Reclamo_REC-${r.id}.pdf`;
              a.click();
            }
            setTimeout(() => window.URL.revokeObjectURL(url), 1000);
            this.accionCargando  = null;
            this.accionesVisible = false;
          },
          error: () => {
            this.accionCargando  = null;
            this.accionesVisible = false;
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo generar el PDF', life: 3000 });
          },
        });
        this.subscriptions.add(sub);
        break;
    }
  }

  // ── Dialog WhatsApp ───────────────────────────────────────────────
  abrirDialogWsp(reclamo: ClaimResponseDto): void {
    this.reclamoWsp       = reclamo;
    this.mostrarDialogWsp = true;
    this.wspReady         = false;
    this.wspQr            = null;
    this.verificarEstadoWsp();
  }

  cerrarDialogWsp(): void {
    this.mostrarDialogWsp = false;
    this.reclamoWsp       = null;
    this.wspReady         = false;
    this.wspQr            = null;
    if (this.pollingInterval) { clearInterval(this.pollingInterval); this.pollingInterval = null; }
  }

  private verificarEstadoWsp(): void {
    this.claimService.getWhatsAppStatus().subscribe({
      next: (res) => {
        this.wspReady = res.ready;
        this.wspQr    = res.qr ?? null;
        if (!res.ready) {
          this.pollingInterval = setInterval(() => {
            this.claimService.getWhatsAppStatus().subscribe({
              next: (r) => {
                this.wspReady = r.ready;
                this.wspQr    = r.qr ?? null;
                if (r.ready) { clearInterval(this.pollingInterval); this.pollingInterval = null; }
              },
            });
          }, 3000);
        }
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo conectar con WhatsApp.', life: 4000 }),
    });
  }

  enviarPorWsp(): void {
    if (!this.reclamoWsp) return;
    this.enviandoWsp = true;
    this.claimService.sendByWhatsApp(this.reclamoWsp.id).subscribe({
      next: (res) => {
        this.enviandoWsp = false;
        this.cerrarDialogWsp();
        this.messageService.add({ severity: 'success', summary: '¡Enviado!', detail: `Enviado a ${res.sentTo}`, life: 5000 });
      },
      error: (err: any) => {
        this.enviandoWsp = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.error?.message ?? 'No se pudo enviar.', life: 5000 });
      },
    });
  }

  // ── Limpieza ──────────────────────────────────────────────────────
  limpiarFiltros(): void {
    this.filtroEstado      = null;
    this.filtroMotivo      = null;
    this.filtroBusqueda    = '';
    this.filtroFechaInicio = null;
    this.filtroFechaFin    = null;
    this.filtroSede        = null;
    this.paginaActual.set(1);
    this.cargarClaimsConSede(this.sedePropiaId);
  }

  // ── Helpers ───────────────────────────────────────────────────────
  getStatusLabel(status: ClaimStatus)    { return this.claimService.getStatusLabel(status);         }
  getStatusSeverity(status: ClaimStatus) { return this.claimService.getStatusSeverity(status);      }
  formatDate(iso: string)                { return this.claimService.formatDate(iso);                }
  diasDesde(iso: string)                 { return this.claimService.calcularDiasDesdeRegistro(iso); }

  getTipoComprobanteLabel(data: SalesReceiptDetalleCompletoDto): string {
    const tipo = data.tipo_comprobante ?? '';
    return tipo.toUpperCase().includes('BOLETA') || tipo === '03' ? 'BOLETA' : 'FACTURA';
  }

  getTipoDocumentoLabel(data: SalesReceiptDetalleCompletoDto): string {
    const tipo = data.cliente?.tipo_documento ?? '';
    if (tipo.includes('RUC'))       return 'RUC';
    if (tipo.includes('DNI'))       return 'DNI';
    if (tipo.includes('PASAPORTE')) return 'PASAPORTE';
    return tipo || 'DOC';
  }

  private get routeBase(): string {
    return this.router.url.includes('/admin')
      ? '/admin/reclamos-listado'
      : '/ventas/reclamos-listado';
  }
}