import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService, MessageService } from 'primeng/api';

import { SedeService } from '../../../../services/sede.service';
import { Headquarter } from '../../../../interfaces/sedes.interface';
import { SharedTableContainerComponent } from '../../../../../shared/components/table.componente/shared-table-container.component';
import { AuthService } from '../../../../../auth/services/auth.service';
import { UserRole } from '../../../../../core/constants/roles.constants';

type ViewMode = 'todas' | 'activas' | 'inactivas';

@Component({
  selector: 'app-sedes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    CardModule,
    ButtonModule,
    AutoCompleteModule,
    TableModule,
    TagModule,
    ToastModule,
    ConfirmDialogModule,
    MessageModule,
    SelectModule,
    TooltipModule,
    SharedTableContainerComponent,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './sedes.html',
  styleUrl: './sedes.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sedes implements OnInit {
  private readonly sedeService         = inject(SedeService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService      = inject(MessageService);
  private readonly authService         = inject(AuthService);
  private readonly router              = inject(Router);
  private readonly cdr                 = inject(ChangeDetectorRef);

  readonly loadingAlmacenes = this.sedeService.loadingAlmacenes;
  readonly loading          = this.sedeService.loading;
  readonly error            = this.sedeService.error;

  readonly searchTerm = signal<string>('');
  readonly sedes      = computed(() => this.sedeService.sedes());
  readonly viewMode   = signal<ViewMode>('activas');

  readonly paginaActual = signal<number>(1);
  readonly limitePagina = signal<number>(5);

  // ── Permisos ──────────────────────────────────────────────────────
  esAdmin          = false;
  puedeCrearSede   = false;
  puedeEditarSede  = false;
  puedeVerDetalle  = false;

  readonly viewOptions: { label: string; value: ViewMode }[] = [
    { label: 'Todos',     value: 'todas'     },
    { label: 'Activas',   value: 'activas'   },
    { label: 'Inactivas', value: 'inactivas' },
  ];

  readonly visibleSedes = computed(() => {
    const mode = this.viewMode();
    const all  = this.sedes().filter(s => s && s.id_sede);
    if (mode === 'activas')   return all.filter(s => s?.activo === true);
    if (mode === 'inactivas') return all.filter(s => s?.activo === false);
    return all;
  });

  readonly filteredSedes = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const base = this.visibleSedes();
    if (!term) return base;
    return base.filter(s =>
      [s.codigo, s.nombre, s.ciudad].some(f =>
        String(f ?? '').toLowerCase().includes(term)
      )
    );
  });

  readonly sedesPaginadas = computed(() => {
    const inicio = (this.paginaActual() - 1) * this.limitePagina();
    return this.filteredSedes().slice(inicio, inicio + this.limitePagina());
  });

  readonly totalPaginas = computed(() =>
    Math.ceil(this.filteredSedes().length / this.limitePagina())
  );

  readonly sedeSuggestions = computed(() => this.filteredSedes());

  ngOnInit(): void {
    this.esAdmin         = this.authService.getRoleId() === UserRole.ADMIN;
    this.puedeCrearSede  = this.authService.hasPermiso('CREAR_SEDES');
    this.puedeEditarSede = this.authService.hasPermiso('EDITAR_SEDES');
    this.puedeVerDetalle = this.authService.hasPermiso('VER_SEDES');

    this.sedeService.loadSedes('Administrador').pipe(
      switchMap((res) => {
        const sedes = res.headquarters ?? [];
        if (sedes.length === 0) return of([]);
        return forkJoin(
          sedes.map(sede =>
            this.sedeService.loadAlmacenesParaSede(sede.id_sede).pipe(catchError(() => of(null)))
          )
        );
      })
    ).subscribe({ next: () => this.cdr.markForCheck() });
  }

  getAlmacenesRestantes(sede: Headquarter): string {
    if (!sede.almacenes || sede.almacenes.length <= 2) return '';
    return sede.almacenes.slice(2)
      .map(a => a.codigo + (a.ciudad ? ' · ' + a.ciudad : ''))
      .join('\n');
  }

  verDetalle(sede: Headquarter): void {
    this.router.navigate(['/admin/sedes', sede.id_sede]);
  }

  onViewModeChange(mode: ViewMode): void {
    this.viewMode.set(mode);
    this.paginaActual.set(1);
  }

  onSearch(event: { query: string }): void {
    this.searchTerm.set(event.query);
    this.paginaActual.set(1);
  }

  onSearchChange(term: unknown): void {
    if (typeof term === 'string') {
      this.searchTerm.set(term);
      this.paginaActual.set(1);
      return;
    }
    if (term && typeof term === 'object' && 'nombre' in (term as any)) {
      this.searchTerm.set(String((term as any).nombre ?? ''));
      this.paginaActual.set(1);
      return;
    }
    this.searchTerm.set('');
  }

  onSelectSede(event: any): void {
    this.searchTerm.set(String(event?.value?.nombre ?? ''));
    this.paginaActual.set(1);
  }

  clearSearch(): void {
    this.searchTerm.set('');
    this.paginaActual.set(1);
  }

  onPageChange(page: number): void   { this.paginaActual.set(page); }
  onLimitChange(limit: number): void { this.limitePagina.set(limit); this.paginaActual.set(1); }

  confirmToggleStatus(sede: Headquarter): void {
    const nextStatus = !sede.activo;
    this.confirmationService.confirm({
      header:      'Confirmación',
      message:     `¿Deseas ${nextStatus ? 'activar' : 'desactivar'} la sede "${sede.nombre}" (${sede.codigo})?`,
      icon:        'pi pi-exclamation-triangle',
      acceptLabel: nextStatus ? 'Activar' : 'Desactivar',
      rejectLabel: 'Cancelar',
      acceptButtonProps: { severity: (nextStatus ? 'success' : 'danger') as any },
      rejectButtonProps: { severity: 'secondary', outlined: true },
      accept: () => {
        this.sedeService.updateSedeStatus(sede.id_sede, nextStatus, 'Administrador').subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary:  nextStatus ? 'Sede activada' : 'Sede desactivada',
              detail:   `Se ${nextStatus ? 'activó' : 'desactivó'} la sede "${sede.nombre}".`,
            });
            this.cdr.markForCheck();
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary:  'Error',
              detail:   err?.error?.message ?? 'No se pudo cambiar el estado de la sede.',
            });
          },
        });
      },
    });
  }
}