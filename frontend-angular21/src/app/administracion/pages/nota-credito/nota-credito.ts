import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  ChangeDetectorRef,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

// PrimeNG
import { Card }          from 'primeng/card';
import { Button }        from 'primeng/button';
import { Select }        from 'primeng/select';
import { TableModule }   from 'primeng/table';
import { Tag }           from 'primeng/tag';
import { Toast }         from 'primeng/toast';
import { Dialog }        from 'primeng/dialog';
import { DatePicker }    from 'primeng/datepicker';
import { Tooltip }       from 'primeng/tooltip';
import { InputText }     from 'primeng/inputtext';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ConfirmDialog } from 'primeng/confirmdialog';

// Shared
import { SharedTableContainerComponent } from '../../../shared/components/table.componente/shared-table-container.component';

// Utils
import {
  getLunesSemanaActualPeru,
  getDomingoSemanaActualPeru,
} from '../../../shared/utils/date-peru.utils';

// Services
import {
  CreditNoteService,
  CreditNoteSummary,
  CreditNoteDetail,
  CreditNoteFilter,
  AnnulCreditNoteDto,
} from '../../services/nota-credito.service';
import { VentasAdminService } from '../../services/ventas.service';
import { AuthService }        from '../../../auth/services/auth.service';
import { UserRole }           from '../../../core/constants/roles.constants';
import { SedeAdmin }          from '../../interfaces/ventas.interface';


@Component({
  selector: 'app-notas-credito',
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
    Dialog,
    DatePicker,
    Tooltip,
    InputText,
    SharedTableContainerComponent,
    ConfirmDialog,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './nota-credito.html',
  styleUrl:    './nota-credito.css',
})
export class NotasCreditoComponent implements OnInit, OnDestroy {
  // ── Inyecciones ──────────────────────────────────────────────────
  private readonly router            = inject(Router);
  private readonly creditNoteService = inject(CreditNoteService);
  private readonly ventasService     = inject(VentasAdminService);
  private readonly authService       = inject(AuthService);
  private readonly messageService    = inject(MessageService);
  private readonly cdr               = inject(ChangeDetectorRef);

  private subscriptions = new Subscription();

  readonly tituloKicker    = 'VENTAS';
  readonly subtituloKicker = 'NOTAS DE CRÉDITO';
  readonly iconoCabecera   = 'pi pi-file-edit';

  // ── Auth / Sede ───────────────────────────────────────────────────
  readonly esAdmin: boolean;
  readonly sedeNombre: string;
  private readonly sedePropiaId: number | null;

  // ── Sedes (solo admin) ────────────────────────────────────────────
  sedesOpciones: { label: string; value: number | null }[] = [];

  // ── Estado tabla ─────────────────────────────────────────────────
  notas: CreditNoteSummary[] = [];
  loading = false;

  paginaActual    = 1;
  limitePorPagina = 5;
  totalRegistros  = 0;
  totalPaginas    = 0;

  // ── Filtros ───────────────────────────────────────────────────────
  readonly estadosOpciones = [
    { label: 'Todos',     value: null },
    { label: 'Emitida',   value: 'EMITIDA' },
    { label: 'Aceptada',  value: 'ACEPTADA' },
    { label: 'Observada', value: 'OBSERVADA' },
    { label: 'Rechazada', value: 'RECHAZADA' },
    { label: 'Revertida', value: 'REVERTIDA' },
  ];

  filtroEstado:      string | null = null;
  filtroSerie:       string        = '';
  filtroDoc:         string        = '';
  filtroFechaInicio: Date | null   = getLunesSemanaActualPeru();  // ← lunes de la semana actual
  filtroFechaFin:    Date | null   = getDomingoSemanaActualPeru(); // ← domingo de la semana actual
  filtroSede:        number | null = null;

  // ── Dialog detalle ────────────────────────────────────────────────
  detalleVisible  = false;
  detalleLoading  = false;
  detalleActual: CreditNoteDetail | null = null;

  // ── Dialog anular ─────────────────────────────────────────────────
  anularVisible  = false;
  anularLoading  = signal(false);
  anularMotivo   = '';
  anularIdActual: number | null = null;

