import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { SelectModule } from 'primeng/select';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { Router, RouterModule } from '@angular/router';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ProductoService } from '../../../services/producto.service';
import { ProductoAutocomplete, ProductoStock } from '../../../interfaces/producto.interface';
import { SedeService } from '../../../services/sede.service';
import { CategoriaService } from '../../../services/categoria.service';
import { SharedTableContainerComponent } from '../../../../shared/components/table.componente/shared-table-container.component';
import { AuthService } from '../../../../auth/services/auth.service';
import { UserRole } from '../../../../core/constants/roles.constants';

@Component({
  selector: 'app-gestion-productos',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ButtonModule, TableModule, CardModule, TagModule,
    AutoCompleteModule, SelectModule, ToggleButtonModule,
    InputTextModule, TooltipModule, RouterModule,
    ConfirmDialog, DialogModule, ToastModule,
    SharedTableContainerComponent,
  ],
  templateUrl: './gestion-listado.html',
  styleUrl: './gestion-listado.css',
  providers: [ConfirmationService, MessageService],
})
export class GestionListado implements OnInit {
  public router               = inject(Router);
  private productoService     = inject(ProductoService);
  private sedeService         = inject(SedeService);
  private categoriaService    = inject(CategoriaService);
  private confirmationService = inject(ConfirmationService);
  private messageService      = inject(MessageService);
  private authService         = inject(AuthService);

  // ── Auth ──────────────────────────────────────────────────────────
  esAdmin    = signal<boolean>(false);
  sedeNombre = signal<string>('Mi sede');

  // ── Permisos ──────────────────────────────────────────────────────
  puedeCrearProducto  = false; // CREAR_PRODUCTOS  → botón "Agregar Producto"
  puedeEditarProducto = false; // EDITAR_PRODUCTOS → botón lápiz
  puedeVerDetalle     = false; // VER_PRODUCTOS    → botón ojo
  // eliminar → solo esAdmin

  productos    = signal<ProductoStock[]>([]);
  loading      = signal<boolean>(false);
  categorias   = signal<{ label: string; value: string }[]>([]);

  categoriaSeleccionada = signal<string | null>(null);
  buscarValue           = signal<ProductoAutocomplete | string | null>(null);
  sugerencias           = signal<ProductoAutocomplete[]>([]);

  totalRecords  = signal<number>(0);
  rows          = signal<number>(5);
  currentPage   = signal<number>(1);
  idSedeActual  = signal<number | null>(null);

  readonly totalPages = computed(() =>
    Math.ceil(this.totalRecords() / this.rows())
  );

  tituloKicker    = 'ADMINISTRADOR · ADMINISTRACIÓN · PRODUCTOS';
  subtituloKicker = 'GESTIÓN DE PRODUCTOS';
  iconoCabecera   = 'pi pi-box';

  sedesOptions = computed(() =>
    this.sedeService.sedes().map(sede => ({
      label: sede.nombre,
      value: sede.id_sede,
    }))
  );

  stockTotalVisible = computed(() =>
    this.productos().reduce((suma, p) => suma + p.stock, 0)
  );

  constructor() {
    this.esAdmin.set(this.authService.getRoleId() === UserRole.ADMIN);
    this.obtenerSedeDeUsuario();
  }

  ngOnInit() {
    // ── Resolver permisos ─────────────────────────────────────────
    this.puedeCrearProducto  = this.authService.hasPermiso('CREAR_PRODUCTOS');
    this.puedeEditarProducto = this.authService.hasPermiso('EDITAR_PRODUCTOS');
    this.puedeVerDetalle     = this.authService.hasPermiso('VER_PRODUCTOS');

    this.sedeService.loadSedes().subscribe({
      error: (err) => console.error('Error cargando sedes', err),
    });

    this.categoriaService.getCategorias(true).subscribe({
      next: (resp) => {
        this.categorias.set(
          resp.categories.map((cat: any) => ({ label: cat.nombre, value: cat.nombre }))
        );
      },
      error: (err) => console.error('Error cargando categorías', err),
    });

    this.cargarProductos();
  }

  private obtenerSedeDeUsuario() {
    try {
      const userString = localStorage.getItem('user');
      if (userString) {
        const user = JSON.parse(userString);
        if (user.idSede)     this.idSedeActual.set(user.idSede);
        if (user.sedeNombre) this.sedeNombre.set(user.sedeNombre);
      }
    } catch (e) {
      console.error('Error parseando usuario', e);
    }
  }

