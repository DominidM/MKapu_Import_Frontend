import { Component, OnInit, OnDestroy, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterModule, RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, filter, takeUntil } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';

import { ProveedorService } from '../../../services/proveedor.service';
import { SupplierResponse } from '../../../interfaces/supplier.interface';
import { SharedTableContainerComponent } from '../../../../shared/components/table.componente/shared-table-container.component';
import { AuthService } from '../../../../auth/services/auth.service';
import { UserRole } from '../../../../core/constants/roles.constants';

type EstadoFiltro = 'todos' | 'activos' | 'inactivos';

interface SelectOption {
  label: string;
  value: EstadoFiltro;
}

@Component({
  selector: 'app-proveedor-listado',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule, RouterOutlet,
    ButtonModule, TableModule, CardModule, TagModule,
    AutoCompleteModule, SelectModule,
    InputTextModule, TooltipModule, ConfirmDialog,
    DialogModule, ToastModule,
    SharedTableContainerComponent,
  ],
  templateUrl: './proveedor-listado.html',
  styleUrl: './proveedor-listado.css',
  providers: [ConfirmationService, MessageService],
})
export class ProveedorListado implements OnInit, OnDestroy {
  private readonly authService = inject(AuthService);

  private destroy$   = new Subject<void>();
  private currentUrl = signal<string>('');

  private todosLosProveedores = signal<SupplierResponse[]>([]);

  loading        = signal(false);
  buscarValue    = signal<string | null>(null);
  autoInputValue = signal<string>('');
  items          = signal<SupplierResponse[]>([]);
  filtroEstado   = signal<EstadoFiltro>('activos');
  paginaActual   = signal<number>(1);
  rows           = signal<number>(5);

  readonly estadoOptions: SelectOption[] = [
    { label: 'Todos',     value: 'todos'     },
    { label: 'Activos',   value: 'activos'   },
    { label: 'Inactivos', value: 'inactivos' },
  ];

  // ── Permisos ──────────────────────────────────────────────────────
  esAdmin               = false;
  puedeCrearProveedor   = false; // CREAR_PROVEEDORES  → botón "Agregar Proveedor"
  puedeEditarProveedor  = false; // EDITAR_PROVEEDORES → botón lápiz
  puedeVerDetalle       = false; // VER_PROVEEDORES    → botón ojo
  // desactivar/activar → solo esAdmin

  readonly proveedoresFiltrados = computed(() => {
    const todos  = this.todosLosProveedores();
    const estado = this.filtroEstado();
    let resultado = todos;
    if (estado === 'activos')   resultado = resultado.filter(p => p.estado);
    if (estado === 'inactivos') resultado = resultado.filter(p => !p.estado);
    return resultado;
  });

  readonly totalRecords = computed(() => this.proveedoresFiltrados().length);
  readonly totalPaginas = computed(() => Math.ceil(this.totalRecords() / this.rows()) || 1);

  readonly proveedoresPaginados = computed(() => {
    const inicio = (this.paginaActual() - 1) * this.rows();
    return this.proveedoresFiltrados().slice(inicio, inicio + this.rows());
  });

  readonly tituloKicker = computed(() => {
    const url = this.currentUrl();
    if (url.includes('crear'))       return 'ADMINISTRACIÓN - PROVEEDORES CREACIÓN';
    if (url.includes('editar'))      return 'ADMINISTRACIÓN - PROVEEDORES EDICIÓN';
    if (url.includes('ver-detalle')) return 'ADMINISTRACIÓN - PROVEEDORES DETALLE';
    return 'ADMINISTRACIÓN - LOGÍSTICA - PROVEEDORES';
  });

  readonly iconoCabecera = computed(() => {
    const url = this.currentUrl();
    if (url.includes('crear'))       return 'pi pi-plus-circle';
    if (url.includes('editar'))      return 'pi pi-pencil';
    if (url.includes('ver-detalle')) return 'pi pi-eye';
    return 'pi pi-building';
  });

