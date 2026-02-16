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
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ProductoService } from '../../../../services/producto.service';
import { ProductoAutocomplete, ProductoInterface } from '../../../../interfaces/producto.interface';
import { SedeService } from '../../../../services/sede.service';
import { map } from 'rxjs';
import { Headquarter } from '../../../../interfaces/sedes.interface';
import { TransferenciaService } from '../../../../services/transferencia.service';
import { TransferenciaRequest } from '../../../../interfaces/transferencia.interface';

interface TransferProducto {
  id: string;
  nombre: string;
  sku: string;
  categoria: string;
  marca: string;
  stockPorSede: Record<string, number>;
}

const DEFAULT_TRANSFER_SERIES = ['SERIE-D-001', 'SERIE-D-002'];

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
    ConfirmDialogModule,
    AutoCompleteModule,
  ],
  templateUrl: './nueva-transferencia.html',
  styleUrl: './nueva-transferencia.css',
  providers: [MessageService, ConfirmationService],
})
export class NuevaTransferencia implements OnInit {
  constructor(
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router,
    private productoService: ProductoService,
    private sedeService: SedeService,
    private transferenciaService: TransferenciaService,
  ) {}

  idSede: number = 1;
  productosAutocomplete: TransferProducto[] = [];

  tituloKicker = 'ADMINISTRACION - REPORTES';
  subtituloKicker = 'NUEVA TRANSFERENCIA';
  iconoCabecera = 'pi pi-sync';

  activeStep = 0;
  steps = ['Producto y Sedes', 'Cantidad y Motivo', 'Fechas', 'Confirmacion'];

  sedes: { label: string; value: string }[] = [];
  sedesRaw: Headquarter[] = [];

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

  productoId: string | null = null;
  productoQuery: string | null = null;
  productos: TransferProducto[] = [];
  sedeOrigen: string | null = null;
  sedeDestino: string | null = null;
  cantidad = 1;
  motivo: string | null = null;
  observacion = '';
  fechaEnvio: Date | null = null;
  fechaLlegada: Date | null = null;
  responsable: string | null = null;
  submitting = false;
  readonly today = this.getToday();

