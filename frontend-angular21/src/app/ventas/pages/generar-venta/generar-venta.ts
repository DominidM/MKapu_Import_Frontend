// src/app/ventas/pages/generar-venta/generar-venta.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription, filter } from 'rxjs';

import { Card } from 'primeng/card';
import { Button } from 'primeng/button';
import { SelectButton } from 'primeng/selectbutton';
import { InputText } from 'primeng/inputtext';
import { InputNumber } from 'primeng/inputnumber';
import { Divider } from 'primeng/divider';
import { Tag } from 'primeng/tag';
import { Toast } from 'primeng/toast';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Select } from 'primeng/select';
import { Tooltip } from 'primeng/tooltip';
import { TableModule } from 'primeng/table';
import { StepperModule } from 'primeng/stepper';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { AutoComplete } from 'primeng/autocomplete';

import { VentasApiService } from '../../services/ventas-api.service';
import { ClienteBusquedaResponse, ItemVenta, METODOS_PAGO } from '../../interfaces/venta.interface';
import { ProductosService, Producto } from '../../../core/services/productos.service';
import { EmpleadosService, Empleado } from '../../../core/services/empleados.service';
import { MessageService, ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-crear-venta',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    Card,
    Button,
    SelectButton,
    InputText,
    InputNumber,
    Divider,
    Tag,
    Toast,
    ConfirmDialog,
    Select,
    Tooltip,
    TableModule,
    StepperModule,
    ProgressSpinnerModule,
    AutoComplete,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './generar-venta.html',
  styleUrls: ['./generar-venta.css'],
})
export class GenerarVenta implements OnInit, OnDestroy {
  tituloKicker = 'VENTAS - GENERAR VENTAS';
  subtituloKicker = 'GENERAR NUEVA VENTA';
  iconoCabecera = 'pi pi-shopping-cart';

  private subscriptions = new Subscription();
  private readonly STORAGE_KEY = 'generar_venta_estado';

  empleadoActual: Empleado | null = null;
  nombreResponsable: string = '';

  activeStep = 0;
  steps = ['Comprobante y Cliente', 'Productos', 'Venta y Pago', 'Confirmación'];

  tipoComprobanteOptions = [
    { label: 'Boleta', value: 2, icon: 'pi pi-file' },
    { label: 'Factura', value: 1, icon: 'pi pi-file-edit' },
  ];
  tipoComprobante: number = 2;

  numeroDocumento: string = '';
  clienteAutoComplete: string = '';
  clienteEncontrado: ClienteBusquedaResponse | null = null;
  busquedaRealizada = false;

  productosDisponibles: Producto[] = [];
  productosFiltrados: Producto[] = [];
  productosSeleccionados: ItemVenta[] = [];
  productoTemp: Producto | null = null;
  cantidadTemp: number = 1;
  tipoPrecioTemp: 'UNIDAD' | 'CAJA' | 'MAYORISTA' = 'UNIDAD';

  productoSeleccionadoBusqueda: string = '';
  productosSugeridos: Producto[] = [];

  familiaSeleccionada: string | null = null;
  familiasDisponibles: { label: string; value: string | null }[] = [];

  sedeIdSeleccionada: number = 0;
  sedeNombreSeleccionada: string = '';

  opcionesTipoPrecio = [
    { label: 'Unidad', value: 'UNIDAD' },
    { label: 'Caja', value: 'CAJA' },
    { label: 'Mayorista', value: 'MAYORISTA' },
  ];

  metodoPagoOptions = METODOS_PAGO.map((mp) => ({
    label: mp.description,
    value: mp.id,
    icon: this.getIconoMetodoPago(mp.id),
  }));
  metodoPagoSeleccionado: number = 1;

  montoRecibido: number = 0;
  numeroOperacion: string = '';

  comprobanteGenerado: any = null;
  loading = false;

  get textoBotonCliente(): string {
    const documentoActual = this.clienteAutoComplete.trim();
    const longitudRequerida = this.tipoComprobante === 2 ? 8 : 11;
    const tieneLongitudCorrecta = documentoActual.length === longitudRequerida;
    if (tieneLongitudCorrecta && this.clienteEncontrado) {
      return 'Cliente seleccionado';
    }
    return tieneLongitudCorrecta ? 'Buscar' : 'Ingrese documento válido';
  }