  private resolverIdSedePorNombre(sedeNombre: string): number | null {
    const match = this.sedesOptions().find(s => s.label === sedeNombre);
    return match?.value ?? this.idSedeActual();
  }

  cargarProductos() {
    const sedeId = this.idSedeActual();
    if (!sedeId) return;

    this.loading.set(true);
    this.productoService.getProductosConStock(
      sedeId,
      this.currentPage(),
      this.rows(),
      this.categoriaSeleccionada() ?? undefined,
      true,
    ).subscribe({
      next: (response) => {
        this.productos.set(response.data);
        this.totalRecords.set(response.pagination.total_records);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar productos:', err);
        this.loading.set(false);
      },
    });
  }

  onSedeChange(nuevaSedeId: number | null) {
    if (!this.esAdmin()) return;
    this.idSedeActual.set(nuevaSedeId);
    this.currentPage.set(1);
    if (nuevaSedeId) {
      this.cargarProductos();
    } else {
      this.productos.set([]);
      this.totalRecords.set(0);
    }
  }

  onCategoriaChange(nuevaCategoria: string | null) {
    this.categoriaSeleccionada.set(nuevaCategoria);
    this.currentPage.set(1);
    this.cargarProductos();
  }

  onPageChange(page: number)   { this.currentPage.set(page); this.cargarProductos(); }
  onLimitChange(limit: number) { this.rows.set(limit); this.currentPage.set(1); this.cargarProductos(); }

  limpiarFiltros() {
    this.buscarValue.set(null);
    this.categoriaSeleccionada.set(null);
    this.currentPage.set(1);
    this.cargarProductos();
  }

  searchBuscar(event: any) {
    const query  = event.query;
    const sedeId = this.idSedeActual();
    if (!sedeId || !query) { this.sugerencias.set([]); return; }

    this.productoService.getProductosAutocomplete(query, sedeId).subscribe({
      next:  (response) => this.sugerencias.set(response.data),
      error: (err)      => console.error('Error en autocomplete:', err),
    });
  }

  seleccionarProductoBusqueda(event: any) {
    const productoSeleccionado = event.value as ProductoAutocomplete;
    this.buscarValue.set(productoSeleccionado.nombre);

    const sedeId = this.idSedeActual();
    if (!sedeId) return;

    this.loading.set(true);
    this.productoService.getProductoDetalleStock(productoSeleccionado.id_producto, sedeId).subscribe({
      next: (detalleResponse) => {
        const productoParaTabla: ProductoStock = {
          id_producto: detalleResponse.producto.id_producto,
          codigo:      detalleResponse.producto.codigo,
          nombre:      detalleResponse.producto.nombre,
          familia:     detalleResponse.producto.categoria.nombre,
          sede:        detalleResponse.stock.sede,
          stock:       detalleResponse.stock.cantidad,
        };
        this.productos.set([productoParaTabla]);
        this.totalRecords.set(1);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar detalle del producto:', err);
        this.loading.set(false);
      },
    });
  }

  limpiarBusqueda() {
    this.buscarValue.set(null);
    this.currentPage.set(1);
    this.cargarProductos();
  }

  irCrear()              { this.router.navigate(['/admin/gestion-productos/crear-producto']); }
  irEditar(id: number)   {
    this.router.navigate(['/admin/gestion-productos/editar-producto', id], {
      queryParams: { idSede: this.idSedeActual() },
    });
  }

  irDetalle(idProducto: number, sedeNombre: string) {
    const idSede = this.resolverIdSedePorNombre(sedeNombre);
    this.router.navigate(
      ['/admin/gestion-productos/ver-detalle-producto', idProducto],
      { queryParams: { idSede } }
    );
  }

  confirmarEliminar(id: number) {
    this.confirmationService.confirm({
      message:     '¿Estás seguro de que deseas eliminar este producto?',
      header:      'Confirmar Eliminación',
      icon:        'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'No, cancelar',
      accept: () => this.eliminarProducto(id),
    });
  }

  eliminarProducto(id: number) {
    this.productoService.actualizarProductoEstado(id, false).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success', summary: 'Eliminado',
          detail: 'El producto fue eliminado correctamente',
        });
        this.cargarProductos();
      },
      error: () => {
        this.messageService.add({
          severity: 'error', summary: 'Error',
          detail: 'No se pudo eliminar el producto',
        });
      },
    });
  }
}