import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { DatePickerModule } from 'primeng/datepicker';

// Interfaces para productos
interface Producto {
  productoId: number | null;
  nombre?: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  loteSerie: string;
  productoSeleccionado?: ProductoDisponible | null;
}

interface ProductoDisponible {
  id: number;
  nombre: string;
  precioDefault: number;
}

@Component({
  selector: 'app-ingresos-agregar',
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ButtonModule,
    CardModule,
    DividerModule,
    InputTextModule,
    InputNumberModule,
    ConfirmDialogModule,
    ToastModule,
    AutoCompleteModule,
    TableModule,
    TooltipModule,
    TagModule,
    DatePickerModule
  ],
  templateUrl: './ingresos-agregar.html',
  styleUrl: './ingresos-agregar.css',
  providers: [
    ConfirmationService,
    MessageService
  ],
})
export class IngresosAgregar implements OnInit {
  
  ingreso = {
    nro_guia: '',
    fecha_de_entrada: new Date(),
    proveedor: '',
    nro_productos: 0,
    cant_total: 0,
    valor_total: 0,
    estado: 'Pendiente Verificación',
  };

  // Propiedades para productos
  productos: Producto[] = [];
  productosFiltrados: ProductoDisponible[][] = [];
  
  productosDisponibles: ProductoDisponible[] = [
    { id: 1, nombre: 'Laptop HP Pavilion i5', precioDefault: 2500.00 },
    { id: 2, nombre: 'Mouse Logitech M185', precioDefault: 45.00 },
    { id: 3, nombre: 'Monitor Samsung 24"', precioDefault: 850.00 },
    { id: 4, nombre: 'Teclado Logitech K380', precioDefault: 120.00 },
    { id: 5, nombre: 'Webcam Logitech C920', precioDefault: 280.00 },
    { id: 6, nombre: 'Hub USB-C Anker', precioDefault: 95.00 },
    { id: 7, nombre: 'Disco Duro Externo 1TB Seagate', precioDefault: 180.00 },
    { id: 8, nombre: 'Auriculares Sony WH-1000XM4', precioDefault: 950.00 },
    { id: 9, nombre: 'Mouse Pad RGB Razer', precioDefault: 75.00 },
    { id: 10, nombre: 'Cable HDMI 2.1 Belkin', precioDefault: 35.00 },
    { id: 11, nombre: 'Impresora HP LaserJet Pro', precioDefault: 650.00 },
    { id: 12, nombre: 'Router WiFi 6 TP-Link', precioDefault: 180.00 },
    { id: 13, nombre: 'SSD Samsung 1TB', precioDefault: 320.00 },
    { id: 14, nombre: 'Tablet Samsung Galaxy Tab', precioDefault: 1200.00 },
    { id: 15, nombre: 'Cámara Web Logitech C270', precioDefault: 150.00 }
  ];

  constructor(
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    // Agregar un producto vacío al inicio
    this.agregarProducto();
  }

  // ===== MÉTODOS PARA AUTOCOMPLETE =====

  buscarProducto(event: any, index: number): void {
    const query = event.query.toLowerCase();
    
    if (!query) {
      // Si no hay búsqueda, mostrar todos los productos
      this.productosFiltrados[index] = [...this.productosDisponibles];
    } else {
      // Filtrar productos por nombre
      this.productosFiltrados[index] = this.productosDisponibles.filter(producto =>
        producto.nombre.toLowerCase().includes(query)
      );
    }
  }

  onProductoSelect(event: any, index: number): void {
    const producto = this.productos[index];
    const productoSeleccionado = event;

    if (productoSeleccionado) {
      producto.productoId = productoSeleccionado.id;
      producto.nombre = productoSeleccionado.nombre;
      producto.precioUnitario = productoSeleccionado.precioDefault;
      this.calcularSubtotal(index);
    }
  }

  // ===== MÉTODOS PARA PRODUCTOS =====

  agregarProducto(): void {
    const nuevoProducto: Producto = {
      productoId: null,
      productoSeleccionado: null,
      cantidad: 1,
      precioUnitario: 0,
      subtotal: 0,
      loteSerie: ''
    };
    this.productos.push(nuevoProducto);
    this.productosFiltrados.push([]);
    
    this.messageService.add({
      severity: 'success',
      summary: 'Producto agregado',
      detail: 'Nueva fila de producto agregada',
      life: 2000
    });
  }

