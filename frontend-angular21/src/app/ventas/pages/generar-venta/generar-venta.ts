import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { MessageService, ConfirmationService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { SelectButtonModule } from 'primeng/selectbutton';
import { AutoCompleteModule, AutoCompleteCompleteEvent } from 'primeng/autocomplete';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { InputNumberModule } from 'primeng/inputnumber';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';

import { AuthService } from '../../../auth/services/auth.service';
import { ClienteService } from '../../services/cliente.service';
import { VentaService } from '../../services/venta.service';
import { ProductoService } from '../../services/producto.service';

import {
  ClienteBusquedaResponse,
  ItemVenta,
  RegistroVentaRequest,
  RegistroVentaResponse,
  Producto,
  ProductoConStock,
  METODOS_PAGO,
  OPERATION_TYPE_VENTA_INTERNA,
  CURRENCY_PEN,
  IGV_RATE,
} from '../../interfaces';

@Component({
  selector: 'app-generar-venta',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ToastModule,
    ConfirmDialogModule,
    CardModule,
    ButtonModule,
    DividerModule,
    InputTextModule,
    SelectButtonModule,
    AutoCompleteModule,
    SelectModule,
    TagModule,
    InputNumberModule,
    TableModule,
    TooltipModule,
  ],
  templateUrl: './generar-venta.html',
  styleUrls: ['./generar-venta.css'],
  providers: [MessageService, ConfirmationService],
})
export class GenerarVenta implements OnInit, AfterViewInit {
  iconoCabecera: string = 'pi pi-shopping-cart';
  tituloKicker: string = 'Punto de Venta';
  subtituloKicker: string = 'Generar Nueva Venta';

  idSedeActual: number = 1;
  nombreSedeActual: string = '';
  idUsuarioActual: number = 0;
  nombreUsuarioActual: string = '';

  steps: string[] = ['Comprobante y Cliente', 'Productos', 'Forma de Pago', 'Confirmar Venta'];
  activeStep: number = 0;

  tipoComprobante: number = 2;
  tipoComprobanteOptions = [
    { label: 'Boleta', value: 2, icon: 'pi pi-file' },
    { label: 'Factura', value: 1, icon: 'pi pi-file-edit' },
  ];

  clienteAutoComplete: string = '';
  clienteEncontrado: ClienteBusquedaResponse | null = null;
  loading: boolean = false;
  busquedaRealizada: boolean = false;
  productosLoading: boolean = true;

  productosCargados: Producto[] = [];
  productosFiltrados: Producto[] = [];
  productosSugeridos: Producto[] = [];
  productoSeleccionadoBusqueda: any = null;

  familiaSeleccionada: string | null = null;
  familiasDisponibles: Array<{ label: string; value: string }> = [];

  productoTemp: Producto | null = null;
  cantidadTemp: number = 1;
  tipoPrecioTemp: string = 'unidad';

  opcionesTipoPrecio = [
    { label: 'Unidad', value: 'unidad' },
    { label: 'Caja', value: 'caja' },
    { label: 'Mayorista', value: 'mayorista' },
  ];

  productosSeleccionados: ItemVenta[] = [];

  metodoPagoSeleccionado: number = 1;
  metodoPagoOptions = [
    { label: 'Efectivo', value: 1, icon: 'pi pi-money-bill' },
    { label: 'Débito', value: 2, icon: 'pi pi-credit-card' },
    { label: 'Crédito', value: 3, icon: 'pi pi-credit-card' },
    { label: 'Yape/Plin', value: 4, icon: 'pi pi-mobile' },
    { label: 'Transferencia', value: 5, icon: 'pi pi-building' },
  ];

  montoRecibido: number = 0;
  numeroOperacion: string = '';

  comprobanteGenerado: RegistroVentaResponse['data'] | null = null;

