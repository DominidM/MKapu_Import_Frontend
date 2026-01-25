import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { Card } from 'primeng/card';
import { Button } from 'primeng/button';
import { Select } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { Toast } from 'primeng/toast';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { DatePicker } from 'primeng/datepicker';
import { Tooltip } from 'primeng/tooltip';
import { AutoComplete } from 'primeng/autocomplete';

import { VentasService, ComprobanteVenta } from '../../../core/services/ventas.service';
import { SedeService, Sede } from '../../../core/services/sede.service';
import { EmpleadosService, Empleado } from '../../../core/services/empleados.service';
import { ComprobantesService } from '../../../core/services/comprobantes.service';
import { PosService } from '../../../core/services/pos.service';
import { MessageService, ConfirmationService } from 'primeng/api';

interface FiltroVentas {
  tipoComprobante: string | null;
  estado: string | null;
  fechaInicio: Date | null;
  fechaFin: Date | null;
  busqueda: string;
  tipoPago: string | null;
}

@Component({
  selector: 'app-historial-ventas',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    Card,
    Button,
    Select,
    TableModule,
    Tag,
    Toast,
    ConfirmDialog,
    DatePicker,
    Tooltip,
    AutoComplete,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './historial-ventas.html',
  styleUrls: ['./historial-ventas.css'],
})
export class HistorialVentas implements OnInit, OnDestroy {
  tituloKicker = 'VENTAS - HISTORIAL DE VENTAS';
  subtituloKicker = 'CONSULTA Y GESTIÓN DE VENTAS';
  iconoCabecera = 'pi pi-list';

  private subscriptions = new Subscription();

  comprobantes: ComprobanteVenta[] = [];
  comprobantesFiltrados: ComprobanteVenta[] = [];
  comprobanteSeleccionado: ComprobanteVenta | null = null;
  sedes: Sede[] = [];
  empleadoActual: Empleado | null = null;
  sedeActual: Sede | null = null;

  filtros: FiltroVentas = {
    tipoComprobante: null,
    estado: null,
    fechaInicio: null,
    fechaFin: null,
    busqueda: '',
    tipoPago: null,
  };

  tiposComprobante: any[] = [];
  estadosComprobante: any[] = [];
  tiposPago: any[] = [];

  sugerenciasBusqueda: string[] = [];
  todasLasSugerencias: string[] = [];

  loading: boolean = false;
  mostrarDetalle: boolean = false;

  totalVentas: number = 0;
  totalBoletas: number = 0;
  totalFacturas: number = 0;
  cantidadVentas: number = 0;

  inicioSemana: Date = new Date();
  finSemana: Date = new Date();

  constructor(
    private router: Router,
    private ventasService: VentasService,
    private sedeService: SedeService,
    private empleadosService: EmpleadosService,
    private comprobantesService: ComprobantesService,
    private posService: PosService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
  ) {}

  ngOnInit(): void {
    this.calcularRangoSemana();
    this.cargarOpcionesFiltros();
    this.cargarEmpleadoActual();
    this.cargarSedes();
    this.cargarComprobantes();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }


  calcularRangoSemana(): void {
    const hoy = new Date();
    const diaSemana = hoy.getDay();
    
    const diasDesdeInicio = diaSemana === 0 ? 6 : diaSemana - 1;
    
    this.inicioSemana = new Date(hoy);
    this.inicioSemana.setDate(hoy.getDate() - diasDesdeInicio);
    this.inicioSemana.setHours(0, 0, 0, 0);
    
    this.finSemana = new Date(this.inicioSemana);
    this.finSemana.setDate(this.inicioSemana.getDate() + 6);
    this.finSemana.setHours(23, 59, 59, 999);

    console.log('📅 Semana actual:', {
      inicio: this.inicioSemana.toLocaleDateString('es-PE'),
      fin: this.finSemana.toLocaleDateString('es-PE'),
    });
  }

  cargarOpcionesFiltros(): void {
    this.tiposComprobante = this.comprobantesService.getTiposComprobanteOptions();
    this.estadosComprobante = this.comprobantesService.getEstadosComprobanteOptions();
    this.tiposPago = this.posService.getTiposPagoOptions();
  }