  eliminarProducto(index: number): void {
    this.confirmationService.confirm({
      message: '¿Está seguro de eliminar este producto?',
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        const productoEliminado = this.productos[index];
        this.productos.splice(index, 1);
        this.productosFiltrados.splice(index, 1);
        
        // Actualizar totales
        this.actualizarTotalesIngreso();
        
        this.messageService.add({
          severity: 'success',
          summary: 'Producto eliminado',
          detail: `${productoEliminado.nombre || 'Producto'} eliminado correctamente`,
          life: 3000
        });
      }
    });
  }

  calcularSubtotal(index: number): void {
    const producto = this.productos[index];
    producto.subtotal = (producto.cantidad || 0) * (producto.precioUnitario || 0);
    
    // Actualizar los totales del ingreso
    this.actualizarTotalesIngreso();
  }

  getTotalUnidades(): number {
    return this.productos.reduce((total, producto) => total + (producto.cantidad || 0), 0);
  }

  getValorTotal(): number {
    return this.productos.reduce((total, producto) => total + (producto.subtotal || 0), 0);
  }

  actualizarTotalesIngreso(): void {
    this.ingreso.nro_productos = this.productos.length;
    this.ingreso.cant_total = this.getTotalUnidades();
    this.ingreso.valor_total = this.getValorTotal();
  }

  // ===== VALIDACIONES =====

  validarFormulario(): boolean {
    // Validar datos básicos del ingreso
    if (!this.ingreso.nro_guia || !this.ingreso.proveedor) {
      return false;
    }

    // Validar que haya al menos un producto
    if (this.productos.length === 0) {
      return false;
    }

    // Validar que todos los productos tengan datos válidos
    const productosValidos = this.productos.every(p => 
      p.productoId && p.cantidad > 0 && p.precioUnitario > 0
    );

    return productosValidos;
  }

  validarProductos(): boolean {
    if (this.productos.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Debe agregar al menos un producto',
        life: 3000
      });
      return false;
    }

    const productosInvalidos = this.productos.filter(p => 
      !p.productoId || p.cantidad <= 0 || p.precioUnitario <= 0
    );

    if (productosInvalidos.length > 0) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error de validación',
        detail: 'Todos los productos deben tener producto, cantidad y precio válidos',
        life: 3000
      });
      return false;
    }

    return true;
  }

  // ===== MÉTODOS PRINCIPALES =====

  registrar(): void {
    // Validar datos del ingreso
    if (!this.ingreso.nro_guia) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'El número de guía es obligatorio',
        life: 3000
      });
      return;
    }

    if (!this.ingreso.proveedor) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'El proveedor es obligatorio',
        life: 3000
      });
      return;
    }

    // Validar productos
    if (!this.validarProductos()) {
      return;
    }

    // Actualizar totales finales
    this.actualizarTotalesIngreso();

    // Aquí iría la lógica para guardar en el backend
    console.log('Ingreso a guardar:', this.ingreso);
    console.log('Productos:', this.productos);

    this.messageService.add({
      severity: 'success',
      summary: 'Registro Exitoso',
      detail: `Ingreso ${this.ingreso.nro_guia} registrado con ${this.productos.length} productos`,
      life: 3000
    });

    // Opcionalmente, redirigir después de un delay
    // setTimeout(() => {
    //   this.router.navigate(['/admin/ingresos-almacen']);
    // }, 2000);
  }

  cancelar(): void {
    this.confirmationService.confirm({
      message: '¿Está seguro de cancelar? Se perderán todos los datos ingresados.',
      header: 'Confirmar cancelación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, cancelar',
      rejectLabel: 'No, continuar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.messageService.add({
          severity: 'info',
          summary: 'Cancelado',
          detail: 'Se canceló el registro del ingreso',
          life: 3000
        });

        // Limpiar formulario
        this.limpiarFormulario();

        // Opcionalmente, navegar de vuelta
        // this.router.navigate(['/admin/ingresos-almacen']);
      }
    });
  }

  limpiarFormulario(): void {
    this.ingreso = {
      nro_guia: '',
      fecha_de_entrada: new Date(),
      proveedor: '',
      nro_productos: 0,
      cant_total: 0,
      valor_total: 0,
      estado: 'Pendiente Verificación',
    };
    this.productos = [];
    this.productosFiltrados = [];
    this.agregarProducto(); // Agregar una fila vacía
  }
}