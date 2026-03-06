import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DialogModule }       from 'primeng/dialog';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule }       from 'primeng/button';
import { CardModule }         from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageModule }      from 'primeng/message';
import { TableModule }        from 'primeng/table';
import { TagModule }          from 'primeng/tag';
import { ToastModule }        from 'primeng/toast';
import { SelectModule }       from 'primeng/select';
import { ConfirmationService, MessageService } from 'primeng/api';

import { RolePermissionService }          from '../../../../services/role-permission.service';
import { RoleWithPermissionsResponseDto } from '../../../../interfaces/role-permission.interface';

type ViewMode = 'todos' | 'activos' | 'inactivos';

@Component({
  selector: 'app-role-permission-listado',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule,
    DialogModule, CardModule, ButtonModule,
    AutoCompleteModule, TableModule, TagModule,
    ToastModule, ConfirmDialogModule, MessageModule, SelectModule,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './role-permission-listado.html',
   styleUrl: './role-permission-listado.component.css',
})
export class RolePermissionListadoComponent implements OnInit {

  private readonly svc         = inject(RolePermissionService);
  private readonly msgService  = inject(MessageService);
  private readonly confirmSvc  = inject(ConfirmationService);

  readonly loading = this.svc.loading;
  readonly error   = this.svc.error;

  // ── Dialog detalle ────────────────────────────────────────────────
  dialogVisible      = false;
  rolSeleccionado    = signal<RoleWithPermissionsResponseDto | null>(null);

  // ── Filtros ───────────────────────────────────────────────────────
  readonly searchTerm = signal('');
  readonly viewMode   = signal<ViewMode>('activos');

  readonly viewOptions: { label: string; value: ViewMode }[] = [
    { label: 'Todos',     value: 'todos'     },
    { label: 'Activos',   value: 'activos'   },
    { label: 'Inactivos', value: 'inactivos' },
  ];

  // ── Data ──────────────────────────────────────────────────────────
  readonly roles = computed(() => this.svc.rolesWithPermissions());

  readonly visibleRoles = computed(() => {
    const mode = this.viewMode();
    const all  = this.roles();
    if (mode === 'activos')   return all.filter(r => r.activo === true);
    if (mode === 'inactivos') return all.filter(r => r.activo === false);
    return all;
  });

  readonly filteredRoles = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const base = this.visibleRoles();
    if (!term) return base;
    return base.filter(r =>
      [r.nombre, r.descripcion].some(f =>
        String(f ?? '').toLowerCase().includes(term)
      )
    );
  });

  readonly suggestions = computed(() => this.filteredRoles());

  async ngOnInit() {
    this.svc.loadAllRolesWithPermissions().subscribe();
  }

  // ── Handlers búsqueda ─────────────────────────────────────────────
  onSearch(event: { query: string })  { this.searchTerm.set(event.query); }
  onViewModeChange(mode: ViewMode)    { this.viewMode.set(mode); }
  clearSearch()                       { this.searchTerm.set(''); }

  onSearchChange(term: unknown) {
    if (typeof term === 'string') { this.searchTerm.set(term); return; }
    if (term && typeof term === 'object' && 'nombre' in (term as any)) {
      this.searchTerm.set(String((term as any).nombre ?? '')); return;
    }
    this.searchTerm.set('');
  }

  onSelectRol(event: any) {
    this.searchTerm.set(String(event?.value?.nombre ?? ''));
  }

  // ── Detalle ───────────────────────────────────────────────────────
  verDetalle(rol: RoleWithPermissionsResponseDto) {
    this.rolSeleccionado.set(rol);
    this.dialogVisible = true;
  }

  // ── Helper conteo ─────────────────────────────────────────────────
  getPermisosLabel(count: number): string {
    if (count === 0) return 'Sin permisos';
    if (count === 1) return '1 permiso';
    return `${count} permisos`;
  }

  getPermisosTagSeverity(count: number): 'success' | 'warn' | 'danger' {
    if (count === 0) return 'danger';
    if (count < 5)  return 'warn';
    return 'success';
  }
}