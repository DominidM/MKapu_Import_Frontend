import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

// PrimeNG
import { Card } from 'primeng/card';
import { Button } from 'primeng/button';
import { Select } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { Toast } from 'primeng/toast';
import { Dialog } from 'primeng/dialog';
import { DatePicker } from 'primeng/datepicker';
import { Tooltip } from 'primeng/tooltip';
import { InputText } from 'primeng/inputtext';
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
  CreditNoteSummary,
  CreditNoteFilter,
  AnnulCreditNoteDto,
  CreditNoteService,
} from '../../services/nota-credito.service';
import { VentasAdminService } from '../../services/ventas.service';
import { AuthService } from '../../../auth/services/auth.service';
import { UserRole } from '../../../core/constants/roles.constants';
import { SedeAdmin } from '../../interfaces/ventas.interface';

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
  styleUrl: './nota-credito.css',
})
export class NotasCreditoComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly creditNoteService = inject(CreditNoteService);
  private readonly ventasService = inject(VentasAdminService);
  private readonly authService = inject(AuthService);
  private readonly messageService = inject(MessageService);

  private subscriptions = new Subscription();

  readonly tituloKicker = 'VENTAS';
  readonly subtituloKicker = 'NOTAS DE CREDITO';
  readonly iconoCabecera = 'pi pi-file-edit';

  readonly esAdmin = signal<boolean>(false);
  readonly sedeNombre = signal<string>('Mi sede');
  private readonly sedePropiaId: number | null;

  sedesOpciones = signal<{ label: string; value: number | null }[]>([]);

  notas = signal<CreditNoteSummary[]>([]);
  loading = signal<boolean>(false);

  paginaActual = signal<number>(1);
  limitePorPagina = signal<number>(5);
  totalRegistros = signal<number>(0);

  totalPaginas = computed(() => Math.ceil(this.totalRegistros() / this.limitePorPagina()));

  readonly estadosOpciones = [
    { label: 'Todos', value: null },
    { label: 'Emitida', value: 'EMITIDA' },
    { label: 'Aceptada', value: 'ACEPTADA' },
    { label: 'Observada', value: 'OBSERVADA' },
    { label: 'Rechazada', value: 'RECHAZADA' },
    { label: 'Revertida', value: 'REVERTIDA' },
  ];

  filtroEstado = signal<string | null>(null);
  filtroSerie = signal<string>('');
  filtroNumDocRef = signal<string>('');
  filtroFechaInicio = signal<Date | null>(getLunesSemanaActualPeru());
  filtroFechaFin = signal<Date | null>(getDomingoSemanaActualPeru());
  filtroSede = signal<number | null>(null);

  anularVisible = signal<boolean>(false);
  anularLoading = signal<boolean>(false);
  anularMotivo = signal<string>('');
  anularIdActual = signal<number | null>(null);

  constructor() {
    const user = this.authService.getCurrentUser();
    this.esAdmin.set(this.authService.getRoleId() === UserRole.ADMIN);
    this.sedeNombre.set(user?.sedeNombre ?? 'Mi sede');
    this.sedePropiaId = user?.idSede ?? null;
  }

  ngOnInit(): void {
    this.filtroSede.set(this.sedePropiaId);

    if (this.esAdmin()) {
      this.cargarSedes();
    } else {
      this.cargarNotas();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private cargarSedes(): void {
    const sub = this.ventasService.obtenerSedes().subscribe({
      next: (data: SedeAdmin[]) => {
        const activas = data.filter((s) => s.activo);
        this.sedesOpciones.set([
          { label: 'Todas las sedes', value: null },
          ...activas.map((s) => ({ label: s.nombre, value: s.id_sede })),
        ]);
        this.cargarNotas();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar las sedes',
          life: 3000,
        });
        this.cargarNotas();
      },
    });
    this.subscriptions.add(sub);
  }

  cargarNotas(): void {
    this.loading.set(true);

    const filters: CreditNoteFilter = {
      page: this.paginaActual(),
      limit: this.limitePorPagina(),
    };

    if (this.filtroEstado()) {
      filters.status = this.filtroEstado() as string;
    }
    if (this.filtroSede() != null) {
      filters.sedeId = this.filtroSede() as number;
    }
    if (this.filtroSerie().trim()) {
      filters.serie = this.filtroSerie().trim();
    }
    if (this.filtroNumDocRef().trim()) filters.numberDocRef = this.filtroNumDocRef().trim();
    if (this.filtroFechaInicio()) {
      filters.startDate = this.formatDate(this.filtroFechaInicio()!);
    }
    if (this.filtroFechaFin()) {
      filters.endDate = this.formatDate(this.filtroFechaFin()!);
    }

    const sub = this.creditNoteService.listar(filters).subscribe({
      next: (res: any) => {
        this.notas.set(res.data ?? []);
        this.totalRegistros.set(res.total ?? 0);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar las notas de crÃƒÆ’Ã‚Â©dito',
          life: 3000,
        });
      },
    });
    this.subscriptions.add(sub);
  }

  generarNotaCredito(): void {
    this.router.navigate(['/admin/nota-credito/crear']);
  }

  aplicarFiltros(): void {
    if (!this.esAdmin()) {
      this.filtroSede.set(this.sedePropiaId);
    }
    this.paginaActual.set(1);
    this.cargarNotas();
  }

  limpiarFiltros(): void {
    this.filtroEstado.set(null);
    this.filtroSerie.set('');
    this.filtroNumDocRef.set('');
    this.filtroFechaInicio.set(null);
    this.filtroFechaFin.set(null);
    this.filtroSede.set(null);
    this.aplicarFiltros();
  }

  onPageChange(page: number): void {
    this.paginaActual.set(page);
    this.cargarNotas();
  }

  onLimitChange(limit: number): void {
    this.limitePorPagina.set(limit);
    this.paginaActual.set(1);
    this.cargarNotas();
  }

  exportarExcel(): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Exportando',
      detail: 'Generando archivo Excel...',
    });

    const filters: CreditNoteFilter = {};

    if (this.filtroEstado()) {
      filters.status = this.filtroEstado() as string;
    }
    if (this.filtroSede() != null) {
      filters.sedeId = this.filtroSede() as number;
    }
    if (this.filtroSerie().trim()) {
      filters.serie = this.filtroSerie().trim();
    }
    if (this.filtroNumDocRef().trim()) {
      filters.numberDocRef = this.filtroNumDocRef().trim();
    }
    if (this.filtroFechaInicio()) {
      filters.startDate = this.formatDate(this.filtroFechaInicio()!);
    }
    if (this.filtroFechaFin()) {
      filters.endDate = this.formatDate(this.filtroFechaFin()!);
    }

    const sub = this.creditNoteService.exportarExcel(filters).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Notas_de_Credito_${new Date().getTime()}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        this.messageService.add({
          severity: 'success',
          summary: 'ÃƒÆ’Ã¢â‚¬Â°xito',
          detail: 'Excel descargado correctamente.',
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo generar el Excel.',
        });
      },
    });
    this.subscriptions.add(sub);
  }

  verDetalle(nota: CreditNoteSummary): void {
    this.router.navigate(['/admin/nota-credito', 'detalle-nota-credito', nota.noteSummaryId]);
  }

  abrirAnular(nota: CreditNoteSummary): void {
    this.anularIdActual.set(nota.noteSummaryId);
    this.anularMotivo.set('');
    this.anularVisible.set(true);
  }

  confirmarAnular(): void {
    if (!this.anularMotivo().trim() || !this.anularIdActual()) return;

    this.anularLoading.set(true);

    const dto: AnnulCreditNoteDto = { reason: this.anularMotivo().trim() };

    const sub = this.creditNoteService.anular(this.anularIdActual()!, dto).subscribe({
      next: () => {
        this.anularLoading.set(false);
        this.cerrarAnular();
        this.messageService.add({
          severity: 'success',
          summary: 'Nota anulada',
          detail: 'La nota de crÃƒÆ’Ã‚Â©dito fue anulada correctamente',
          life: 3000,
        });
        this.cargarNotas();
      },
      error: (err: any) => {
        this.anularLoading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err?.error?.message ?? 'No se pudo anular la nota de crÃƒÆ’Ã‚Â©dito',
          life: 4000,
        });
      },
    });
    this.subscriptions.add(sub);
  }

  cerrarAnular(): void {
    this.anularVisible.set(false);
    this.anularIdActual.set(null);
    this.anularMotivo.set('');
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  getSeveridadEstado(status: string): 'success' | 'warn' | 'danger' | 'info' | 'secondary' {
    switch (status?.toUpperCase()) {
      case 'EMITIDA':
        return 'info';
      case 'ACEPTADA':
        return 'success';
      case 'OBSERVADA':
        return 'warn';
      case 'RECHAZADA':
        return 'danger';
      case 'REVERTIDA':
        return 'secondary';
      default:
        return 'secondary';
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