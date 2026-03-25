import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef, signal } from '@angular/core';
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
    SharedTableContainerComponent,
  ],
  providers: [MessageService],
  templateUrl: './reclamos-listado.html',
  styleUrl: './reclamos-listado.css',
})
export class ReclamosListado implements OnInit, OnDestroy {
  tituloKicker    = 'VENTAS - RECLAMOS Y GARANTÍAS';
  subtituloKicker = 'GESTIÓN DE RECLAMOS';
  iconoCabecera   = 'pi pi-shield';

  private readonly router         = inject(Router);
  private readonly cdr            = inject(ChangeDetectorRef);
  private readonly messageService = inject(MessageService);
  readonly claimService           = inject(ClaimService);
  private readonly authService    = inject(AuthService);
  private readonly ventasService  = inject(VentasAdminService);

  private subscriptions = new Subscription();

  // ── Permisos y sede ──────────────────────────────────────────────
  readonly esAdmin: boolean;
  readonly sedeNombre: string;
  private readonly sedePropiaId: number | null;

  // ── Filtros ──────────────────────────────────────────────────────
  filtroEstado: ClaimStatus | null = null;
  filtroMotivo: string | null      = null;
  filtroBusqueda                   = '';
  filtroFechaInicio: Date | null   = getLunesSemanaActualPeru();
  filtroFechaFin: Date | null      = getDomingoSemanaActualPeru();
  filtroSede: number | null        = null;

  // ── Opciones selectores ──────────────────────────────────────────
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

  // ── Paginación ───────────────────────────────────────────────────
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
      await this.cargarSedes(); // cargarSedes() internamente llama a cargarClaimsConSede()
    } else {
      await this.cargarClaimsConSede(this.sedePropiaId);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  // ── Carga de sedes (solo admin) ───────────────────────────────────
  private cargarSedes(): Promise<void> {
    return new Promise((resolve) => {
      const sub = this.ventasService.obtenerSedes().subscribe({
        next: (data: any[]) => {
          const activas = data.filter((s) => s.activo);

          // Sede propia siempre primero
          const sedePropiaObj = activas.find((s) => s.id_sede === this.sedePropiaId);
          const resto         = activas.filter((s) => s.id_sede !== this.sedePropiaId);
          const ordenadas     = sedePropiaObj ? [sedePropiaObj, ...resto] : activas;

          this.sedesOptions = [
            { label: 'Todas las sedes', value: null },
            ...ordenadas.map((s) => ({
              label: s.id_sede === this.sedePropiaId ? `${s.nombre}` : s.nombre,
              value: s.id_sede,
            })),
          ];

          this.filtroSede = this.sedePropiaId; // pre-selecciona sede propia
          this.cdr.markForCheck();
          resolve();

          this.cargarClaimsConSede(this.sedePropiaId);
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron cargar las sedes',
            life: 3000,
          });
          resolve();
          this.cargarClaimsConSede(this.sedePropiaId);
        },
      });
      this.subscriptions.add(sub);
    });
  }

  // ── Carga centralizada de claims ──────────────────────────────────
  private async cargarClaimsConSede(sedeId: number | null): Promise<void> {
    const id = (sedeId ?? this.sedePropiaId)?.toString();
    if (!id) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'No se encontró la sede del usuario actual.',
        life: 3000,
      });
      return;
    }
    try {
      await this.claimService.loadClaims(id);
    } catch {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudieron cargar los reclamos',
        life: 3000,
      });
    }
  }

  // ── Cambio de sede (solo admin) ───────────────────────────────────
  async onCambiarSede(): Promise<void> {
    this.paginaActual.set(1);
    await this.cargarClaimsConSede(this.filtroSede);
  }

  // ── Filtrado local ────────────────────────────────────────────────
  get reclamosFiltrados(): ClaimResponseDto[] {
    const q   = this.filtroBusqueda.toLowerCase().trim();
    const est = this.filtroEstado;
    const mot = this.filtroMotivo;

    const desde = this.filtroFechaInicio
      ? new Date(this.filtroFechaInicio).setHours(0, 0, 0, 0)
      : null;
    const hasta = this.filtroFechaFin
      ? new Date(this.filtroFechaFin).setHours(23, 59, 59, 999)
      : null;

    return this.claimService.claims().filter((c) => {
      const matchQ =
        !q ||
        (c.saleReceiptId && c.saleReceiptId.toLowerCase().includes(q)) ||
        (c.description   && c.description.toLowerCase().includes(q));

      const matchEst   = !est || c.status === est;
      const matchMot   = !mot || c.reason === mot;

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

  get totalFiltrados(): number {
    return this.reclamosFiltrados.length;
  }

  get totalPaginas(): number {
    return Math.ceil(this.totalFiltrados / this.limitePagina()) || 1;
  }

  // ── Paginador ─────────────────────────────────────────────────────
  onPageChange(page: number): void {
    this.paginaActual.set(page);
  }

  onLimitChange(limit: number): void {
    this.limitePagina.set(limit);
    this.paginaActual.set(1);
  }

  // ── Acciones ──────────────────────────────────────────────────────
  nuevoReclamo(): void            { this.router.navigate([`${this.routeBase}/crear`]);        }
  verDetalle(id: string): void    { this.router.navigate([`${this.routeBase}/detalle`, id]);  }
  editarReclamo(id: string): void { this.router.navigate([`${this.routeBase}/editar`, id]);   }

  imprimirReclamo(reclamo: ClaimResponseDto): void {
    this.messageService.add({ severity: 'info', summary: 'Imprimir', detail: 'Generando PDF...', life: 3000 });
    const sub = this.claimService.imprimirReclamo(reclamo.id).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => window.URL.revokeObjectURL(url), 1000);
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'PDF generado', life: 3000 });
      },
      error: () => this.messageService.add({
        severity: 'error', summary: 'Error', detail: 'No se pudo generar el PDF', life: 3000,
      }),
    });
    this.subscriptions.add(sub);
  }

  enviarCorreo(_reclamo: ClaimResponseDto): void {
    this.messageService.add({ severity: 'info', summary: 'Correo', detail: 'Enviando correo...', life: 3000 });
  }

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

  private get routeBase(): string {
    return this.router.url.includes('/admin')
      ? '/admin/reclamos-listado'
      : '/ventas/reclamos-listado';
  }
}