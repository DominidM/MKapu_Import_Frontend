import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Observable, Subject, filter, map, takeUntil } from 'rxjs';

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
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';

import { ProductosService, Producto } from '../../../../core/services/productos.service';
import { DialogStockSedes } from '../../../shared/dialog-stock-sedes/dialog-stock-sedes';
import { CategoriaService } from '../../../services/categoria.service';
import { Categoria, CategoriaResponse } from '../../../interfaces/categoria.interface';
import { ProductoService } from '../../../services/producto.service';
import { ProductoAutocomplete, ProductoInterface, ProductoResponse, ProductoStock } from '../../../interfaces/producto.interface';
import { SedeService } from '../../../services/sede.service';
import { Headquarter, HeadquarterResponse } from '../../../interfaces/sedes.interface';

interface ProductoAgrupado {
  codigo: string;
  nombre: string;
  familia: string;
  precioVenta: number;
  stockTotal: number;
  variantes: Producto[];
  cantidadSedes: number;
}

@Component({
  selector: 'app-gestion-productos',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ButtonModule, TableModule, CardModule, TagModule,
    AutoCompleteModule, SelectModule, ToggleButtonModule, ProgressSpinnerModule,
    InputTextModule, TooltipModule, PaginatorModule, RouterOutlet, RouterModule,
    ConfirmDialog, DialogModule, ToastModule, DialogStockSedes
  ],
  templateUrl: './gestion-listado.html',
  styleUrl: './gestion-listado.css',
  providers: [ConfirmationService, MessageService]
})
export class GestionListado implements OnInit {
  //private destroy$ = new Subject<void>();

  tituloKicker = 'ADMINISTRADOR - ADMINISTRACIÓN - PRODUCTOS ACTIVOS';
  subtituloKicker = 'GESTION DE PRODUCTOS'
  iconoCabecera = 'pi pi-building';

  productosAgrupados: ProductoAgrupado[] = [];
  productosAgrupadosFiltrados: ProductoAgrupado[] = [];
  productosAgrupadosPaginados: ProductoAgrupado[] = [];

  loading = false;
  vistaLista: boolean = true;

  mostrarDialogStock = false;
  variantesSeleccionadas: Producto[] = [];
  nombreProductoSeleccionado = '';

  mostrarDialogEliminar = false;
  productoAEliminar: ProductoAgrupado | null = null;

  productosEliminados: Producto[] = [];
  productosEliminadosAgrupados: ProductoAgrupado[] = [];
  productosEliminadosFiltrados: Producto[] = [];
  loadingEliminados = false;
  vistaListaEliminados: boolean = true;
  buscarValueEliminados: string | null = null;

  sedeValue: string | null = null;
  familiaValue: string | null = null;
  buscarValue: string | null = null;
  items: ProductoAgrupado[] = [];

  sedesOptions: { label: string, value: string | null }[] = [];
  familias: { label: string, value: string }[] = [];

  familiaValueEliminados: string | null = null;
  familiasEliminados: { label: string, value: string | null }[] = [];

  totalSedesActivas = 0;
  totalProductosActivos = 0;

  rows = 10;
  first = 0;
  totalRecords = 0;
  rowsEliminados = 10;
  firstEliminados = 0;
  totalRecordsEliminados = 0;

  esVistaEliminados = false;


  // nuevas variables 

  familias$!: Observable<Categoria[]>;
  familiasTotal$!: Observable<number>;
  productos$!: Observable<ProductoInterface[]>;
  productosStock$!: Observable<ProductoStock[]>;
  productosStockTotal$!: Observable<number>;
  sedes$!: Observable<Headquarter[]>;
  sedesTotal$!: Observable<number>;
  page: number = 1;
  size: number = 5;
  idSede: number = 1;
  productosAutocomplete$!: Observable<ProductoAutocomplete[]>;
  productosAutocomplete: ProductoAutocomplete[] = [];
  // ----------------

  constructor(
    public router: Router,
    private activatedRoute: ActivatedRoute,
    private productosService: ProductosService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private categoriaService: CategoriaService,
    private productoService: ProductoService,
    private sedeService: SedeService
  ) {
    this.actualizarCabecera();
  }