  // ── Constructor ───────────────────────────────────────────────────
  constructor() {
    const user        = this.authService.getCurrentUser();
    this.esAdmin      = this.authService.getRoleId() === UserRole.ADMIN;
    this.sedeNombre   = user?.sedeNombre ?? 'Mi sede';
    this.sedePropiaId = user?.idSede ?? null;
  }

  // ── Lifecycle ─────────────────────────────────────────────────────
  ngOnInit(): void {
    this.filtroSede = this.sedePropiaId;

    if (this.esAdmin) {
      this.cargarSedes();
    } else {
      this.cargarNotas();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  // ── Carga de sedes ────────────────────────────────────────────────
  private cargarSedes(): void {
    const sub = this.ventasService.obtenerSedes().subscribe({
      next: (data: SedeAdmin[]) => {
        const activas = data.filter(s => s.activo);
        this.sedesOpciones = [
          { label: 'Todas las sedes', value: null },
          ...activas.map(s => ({ label: s.nombre, value: s.id_sede })),
        ];
        this.cdr.markForCheck();
        this.cargarNotas();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary:  'Error',
          detail:   'No se pudieron cargar las sedes',
          life:     3000,
        });
        this.cargarNotas();
      },
    });
    this.subscriptions.add(sub);
  }

  // ── Carga de notas ────────────────────────────────────────────────
  cargarNotas(): void {
    this.loading = true;

    const filters: CreditNoteFilter = {
      page:  this.paginaActual,
      limit: this.limitePorPagina,
      ...(this.filtroEstado        && { status:           this.filtroEstado }),
      ...(this.filtroSede != null  && { sedeId:           this.filtroSede }),
      ...(this.filtroSerie.trim()  && { serie:            this.filtroSerie.trim() }),
      ...(this.filtroDoc.trim()    && { customerDocument: this.filtroDoc.trim() }),
      ...(this.filtroFechaInicio   && { startDate:        this.formatDate(this.filtroFechaInicio) }),
      ...(this.filtroFechaFin      && { endDate:          this.formatDate(this.filtroFechaFin) }),
    };

    const sub = this.creditNoteService.listar(filters).subscribe({
      next: (res: any) => {
        this.notas          = res.data ?? [];
        this.totalRegistros = res.total ?? 0;
        this.totalPaginas   = Math.ceil(this.totalRegistros / this.limitePorPagina);
        this.loading        = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary:  'Error',
          detail:   'No se pudieron cargar las notas de crédito',
          life:     3000,
        });
        this.cdr.markForCheck();
      },
    });
    this.subscriptions.add(sub);
  }

  // ── Navegación ────────────────────────────────────────────────────
  generarNotaCredito(): void {
    this.router.navigate(['/admin/nota-credito/crear']);
  }

  // ── Filtros y Paginación ──────────────────────────────────────────
  aplicarFiltros(): void {
    if (!this.esAdmin) {
      this.filtroSede = this.sedePropiaId;
    }
    this.paginaActual = 1;
    this.cargarNotas();
  }

  limpiarFiltros(): void {
    this.filtroEstado      = null;
    this.filtroSerie       = '';
    this.filtroDoc         = '';
    this.filtroFechaInicio = getLunesSemanaActualPeru();   // ← resetea al lunes de esta semana
    this.filtroFechaFin    = getDomingoSemanaActualPeru(); // ← resetea al domingo de esta semana
    this.filtroSede        = this.sedePropiaId;
    this.aplicarFiltros();
  }

  onPageChange(page: number): void {
    this.paginaActual = page;
    this.cargarNotas();
  }

  onLimitChange(limit: number): void {
    this.limitePorPagina = limit;
    this.paginaActual    = 1;
    this.cargarNotas();
  }

  // ── Exportar Excel ────────────────────────────────────────────────
  exportarExcel(): void {
    this.messageService.add({
      severity: 'info',
      summary:  'Exportando',
      detail:   'Generando archivo Excel...',
    });

    const filters: CreditNoteFilter = {
      ...(this.filtroEstado        && { status:           this.filtroEstado }),
      ...(this.filtroSede != null  && { sedeId:           this.filtroSede }),
      ...(this.filtroSerie         && { serie:            this.filtroSerie.trim() }),
      ...(this.filtroDoc           && { customerDocument: this.filtroDoc.trim() }),
      ...(this.filtroFechaInicio   && { startDate:        this.formatDate(this.filtroFechaInicio) }),
      ...(this.filtroFechaFin      && { endDate:          this.formatDate(this.filtroFechaFin) }),
    };

    const sub = this.creditNoteService.exportarExcel(filters).subscribe({
      next: (blob: Blob) => {
        const url  = window.URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href     = url;
        a.download = `Notas_de_Credito_${new Date().getTime()}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        this.messageService.add({
          severity: 'success',
          summary:  'Éxito',
          detail:   'Excel descargado correctamente.',
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary:  'Error',
          detail:   'No se pudo generar el Excel.',
        });
      },
    });
    this.subscriptions.add(sub);
  }

  // ── Detalle ───────────────────────────────────────────────────────
  verDetalle(nota: CreditNoteSummary): void {
    this.detalleActual  = null;
    this.detalleLoading = true;
    this.detalleVisible = true;

    const sub = this.creditNoteService.detalle(nota.noteSummaryId).subscribe({
      next: (res: CreditNoteDetail) => {
        this.detalleActual  = res;
        this.detalleLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.detalleLoading = false;
        this.detalleVisible = false;
        this.messageService.add({
          severity: 'error',
          summary:  'Error',
          detail:   'No se pudo cargar el detalle',
          life:     3000,
        });
        this.cdr.markForCheck();
      },
    });
    this.subscriptions.add(sub);
  }

  cerrarDetalle(): void {
    this.detalleVisible = false;
    this.detalleActual  = null;
  }

  // ── Anular ────────────────────────────────────────────────────────
  abrirAnular(nota: CreditNoteSummary): void {
    this.anularIdActual = nota.noteSummaryId;
    this.anularMotivo   = '';
    this.anularVisible  = true;
  }

  confirmarAnular(): void {
    if (!this.anularMotivo.trim() || !this.anularIdActual) return;

    this.anularLoading.set(true);

    const dto: AnnulCreditNoteDto = { reason: this.anularMotivo.trim() };

    const sub = this.creditNoteService.anular(this.anularIdActual, dto).subscribe({
      next: () => {
        this.anularLoading.set(false);
        this.cerrarAnular();
        this.messageService.add({
          severity: 'success',
          summary:  'Nota anulada',
          detail:   'La nota de crédito fue anulada correctamente',
          life:     3000,
        });
        this.cargarNotas();
      },
      error: (err: any) => {
        this.anularLoading.set(false);
        this.messageService.add({
          severity: 'error',
          summary:  'Error',
          detail:   err?.error?.message ?? 'No se pudo anular la nota de crédito',
          life:     4000,
        });
        this.cdr.markForCheck();
      },
    });
    this.subscriptions.add(sub);
  }

  cerrarAnular(): void {
    this.anularVisible  = false;
    this.anularIdActual = null;
    this.anularMotivo   = '';
  }

  // ── Helpers ───────────────────────────────────────────────────────
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  getSeveridadEstado(status: string): 'success' | 'warn' | 'danger' | 'info' | 'secondary' {
    switch (status?.toUpperCase()) {
      case 'EMITIDA':   return 'info';
      case 'ACEPTADA':  return 'success';
      case 'OBSERVADA': return 'warn';
      case 'RECHAZADA': return 'danger';
      case 'REVERTIDA': return 'secondary';
      default:          return 'secondary';
    }
  }

  getSeveridadTipo(tipo: string): 'info' | 'warn' {
    return tipo === 'DEVOLUCION_PARCIAL' ? 'warn' : 'info';
  }

  getLabelTipo(tipo: string): string {
    return tipo === 'DEVOLUCION_PARCIAL' ? 'Parcial' : 'Total';
  }

  puedeAnular(status: string): boolean {
    return status === 'EMITIDA' || status === 'ACEPTADA';
  }
}