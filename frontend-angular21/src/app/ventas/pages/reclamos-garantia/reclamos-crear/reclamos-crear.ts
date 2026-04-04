import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

import { Card } from 'primeng/card';
import { Button } from 'primeng/button';
import { Textarea } from 'primeng/textarea';
import { Select } from 'primeng/select';
import { SelectButton } from 'primeng/selectbutton';
import { AutoCompleteSelectEvent } from 'primeng/autocomplete';
import { Toast } from 'primeng/toast';
import { Tag } from 'primeng/tag';
import { Divider } from 'primeng/divider';
import { Tooltip } from 'primeng/tooltip';
import { InputNumber } from 'primeng/inputnumber';
import { DatePicker } from 'primeng/datepicker';
import {
  VentasService,
  ComprobanteVenta,
  DetalleComprobante,
} from '../../../../core/services/ventas.service';
import { EmpleadosService, Empleado } from '../../../../core/services/empleados.service';
import { Cliente } from '../../../../core/services/clientes.service';
import { MessageService } from 'primeng/api';
import {
  ClaimService,
  ClaimResponseDto,
  RegisterClaimPayload,
} from '../../../../core/services/claim.service';
import { VentaService } from '../../../services/venta.service';
import { ClienteService } from '../../../services/cliente.service';
import { AuthService } from '../../../../auth/services/auth.service';
import { WarrantyResponseDto, WarrantyService } from '../../../../administracion/services/warranty.service';

interface ComprobanteConProductos extends ComprobanteVenta {
  productosSeleccionados?: DetalleComprobante[];
}

@Component({
  selector: 'app-reclamos-crear',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    Card,
    Button,
    Textarea,
    Select,
    SelectButton,
    Toast,
    Tag,
    Divider,
    Tooltip,
    InputNumber,
    DatePicker,
  ],
  providers: [MessageService],
  templateUrl: './reclamos-crear.html',
  styleUrl: './reclamos-crear.css',
})
export class ReclamosCrear implements OnInit {
  private readonly router = inject(Router);
  private readonly claimService = inject(ClaimService);
  private readonly ventasService = inject(VentaService);
  private readonly empleadosService = inject(EmpleadosService);
  private readonly clientesService = inject(ClienteService);
  private readonly messageService = inject(MessageService);
  private readonly authService = inject(AuthService);
  private readonly warrantyService = inject(WarrantyService);

  readonly resumenClienteNombre = computed(() => this.getNombreCliente(this.clienteEncontrado()));

  readonly resumenClienteDoc = computed(() => {
    const c = this.clienteEncontrado() as any;
    return c?.documentValue || c?.num_doc || 'S/N';
  });

  readonly resumenProductoNombre = computed(() => {
    const p = this.productoSeleccionado() as any;
    return p?.descripcion || p?.productName || p?.nombre || 'Ningún producto seleccionado';
  });

  readonly resumenProductoPrecio = computed(() => {
    const p = this.productoSeleccionado() as any;
    return p?.precio || p?.pre_uni || p?.unitPrice || p?.precio_unit || 0;
  });

  readonly tituloKicker = signal('VENTAS - RECLAMOS Y GARANTÍAS');
  readonly subtituloKicker = signal('REGISTRAR NUEVO RECLAMO');
  readonly iconoCabecera = signal('pi pi-file-plus');

  readonly activeStep = signal(0);
  readonly steps = signal([
    'Buscar Cliente',
    'Seleccionar Comprobante',
    'Seleccionar Producto',
    'Datos del Reclamo',
    'Confirmación',
  ]);

  readonly empleadoActual = signal<Empleado | null>(null);

  readonly tipoDocumento = signal<'DNI' | 'RUC'>('DNI');
  readonly tipoDocumentoOptions = signal([
    { label: 'DNI', value: 'DNI', icon: 'pi pi-id-card' },
    { label: 'RUC', value: 'RUC', icon: 'pi pi-briefcase' },
  ]);

