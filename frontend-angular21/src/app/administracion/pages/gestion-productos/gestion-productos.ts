import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { SelectModule } from 'primeng/select';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TooltipModule } from 'primeng/tooltip';
import { RouterOutlet, RouterModule } from '@angular/router';

import { ProductosService, Producto } from '../../../core/services/productos.service';

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
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    TooltipModule,
    RouterOutlet,
    RouterModule
  ],
  templateUrl: './gestion-productos.html',
  styleUrl: './gestion-productos.css'
})
export class GestionProductos implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // ✅ TIPADO CORRECTO CON INTERFAZ Producto
  productos: Producto[] = [];
  productosOriginal: Producto[] = [];
  loading = false;
  vistaLista = true;
  sedeValue: string | null = null;
  familiaValue: string | null = null;
  buscarValue: string | null = null;
  items: Producto[] = [];
  sedes: {label: string, value: string}[] = [];
  familias: {label: string, value: string}[] = [];
  
  totalSedesActivas = 0;
  totalProductosActivos = 0;

  resumenSedes: {sede: string, activos: number, eliminados: number, total: number}[] = [];

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private productosService: ProductosService
  ) {}

  ngOnInit() {
    this.cargarProductos();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /** ✅ CARGAR DESDE SERVICIO CON CONTADORES */
  cargarProductos() {
    this.loading = true;
    
    // Obtener TODOS los productos activos del servicio RAF
    this.productosOriginal = this.productosService.getProductos(undefined, 'Activo');
    this.sedes = this.productosService.getSedes().map(s => ({ label: s, value: s }));
    this.familias = this.productosService.getFamilias().map(f => ({ label: f, value: f }));
    
    // ✅ CONTADORES NUEVOS DEL SERVICE
    this.resumenSedes = this.productosService.getResumenPorSedes();
    this.totalSedesActivas = this.sedes.length;
    this.totalProductosActivos = this.productosService.getTotalProductosActivos();

    
    this.loading = false;
    this.actualizarContadorSedes();
  }

  /** ✅ SELECCIONAR SEDE */
  onSelectSede() {
    if (!this.sedeValue) {
      this.resetFiltros();
      return;
    }

    // ✅ Filtrar por sede Y solo activos + CONTADOR ESPECÍFICO
    this.productosOriginal = this.productosService.getProductos(this.sedeValue, 'Activo');
    this.familias = this.productosService.getFamilias(this.sedeValue)
      .map(f => ({ label: f, value: f }));
    this.totalProductosActivos = this.productosService.getTotalProductosActivosPorSede(this.sedeValue!);
    
    this.aplicarTodosLosFiltros();
  }

  /** ✅ SELECCIONAR FAMILIA */
  onSelectFamilia() {
    this.aplicarTodosLosFiltros();
  }

  /** ✅ FILTROS COMPLETOS */
  aplicarTodosLosFiltros() {
    if (!this.sedeValue || this.productosOriginal.length === 0) {
      this.productos = [];
      return;
    }

    this.productos = this.productosOriginal.filter((p: Producto) => {
      // Familia
      const matchesFamilia = !this.familiaValue || p.familia === this.familiaValue;
      
      // Búsqueda
      let query = '';
      if (this.buscarValue && typeof this.buscarValue === 'string') {
        query = this.buscarValue.toLowerCase().replace(/\s*\([^)]+\)\s*$/, '');
      }
      
      const matchesBusqueda = !query || 
        p.nombre.toLowerCase().includes(query) ||
        p.codigo.toLowerCase().includes(query) ||
        p.familia.toLowerCase().includes(query);

      return matchesFamilia && matchesBusqueda;
    });
  }

  /** ✅ AUTOCOMPLETE BUSCAR */
  searchBuscar(event: any) {
    const query = event.query?.toLowerCase() || '';
    
    // Productos disponibles en la sede seleccionada
    const disponibles = this.sedeValue 
      ? this.productosService.getProductos(this.sedeValue, 'Activo')
      : this.productosService.getProductos(undefined, 'Activo');

    this.items = disponibles.filter((p: Producto) => 
      p.nombre.toLowerCase().includes(query) || 
      p.codigo.toLowerCase().includes(query) ||
      p.familia.toLowerCase().includes(query)
    ).slice(0, 10); // Máximo 10 sugerencias
  }

  /** ✅ SELECCIONAR DESDE AUTOCOMPLETE */
  filtrarPorBusqueda(event: any) {
    if (event?.value) {
      this.buscarValue = event.value.nombre;
      this.aplicarTodosLosFiltros();
    }
  }

  /** ✅ ELIMINAR USANDO SERVICE CORRECTO */
  eliminarProducto(producto: Producto) {
    const confirmacion = confirm(
      `¿Retirar "${producto.nombre}"?\n\n` +
      `📦 Código: ${producto.codigo}\n` +
      `🏪 Sede: ${producto.sede}\n` +
      `💰 Precio: S/ ${producto.precioUnidad.toFixed(2)}\n` +
      `📂 Familia: ${producto.familia}\n\n` +
      `✅ Se cambiará estado de "Activo" → "Eliminado"\n` +
      `✅ Podrá verlo en "Productos Eliminados"`
    );
    
    if (confirmacion) {
      const exito = this.productosService.eliminarProducto(producto.id); // ✅ MÉTODO CORRECTO
      if (exito) {
        this.onSelectSede(); // ← Recarga automática
      }
    }
  }

  /** ✅ LIMPIAR FILTROS */
  limpiarFiltros() {
    this.resetFiltrosParcial();
  }

  private resetFiltrosParcial() {
  this.familiaValue = null;      // ✅ Limpiar familia
  this.buscarValue = null;       // ✅ Limpiar buscador  
  this.items = [];               // ✅ Limpiar sugerencias
  // ✅ NO toca: sedeValue, productos, productosOriginal
}

  private resetFiltros() {
    this.sedeValue = null;
    this.familiaValue = null;
    this.buscarValue = null;
    this.items = [];
    this.familias = [];
    this.productos = [];
  }

  /** ✅ CONTADORES */
  actualizarContadorSedes() {
    this.totalSedesActivas = this.sedes.length;
  }


  /** ✅ PRECIO SEVERITY (REEMPLAZA STOCK) */
  getPrecioSeverity(precio: number): "success" | "secondary" | "info" | "warn" | "danger" {
    if (precio >= 1000) return 'success';
    if (precio >= 500) return 'info';
    if (precio > 100) return 'warn';
    return 'secondary';
  }

  /** ✅ TRACK BY OPTIMIZADO */
  trackByFn(index: number, item: Producto): number {
    return item.id;
  }

  /** ✅ NAVEGACIÓN */
  irDetalle(id: number) {
    this.router.navigate(['/admin/gestion-productos/ver-detalle-producto', id]);
  }

  irCrear() {
    this.router.navigate(['/admin/gestion-productos/crear-producto']);
  }

  irEditar(id: number) {
    this.router.navigate(['/admin/gestion-productos/editar-producto', id]);
  }

  irEliminados() {
    this.router.navigate(['/admin/gestion-productos/productos-eliminados']);
  }

  /** ✅ RUTA HIJA */
  isRutaHija(): boolean {
    const url = this.router.url;
    return url.includes('crear-producto') || 
           url.includes('editar-producto') || 
           url.includes('ver-detalle-producto') ||
           url.includes('productos-eliminados');
  }

  get totalActivosSede(): number {
    if (this.sedeValue) 
    {
      return this.productosService.getTotalProductosActivosPorSede(this.sedeValue);
    }
    return 0;
  }

  get totalEliminadosSede(): number 
  {
    if (this.sedeValue) {
      return this.productosService.getTotalProductosEliminadosPorSede(this.sedeValue);
    }
    return 0;
  }

  get totalEliminados(): number {
    return this.productosService.getTotalProductosEliminados();
  }
}
