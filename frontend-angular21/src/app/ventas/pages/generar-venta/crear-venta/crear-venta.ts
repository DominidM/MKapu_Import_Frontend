// src/app/ventas/pages/generar-venta/crear-venta/crear-venta.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

// PrimeNG Standalone Components (v21+)
import { Card } from 'primeng/card';
import { Button } from 'primeng/button';
import { SelectButton } from 'primeng/selectbutton';
import { InputText } from 'primeng/inputtext';
import { InputNumber } from 'primeng/inputnumber';
import { Divider } from 'primeng/divider';
import { Tag } from 'primeng/tag';
import { Message } from 'primeng/message';
import { Toast } from 'primeng/toast';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { AutoComplete } from 'primeng/autocomplete';
import { Select } from 'primeng/select';
import { Tooltip } from 'primeng/tooltip';
import { AutoCompleteSelectEvent } from 'primeng/autocomplete';

// PrimeNG Modules (que aún no son standalone)
import { TableModule } from 'primeng/table';
import { StepperModule } from 'primeng/stepper';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

// Services
import { VentasService, ComprobanteVenta, DetalleComprobante } from '../../../core/services/ventas.service';
import { ClientesService, Cliente } from '../../../core/services/clientes.service';
import { ComprobantesService } from '../../../core/services/comprobantes.service';
import { PosService } from '../../../core/services/pos.service';
import { ProductosService, Producto } from '../../../core/services/productos.service';
import { MessageService, ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-crear-venta',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    
    // PrimeNG Standalone Components
    Card,
    Button,
    SelectButton,
    InputText,
    InputNumber,
    Divider,
    Tag,
    Message,
    Toast,
    ConfirmDialog,
    IconField,
    InputIcon,
    AutoComplete,
    Select,
    Tooltip,
    
    // PrimeNG Modules (no standalone aún)
    TableModule,
    StepperModule,
    ProgressSpinnerModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './crear-venta.html',
  styleUrls: ['./crear-venta.css']
})
export class CrearVenta implements OnInit, OnDestroy {
  
  tituloKicker = 'VENTAS - GENERAR VENTAS';
  subtituloKicker = 'GENERAR NUEVA VENTA';
  iconoCabecera = 'pi pi-shopping-cart';

  private subscriptions = new Subscription();

  activeStep = 0;
  steps = ['Comprobante y Cliente', 'Productos', 'Venta y Pago', 'Confirmación'];
  
  tipoComprobanteOptions = [
    { label: 'Boleta', value: '03', icon: 'pi pi-file' },
    { label: 'Factura', value: '01', icon: 'pi pi-file-edit' }
  ];
  tipoComprobante: '01' | '03' = '03';

  // ============================================
  // CLIENTE - Con apellidos separados
  // ============================================
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
    telefono: ''
  };

  // ============================================
  // PRODUCTOS - NUEVO CON AUTOCOMPLETE Y FAMILIA
  // ============================================
  productosDisponibles: Producto[] = [];
  productosFiltrados: Producto[] = [];
  productosSeleccionados: DetalleComprobante[] = [];
  productoTemp: Producto | null = null;
  cantidadTemp: number = 1;
  tipoPrecioTemp: 'UNIDAD' | 'CAJA' | 'MAYORISTA' = 'UNIDAD';
  
  // ✅ IMPORTANTE: Declarar UNA SOLA VEZ como string
  productoSeleccionadoBusqueda: string = '';  
  productosSugeridos: Producto[] = [];
  
  // ✅ Selector de familia
  familiaSeleccionada: string | null = null;
  familiasDisponibles: { label: string; value: string | null }[] = [];
  
  // ✅ Sede es solo lectura
  sedeSeleccionada: string = '';
  sedesDisponibles: { label: string; value: string }[] = [];  // ✅ NUEVO


  opcionesTipoPrecio = [
    { label: 'Unidad', value: 'UNIDAD' },
    { label: 'Caja', value: 'CAJA' },
    { label: 'Mayorista', value: 'MAYORISTA' }
  ];

  // ============================================
  // VENTA Y PAGO
  // ============================================
  tipoVentaOptions = [
    { label: 'Presencial', value: 'PRESENCIAL', icon: 'pi pi-user' },
    { label: 'Envío', value: 'ENVIO', icon: 'pi pi-send' },
    { label: 'Recojo', value: 'RECOJO', icon: 'pi pi-shopping-bag' },
    { label: 'Delivery', value: 'DELIVERY', icon: 'pi pi-car' }
  ];
  tipoVenta: 'ENVIO' | 'RECOJO' | 'DELIVERY' | 'PRESENCIAL' = 'PRESENCIAL';
  departamento: string = '';

  tipoPagoOptions = [
    { label: 'Efectivo', value: 'EFECTIVO', icon: 'pi pi-money-bill' },
    { label: 'Tarjeta', value: 'TARJETA', icon: 'pi pi-credit-card' },
    { label: 'Yape', value: 'YAPE', icon: 'pi pi-mobile' },
    { label: 'Plin', value: 'PLIN', icon: 'pi pi-mobile' }
  ];
  tipoPago: string = 'EFECTIVO';
  
  montoRecibido: number = 0;
  bancoSeleccionado: string = '';
  numeroOperacion: string = '';
  bancosDisponibles: string[] = [];

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
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.cargarSedes();
    
    if (this.sedesDisponibles.length > 0) {
      this.sedeSeleccionada = this.sedesDisponibles[0].value;
    }
    
    this.cargarProductos();
    this.cargarFamilias();
    this.bancosDisponibles = this.posService.getBancosDisponibles();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  cargarSedes(): void {
    const sedes = this.productosService.getSedes();
    this.sedesDisponibles = sedes.map(sede => ({
      label: this.formatearNombreSede(sede),
      value: sede
    }));
  }

  formatearNombreSede(sede: string): string {
  return sede
    .split(' ')
    .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase())
    .join(' ');
}

