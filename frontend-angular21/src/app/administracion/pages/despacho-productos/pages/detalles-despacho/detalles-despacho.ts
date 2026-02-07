import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Location } from '@angular/common';
import { Subscription } from 'rxjs';

import { Card } from 'primeng/card';
import { Button } from 'primeng/button';
import { Divider } from 'primeng/divider';
import { Tag } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { Skeleton } from 'primeng/skeleton';
import { Tooltip } from 'primeng/tooltip';

import { VentasService, ComprobanteVenta } from '../../../../../core/services/ventas.service';
import { PosService, Pago } from '../../../../../core/services/pos.service';
import { ClientesService, Cliente } from '../../../../../core/services/clientes.service';
import { SedeService, Sede } from '../../../../../core/services/sede.service';
import { PromocionesService, Promocion } from '../../../../../core/services/promociones.service';
import { ProductosService, Producto } from '../../../../../core/services/productos.service';
import { EmpleadosService, Empleado } from '../../../../../core/services/empleados.service';

interface DetalleProductoRow {
  codigo: string;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  total: number;
  sede: string;
  stock: number | null;
  familia: string;
}

interface DespachoInfo {
  salida: string;
  ubicacion: string;
  agencia: string;
  hora: string;
}

@Component({
  selector: 'app-detalles-despacho',
  standalone: true,
  imports: [CommonModule, Card, Button, Tag, TableModule, Skeleton, Tooltip],
  templateUrl: './detalles-despacho.html',
  styleUrl: './detalles-despacho.css',
})
export class DetallesDespacho implements OnInit, OnDestroy {
  comprobante: ComprobanteVenta | null = null;
  cliente: Cliente | null = null;
  pagos: Pago[] = [];
  sedes: Sede[] = [];
  promocion: Promocion | null = null;
  detalleProductos: DetalleProductoRow[] = [];

  despachador = 'Sin asignar';
  asesor = 'Sin asignar';
  despachoInfo: DespachoInfo = {
    salida: 'PROVINCIA',
    ubicacion: 'LIMA',
    agencia: 'SHALOM',
    hora: '09:45',
  };

  loading: boolean = true;
  returnUrl: string = '/admin/despacho-productos';

  tituloKicker = 'ADMINISTRACIÓN - DESPACHO - DETALLE';
  subtituloKicker = 'DETALLE DE DESPACHO';
  iconoCabecera = 'pi pi-truck';

  private routeSubscription: Subscription | null = null;
  private ventaId: string | null = null;
  private empleados: Empleado[] = [];

  private readonly baseDespachos: DespachoInfo[] = [
    { salida: 'PROVINCIA', ubicacion: 'TRUJILLO', agencia: 'SHALOM', hora: '09:45' },
    { salida: 'PROVINCIA', ubicacion: 'CUSCO', agencia: 'MARVISUR', hora: '09:46' },
    { salida: 'PROVINCIA', ubicacion: 'AREQUIPA', agencia: 'MARVISUR', hora: '09:46' },
    { salida: 'PROVINCIA', ubicacion: 'FERRENAFE', agencia: 'SHALOM', hora: '11:43' },
    { salida: 'PROVINCIA', ubicacion: 'RICA', agencia: 'SHALOM', hora: '10:17' },
    { salida: 'PROVINCIA', ubicacion: 'CHINCHA', agencia: 'SHALOM', hora: '11:47' },
    { salida: 'PROVINCIA', ubicacion: 'LIMA', agencia: 'SHALOM', hora: '14:46' },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private ventasService: VentasService,
    private posService: PosService,
    private clientesService: ClientesService,
    private sedeService: SedeService,
    private promocionesService: PromocionesService,
    private productosService: ProductosService,
    private empleadosService: EmpleadosService,
  ) {}

  ngOnInit(): void {
    this.cargarSedes();
    this.cargarEmpleados();

    this.routeSubscription = this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.ventaId = id;
        this.cargarDetalle(id);
      } else {
        this.volver();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }

  cargarSedes(): void {
    this.sedeService.getSedes().subscribe({
      next: (sedes: Sede[]) => {
        this.sedes = sedes;
      },
      error: (err: any) => {
        console.error('Error al cargar sedes:', err);
      },
    });
  }

  private cargarEmpleados(): void {
    this.empleadosService.getEmpleados().subscribe({
      next: (empleados) => {
        this.empleados = empleados;
        this.despachador = this.obtenerNombreEmpleado('ALMACENERO');
        this.asesor = this.obtenerNombreEmpleado('VENTAS');
      },
      error: () => {
        this.empleados = [];
        this.despachador = 'Sin asignar';
        this.asesor = 'Sin asignar';
      },
    });
  }

