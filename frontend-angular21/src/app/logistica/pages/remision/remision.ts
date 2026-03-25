import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { Button } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { Select } from 'primeng/select';
import { Card } from 'primeng/card';
import { DatePicker } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { RemissionService } from '../../services/remission.service';
import {
  RemissionResponse,
  RemissionSummaryResponse,
  RemisionPaginatedResponse,
} from '../../interfaces/remision.interface';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { LoadingOverlayComponent } from '../../../shared/components/loading-overlay/loading-overlay.component';
import { PaginadorComponent } from '../../../shared/components/paginador/paginador.components';

// Utils
import {
  getLunesSemanaActualPeru,
  getDomingoSemanaActualPeru,
} from '../../../shared/utils/date-peru.utils';

// Auth
import { AuthService } from '../../../auth/services/auth.service';
import { UserRole } from '../../../core/constants/roles.constants';
import { VentasAdminService } from '../../../administracion/services/ventas.service';
import { SedeAdmin } from '../../../administracion/interfaces/ventas.interface';

@Component({
  selector: 'app-remision',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    Button,
    Tag,
    TableModule,
    Card,
    DatePicker,
    Select,
    InputTextModule,
    ToastModule,
    ConfirmDialogModule,
    LoadingOverlayComponent,
    PaginadorComponent,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './remision.html',
  styleUrl: './remision.css',
})
export class Remision implements OnInit {
  private readonly router = inject(Router);
  private readonly remissionService = inject(RemissionService);
  private readonly authService = inject(AuthService);
  private readonly ventasService = inject(VentasAdminService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  // ── Auth / Sede ───────────────────────────────────────────────────
  readonly esAdmin: boolean;
  readonly sedeNombre: string;
  private readonly sedePropiaId: number | null;

  sedesOpciones: { label: string; value: number | null }[] = [];

  // ── Opciones ──────────────────────────────────────────────────────
  opcionesEstado = [
    { label: 'Todos',       value: null },
    { label: 'Emitido',     value: 'EMITIDO' },
    { label: 'En Camino',   value: 'EN_CAMINO' },
    { label: 'Entregado',   value: 'ENTREGADO' },
    { label: 'Anulado',     value: 'ANULADO' },
    { label: 'Rechazado',   value: 'RECHAZADO' },
  ];

  // ── Estado tabla ──────────────────────────────────────────────────
  remisiones = signal<RemissionResponse[]>([]);
  totalRecords = signal<number>(0);
  loading = signal<boolean>(false);

  paginaActual = signal<number>(1);
  limitePagina = signal<number>(10);
  totalPaginas = computed(() => Math.ceil(this.totalRecords() / this.limitePagina()));

  // ── Filtros ───────────────────────────────────────────────────────
  filtroTexto = signal<string>('');
  filtroEstado = signal<string | null>(null);
  filtroFechaInicio = signal<Date | null>(getLunesSemanaActualPeru());
  filtroFechaFin = signal<Date | null>(getDomingoSemanaActualPeru());
  filtroSede = signal<number | null>(null);

  // ── Resumen ───────────────────────────────────────────────────────
  resumen = signal<RemissionSummaryResponse>({
    totalMes: 0,
    enTransito: 0,
    entregadas: 0,
    observadas: 0,
  });

  // ── Constructor ───────────────────────────────────────────────────
  constructor() {
    const user = this.authService.getCurrentUser();
    this.esAdmin = this.authService.getRoleId() === UserRole.ADMIN;
    this.sedeNombre = user?.sedeNombre ?? 'Mi sede';
    this.sedePropiaId = user?.idSede ?? null;
  }

  // ── Lifecycle ─────────────────────────────────────────────────────
  ngOnInit(): void {
    if (this.esAdmin) {
      this.filtroSede.set(null); 
      this.cargarSedes();
    } else {
      this.filtroSede.set(this.sedePropiaId);
      this.cargarDatos();
      this.cargarResumen();
    }
  }

  // ── Carga de sedes ────────────────────────────────────────────────
  private cargarSedes(): void {
    this.ventasService.obtenerSedes().subscribe({
      next: (data: SedeAdmin[]) => {
        const activas = data.filter((s) => s.activo);
        this.sedesOpciones = [
          { label: 'Todas las sedes', value: null },
          ...activas.map((s) => ({ label: s.nombre, value: s.id_sede })),
        ];
        this.cargarDatos();
        this.cargarResumen();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar las sedes',
          life: 3000,
        });
        this.cargarDatos();
        this.cargarResumen();
      },
    });
  }

  // ── Carga de datos ────────────────────────────────────────────────
  cargarDatos(): void {
    this.loading.set(true);

    const inicio = this.filtroFechaInicio();
    const fin = this.filtroFechaFin();

    let startDate: string | undefined;
    let endDate: string | undefined;

    if (inicio) startDate = inicio.toISOString();
    if (fin) {
      const finCopia = new Date(fin);
      finCopia.setHours(23, 59, 59, 999);
      endDate = finCopia.toISOString();
    }

    this.remissionService
      .getRemisiones(
        this.paginaActual(),
        this.limitePagina(),
        this.filtroTexto() || undefined,
        this.filtroEstado() ?? undefined,
        startDate,
        endDate,
        this.filtroSede(),
      )
      .subscribe({
        next: (res: RemisionPaginatedResponse) => {
          this.remisiones.set(res.data);
          this.totalRecords.set(Number(res.total));
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Error al cargar remisiones:', err);
          this.loading.set(false);
        },
      });
  }

  cargarResumen(): void {
    const inicio = this.filtroFechaInicio();
    const fin = this.filtroFechaFin();

    let startDate: string | undefined;
    let endDate: string | undefined;

    if (inicio) startDate = inicio.toISOString();
    if (fin) {
      const finCopia = new Date(fin);
      finCopia.setHours(23, 59, 59, 999);
      endDate = finCopia.toISOString();
    }
    this.remissionService.getRemissionSummary(this.filtroSede(), startDate, endDate).subscribe({
      next: (data: RemissionSummaryResponse) => this.resumen.set(data),
      error: (err) => console.error('Error cargando el resumen', err),
    });
  }

  // ── Paginación y Filtros ──────────────────────────────────────────
  onPageChange(page: number): void {
    this.paginaActual.set(page);
    this.cargarDatos();
  }

  onLimitChange(limit: number): void {
    this.limitePagina.set(limit);
    this.paginaActual.set(1);
    this.cargarDatos();
  }

  aplicarFiltros(): void {
    if (!this.esAdmin) {
      this.filtroSede.set(this.sedePropiaId);
    }
    this.paginaActual.set(1);
    this.cargarDatos();
    this.cargarResumen();
  }

  limpiarFiltros(): void {
    this.filtroTexto.set('');
    this.filtroEstado.set(null);
    this.filtroFechaInicio.set(getLunesSemanaActualPeru());
    this.filtroFechaFin.set(getDomingoSemanaActualPeru());

    if (this.esAdmin) {
      this.filtroSede.set(null);
    } else {
      this.filtroSede.set(this.sedePropiaId);
    }

    this.paginaActual.set(1);
    this.cargarDatos();
    this.cargarResumen();
  }

  // ── Navegación y Acciones ─────────────────────────────────────────
  abrirFormulario(): void {
    this.router.navigate(['/logistica/remision/nueva']);
  }

  verDetalles(idGuia: string): void {
    this.router.navigate(['/logistica/remision/detalle', idGuia]);
  }

  actualizarEstado(remision: RemissionResponse, nuevoEstado: string): void {
    let accionTexto = '';
    if (nuevoEstado === 'EN_CAMINO') accionTexto = 'iniciar el traslado';
    if (nuevoEstado === 'ENTREGADO') accionTexto = 'confirmar la entrega';
    if (nuevoEstado === 'RECHAZADO') accionTexto = 'rechazar';

    this.confirmationService.confirm({
      message: `¿Estás seguro de ${accionTexto} de la guía #${remision.id_comprobante_ref || 'S/N'}?`,
      header: 'Confirmar Actualización',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, continuar',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.loading.set(true);
        this.remissionService.cambiarEstado(remision.id_guia, nuevoEstado).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: `Estado actualizado a ${nuevoEstado}` });
            this.cargarDatos();
            this.cargarResumen();
          },
          error: (err) => {
            console.error('Error actualizando estado:', err);
            this.loading.set(false);
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar el estado de la guía' });
          }
        });
      }
    });
  }
}