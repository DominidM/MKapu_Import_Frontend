import { Component, OnInit, signal, inject, computed, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { of, forkJoin } from 'rxjs';
import { concatMap, catchError, finalize } from 'rxjs/operators';

// PrimeNG
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { CardModule } from 'primeng/card';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';

// Servicios e Interfaces
import { Categoria } from '../../../interfaces/categoria.interface';
import { ProductoService } from '../../../services/producto.service';
import { CategoriaService } from '../../../services/categoria.service';
import { SedeService } from '../../../services/sede.service';
import {
  CreateProductoDto,
  MovimientoInventarioDto,
  UpdateProductoDto,
  UpdateProductoPreciosDto,
} from '../../../interfaces/producto.interface';
import { AlmacenService } from '../../../services/almacen.service';

@Component({
  selector: 'app-productos-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    CardModule,
    ConfirmDialog,
    ToastModule,
    SkeletonModule,
  ],
  templateUrl: './productos-formulario.html',
  styleUrl: './productos-formulario.css',
  providers: [ConfirmationService, MessageService],
})
export class ProductosFormulario implements OnInit {
  private fb             = inject(FormBuilder);
  private router         = inject(Router);
  private route          = inject(ActivatedRoute);
  private destroyRef     = inject(DestroyRef);
  private almacenService = inject(AlmacenService);
  private productoService  = inject(ProductoService);
  private categoriaService = inject(CategoriaService);
  private sedeService      = inject(SedeService);
  private messageService   = inject(MessageService);

  categorias         = signal<Categoria[]>([]);
  isSubmitting       = signal<boolean>(false);
  cargandoFormulario = signal<boolean>(false); // skeleton mientras carga en edición
  sedes              = this.sedeService.sedes;
  almacenes          = this.almacenService.sedes;
  almacenesFiltrados = signal<any[]>([]);

  // Modo edición
  esModoEdicion    = signal<boolean>(false);
  idProductoActual = signal<number | null>(null);

  // Almacén y sede guardados como signals (campos disabled no son confiables en getRawValue)
  almacenCargado = signal<number | null>(null);
  sedeCargada    = signal<number | null>(null);

  // Stock en vivo
  stockActual   = signal<number>(0);
  stockAgregado = signal<number>(0);
  stockTotal    = computed(() => this.stockActual() + this.stockAgregado());

  // Cabecera dinámica
  tituloKicker    = signal<string>('ADMINISTRADOR - ADMINISTRACIÓN - PRODUCTOS CREACIÓN');
  tituloPrincipal = signal<string>('CREAR PRODUCTO');
  iconoCabecera   = signal<string>('pi pi-plus-circle');

  productoForm: FormGroup = this.fb.group({
    codigo:          ['', Validators.required],
    anexo:           ['', Validators.required],
    descripcion:     ['', Validators.required],
    familia:         [null, Validators.required],
    precioCompra:    [0, [Validators.required, Validators.min(0)]],
    precioVenta:     [0, [Validators.required, Validators.min(0)]],
    precioUnidad:    [0, [Validators.required, Validators.min(0)]],
    precioCaja:      [0, [Validators.required, Validators.min(0)]],
    precioMayorista: [0, [Validators.required, Validators.min(0)]],
    unidadMedida:    ['UNIDAD', Validators.required],
    almacen:         [null, Validators.required],
    sede:            [null, Validators.required],
    stockInicial:    [0, [Validators.required, Validators.min(0)]],
  });