  ngOnInit(): void {
    this.cargarSedes();
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
      next: (response) => {
        this.sedesRaw = response.headquarters ?? [];
        this.sedes = (response.headquarters ?? []).map((sede) => ({
          label: sede.nombre,
          value: sede.nombre,
        }));
        if (!this.sedeOrigen && this.sedes.length > 0) {
          this.sedeOrigen = this.sedes[0].value;
          this.idSede = this.sedesRaw[0]?.id_sede ?? this.idSede;
        }
        this.cargarProductos(this.sedeOrigen);
      },
      error: (error) => {
        console.error('Error al cargar sedes:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar las sedes',
        });
        this.cargarProductos();
        this.sedes = [];
      },
    });
  }

  onSedeOrigenChange(): void {
    this.productoId = null;
    this.productoQuery = null;
    this.cantidad = 1;
    const sedeId = this.sedesRaw.find((sede) => sede.nombre === this.sedeOrigen)?.id_sede;
    if (sedeId) {
      this.idSede = sedeId;
    }
    this.cargarProductos(this.sedeOrigen);
  }

  onSedeDestinoChange(): void {
    this.cargarStockProductoSeleccionadoEnSedes();
  }

  private cargarProductos(sede?: string | null): void {
    void sede;
    this.productoService.getProductos(1, 10, true).subscribe({
      next: (response) => {
        this.productos = this.mapProductos(response.products);
        this.productosAutocomplete = this.productos.slice(0, 8);
      },
      error: (error) => {
        console.error('Error al cargar productos:', error);
        this.productos = [];
        this.productosAutocomplete = [];
      },
    });
  }

  private mapProductos(productosBase: ProductoInterface[]): TransferProducto[] {
    return productosBase.map((producto) => ({
      id: String(producto.id_producto),
      nombre: producto.anexo,
      sku: producto.codigo,
      categoria: producto.categoriaNombre,
      marca: 'N/A',
      stockPorSede: {},
    }));
  }

  buscarProductos(event: any) {
    const query = event.query;

    if (!query || !this.idSede) return;

    this.productoService
      .getProductosAutocomplete(query, this.idSede)
      .pipe(map((resp) => resp.data))
      .subscribe((data) => {
        this.productosAutocomplete = this.mapAutocompleteProductos(data, this.sedeOrigen);
      });
  }

  private mapAutocompleteProductos(
    productos: ProductoAutocomplete[],
    sedeNombre?: string | null,
  ): TransferProducto[] {
    return productos.map((producto) => ({
      id: String(producto.id_producto),
      nombre: producto.nombre,
      sku: producto.codigo,
      categoria: '',
      marca: 'N/A',
      stockPorSede: sedeNombre ? { [sedeNombre]: producto.stock } : {},
    }));
  }


  onSelectProducto(event: { value: TransferProducto }): void {
    const producto = event.value;
    this.productoId = producto.id;
    this.productoQuery = producto.nombre;
    const restantes = this.productos.filter((p) => p.id !== producto.id);
    this.productos = [...restantes, producto];
    this.cargarStockProductoSeleccionadoEnSedes();
  }

  onClearProducto(): void {
    this.productoId = null;
    this.productoQuery = null;
  }

  private cargarStockProductoSeleccionadoEnSedes(): void {
    if (!this.productoId) return;
    this.cargarStockProductoEnSede(this.productoId, this.sedeOrigen);
    this.cargarStockProductoEnSede(this.productoId, this.sedeDestino);
  }

  private cargarStockProductoEnSede(productoId: string, sedeNombre: string | null): void {
    if (!sedeNombre) return;
    const sedeId = this.getSedeIdByNombre(sedeNombre);
    if (!sedeId) return;

    this.productoService.getProductoDetalleStock(Number(productoId), sedeId).subscribe({
      next: (resp) => {
        const stock = resp?.stock?.cantidad ?? 0;
        this.actualizarStockProductoEnMemoria(productoId, sedeNombre, stock);
      },
      error: (error) => {
        console.error('Error al cargar stock por sede:', error);
        this.actualizarStockProductoEnMemoria(productoId, sedeNombre, 0);
      },
    });
  }

  private getSedeIdByNombre(sedeNombre: string): number | null {
    const sede = this.sedesRaw.find((item) => item.nombre === sedeNombre);
    return sede?.id_sede ?? null;
  }

  private actualizarStockProductoEnMemoria(
    productoId: string,
    sedeNombre: string,
    stock: number,
  ): void {
    this.productos = this.productos.map((producto) => {
      if (producto.id !== productoId) return producto;
      return {
        ...producto,
        stockPorSede: {
          ...producto.stockPorSede,
          [sedeNombre]: stock,
        },
      };
    });

    this.productosAutocomplete = this.productosAutocomplete.map((producto) => {
      if (producto.id !== productoId) return producto;
      return {
        ...producto,
        stockPorSede: {
          ...producto.stockPorSede,
          [sedeNombre]: stock,
        },
      };
    });
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
    const valido = this.validarStepActual();
    console.log('[Transferencia] Validación step', this.activeStep, '=>', valido);
    if (valido) {
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
    console.log('[Transferencia] Confirmar transferencia click', {
      productoId: this.productoId,
      sedeOrigen: this.sedeOrigen,
      sedeDestino: this.sedeDestino,
      cantidad: this.cantidad,
      motivo: this.motivo,
      observacion: this.observacion,
      fechaEnvio: this.fechaEnvio,
      fechaLlegada: this.fechaLlegada,
      responsable: this.responsable,
    });
    this.confirmationService.confirm({
      message: 'Desea confirmar esta transferencia?',
      header: 'Confirmar Transferencia',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Confirmar',
      rejectLabel: 'Cancelar',
      acceptButtonProps: { severity: 'warning' },
      rejectButtonProps: { severity: 'secondary', outlined: true },
      accept: () => {
        this.registrarTransferencia();
      },
    });
  }

  private registrarTransferencia(): void {
    if (this.submitting) return;

    const payload = this.buildTransferenciaPayload();
    if (!payload) return;

    this.submitting = true;
    this.transferenciaService.postTransferencia(payload).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Registro exitoso',
          detail: 'La transferencia fue registrada correctamente',
          life: 3000,
        });
        this.router.navigate(['/admin/transferencia']);
        this.resetForm();
      },
      error: (error) => {
        console.error('Error al registrar transferencia:', error);
        this.submitting = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo registrar la transferencia',
          life: 3500,
        });
      },
      complete: () => {
        this.submitting = false;
      },
    });
  }

  private buildTransferenciaPayload(): TransferenciaRequest | null {
    if (!this.productoId || !this.sedeOrigen || !this.sedeDestino) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Datos incompletos',
        detail: 'Faltan datos para registrar la transferencia',
      });
      return null;
    }

    const user = this.getCurrentUserFromStorage();
    const userId = user?.userId;
    if (!userId) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Sesion invalida',
        detail: 'No se encontro el usuario actual para registrar la transferencia',
      });
      return null;
    }

    const originSedeId = this.getSedeIdByNombre(this.sedeOrigen);
    const destinationSedeId = this.getSedeIdByNombre(this.sedeDestino);

    if (!originSedeId || !destinationSedeId) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Sedes invalidas',
        detail: 'No se pudieron resolver las sedes seleccionadas',
      });
      return null;
    }

    return {
      originHeadquartersId: String(originSedeId),
      originWarehouseId: originSedeId,
      destinationHeadquartersId: String(destinationSedeId),
      destinationWarehouseId: destinationSedeId,
      userId,
      observation: this.observacion?.trim() || this.getMotivoLabel(this.motivo),
      items: [
        {
          productId: Number(this.productoId),
          series: DEFAULT_TRANSFER_SERIES,
        },
      ],
    };
  }

  private getCurrentUserFromStorage(): { userId?: number; nombres?: string; apellidos?: string } | null {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      console.error('Error leyendo usuario desde localStorage:', error);
      return null;
    }
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
