import { Component, OnInit, signal, inject, computed, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { of, forkJoin } from 'rxjs';
import { concatMap, catchError, finalize } from 'rxjs/operators';

import { InputTextModule }    from 'primeng/inputtext';
import { InputNumberModule }  from 'primeng/inputnumber';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { SelectModule }       from 'primeng/select';
import { CardModule }         from 'primeng/card';
import { ConfirmDialog }      from 'primeng/confirmdialog';
import { ToastModule }        from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule }       from 'primeng/button';
import { SkeletonModule }     from 'primeng/skeleton';

import { Categoria } from '../../../interfaces/categoria.interface';
import { ProductoService } from '../../../services/producto.service';
import { CategoriaService } from '../../../services/categoria.service';
import { SedeService }      from '../../../services/sede.service';
import {
  CreateProductoDto,
  MovimientoInventarioDto,
  UpdateProductoDto,
  UpdateProductoPreciosDto,
} from '../../../interfaces/producto.interface';
import { AlmacenService } from '../../../services/almacen.service';
import { CajaService, CajaResponse } from '../../../services/caja.service';

const IGV_FACTOR = 1.18;

@Component({
  selector: 'app-productos-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, ButtonModule, InputTextModule,
    InputNumberModule, ToggleSwitchModule, SelectModule, CardModule,
    ConfirmDialog, ToastModule, SkeletonModule,
  ],
  templateUrl: './productos-formulario.html',
  styleUrl:    './productos-formulario.css',
  providers:   [ConfirmationService, MessageService],
})
export class ProductosFormulario implements OnInit {

  private fb               = inject(FormBuilder);
  private router           = inject(Router);
  private route            = inject(ActivatedRoute);
  private destroyRef       = inject(DestroyRef);
  private almacenService   = inject(AlmacenService);
  private productoService  = inject(ProductoService);
  private categoriaService = inject(CategoriaService);
  private sedeService      = inject(SedeService);
  private messageService   = inject(MessageService);
  private cajaService      = inject(CajaService);

  categorias         = signal<Categoria[]>([]);
  isSubmitting       = signal<boolean>(false);
  cargandoFormulario = signal<boolean>(false);
  sedes              = this.sedeService.sedes;
  almacenes          = this.almacenService.sedes;
  almacenesFiltrados = signal<any[]>([]);

  esModoEdicion    = signal<boolean>(false);
  idProductoActual = signal<number | null>(null);
  cajaExistente    = signal<CajaResponse | null>(null);
  almacenCargado   = signal<number | null>(null);
  sedeCargada      = signal<number | null>(null);
  stockActual      = signal<number>(0);
  stockAgregado    = signal<number>(0);
  stockTotal       = computed(() => this.stockActual() + this.stockAgregado());
  intentoEnvio     = signal<boolean>(false);
  cajaActiva       = signal<boolean>(false);

  alertaPrecioVenta = computed(() => {
    const compra = Number(this.productoForm?.get('precioCompra')?.value || 0);
    const venta  = Number(this.productoForm?.getRawValue()?.precioVenta || 0);
    return venta > 0 && compra > 0 && venta < compra;
  });

  mostrarResumenErrores = computed(() => this.intentoEnvio() && this.productoForm.invalid);

