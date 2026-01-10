import { Component, OnInit, OnDestroy, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, filter } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { SelectModule } from 'primeng/select';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { PaginatorModule } from 'primeng/paginator';
import { RouterOutlet, RouterModule } from '@angular/router';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';

import { ProductosService, Producto } from '../../../../core/services/productos.service';

@Component({
  selector: 'app-gestion-productos',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ButtonModule, TableModule, CardModule, TagModule,
    AutoCompleteModule, SelectModule, ToggleButtonModule, ProgressSpinnerModule,
    InputTextModule, TooltipModule, PaginatorModule, RouterOutlet, RouterModule,
    ConfirmDialog, ToastModule
  ],
  templateUrl: './gestion-listado.html',
  styleUrl: './gestion-listado.css',
  providers: [ConfirmationService, MessageService]
})
export class GestionListado implements OnInit, OnDestroy, AfterViewInit {
  private destroy$ = new Subject<void>();

  tituloKicker = 'ADMINISTRADOR - ADMINISTRACIÓN - PRODUCTOS ACTIVOS';
  iconoCabecera = 'pi pi-building';

  productos: Producto[] = [];
  productosOriginal: Producto[] = [];
  productosFiltrados: Producto[] = [];
  loading = false;
  vistaLista = true;

  productosEliminados: Producto[] = [];
  productosEliminadosFiltrados: Producto[] = [];
  loadingEliminados = false;
  vistaListaEliminados = true;
  buscarValueEliminados: string | null = null;

  sedeValue: string | null = null;
  familiaValue: string | null = null;
  buscarValue: string | null = null;
  items: Producto[] = [];

  sedes: {label: string, value: string}[] = [];
  familias: {label: string, value: string}[] = [];

  familiaValueEliminados: string | null = null;
  familiasEliminados: {label: string, value: string | null}[] = [];

  totalSedesActivas = 0;
  totalProductosActivos = 0;
  resumenSedes: {sede: string, activos: number, eliminados: number, total: number}[] = [];

  rows = 10;
  first = 0;
  totalRecords = 0;
  rowsEliminados = 10;
  firstEliminados = 0;
  totalRecordsEliminados = 0;

  esVistaEliminados = false;
  sedePersistente: string | null = null;