  ngOnInit() {
    this.getSedes()
    this.getProductos();
    this.getCategories();
    this.getProductosStock()
    //this.cargarProductosAgrupados();
    //this.loadingEliminados = false;
    this.actualizarCabecera();
    /*
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event: NavigationEnd) => {
        this.actualizarCabecera();
        
        if (event.url === '/admin/gestion-productos' || 
            event.url.startsWith('/admin/gestion-productos?')) {
          this.cargarProductosAgrupados();
        }
        
        this.cdr.detectChanges();
      });
    */
  }

  getSedes() {
    const response$ = this.sedeService.getSedes();

    this.sedes$ = response$.pipe(
      map(resp => resp.headquarters)
    );

    this.sedesTotal$ = response$.pipe(
      map(resp => resp.headquarters.length)
    );

    
    this.sedes$ .subscribe(data => {
      console.log("sedes reales:", data);
    });

  }

  getCategories() {
    const response$ = this.categoriaService.getCategorias();

    this.familias$ = response$.pipe(
      map(resp => resp.categories)
    );

    this.familiasTotal$ = response$.pipe(
      map(resp => resp.total)
    );
  }

  getProductos() {
    this.productos$ = this.productoService
      .getProductos(this.page, this.size)
      .pipe(
        map(resp => resp.products)
      );
  }

  getProductosStock() {
    const response$ = this.productoService.getProductosConStock(this.idSede, this.page, this.size);

    this.productosStock$ = response$.pipe(
      map(resp => resp.data)
    );

    this.productosStockTotal$ = response$.pipe(
      map(resp => resp.data.length)
    );

    this.productosStock$.subscribe(data => {
      console.log("productos reales:", data);
    });
  }
  /*
  ngAfterViewInit() {
    this.cdr.detectChanges();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.confirmationService.close();
  }
  */



  private actualizarCabecera() {

    Promise.resolve().then(() => {
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
      //this.cdr.detectChanges();
    });
  }


  cargarProductosAgrupados() {
    this.loading = true;

    const todosProductos = this.productosService.getProductos(undefined, 'Activo');

    const productosPorCodigo = new Map<string, Producto[]>();

    todosProductos.forEach(p => {
      if (!productosPorCodigo.has(p.codigo)) {
        productosPorCodigo.set(p.codigo, []);
      }
      productosPorCodigo.get(p.codigo)!.push(p);
    });

    this.productosAgrupados = Array.from(productosPorCodigo.entries()).map(([codigo, variantes]) => {
      const primera = variantes[0];
      const stockTotal = variantes.reduce((sum, v) => sum + (v.stockTotal || 0), 0);
      const precioPromedio = variantes.reduce((sum, v) => sum + v.precioVenta, 0) / variantes.length;

      return {
        codigo: codigo,
        nombre: primera.nombre,
        familia: primera.familia,
        precioVenta: precioPromedio,
        stockTotal: stockTotal,
        variantes: variantes,
        cantidadSedes: primera.cantidadSedes || variantes.length
      };
    });

    this.cargarSedes();
    this.familias = this.productosService.getFamilias().map(f => ({ label: f, value: f }));
    this.totalSedesActivas = this.productosService.getSedes().length;
    this.totalProductosActivos = this.productosAgrupados.length;

    this.aplicarTodosLosFiltros();
    this.loading = false;
    this.resetPaginador();
  }

  cargarSedes() {
    const sedesData = this.productosService.getSedes();
    this.sedesOptions = [
      { label: 'Todas las sedes', value: null },
      ...sedesData.map(sede => ({
        label: this.formatearNombreSede(sede),
        value: sede
      }))
    ];
  }

