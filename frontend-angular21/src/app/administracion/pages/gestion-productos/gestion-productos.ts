import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { SelectModule } from 'primeng/select'
import { ToggleButtonModule } from 'primeng/togglebutton';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

import { RouterOutlet, RouterModule } from '@angular/router';

@Component({
  selector: 'app-gestion-productos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    TableModule,
    CardModule,
    TagModule,
    AutoCompleteModule,
    SelectModule,
    ToggleButtonModule,
    ProgressSpinnerModule,
    RouterOutlet,
    RouterModule
  ],
  templateUrl: './gestion-productos.html',
  styleUrl: './gestion-productos.css'
})
export class GestionProductos implements OnInit {
  
  get cabeceraCompleta(): string {
    return `Administracion - Admin - <strong>Gestión de Productos Activos</strong>`;
  }

  productos: any[] = [];
  productosOriginal: any[] = [];
  loading = false;
  vistaLista = true;
  sedeValue: string | null = null;
  familiaValue: string | null = null;
  buscarValue: string | null = null;
  sedes: {label: string, value: string}[] = [];
  familias: {label: string, value: string}[] = [];
  items: string[] = [];
  totalSedesActivas: number = 0;
  modoEliminados: boolean = false;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit() {
    this.cargarProductos();
    this.actualizarContadorSedes();
  }

  isRutaHija(): boolean {
    const url = this.router.url;
    return url.includes('crear-producto') || 
          url.includes('editar-producto') || 
          url.includes('productos-eliminados');
  }

  actualizarContadorSedes() {
    this.totalSedesActivas = this.sedes.filter(s => s.label !== '').length;
  }

  get totalProductos(): number {
    return this.productos.length;
  }

  getStockSeverity(stock: number): 'success' | 'warn' | 'danger' {
    if (stock > 10) return 'success';
    if (stock > 0) return 'warn';
    return 'danger';
  }

  cargarProductos() {
    this.loading = true;
    
    this.productosOriginal = [
      {
        id: 1, codigo: 'P001', nombre: 'Inca Kola 500ml', familia: 'Bebidas', sede: 'LAS FLORES',
        stock: 120, precioUnidad: 3.50, precioCaja: 40.00, precioMayorista: 3.00, estado: 'Activo'
      },
      {
        id: 2, codigo: 'P002', nombre: 'Papas Lays 45g', familia: 'Snacks', sede: 'LURIN',
        stock: 80, precioUnidad: 2.50, precioCaja: 28.00, precioMayorista: 2.20, estado: 'Activo'
      },
      {
        id: 3, codigo: 'P003', nombre: 'Arroz Costeño 1kg', familia: 'Abarrotes', sede: 'LAS FLORES',
        stock: 200, precioUnidad: 5.00, precioCaja: 55.00, precioMayorista: 4.50, estado: 'Activo'
      },
      {
        id: 4, codigo: 'P004', nombre: 'Coca Cola 1L', familia: 'Bebidas', sede: 'LAS FLORES',
        stock: 15, precioUnidad: 5.50, precioCaja: 60.00, precioMayorista: 5.00, estado: 'Activo'
      },
      {
        id: 5, codigo: 'P005', nombre: 'Atún Florida 170g', familia: 'Enlatados', sede: 'LURIN',
        stock: 5, precioUnidad: 4.20, precioCaja: 46.00, precioMayorista: 3.80, estado: 'Activo'
      }
    ];

    this.sedes = [...new Set(this.productosOriginal.map(p => p.sede))]
      .map(s => ({ label: s, value: s }));

    if (this.sedeValue) {
      this.onSelectSede();
    } else {
      this.productos = [];
    }
    this.loading = false;
  }

  onSelectSede() {
    if (!this.sedeValue) {
      this.productos = [];
      this.familias = [];
      this.familiaValue = null;
      return;
    }

    const filtrados = this.productosOriginal.filter(p => 
      p.sede === this.sedeValue && p.estado === 'Activo'
    );
    
    this.familias = [...new Set(filtrados.map(p => p.familia))]
      .map(f => ({ label: f, value: f }));
    
    this.productos = filtrados;
    this.familiaValue = null;
    this.buscarValue = null;
    
    this.actualizarContadorSedes();
  }

  onSelectFamilia() {
    if (!this.sedeValue || !this.familiaValue) {
      if (this.sedeValue) this.onSelectSede();
      return;
    }

    this.productos = this.productosOriginal.filter(p =>
      p.sede === this.sedeValue &&
      p.familia === this.familiaValue &&
      p.estado === 'Activo'
    );
  }

  filtrarPorBusqueda() {
    if (!this.buscarValue || !this.sedeValue) return;

    const query = this.buscarValue!.toLowerCase();

    this.productos = this.productosOriginal.filter(p =>
      p.sede === this.sedeValue &&
      p.estado === 'Activo' &&
      (
        p.nombre.toLowerCase().includes(query) ||
        p.codigo.toLowerCase().includes(query) ||
        p.familia.toLowerCase().includes(query)
      )
    );
  }

  searchBuscar(event: any) {
    const query = event.query.toLowerCase();
    
    const productosDisponibles = this.sedeValue 
      ? this.productosOriginal.filter(p => p.sede === this.sedeValue && p.estado === 'Activo')
      : this.productosOriginal.filter(p => p.estado === 'Activo');
    
    this.items = productosDisponibles
      .filter(p => p.nombre.toLowerCase().includes(query))
      .map(p => `${p.nombre} (${p.codigo})`); 
  }

  limpiarFiltros() {
    this.familiaValue = null;
    this.buscarValue = null;
    
    if (!this.sedeValue) {
      this.productos = [];
      return;
    }

    this.productos = this.productosOriginal.filter(p =>
      p.sede === this.sedeValue && p.estado === 'Activo'
    );
  }

  toggleVistaLista(event: any) {
    this.vistaLista = event.value;
  }

  trackByFn(index: number, item: any): any {
    return item.id;
  }

  irDetalle(id: number) {
    console.log('Ver detalles/comparativa producto:', id);
  }

  irCrear() {
    console.log('🚀 irCrear');
    this.router.navigate(['/admin/gestion-productos/crear-producto']);
  }

  irEditar(id: number) {
    console.log('🚀 irEditar', id);
    this.router.navigate(['/admin/gestion-productos/editar-producto', id]);
  }

  irEliminados() {
    this.router.navigate(['/admin/gestion-productos/productos-eliminados']);
  }

  eliminarProducto(producto: any) {
    const confirmacion = confirm(
      `¿Eliminar "${producto.nombre}"?\n\n` +
      `Código: ${producto.codigo}\n` +
      `Sede: ${producto.sede}\n\n` +
      `Esto cambiará su estado a "Retirado" y aparecerá en Productos Eliminados.`
    );
    
    if (confirmacion) {
      const productoIndex = this.productosOriginal.findIndex(p => p.id === producto.id);
      if (productoIndex !== -1) {
        this.productosOriginal[productoIndex].estado = 'Retirado';
        this.onSelectSede();
        console.log('Producto marcado como retirado:', producto);
      }
    }
  }
}