  erroresFormulario = computed(() => {
    if (!this.intentoEnvio()) return [];
    const errores: string[] = [];
    const ctrl = (name: string) => this.productoForm.get(name);

    if (ctrl('codigo')?.errors?.['required'])       errores.push('Código: es obligatorio.');
    if (ctrl('codigo')?.errors?.['minlength'])      errores.push('Código: mínimo 2 caracteres.');
    if (ctrl('codigo')?.errors?.['pattern'])        errores.push('Código: debe comenzar con R y solo contener letras, números y guiones.');
    if (ctrl('anexo')?.errors?.['required'])        errores.push('Nombre: es obligatorio.');
    if (ctrl('anexo')?.errors?.['minlength'])       errores.push('Nombre: mínimo 3 caracteres.');
    if (ctrl('anexo')?.errors?.['maxlength'])       errores.push('Nombre: no debe exceder los 150 caracteres.');
    if (ctrl('descripcion')?.errors?.['required'])  errores.push('Descripción: es obligatoria.');
    if (ctrl('descripcion')?.errors?.['minlength']) errores.push('Descripción: mínimo 10 caracteres.');
    if (ctrl('familia')?.errors?.['required'])      errores.push('Categoría: debes seleccionar una familia.');
    if (ctrl('unidadMedida')?.errors?.['required']) errores.push('Unidad de medida: es obligatoria.');
    if (ctrl('precioCompra')?.errors?.['required']  || ctrl('precioCompra')?.errors?.['min'])
      errores.push('Precio Compra: debe ser mayor a S/ 0.00.');
    if (ctrl('precioUnidad')?.errors?.['required']  || ctrl('precioUnidad')?.errors?.['min'])
      errores.push('Precio Unidad: debe ser mayor a S/ 0.00.');
    if (ctrl('precioCaja')?.errors?.['required']    || ctrl('precioCaja')?.errors?.['min'])
      errores.push('Precio Caja: debe ser mayor a S/ 0.00.');
    if (ctrl('precioMayorista')?.errors?.['required'] || ctrl('precioMayorista')?.errors?.['min'])
      errores.push('Precio Mayorista: debe ser mayor a S/ 0.00.');
    if (ctrl('sede')?.errors?.['required'])         errores.push('Sede: selecciona una sede.');
    if (ctrl('almacen')?.errors?.['required'] && !ctrl('almacen')?.disabled)
      errores.push('Almacén: selecciona un almacén.');
    if (ctrl('stockInicial')?.errors?.['max'])      errores.push('Stock: máximo 500 unidades por ajuste.');
    if (ctrl('stockInicial')?.errors?.['min'])      errores.push('Stock: no puede ser negativo.');
    if (this.cajaActiva()) {
      if (ctrl('cajaCodigo')?.errors?.['required'])   errores.push('Caja - Código: es obligatorio.');
      if (ctrl('cajaCantidadUnidades')?.errors?.['required'] || ctrl('cajaCantidadUnidades')?.errors?.['min'])
        errores.push('Caja - Unidades por caja: debe ser mayor a 0.');
    }
    return errores;
  });

  tituloKicker    = signal<string>('ADMINISTRADOR - ADMINISTRACIÓN - PRODUCTOS CREACIÓN');
  tituloPrincipal = signal<string>('CREAR PRODUCTO');
  iconoCabecera   = signal<string>('pi pi-plus-circle');

  readonly unidadesMedida = [
    { label: 'UNIDAD',  value: 'UNIDAD'  },
    { label: 'CAJA',    value: 'CAJA'    },
    { label: 'PAR',     value: 'PAR'     },
    { label: 'KG',      value: 'KG'      },
    { label: 'LITRO',   value: 'LITRO'   },
    { label: 'METRO',   value: 'METRO'   },
    { label: 'ROLLO',   value: 'ROLLO'   },
    { label: 'BOLSA',   value: 'BOLSA'   },
    { label: 'PAQUETE', value: 'PAQUETE' },
  ];