  constructor(
    private authService: AuthService,
    private clienteService: ClienteService,
    private ventaService: VentaService,
    private productoService: ProductoService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.cargarConfiguracionInicial();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.cargarProductos();
    }, 0);
  }

  private cargarConfiguracionInicial(): void {
    const user = this.authService.getCurrentUser();

    if (!user) {
      this.messageService.add({
        severity: 'error',
        summary: 'Sesión no válida',
        detail: 'Por favor, inicie sesión nuevamente',
      });
      this.router.navigate(['/login']);
      return;
    }

    this.idSedeActual = user.idSede;
    this.nombreSedeActual = user.sedeNombre;
    this.idUsuarioActual = user.userId;
    this.nombreUsuarioActual = `${user.nombres} ${user.apellidos}`.trim();

    console.log('Configuración cargada:', {
      sede: this.nombreSedeActual,
      id_sede: this.idSedeActual,
      usuario: this.nombreUsuarioActual,
      id_usuario: this.idUsuarioActual,
    });
  }

  private cargarProductos(): void {
    this.productosLoading = true;

    this.productoService.obtenerProductosConStock(this.idSedeActual, undefined, 1, 500).subscribe({
      next: async (response) => {
        const productosConDetalles = await Promise.all(
          response.data.map(async (prod: ProductoConStock) => {
            try {
              const detalle = await this.productoService
                .obtenerDetalleProducto(prod.id_producto, this.idSedeActual)
                .toPromise();

              return this.productoService.mapearProductoConStock(prod, detalle!);
            } catch (error) {
              console.error(`Error al cargar detalle del producto ${prod.codigo}:`, error);
              return null;
            }
          }),
        );

        this.productosCargados = productosConDetalles.filter((p): p is Producto => p !== null);

        setTimeout(() => {
          this.productosFiltrados = [...this.productosCargados];
          this.cargarFamilias();
          this.productosLoading = false;
        }, 0);

        console.log(`${this.productosCargados.length} productos cargados de ${this.nombreSedeActual}`);
      },
      error: (error: any) => {
        console.error('Error al cargar productos:', error);
        this.productosLoading = false;
        this.cdr.detectChanges();
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los productos',
        });
      },
    });
  }

  private cargarFamilias(): void {
    const familiasUnicas = [...new Set(this.productosCargados.map((p) => p.familia))];
    this.familiasDisponibles = familiasUnicas
      .filter((familia) => familia)
      .sort()
      .map((familia) => ({
        label: familia,
        value: familia,
      }));
  }

  get textoBotonCliente(): string {
    return this.clienteEncontrado ? 'Cliente Seleccionado' : 'Buscar Cliente';
  }

  get iconoBotonCliente(): string {
    return this.clienteEncontrado ? 'pi pi-check' : 'pi pi-search';
  }

  get botonClienteHabilitado(): boolean {
    const longitudEsperada = this.tipoComprobante === 2 ? 8 : 11;
    return (this.clienteAutoComplete?.length || 0) === longitudEsperada;
  }

  onTipoComprobanteChange(): void {
    this.limpiarCliente();
    this.cdr.detectChanges();
  }

  validarSoloNumeros(event: any): void {
    const input = event.target;
    input.value = input.value.replace(/[^0-9]/g, '');
    this.clienteAutoComplete = input.value;
  }

  onInputCambioDocumento(): void {
    if (this.clienteEncontrado) {
      this.limpiarCliente();
    }
    this.busquedaRealizada = false;
  }

  manejarAccionCliente(): void {
    if (!this.botonClienteHabilitado || this.clienteEncontrado) {
      return;
    }
    this.buscarCliente();
  }

  private buscarCliente(): void {
    this.loading = true;
    this.busquedaRealizada = false;

    this.clienteService.buscarCliente(this.clienteAutoComplete, this.tipoComprobante).subscribe({
      next: (response: ClienteBusquedaResponse) => {
        this.clienteEncontrado = response;
        this.busquedaRealizada = true;
        this.loading = false;
        this.cdr.detectChanges();

        this.messageService.add({
          severity: 'success',
          summary: 'Cliente Encontrado',
          detail: `Cliente: ${response.name}`,
        });
      },
      error: (error: any) => {
        console.error('Error al buscar cliente:', error);
        this.clienteEncontrado = null;
        this.busquedaRealizada = true;
        this.loading = false;
        this.cdr.detectChanges();

        this.messageService.add({
          severity: 'warn',
          summary: 'Cliente No Encontrado',
          detail: 'El documento ingresado no está registrado',
        });
      },
    });
  }

  limpiarCliente(): void {
    this.clienteEncontrado = null;
    this.clienteAutoComplete = '';
    this.busquedaRealizada = false;
  }

  buscarProductos(event: AutoCompleteCompleteEvent): void {
    const query = event.query.toLowerCase().trim();

    if (query.length < 2) {
      this.productosSugeridos = [];
      return;
    }

    this.productoService.buscarProductos(query, this.idSedeActual).subscribe({
      next: async (response) => {
        const productosConDetalles = await Promise.all(
          response.data.map(async (prod: any) => {
            try {
              const detalle = await this.productoService
                .obtenerDetalleProducto(prod.id_producto, this.idSedeActual)
                .toPromise();

              return {
                id: prod.id_producto,
                codigo: prod.codigo,
                nombre: prod.nombre,
                familia: detalle!.producto.categoria.nombre,
                stock: prod.stock,
                precioUnidad: detalle!.producto.precio_unitario,
                precioCaja: detalle!.producto.precio_caja,
                precioMayorista: detalle!.producto.precio_mayor,
                sede: this.nombreSedeActual,
              };
            } catch (error) {
              console.error(`Error al cargar detalle del producto ${prod.codigo}:`, error);
              return null;
            }
          }),
        );

        this.productosSugeridos = productosConDetalles.filter((p): p is Producto => p !== null);
      },
      error: (error: any) => {
        console.error('Error al buscar productos:', error);
        this.productosSugeridos = [];
      },
    });
  }

  onProductoSeleccionado(event: any): void {
    if (event) {
      this.seleccionarProducto(event);
      this.productoSeleccionadoBusqueda = null;
    }
  }

  onLimpiarBusqueda(): void {
    this.productoSeleccionadoBusqueda = null;
  }

  onFamiliaChange(): void {
    if (this.familiaSeleccionada) {
      this.productosFiltrados = this.productosCargados.filter(
        (p) => p.familia === this.familiaSeleccionada,
      );
    } else {
      this.productosFiltrados = [...this.productosCargados];
    }
  }

  seleccionarProducto(producto: Producto): void {
    this.productoTemp = producto;
    this.cantidadTemp = 1;
    this.tipoPrecioTemp = 'unidad';
  }

  getPrecioSegunTipo(producto: Producto): number {
    switch (this.tipoPrecioTemp) {
      case 'caja':
        return producto.precioCaja;
      case 'mayorista':
        return producto.precioMayorista;
      default:
        return producto.precioUnidad;
    }
  }

  agregarProducto(): void {
    if (!this.productoTemp || this.cantidadTemp <= 0) {
      return;
    }

    if (this.cantidadTemp > this.productoTemp.stock) {
      this.messageService.add({
        severity: 'error',
        summary: 'Stock Insuficiente',
        detail: `Solo hay ${this.productoTemp.stock} unidades disponibles`,
      });
      return;
    }

    const precioUnitario = this.getPrecioSegunTipo(this.productoTemp);
    const total = precioUnitario * this.cantidadTemp;

    const item: ItemVenta = {
      productId: this.productoTemp.codigo,
      quantity: this.cantidadTemp,
      unitPrice: precioUnitario,
      description: this.productoTemp.nombre,
      total: total,
    };

    const indiceExistente = this.productosSeleccionados.findIndex(
      (p) => p.productId === item.productId && p.unitPrice === item.unitPrice,
    );

    if (indiceExistente >= 0) {
      const nuevoItem = { ...this.productosSeleccionados[indiceExistente] };
      nuevoItem.quantity += this.cantidadTemp;
      nuevoItem.total = nuevoItem.quantity * nuevoItem.unitPrice;

      if (nuevoItem.quantity > this.productoTemp.stock) {
        this.messageService.add({
          severity: 'error',
          summary: 'Stock Insuficiente',
          detail: `Solo hay ${this.productoTemp.stock} unidades disponibles`,
        });
        return;
      }

      this.productosSeleccionados[indiceExistente] = nuevoItem;
    } else {
      this.productosSeleccionados.push(item);
    }

    this.messageService.add({
      severity: 'success',
      summary: 'Producto Agregado',
      detail: `${this.cantidadTemp} x ${this.productoTemp.nombre}`,
    });

    this.productoTemp = null;
    this.cantidadTemp = 1;
  }

  eliminarProducto(index: number): void {
    this.confirmationService.confirm({
      message: '¿Está seguro de eliminar este producto del carrito?',
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.productosSeleccionados.splice(index, 1);
        this.messageService.add({
          severity: 'info',
          summary: 'Producto Eliminado',
          detail: 'El producto fue removido del carrito',
        });
      },
    });
  }

  obtenerSeveridadStock(stock: number | undefined): 'success' | 'warn' | 'danger' {
    if (!stock || stock === 0) return 'danger';
    if (stock <= 5) return 'danger';
    if (stock <= 20) return 'warn';
    return 'success';
  }

  calcularSubtotal(): number {
    const total = this.productosSeleccionados.reduce((sum, item) => sum + item.total, 0);
    return total / (1 + IGV_RATE);
  }

  calcularIGV(): number {
    return this.calcularSubtotal() * IGV_RATE;
  }

  calcularTotal(): number {
    return this.productosSeleccionados.reduce((sum, item) => sum + item.total, 0);
  }

  calcularVuelto(): number {
    const vuelto = this.montoRecibido - this.calcularTotal();
    return vuelto >= 0 ? vuelto : 0;
  }

  getLabelMetodoPago(id: number): string {
    const metodo = METODOS_PAGO.find((m) => m.id === id);
    return metodo ? metodo.description : 'N/A';
  }

  nextStep(): void {
    if (!this.validarPasoActual()) {
      return;
    }

    if (this.activeStep < this.steps.length - 1) {
      this.activeStep++;
    }
  }

  prevStep(): void {
    if (this.activeStep > 0) {
      this.activeStep--;
    }
  }

  private validarPasoActual(): boolean {
    switch (this.activeStep) {
      case 0:
        if (!this.clienteEncontrado) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Cliente Requerido',
            detail: 'Debe buscar y seleccionar un cliente',
          });
          return false;
        }
        return true;

      case 1:
        if (this.productosSeleccionados.length === 0) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Carrito Vacío',
            detail: 'Debe agregar al menos un producto',
          });
          return false;
        }
        return true;

      case 2:
        if (this.metodoPagoSeleccionado === 1 && this.montoRecibido < this.calcularTotal()) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Monto Insuficiente',
            detail: 'El monto recibido debe ser mayor o igual al total',
          });
          return false;
        }

        if (this.metodoPagoSeleccionado !== 1 && !this.numeroOperacion.trim()) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Número de Operación Requerido',
            detail: 'Debe ingresar el número de operación',
          });
          return false;
        }
        return true;

      default:
        return true;
    }
  }

  generarVenta(): void {
    if (!this.clienteEncontrado) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No hay cliente seleccionado',
      });
      return;
    }

    this.confirmationService.confirm({
      message: '¿Está seguro de generar esta venta?',
      header: 'Confirmar Venta',
      icon: 'pi pi-question-circle',
      acceptLabel: 'Sí, generar',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.procesarVenta();
      },
    });
  }

  private procesarVenta(): void {
    this.loading = true;

    const subtotal = Number(this.calcularSubtotal().toFixed(2));
    const igv = Number(this.calcularIGV().toFixed(2));
    const total = Number(this.calcularTotal().toFixed(2));

    const fechaVencimiento = new Date();
    if (this.metodoPagoSeleccionado !== 1) {
      fechaVencimiento.setDate(fechaVencimiento.getDate() + 30);
    }

    const request: RegistroVentaRequest = {
      customerId: this.clienteEncontrado!.customerId,
      saleTypeId: 1,
      receiptTypeId: this.tipoComprobante,
      dueDate: fechaVencimiento.toISOString(),
      operationType: OPERATION_TYPE_VENTA_INTERNA,
      subtotal: subtotal,
      igv: igv,
      isc: 0,
      total: total,
      currencyCode: CURRENCY_PEN,
      responsibleId: this.idUsuarioActual.toString(),
      branchId: this.idSedeActual,
      paymentMethodId: this.metodoPagoSeleccionado,
      operationNumber: this.metodoPagoSeleccionado === 1 ? null : this.numeroOperacion,
      items: this.productosSeleccionados.map((item) => {
        const producto = this.productosCargados.find((p) => p.codigo === item.productId);

        return {
          productId: producto ? producto.id.toString() : item.productId,
          quantity: item.quantity,
          unitPrice: Number(item.unitPrice.toFixed(2)),
          description: item.description,
          total: Number(item.total.toFixed(2)),
        };
      }),
    };

    console.log('Request de venta:', request);
    console.log('Items detalle:', JSON.stringify(request.items, null, 2));

    this.ventaService.registrarVenta(request).subscribe({
      next: (response: any) => {
        this.loading = false;

        console.log('Respuesta del backend:', response);

        this.comprobanteGenerado = {
          receiptId: response.receiptId || response.id_comprobante || 'N/A',
          receiptNumber: response.receiptNumber || response.numero || 'N/A',
          serie: response.serie || 'N/A',
          total: response.total || this.calcularTotal(),
          createdAt: response.createdAt || response.fec_emision || new Date().toISOString(),
        };

        this.messageService.add({
          severity: 'success',
          summary: '¡Venta Exitosa!',
          detail: `Comprobante ${this.comprobanteGenerado.serie}-${this.comprobanteGenerado.receiptNumber} generado`,
          life: 5000,
        });
      },
      error: (error: any) => {
        this.loading = false;
        console.error('Error al generar venta:', error);
        console.error('Error detalle:', error.error);

        this.messageService.add({
          severity: 'error',
          summary: 'Error al Generar Venta',
          detail: error.error?.message || 'Ocurrió un error al procesar la venta',
        });
      },
    });
  }

  nuevaVenta(): void {
    this.confirmationService.confirm({
      message: '¿Desea realizar una nueva venta?',
      header: 'Nueva Venta',
      icon: 'pi pi-refresh',
      acceptLabel: 'Sí',
      rejectLabel: 'No',
      accept: () => {
        this.resetearFormulario();
      },
    });
  }

  verListado(): void {
    this.router.navigate(['/ventas/listado']);
  }

  private resetearFormulario(): void {
    this.tipoComprobante = 2;
    this.clienteAutoComplete = '';
    this.clienteEncontrado = null;
    this.busquedaRealizada = false;

    this.productoTemp = null;
    this.cantidadTemp = 1;
    this.tipoPrecioTemp = 'unidad';
    this.productosSeleccionados = [];
    this.familiaSeleccionada = null;
    this.productosFiltrados = [...this.productosCargados];

    this.metodoPagoSeleccionado = 1;
    this.montoRecibido = 0;
    this.numeroOperacion = '';

    this.comprobanteGenerado = null;
    this.activeStep = 0;

    this.cargarProductos();
  }
}