  cargarEmpleadoActual(): void {
    this.empleadoActual = this.empleadosService.getEmpleadoActual();

    if (!this.empleadoActual) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error de autenticación',
        detail: 'No hay un empleado autenticado. Redirigiendo...',
        life: 3000,
      });

      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 1000);
      return;
    }

    this.messageService.add({
      severity: 'info',
      summary: 'Sede actual',
      detail: `Mostrando ventas de: ${this.empleadoActual.nombre_sede}`,
      life: 3000,
    });
  }

  cargarSedes(): void {
    const sub = this.sedeService.getSedes().subscribe({
      next: (sedes) => {
        this.sedes = sedes;

        if (this.empleadoActual?.id_sede) {
          this.sedeActual =
            this.sedes.find((s) => s.id_sede === this.empleadoActual!.id_sede) || null;
        }
      },
      error: (error) => {
        console.error('Error al cargar sedes:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar las sedes',
          life: 3000,
        });
      },
    });
    this.subscriptions.add(sub);
  }

  cargarComprobantes(): void {
    this.loading = true;

    const todosComprobantes = this.ventasService.getComprobantes();

    if (this.empleadoActual?.id_sede) {
      this.comprobantes = todosComprobantes
        .filter((c) => c.id_sede === this.empleadoActual!.id_sede)
        .sort((a, b) => new Date(b.fec_emision).getTime() - new Date(a.fec_emision).getTime());

      console.log(`📍 Filtrando ventas por sede: ${this.empleadoActual.nombre_sede}`);
      console.log(`📊 Total de ventas en esta sede: ${this.comprobantes.length}`);
    } else {
      this.comprobantes = todosComprobantes.sort(
        (a, b) => new Date(b.fec_emision).getTime() - new Date(a.fec_emision).getTime(),
      );
      console.warn('⚠️ No hay empleado logueado, mostrando todas las ventas');
    }

    this.comprobantesFiltrados = [...this.comprobantes];
    this.cargarSugerenciasBusqueda();
    this.calcularEstadisticas();

    this.loading = false;

    if (this.comprobantes.length === 0) {
      this.messageService.add({
        severity: 'info',
        summary: 'Sin registros',
        detail: `No hay ventas registradas en ${this.empleadoActual?.nombre_sede || 'esta sede'}`,
        life: 3000,
      });
    }
  }

  cargarSugerenciasBusqueda(): void {
    const sugerencias = new Set<string>();

    this.comprobantes.forEach((c) => {
      sugerencias.add(this.getNumeroFormateado(c));

      if (c.cliente_nombre && c.cliente_nombre.trim()) {
        sugerencias.add(c.cliente_nombre.trim());
      }

      if (c.cliente_doc && c.cliente_doc.trim()) {
        sugerencias.add(c.cliente_doc.trim());
      }
    });

    this.todasLasSugerencias = Array.from(sugerencias).sort();
  }

  buscarSugerencias(event: any): void {
    const query = event.query.toLowerCase().trim();

    if (!query) {
      this.sugerenciasBusqueda = this.todasLasSugerencias.slice(0, 10);
    } else {
      this.sugerenciasBusqueda = this.todasLasSugerencias
        .filter((item) => item.toLowerCase().includes(query))
        .slice(0, 15);
    }
  }

  aplicarFiltros(): void {
    let resultado = [...this.comprobantes];

    if (this.filtros.tipoComprobante) {
      resultado = resultado.filter((c) => c.tipo_comprobante === this.filtros.tipoComprobante);
    }

    if (this.filtros.estado) {
      resultado = resultado.filter((c) => this.getEstadoComprobante(c) === this.filtros.estado);
    }

    if (this.filtros.tipoPago) {
      resultado = resultado.filter((c) => c.tipo_pago === this.filtros.tipoPago);
    }

    if (this.filtros.fechaInicio) {
      resultado = resultado.filter((c) => {
        const fecha = new Date(c.fec_emision);
        return fecha >= this.filtros.fechaInicio!;
      });
    }

    if (this.filtros.fechaFin) {
      const fechaFinAjustada = new Date(this.filtros.fechaFin);
      fechaFinAjustada.setHours(23, 59, 59, 999);

      resultado = resultado.filter((c) => {
        const fecha = new Date(c.fec_emision);
        return fecha <= fechaFinAjustada;
      });
    }

    if (this.filtros.busqueda && this.filtros.busqueda.trim()) {
      const busqueda = this.filtros.busqueda.toLowerCase().trim();
      resultado = resultado.filter((c) => {
        const serie = c.serie.toLowerCase();
        const numero = c.numero.toString();
        const cliente = (c.cliente_nombre || '').toLowerCase();
        const documento = (c.cliente_doc || '').toLowerCase();
        const numeroFormateado = this.getNumeroFormateado(c).toLowerCase();

        return (
          serie.includes(busqueda) ||
          numero.includes(busqueda) ||
          cliente.includes(busqueda) ||
          documento.includes(busqueda) ||
          numeroFormateado.includes(busqueda)
        );
      });
    }

    resultado.sort((a, b) => new Date(b.fec_emision).getTime() - new Date(a.fec_emision).getTime());

    this.comprobantesFiltrados = resultado;
    this.calcularEstadisticas();
  }

  limpiarFiltros(): void {
    this.filtros = {
      tipoComprobante: null,
      estado: null,
      fechaInicio: null,
      fechaFin: null,
      busqueda: '',
      tipoPago: null,
    };
    this.aplicarFiltros();

    this.messageService.add({
      severity: 'info',
      summary: 'Filtros limpiados',
      detail: 'Se restablecieron todos los filtros',
      life: 2000,
    });
  }

  /**
   * Calcula estadísticas SOLO de la semana actual
   */
  calcularEstadisticas(): void {
    // Filtrar comprobantes de la semana actual
    const ventasSemana = this.comprobantesFiltrados.filter((c) => {
      const fechaVenta = new Date(c.fec_emision);
      return fechaVenta >= this.inicioSemana && fechaVenta <= this.finSemana;
    });

    // Calcular totales de la semana
    this.totalVentas = ventasSemana.reduce((sum, c) => sum + c.total, 0);
    this.cantidadVentas = ventasSemana.length;
    this.totalBoletas = ventasSemana.filter((c) => c.tipo_comprobante === '03').length;
    this.totalFacturas = ventasSemana.filter((c) => c.tipo_comprobante === '01').length;

    console.log('📊 Estadísticas de la semana:', {
      total: this.totalVentas,
      cantidad: this.cantidadVentas,
      boletas: this.totalBoletas,
      facturas: this.totalFacturas,
    });
  }

  getEstadoComprobante(comprobante: ComprobanteVenta): string {
    return this.comprobantesService.getEstadoComprobante(comprobante);
  }

  getSeverityEstado(estado: string): 'success' | 'danger' | 'warn' | 'info' {
    return this.comprobantesService.getSeverityEstado(estado);
  }

  getTipoComprobanteLabel(tipo: string): string {
    return this.comprobantesService.getTipoComprobanteLabel(tipo as '01' | '03');
  }

  getNumeroFormateado(comprobante: ComprobanteVenta): string {
    return this.comprobantesService.getNumeroFormateado(comprobante.serie, comprobante.numero);
  }

  getTipoPagoLabel(tipoPago: string): string {
    return this.posService.getTipoPagoLabel(tipoPago);
  }

  getSeverityTipoPago(tipoPago: string): 'success' | 'info' | 'warn' | 'secondary' {
    return this.posService.getSeverityTipoPago(tipoPago);
  }

  getSede(comprobante: ComprobanteVenta): string {
    const sede = this.sedes.find((s) => s.id_sede === comprobante.id_sede);
    return sede ? sede.nombre : 'N/A';
  }

  cerrarDetalle(): void {
    this.mostrarDetalle = false;
    this.comprobanteSeleccionado = null;
  }

  imprimirComprobante(comprobante: ComprobanteVenta): void {
    this.router.navigate(['/ventas/imprimir-comprobante'], {
      state: {
        comprobante: comprobante,
        rutaRetorno: '/ventas/historial-ventas',
      },
    });
  }

  verDetalleVenta(comprobante: ComprobanteVenta): void {
    this.router.navigate(['/ventas/ver-detalle', comprobante.id]);
  }

  anularComprobante(comprobante: ComprobanteVenta): void {
    this.confirmationService.confirm({
      message: `¿Está seguro de anular el comprobante ${this.getNumeroFormateado(comprobante)}?`,
      header: 'Confirmar Anulación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, anular',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        comprobante.estado = false;

        this.messageService.add({
          severity: 'success',
          summary: 'Comprobante anulado',
          detail: `${this.getNumeroFormateado(comprobante)} fue anulado exitosamente`,
          life: 3000,
        });

        this.aplicarFiltros();
      },
    });
  }

  nuevaVenta(): void {
    this.router.navigate(['/ventas/generar-venta']);
  }
}