  cargarDetalle(id: string): void {
    this.loading = true;

    this.comprobante = null;
    this.cliente = null;
    this.pagos = [];
    this.promocion = null;
    this.detalleProductos = [];

    const resultado = this.ventasService.getComprobantePorId(id);
    this.comprobante = resultado || null;

    if (!this.comprobante) {
      console.error('Comprobante no encontrado');
      this.loading = false;
      this.volver();
      return;
    }

    const ventas = this.ventasService.getComprobantes();
    const index = ventas.findIndex((venta) => venta.id_comprobante === this.comprobante?.id_comprobante);
    const mockIndex = index >= 0 ? index : 0;
    this.despachoInfo = this.baseDespachos[mockIndex % this.baseDespachos.length];

    this.cliente = this.clientesService.getClientePorId(this.comprobante.id_cliente) || null;
    this.pagos = this.posService.getPagosPorComprobante(this.comprobante.id_comprobante);

    if (this.comprobante.id_promocion) {
      this.promocion = this.promocionesService.getPromocionPorId(this.comprobante.id_promocion);
    } else if (this.comprobante.codigo_promocion) {
      this.promocion = this.promocionesService.buscarPorCodigo(this.comprobante.codigo_promocion);
    }

    this.detalleProductos = this.comprobante.detalles.map((detalle) => {
      const productos = this.productosService.getProductosPorCodigo(detalle.cod_prod);
      const producto = productos[0] || null;
      const precioUnitario = detalle.pre_uni ?? detalle.valor_unit ?? 0;
      return {
        codigo: detalle.cod_prod,
        descripcion: detalle.descripcion,
        cantidad: detalle.cantidad,
        precioUnitario,
        total: this.calcularTotalItem(detalle.cantidad, precioUnitario),
        sede: producto?.sede || 'N/A',
        stock: producto?.stock ?? null,
        familia: producto?.familia || 'N/A',
      };
    });

    this.loading = false;
  }

  volver(): void {
    this.location.back();
  }

  irListadoDespacho(): void {
    this.router.navigate(['/admin/despacho-productos']);
  }

  getSede(comprobante: ComprobanteVenta): string {
    const sede = this.sedes.find((s) => s.id_sede === comprobante.id_sede);
    return sede ? sede.nombre : 'N/A';
  }

  getTipoComprobanteLabel(): string {
    return this.comprobante?.tipo_comprobante === '03' ? 'BOLETA' : 'FACTURA';
  }

  getTipoComprobanteIcon(): string {
    return this.comprobante?.tipo_comprobante === '03' ? 'pi pi-file' : 'pi pi-file-edit';
  }

  getEstadoSeverity(): 'success' | 'danger' {
    return this.comprobante?.estado ? 'success' : 'danger';
  }

  getEstadoLabel(): string {
    return this.comprobante?.estado ? 'DESPACHADO' : 'SIN DESPACHAR';
  }

  getTipoDocumento(): string {
    return this.cliente?.tipo_doc || (this.comprobante?.tipo_comprobante === '03' ? 'DNI' : 'RUC');
  }

  getIconoMedioPago(medio: string): string {
    const iconos: { [key: string]: string } = {
      EFECTIVO: 'pi pi-money-bill',
      TARJETA: 'pi pi-credit-card',
      YAPE: 'pi pi-mobile',
      PLIN: 'pi pi-mobile',
      TRANSFERENCIA: 'pi pi-arrow-right-arrow-left',
    };
    return iconos[medio] || 'pi pi-wallet';
  }

  formatearSerieNumero(serie: string, numero: number): string {
    return `${serie}-${numero.toString().padStart(8, '0')}`;
  }

  calcularTotalItem(cantidad: number, precio: number): number {
    return cantidad * precio;
  }

  tienePromocion(): boolean {
    return !!(
      this.comprobante?.codigo_promocion &&
      this.comprobante?.descuento_promocion &&
      this.comprobante.descuento_promocion > 0
    );
  }

  getCodigoPromocion(): string {
    return this.promocion?.codigo || this.comprobante?.codigo_promocion || 'N/A';
  }

  getDescripcionPromocion(): string {
    return this.promocion?.descripcion || this.comprobante?.descripcion_promocion || 'Promoción aplicada';
  }

  getDescuentoPromocion(): number {
    return this.comprobante?.descuento_promocion || 0;
  }

  private obtenerNombreEmpleado(cargo: Empleado['cargo']): string {
    const empleado = this.empleados.find((item) => item.cargo === cargo && item.estado);
    if (!empleado) return 'Sin asignar';
    return `${empleado.nombres} ${empleado.apellidos}`.trim();
  }
}