  readonly busquedaComprobante = signal<any>(null);
  readonly sugerenciasComprobantesObj = signal<Cliente[]>([]);
  readonly clienteEncontrado = signal<Cliente | null>(null);

  readonly comprobantesCliente = signal<ComprobanteVenta[]>([]);
  readonly comprobanteSeleccionado = signal<ComprobanteConProductos | null>(null);
  readonly garantiaVigente = signal(false);
  readonly diasRestantes = signal(0);

  // ── Rango de fechas ───────────────────────────────────────────────
  readonly fechaDesde = signal<Date | null>(
    new Date(new Date().setDate(new Date().getDate() - 30))
  );
  readonly fechaHasta = signal<Date | null>(new Date());

  // Mapa: id_comprobante -> garantía activa (o null si no tiene)
  readonly garantiasComprobantes = signal<Map<string, WarrantyResponseDto | null>>(new Map());
  readonly cargandoGarantias = signal(false);

  readonly productoSeleccionado = signal<DetalleComprobante | null>(null);
  readonly unidadesAfectadas = signal(1);
  readonly identificacionUnidad = signal('');

  readonly motivosOptions = signal([
    { label: 'Producto defectuoso', value: 'Producto defectuoso' },
    { label: 'No funciona correctamente', value: 'No funciona correctamente' },
    { label: 'Producto dañado', value: 'Producto dañado' },
    { label: 'No cumple especificaciones', value: 'No cumple especificaciones' },
    { label: 'Piezas faltantes', value: 'Piezas faltantes' },
    { label: 'Otro motivo', value: 'Otro motivo' },
  ]);
  readonly motivoSeleccionado = signal('');
  readonly descripcionProblema = signal('');

  readonly guardando = signal(false);
  readonly reclamoGenerado = signal<ClaimResponseDto | null>(null);

  readonly Math = Math;

  constructor() {}

  ngOnInit(): void {
    this.cargarEmpleadoActual();
  }