  formatearNombreSede(sede: string): string {
    return sede
      .split(' ')
      .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase())
      .join(' ');
  }

  onSelectSede() {
    this.aplicarTodosLosFiltros();
  }

  irEliminados() {
    this.esVistaEliminados = true;
    this.vistaListaEliminados = true;
    //this.cargarProductosEliminados();
    this.cargarFamiliasEliminados();
    this.actualizarCabecera();
  }

  volverDesdeEliminados() {
    this.esVistaEliminados = false;
    this.buscarValueEliminados = null;
    this.familiaValueEliminados = null;
    this.actualizarCabecera();
    this.cargarProductosAgrupados();
  }

  /*
  cargarProductosEliminados() {
    this.loadingEliminados = true;
    this.cdr.detectChanges();
    
    setTimeout(() => {
      try {
        let productos = this.productosService.getProductosEliminados();
        
        if (this.familiaValueEliminados) {
          productos = productos.filter(p => p.familia === this.familiaValueEliminados);
        }
        
        this.productosEliminados = productos;
        this.productosEliminadosFiltrados = [...productos];
        
        this.agruparProductosEliminados();
        
        this.totalRecordsEliminados = this.productosEliminadosAgrupados.length;
        this.resetPaginadorEliminados();
      } catch (error) {
        this.productosEliminados = [];
        this.productosEliminadosFiltrados = [];
        this.productosEliminadosAgrupados = [];
        this.totalRecordsEliminados = 0;
      } finally {
        this.loadingEliminados = false;
        this.cdr.detectChanges();
      }
    }, 300);
  }
  */

  agruparProductosEliminados() {
    const productosPorCodigo = new Map<string, Producto[]>();

    this.productosEliminadosFiltrados.forEach(p => {
      if (!productosPorCodigo.has(p.codigo)) {
        productosPorCodigo.set(p.codigo, []);
      }
      productosPorCodigo.get(p.codigo)!.push(p);
    });

    this.productosEliminadosAgrupados = Array.from(productosPorCodigo.entries()).map(([codigo, variantes]) => {
      const primera = variantes[0];
      const stockTotal = variantes.reduce((sum, v) => sum + (v.stockTotal || 0), 0);
      const precioPromedio = variantes.reduce((sum, v) => sum + v.precioVenta, 0) / variantes.length;

      return {
        codigo: codigo,
        nombre: primera.nombre,
        familia: primera.familia,
        precioVenta: precioPromedio,
        stockTotal: stockTotal,
        variantes: variantes,
        cantidadSedes: primera.cantidadSedes || variantes.length
      };
    });
  }

  cargarFamiliasEliminados() {
    const productos = this.productosService.getProductosEliminados();
    const familiasUnicas = [...new Set(productos.map(p => p.familia))];

    this.familiasEliminados = [
      { label: 'Todas las familias', value: null },
      ...familiasUnicas.map(familia => ({ label: familia, value: familia }))
    ];
  }

  /*
  onSelectFamiliaEliminados() {
    this.cargarProductosEliminados();
  }
    */

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
    if (this.productosAgrupadosFiltrados.length === 0) {
      this.productosAgrupadosPaginados = [];
      this.totalRecords = 0;
      return;
    }
    this.totalRecords = this.productosAgrupadosFiltrados.length;
    this.productosAgrupadosPaginados = this.productosAgrupadosFiltrados.slice(this.first, this.first + this.rows);
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
    if (this.productosEliminadosAgrupados.length === 0) {
      this.totalRecordsEliminados = 0;
      return;
    }
    this.totalRecordsEliminados = this.productosEliminadosAgrupados.length;
  }

  private resetPaginadorEliminados() {
    this.rowsEliminados = 10;
    this.firstEliminados = 0;
  }

  onSelectFamilia() {
    console.log("familia seleccionada:", this.familiaValue)
    this.aplicarTodosLosFiltros();
  }

  aplicarTodosLosFiltros() {
    if (this.productosAgrupados.length === 0) {
      this.productosAgrupadosFiltrados = [];
      this.aplicarPaginacion();
      return;
    }

    this.productosAgrupadosFiltrados = this.productosAgrupados.filter((p: ProductoAgrupado) => {
      const matchesSede = !this.sedeValue ||
        p.variantes.some(v => v.variantes?.some(vr => vr.sede === this.sedeValue));

      const matchesFamilia = !this.familiaValue || p.familia === this.familiaValue;

      let query = '';
      if (this.buscarValue && typeof this.buscarValue === 'string') {
        query = this.buscarValue.toLowerCase();
      }

      const matchesBusqueda = !query ||
        p.nombre.toLowerCase().includes(query) ||
        p.codigo.toLowerCase().includes(query) ||
        p.familia.toLowerCase().includes(query);

      return matchesSede && matchesFamilia && matchesBusqueda;
    });

    if (this.sedeValue) {
      this.productosAgrupadosFiltrados = this.productosAgrupadosFiltrados.map(p => {
        const variantesFiltradas = p.variantes.filter(v =>
          v.variantes?.some(vr => vr.sede === this.sedeValue)
        );
        const stockFiltrado = variantesFiltradas.reduce((sum, v) => sum + (v.stockTotal || 0), 0);

        return {
          ...p,
          stockTotal: stockFiltrado,
          variantes: variantesFiltradas,
          cantidadSedes: variantesFiltradas[0]?.variantes?.filter(vr => vr.sede === this.sedeValue).length || 0
        };
      });
    }

    this.aplicarPaginacion();
  }

  buscarProductos(event: any) {
    const query = event.query;

    if (!query || !this.idSede) return;

    this.productoService
      .getProductosAutocomplete(query, this.idSede)
      .pipe(map(resp => resp.data))
      .subscribe(data => {
        this.productosAutocomplete = data;
      });
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
    } else {
      const query = this.buscarValueEliminados.toLowerCase();
      this.productosEliminadosFiltrados = this.productosEliminados.filter(p =>
        p.nombre.toLowerCase().includes(query) ||
        p.codigo.toLowerCase().includes(query)
      );
    }

    this.agruparProductosEliminados();
    this.totalRecordsEliminados = this.productosEliminadosAgrupados.length;
  }

  verStockPorSede(producto: ProductoAgrupado, event: Event) {
    event.stopPropagation();
    this.variantesSeleccionadas = producto.variantes;
    this.nombreProductoSeleccionado = producto.nombre;
    this.mostrarDialogStock = true;
  }

  getStockSeverity(stock: number): 'success' | 'warn' | 'danger' {
    if (stock > 30) return 'success';
    if (stock > 10) return 'warn';
    return 'danger';
  }

  eliminarProducto(producto: ProductoAgrupado, event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `¿Estás seguro de eliminar el producto "<strong>${producto.nombre}</strong>"?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      rejectLabel: 'Cancelar',
      acceptLabel: 'Continuar',
      acceptButtonProps: { severity: 'danger' },
      rejectButtonProps: { severity: 'secondary', outlined: true },
      accept: () => {
        if (producto.cantidadSedes === 1 && producto.variantes[0].id) {
          this.ejecutarEliminacion(producto.variantes[0]);
        } else {
          this.productoAEliminar = producto;
          this.mostrarDialogEliminar = true;
        }
      }
    });
  }

  seleccionarSedeEliminar(variante: Producto) {
    if (!variante.id) return;

    const sedeNombre = variante.variantes?.[0]?.sede || 'desconocida';

    this.confirmationService.confirm({
      message: `¿Eliminar el producto "<strong>${variante.nombre}</strong>" de la sede <strong>${this.formatearNombreSede(sedeNombre)}</strong>?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      rejectLabel: 'Cancelar',
      acceptLabel: 'Eliminar',
      acceptButtonProps: { severity: 'danger' },
      rejectButtonProps: { severity: 'secondary', outlined: true },
      accept: () => {
        this.ejecutarEliminacion(variante);
        this.cerrarDialogEliminar();
      }
    });
  }

  eliminarTodasLasSedes() {
    if (!this.productoAEliminar) return;

    this.confirmationService.confirm({
      message: `¿Eliminar el producto "<strong>${this.productoAEliminar.nombre}</strong>" de <strong>TODAS LAS SEDES</strong>?<br><br>Esta acción eliminará ${this.productoAEliminar.cantidadSedes} registros.`,
      header: 'Confirmar Eliminación Total',
      icon: 'pi pi-exclamation-triangle',
      rejectLabel: 'Cancelar',
      acceptLabel: 'Eliminar Todo',
      acceptButtonProps: { severity: 'danger' },
      rejectButtonProps: { severity: 'secondary', outlined: true },
      accept: () => {
        let exitoso = 0;
        this.productoAEliminar!.variantes.forEach(variante => {
          if (variante.id && this.productosService.eliminarProducto(variante.id)) {
            exitoso++;
          }
        });

        if (exitoso > 0) {
          this.messageService.add({
            severity: 'success',
            summary: 'Productos Eliminados',
            detail: `"${this.productoAEliminar!.nombre}" eliminado de ${exitoso} sedes`,
            life: 3000
          });
          this.cargarProductosAgrupados();
        }

        this.cerrarDialogEliminar();
      }
    });
  }

  ejecutarEliminacion(producto: Producto) {
    if (!producto.id) return;

    const sedeNombre = producto.variantes?.[0]?.sede || 'desconocida';
    const exito = this.productosService.eliminarProducto(producto.id);

    if (exito) {
      this.messageService.add({
        severity: 'success',
        summary: 'Producto Eliminado',
        detail: `"${producto.nombre}" eliminado de ${this.formatearNombreSede(sedeNombre)}`,
        life: 3000
      });
      this.cargarProductosAgrupados();
    }
  }

  cerrarDialogEliminar() {
    this.mostrarDialogEliminar = false;
    this.productoAEliminar = null;
  }

  restaurarProducto(producto: ProductoAgrupado, event: Event) {
    const varianteId = producto.variantes[0]?.id;
    if (!varianteId) return;

    if (producto.cantidadSedes === 1) {
      this.confirmationService.confirm({
        target: event.target as EventTarget,
        message: `¿Restaurar "<strong>${producto.nombre}</strong>"?`,
        header: 'Confirmar Restauración',
        icon: 'pi pi-info-circle',
        rejectLabel: 'Cancelar',
        acceptLabel: 'Restaurar',
        acceptButtonProps: { severity: 'warning' },
        rejectButtonProps: { severity: 'secondary', outlined: true },
        accept: () => {
          const exito = this.productosService.restaurarProducto(varianteId);
          if (exito) {
            this.messageService.add({
              severity: 'success',
              summary: 'Producto Restaurado',
              detail: `"${producto.nombre}" restaurado exitosamente`,
              life: 3000
            });
            //this.cargarProductosEliminados();
          }
        }
      });
    } else {
      this.messageService.add({
        severity: 'info',
        summary: 'Restauración por Sede',
        detail: 'Este producto tiene múltiples sedes. Usa "Editar" para restaurar sedes específicas.',
        life: 4000
      });
    }
  }

  limpiarFiltros() {
    if (this.esVistaEliminados) {
      this.buscarValueEliminados = null;
      this.familiaValueEliminados = null;
      this.filtrarEliminados();
      //this.cargarProductosEliminados();
    } else {
      this.sedeValue = null;
      this.familiaValue = null;
      this.buscarValue = null;
      this.items = [];
      this.aplicarTodosLosFiltros();
    }
  }

  trackByFn(index: number, item: any): string {
    return item.codigo || item.id;
  }

  irDetalle(id: number) {
    setTimeout(() => {
      this.router.navigate(['/admin/gestion-productos/ver-detalle-producto', id]);
      this.actualizarCabecera();
      //this.cdr.detectChanges();
    }, 0);
  }

  irCrear() {
    setTimeout(() => {
      this.router.navigate(['/admin/gestion-productos/crear-producto']);
      this.actualizarCabecera();
      //this.cdr.detectChanges();
    }, 0);
  }

  irEditar(id: number) {
    setTimeout(() => {
      this.router.navigate(['/admin/gestion-productos/editar-producto', id], {
        queryParams: { returnUrl: '/admin/gestion-productos' }
      });
      this.actualizarCabecera();
      //this.cdr.detectChanges();
    }, 0);
  }

  isRutaHija(): boolean {
    const url = this.router.url;
    return url.includes('crear-producto') ||
      url.includes('editar-producto') ||
      url.includes('ver-detalle-producto');
  }

  get stockTotalGeneral(): number {
    return this.productosAgrupados.reduce((sum, p) => sum + p.stockTotal, 0);
  }

  get totalFamilias(): number {
    return this.familias.length;
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
