import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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
export class NuevaTransferencia {

  constructor(
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router
  ) {}

  tituloKicker = 'ADMINISTRACION - REPORTES';
  subtituloKicker = 'NUEVA TRANSFERENCIA';
  iconoCabecera = 'pi pi-sync';

  activeStep = 0;
  steps = ['Producto y Sedes', 'Cantidad y Motivo', 'Fechas', 'Confirmacion'];

  sedes = [
    { label: 'Flores 15 - San Juan Lurigancho', value: 'flores-15' },
    { label: 'Lurin', value: 'lurin' },
    { label: 'San Borja', value: 'san-borja' },
  ];

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

  productos: TransferProducto[] = [
    {
      id: 1,
      nombre: 'Cable HDMI 2m',
      sku: 'CBL-HDMI-2M',
      categoria: 'Cables y Conectores',
      marca: 'Belkin',
      stockPorSede: {
        'flores-15': 50,
        'lurin': 130,
        'san-borja': 70
      }
    },
    {
      id: 2,
      nombre: 'Router WiFi AX3000',
      sku: 'RTR-AX3000',
      categoria: 'Redes',
      marca: 'TP-Link',
      stockPorSede: {
        'flores-15': 22,
        'lurin': 35,
        'san-borja': 18
      }
    },
    {
      id: 3,
      nombre: 'Monitor 24" IPS',
      sku: 'MON-24IPS',
      categoria: 'Monitores',
      marca: 'LG',
      stockPorSede: {
        'flores-15': 12,
        'lurin': 16,
        'san-borja': 9
      }
    }
  ];

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
