import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { InputNumberModule } from 'primeng/inputnumber';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { RadioButtonModule } from 'primeng/radiobutton';

interface Producto {
  id: number;
  nombre: string;
  categoria: string;
  stock: number;
  precio: number;
}

interface TipoRegistro {
  label: string;
  value: 'merma' | 'remate';
}

interface MotivoMerma {
  label: string;
  value: string;
}

interface MotivoRemate {
  label: string;
  value: string;
}

@Component({
  selector: 'app-mermas-remates-registro',
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    TextareaModule,
    ToastModule,
    InputNumberModule,
    AutoCompleteModule,
    RadioButtonModule
  ],
  templateUrl: './mermas-remates-registro.html',
  styleUrl: './mermas-remates-registro.css',
  providers: [MessageService],
})
export class MermasRematesRegistro implements OnInit {
  tipoRegistro: 'merma' | 'remate' | null = null;
  productoSeleccionado: Producto | null = null;
  cantidad: number = 1;
  motivo: string = '';
  observaciones: string = '';
  responsable: string = 'Jefatura de almacén';

  // Campos específicos para REMATE
  codigoRemate: string = '';
  precioRemate: number = 0;

  // Opciones
  tiposRegistro: TipoRegistro[] = [
    { label: 'Merma (Producto sale de stock)', value: 'merma' },
    { label: 'Remate (Producto en oferta)', value: 'remate' }
  ];

  motivosMerma: MotivoMerma[] = [
    { label: 'Producto vencido', value: 'vencido' },
    { label: 'Producto dañado', value: 'dañado' },
    { label: 'Producto defectuoso', value: 'defectuoso' },
    { label: 'Producto obsoleto', value: 'obsoleto' },
    { label: 'Pérdida por robo', value: 'robo' },
    { label: 'Pérdida en inventario', value: 'inventario' },
    { label: 'Otro motivo', value: 'otro' }
  ];

  motivosRemate: MotivoRemate[] = [
    { label: 'Próximo a vencer', value: 'proximo_vencer' },
    { label: 'Liquidación de stock', value: 'liquidacion' },
    { label: 'Cambio de temporada', value: 'temporada' },
    { label: 'Producto descontinuado', value: 'descontinuado' },
    { label: 'Fin de colección', value: 'fin_coleccion' },
    { label: 'Promoción especial', value: 'promocion' },
    { label: 'Otro motivo', value: 'otro' }
  ];

  // Productos disponibles (simulado - en producción vendría del backend)
  productosDisponibles: Producto[] = [
    { id: 1, nombre: 'Smart TV LED 55" 4K RAF', categoria: 'Electrónica', stock: 15, precio: 2500.00 },
    { id: 2, nombre: 'Lavarropas Automático 10kg RAF', categoria: 'Electrodomésticos', stock: 8, precio: 1800.00 },
    { id: 3, nombre: 'Refrigerador No Frost 12 pies RAF', categoria: 'Electrodomésticos', stock: 12, precio: 2200.00 },
    { id: 4, nombre: 'Microondas Digital 25L RAF', categoria: 'Electrodomésticos', stock: 20, precio: 450.00 },
    { id: 5, nombre: 'Aspiradora Robot Inteligente RAF', categoria: 'Electrodomésticos', stock: 10, precio: 1200.00 },
    { id: 6, nombre: 'Laptop HP Pavilion i5', categoria: 'Informática', stock: 5, precio: 3500.00 },
    { id: 7, nombre: 'Monitor Samsung 24"', categoria: 'Informática', stock: 18, precio: 850.00 },
    { id: 8, nombre: 'Teclado Logitech K380', categoria: 'Accesorios', stock: 30, precio: 120.00 }
  ];

  productosFiltrados: Producto[] = [];
  motivosFiltrados: (MotivoMerma | MotivoRemate)[] = [];


  constructor(
    private messageService: MessageService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Inicialización si es necesario
  }

  // ===== MÉTODOS PARA AUTOCOMPLETE DE PRODUCTOS =====
  buscarMotivo(event: any): void {
    const query = event.query.toLowerCase();

    const lista =
      this.tipoRegistro === 'merma'
        ? this.motivosMerma
        : this.motivosRemate;

    this.motivosFiltrados = lista.filter(m =>
      m.label.toLowerCase().includes(query)
    );
  }

  buscarProducto(event: any): void {
    const query = event.query.toLowerCase();

    if (!query) {
      this.productosFiltrados = [...this.productosDisponibles];
    } else {
      this.productosFiltrados = this.productosDisponibles.filter(producto =>
        producto.nombre.toLowerCase().includes(query) ||
        producto.categoria.toLowerCase().includes(query)
      );
    }
  }

