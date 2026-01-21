import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { Card } from 'primeng/card';
import { Button } from 'primeng/button';
import { SelectButton } from 'primeng/selectbutton';
import { InputText } from 'primeng/inputtext';
import { InputNumber } from 'primeng/inputnumber';
import { Divider } from 'primeng/divider';
import { Tag } from 'primeng/tag';
import { Toast } from 'primeng/toast';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { AutoComplete } from 'primeng/autocomplete';
import { Select } from 'primeng/select';
import { Tooltip } from 'primeng/tooltip';

import { TableModule } from 'primeng/table';
import { StepperModule } from 'primeng/stepper';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

import {
  VentasService,
  ComprobanteVenta,
  DetalleComprobante,
} from '../../../core/services/ventas.service';
import { ClientesService, Cliente } from '../../../core/services/clientes.service';
import { ComprobantesService } from '../../../core/services/comprobantes.service';
import { PosService } from '../../../core/services/pos.service';
import { ProductosService, Producto } from '../../../core/services/productos.service';
import { EmpleadosService, Empleado } from '../../../core/services/empleados.service';
import { PromocionesService, Promocion } from '../../../core/services/promociones.service';
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
    AutoComplete,
    Select,
    Tooltip,
    TableModule,
    StepperModule,
    ProgressSpinnerModule,
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
  private clickEnBotonBuscar = false;
  private seleccionandoDelAutocomplete = false;

  empleadoActual: Empleado | null = null;
  nombreResponsable: string = '';

  activeStep = 0;
  steps = ['Comprobante y Cliente', 'Productos', 'Venta y Pago', 'Confirmación'];

  tipoComprobanteOptions = [
    { label: 'Boleta', value: '03', icon: 'pi pi-file' },
    { label: 'Factura', value: '01', icon: 'pi pi-file-edit' },
  ];
  tipoComprobante: '01' | '03' = '03';

  numeroDocumento: string = '';
  clienteAutoComplete: any = null;
  clientesSugeridos: Cliente[] = [];
  clienteEncontrado: Cliente | null = null;
  busquedaRealizada = false;
  mostrarFormulario = false;

  nuevoCliente = {
    tipo_doc: 'DNI' as 'DNI' | 'RUC',
    num_doc: '',
    apellidos: '',
    nombres: '',
    razon_social: '',
    direccion: '',
    email: '',
    telefono: '',
  };

  productosDisponibles: Producto[] = [];
  productosFiltrados: Producto[] = [];
  productosSeleccionados: DetalleComprobante[] = [];
  productoTemp: Producto | null = null;
  cantidadTemp: number = 1;
  tipoPrecioTemp: 'UNIDAD' | 'CAJA' | 'MAYORISTA' = 'UNIDAD';

  productoSeleccionadoBusqueda: string = '';
  productosSugeridos: Producto[] = [];

  familiaSeleccionada: string | null = null;
  familiasDisponibles: { label: string; value: string | null }[] = [];

  sedeSeleccionada: string = '';

  opcionesTipoPrecio = [
    { label: 'Unidad', value: 'UNIDAD' },
    { label: 'Caja', value: 'CAJA' },
    { label: 'Mayorista', value: 'MAYORISTA' },
  ];

  tipoVentaOptions = [
    { label: 'Presencial', value: 'PRESENCIAL', icon: 'pi pi-user' },
    { label: 'Envío', value: 'ENVIO', icon: 'pi pi-send' },
    { label: 'Recojo', value: 'RECOJO', icon: 'pi pi-shopping-bag' },
    { label: 'Delivery', value: 'DELIVERY', icon: 'pi pi-car' },
  ];
  tipoVenta: 'ENVIO' | 'RECOJO' | 'DELIVERY' | 'PRESENCIAL' = 'PRESENCIAL';
  departamento: string = '';

  tipoPagoOptions = [
    { label: 'Efectivo', value: 'EFECTIVO', icon: 'pi pi-money-bill' },
    { label: 'Tarjeta', value: 'TARJETA', icon: 'pi pi-credit-card' },
    { label: 'Yape', value: 'YAPE', icon: 'pi pi-mobile' },
    { label: 'Plin', value: 'PLIN', icon: 'pi pi-mobile' },
  ];
  tipoPago: string = 'EFECTIVO';

  montoRecibido: number = 0;
  bancoSeleccionado: string = '';
  numeroOperacion: string = '';
  bancosDisponibles: string[] = [];
  codigoPromocion: string = '';
  promocionAplicada: Promocion | null = null;
  descuentoPromocion: number = 0;

  comprobanteGenerado: ComprobanteVenta | null = null;
  loading = false;

  constructor(
    private router: Router,
    private ventasService: VentasService,
    private clientesService: ClientesService,
    private comprobantesService: ComprobantesService,
    private posService: PosService,
    private productosService: ProductosService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private empleadosService: EmpleadosService,
    private promocionesService: PromocionesService,
  ) {}

  ngOnInit(): void {
    this.empleadoActual = this.empleadosService.getEmpleadoActual();
    this.nombreResponsable = this.empleadosService.getNombreCompletoEmpleadoActual();

    if (!this.empleadoActual) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error de autenticación',
        detail: 'No hay un empleado autenticado',
        life: 3000,
      });
      this.router.navigate(['/login']);
      return;
    }

    if (!this.empleadosService.puedeRealizarVentas()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Acceso denegado',
        detail: 'No tiene permisos para realizar ventas',
        life: 3000,
      });
      this.router.navigate(['/almacen/dashboard']);
      return;
    }

    this.sedeSeleccionada = this.empleadoActual.id_sede;

    this.messageService.add({
      severity: 'success',
      summary: `Bienvenido ${this.nombreResponsable}`,
      detail: `Sede: ${this.empleadoActual.nombre_sede}`,
      life: 3000,
    });

    this.cargarProductos();
    this.cargarFamilias();
    this.bancosDisponibles = this.posService.getBancosDisponibles();

    this.restaurarEstado();
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
      mostrarFormulario: this.mostrarFormulario,
      nuevoCliente: this.nuevoCliente,
      productosSeleccionados: this.productosSeleccionados,
      familiaSeleccionada: this.familiaSeleccionada,
      tipoVenta: this.tipoVenta,
      departamento: this.departamento,
      tipoPago: this.tipoPago,
      montoRecibido: this.montoRecibido,
      bancoSeleccionado: this.bancoSeleccionado,
      numeroOperacion: this.numeroOperacion,
      codigoPromocion: this.codigoPromocion,
      promocionAplicada: this.promocionAplicada,
      descuentoPromocion: this.descuentoPromocion,
      comprobanteGenerado: this.comprobanteGenerado,
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
        this.tipoComprobante = estado.tipoComprobante || '03';
        this.clienteEncontrado = estado.clienteEncontrado || null;
        this.busquedaRealizada = estado.busquedaRealizada || false;
        this.mostrarFormulario = estado.mostrarFormulario || false;
        this.nuevoCliente = estado.nuevoCliente || this.nuevoCliente;
        this.productosSeleccionados = estado.productosSeleccionados || [];
        this.familiaSeleccionada = estado.familiaSeleccionada || null;
        this.tipoVenta = estado.tipoVenta || 'PRESENCIAL';
        this.departamento = estado.departamento || '';
        this.tipoPago = estado.tipoPago || 'EFECTIVO';
        this.montoRecibido = estado.montoRecibido || 0;
        this.bancoSeleccionado = estado.bancoSeleccionado || '';
        this.numeroOperacion = estado.numeroOperacion || '';
        this.codigoPromocion = estado.codigoPromocion || '';
        this.promocionAplicada = estado.promocionAplicada || null;
        this.descuentoPromocion = estado.descuentoPromocion || 0;
        this.comprobanteGenerado = estado.comprobanteGenerado || null;

        this.messageService.add({
          severity: 'info',
          summary: 'Estado restaurado',
          detail: 'Se recuperó la venta en progreso',
          life: 2000,
        });
      }
    } catch (error) {
      console.error('Error al restaurar estado:', error);
    }
  }

  private limpiarEstado(): void {
    sessionStorage.removeItem(this.STORAGE_KEY);
  }

  buscarClienteAutoComplete(event: any): void {
    const query = event.query.toLowerCase();
    const todosClientes = this.clientesService.getClientes();

    const tipoDocRequerido = this.tipoComprobante === '03' ? 'DNI' : 'RUC';

    this.clientesSugeridos = todosClientes
      .filter((cliente) => {
        if (cliente.tipo_doc !== tipoDocRequerido) {
          return false;
        }

        const matchDoc = cliente.num_doc.toLowerCase().includes(query);
        const matchApellidos = cliente.apellidos?.toLowerCase().includes(query);
        const matchNombres = cliente.nombres?.toLowerCase().includes(query);
        const matchRazonSocial = cliente.razon_social?.toLowerCase().includes(query);

        return matchDoc || matchApellidos || matchNombres || matchRazonSocial;
      })
      .slice(0, 10);
  }

  onTipoComprobanteChange(): void {
    if (this.clienteEncontrado) {
      const tipoDocRequerido = this.tipoComprobante === '03' ? 'DNI' : 'RUC';

      if (this.clienteEncontrado.tipo_doc !== tipoDocRequerido) {
        this.limpiarCliente();
        this.messageService.add({
          severity: 'warn',
          summary: 'Cliente removido',
          detail: `El cliente seleccionado no tiene ${tipoDocRequerido}`,
          life: 3000,
        });
      }
    }

    this.clienteAutoComplete = null;
    this.clientesSugeridos = [];

    this.nuevoCliente.tipo_doc = this.tipoComprobante === '03' ? 'DNI' : 'RUC';
  }

  onNumeroDocumentoChange(): void {
    if (this.clienteEncontrado && this.numeroDocumento !== this.clienteEncontrado.num_doc) {
      this.clienteEncontrado = null;
      this.busquedaRealizada = false;
      this.mostrarFormulario = false;
    }
  }

  onBlurAutoComplete(): void {
    setTimeout(() => {
      if (this.clickEnBotonBuscar) {
        this.clickEnBotonBuscar = false;
        return;
      }

      if (this.seleccionandoDelAutocomplete) {
        this.seleccionandoDelAutocomplete = false;
        return;
      }

      if (this.clienteEncontrado) {
        return;
      }

      if (this.clienteAutoComplete && typeof this.clienteAutoComplete === 'string') {
        const documentoIngresado = this.clienteAutoComplete.trim();

        const longitudRequerida = this.tipoComprobante === '03' ? 8 : 11;

        if (documentoIngresado.length === longitudRequerida && /^\d+$/.test(documentoIngresado)) {
          const cliente = this.clientesService.buscarPorDocumento(documentoIngresado);

          if (cliente) {
            this.clienteEncontrado = cliente;
            this.busquedaRealizada = true;
            this.mostrarFormulario = false;

            const nombreCliente =
              this.tipoComprobante === '03'
                ? `${cliente.apellidos || ''} ${cliente.nombres || ''}`.trim()
                : cliente.razon_social || 'Sin nombre';

            this.messageService.add({
              severity: 'success',
              summary: 'Cliente encontrado',
              detail: nombreCliente,
              life: 2000,
            });
          } else {
            this.abrirFormularioNuevoCliente();
          }
        }
      }
    }, 100);
  }

  abrirFormularioNuevoCliente(): void {
    const documentoIngresado =
      typeof this.clienteAutoComplete === 'string'
        ? this.clienteAutoComplete
        : this.clienteAutoComplete?.num_doc || '';

    const longitudRequerida = this.tipoComprobante === '03' ? 8 : 11;

    if (documentoIngresado.length !== longitudRequerida) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Documento inválido',
        detail: `El ${this.tipoComprobante === '03' ? 'DNI' : 'RUC'} debe tener ${longitudRequerida} dígitos`,
        life: 3000,
      });
      return;
    }

    this.busquedaRealizada = true;
    this.clienteEncontrado = null;
    this.mostrarFormulario = true;

    this.nuevoCliente = {
      tipo_doc: this.tipoComprobante === '03' ? 'DNI' : 'RUC',
      num_doc: documentoIngresado,
      apellidos: '',
      nombres: '',
      razon_social: '',
      direccion: '',
      email: '',
      telefono: '',
    };

    this.messageService.add({
      severity: 'info',
      summary: 'Cliente no encontrado',
      detail: 'Complete los datos para registrar',
      life: 3000,
    });
  }

  onSelectCliente(event: any): void {
    this.seleccionandoDelAutocomplete = true;

    const cliente: Cliente = event.value;

    this.numeroDocumento = cliente.num_doc;

    setTimeout(() => {
      this.clienteAutoComplete = null;
    }, 0);

    this.clienteEncontrado = cliente;
    this.busquedaRealizada = true;
    this.mostrarFormulario = false;

    const nombreCliente =
      this.tipoComprobante === '03'
        ? `${cliente.apellidos || ''} ${cliente.nombres || ''}`.trim()
        : cliente.razon_social || 'Sin nombre';

    this.messageService.add({
      severity: 'success',
      summary: 'Cliente seleccionado',
      detail: nombreCliente,
    });
  }

  onClearCliente(): void {
    this.clienteAutoComplete = null;
    this.numeroDocumento = '';
    this.limpiarCliente();
  }

  buscarCliente(): void {
    this.clickEnBotonBuscar = true;

    if (!this.numeroDocumento.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Documento requerido',
        detail: 'Ingrese un número de documento',
      });
      return;
    }

    const longitudRequerida = this.tipoComprobante === '03' ? 8 : 11;
    if (this.numeroDocumento.length !== longitudRequerida) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Documento inválido',
        detail: `El ${this.tipoComprobante === '03' ? 'DNI' : 'RUC'} debe tener ${longitudRequerida} dígitos`,
      });
      return;
    }

    this.busquedaRealizada = true;
    const cliente = this.clientesService.buscarPorDocumento(this.numeroDocumento);
    this.clienteEncontrado = cliente || null;

    if (!this.clienteEncontrado) {
      this.nuevoCliente.num_doc = this.numeroDocumento;
      this.nuevoCliente.tipo_doc = this.tipoComprobante === '03' ? 'DNI' : 'RUC';
      this.nuevoCliente.apellidos = '';
      this.nuevoCliente.nombres = '';
      this.nuevoCliente.razon_social = '';
      this.mostrarFormulario = true;

      this.messageService.add({
        severity: 'info',
        summary: 'Cliente no encontrado',
        detail: 'Complete los datos para registrar',
      });
    } else {
      this.mostrarFormulario = false;

      const nombreCliente =
        this.tipoComprobante === '03'
          ? `${this.clienteEncontrado.apellidos || ''} ${this.clienteEncontrado.nombres || ''}`.trim()
          : this.clienteEncontrado.razon_social || 'Sin nombre';

      this.messageService.add({
        severity: 'success',
        summary: 'Cliente encontrado',
        detail: nombreCliente,
      });
    }
  }

  registrarNuevoCliente(): void {
    if (this.tipoComprobante === '03') {
      if (!this.nuevoCliente.apellidos.trim()) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Apellidos requeridos',
          detail: 'Ingrese los apellidos del cliente',
        });
        return;
      }
      if (!this.nuevoCliente.nombres.trim()) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Nombres requeridos',
          detail: 'Ingrese los nombres del cliente',
        });
        return;
      }
    }

    if (this.tipoComprobante === '01' && !this.nuevoCliente.razon_social.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Razón social requerida',
        detail: 'Ingrese la razón social',
      });
      return;
    }

    this.clienteEncontrado = this.clientesService.crearCliente({
      ...this.nuevoCliente,
      estado: true,
    });

    this.mostrarFormulario = false;

    const nombreCliente =
      this.tipoComprobante === '03'
        ? `${this.nuevoCliente.apellidos} ${this.nuevoCliente.nombres}`
        : this.nuevoCliente.razon_social;

    this.messageService.add({
      severity: 'success',
      summary: 'Cliente registrado',
      detail: nombreCliente,
    });
  }

  limpiarCliente(): void {
    this.numeroDocumento = '';
    this.clienteEncontrado = null;
    this.busquedaRealizada = false;
    this.mostrarFormulario = false;
    this.clientesSugeridos = [];

    this.nuevoCliente = {
      tipo_doc: this.tipoComprobante === '03' ? 'DNI' : 'RUC',
      num_doc: '',
      apellidos: '',
      nombres: '',
      razon_social: '',
      direccion: '',
      email: '',
      telefono: '',
    };
  }

  cargarProductos(): void {
    this.productosDisponibles = this.productosService.getProductos(this.sedeSeleccionada, 'Activo');
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
    if (!this.productoTemp || this.cantidadTemp <= 0) return;

    const precio = this.getPrecioSegunTipo(this.productoTemp);
    const valorUnit = this.comprobantesService.calcularValorUnitario(precio);
    const igv = this.comprobantesService.calcularIGVItem(valorUnit, this.cantidadTemp);

    const detalle: DetalleComprobante = {
      id_det_com: this.productosSeleccionados.length + 1,
      id_comprobante: '',
      id_producto: String(this.productoTemp.id),
      cod_prod: this.productoTemp.codigo,
      descripcion: this.productoTemp.nombre,
      cantidad: this.cantidadTemp,
      valor_unit: valorUnit,
      pre_uni: precio,
      igv: igv,
      tipo_afe_igv: '10',
    };

    this.productosSeleccionados.push(detalle);
    this.productoTemp = null;

    this.messageService.add({
      severity: 'success',
      summary: 'Producto agregado',
      detail: 'Producto añadido al carrito',
    });
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
        this.productosSeleccionados.splice(index, 1);
        this.messageService.add({
          severity: 'info',
          summary: 'Producto eliminado',
          detail: 'Producto removido del carrito',
        });
      },
    });
  }