  ngOnInit() {
    // Escucha cambios de stock en tiempo real
    this.productoForm.get('stockInicial')?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(valor => this.stockAgregado.set(valor || 0));

    // Carga almacenes al cambiar sede (solo en modo creación — en edición está disabled)
    this.productoForm.get('sede')?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(idSede => {
        if (!idSede || this.esModoEdicion()) return;
        this.sedeService.loadAlmacenesParaSede(idSede)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: (rel) => {
              this.almacenesFiltrados.set(rel.almacenes.map(a => a.almacen));
              this.productoForm.patchValue({ almacen: null });
            },
            error: (err) => console.error('Error cargando almacenes', err),
          });
      });

    // Carga datos iniciales y luego verifica modo edición
    this.cargarDatosIniciales();
  }

  private cargarDatosIniciales() {
    const idParam   = this.route.snapshot.paramMap.get('id');
    const sedeParam = this.route.snapshot.queryParamMap.get('idSede');
    const esModo    = !!idParam;

    if (esModo) {
      // En edición mostramos skeleton y cargamos TODO en paralelo
      this.cargandoFormulario.set(true);
      this.esModoEdicion.set(true);
      this.idProductoActual.set(Number(idParam));
      this.tituloKicker.set('ADMINISTRADOR - ADMINISTRACIÓN - PRODUCTOS EDICIÓN');
      this.tituloPrincipal.set('EDITAR PRODUCTO');
      this.iconoCabecera.set('pi pi-pencil');

      const idSede = sedeParam ? Number(sedeParam) : this.resolverSedeLocalStorage();

      // Cargamos categorías, sedes y datos del producto EN PARALELO
      forkJoin({
        categorias: this.categoriaService.getCategorias(),
        sedes:      this.sedeService.loadSedes(),
        producto:   this.productoService.getProductoDetalleStock(Number(idParam), idSede),
      }).pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.cargandoFormulario.set(false)),
      ).subscribe({
        next: ({ categorias, producto }) => {
          this.categorias.set(categorias.categories);

          const prod  = producto.producto;
          const stock = producto.stock;

          this.stockActual.set(stock?.cantidad || 0);
          this.almacenCargado.set(Number(stock?.id_almacen) || null);
          this.sedeCargada.set(Number(stock?.id_sede) || null);

          // Cargar almacenes de la sede del producto
          if (stock?.id_sede) {
            this.sedeService.loadAlmacenesParaSede(stock.id_sede)
              .pipe(takeUntilDestroyed(this.destroyRef))
              .subscribe({
                next: (rel) => {
                  this.almacenesFiltrados.set(rel.almacenes.map(a => a.almacen));
                  // Patchear el form DESPUÉS de tener los almacenes (evita el "salto")
                  this.productoForm.patchValue({
                    codigo:          prod.codigo,
                    anexo:           prod.nombre,
                    descripcion:     prod.descripcion || '',
                    familia:         prod.categoria.id_categoria,
                    precioCompra:    prod.precio_compra,
                    precioVenta:     prod.precio_unitario,
                    precioUnidad:    prod.precio_unitario,
                    precioCaja:      prod.precio_caja,
                    precioMayorista: prod.precio_mayor,
                    unidadMedida:    prod.unidad_medida?.nombre || 'UNIDAD',
                    sede:            stock?.id_sede,
                    almacen:         stock?.id_almacen,
                    stockInicial:    0,
                  });
                  this.productoForm.get('sede')?.disable();
                  this.productoForm.get('almacen')?.disable();
                },
                error: () => {
                  // Si falla carga de almacenes igual parchamos el form
                  this.productoForm.patchValue({
                    codigo:          prod.codigo,
                    anexo:           prod.nombre,
                    descripcion:     prod.descripcion || '',
                    familia:         prod.categoria.id_categoria,
                    precioCompra:    prod.precio_compra,
                    precioVenta:     prod.precio_unitario,
                    precioUnidad:    prod.precio_unitario,
                    precioCaja:      prod.precio_caja,
                    precioMayorista: prod.precio_mayor,
                    unidadMedida:    prod.unidad_medida?.nombre || 'UNIDAD',
                    sede:            stock?.id_sede,
                    almacen:         stock?.id_almacen,
                    stockInicial:    0,
                  });
                  this.productoForm.get('sede')?.disable();
                  this.productoForm.get('almacen')?.disable();
                },
              });
          }
        },
        error: (err) => {
          console.error('Error cargando datos de edición:', err);
          this.messageService.add({
            severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los datos del producto.',
          });
        },
      });

    } else {
      // Modo creación — carga categorías y sedes en paralelo, sede por defecto
      forkJoin({
        categorias: this.categoriaService.getCategorias(),
        sedes:      this.sedeService.loadSedes(),
      }).pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: ({ categorias }) => {
            this.categorias.set(categorias.categories);
            this.setSedePorDefecto();
          },
          error: (err) => console.error('Error cargando datos iniciales', err),
        });
    }
  }

  private resolverSedeLocalStorage(): number {
    try {
      const user = JSON.parse(localStorage.getItem('user') ?? '{}');
      return user.idSede ?? 1;
    } catch { return 1; }
  }

  private setSedePorDefecto() {
    try {
      const user = JSON.parse(localStorage.getItem('user') ?? '{}');
      if (user?.idSede) {
        this.productoForm.patchValue({ sede: user.idSede });
        this.sedeService.loadAlmacenesParaSede(user.idSede)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: (rel) => this.almacenesFiltrados.set(rel.almacenes.map(a => a.almacen)),
            error: (err) => console.error(err),
          });
      }
    } catch (e) {
      console.error('Error parseando usuario', e);
    }
  }

  cancelar() {
    this.router.navigate(['/admin/gestion-productos']);
  }

  guardarProducto() {
    if (this.productoForm.invalid) {
      this.productoForm.markAllAsTouched();
      this.messageService.add({
        severity: 'error', summary: 'Error', detail: 'Complete los campos obligatorios.',
      });
      return;
    }

    this.isSubmitting.set(true);
    const fv = this.productoForm.getRawValue();

    const codigo      = fv.codigo?.trim().toUpperCase()      || '';
    const anexo       = fv.anexo?.trim().toUpperCase()       || '';
    const descripcion = fv.descripcion?.trim().toUpperCase() || '';

    if (this.esModoEdicion() && this.idProductoActual()) {
      const idProd = this.idProductoActual()!;

      const updateInfo: UpdateProductoDto = {
        id_producto:  idProd,
        id_categoria: fv.familia,
        codigo, anexo, descripcion,
        uni_med: fv.unidadMedida,
      };

      const updatePrecios: UpdateProductoPreciosDto = {
        id_producto: idProd,
        pre_compra:  fv.precioCompra,
        pre_venta:   fv.precioVenta,
        pre_unit:    fv.precioUnidad,
        pre_may:     fv.precioMayorista,
        pre_caja:    fv.precioCaja,
      };

      forkJoin([
        this.productoService.actualizarProductoInfo(updateInfo),
        this.productoService.actualizarProductoPrecios(updatePrecios),
      ]).pipe(
        concatMap(() => {
          if (fv.stockInicial > 0) {
            let userId = 1;
            try {
              const user = JSON.parse(localStorage.getItem('user') ?? '{}');
              userId = Number(user.id ?? user.userId ?? user.id_usuario ?? 1);
            } catch { userId = 1; }

            const warehouseId = Number(fv.almacen) || this.almacenCargado() || 0;
            const idSede      = Number(fv.sede)    || this.sedeCargada()    || 0;
            const quantity    = Number(fv.stockInicial);

            if (!warehouseId || !idSede || !quantity) {
              this.messageService.add({
                severity: 'warn', summary: 'Advertencia',
                detail: 'No se pudo determinar almacén o sede para el ajuste.',
              });
              return of(null);
            }

            return this.productoService.registrarAjusteInventario({
              productId: idProd, warehouseId, idSede, quantity,
              reason: `Ajuste de stock - ${codigo}`, userId,
            });
          }
          return of(null);
        }),
        catchError(err => {
          const detalle = err?.error?.message || 'Hubo un problema al actualizar.';
          this.messageService.add({ severity: 'error', summary: 'Error', detail: detalle });
          throw err;
        }),
        finalize(() => this.isSubmitting.set(false)),
        takeUntilDestroyed(this.destroyRef),
      ).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success', summary: 'Éxito', detail: 'Producto actualizado correctamente.',
          });
          setTimeout(() => this.router.navigate(['/admin/gestion-productos']), 1500);
        },
      });

    } else {
      const productoDto: CreateProductoDto = {
        id_categoria: fv.familia,
        codigo, anexo, descripcion,
        pre_compra:  fv.precioCompra,
        pre_venta:   fv.precioVenta,
        pre_unit:    fv.precioUnidad,
        pre_may:     fv.precioMayorista,
        pre_caja:    fv.precioCaja,
        uni_med:     fv.unidadMedida,
      };

      this.productoService.crearProducto(productoDto).pipe(
        concatMap(productoCreado => {
          if (fv.stockInicial <= 0) return of(productoCreado);
          const movDto: MovimientoInventarioDto = {
            originType: 'COMPRA', refId: 101,
            refTable: 'ordenes_compra',
            observation: 'Ingreso inicial de producto',
            items: [{
              productId:   productoCreado.id_producto,
              warehouseId: fv.almacen,
              sedeId:      fv.sede,
              quantity:    fv.stockInicial,
              type:        'INGRESO',
            }],
          };
          return this.productoService.registrarIngresoInventario(movDto);
        }),
        catchError(err => {
          const detalle = err?.error?.message || 'Hubo un error al crear.';
          this.messageService.add({ severity: 'error', summary: 'Error', detail: detalle });
          throw err;
        }),
        finalize(() => this.isSubmitting.set(false)),
        takeUntilDestroyed(this.destroyRef),
      ).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success', summary: 'Éxito', detail: 'Producto creado correctamente.',
          });
          setTimeout(() => this.router.navigate(['/admin/gestion-productos']), 1500);
        },
      });
    }
  }
}