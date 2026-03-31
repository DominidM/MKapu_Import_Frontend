import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageModule } from 'primeng/message';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { ConfirmationService, MessageService } from 'primeng/api';

import { ClienteService, Customer } from '../../../../services/cliente.service';
import { SharedTableContainerComponent } from '../../../../../shared/components/table.componente/shared-table-container.component';
import { AuthService } from '../../../../../auth/services/auth.service';
import { UserRole } from '../../../../../core/constants/roles.constants';

type ViewMode = 'todas' | 'juridica' | 'natural';
type StatusFilter = 'activos' | 'inactivos' | 'todos';

@Component({
  selector: 'app-clientes',
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
    DialogModule,
    SharedTableContainerComponent,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './clientes.html',
  styleUrl: './clientes.css',
})
export class Clientes implements OnInit {
  private readonly clienteService      = inject(ClienteService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService      = inject(MessageService);
  private readonly destroyRef          = inject(DestroyRef);
  private readonly authService         = inject(AuthService);

  // ── stream de búsqueda con debounce ──────────────────────────────
  private readonly searchInput$ = new Subject<string>();

  readonly loading = this.clienteService.loading;
  readonly error   = this.clienteService.error;

  readonly page         = signal<number>(1);
  readonly rows         = signal<number>(5);
  readonly searchTerm   = signal<string>('');
  readonly autoTerm     = signal<string>('');
  readonly viewMode     = signal<ViewMode>('todas');
  readonly statusFilter = signal<StatusFilter>('activos');
  readonly suggestions  = signal<Customer[]>([]);

  readonly customers   = computed(() => this.clienteService.customers());
  readonly totalItems  = computed(() => this.clienteService.total());
  readonly totalPaginas = computed(() => Math.ceil(this.totalItems() / this.rows()) || 1);

  readonly viewOptions: { label: string; value: ViewMode }[] = [
    { label: 'Todos',     value: 'todas'    },
    { label: 'Jurídica',  value: 'juridica' },
    { label: 'Natural',   value: 'natural'  },
  ];

  readonly statusOptions: { label: string; value: StatusFilter }[] = [
    { label: 'Activos',   value: 'activos'   },
    { label: 'Inactivos', value: 'inactivos' },
    { label: 'Todos',     value: 'todos'     },
  ];

  selectedClient = signal<Customer | null>(null);
  showDetails    = signal<boolean>(false);

  // ── Permisos ──────────────────────────────────────────────────────
  esAdmin               = false;
  puedeCrearCliente     = false; // CREAR_CLIENTE      → botón "Agregar Cliente"
  puedeEditarCliente    = false; // EDITAR_CLIENTE     → botón lápiz + editar en modal
  puedeVerDetalle       = false; // VER_CLIENTE        → botón ojo
  puedeSeguimiento      = false; // SEGUIMIENTO-CLIENTE → botón gráfica
  // desactivar/activar → solo esAdmin

  private readonly docTypeMap: Record<string, string> = {
    '00': 'OTROS',
    '01': 'DNI',
    '04': 'C.E.',
    '06': 'RUC',
    '07': 'PASAPORTE',
  };

  ngOnInit(): void {
    // ── Resolver permisos ─────────────────────────────────────────
    this.esAdmin            = this.authService.getRoleId() === UserRole.ADMIN;
    this.puedeCrearCliente  = this.authService.hasPermiso('CREAR_CLIENTE');
    this.puedeEditarCliente = this.authService.hasPermiso('EDITAR_CLIENTE');
    this.puedeVerDetalle    = this.authService.hasPermiso('VER_CLIENTE');
    this.puedeSeguimiento   = this.authService.hasPermiso('SEGUIMIENTO-CLIENTE');

    this.cargar();
    this.initSuggestSearch();
  }

  // ── debounce → backend suggest ────────────────────────────────────
  private initSuggestSearch(): void {
    this.searchInput$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((q) => {
          if (!q || q.length < 2) { this.suggestions.set([]); return of([]); }
          return this.clienteService.suggestCustomers(q, 7);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((results) => this.suggestions.set(results));
  }

  private cargar(): void {
    const status = this.statusFilter();
    const mode   = this.viewMode();
    this.clienteService.loadCustomers({
      page:   this.page(),
      limit:  this.rows(),
      search: this.searchTerm().trim() || undefined,
      status: status === 'activos' ? true : status === 'inactivos' ? false : undefined,
      tipo:   mode !== 'todas' ? mode : undefined,
    }).subscribe();
  }

  getDocTypeLabel(code: string): string { return this.docTypeMap[code] ?? 'DOC'; }

  isCompany(code?: string, razonsocial?: string | null): boolean {
    if (razonsocial && String(razonsocial).trim().length > 0) return true;
    return code === '06';
  }

  getDisplayName(c: Customer): string {
    if (c.razonsocial?.trim()) return c.razonsocial.trim();
    return [c.name, c.apellidos].filter(Boolean).join(' ').trim() || c.documentValue || '—';
  }

  getPhoneDisplay(c: Customer): string { return c.phone ?? '---'; }

  getCustomerTypeLabel(c: Customer): string {
    return this.isCompany(c.documentTypeSunatCode, c.razonsocial) ? 'JURÍDICA' : 'NATURAL';
  }

  // ── autocomplete handlers ─────────────────────────────────────────
  onAutoChange(value: unknown): void {
    if (typeof value === 'string') {
      this.autoTerm.set(value);
      this.searchInput$.next(value.trim());
      return;
    }
    if (value && typeof value === 'object') {
      this.autoTerm.set(String((value as any).displayName ?? (value as any).documentValue ?? ''));
      return;
    }
    this.autoTerm.set('');
    this.suggestions.set([]);
  }

  onAutoComplete(event: any): void {
    const q = String(event?.query ?? '');
    this.autoTerm.set(q);
    this.searchInput$.next(q.trim());
  }

  onSelectCliente(event: any): void {
    const selected: Customer | undefined = event?.value;
    if (!selected) return;
    this.searchTerm.set(selected.documentValue ?? '');
    this.autoTerm.set(this.getDisplayName(selected));
    this.suggestions.set([]);
    this.page.set(1);
    this.cargar();
  }

  confirmAutoSearch(): void {
    this.searchTerm.set(this.autoTerm().trim());
    this.suggestions.set([]);
    this.page.set(1);
    this.cargar();
  }

  onViewModeChange(mode: ViewMode): void  { this.viewMode.set(mode);   this.page.set(1); this.cargar(); }
  onStatusFilterChange(s: StatusFilter): void { this.statusFilter.set(s); this.page.set(1); this.cargar(); }
  onPageChange(page: number): void        { this.page.set(page);  this.cargar(); }
  onLimitChange(limit: number): void      { this.rows.set(limit); this.page.set(1); this.cargar(); }

  clearSearch(): void {
    this.searchTerm.set('');
    this.autoTerm.set('');
    this.suggestions.set([]);
    this.viewMode.set('todas');
    this.statusFilter.set('activos');
    this.page.set(1);
    this.cargar();
  }

  openDetails(c: Customer): void  { this.selectedClient.set(c);    this.showDetails.set(true);  }
  closeDetails(): void            { this.selectedClient.set(null); this.showDetails.set(false); }

  confirmToggleStatus(c: Customer): void {
    const nextStatus  = !c.status;
    const verb        = nextStatus ? 'activar' : 'desactivar';
    const acceptLabel = nextStatus ? 'Activar' : 'Desactivar';

    this.confirmationService.confirm({
      header:      'Confirmación',
      message:     `¿Deseas ${verb} al cliente ${this.getDisplayName(c)} (${c.documentValue})?`,
      icon:        'pi pi-exclamation-triangle',
      acceptLabel,
      rejectLabel: 'Cancelar',
      acceptButtonProps: { severity: (nextStatus ? 'success' : 'danger') as any },
      rejectButtonProps: { severity: 'secondary', outlined: true },
      accept: () => {
        this.clienteService.updateCustomerStatus(c.customerId, nextStatus).subscribe({
          next: () => {
            this.confirmationService.close();
            this.messageService.add({
              severity: nextStatus ? 'success' : 'warn',
              summary:  nextStatus ? 'Cliente activado' : 'Cliente desactivado',
              detail:   `${this.getDisplayName(c)} fue ${nextStatus ? 'activado' : 'desactivado'}.`,
              life: 3000,
            });
            this.cargar();
          },
          error: (err) => {
            this.confirmationService.close();
            this.messageService.add({
              severity: 'error', summary: 'Error',
              detail: err?.error?.message ?? 'No se pudo cambiar el estado.',
            });
          },
        });
      },
      reject: () => this.confirmationService.close(),
    });
  }
}