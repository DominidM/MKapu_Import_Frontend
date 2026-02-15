import { Component, OnInit } from '@angular/core';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectButtonModule } from 'primeng/selectbutton';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';

interface Producto {
  codigo: string;
  nombre: string;
  responsable: string;
  cantidad: number;
  tipo: 'merma' | 'remate' | null;
  codigoRemate?: string;
  precioRemate?: number;
  fechaRegistro: Date;
}

interface TipoFiltro {
  label: string;
  value: string;
}

// ✅ Interfaces para la respuesta del backend
interface WastageResponse {
  id_merma: number;
  fec_merma: string;
  motivo: string;
  total_items: number;
  estado: boolean;
}

interface WastagePaginatedResponse {
  data: WastageResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

type Severity = 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast';

@Component({
  selector: 'app-mermas-remates-pr',
  imports: [
    CardModule,
    ButtonModule,
    RouterModule,
    FormsModule,
    InputTextModule,
    AutoCompleteModule,
    ConfirmDialogModule,
    ToastModule,
    TableModule,
    TooltipModule,
    TagModule,
    DialogModule,
    InputNumberModule,
    SelectButtonModule,
    CommonModule
  ],
  templateUrl: './remates-pr.html',
  styleUrl: './remates-pr.css',
  providers: [ConfirmationService, MessageService],
})
export class RematesPr implements OnInit {
  // ✅ API URL
  private apiUrl = 'http://localhost:3000/logistics/catalog/wastage';

  // ✅ Estado de carga
  cargando: boolean = false;

  // Estadísticas
  totalMermas: number = 0;
  totalRemates: number = 0;
  valorTotalRemates: number = 0;

  // Filtros
  busqueda: string = '';
  tipoFiltro: string = 'todos';

  tiposFiltro: TipoFiltro[] = [
    { label: 'Todos los tipos', value: 'todos' },
    { label: 'Solo Mermas', value: 'merma' },
    { label: 'Solo Remates', value: 'remate' }
  ];

  // Tab activa
  tabActiva: string = 'todos';

  // Modal
  mostrarModal: boolean = false;
  modoEdicion: boolean = false;

  // Producto en edición
  productoActual!: Producto;

  // Opciones de tipo para el modal
  tiposProducto = [
    { label: 'Merma (Sale de Stock)', value: 'merma' },
    { label: 'Remate', value: 'remate' }
  ];

  // ✅ Paginación
  paginaActual: number = 1;
  productosPorPagina: number = 10;
  totalProductos: number = 0;

  // Lista de productos
  productos: Producto[] = [];
  productosFiltrados: Producto[] = [];

  constructor(
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private http: HttpClient // ✅ Inyectar HttpClient
  ) {}

  ngOnInit(): void {
    this.productoActual = this.nuevoProductoVacio();
    this.cargarMermas(); // ✅ Cargar datos del backend
  }

  // ✅ Cargar datos desde el backend
  cargarMermas(): void {
    this.cargando = true;
    
    const params = new HttpParams()
      .set('page', this.paginaActual.toString())
      .set('limit', this.productosPorPagina.toString());

    this.http.get<WastagePaginatedResponse>(this.apiUrl, { params })
      .subscribe({
        next: (response) => {
          // Mapear la respuesta del backend a nuestro formato de productos
          this.productos = response.data.map(merma => ({
            codigo: `MER-${merma.id_merma}`,
            nombre: merma.motivo,
            responsable: 'Sistema',
            cantidad: merma.total_items,
            tipo: 'merma' as const,
            fechaRegistro: new Date(merma.fec_merma),
            codigoRemate: undefined,
            precioRemate: undefined
          }));

          this.totalProductos = response.total;
          this.actualizarEstadisticas();
          this.aplicarFiltros();
          this.cargando = false;
        },
        error: (error) => {
          console.error('Error al cargar mermas:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron cargar las mermas',
            life: 3000
          });
          this.cargando = false;
        }
      });
  }

  // ✅ Método para cambiar de página (llamado por p-table)
  onPageChange(event: any): void {
    this.paginaActual = event.page + 1; // PrimeNG usa índice 0
    this.productosPorPagina = event.rows;
    this.cargarMermas();
  }

  // ===== MÉTODOS DE FILTRADO =====

  aplicarFiltros(): void {
    let resultados = [...this.productos];

    // Filtrar por búsqueda
    if (this.busqueda.trim()) {
      const busquedaLower = this.busqueda.toLowerCase();
      resultados = resultados.filter(p =>
        p.codigo.toLowerCase().includes(busquedaLower) ||
        p.nombre.toLowerCase().includes(busquedaLower) ||
        p.responsable.toLowerCase().includes(busquedaLower)
      );
    }

    // Filtrar por tipo
    if (this.tipoFiltro !== 'todos') {
      resultados = resultados.filter(p => p.tipo === this.tipoFiltro);
    }

    // Filtrar por tab activa
    if (this.tabActiva !== 'todos') {
      resultados = resultados.filter(p => p.tipo === this.tabActiva);
    }

    this.productosFiltrados = resultados;
  }

