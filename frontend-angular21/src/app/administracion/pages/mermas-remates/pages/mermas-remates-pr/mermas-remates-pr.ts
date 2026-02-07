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

type Severity =
  | 'success'
  | 'info'
  | 'warn'
  | 'danger'
  | 'secondary'
  | 'contrast';

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
  templateUrl: './mermas-remates-pr.html',
  styleUrl: './mermas-remates-pr.css',
  providers: [ConfirmationService, MessageService],
})

export class MermasRematesPr {
  // Estadísticas
  totalMermas: number = 18;
  totalRemates: number = 25;
  valorTotalRemates: number = 12500;

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

  // Lista de productos
  productos: Producto[] = [
    {
      codigo: 'TRF-2026-0001',
      nombre: 'Smart TV LED 55" 4K RAF',
      responsable: 'Jefatura de almacén',
      cantidad: 3,
      tipo: 'merma',
      fechaRegistro: new Date('2026-01-31')
    },
    {
      codigo: 'TRF-2026-0002',
      nombre: 'Lavarropas Automático 10kg RAF',
      responsable: 'Jefatura de almacén',
      cantidad: 5,
      tipo: 'remate',
      codigoRemate: 'RMT-2026-001',
      precioRemate: 450.00,
      fechaRegistro: new Date('2026-01-30')
    },
    {
      codigo: 'TRF-2026-0003',
      nombre: 'Refrigerador No Frost 12 pies RAF',
      responsable: 'Jefatura de almacén',
      cantidad: 2,
      tipo: 'merma',
      fechaRegistro: new Date('2026-01-29')
    },
    {
      codigo: 'TRF-2026-0004',
      nombre: 'Microondas Digital 25L RAF',
      responsable: 'Jefatura de almacén',
      cantidad: 8,
      tipo: 'remate',
      codigoRemate: 'RMT-2026-002',
      precioRemate: 125.00,
      fechaRegistro: new Date('2026-01-28')
    },
    {
      codigo: 'TRF-2026-0005',
      nombre: 'Aspiradora Robot Inteligente RAF',
      responsable: 'Jefatura de almacén',
      cantidad: 4,
      tipo: 'remate',
      codigoRemate: 'RMT-2026-003',
      precioRemate: 280.00,
      fechaRegistro: new Date('2026-01-27')
    }
  ];

  productosFiltrados: Producto[] = [];

  constructor(
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) { }

  ngOnInit(): void {
    this.productoActual = this.nuevoProductoVacio();
    this.aplicarFiltros();
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
      // Limpiar campos de remate si se selecciona merma
      this.productoActual.codigoRemate = undefined;
      this.productoActual.precioRemate = undefined;
    } else if (this.productoActual.tipo === 'remate' && !this.productoActual.codigoRemate) {
      // Generar código de remate automático
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
      // Actualizar producto existente
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
      // Agregar nuevo producto
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

  getTipoSeverity(
    tipo: 'merma' | 'remate' | null
  ): Severity {

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