/**
 * ✅ NUEVO: Cuando cambia la sede
 */
onSedeChange(): void {
  if (!this.sedeSeleccionada) return;
  
  // Recargar productos de la nueva sede
  this.cargarProductos();
  this.cargarFamilias();
  
  // Limpiar selecciones
  this.familiaSeleccionada = null;
  this.productoSeleccionadoBusqueda = '';
  this.productoTemp = null;
  
  this.messageService.add({
    severity: 'info',
    summary: 'Sede cambiada',
    detail: `Productos de ${this.formatearNombreSede(this.sedeSeleccionada)}`,
    life: 2000
  });
}

  // ============================================
  // MÉTODOS DE CLIENTE
  // ============================================
  
  /**
   * Autocomplete de clientes - Busca por documento, nombres o razón social
   */
  buscarClienteAutoComplete(event: any): void {
    const query = event.query.toLowerCase();
    const todosClientes = this.clientesService.getClientes();
    
    this.clientesSugeridos = todosClientes.filter(cliente => {
      const matchDoc = cliente.num_doc.toLowerCase().includes(query);
      const matchApellidos = cliente.apellidos?.toLowerCase().includes(query);
      const matchNombres = cliente.nombres?.toLowerCase().includes(query);
      const matchRazonSocial = cliente.razon_social?.toLowerCase().includes(query);
      
      return matchDoc || matchApellidos || matchNombres || matchRazonSocial;
    }).slice(0, 10);
  }


  /**
   * Cuando se selecciona un cliente del autocomplete
   */
  onSelectCliente(event: any): void {
  const cliente: Cliente = event.value;
  
  // ✅ IMPORTANTE: Asignar el documento al input visible
  this.numeroDocumento = cliente.num_doc;
  
  // ✅ Limpiar el modelo del autocomplete inmediatamente
  setTimeout(() => {
    this.clienteAutoComplete = null;
  }, 0);
  
  // Guardar el cliente completo
  this.clienteEncontrado = cliente;
  this.busquedaRealizada = true;
  this.mostrarFormulario = false;
  
  const nombreCliente = this.tipoComprobante === '03' 
    ? `${cliente.apellidos || ''} ${cliente.nombres || ''}`.trim()
    : (cliente.razon_social || 'Sin nombre');
  
  this.messageService.add({
    severity: 'success',
    summary: 'Cliente seleccionado',
    detail: nombreCliente
  });
}
onClearCliente(): void {
  this.clienteAutoComplete = null;
  this.numeroDocumento = '';
  this.limpiarCliente();
}


  /**
   * Buscar cliente manualmente por documento
   */
  buscarCliente(): void {
    if (!this.numeroDocumento.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Documento requerido',
        detail: 'Ingrese un número de documento'
      });
      return;
    }

    const longitudRequerida = this.tipoComprobante === '03' ? 8 : 11;
    if (this.numeroDocumento.length !== longitudRequerida) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Documento inválido',
        detail: `El ${this.tipoComprobante === '03' ? 'DNI' : 'RUC'} debe tener ${longitudRequerida} dígitos`
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
        detail: 'Complete los datos para registrar'
      });
    } else {
      this.mostrarFormulario = false;
      
      const nombreCliente = this.tipoComprobante === '03' 
        ? `${this.clienteEncontrado.apellidos || ''} ${this.clienteEncontrado.nombres || ''}`.trim()
        : (this.clienteEncontrado.razon_social || 'Sin nombre');
      
      this.messageService.add({
        severity: 'success',
        summary: 'Cliente encontrado',
        detail: nombreCliente
      });
    }
  }

  /**
   * Registrar nuevo cliente
   */
  registrarNuevoCliente(): void {
    if (this.tipoComprobante === '03') {
      if (!this.nuevoCliente.apellidos.trim()) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Apellidos requeridos',
          detail: 'Ingrese los apellidos del cliente'
        });
        return;
      }
      if (!this.nuevoCliente.nombres.trim()) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Nombres requeridos',
          detail: 'Ingrese los nombres del cliente'
        });
        return;
      }
    }
    
    if (this.tipoComprobante === '01' && !this.nuevoCliente.razon_social.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Razón social requerida',
        detail: 'Ingrese la razón social'
      });
      return;
    }

    this.clienteEncontrado = this.clientesService.crearCliente({
      ...this.nuevoCliente,
      estado: true
    });
    
    this.mostrarFormulario = false;
    
    const nombreCliente = this.tipoComprobante === '03' 
      ? `${this.nuevoCliente.apellidos} ${this.nuevoCliente.nombres}`
      : this.nuevoCliente.razon_social;
    
    this.messageService.add({
      severity: 'success',
      summary: 'Cliente registrado',
      detail: nombreCliente
    });
  }

  /**
   * Limpiar formulario de cliente
   */
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
      telefono: ''
    };
  }

  // ============================================
  // MÉTODOS DE PRODUCTOS
  // ============================================

  /**
   * Cargar productos de la sede
   */
  cargarProductos(): void {
    this.productosDisponibles = this.productosService.getProductos(this.sedeSeleccionada, 'Activo');
    this.aplicarFiltros();
  }

  /**
   * Cargar familias disponibles
   */
  cargarFamilias(): void {
    const familiasUnicas = [...new Set(this.productosDisponibles.map(p => p.familia))];
    
    this.familiasDisponibles = [
      { label: 'Todas las familias', value: null },
      ...familiasUnicas.map(f => ({ label: f, value: f }))
    ];
  }

  /**
   * Autocomplete de productos - Busca por nombre o código
   */
  buscarProductos(event: any): void {
    const query = event.query.toLowerCase();
    
    let productosBase = this.familiaSeleccionada 
      ? this.productosDisponibles.filter(p => p.familia === this.familiaSeleccionada)
      : this.productosDisponibles;
    
    this.productosSugeridos = productosBase.filter(producto => {
      const coincideNombre = producto.nombre.toLowerCase().includes(query);
      const coincideCodigo = producto.codigo.toLowerCase().includes(query);
      
      return coincideNombre || coincideCodigo;
    }).slice(0, 10);
  }

  /**
   * Cuando selecciona un producto del autocomplete
   */
  onProductoSeleccionado(event: any): void {
    const producto: Producto = event.value;
    
    // ✅ Seleccionar el producto en el panel
    this.seleccionarProducto(producto);
    
    // ✅ Limpiar inmediatamente el input
    this.productoSeleccionadoBusqueda = '';
    
    this.messageService.add({
      severity: 'success',
      summary: 'Producto seleccionado',
      detail: producto.nombre,
      life: 2000
    });
  }

  /**
   * Limpiar búsqueda de autocomplete
   */
  onLimpiarBusqueda(): void {
    this.productoSeleccionadoBusqueda = '';
    this.productosSugeridos = [];
  }

  /**
   * Cambio de familia
   */
  onFamiliaChange(): void {
    this.aplicarFiltros();
    // ✅ Limpiar como string vacío, NO como null
    this.productoSeleccionadoBusqueda = '';
    this.productosSugeridos = [];
  }

  /**
   * Aplicar filtros (familia)
   */
  aplicarFiltros(): void {
    if (this.familiaSeleccionada) {
      this.productosFiltrados = this.productosDisponibles.filter(
        p => p.familia === this.familiaSeleccionada
      );
    } else {
      this.productosFiltrados = [...this.productosDisponibles];
    }
  }

  /**
   * Seleccionar producto para agregar
   */
  seleccionarProducto(producto: Producto): void {
    this.productoTemp = producto;
    this.cantidadTemp = 1;
    this.tipoPrecioTemp = 'UNIDAD';
  }

  /**
   * Agregar producto al carrito
   */
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
      tipo_afe_igv: '10'
    };

    this.productosSeleccionados.push(detalle);
    this.productoTemp = null;
    
    this.messageService.add({
      severity: 'success',
      summary: 'Producto agregado',
      detail: 'Producto añadido al carrito'
    });
  }

  /**
   * Obtener precio según tipo seleccionado
   */
  getPrecioSegunTipo(producto: Producto): number {
    switch (this.tipoPrecioTemp) {
      case 'CAJA': return producto.precioCaja;
      case 'MAYORISTA': return producto.precioMayorista;
      default: return producto.precioUnidad;
    }
  }

  /**
   * Eliminar producto del carrito
   */
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
          detail: 'Producto removido del carrito'
        });
      }
    });
  }

  // ============================================
  // CÁLCULOS
  // ============================================

  calcularSubtotal(): number {
    return this.productosSeleccionados.reduce((sum, p) => sum + (p.valor_unit * p.cantidad), 0);
  }

  calcularIGV(): number {
    return this.productosSeleccionados.reduce((sum, p) => sum + p.igv, 0);
  }

  calcularTotal(): number {
    return this.calcularSubtotal() + this.calcularIGV();
  }

  calcularVuelto(): number {
    return this.posService.calcularVuelto(this.montoRecibido, this.calcularTotal());
  }

  // ============================================
  // NAVEGACIÓN Y VALIDACIÓN
  // ============================================

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
        if (!this.clienteEncontrado) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Cliente requerido',
            detail: 'Debe buscar o registrar un cliente'
          });
          return false;
        }
        return true;
      
      case 1:
        if (this.productosSeleccionados.length === 0) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Productos requeridos',
            detail: 'Agregue al menos un producto'
          });
          return false;
        }
        return true;
      
      case 2:
        if (this.tipoVenta === 'ENVIO' && !this.departamento.trim()) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Departamento requerido',
            detail: 'Ingrese el departamento de envío'
          });
          return false;
        }
        if (this.tipoPago === 'EFECTIVO' && this.montoRecibido < this.calcularTotal()) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Monto insuficiente',
            detail: 'El monto debe ser mayor o igual al total'
          });
          return false;
        }
        if (this.tipoPago === 'TARJETA' && !this.bancoSeleccionado) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Banco requerido',
            detail: 'Seleccione un banco'
          });
          return false;
        }
        return true;
      
      default: 
        return true;
    }
  }

  // ============================================
  // GENERAR VENTA
  // ============================================

  generarVenta(): void {
    this.confirmationService.confirm({
      message: '¿Confirmar la generación de esta venta?',
      header: 'Confirmar Venta',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, generar',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.procesarVenta();
      }
    });
  }

  procesarVenta(): void {
    this.loading = true;

    const nombreCliente = this.tipoComprobante === '03'
      ? `${this.clienteEncontrado!.apellidos} ${this.clienteEncontrado!.nombres}`
      : this.clienteEncontrado!.razon_social || '';

    const nuevoComprobante: Omit<ComprobanteVenta, 'id_comprobante' | 'hash_cpe' | 'xml_cpe' | 'cdr_cpe' | 'numero'> = {
      id_cliente: this.clienteEncontrado!.id_cliente,
      tipo_comprobante: this.tipoComprobante,
      serie: this.ventasService.generarSerie(this.tipoComprobante),
      fec_emision: new Date(),
      fec_venc: this.tipoComprobante === '01' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null,
      moneda: 'PEN',
      tipo_op: '0101',
      subtotal: this.calcularSubtotal(),
      igv: this.calcularIGV(),
      isc: 0,
      total: this.calcularTotal(),
      estado: true,
      responsable: 'ADMIN',
      detalles: this.productosSeleccionados,
      cliente_nombre: nombreCliente,
      cliente_doc: this.clienteEncontrado!.num_doc
    };

    setTimeout(() => {
      this.comprobanteGenerado = this.ventasService.crearComprobante(nuevoComprobante);
      
      this.posService.registrarPago({
        id_comprobante: this.comprobanteGenerado.id_comprobante,
        fec_pago: new Date(),
        med_pago: this.tipoPago as 'EFECTIVO' | 'TARJETA' | 'YAPE' | 'PLIN' | 'TRANSFERENCIA',
        monto: this.calcularTotal(),
        banco: this.bancoSeleccionado || undefined,
        num_operacion: this.numeroOperacion || undefined
      });

      this.loading = false;
      this.messageService.add({
        severity: 'success',
        summary: 'Venta generada',
        detail: `${this.comprobanteGenerado.serie}-${this.comprobanteGenerado.numero.toString().padStart(8, '0')} creado`
      });
    }, 1500);
  }

  imprimirComprobante(): void {
    if (this.comprobanteGenerado) {
      this.comprobantesService.imprimirComprobante(
        this.comprobanteGenerado.id_comprobante,
        this.comprobanteGenerado.tipo_comprobante as '01' | '03'
      );
    }
  }

  nuevaVenta(): void {
    window.location.reload();
  }

  verListado(): void {
    this.router.navigate(['/ventas/generar-venta/listar']);
  }
}