  readonly subtituloKicker = 'GESTIÓN DE PROVEEDORES';

  readonly totalProveedoresActivos     = computed(() => this.todosLosProveedores().filter(p => p.estado).length);
  readonly totalProveedoresConContacto = computed(() => this.todosLosProveedores().filter(p => p.contacto).length);
  readonly totalProveedoresConEmail    = computed(() => this.todosLosProveedores().filter(p => p.email).length);
  readonly totalProveedoresConTelefono = computed(() => this.todosLosProveedores().filter(p => p.telefono).length);

  constructor(
    private router: Router,
    private proveedorService: ProveedorService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
  ) {
    this.currentUrl.set(this.router.url);
  }

  ngOnInit(): void {
    // ── Resolver permisos ─────────────────────────────────────────
    this.esAdmin              = this.authService.getRoleId() === UserRole.ADMIN;
    this.puedeCrearProveedor  = this.authService.hasPermiso('CREAR_PROVEEDORES');
    this.puedeEditarProveedor = this.authService.hasPermiso('EDITAR_PROVEEDORES');
    this.puedeVerDetalle      = this.authService.hasPermiso('VER_PROVEEDORES');

    this.cargarProveedores();
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd), takeUntil(this.destroy$))
      .subscribe(() => this.currentUrl.set(this.router.url));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.confirmationService.close();
  }

  cargarProveedores(): void {
    this.loading.set(true);
    this.proveedorService.listSuppliers({}).subscribe({
      next: response => {
        this.todosLosProveedores.set(response.suppliers);
        this.paginaActual.set(1);
        this.loading.set(false);
      },
      error: (error: Error) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message, life: 3000 });
        this.loading.set(false);
      },
    });
  }

  onEstadoChange(valor: EstadoFiltro): void { this.filtroEstado.set(valor); this.paginaActual.set(1); }

  searchBuscar(event: any): void {
    const query = (event.query || '').trim();
    this.autoInputValue.set(query);
    this.proveedorService.listSuppliers({ estado: true, search: query }).subscribe({
      next:  r  => this.items.set(r.suppliers.slice(0, 10)),
      error: () => this.items.set([]),
    });
  }

  filtrarPorBusqueda(event: any): void {
    if (event?.value) this.irDetalle(event.value.id_proveedor);
  }

  limpiarFiltros(): void {
    this.buscarValue.set(null);
    this.autoInputValue.set('');
    this.filtroEstado.set('activos');
    this.items.set([]);
    this.paginaActual.set(1);
    this.cargarProveedores();
  }

  onPageChange(page: number): void   { this.paginaActual.set(page); }
  onLimitChange(limit: number): void { this.rows.set(limit); this.paginaActual.set(1); }

  toggleStatus(proveedor: SupplierResponse): void {
    const nuevoEstado = !proveedor.estado;
    const destino     = nuevoEstado ? 'activos' : 'eliminados';
    this.confirmationService.confirm({
      message: `¿Está seguro de ${nuevoEstado ? 'activar' : 'enviar a eliminados'} el proveedor "${proveedor.razon_social}"?`,
      header:  'Confirmar acción',
      icon:    'pi pi-exclamation-triangle',
      accept: () => {
        this.proveedorService.changeSupplierStatus(proveedor.id_proveedor, nuevoEstado).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: `Proveedor movido a ${destino}`, life: 3000 });
            this.cargarProveedores();
          },
          error: (error: Error) => {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: error.message, life: 3000 });
          },
        });
      },
    });
  }

  trackByFn(index: number, item: SupplierResponse): number { return item.id_proveedor; }

  irDetalle(id: number): void { this.router.navigate(['/admin/proveedores/ver-detalle', id]); }
  irCrear():             void { this.router.navigate(['/admin/proveedores/crear']); }
  irEditar(id: number):  void { this.router.navigate(['/admin/proveedores/editar', id]); }

  isRutaHija(): boolean {
    const url = this.currentUrl();
    return url.includes('crear') || url.includes('editar') || url.includes('ver-detalle');
  }
}