obtenerSeveridadStock(stock: number | undefined): 'success' | 'warn' | 'danger' {
  if (!stock || stock === 0) return 'danger';
  if (stock <= 5) return 'warn';
  if (stock <= 20) return 'warn';
  return 'success';
}

  onCodigoPromocionChange(): void {
    if (!this.codigoPromocion.trim()) {
      this.limpiarPromocion();
    }
  }

  aplicarPromocion(): void {
    if (!this.codigoPromocion.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Código requerido',
        detail: 'Ingrese un código de promoción',
        life: 3000,
      });
      return;
    }

    const resultado = this.promocionesService.aplicarPromocion(this.codigoPromocion, {
      subtotal: this.calcularSubtotal(),
      tipoComprobante: this.tipoComprobante,
      idCliente: this.clienteEncontrado?.id_cliente,
      idSede: this.sedeSeleccionada,
    });

    if (!resultado.exito) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error en promoción',
        detail: resultado.mensaje,
        life: 3000,
      });
      return;
    }

    this.promocionAplicada = resultado.promocion!;
    this.descuentoPromocion = resultado.descuento!;

    this.messageService.add({
      severity: 'success',
      summary: 'Promoción aplicada',
      detail: `${resultado.mensaje} - Descuento: S/ ${this.descuentoPromocion.toFixed(2)}`,
      life: 3000,
    });

    this.guardarEstado();
  }

  limpiarPromocion(): void {
    const habiaPromocion = this.promocionAplicada !== null;

    this.codigoPromocion = '';
    this.promocionAplicada = null;
    this.descuentoPromocion = 0;

    if (habiaPromocion) {
      this.messageService.add({
        severity: 'info',
        summary: 'Promoción removida',
        detail: 'Se eliminó el descuento aplicado',
        life: 2000,
      });
    }

    this.guardarEstado();
  }

  calcularSubtotal(): number {
    return this.productosSeleccionados.reduce((sum, p) => sum + p.valor_unit * p.cantidad, 0);
  }

  calcularIGV(): number {
    const subtotalConDescuento = this.calcularSubtotal() - this.descuentoPromocion;
    return subtotalConDescuento * 0.18;
  }

  calcularTotal(): number {
    return this.calcularSubtotal() - this.descuentoPromocion + this.calcularIGV();
  }

  calcularVuelto(): number {
    return this.posService.calcularVuelto(this.montoRecibido, this.calcularTotal());
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
            detail: 'Debe buscar o registrar un cliente',
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
        if (this.tipoVenta === 'ENVIO' && !this.departamento.trim()) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Departamento requerido',
            detail: 'Ingrese el departamento de envío',
          });
          return false;
        }
        if (this.tipoPago === 'EFECTIVO' && this.montoRecibido < this.calcularTotal()) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Monto insuficiente',
            detail: 'El monto debe ser mayor o igual al total',
          });
          return false;
        }
        if (this.tipoPago === 'TARJETA' && !this.bancoSeleccionado) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Banco requerido',
            detail: 'Seleccione un banco',
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

    const nombreCliente =
      this.tipoComprobante === '03'
        ? `${this.clienteEncontrado!.apellidos} ${this.clienteEncontrado!.nombres}`
        : this.clienteEncontrado!.razon_social || '';

    const subtotal = this.calcularSubtotal();
    const subtotalConDescuento = subtotal - this.descuentoPromocion;
    const igv = this.calcularIGV();
    const total = this.calcularTotal();

    const detalles = this.productosSeleccionados.map((detalle) => ({
      ...detalle,
      id_det_com: 0,
    }));

    const nuevoComprobante: Omit<
      ComprobanteVenta,
      'id' | 'id_comprobante' | 'hash_cpe' | 'xml_cpe' | 'cdr_cpe' | 'numero'
    > = {
      id_cliente: this.clienteEncontrado!.id_cliente,
      tipo_comprobante: this.tipoComprobante,
      serie: this.ventasService.generarSerie(this.tipoComprobante),
      fec_emision: new Date(),
      fec_venc:
        this.tipoComprobante === '01' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null,
      moneda: 'PEN',
      tipo_op: '0101',
      subtotal: subtotalConDescuento,
      igv: igv,
      isc: 0,
      total: total,
      estado: true,
      responsable: this.nombreResponsable,
      id_sede: this.sedeSeleccionada,
      id_empleado: this.empleadoActual!.id_empleado,
      detalles: detalles,
      cliente_nombre: nombreCliente,
      cliente_doc: this.clienteEncontrado!.num_doc,
      codigo_promocion: this.promocionAplicada?.codigo,
      descuento_promocion: this.descuentoPromocion > 0 ? this.descuentoPromocion : undefined,
      descripcion_promocion: this.promocionAplicada?.descripcion,
      id_promocion: this.promocionAplicada?.id_promocion,
    };

    setTimeout(() => {
      this.comprobanteGenerado = this.ventasService.crearComprobante(nuevoComprobante);

      if (this.promocionAplicada && this.comprobanteGenerado) {
        this.promocionesService.registrarUsoPromocion(
          this.promocionAplicada.codigo,
          this.comprobanteGenerado.id_comprobante,
        );
      }

      this.posService.registrarPago({
        id_comprobante: this.comprobanteGenerado.id_comprobante,
        fec_pago: new Date(),
        med_pago: this.tipoPago as 'EFECTIVO' | 'TARJETA' | 'YAPE' | 'PLIN' | 'TRANSFERENCIA',
        monto: total,
        banco: this.bancoSeleccionado || undefined,
        num_operacion: this.numeroOperacion || undefined,
      });

      this.loading = false;
      this.guardarEstado();

      this.messageService.add({
        severity: 'success',
        summary: 'Venta generada',
        detail: `${this.comprobanteGenerado.serie}-${this.comprobanteGenerado.numero.toString().padStart(8, '0')} creado`,
      });
    }, 1500);
  }

  imprimirComprobante() {
    this.guardarEstado();

    this.router.navigate(['/ventas/imprimir-comprobante'], {
      state: {
        comprobante: this.comprobanteGenerado,
        rutaRetorno: '/ventas/generar-venta',
      },
    });
  }

  nuevaVenta(): void {
    this.confirmationService.confirm({
      message: '¿Estás seguro de iniciar una nueva venta? Se perderá el progreso actual.',
      header: 'Confirmar Nueva Venta',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, nueva venta',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.limpiarEstado();
        window.location.reload();
      },
    });
  }

  verListado(): void {
    this.limpiarEstado();
    this.router.navigate(['/ventas/historial-ventas']);
  }
}