  limpiarFiltros(): void {
    this.busqueda = '';
    this.tipoFiltro = 'todos';
    this.aplicarFiltros();
  }

  cambiarTab(tab: string): void {
    this.tabActiva = tab;
    this.aplicarFiltros();
  }

  // ===== MÉTODOS DEL MODAL =====

  abrirModal(): void {
    this.modoEdicion = false;
    this.productoActual = this.nuevoProductoVacio();
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.productoActual = this.nuevoProductoVacio();
  }

  editarProducto(producto: Producto): void {
    this.modoEdicion = true;
    this.productoActual = { ...producto };
    this.mostrarModal = true;
  }

  nuevoProductoVacio(): Producto {
    return {
      codigo: this.generarCodigoAutomatico(),
      nombre: '',
      responsable: 'Jefatura de almacén',
      cantidad: 1,
      tipo: null,
      fechaRegistro: new Date()
    };
  }

  generarCodigoAutomatico(): string {
    const fecha = new Date();
    const año = fecha.getFullYear();
    const ultimoNumero = this.productos.length + 1;
    return `TRF-${año}-${String(ultimoNumero).padStart(4, '0')}`;
  }

  onTipoChange(): void {
    if (this.productoActual.tipo === 'merma') {
      this.productoActual.codigoRemate = undefined;
      this.productoActual.precioRemate = undefined;
    } else if (this.productoActual.tipo === 'remate' && !this.productoActual.codigoRemate) {
      this.productoActual.codigoRemate = this.generarCodigoRemate();
    }
  }

  generarCodigoRemate(): string {
    const fecha = new Date();
    const año = fecha.getFullYear();
    const rematesExistentes = this.productos.filter(p => p.tipo === 'remate').length;
    return `RMT-${año}-${String(rematesExistentes + 1).padStart(3, '0')}`;
  }

  guardarProducto(): void {
    // Validaciones
    if (!this.productoActual.nombre.trim()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'El nombre del producto es obligatorio',
        life: 3000
      });
      return;
    }

    if (!this.productoActual.tipo) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Debe seleccionar un tipo de registro',
        life: 3000
      });
      return;
    }

    if (this.productoActual.cantidad <= 0) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'La cantidad debe ser mayor a 0',
        life: 3000
      });
      return;
    }

    if (this.productoActual.tipo === 'remate') {
      if (!this.productoActual.codigoRemate || !this.productoActual.precioRemate) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Los productos de remate deben tener código y precio de remate',
          life: 3000
        });
        return;
      }

      if (this.productoActual.precioRemate <= 0) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'El precio de remate debe ser mayor a 0',
          life: 3000
        });
        return;
      }
    }

    if (this.modoEdicion) {
      const index = this.productos.findIndex(p => p.codigo === this.productoActual.codigo);
      if (index !== -1) {
        this.productos[index] = { ...this.productoActual };
        this.messageService.add({
          severity: 'success',
          summary: 'Producto Actualizado',
          detail: `${this.productoActual.nombre} actualizado correctamente`,
          life: 3000
        });
      }
    } else {
      this.productos.push({ ...this.productoActual });
      this.messageService.add({
        severity: 'success',
        summary: 'Producto Registrado',
        detail: `${this.productoActual.nombre} registrado como ${this.productoActual.tipo}`,
        life: 3000
      });
    }

    this.actualizarEstadisticas();
    this.aplicarFiltros();
    this.cerrarModal();
  }

  eliminarProducto(producto: Producto): void {
    this.confirmationService.confirm({
      message: `¿Está seguro de eliminar "${producto.nombre}"?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        const index = this.productos.findIndex(p => p.codigo === producto.codigo);
        if (index !== -1) {
          this.productos.splice(index, 1);
          this.messageService.add({
            severity: 'success',
            summary: 'Producto eliminado',
            detail: `${producto.nombre} eliminado correctamente`,
            life: 3000
          });
          this.actualizarEstadisticas();
          this.aplicarFiltros();
        }
      }
    });
  }

  // ===== MÉTODOS AUXILIARES =====

  actualizarEstadisticas(): void {
    this.totalMermas = this.productos.filter(p => p.tipo === 'merma').length;
    this.totalRemates = this.productos.filter(p => p.tipo === 'remate').length;
    this.valorTotalRemates = this.productos
      .filter(p => p.tipo === 'remate')
      .reduce((sum, p) => sum + ((p.precioRemate || 0) * p.cantidad), 0);
  }

  getTipoLabel(tipo: 'merma' | 'remate' | null): string {
    if (tipo === 'merma') return 'MERMA';
    if (tipo === 'remate') return 'REMATE';
    return 'N/A';
  }

  getTipoSeverity(tipo: 'merma' | 'remate' | null): Severity {
    if (tipo === 'merma') return 'danger';
    if (tipo === 'remate') return 'success';
    return 'info';
  }

  getContadorTab(tab: string): number {
    if (tab === 'todos') return this.productos.length;
    if (tab === 'merma') return this.totalMermas;
    if (tab === 'remate') return this.totalRemates;
    return 0;
  }
}