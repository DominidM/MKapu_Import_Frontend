import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { TextareaModule } from 'primeng/textarea';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ProductosService, Producto } from '../../../../../ventas/core/services/productos.service';
import { SedeService } from '../../../../../ventas/core/services/sede.service';

interface TransferProducto {
  id: number;
  nombre: string;
  sku: string;
  categoria: string;
  marca: string;
  stockPorSede: Record<string, number>;
}

@Component({
  selector: 'app-nueva-transferencia',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    SelectModule,
    InputNumberModule,
    ButtonModule,
    DatePickerModule,
    TextareaModule,
    CardModule,
    DividerModule,
    ToastModule,
    ConfirmDialog,
    AutoCompleteModule
  ],
  templateUrl: './nueva-transferencia.html',
  styleUrl: './nueva-transferencia.css',
  providers: [MessageService, ConfirmationService]
})
export class NuevaTransferencia implements OnInit {

  constructor(
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router,
    private productosService: ProductosService,
    private sedeService: SedeService
  ) {}

  tituloKicker = 'ADMINISTRACION - REPORTES';
  subtituloKicker = 'NUEVA TRANSFERENCIA';
  iconoCabecera = 'pi pi-sync';

  activeStep = 0;
  steps = ['Producto y Sedes', 'Cantidad y Motivo', 'Fechas', 'Confirmacion'];

  sedes: { label: string; value: string }[] = [];

  motivos = [
    { label: 'Reposicion', value: 'reposicion' },
    { label: 'Ajuste de stock', value: 'ajuste' },
    { label: 'Solicitud interna', value: 'solicitud' },
    { label: 'Transferencia programada', value: 'programada' },
  ];

  responsables = [
    { label: 'Jefatura de almacen', value: 'jefatura' },
    { label: 'Supervisor de sede', value: 'supervisor' },
    { label: 'Encargado de despacho', value: 'despacho' },
  ];

  productos: TransferProducto[] = [];

  productoId: number | null = null;
  productoQuery: string | null = null;
  productosSugeridos: TransferProducto[] = [];
  sedeOrigen: string | null = null;
  sedeDestino: string | null = null;
  cantidad = 1;
  motivo: string | null = null;
  observacion = '';
  fechaEnvio: Date | null = null;
  fechaLlegada: Date | null = null;
  responsable: string | null = null;
  readonly today = this.getToday();

  ngOnInit(): void {
    this.cargarSedes();
    this.cargarProductos();
  }

  get productoSeleccionado(): TransferProducto | null {
    return this.productos.find((producto) => producto.id === this.productoId) || null;
  }

  get stockDisponible(): number {
    if (!this.productoSeleccionado || !this.sedeOrigen) {
      return 0;
    }
    return this.productoSeleccionado.stockPorSede[this.sedeOrigen] || 0;
  }

  getSedeLabel(sede: string | null): string {
    return this.sedes.find((item) => item.value === sede)?.label || '-';
  }

  getMotivoLabel(motivo: string | null): string {
    return this.motivos.find((item) => item.value === motivo)?.label || '-';
  }

  getResponsableLabel(responsable: string | null): string {
    return this.responsables.find((item) => item.value === responsable)?.label || '-';
  }

  getStockBadges(producto: TransferProducto | null): { label: string; stock: number; className: string }[] {
    if (!producto) {
      return [];
    }

    return this.sedes.map((sede) => {
      const stock = producto.stockPorSede[sede.value] ?? 0;
      return {
        label: sede.label,
        stock,
        className: this.getStockClass(stock)
      };
    });
  }

  getStockClassForSede(producto: TransferProducto | null, sede: string | null): string {
    if (!producto || !sede) {
      return '';
    }
    const stock = producto.stockPorSede[sede] ?? 0;
    return this.getStockClass(stock);
  }

  getStockForSede(producto: TransferProducto | null, sede: string | null): number {
    if (!producto || !sede) {
      return 0;
    }
    return producto.stockPorSede[sede] ?? 0;
  }

  private getToday(): Date {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }

  private getStockClass(stock: number): string {
    if (stock >= 50) return 'stock-badge--high';
    if (stock >= 15) return 'stock-badge--mid';
    return 'stock-badge--low';
  }