  get iconoBotonCliente(): string {
    const documentoActual = this.clienteAutoComplete.trim();
    const longitudRequerida = this.tipoComprobante === 2 ? 8 : 11;
    const tieneLongitudCorrecta = documentoActual.length === longitudRequerida;
    if (tieneLongitudCorrecta && this.clienteEncontrado) {
      return 'pi pi-check-circle';
    }
    return tieneLongitudCorrecta ? 'pi pi-search' : 'pi pi-id-card';
  }

  get botonClienteHabilitado(): boolean {
    const documentoActual = this.clienteAutoComplete.trim();
    const longitudRequerida = this.tipoComprobante === 2 ? 8 : 11;
    return documentoActual.length === longitudRequerida;
  }

  get requiereNumeroOperacion(): boolean {
    return this.metodoPagoSeleccionado !== 1;
  }

  constructor(
    private router: Router,
    private ventasApiService: VentasApiService,
    private productosService: ProductosService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private empleadosService: EmpleadosService,
  ) {}

  ngOnInit(): void {
    this.empleadoActual = this.empleadosService.getEmpleadoActual()!;
    this.nombreResponsable = this.empleadosService.getNombreCompletoEmpleadoActual();
    this.sedeIdSeleccionada = Number(this.empleadoActual.id_sede);
    this.sedeNombreSeleccionada = this.empleadoActual.nombre_sede!;
    this.messageService.add({
      severity: 'success',
      summary: `Bienvenido ${this.nombreResponsable}`,
      detail: `Sede: ${this.empleadoActual.nombre_sede}`,
      life: 3000,
    });
    this.cargarProductos();
    this.cargarFamilias();
    this.restaurarEstado();
    this.subscriptions.add(
      this.router.events
        .pipe(filter((event) => event instanceof NavigationEnd))
        .subscribe((event: NavigationEnd) => {
          if (event.url === '/ventas/generar-ventas') {
            this.restaurarEstado();
          }
        }),
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private guardarEstado(): void {
    const estado = {
      activeStep: this.activeStep,
      tipoComprobante: this.tipoComprobante,
      clienteEncontrado: this.clienteEncontrado,
      busquedaRealizada: this.busquedaRealizada,
      productosSeleccionados: this.productosSeleccionados,
      familiaSeleccionada: this.familiaSeleccionada,
      metodoPagoSeleccionado: this.metodoPagoSeleccionado,
      montoRecibido: this.montoRecibido,
      numeroOperacion: this.numeroOperacion,
      comprobanteGenerado: this.comprobanteGenerado,
      sedeIdSeleccionada: this.sedeIdSeleccionada,
      sedeNombreSeleccionada: this.sedeNombreSeleccionada,
    };

    try {
      sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(estado));
    } catch (error) {
      console.error('Error al guardar estado:', error);
    }
  }

  private restaurarEstado(): void {
    try {
      const estadoGuardado = sessionStorage.getItem(this.STORAGE_KEY);
      if (estadoGuardado) {
        const estado = JSON.parse(estadoGuardado);
        this.activeStep = estado.activeStep || 0;
        this.tipoComprobante = estado.tipoComprobante || 2;
        this.clienteEncontrado = estado.clienteEncontrado || null;
        this.busquedaRealizada = estado.busquedaRealizada || false;
        this.productosSeleccionados = estado.productosSeleccionados || [];
        this.familiaSeleccionada = estado.familiaSeleccionada || null;
        this.metodoPagoSeleccionado = estado.metodoPagoSeleccionado || 1;
        this.montoRecibido = estado.montoRecibido || 0;
        this.numeroOperacion = estado.numeroOperacion || '';
        this.comprobanteGenerado = estado.comprobanteGenerado || null;
        this.sedeIdSeleccionada = estado.sedeIdSeleccionada || Number(this.empleadoActual!.id_sede);
        this.sedeNombreSeleccionada =
          estado.sedeNombreSeleccionada || this.empleadoActual!.nombre_sede!;
      }
    } catch (error) {
      console.error('Error al restaurar estado:', error);
    }
  }

  private limpiarEstado(): void {
    sessionStorage.removeItem(this.STORAGE_KEY);
  }

  validarSoloNumeros(event: any): void {
    const input = event.target as HTMLInputElement;
    const valor = input.value;
    const valorLimpio = valor.replace(/\D/g, '');
    const longitudMaxima = this.tipoComprobante === 2 ? 8 : 11;
    const valorFinal = valorLimpio.slice(0, longitudMaxima);
    this.clienteAutoComplete = valorFinal;
    input.value = valorFinal;
  }

  onInputCambioDocumento(): void {
    if (
      this.clienteEncontrado &&
      this.clienteAutoComplete !== this.clienteEncontrado.documentValue
    ) {
      this.clienteEncontrado = null;
      this.busquedaRealizada = false;
    }
  }

  manejarAccionCliente(): void {
    const documentoIngresado = this.clienteAutoComplete.trim();
    const longitudRequerida = this.tipoComprobante === 2 ? 8 : 11;

    if (documentoIngresado.length !== longitudRequerida) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Documento inválido',
        detail: `El ${this.tipoComprobante === 2 ? 'DNI' : 'RUC'} debe tener ${longitudRequerida} dígitos`,
        life: 3000,
      });
      return;
    }

    this.buscarClienteAPI(documentoIngresado);
  }

  private buscarClienteAPI(documento: string): void {
    this.loading = true;

    this.ventasApiService.buscarClientePorDocumento(documento).subscribe({
      next: (cliente: ClienteBusquedaResponse) => {
        this.loading = false;
        this.clienteEncontrado = cliente;
        this.busquedaRealizada = true;

        this.messageService.add({
          severity: 'success',
          summary: 'Cliente encontrado',
          detail: cliente.name,
          life: 2000,
        });
      },
      error: (error) => {
        this.loading = false;
        this.clienteEncontrado = null;
        this.busquedaRealizada = true;

        this.messageService.add({
          severity: 'error',
          summary: 'Cliente no encontrado',
          detail: error.message,
          life: 4000,
        });
      },
    });
  }

  onTipoComprobanteChange(): void {
    this.limpiarCliente();
  }

  limpiarCliente(): void {
    this.numeroDocumento = '';
    this.clienteAutoComplete = '';
    this.clienteEncontrado = null;
    this.busquedaRealizada = false;
  }

  cargarProductos(): void {
    this.productosDisponibles = this.productosService.getProductos(
      this.sedeNombreSeleccionada,
      'Activo',
    );
    this.aplicarFiltros();
  }

  cargarFamilias(): void {
    const familiasUnicas = [...new Set(this.productosDisponibles.map((p) => p.familia))];
    this.familiasDisponibles = [
      { label: 'Todas las familias', value: null },
      ...familiasUnicas.map((f) => ({ label: f, value: f })),
    ];
  }

  buscarProductos(event: any): void {
    const query = event.query.toLowerCase();
    let productosBase = this.familiaSeleccionada
      ? this.productosDisponibles.filter((p) => p.familia === this.familiaSeleccionada)
      : this.productosDisponibles;
    this.productosSugeridos = productosBase
      .filter((producto) => {
        const coincideNombre = producto.nombre.toLowerCase().includes(query);
        const coincideCodigo = producto.codigo.toLowerCase().includes(query);
        return coincideNombre || coincideCodigo;
      })
      .slice(0, 10);
  }

  onProductoSeleccionado(event: any): void {
    const producto: Producto = event.value;
    this.seleccionarProducto(producto);
    this.productoSeleccionadoBusqueda = '';
    this.messageService.add({
      severity: 'success',
      summary: 'Producto seleccionado',
      detail: producto.nombre,
      life: 2000,
    });
  }

  onLimpiarBusqueda(): void {
    this.productoSeleccionadoBusqueda = '';
    this.productosSugeridos = [];
  }

  onFamiliaChange(): void {
    this.aplicarFiltros();
    this.productoSeleccionadoBusqueda = '';
    this.productosSugeridos = [];
  }

  aplicarFiltros(): void {
    if (this.familiaSeleccionada) {
      this.productosFiltrados = this.productosDisponibles.filter(
        (p) => p.familia === this.familiaSeleccionada,
      );
    } else {
      this.productosFiltrados = [...this.productosDisponibles];
    }
  }

  seleccionarProducto(producto: Producto): void {
    this.productoTemp = producto;
    this.cantidadTemp = 1;
    this.tipoPrecioTemp = 'UNIDAD';
  }

  agregarProducto(): void {
    if (!this.productoTemp || this.cantidadTemp <= 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Cantidad inválida',
        detail: 'Ingrese una cantidad válida',
        life: 3000,
      });
      return;
    }

    if (!this.productoTemp.id) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'El producto seleccionado no tiene ID válido',
        life: 3000,
      });
      return;
    }

    const stockDisponibleActual = this.productosService.getStockDisponible(this.productoTemp.id);

    if (this.cantidadTemp > stockDisponibleActual) {
      this.messageService.add({
        severity: 'error',
        summary: 'Stock insuficiente',
        detail: `Solo hay ${stockDisponibleActual} unidades disponibles`,
        life: 5000,
      });
      return;
    }

    const exito = this.productosService.descontarStock(this.productoTemp.id, this.cantidadTemp);

    if (!exito) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error al descontar stock',
        detail: 'No se pudo descontar el stock del producto',
        life: 4000,
      });
      return;
    }

    const precio = this.getPrecioSegunTipo(this.productoTemp);

    const item = this.ventasApiService.construirItemVenta({
      productId: String(this.productoTemp.id),
      quantity: this.cantidadTemp,
      unitPrice: precio,
      description: this.productoTemp.nombre,
    });

    this.productosSeleccionados.push(item);
    this.cargarProductos();
    this.productoTemp = null;
    this.cantidadTemp = 1;

    this.messageService.add({
      severity: 'success',
      summary: 'Producto agregado',
      detail: 'Producto añadido al carrito',
      life: 2000,
    });

    this.guardarEstado();
  }

  getPrecioSegunTipo(producto: Producto): number {
    switch (this.tipoPrecioTemp) {
      case 'CAJA':
        return producto.precioCaja;
      case 'MAYORISTA':
        return producto.precioMayorista;
      default:
        return producto.precioUnidad;
    }
  }

  eliminarProducto(index: number): void {
    this.confirmationService.confirm({
      message: '¿Eliminar este producto del carrito?',
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí',
      rejectLabel: 'No',
      accept: () => {
        const productoEliminado = this.productosSeleccionados[index];

        this.productosService.devolverStock(
          Number(productoEliminado.productId),
          productoEliminado.quantity,
        );

        this.cargarProductos();
        this.productosSeleccionados.splice(index, 1);

        this.messageService.add({
          severity: 'info',
          summary: 'Producto eliminado',
          detail: 'Producto removido del carrito y stock devuelto',
        });

        this.guardarEstado();
      },
    });
  }

  calcularSubtotal(): number {
    return this.ventasApiService.calcularSubtotal(this.productosSeleccionados);
  }

  calcularIGV(): number {
    return this.ventasApiService.calcularIGV(this.calcularSubtotal());
  }

  calcularTotal(): number {
    return this.productosSeleccionados.reduce((sum, item) => sum + item.total, 0);
  }

  calcularVuelto(): number {
    return Math.max(0, this.montoRecibido - this.calcularTotal());
  }

  nextStep(): void {
    if (this.validarStepActual()) {
      this.activeStep++;
      this.guardarEstado();
    }
  }

  prevStep(): void {
    if (this.activeStep > 0) {
      this.activeStep--;
      this.guardarEstado();
    }
  }

  validarStepActual(): boolean {
    switch (this.activeStep) {
      case 0:
        if (!this.clienteEncontrado) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Cliente requerido',
            detail: 'Debe buscar un cliente',
          });
          return false;
        }
        return true;

      case 1:
        if (this.productosSeleccionados.length === 0) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Productos requeridos',
            detail: 'Agregue al menos un producto',
          });
          return false;
        }
        return true;

      case 2:
        if (this.metodoPagoSeleccionado === 1 && this.montoRecibido < this.calcularTotal()) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Monto insuficiente',
            detail: 'El monto debe ser mayor o igual al total',
          });
          return false;
        }
        if (this.metodoPagoSeleccionado !== 1 && !this.numeroOperacion.trim()) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Número de operación requerido',
            detail: 'Ingrese el número de operación',
          });
          return false;
        }
        return true;

      default:
        return true;
    }
  }

  generarVenta(): void {
    this.confirmationService.confirm({
      message: '¿Confirmar la generación de esta venta?',
      header: 'Confirmar Venta',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, generar',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.procesarVenta();
      },
    });
  }

  procesarVenta(): void {
    this.loading = true;

    const subtotal = this.calcularSubtotal();
    const igv = this.calcularIGV();
    const total = this.calcularTotal();

    const dueDate =
      this.tipoComprobante === 1
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        : null;

    const ventaRequest = this.ventasApiService.construirRequestVenta({
      customerId: this.clienteEncontrado!.customerId,
      receiptTypeId: this.tipoComprobante,
      subtotal: subtotal,
      igv: igv,
      total: total,
      responsibleId: String(this.empleadoActual!.id_empleado),
      branchId: this.sedeIdSeleccionada,
      paymentMethodId: this.metodoPagoSeleccionado,
      operationNumber: this.requiereNumeroOperacion ? this.numeroOperacion : null,
      items: this.productosSeleccionados,
      dueDate: dueDate,
    });

    this.ventasApiService.registrarVenta(ventaRequest).subscribe({
      next: (response) => {
        this.loading = false;
        this.comprobanteGenerado = response.data;
        this.guardarEstado();

        this.messageService.add({
          severity: 'success',
          summary: 'Venta generada exitosamente',
          detail: `Comprobante ${response.data.serie}-${response.data.receiptNumber} creado`,
          life: 4000,
        });
      },
      error: (error) => {
        this.loading = false;
        console.error('Error al procesar venta:', error);

        this.messageService.add({
          severity: 'error',
          summary: 'Error al generar venta',
          detail: error.message || 'No se pudo procesar la venta',
          life: 5000,
        });
      },
    });
  }

  nuevaVenta(): void {
    if (this.comprobanteGenerado) {
      this.limpiarEstado();
      window.location.reload();
    } else {
      this.confirmationService.confirm({
        message: '¿Estás seguro de cancelar esta venta? Se perderá el progreso actual.',
        header: 'Confirmar Cancelación',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Sí, cancelar',
        rejectLabel: 'No',
        accept: () => {
          this.productosSeleccionados.forEach((item) => {
            this.productosService.devolverStock(Number(item.productId), item.quantity);
          });

          this.limpiarEstado();
          window.location.reload();
        },
      });
    }
  }

  verListado(): void {
    if (this.comprobanteGenerado) {
      this.router.navigate(['/ventas/historial-ventas']);
      return;
    }

    if (this.productosSeleccionados.length > 0) {
      this.confirmationService.confirm({
        message: '¿Desea salir sin generar la venta? Se cancelará la operación.',
        header: 'Confirmar salida',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Sí, salir',
        rejectLabel: 'Continuar venta',
        accept: () => {
          this.productosSeleccionados.forEach((item) => {
            this.productosService.devolverStock(Number(item.productId), item.quantity);
          });

          this.limpiarEstado();
          this.router.navigate(['/ventas/historial-ventas']);
        },
      });
    } else {
      this.limpiarEstado();
      this.router.navigate(['/ventas/historial-ventas']);
    }
  }

  private getIconoMetodoPago(id: number): string {
    const iconos: { [key: number]: string } = {
      1: 'pi pi-money-bill',
      2: 'pi pi-credit-card',
      3: 'pi pi-credit-card',
      4: 'pi pi-mobile',
      5: 'pi pi-building',
    };
    return iconos[id] || 'pi pi-wallet';
  }

  obtenerSeveridadStock(stock: number | undefined): 'success' | 'warn' | 'danger' {
    if (!stock || stock === 0) return 'danger';
    if (stock <= 5) return 'danger';
    if (stock <= 20) return 'warn';
    return 'success';
  }

  getLabelMetodoPago(id: number): string {
    const metodo = METODOS_PAGO.find((m) => m.id === id);
    return metodo ? metodo.description : 'N/A';
  }
}
