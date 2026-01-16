// src/app/ventas/pages/generar-venta/crear-venta/crear-venta.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

// PrimeNG
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { StepperModule } from 'primeng/stepper';
import { SelectButtonModule } from 'primeng/selectbutton';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { InputNumberModule } from 'primeng/inputnumber';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

// Services
import { VentasService, ComprobanteVenta, DetalleComprobante } from '../../../core/services/ventas.service';
import { ClientesService, Cliente } from '../../../core/services/clientes.service';
import { ComprobantesService } from '../../../core/services/comprobantes.service';
import { PosService } from '../../../core/services/pos.service';
import { ProductosService, Producto } from '../../../core/services/productos.service'; // ✅ CAMBIADO
import { MessageService, ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-crear-venta',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    StepperModule,
    SelectButtonModule,
    InputTextModule,
    TableModule,
    InputNumberModule,
    DividerModule,
    TagModule,
    MessageModule,
    ToastModule,
    ConfirmDialogModule,
    IconFieldModule,
    InputIconModule,
    ProgressSpinnerModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './crear-venta.html',
  styleUrls: ['./crear-venta.css']
})
export class CrearVenta implements OnInit, OnDestroy {
  
  private subscriptions = new Subscription();

  activeStep = 0;
  steps = ['Comprobante', 'Cliente', 'Productos', 'Tipo de Venta', 'Tipo de Pago', 'Confirmación'];
  
  tipoComprobanteOptions = [
    { label: 'Boleta', value: '03', icon: 'pi pi-file' },
    { label: 'Factura', value: '01', icon: 'pi pi-file-edit' }
  ];
  tipoComprobante: '01' | '03' = '03';

  numeroDocumento: string = '';
  clienteEncontrado: Cliente | null = null;
  busquedaRealizada = false;
  mostrarFormulario = false;
  
  nuevoCliente = {
    tipo_doc: 'DNI' as 'DNI' | 'RUC',
    num_doc: '',
    nombres: '',
    razon_social: '',
    direccion: '',
    email: '',
    telefono: ''
  };

  productosDisponibles: Producto[] = [];
  productosFiltrados: Producto[] = [];
  productosSeleccionados: DetalleComprobante[] = [];
  productoTemp: Producto | null = null;
  cantidadTemp: number = 1;
  tipoPrecioTemp: 'UNIDAD' | 'CAJA' | 'MAYORISTA' = 'UNIDAD';
  busquedaProducto: string = '';

  sedesDisponibles: string[] = [];
  sedeSeleccionada: string = '';

  opcionesTipoPrecio = [
    { label: 'Unidad', value: 'UNIDAD' },
    { label: 'Caja', value: 'CAJA' },
    { label: 'Mayorista', value: 'MAYORISTA' }
  ];

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
  tipoPago: 'EFECTIVO' | 'TARJETA' | 'YAPE' | 'PLIN' | 'TRANSFERENCIA' = 'EFECTIVO';
  
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
    this.sedesDisponibles = this.productosService.getSedes();
    this.sedeSeleccionada = this.sedesDisponibles[0] || '';
    this.cargarProductosPorSede();
    this.bancosDisponibles = this.posService.getBancosDisponibles();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
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
      case 0: return true;
      
      case 1:
        if (!this.clienteEncontrado) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Cliente requerido',
            detail: 'Debe buscar o registrar un cliente'
          });
          return false;
        }
        return true;
      
      case 2:
        if (this.productosSeleccionados.length === 0) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Productos requeridos',
            detail: 'Agregue al menos un producto'
          });
          return false;
        }
        return true;
      
      case 3:
        if (this.tipoVenta === 'ENVIO' && !this.departamento.trim()) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Departamento requerido',
            detail: 'Ingrese el departamento de envío'
          });
          return false;
        }
        return true;
      
      case 4:
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
      
      default: return true;
    }
  }

  buscarCliente(): void {
    if (!this.numeroDocumento.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Documento requerido',
        detail: 'Ingrese un número de documento'
      });
      return;
    }

    this.busquedaRealizada = true;
    // ✅ CAMBIADO: Manejo de undefined
    const cliente = this.clientesService.buscarPorDocumento(this.numeroDocumento);
    this.clienteEncontrado = cliente || null;
    
    if (!this.clienteEncontrado) {
      this.nuevoCliente.num_doc = this.numeroDocumento;
      this.nuevoCliente.tipo_doc = this.tipoComprobante === '03' ? 'DNI' : 'RUC';
      this.mostrarFormulario = true;
      this.messageService.add({
        severity: 'info',
        summary: 'Cliente no encontrado',
        detail: 'Complete los datos para registrar'
      });
    } else {
      this.mostrarFormulario = false;
      this.messageService.add({
        severity: 'success',
        summary: 'Cliente encontrado',
        detail: `${this.clienteEncontrado.nombres || this.clienteEncontrado.razon_social}`
      });
    }
  }

  registrarNuevoCliente(): void {
    if (this.tipoComprobante === '03' && !this.nuevoCliente.nombres.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Nombres requeridos',
        detail: 'Ingrese los nombres del cliente'
      });
      return;
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
    this.messageService.add({
      severity: 'success',
      summary: 'Cliente registrado',
      detail: 'Cliente creado exitosamente'
    });
  }

  limpiarCliente(): void {
    this.numeroDocumento = '';
    this.clienteEncontrado = null;
    this.busquedaRealizada = false;
    this.mostrarFormulario = false;
  }

  cargarProductosPorSede(): void {
    this.productosDisponibles = this.productosService.getProductos(this.sedeSeleccionada, 'Activo');
    this.productosFiltrados = [...this.productosDisponibles];
  }

  onSedeChange(): void {
    this.cargarProductosPorSede();
    this.busquedaProducto = '';
  }

  filtrarProductos(): void {
    if (!this.busquedaProducto.trim()) {
      this.productosFiltrados = [...this.productosDisponibles];
    } else {
      const termino = this.busquedaProducto.toLowerCase();
      this.productosFiltrados = this.productosDisponibles.filter(p =>
        p.nombre.toLowerCase().includes(termino) ||
        p.codigo.toLowerCase().includes(termino) ||
        p.familia.toLowerCase().includes(termino)
      );
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

  getPrecioSegunTipo(producto: Producto): number {
    switch (this.tipoPrecioTemp) {
      case 'CAJA': return producto.precioCaja;
      case 'MAYORISTA': return producto.precioMayorista;
      default: return producto.precioUnidad;
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
          detail: 'Producto removido del carrito'
        });
      }
    });
  }

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
      cliente_nombre: this.clienteEncontrado!.nombres || this.clienteEncontrado!.razon_social || '',
      cliente_doc: this.clienteEncontrado!.num_doc
    };

    setTimeout(() => {
      this.comprobanteGenerado = this.ventasService.crearComprobante(nuevoComprobante);
      
      this.posService.registrarPago({
        id_comprobante: this.comprobanteGenerado.id_comprobante,
        fec_pago: new Date(),
        med_pago: this.tipoPago,
        monto: this.calcularTotal(),
        banco: this.bancoSeleccionado || undefined,
        num_operacion: this.numeroOperacion || undefined
      });

      this.loading = false;
      this.messageService.add({
        severity: 'success',
        summary: 'Venta generada',
        detail: `${this.comprobanteGenerado.serie}-${this.comprobanteGenerado.numero} creado`
      });

      this.activeStep++;
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