  private cargarSedes(): void {
    this.sedeService.getSedes().subscribe({
      next: (sedes) => {
        this.sedes = sedes.map((sede) => ({
          label: sede.nombre,
          value: sede.id_sede
        }));
        if (!this.sedeOrigen && this.sedes.length > 0) {
          this.sedeOrigen = this.sedes[0].value;
        }
      },
      error: (error) => {
        console.error('Error al cargar sedes:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar las sedes',
        });
      }
    });
  }

  private cargarProductos(): void {
    const productos = this.productosService.getProductos(undefined, 'Activo');
    this.productos = this.normalizarProductos(productos);
    this.productosSugeridos = this.productos.slice(0, 8);
  }

  private normalizarProductos(productos: Producto[]): TransferProducto[] {
    const map = new Map<string, TransferProducto>();

    productos.forEach((producto) => {
      const clave = producto.codigo;
      const existente = map.get(clave);

      if (!existente) {
        map.set(clave, {
          id: producto.id,
          nombre: producto.nombre,
          sku: producto.codigo,
          categoria: producto.familia,
          marca: 'N/A',
          stockPorSede: { [producto.id_sede]: producto.stock }
        });
      } else {
        existente.stockPorSede[producto.id_sede] = producto.stock;
      }
    });

    return Array.from(map.values());
  }

  buscarProducto(event: { query: string }): void {
    const query = event.query.toLowerCase().trim();
    if (!query) {
      this.productosSugeridos = this.productos.slice(0, 8);
      return;
    }

    this.productosSugeridos = this.productos
      .filter((producto) => {
        return (
          producto.nombre.toLowerCase().includes(query) ||
          producto.sku.toLowerCase().includes(query)
        );
      })
      .slice(0, 10);
  }

  onSelectProducto(event: { value: TransferProducto }): void {
    const producto = event.value;
    this.productoId = producto.id;
    this.productoQuery = producto.nombre;
  }

  onClearProducto(): void {
    this.productoId = null;
    this.productoQuery = null;
  }

  ajustarCantidad(delta: number): void {
    const nuevaCantidad = this.cantidad + delta;
    if (nuevaCantidad < 1) {
      return;
    }
    this.cantidad = Math.min(nuevaCantidad, Math.max(this.stockDisponible, 1));
  }

  onCantidadChange(valor: number | null): void {
    if (valor === null) {
      this.cantidad = 1;
      return;
    }
    const normalizado = Math.max(1, Math.min(valor, Math.max(this.stockDisponible, 1)));
    if (normalizado !== valor) {
      this.cantidad = normalizado;
    }
  }

  nextStep(): void {
    if (this.validarStepActual()) {
      this.activeStep++;
    }
  }

  prevStep(): void {
    if (this.activeStep > 0) {
      this.activeStep--;
    }
  }

  validarStepActual(): boolean {
    switch (this.activeStep) {
      case 0:
        if (!this.productoId) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Producto requerido',
            detail: 'Seleccione un producto para transferir',
          });
          return false;
        }
        if (!this.sedeOrigen || !this.sedeDestino) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Sedes requeridas',
            detail: 'Seleccione sede de origen y destino',
          });
          return false;
        }
        if (this.sedeOrigen === this.sedeDestino) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Sedes invalidas',
            detail: 'La sede origen y destino deben ser diferentes',
          });
          return false;
        }
        return true;
      case 1:
        if (!this.motivo) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Motivo requerido',
            detail: 'Seleccione un motivo de transferencia',
          });
          return false;
        }
        if (this.cantidad < 1 || this.cantidad > this.stockDisponible) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Cantidad invalida',
            detail: 'La cantidad debe ser menor o igual al stock disponible',
          });
          return false;
        }
        return true;
      case 2:
        if (!this.fechaEnvio || !this.fechaLlegada) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Fechas requeridas',
            detail: 'Ingrese fecha de envio y llegada',
          });
          return false;
        }
        if (this.fechaEnvio < this.today || this.fechaLlegada < this.today) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Fechas invalidas',
            detail: 'Las fechas no pueden ser menores a hoy',
          });
          return false;
        }
        if (this.fechaEnvio > this.fechaLlegada) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Fechas invalidas',
            detail: 'La fecha de llegada no puede ser menor a la de envio',
          });
          return false;
        }
        if (!this.responsable) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Responsable requerido',
            detail: 'Seleccione un responsable',
          });
          return false;
        }
        return true;
      default:
        return true;
    }
  }

  confirmarTransferencia(): void {
    this.confirmationService.confirm({
      message: 'Desea confirmar esta transferencia?',
      header: 'Confirmar Transferencia',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Confirmar',
      rejectLabel: 'Cancelar',
      acceptButtonProps: { severity: 'warning' },
      rejectButtonProps: { severity: 'secondary', outlined: true },
      accept: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Registro exitoso',
          detail: 'La transferencia fue registrada correctamente',
          life: 3000
        });
        this.router.navigate(['/admin/transferencia']);
        this.resetForm();
      }
    });
  }

  resetForm(): void {
    this.activeStep = 0;
    this.productoId = null;
    this.sedeOrigen = null;
    this.sedeDestino = null;
    this.cantidad = 1;
    this.motivo = null;
    this.observacion = '';
    this.fechaEnvio = null;
    this.fechaLlegada = null;
    this.responsable = null;
  }

}