  constructor(
    public router: Router,
    private activatedRoute: ActivatedRoute,
    private productosService: ProductosService,
    private cdr: ChangeDetectorRef,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {
    this.actualizarCabecera();
  }

  ngOnInit() {
    this.cargarProductos();
    this.loadingEliminados = false;
    this.actualizarCabecera();
    
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.actualizarCabecera();
        this.cdr.detectChanges();
      });
  }

  ngAfterViewInit() {
    this.cdr.detectChanges();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.confirmationService.close();
  }

  private actualizarCabecera() {
    setTimeout(() => {
      if (this.esVistaEliminados) {
        this.tituloKicker = 'ADMINISTRADOR - ADMINISTRACIÓN - PRODUCTOS ELIMINADOS';
        this.iconoCabecera = 'pi pi-trash';
      } else {
        const url = this.router.url;
        
        if (url.includes('crear-producto')) {
          this.tituloKicker = 'ADMINISTRADOR - ADMINISTRACIÓN - PRODUCTOS CREACIÓN';
          this.iconoCabecera = 'pi pi-plus-circle';
        } else if (url.includes('editar-producto')) {
          this.tituloKicker = 'ADMINISTRADOR - ADMINISTRACIÓN - PRODUCTOS EDICIÓN';
          this.iconoCabecera = 'pi pi-pencil';
        } else if (url.includes('ver-detalle-producto')) {
          this.tituloKicker = 'ADMINISTRADOR - ADMINISTRACIÓN - PRODUCTOS DETALLE';
          this.iconoCabecera = 'pi pi-eye';
        } else {
          this.tituloKicker = 'ADMINISTRADOR - ADMINISTRACIÓN - PRODUCTOS ACTIVOS';
          this.iconoCabecera = 'pi pi-building';
        }
      }
      this.cdr.detectChanges();
    }, 0);
  }

  irEliminados() {
    this.sedePersistente = this.sedeValue;
    this.esVistaEliminados = true;
    this.vistaListaEliminados = true;
    this.cargarProductosEliminados();
    this.cargarFamiliasEliminados();
    this.actualizarCabecera();
  }

  volverDesdeEliminados() {
    this.esVistaEliminados = false;
    this.buscarValueEliminados = null;
    this.familiaValueEliminados = null;
    this.actualizarCabecera();
    
    if (this.sedeValue) {
      this.onSelectSede();
    }
  }

  cargarProductos() {
    this.loading = true;
    this.productosOriginal = this.productosService.getProductos(undefined, 'Activo');
    
    this.cargarSedes();
    
    this.familias = this.productosService.getFamilias().map(f => ({ label: f, value: f }));
    this.resumenSedes = this.productosService.getResumenPorSedes();
    this.totalSedesActivas = this.sedes.length;
    this.totalProductosActivos = this.productosService.getTotalProductosActivos();
    this.loading = false;
    this.resetPaginador();
  }

  cargarSedes() {
    const sedesData = this.productosService.getSedes();
    this.sedes = sedesData.map(sede => ({
      label: this.formatearNombreSede(sede),
      value: sede
    }));
  }

  formatearNombreSede(sede: string): string {
    return sede
      .split(' ')
      .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase())
      .join(' ');
  }

  cargarProductosEliminados() {
    if (!this.sedeValue) {
      this.productosEliminados = [];
      this.productosEliminadosFiltrados = [];
      this.totalRecordsEliminados = 0;
      this.loadingEliminados = false;
      this.cdr.detectChanges();
      return;
    }
    
    this.loadingEliminados = true;
    this.cdr.detectChanges();
    
    setTimeout(() => {
      try {
        let productos = this.productosService.getProductosEliminados(this.sedeValue!);
        
        if (this.familiaValueEliminados) {
          productos = productos.filter(p => p.familia === this.familiaValueEliminados);
        }
        
        this.productosEliminados = productos;
        this.productosEliminadosFiltrados = [...productos];
        this.totalRecordsEliminados = productos.length;
        this.resetPaginadorEliminados();
      } catch (error) {
        this.productosEliminados = [];
        this.productosEliminadosFiltrados = [];
        this.totalRecordsEliminados = 0;
      } finally {
        this.loadingEliminados = false;
        this.cdr.detectChanges();
      }
    }, 300);
  }

  cargarFamiliasEliminados() {
    const productos = this.productosService.getProductosEliminados(this.sedeValue!);
    const familiasUnicas = [...new Set(productos.map(p => p.familia))];
    
    this.familiasEliminados = [
      { label: 'Todas las familias', value: null },
      ...familiasUnicas.map(familia => ({ label: familia, value: familia }))
    ];
  }

  onSelectFamiliaEliminados() {
    this.cargarProductosEliminados();
  }

  onPageChange(event: any) {
    this.first = event.first;
    this.rows = event.rows || 10;
    this.aplicarPaginacion();
  }

  cambiarFilas(rows: number) {
    this.rows = rows;
    this.first = 0;
    this.aplicarPaginacion();
  }

  private aplicarPaginacion() {
    if (this.productosFiltrados.length === 0) {
      this.productos = [];
      this.totalRecords = 0;
      return;
    }
    this.totalRecords = this.productosFiltrados.length;
    this.productos = this.productosFiltrados.slice(this.first, this.first + this.rows);
  }

  private resetPaginador() {
    this.rows = 10;
    this.first = 0;
  }

  onPageChangeEliminados(event: any) {
    this.firstEliminados = event.first;
    this.rowsEliminados = event.rows || 10;
    this.aplicarPaginacionEliminados();
  }

  cambiarFilasEliminados(rows: number) {
    this.rowsEliminados = rows;
    this.firstEliminados = 0;
    this.aplicarPaginacionEliminados();
  }

  private aplicarPaginacionEliminados() {
    if (this.productosEliminadosFiltrados.length === 0) {
      this.totalRecordsEliminados = 0;
      return;
    }
    this.totalRecordsEliminados = this.productosEliminadosFiltrados.length;
  }

  private resetPaginadorEliminados() {
    this.rowsEliminados = 10;
    this.firstEliminados = 0;
  }

  onSelectSede() {
    if (!this.sedeValue) {
      this.resetFiltros();
      return;
    }

    if (this.esVistaEliminados) {
      this.familiaValueEliminados = null;
      this.cargarProductosEliminados();
      this.cargarFamiliasEliminados();
    } else {
      this.productosOriginal = this.productosService.getProductos(this.sedeValue, 'Activo');
      this.familias = this.productosService.getFamilias(this.sedeValue!)
        .map(f => ({ label: f, value: f }));
      this.aplicarTodosLosFiltros();
    }
  }

  onSelectFamilia() {
    this.aplicarTodosLosFiltros();
  }

  aplicarTodosLosFiltros() {
    if (!this.sedeValue || this.productosOriginal.length === 0) {
      this.productosFiltrados = [];
      this.aplicarPaginacion();
      return;
    }

    this.productosFiltrados = this.productosOriginal.filter((p: Producto) => {
      const matchesFamilia = !this.familiaValue || p.familia === this.familiaValue;
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
    this.aplicarPaginacion();
  }

  searchBuscar(event: any) {
    const query = event.query?.toLowerCase() || '';
    const disponibles = this.sedeValue 
      ? this.productosService.getProductos(this.sedeValue, 'Activo')
      : this.productosService.getProductos(undefined, 'Activo');
    this.items = disponibles.filter((p: Producto) => 
      p.nombre.toLowerCase().includes(query) || 
      p.codigo.toLowerCase().includes(query) ||
      p.familia.toLowerCase().includes(query)
    ).slice(0, 10);
  }

  filtrarPorBusqueda(event: any) {
    if (event?.value) {
      this.buscarValue = event.value.nombre;
      this.aplicarTodosLosFiltros();
    }
  }

  filtrarEliminados() {
    if (!this.buscarValueEliminados || this.buscarValueEliminados.trim() === '') {
      this.productosEliminadosFiltrados = [...this.productosEliminados];
      this.totalRecordsEliminados = this.productosEliminados.length;
      return;
    }
    const query = this.buscarValueEliminados.toLowerCase();
    this.productosEliminadosFiltrados = this.productosEliminados.filter(p => 
      p.nombre.toLowerCase().includes(query) || 
      p.codigo.toLowerCase().includes(query)
    );
    this.totalRecordsEliminados = this.productosEliminadosFiltrados.length;
  }

  eliminarProducto(producto: Producto, event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `¿Seguro que deseas eliminar el producto "${producto.nombre}"?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      rejectLabel: 'Cancelar',
      acceptLabel: 'Eliminar',
      acceptButtonProps: { severity: 'danger' },
      rejectButtonProps: { severity: 'secondary', outlined: true },
      accept: () => {
        const exito = this.productosService.eliminarProducto(producto.id);
        if (exito) {
          this.messageService.add({
            severity: 'success',
            summary: 'Producto Eliminado',
            detail: `"${producto.nombre}" movido a eliminados`,
            life: 3000
          });
          this.onSelectSede();
        }
      },
      reject: () => {
        this.messageService.add({
          severity: 'info',
          summary: 'Cancelado',
          detail: 'Eliminación cancelada',
          life: 2000
        });
      }
    });
  }

  restaurarProducto(producto: Producto, event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `¿Restaurar <strong>${producto.nombre}</strong>?`,
      header: 'Confirmar Restauración',
      icon: 'pi pi-info-circle',
      rejectLabel: 'Cancelar',
      acceptLabel: 'Restaurar',
      acceptButtonProps: { severity: 'warning' },
      rejectButtonProps: { severity: 'secondary', outlined: true },
      accept: () => {
        const exito = this.productosService.restaurarProducto(producto.id);
        if (exito) {
          this.messageService.add({
            severity: 'success',
            summary: 'Producto Restaurado',
            detail: `"${producto.nombre}" restaurado exitosamente`,
            life: 3000
          });
          this.cargarProductosEliminados();
        }
      },
      reject: () => {
        this.messageService.add({
          severity: 'info',
          summary: 'Cancelado',
          detail: 'Restauración cancelada',
          life: 2000
        });
      }
    });
  }

  limpiarFiltros() {
    if (this.esVistaEliminados) {
      this.buscarValueEliminados = null;
      this.familiaValueEliminados = null;
      this.filtrarEliminados();
      this.cargarProductosEliminados();
    } else {
      this.resetFiltrosParcial();
      this.aplicarTodosLosFiltros();
    }
  }

  private resetFiltrosParcial() {
    this.familiaValue = null;
    this.buscarValue = null;
    this.buscarValueEliminados = null;
    this.items = [];
  }

  private resetFiltros() {
    this.sedeValue = null;
    this.resetFiltrosParcial();
    this.familias = [];
    this.productosFiltrados = [];
    this.productos = [];
  }

  trackByFn(index: number, item: Producto): number {
    return item.id;
  }

  irDetalle(id: number) { 
    setTimeout(() => {
      this.router.navigate(['/admin/gestion-productos/ver-detalle-producto', id]);
      this.actualizarCabecera();
      this.cdr.detectChanges();
    }, 0);
  }
  
  irCrear() { 
    setTimeout(() => {
      this.router.navigate(['/admin/gestion-productos/crear-producto']);
      this.actualizarCabecera();
      this.cdr.detectChanges();
    }, 0);
  }
  
  irEditar(id: number) { 
    setTimeout(() => {
      this.router.navigate(['/admin/gestion-productos/editar-producto', id], {
        queryParams: { returnUrl: '/admin/gestion-productos' }
      });
      this.actualizarCabecera();
      this.cdr.detectChanges();
    }, 0);
  }

  isRutaHija(): boolean {
    const url = this.router.url;
    return url.includes('crear-producto') || 
           url.includes('editar-producto') || 
           url.includes('ver-detalle-producto');
  }

  get totalActivosSede(): number {
    return this.sedeValue ? this.productosService.getTotalProductosActivosPorSede(this.sedeValue) : 0;
  }

  get totalEliminadosSede(): number {
    return this.sedeValue ? this.productosService.getTotalProductosEliminadosPorSede(this.sedeValue) : 0;
  }

  get totalEliminados(): number {
    return this.productosService.getTotalProductosEliminados();
  }

  getLast(): number {
    return Math.min(this.first + this.rows, this.totalRecords);
  }

  getLastEliminados(): number {
    return Math.min(this.firstEliminados + this.rowsEliminados, this.totalRecordsEliminados);
  }
}