  onProductoSelect(producto: Producto): void {
    this.productoSeleccionado = producto;

    // Si es remate y no hay precio, sugerir un precio basado en el precio original
    if (this.tipoRegistro === 'remate' && this.precioRemate === 0 && this.productoSeleccionado) {
      // Sugerir 50% del precio original como precio de remate
      this.precioRemate = this.productoSeleccionado.precio * 0.5;
    }
  }

  // ===== MÉTODOS PARA CAMBIO DE TIPO =====

  onTipoChange(): void {
    // Limpiar campos cuando se cambia el tipo
    this.motivo = '';
    this.observaciones = '';

    if (this.tipoRegistro === 'remate') {
      // Generar código de remate automático
      this.codigoRemate = this.generarCodigoRemate();

      // Si ya hay producto seleccionado, sugerir precio
      if (this.productoSeleccionado && this.precioRemate === 0) {
        this.precioRemate = this.productoSeleccionado.precio * 0.5;
      }
    } else {
      // Limpiar campos de remate
      this.codigoRemate = '';
      this.precioRemate = 0;
    }
  }

  generarCodigoRemate(): string {
    const fecha = new Date();
    const año = fecha.getFullYear();
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `RMT-${año}-${String(random).padStart(3, '0')}`;
  }

  // ===== VALIDACIONES =====

  validarFormulario(): boolean {
    if (!this.tipoRegistro) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error de validación',
        detail: 'Debe seleccionar un tipo de registro (Merma o Remate)',
        life: 3000
      });
      return false;
    }

    if (!this.productoSeleccionado) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error de validación',
        detail: 'Debe seleccionar un producto',
        life: 3000
      });
      return false;
    }

    if (!this.cantidad || this.cantidad <= 0) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error de validación',
        detail: 'La cantidad debe ser mayor a 0',
        life: 3000
      });
      return false;
    }

    if (this.cantidad > this.productoSeleccionado.stock) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error de validación',
        detail: `La cantidad no puede ser mayor al stock disponible (${this.productoSeleccionado.stock} unidades)`,
        life: 3000
      });
      return false;
    }

    if (!this.motivo) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error de validación',
        detail: 'Debe seleccionar un motivo',
        life: 3000
      });
      return false;
    }

    if (this.tipoRegistro === 'remate') {
      if (!this.codigoRemate) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error de validación',
          detail: 'El código de remate es obligatorio',
          life: 3000
        });
        return false;
      }

      if (!this.precioRemate || this.precioRemate <= 0) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error de validación',
          detail: 'El precio de remate debe ser mayor a 0',
          life: 3000
        });
        return false;
      }

      if (this.productoSeleccionado && this.precioRemate >= this.productoSeleccionado.precio) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Advertencia',
          detail: 'El precio de remate debería ser menor al precio original del producto',
          life: 4000
        });
      }
    }

    return true;
  }

  // ===== MÉTODOS PRINCIPALES =====

  registrar(): void {
    if (!this.validarFormulario()) {
      return;
    }

    // Construir objeto de registro
    const registro = {
      tipo: this.tipoRegistro,
      producto: this.productoSeleccionado,
      cantidad: this.cantidad,
      motivo: this.motivo,
      observaciones: this.observaciones,
      responsable: this.responsable,
      codigoRemate: this.tipoRegistro === 'remate' ? this.codigoRemate : null,
      precioRemate: this.tipoRegistro === 'remate' ? this.precioRemate : null,
      fechaRegistro: new Date()
    };

    // Aquí iría la lógica para guardar en el backend
    console.log('Registro a guardar:', registro);

    this.messageService.add({
      severity: 'success',
      summary: 'Registro Exitoso',
      detail: `${this.tipoRegistro === 'merma' ? 'Merma' : 'Remate'} registrado correctamente para ${this.productoSeleccionado?.nombre}`,
      life: 3000
    });

    // Redirigir después de un delay
    setTimeout(() => {
      this.router.navigate(['/admin/mermas-remates']);
    }, 2000);
  }

  cancelar(): void {
    this.router.navigate(['/admin/mermas-remates']);
  }

  limpiarFormulario(): void {
    this.tipoRegistro = null;
    this.productoSeleccionado = null;
    this.cantidad = 1;
    this.motivo = '';
    this.observaciones = '';
    this.codigoRemate = '';
    this.precioRemate = 0;
    this.responsable = 'Jefatura de almacén';
  }

  // ===== MÉTODOS AUXILIARES =====

  getMotivoLabel(value: string): string {
    if (this.tipoRegistro === 'merma') {
      const motivo = this.motivosMerma.find(m => m.value === value);
      return motivo ? motivo.label : value;
    } else {
      const motivo = this.motivosRemate.find(m => m.value === value);
      return motivo ? motivo.label : value;
    }
  }

  calcularPorcentajeDescuento(): number {
    if (!this.productoSeleccionado || !this.precioRemate) return 0;

    const descuento = ((this.productoSeleccionado.precio - this.precioRemate) / this.productoSeleccionado.precio) * 100;
    return Math.round(descuento);
  }
}