  productoForm: FormGroup = this.fb.group({
    codigo:          ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50), Validators.pattern(/^[Rr][A-Za-z0-9-]*$/)]],
    anexo:           ['', [Validators.required, Validators.minLength(3), Validators.maxLength(150)]],
    descripcion:     ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
    familia:         [null, Validators.required],
    precioCompra:    [null, [Validators.required, Validators.min(0.01)]],
    precioVenta:     [null, [Validators.required, Validators.min(0.01)]],
    precioUnidad:    [null, [Validators.required, Validators.min(0.01)]],
    precioCaja:      [null, [Validators.required, Validators.min(0.01)]],
    precioMayorista: [null, [Validators.required, Validators.min(0.01)]],
    unidadMedida:    ['UNIDAD', Validators.required],
    almacen:         [null, Validators.required],
    sede:            [null, Validators.required],
    stockInicial:    [0, [Validators.required, Validators.min(0), Validators.max(500)]],
    cajaActiva:           [false],
    cajaCodigo:           [''],
    cajaCantidadUnidades: [null],
    cajaPrecioMayorista:  [null],
  });

  campoInvalido(campo: string): boolean {
    const ctrl = this.productoForm.get(campo);
    if (!ctrl || ctrl.disabled) return false;
    return ctrl.invalid && (ctrl.touched || this.intentoEnvio());
  }

  campoValido(campo: string): boolean {
    const ctrl = this.productoForm.get(campo);
    if (!ctrl || ctrl.disabled) return false;
    return ctrl.valid && ctrl.touched;
  }

  ngOnInit() {
    this.productoForm.get('precioVenta')?.disable({ emitEvent: false });

    this.productoForm.get('stockInicial')?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(valor => this.stockAgregado.set(valor || 0));

    this.productoForm.get('sede')?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(idSede => {
        if (!idSede || this.esModoEdicion()) return;
        this.sedeService.loadAlmacenesParaSede(idSede)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: (rel) => {
              this.almacenesFiltrados.set(rel.almacenes.map(a => ({ ...a.almacen, id_almacen: a.almacen.id_almacen })));
              this.productoForm.patchValue({ almacen: null });
            },
            error: (err) => console.error('Error cargando almacenes', err),
          });
      });

    this.productoForm.get('cajaActiva')?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(activa => {
        this.cajaActiva.set(!!activa);
        this.toggleValidadoresCaja(!!activa);
        if (activa && !this.productoForm.get('cajaCodigo')?.value) {
          this.generarCodigoCaja();
        }
      });

    this.productoForm.get('codigo')?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (this.cajaActiva() && !(this.esModoEdicion() && this.cajaExistente())) {
          this.generarCodigoCaja();
        }
      });

    this.productoForm.get('precioUnidad')?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(precioUnidad => {
        const valor      = Number(precioUnidad) || 0;
        const precioVenta = valor > 0 ? Number((valor * IGV_FACTOR).toFixed(2)) : 0;
        this.productoForm.patchValue({ precioVenta }, { emitEvent: false });
      });

    this.cargarDatosIniciales();
  }

  private generarCodigoCaja(): void {
    const codigo    = (this.productoForm.get('codigo')?.value ?? '').trim().toUpperCase();
    if (!codigo) return;
    const cajaCodigo = `CJ-${codigo}`.slice(0, 10);
    this.productoForm.patchValue({ cajaCodigo }, { emitEvent: false });
  }

  private toggleValidadoresCaja(activa: boolean): void {
    const requeridos = ['cajaCodigo', 'cajaCantidadUnidades'];
    if (activa) {
      this.productoForm.get('cajaCodigo')?.setValidators([Validators.required, Validators.minLength(2), Validators.maxLength(10)]);
      this.productoForm.get('cajaCantidadUnidades')?.setValidators([Validators.required, Validators.min(1)]);
    } else {
      requeridos.forEach(c => this.productoForm.get(c)?.clearValidators());
    }
    requeridos.forEach(c => this.productoForm.get(c)?.updateValueAndValidity());
  }

  private cargarDatosIniciales() {
    const idParam   = this.route.snapshot.paramMap.get('id');
    const sedeParam = this.route.snapshot.queryParamMap.get('idSede');
    const esModo    = !!idParam;

    if (esModo) {
      this.cargandoFormulario.set(true);
      this.esModoEdicion.set(true);
      this.idProductoActual.set(Number(idParam));
      this.tituloKicker.set('ADMINISTRADOR - ADMINISTRACIÓN - PRODUCTOS EDICIÓN');
      this.tituloPrincipal.set('EDITAR PRODUCTO');
      this.iconoCabecera.set('pi pi-pencil');

      const idSede = sedeParam ? Number(sedeParam) : this.resolverSedeLocalStorage();

      forkJoin({
        categorias: this.categoriaService.getCategorias(),
        sedes:      this.sedeService.loadSedes(),
        producto:   this.productoService.getProductoDetalleStock(Number(idParam), idSede),
        cajas:      this.cajaService.getCajasByProducto(Number(idParam)),
      }).pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.cargandoFormulario.set(false)),
      ).subscribe({
        next: ({ categorias, producto, cajas }) => {
          this.categorias.set(categorias.categories);
          const prod  = producto.producto;
          const stock = producto.stock;
          const caja  = cajas.length > 0 ? cajas[0] : null;

          this.stockActual.set(stock?.cantidad || 0);
          this.almacenCargado.set(Number(stock?.id_almacen) || null);
          this.sedeCargada.set(Number(stock?.id_sede) || null);
          this.cajaExistente.set(caja);
          if (caja) this.cajaActiva.set(true);

          const patchForm = () => {
            this.productoForm.patchValue({
              codigo:               prod.codigo,
              anexo:                prod.nombre,
              descripcion:          prod.descripcion || '',
              familia:              prod.categoria.id_categoria,
              precioCompra:         prod.precio_compra,
              precioVenta:          prod.precio_unitario,
              precioUnidad:         prod.precio_unitario,
              precioCaja:           prod.precio_caja,
              precioMayorista:      prod.precio_mayor,
              unidadMedida:         prod.unidad_medida?.nombre || 'UNIDAD',
              sede:                 stock?.id_sede,
              almacen:              stock?.id_almacen,
              stockInicial:         0,
              cajaActiva:           !!caja,
              cajaCodigo:           caja?.cod_caja          ?? '',
              cajaCantidadUnidades: caja?.cantidad_unidades ?? null,
              cajaPrecioMayorista:  caja?.pre_mayorista     ?? null,
            }, { emitEvent: false });

            if (caja) this.toggleValidadoresCaja(true);
            this.productoForm.get('precioVenta')?.disable({ emitEvent: false });
            this.productoForm.get('sede')?.disable();
            this.productoForm.get('almacen')?.disable();
          };

          if (stock?.id_sede) {
            this.sedeService.loadAlmacenesParaSede(stock.id_sede)
              .pipe(takeUntilDestroyed(this.destroyRef))
              .subscribe({
                next: (rel) => {
                  this.almacenesFiltrados.set(rel.almacenes.map(a => ({ ...a.almacen, id_almacen: a.almacen.id_almacen })));
                  patchForm();
                },
                error: () => patchForm(),
              });
          } else {
            patchForm();
          }
        },
        error: (err) => {
          console.error('Error cargando datos de edición:', err);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los datos del producto.' });
        },
      });

    } else {
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
            next: (rel) => this.almacenesFiltrados.set(rel.almacenes.map(a => ({ ...a.almacen, id_almacen: a.almacen.id_almacen }))),
            error: (err) => console.error(err),
          });
      }
    } catch (e) { console.error('Error parseando usuario', e); }
  }

  cancelar() {
    this.router.navigate(['/admin/gestion-productos']);
  }

  guardarProducto() {
    this.intentoEnvio.set(true);
    this.productoForm.markAllAsTouched();

    if (this.productoForm.invalid) {
      this.messageService.add({ severity: 'warn', summary: 'Formulario incompleto', detail: 'Revisa los campos marcados en rojo antes de guardar.', life: 4000 });
      setTimeout(() => {
        document.querySelector('.text-red-500')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
      return;
    }

    const fv = this.productoForm.getRawValue();

    // ✅ Validaciones de negocio ANTES de cualquier llamada HTTP
    const erroresNegocio: string[] = [];

    if (fv.precioMayorista >= fv.precioCaja) {
      erroresNegocio.push('El Precio Mayorista debe ser menor al Precio Caja.');
    }
    if (fv.precioCompra >= fv.precioUnidad) {
      erroresNegocio.push('El Precio Unidad debe ser mayor al Precio Compra.');
    }
    if (fv.cajaActiva) {
      if (!fv.cajaCantidadUnidades || fv.cajaCantidadUnidades < 1) {
        erroresNegocio.push('Caja: las unidades por caja deben ser mayor a 0.');
      }
      if (!fv.cajaCodigo?.trim()) {
        erroresNegocio.push('Caja: el código es obligatorio.');
      }
      if (fv.cajaPrecioMayorista && fv.cajaPrecioMayorista >= fv.precioCaja) {
        erroresNegocio.push('Caja: el Precio Mayorista x Caja debe ser menor al Precio Caja.');
      }
    }
    if (!this.esModoEdicion() && !fv.almacen) {
      erroresNegocio.push('Debes seleccionar un almacén.');
    }
    if (!this.esModoEdicion() && !fv.sede) {
      erroresNegocio.push('Debes seleccionar una sede.');
    }

    if (erroresNegocio.length > 0) {
      erroresNegocio.forEach(detalle =>
        this.messageService.add({ severity: 'error', summary: 'Error de validación', detail: detalle, life: 5000 })
      );
      return;
    }

    // ✅ Solo llegamos aquí si todo es válido
    this.isSubmitting.set(true);

    const codigo      = fv.codigo?.trim().toUpperCase()      || '';
    const anexo       = fv.anexo?.trim().toUpperCase()       || '';
    const descripcion = fv.descripcion?.trim().toUpperCase() || '';

    if (this.esModoEdicion() && this.idProductoActual()) {
      const idProd = this.idProductoActual()!;

      const updateInfo: UpdateProductoDto = {
        id_producto:  idProd,
        id_categoria: fv.familia,
        codigo,
        anexo,
        descripcion,
        uni_med:      fv.unidadMedida,
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

            if (!warehouseId || !idSede) {
              this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: 'No se pudo determinar almacén o sede para el ajuste.' });
              return of(null);
            }

            return this.productoService.registrarAjusteInventario({
              productId:   idProd,
              warehouseId,
              idSede,
              quantity:    Number(fv.stockInicial),
              reason:      `Ajuste de stock - ${codigo}`,
              userId,
            });
          }
          return of(null);
        }),
        concatMap(() => {
          if (!fv.cajaActiva) return of(null);
          const cajaExistente = this.cajaExistente();
          if (cajaExistente) {
            return this.cajaService.actualizarPrecios(cajaExistente.id_caja, {
              pre_caja:      fv.precioCaja,
              pre_mayorista: fv.cajaPrecioMayorista ?? null,
            });
          }
          return this.cajaService.crearCaja({
            id_producto:       idProd,
            cod_caja:          fv.cajaCodigo.trim().toUpperCase(),
            cantidad_unidades: fv.cajaCantidadUnidades,
            pre_caja:          fv.precioCaja,
            pre_mayorista:     fv.cajaPrecioMayorista ?? null,
          });
        }),
        catchError(err => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.error?.message || 'Hubo un problema al actualizar.' });
          throw err;
        }),
        finalize(() => this.isSubmitting.set(false)),
        takeUntilDestroyed(this.destroyRef),
      ).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Producto actualizado correctamente.' });
          setTimeout(() => this.router.navigate(['/admin/gestion-productos']), 1500);
        },
      });

    } else {
      const productoDto: CreateProductoDto = {
        id_categoria: fv.familia,
        codigo,
        anexo,
        descripcion,
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
            originType:  'COMPRA',
            refId:        101,
            refTable:    'ordenes_compra',
            observation: 'Ingreso inicial de producto',
            items: [{
              productId:   productoCreado.id_producto,
              warehouseId: fv.almacen,
              sedeId:      fv.sede,
              quantity:    fv.stockInicial,
              type:        'INGRESO',
            }],
          };
          return this.productoService.registrarIngresoInventario(movDto)
            .pipe(concatMap(() => of(productoCreado)));
        }),
        concatMap((productoCreado: any) => {
          if (!fv.cajaActiva) return of(null);
          return this.cajaService.crearCaja({
            id_producto:       productoCreado.id_producto,
            cod_caja:          fv.cajaCodigo.trim().toUpperCase(),
            cantidad_unidades: fv.cajaCantidadUnidades,
            pre_caja:          fv.precioCaja,
            pre_mayorista:     fv.cajaPrecioMayorista ?? null,
          });
        }),
        catchError(err => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.error?.message || 'Hubo un error al crear.' });
          throw err;
        }),
        finalize(() => this.isSubmitting.set(false)),
        takeUntilDestroyed(this.destroyRef),
      ).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Producto creado correctamente.' });
          setTimeout(() => this.router.navigate(['/admin/gestion-productos']), 1500);
        },
      });
    }
  }
}