  cargarEmpleadoActual(): void {
    const empleado = this.empleadosService.getEmpleadoActual();
    this.empleadoActual.set(empleado);

    if (!empleado) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Sin autenticación',
        detail: 'No hay empleado logueado',
        life: 3000,
      });
    }
  }

  onTipoDocumentoChange(): void {
    this.busquedaComprobante.set(null);
    this.clienteEncontrado.set(null);
    this.comprobantesCliente.set([]);
    this.comprobanteSeleccionado.set(null);
    this.productoSeleccionado.set(null);
    this.sugerenciasComprobantesObj.set([]);
    this.garantiasComprobantes.set(new Map());
    this.resetearUnidades();

    this.messageService.add({
      severity: 'info',
      summary: 'Tipo de documento cambiado',
      detail: `Busque por ${this.tipoDocumento()}`,
      life: 2000,
    });
  }

  // ── Rango de fechas ───────────────────────────────────────────────
  onFechaDesdeChange(fecha: Date | null): void {
    this.fechaDesde.set(fecha);
    if (this.clienteEncontrado()) {
      this.recargarComprobantesConFecha();
    }
  }

  onFechaHastaChange(fecha: Date | null): void {
    this.fechaHasta.set(fecha);
    if (this.clienteEncontrado()) {
      this.recargarComprobantesConFecha();
    }
  }

  private async recargarComprobantesConFecha(): Promise<void> {
    // Resetea selecciones dependientes antes de recargar
    this.comprobanteSeleccionado.set(null);
    this.productoSeleccionado.set(null);
    this.garantiasComprobantes.set(new Map());
    this.garantiaVigente.set(false);
    this.diasRestantes.set(0);
    this.resetearUnidades();
    await this.cargarComprobantesCliente();
  }

  async buscarSugerenciasComprobantes(event: any): Promise<void> {
    let query = event.query.toLowerCase().trim();

    if (/^\d+$/.test(query)) {
      query = query.replace(/\D/g, '');
    }

    if (!query || query.length < 3) {
      this.sugerenciasComprobantesObj.set([]);
      return;
    }

    try {
      const todosClientes = await firstValueFrom(this.clientesService.getClientes());
      const docType = this.tipoDocumento();

      const filtrados = todosClientes
        .filter((cliente: Cliente) => {
          const longitudDoc = cliente.num_doc?.length || 0;
          const esTipoDocCorrecto =
            (docType === 'DNI' && longitudDoc === 8) || (docType === 'RUC' && longitudDoc === 11);

          if (!esTipoDocCorrecto) return false;

          const matchDoc = cliente.num_doc?.toLowerCase().includes(query);
          const matchNombre =
            docType === 'DNI'
              ? `${cliente.nombres} ${cliente.apellidos}`.toLowerCase().includes(query)
              : cliente.razon_social?.toLowerCase().includes(query);

          return matchDoc || matchNombre;
        })
        .slice(0, 10);

      this.sugerenciasComprobantesObj.set(filtrados);
    } catch (error) {
      console.error('Error al obtener sugerencias de clientes:', error);
      this.sugerenciasComprobantesObj.set([]);
    }
  }

  seleccionarComprobante(event: AutoCompleteSelectEvent): void {
    const cliente = event.value as Cliente;

    if (!cliente) return;

    setTimeout(() => {
      this.busquedaComprobante.set(null);
    }, 0);

    this.clienteEncontrado.set(cliente);
    this.cargarComprobantesCliente();

    this.messageService.add({
      severity: 'success',
      summary: 'Cliente encontrado',
      detail: this.getNombreCliente(cliente),
      life: 3000,
    });
  }

  async cargarComprobantesCliente(): Promise<void> {
    const cliente = this.clienteEncontrado() as any;
    const empleado = this.empleadoActual();

    const idClienteReal = cliente?.customerId || cliente?.id_cliente || cliente?.id;
    if (!cliente || !idClienteReal || !empleado) return;

    // Usar el rango de fechas de los signals
    const desde = this.fechaDesde();
    const hasta = this.fechaHasta();
    const fechaDesdeStr = desde ? desde.toISOString().split('T')[0] : undefined;
    const fechaHastaStr = hasta ? hasta.toISOString().split('T')[0] : undefined;

    try {
      const res = await firstValueFrom(
        this.ventasService.getComprobantesPorCliente(idClienteReal)
      );

      const crudos: any[] = res.data || res.items || res.receipts || (Array.isArray(res) ? res : []);

      const comprobantesMapeados: ComprobanteVenta[] = crudos.map((c: any) => {
        const numeroCompleto = c.numeroCompleto || '';
        const partes = numeroCompleto.split('-');
        const serieReal = partes[0] || c.serie || 'S/N';
        const numeroReal = partes[1] ? parseInt(partes[1], 10) : (c.numero || 0);

        const tipoComprobanteReal =
          c.invoiceType === 'FACTURA' || c.tipo_comprobante === '01' ? '01' : '03';

        const productosCrudos =
          c.items || c.detalles || c.productos || c.productosSeleccionados || [];
        const detallesMapeados = productosCrudos.map((p: any) => ({
          ...p,
          id_producto: String(p.productId || p.id_producto || p.id_prod_ref || p.id || '0'),
          cod_prod: p.productCode || p.codigo || p.cod_prod || p.codigoProducto || 'S/N',
          descripcion:
            p.productName || p.descripcion || p.name || p.nombre || 'Producto sin nombre',
          cantidad: p.quantity || p.cantidad || 1,
          pre_uni: p.unitPrice || p.precio_unit || p.precio || p.pre_uni || p.total || 0,
          precio: p.unitPrice || p.precio_unit || p.precio || p.pre_uni || p.total || 0,
        }));

        return {
          ...c,
          id: c.idComprobante || c.id,
          id_comprobante: String(c.idComprobante || c.id_comprobante),
          id_cliente: c.idCliente || c.id_cliente,
          serie: serieReal,
          numero: numeroReal,
          tipo_comprobante: tipoComprobanteReal,
          total: c.totalAmount || c.total || 0,
          fec_emision:
            c.fechaEmision || c.fecha_emision || c.createdAt || c.fec_emision || new Date(),
          estado: c.status === 'EMITIDO' || c.estado === true || c.status === true,
          id_sede: String(c.sedeId || c.id_sede),
          detalles: detallesMapeados,
        } as ComprobanteVenta;
      });

      const ordenados = comprobantesMapeados
        .filter((c) => {
          const fec = new Date(c.fec_emision);
          const desde = this.fechaDesde();
          const hasta = this.fechaHasta();
          if (desde && fec < desde) return false;
          if (hasta) {
            const hastaFin = new Date(hasta);
            hastaFin.setHours(23, 59, 59, 999);
            if (fec > hastaFin) return false;
          }
          return true;
        })
        .sort(
        (a, b) => new Date(b.fec_emision).getTime() - new Date(a.fec_emision).getTime()
      );

      this.comprobantesCliente.set(ordenados);
      this.comprobanteSeleccionado.set(null);
      this.garantiaVigente.set(false);
      this.garantiasComprobantes.set(new Map());

      // Cargar garantías para cada comprobante en paralelo
      await this.cargarGarantiasComprobantes(ordenados);
    } catch (error) {
      console.error('Error al cargar comprobantes:', error);
      this.comprobantesCliente.set([]);
    }
  }

  private async cargarGarantiasComprobantes(comprobantes: ComprobanteVenta[]): Promise<void> {
    this.cargandoGarantias.set(true);
    const mapaGarantias = new Map<string, WarrantyResponseDto | null>();

    await Promise.all(
      comprobantes.map(async (c) => {
        try {
          const garantias = await firstValueFrom(
            this.warrantyService.getWarrantiesByReceipt(Number(c.id_comprobante))
          );
          // Acepta cualquier garantía existente (cualquier estado)
          const activa = garantias?.length > 0 ? garantias[0] : null;
          mapaGarantias.set(c.id_comprobante, activa);
        } catch {
          mapaGarantias.set(c.id_comprobante, null);
        }
      })
    );

    this.garantiasComprobantes.set(mapaGarantias);
    this.cargandoGarantias.set(false);
  }

  tieneGarantiaActiva(idComprobante: string): boolean {
    return (
      this.garantiasComprobantes().get(idComprobante) !== null &&
      this.garantiasComprobantes().get(idComprobante) !== undefined
    );
  }

  getGarantia(idComprobante: string): WarrantyResponseDto | null {
    return this.garantiasComprobantes().get(idComprobante) ?? null;
  }

  validarSoloNumeros(event: any): void {
    const input = event.target as HTMLInputElement;
    const valorLimpio = input.value.replace(/\D/g, '');
    const longitudMaxima = this.tipoDocumento() === 'DNI' ? 8 : 11;
    const valorFinal = valorLimpio.slice(0, longitudMaxima);
    this.busquedaComprobante.set(valorFinal);
    input.value = valorFinal;
  }

  async manejarBuscarComprobante(): Promise<void> {
    const busqueda = this.busquedaComprobante();
    const documentoIngresado =
      typeof busqueda === 'string' ? busqueda.trim() : busqueda?.num_doc || '';
    if (!documentoIngresado || documentoIngresado.length < 8) return;

    this.guardando.set(true);
    try {
      const cliente = await firstValueFrom(
        this.clientesService.buscarPorDocumento(documentoIngresado)
      );

      if (cliente) {
        this.clienteEncontrado.set(cliente);
        await this.cargarComprobantesCliente();
        this.messageService.add({
          severity: 'success',
          summary: 'Cliente encontrado',
          detail: this.getNombreCliente(cliente),
          life: 3000,
        });
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'No encontrado',
          detail: 'No existe un cliente con ese documento en la base de datos',
          life: 3000,
        });
      }
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error de búsqueda',
        detail: 'Hubo un problema al conectar con el servicio de clientes',
        life: 3000,
      });
    } finally {
      this.guardando.set(false);
    }
  }

  getNombreCliente(cliente: any): string {
    if (!cliente) return 'Cliente no identificado';
    return (
      cliente.displayName ||
      cliente.razon_social ||
      `${cliente.nombres || cliente.name || ''} ${cliente.apellidos || cliente.apellido || ''}`.trim() ||
      'Sin nombre'
    );
  }

  get textoBotonBuscar(): string {
    return 'Buscar';
  }

  readonly botonBuscarHabilitado = computed(() => {
    const doc = this.busquedaComprobante();
    const documentoActual = typeof doc === 'string' ? doc.trim() : '';
    const longitudRequerida = this.tipoDocumento() === 'DNI' ? 8 : 11;
    return documentoActual.length === longitudRequerida;
  });

  limpiarBusqueda(): void {
    this.busquedaComprobante.set(null);
    this.clienteEncontrado.set(null);
    this.comprobantesCliente.set([]);
    this.comprobanteSeleccionado.set(null);
    this.productoSeleccionado.set(null);
    this.sugerenciasComprobantesObj.set([]);
    this.garantiasComprobantes.set(new Map());
    this.resetearFechas();
    this.resetearUnidades();

    this.messageService.add({
      severity: 'info',
      summary: 'Búsqueda limpiada',
      detail: 'Puede buscar otro cliente',
      life: 2000,
    });
  }

  seleccionarComprobanteDeCliente(comprobante: ComprobanteVenta): void {
    const actual = this.comprobanteSeleccionado();

    // Deseleccionar si ya estaba seleccionado
    if (actual?.id_comprobante === comprobante.id_comprobante) {
      this.comprobanteSeleccionado.set(null);
      this.garantiaVigente.set(false);
      this.diasRestantes.set(0);
      this.productoSeleccionado.set(null);
      this.resetearUnidades();
      this.messageService.add({
        severity: 'info',
        summary: 'Comprobante deseleccionado',
        detail: 'Puede seleccionar otro comprobante',
        life: 2000,
      });
      return;
    }

    // Bloquear si no tiene garantía activa registrada en el sistema
    if (!this.tieneGarantiaActiva(comprobante.id_comprobante)) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Sin garantía activa',
        detail: 'Este comprobante no tiene una garantía vigente registrada en el sistema',
        life: 4000,
      });
      return;
    }

    this.comprobanteSeleccionado.set({
      ...comprobante,
      productosSeleccionados: comprobante.detalles || [],
    });

    this.validarGarantiaComprobante(comprobante.fec_emision);

    this.messageService.add({
      severity: 'success',
      summary: 'Comprobante seleccionado',
      detail: this.formatearComprobante(comprobante.serie, comprobante.numero),
      life: 2000,
    });
  }

  validarGarantiaComprobante(fechaEmision: Date): void {
    const vigente = this.claimService.validarGarantia(fechaEmision);
    const dias = this.claimService.calcularDiasRestantes(fechaEmision);
    this.garantiaVigente.set(vigente);
    this.diasRestantes.set(dias);

    if (!vigente) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Garantía vencida',
        detail: 'Este comprobante ya no tiene garantía vigente (60 días)',
        life: 4000,
      });
    }
  }

  calcularDiasRestantesComprobante(fechaEmision: Date): number {
    return this.claimService.calcularDiasRestantes(fechaEmision);
  }

  validarGarantia(fechaEmision: Date): boolean {
    return this.claimService.validarGarantia(fechaEmision);
  }

  seleccionarProducto(producto: any): void {
    const actual = this.productoSeleccionado();

    const idActual = actual?.id_producto || actual?.cod_prod;
    const idNuevo = producto.id_producto || producto.productId || producto.cod_prod || producto.id;

    if (idActual && idActual === idNuevo) {
      this.productoSeleccionado.set(null);
      this.resetearUnidades();
      this.messageService.add({ severity: 'info', summary: 'Producto deseleccionado', life: 2000 });
      return;
    }

    const nombreProducto =
      producto.descripcion || producto.name || producto.nombre || 'Producto seleccionado';

    this.productoSeleccionado.set({ ...producto, id_producto: idNuevo, descripcion: nombreProducto });
    this.resetearUnidades();

    this.messageService.add({
      severity: 'success',
      summary: 'Producto seleccionado',
      detail: nombreProducto,
      life: 2000,
    });
  }

  resetearUnidades(): void {
    this.unidadesAfectadas.set(1);
    this.identificacionUnidad.set('');
  }

  resetearFechas(): void {
    this.fechaDesde.set(new Date(new Date().setDate(new Date().getDate() - 30)));
    this.fechaHasta.set(new Date());
  }

  getPrecioProducto(detalle: any): number {
    return detalle?.precio || detalle?.pre_uni || detalle?.unitPrice || 0;
  }

  getSubtotalDetalle(detalle: DetalleComprobante): number {
    return this.getPrecioProducto(detalle) * detalle.cantidad;
  }

  nextStep(): void {
    if (this.validarStepActual()) {
      this.activeStep.update((step) => step + 1);
    }
  }

  prevStep(): void {
    if (this.activeStep() > 0) {
      this.activeStep.update((step) => step - 1);
    }
  }

  validarStepActual(): boolean {
    const currentStep = this.activeStep();
    const cliente = this.clienteEncontrado();
    const comprobantes = this.comprobantesCliente();
    const comprobante = this.comprobanteSeleccionado();
    const producto = this.productoSeleccionado();
    const unidades = this.unidadesAfectadas();
    const motivo = this.motivoSeleccionado();
    const descripcion = this.descripcionProblema();

    switch (currentStep) {
      case 0:
        if (!cliente) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Cliente requerido',
            detail: 'Debe buscar un cliente',
            life: 3000,
          });
          return false;
        }
        if (comprobantes.length === 0) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Sin compras',
            detail: 'Este cliente no tiene compras con garantía activa en el rango de fechas seleccionado',
            life: 3000,
          });
          return false;
        }
        return true;

      case 1:
        if (!comprobante) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Comprobante requerido',
            detail: 'Debe seleccionar un comprobante con garantía activa',
            life: 3000,
          });
          return false;
        }
        return true;

      case 2:
        if (!producto) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Producto requerido',
            detail: 'Debe seleccionar un producto',
            life: 3000,
          });
          return false;
        }
        if (producto.cantidad > 1) {
          if (!unidades || unidades < 1) {
            this.messageService.add({
              severity: 'warn',
              summary: 'Unidades requeridas',
              detail: 'Indique cuántas unidades tienen el problema',
              life: 3000,
            });
            return false;
          }
          if (unidades > producto.cantidad) {
            this.messageService.add({
              severity: 'warn',
              summary: 'Unidades inválidas',
              detail: `No puede reclamar más de ${producto.cantidad} unidades`,
              life: 3000,
            });
            return false;
          }
        }
        return true;

      case 3:
        if (!motivo || !motivo.trim()) {
          this.messageService.add({
            severity: 'error',
            summary: 'Motivo requerido',
            detail: 'Debe seleccionar un motivo',
            life: 3000,
          });
          return false;
        }
        if (!descripcion || !descripcion.trim()) {
          this.messageService.add({
            severity: 'error',
            summary: 'Descripción requerida',
            detail: 'Debe describir el problema',
            life: 3000,
          });
          return false;
        }
        if (descripcion.trim().length < 20) {
          this.messageService.add({
            severity: 'error',
            summary: 'Descripción muy corta',
            detail: 'La descripción debe tener al menos 20 caracteres',
            life: 3000,
          });
          return false;
        }
        return true;

      default:
        return true;
    }
  }

  async guardarReclamo(): Promise<void> {
    if (!this.validarStepActual()) return;
    const currentUser = this.authService.getCurrentUser();
    const producto = this.productoSeleccionado();
    const comprobante = this.comprobanteSeleccionado();

    if (!producto || !comprobante) return;

    this.guardando.set(true);

    const idComprobanteReal = comprobante.id_comprobante || comprobante.id;

    if (!idComprobanteReal) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error interno',
        detail: 'El comprobante seleccionado no tiene un ID válido asignado.',
        life: 4000,
      });
      this.guardando.set(false);
      return;
    }

    let detalleInfo = `Unidades: ${this.unidadesAfectadas()}`;
    if (this.identificacionUnidad().trim()) {
      detalleInfo += ` | ID/Serie: ${this.identificacionUnidad().trim()}`;
    }

    const payload: RegisterClaimPayload = {
      id_comprobante: Number(idComprobanteReal),
      id_vendedor_ref: String(this.empleadoActual()?.id_empleado || 'SISTEMA'),
      motivo: String(this.motivoSeleccionado()),
      descripcion: String(this.descripcionProblema()),
      id_sede: currentUser?.idSede,
      detalles: [
        {
          tipo: String(producto.id_producto || producto.cod_prod),
          descripcion: detalleInfo,
        },
      ],
    };

    try {
      const reclamoCreado = await this.claimService.register(payload);

      if (reclamoCreado) {
        this.reclamoGenerado.set(reclamoCreado);
        this.messageService.add({
          severity: 'success',
          summary: 'Reclamo registrado',
          detail: `Reclamo creado exitosamente`,
          life: 3000,
        });
      }
    } catch (error: any) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error al registrar',
        detail: error?.message || 'Revisa la consola para más detalles',
        life: 4000,
      });
    } finally {
      this.guardando.set(false);
    }
  }

  verDetalle(): void {
    const reclamo = this.reclamoGenerado();
    if (reclamo) {
      const base = this.router.url.includes('/admin')
        ? '/admin/reclamos-listado'
        : '/ventas/reclamos-listado';
      this.router.navigate([`${base}/detalle`, reclamo.id]);
    }
  }

  nuevoReclamo(): void {
    this.limpiarFormulario();
  }

  cancelar(): void {
    const base = this.router.url.includes('/admin')
      ? '/admin/reclamos-listado'
      : '/ventas/reclamos-listado';
    this.router.navigate([`${base}`]);
  }

  limpiarFormulario(): void {
    this.busquedaComprobante.set(null);
    this.clienteEncontrado.set(null);
    this.comprobantesCliente.set([]);
    this.comprobanteSeleccionado.set(null);
    this.productoSeleccionado.set(null);
    this.garantiaVigente.set(false);
    this.diasRestantes.set(0);
    this.motivoSeleccionado.set('');
    this.descripcionProblema.set('');
    this.activeStep.set(0);
    this.reclamoGenerado.set(null);
    this.sugerenciasComprobantesObj.set([]);
    this.garantiasComprobantes.set(new Map());
    this.tipoDocumento.set('DNI');
    this.resetearFechas();
    this.resetearUnidades();

    this.messageService.add({
      severity: 'info',
      summary: 'Formulario limpiado',
      detail: 'Se han restablecido todos los campos',
      life: 2000,
    });
  }

  formatearComprobante(serie: string, numero: number): string {
    return `${serie}-${String(numero).padStart(8, '0')}`;
  }

  getTipoComprobanteLabel(tipo: string | number): string {
    const tipoStr = String(tipo).padStart(2, '0');
    return tipoStr === '01' ? 'Factura' : tipoStr === '03' ? 'Boleta' : String(tipo);
  }

  getTipoComprobanteSeverity(tipo: string | number): 'success' | 'info' {
    const tipoStr = String(tipo).padStart(2, '0');
    return tipoStr === '01' ? 'success' : 'info';
  }
}