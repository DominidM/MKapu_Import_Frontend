import { Component, OnInit, AfterViewInit, signal, computed, inject, effect } from '@angular/core';
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
  private readonly authService = inject(AuthService);
  private readonly clienteService = inject(ClienteService);
  private readonly ventaService = inject(VentaService);
  private readonly productoService = inject(ProductoService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly router = inject(Router);

  readonly iconoCabecera = 'pi pi-shopping-cart';
  readonly tituloKicker = 'VENTAS - GENERAR VENTA';
  readonly subtituloKicker = 'GENERAR NUEVA VENTA';
  readonly steps = ['Comprobante y Cliente', 'Productos', 'Forma de Pago', 'Confirmar Venta'];

  readonly tipoComprobanteOptions = [
    { label: 'Boleta', value: 2, icon: 'pi pi-file' },
    { label: 'Factura', value: 1, icon: 'pi pi-file-edit' },
  ];

  readonly opcionesTipoPrecio = [
    { label: 'Unidad', value: 'unidad' },
    { label: 'Caja', value: 'caja' },
    { label: 'Mayorista', value: 'mayorista' },
  ];

  readonly metodoPagoOptions = [
    { label: 'Efectivo', value: 1, icon: 'pi pi-money-bill' },
    { label: 'Débito', value: 2, icon: 'pi pi-credit-card' },
    { label: 'Crédito', value: 3, icon: 'pi pi-credit-card' },
    { label: 'Yape/Plin', value: 4, icon: 'pi pi-mobile' },
    { label: 'Transferencia', value: 5, icon: 'pi pi-building' },
  ];

  idSedeActual = signal(1);
  nombreSedeActual = signal('');
  idUsuarioActual = signal(0);
  nombreUsuarioActual = signal('');

  activeStep = signal(0);

  tipoComprobante = signal(2);
  clienteAutoComplete = signal('');
  clienteEncontrado = signal<ClienteBusquedaResponse | null>(null);
  loading = signal(false);
  busquedaRealizada = signal(false);

  productosLoading = signal(true);
  productosCargados = signal<Producto[]>([]);
  productosFiltrados = signal<Producto[]>([]);
  productosSugeridos = signal<Producto[]>([]);
  productoSeleccionadoBusqueda = signal<any>(null);

  familiaSeleccionada = signal<string | null>(null);
  familiasDisponibles = signal<Array<{ label: string; value: string }>>([]);

  productoTemp = signal<Producto | null>(null);
  cantidadTemp = signal(1);
  tipoPrecioTemp = signal('unidad');

  productosSeleccionados = signal<ItemVenta[]>([]);

  metodoPagoSeleccionado = signal(1);
  montoRecibido = signal(0);
  numeroOperacion = signal('');

  comprobanteGenerado = signal<RegistroVentaResponse['data'] | null>(null);

  textoBotonCliente = computed(() => {
    return this.clienteEncontrado() ? 'Cliente Seleccionado' : 'Buscar Cliente';
  });

  iconoBotonCliente = computed(() => {
    return this.clienteEncontrado() ? 'pi pi-check' : 'pi pi-search';
  });

  botonClienteHabilitado = computed(() => {
    const longitudEsperada = this.tipoComprobante() === 2 ? 8 : 11;
    return (this.clienteAutoComplete()?.length || 0) === longitudEsperada;
  });

  subtotal = computed(() => {
    const total = this.productosSeleccionados().reduce((sum, item) => sum + item.total, 0);
    return total / (1 + IGV_RATE);
  });

  igv = computed(() => {
    return this.subtotal() * IGV_RATE;
  });

  total = computed(() => {
    return this.productosSeleccionados().reduce((sum, item) => sum + item.total, 0);
  });

  vuelto = computed(() => {
    const vuelto = this.montoRecibido() - this.total();
    return vuelto >= 0 ? vuelto : 0;
  });

  precioSegunTipo = computed(() => {
    const producto = this.productoTemp();
    if (!producto) return 0;

    switch (this.tipoPrecioTemp()) {
      case 'caja':
        return producto.precioCaja;
      case 'mayorista':
        return producto.precioMayorista;
      default:
        return producto.precioUnidad;
    }
  });

  obtenerSiglasDocumento(documentTypeDescription: string): string {
    if (!documentTypeDescription) return '';

    if (documentTypeDescription.includes('DNI')) return 'DNI';
    if (documentTypeDescription.includes('RUC')) return 'RUC';

    const match = documentTypeDescription.match(/\(([^)]+)\)/);
    return match ? match[1] : documentTypeDescription;
  }

  formatearDocumentoCompleto(): string {
    const cliente = this.clienteEncontrado();
    if (!cliente || !cliente.documentTypeDescription) return '';

    const siglas = this.obtenerSiglasDocumento(cliente.documentTypeDescription);
    return `${siglas}: ${cliente.documentValue}`;
  }

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

    this.idSedeActual.set(user.idSede);
    this.nombreSedeActual.set(user.sedeNombre);
    this.idUsuarioActual.set(user.userId);
    this.nombreUsuarioActual.set(`${user.nombres} ${user.apellidos}`.trim());

    console.log('Configuración cargada:', {
      sede: this.nombreSedeActual(),
      id_sede: this.idSedeActual(),
      usuario: this.nombreUsuarioActual(),
      id_usuario: this.idUsuarioActual(),
    });
  }

  private cargarProductos(): void {
    this.productosLoading.set(true);

    this.productoService
      .obtenerProductosConStock(this.idSedeActual(), undefined, 1, 500)
      .subscribe({
        next: async (response) => {
          const productosConDetalles = await Promise.all(
            response.data.map(async (prod: ProductoConStock) => {
              try {
                const detalle = await this.productoService
                  .obtenerDetalleProducto(prod.id_producto, this.idSedeActual())
                  .toPromise();

                return this.productoService.mapearProductoConStock(prod, detalle!);
              } catch (error) {
                console.error(`Error al cargar detalle del producto ${prod.codigo}:`, error);
                return null;
              }
            }),
          );

          const productos = productosConDetalles.filter((p): p is Producto => p !== null);

          this.productosCargados.set(productos);
          this.productosFiltrados.set([...productos]);
          this.cargarFamilias();
          this.productosLoading.set(false);

          console.log(`${productos.length} productos cargados de ${this.nombreSedeActual()}`);
        },
        error: (error: any) => {
          console.error('Error al cargar productos:', error);
          this.productosLoading.set(false);

          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron cargar los productos',
          });
        },
      });
  }

  private cargarFamilias(): void {
    const familiasUnicas = [...new Set(this.productosCargados().map((p) => p.familia))];
    const familias = familiasUnicas
      .filter((familia) => familia)
      .sort()
      .map((familia) => ({
        label: familia,
        value: familia,
      }));

    this.familiasDisponibles.set(familias);
  }

  onTipoComprobanteChange(nuevoTipo: number): void {
    this.tipoComprobante.set(nuevoTipo);
    this.limpiarCliente();
  }

  validarSoloNumeros(event: any): void {
    const input = event.target;
    input.value = input.value.replace(/[^0-9]/g, '');
    this.clienteAutoComplete.set(input.value);
  }

  onInputCambioDocumento(): void {
    if (this.clienteEncontrado()) {
      this.limpiarCliente();
    }
    this.busquedaRealizada.set(false);
  }

  manejarAccionCliente(): void {
    if (!this.botonClienteHabilitado() || this.clienteEncontrado()) {
      return;
    }
    this.buscarCliente();
  }

  private buscarCliente(): void {
    this.loading.set(true);
    this.busquedaRealizada.set(false);

    this.clienteService
      .buscarCliente(this.clienteAutoComplete(), this.tipoComprobante())
      .subscribe({
        next: (response: ClienteBusquedaResponse) => {
          this.clienteEncontrado.set(response);
          this.busquedaRealizada.set(true);
          this.loading.set(false);

          this.messageService.add({
            severity: 'success',
            summary: 'Cliente Encontrado',
            detail: `Cliente: ${response.name}`,
          });
        },
        error: (error: any) => {
          console.error('Error al buscar cliente:', error);
          this.clienteEncontrado.set(null);
          this.busquedaRealizada.set(true);
          this.loading.set(false);

          this.messageService.add({
            severity: 'warn',
            summary: 'Cliente No Encontrado',
            detail: 'El documento ingresado no está registrado',
          });
        },
      });
  }

  limpiarCliente(): void {
    this.clienteEncontrado.set(null);
    this.clienteAutoComplete.set('');
    this.busquedaRealizada.set(false);
  }

  buscarProductos(event: AutoCompleteCompleteEvent): void {
    const query = event.query.toLowerCase().trim();

    if (query.length < 2) {
      this.productosSugeridos.set([]);
      return;
    }

    this.productoService.buscarProductos(query, this.idSedeActual()).subscribe({
      next: async (response) => {
        const productosConDetalles = await Promise.all(
          response.data.map(async (prod: any) => {
            try {
              const detalle = await this.productoService
                .obtenerDetalleProducto(prod.id_producto, this.idSedeActual())
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
                sede: this.nombreSedeActual(),
              };
            } catch (error) {
              console.error(`Error al cargar detalle del producto ${prod.codigo}:`, error);
              return null;
            }
          }),
        );

        const productos = productosConDetalles.filter((p): p is Producto => p !== null);
        this.productosSugeridos.set(productos);
      },
      error: (error: any) => {
        console.error('Error al buscar productos:', error);
        this.productosSugeridos.set([]);
      },
    });
  }

  onProductoSeleccionado(event: any): void {
    if (event) {
      this.seleccionarProducto(event);
      this.productoSeleccionadoBusqueda.set(null);
    }
  }

  onLimpiarBusqueda(): void {
    this.productoSeleccionadoBusqueda.set(null);
  }

  onFamiliaChange(nuevaFamilia: string | null): void {
    this.familiaSeleccionada.set(nuevaFamilia);

    if (nuevaFamilia) {
      const filtrados = this.productosCargados().filter((p) => p.familia === nuevaFamilia);
      this.productosFiltrados.set(filtrados);
    } else {
      this.productosFiltrados.set([...this.productosCargados()]);
    }
  }

  seleccionarProducto(producto: Producto): void {
    this.productoTemp.set(producto);
    this.cantidadTemp.set(1);
    this.tipoPrecioTemp.set('unidad');
  }

  agregarProducto(): void {
    const producto = this.productoTemp();
    const cantidad = this.cantidadTemp();

    if (!producto || cantidad <= 0) {
      return;
    }

    if (cantidad > producto.stock) {
      this.messageService.add({
        severity: 'error',
        summary: 'Stock Insuficiente',
        detail: `Solo hay ${producto.stock} unidades disponibles`,
      });
      return;
    }

    const precioUnitario = this.precioSegunTipo();
    const total = precioUnitario * cantidad;

    const item: ItemVenta = {
      productId: producto.codigo,
      quantity: cantidad,
      unitPrice: precioUnitario,
      description: producto.nombre,
      total: total,
    };

    const productos = [...this.productosSeleccionados()];
    const indiceExistente = productos.findIndex(
      (p) => p.productId === item.productId && p.unitPrice === item.unitPrice,
    );

    if (indiceExistente >= 0) {
      const nuevoItem = { ...productos[indiceExistente] };
      nuevoItem.quantity += cantidad;
      nuevoItem.total = nuevoItem.quantity * nuevoItem.unitPrice;

      if (nuevoItem.quantity > producto.stock) {
        this.messageService.add({
          severity: 'error',
          summary: 'Stock Insuficiente',
          detail: `Solo hay ${producto.stock} unidades disponibles`,
        });
        return;
      }

      productos[indiceExistente] = nuevoItem;
    } else {
      productos.push(item);
    }

    this.productosSeleccionados.set(productos);

    this.messageService.add({
      severity: 'success',
      summary: 'Producto Agregado',
      detail: `${cantidad} x ${producto.nombre}`,
    });

    this.productoTemp.set(null);
    this.cantidadTemp.set(1);
  }

  eliminarProducto(index: number): void {
    this.confirmationService.confirm({
      message: '¿Está seguro de eliminar este producto del carrito?',
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      accept: () => {
        const productos = [...this.productosSeleccionados()];
        productos.splice(index, 1);
        this.productosSeleccionados.set(productos);

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
    return this.subtotal();
  }

  calcularIGV(): number {
    return this.igv();
  }

  calcularTotal(): number {
    return this.total();
  }

  calcularVuelto(): number {
    return this.vuelto();
  }

  getLabelMetodoPago(id: number): string {
    const metodo = METODOS_PAGO.find((m) => m.id === id);
    return metodo ? metodo.description : 'N/A';
  }

  nextStep(): void {
    if (!this.validarPasoActual()) {
      return;
    }

    const currentStep = this.activeStep();
    if (currentStep < this.steps.length - 1) {
      this.activeStep.set(currentStep + 1);
    }
  }

  prevStep(): void {
    const currentStep = this.activeStep();
    if (currentStep > 0) {
      this.activeStep.set(currentStep - 1);
    }
  }

  private validarPasoActual(): boolean {
    const step = this.activeStep();

    switch (step) {
      case 0:
        if (!this.clienteEncontrado()) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Cliente Requerido',
            detail: 'Debe buscar y seleccionar un cliente',
          });
          return false;
        }
        return true;

      case 1:
        if (this.productosSeleccionados().length === 0) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Carrito Vacío',
            detail: 'Debe agregar al menos un producto',
          });
          return false;
        }
        return true;

      case 2:
        if (this.metodoPagoSeleccionado() === 1 && this.montoRecibido() < this.total()) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Monto Insuficiente',
            detail: 'El monto recibido debe ser mayor o igual al total',
          });
          return false;
        }

        if (this.metodoPagoSeleccionado() !== 1 && !this.numeroOperacion().trim()) {
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
    if (!this.clienteEncontrado()) {
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
    this.loading.set(true);

    const subtotal = Number(this.subtotal().toFixed(2));
    const igv = Number(this.igv().toFixed(2));
    const total = Number(this.total().toFixed(2));

    const fechaVencimiento = new Date();
    if (this.metodoPagoSeleccionado() !== 1) {
      fechaVencimiento.setDate(fechaVencimiento.getDate() + 30);
    }

    const request: RegistroVentaRequest = {
      customerId: this.clienteEncontrado()!.customerId,
      saleTypeId: 1,
      receiptTypeId: this.tipoComprobante(),
      dueDate: fechaVencimiento.toISOString(),
      operationType: OPERATION_TYPE_VENTA_INTERNA,
      subtotal: subtotal,
      igv: igv,
      isc: 0,
      total: total,
      currencyCode: CURRENCY_PEN,
      responsibleId: this.idUsuarioActual().toString(),
      branchId: this.idSedeActual(),
      paymentMethodId: this.metodoPagoSeleccionado(),
      operationNumber: this.metodoPagoSeleccionado() === 1 ? null : this.numeroOperacion(),
      items: this.productosSeleccionados().map((item) => {
        const producto = this.productosCargados().find((p) => p.codigo === item.productId);

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
        this.loading.set(false);

        console.log('Respuesta del backend:', response);

        const comprobante = {
          receiptId: response.receiptId || response.id_comprobante || 'N/A',
          receiptNumber: response.receiptNumber || response.numero || 'N/A',
          serie: response.serie || 'N/A',
          total: response.total || total,
          createdAt: response.createdAt || response.fec_emision || new Date().toISOString(),
        };

        this.comprobanteGenerado.set(comprobante);

        this.messageService.add({
          severity: 'success',
          summary: '¡Venta Exitosa!',
          detail: `Comprobante ${comprobante.serie}-${comprobante.receiptNumber} generado`,
          life: 5000,
        });
      },
      error: (error: any) => {
        this.loading.set(false);
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
    this.router.navigate(['/ventas/historial-ventas']);
  }

  private resetearFormulario(): void {
    this.tipoComprobante.set(2);
    this.clienteAutoComplete.set('');
    this.clienteEncontrado.set(null);
    this.busquedaRealizada.set(false);

    this.productoTemp.set(null);
    this.cantidadTemp.set(1);
    this.tipoPrecioTemp.set('unidad');
    this.productosSeleccionados.set([]);
    this.familiaSeleccionada.set(null);
    this.productosFiltrados.set([...this.productosCargados()]);

    this.metodoPagoSeleccionado.set(1);
    this.montoRecibido.set(0);
    this.numeroOperacion.set('');

    this.comprobanteGenerado.set(null);
    this.activeStep.set(0);

    this.cargarProductos();
  }
}
