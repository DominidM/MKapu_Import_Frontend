import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router'; // <-- Añadido ActivatedRoute
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { of } from 'rxjs';
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

// Servicios e Interfaces
import { Categoria } from '../../../interfaces/categoria.interface';
import { ProductoService } from '../../../services/producto.service';
import { CategoriaService } from '../../../services/categoria.service';
import { SedeService } from '../../../services/sede.service';
import { CreateProductoDto, MovimientoInventarioDto } from '../../../interfaces/producto.interface';
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
    ToastModule
  ],
  templateUrl: './productos-formulario.html',
  styleUrl: './productos-formulario.css',
  providers: [ConfirmationService, MessageService],
})
export class ProductosFormulario implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute); // <-- Inyectado para leer la URL
  private almacenService = inject(AlmacenService);
  private productoService = inject(ProductoService);
  private categoriaService = inject(CategoriaService);
  private sedeService = inject(SedeService);
  private messageService = inject(MessageService);

  categorias = signal<Categoria[]>([]);
  isSubmitting = signal<boolean>(false);
  sedes = this.sedeService.sedes;
  almacenes = this.almacenService.sedes;
  // SIGNALS MODO EDICIÓN
  esModoEdicion = signal<boolean>(false);
  idProductoActual = signal<number | null>(null);

  // SIGNALS CABECERA
  tituloKicker = signal<string>('ADMINISTRADOR - ADMINISTRACIÓN - PRODUCTOS CREACIÓN');
  tituloPrincipal = signal<string>('CREAR PRODUCTO');
  iconoCabecera = signal<string>('pi pi-plus-circle');

  // FORMULARIO (Se mantiene 'anexo' que funcionará visualmente como 'Nombre')
  productoForm: FormGroup = this.fb.group({
    codigo: ['', Validators.required],
    anexo: ['', Validators.required], // <-- Funciona como Nombre en UI
    descripcion: ['', Validators.required],
    familia: [null, Validators.required],
    precioCompra: [0, [Validators.required, Validators.min(0)]],
    precioVenta: [0, [Validators.required, Validators.min(0)]],
    precioUnidad: [0, [Validators.required, Validators.min(0)]],
    precioCaja: [0, [Validators.required, Validators.min(0)]],
    precioMayorista: [0, [Validators.required, Validators.min(0)]],
    unidadMedida: ['UNIDAD', Validators.required],
    almacen: [null, Validators.required],
    sede: [null, Validators.required],
    stockInicial: [0, [Validators.required, Validators.min(0)]]
  });

  ngOnInit() {
    this.cargarDatosIniciales();
    this.setSedePorDefecto();
    this.verificarModoEdicion();
  }

  private cargarDatosIniciales() {
    this.categoriaService.getCategorias().subscribe({
      next: (res) => {
        this.categorias.set(res.categories);
      },
      error: (err) => console.error('Error cargando categorías', err)
    });

    this.sedeService.loadSedes().subscribe({
      error: (err) => console.error('Error cargando sedes', err)
    });

    this.almacenService.loadAlmacen().subscribe({
      error: (err) => console.error('Error cargando almacenes', err)
    })

  }

  private setSedePorDefecto() {
    const userStorage = localStorage.getItem('user');
    if (userStorage) {
      try {
        const user = JSON.parse(userStorage);
        if (user && user.idSede) {
          this.productoForm.patchValue({ sede: user.idSede });
        }
      } catch (error) {
        console.error('Error parseando usuario del local storage', error);
      }
    }
  }


  private verificarModoEdicion() {
    // Leemos el ID del producto
    const idParam = this.route.snapshot.paramMap.get('id');
    // NUEVO: Leemos la sede que mandamos desde la tabla
    const sedeParam = this.route.snapshot.queryParamMap.get('idSede');

    if (idParam) {
      this.esModoEdicion.set(true);
      const id = Number(idParam);
      this.idProductoActual.set(id);

      this.tituloKicker.set('ADMINISTRADOR - ADMINISTRACIÓN - PRODUCTOS EDICIÓN');
      this.tituloPrincipal.set('EDITAR PRODUCTO');
      this.iconoCabecera.set('pi pi-pencil');

      // Si viene la sede en la URL la usamos, si no, usamos la del formulario o 1
      const idSedeBackend = sedeParam ? Number(sedeParam) : (this.productoForm.get('sede')?.value || 1);

      // Le pasamos la sede al método
      this.cargarDatosDelProducto(id, idSedeBackend);
    }
  }

  private cargarDatosDelProducto(id: number, idSede: number) {
    this.productoService.getProductoDetalleStock(id, idSede).subscribe({
      next: (res) => {
        const prod = res.producto;

        this.productoForm.patchValue({
          codigo: prod.codigo,
          anexo: prod.nombre,
          descripcion: prod.descripcion || '',
          familia: prod.categoria.id_categoria,
          precioCompra: prod.precio_compra,
          precioVenta: prod.precio_unitario,
          precioUnidad: prod.precio_unitario,
          precioCaja: prod.precio_caja,
          precioMayorista: prod.precio_mayor,
          unidadMedida: prod.unidad_medida?.nombre || 'UNIDAD',
          sede: res.stock?.id_sede,
          stockInicial: res.stock?.cantidad || 0
        });

        // Deshabilitamos en edición
        this.productoForm.get('stockInicial')?.disable();
        this.productoForm.get('sede')?.disable();
      },
      error: (err) => {
        // Imprimimos el error exacto en consola para que lo veas
        console.error('Error trayendo datos del backend:', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se encontraron los datos del producto en esta sede.' });
      }
    });
  }

  cancelar() {
    this.router.navigate(['/admin/gestion-productos']);
  }

  guardarProducto() {
    if (this.productoForm.invalid) {
      this.productoForm.markAllAsTouched();
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Complete los campos obligatorios.' });
      return;
    }

    this.isSubmitting.set(true);
    const formValue = this.productoForm.getRawValue();

    // Limpieza
    const codigoLimpio = formValue.codigo?.trim().toUpperCase() || '';
    const anexoLimpio = formValue.anexo?.trim().toUpperCase() || ''; // Funciona como nombre
    const descripcionLimpia = formValue.descripcion?.trim().toUpperCase() || '';

    // DTO de Creación (Nota: anexo lleva el nombre, descripcion lleva la descripcion)
    const productoDto: CreateProductoDto = {
      id_categoria: formValue.familia,
      codigo: codigoLimpio,
      anexo: anexoLimpio, // Enviamos el valor del "Nombre" aquí
      descripcion: descripcionLimpia,
      pre_compra: formValue.precioCompra,
      pre_venta: formValue.precioVenta,
      pre_unit: formValue.precioUnidad,
      pre_may: formValue.precioMayorista,
      pre_caja: formValue.precioCaja,
      uni_med: formValue.unidadMedida
    };

    if (this.esModoEdicion()) {
      // ===== LÓGICA DE ACTUALIZAR (PUT) =====
      console.log('DTO a enviar en PUT:', productoDto);
      // Aquí deberás llamar a tu this.productoService.actualizarProducto(id, dto)
      this.messageService.add({ severity: 'info', summary: 'Info', detail: 'Falta implementar endpoint PUT en el servicio.' });
      this.isSubmitting.set(false);
    } else {
      // ===== LÓGICA DE CREAR (POST) =====
      this.productoService.crearProducto(productoDto).pipe(
        concatMap(productoCreado => {
          if (formValue.stockInicial <= 0) {
            return of(productoCreado);
          }

          const movDto: MovimientoInventarioDto = {
            originType: 'COMPRA',
            refId: 101,
            refTable: 'ordenes_compra',
            observation: "Ingreso por orden de compra #101",
            items: [{
              productId: productoCreado.id_producto,
              warehouseId: formValue.almacen, // <--- ID del desplegable Almacén
              sedeId: formValue.sede,         // <--- ID del desplegable Sede
              quantity: formValue.stockInicial,
              type: 'INGRESO'
            }]
          };

          return this.productoService.registrarIngresoInventario(movDto);
        }),
        catchError(error => {
          const backendMessage = error?.error?.message || 'Hubo un problema al guardar los datos.';
          this.messageService.add({ severity: 'error', summary: 'Error', detail: backendMessage });
          throw error;
        }),
        finalize(() => this.isSubmitting.set(false))
      ).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Producto registrado correctamente.' });
          setTimeout(() => {
            this.router.navigate(['/admin/gestion-productos']);
          }, 1500);
        }
      });
    }
  }
}