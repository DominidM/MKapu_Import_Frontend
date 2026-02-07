import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { SelectModule } from 'primeng/select';
import { ConfirmationService, MessageService } from 'primeng/api';

import { EmpleadosService, Empleado } from '../../../../../core/services/empleados.service';
import { VentasService, ComprobanteVenta } from '../../../../../core/services/ventas.service';

interface DespachoRow {
  codigo: string;
  descripcion: string;
  cantidad: number;
  comprobante: string;
  despachador: string;
  asesor: string;
  salida: string;
  ubicacion: string;
  agencia: string;
  hora: string;
  estado: 'DESPACHADO' | 'SIN DESPACHAR';
}

interface DespachoBase {
  cantidad: number;
  comprobante: string;
  salida: string;
  ubicacion: string;
  agencia: string;
  hora: string;
}

@Component({
  selector: 'app-listado-despacho',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    CardModule,
    TableModule,
    ButtonModule,
    AutoCompleteModule,
    InputTextModule,
    TagModule,
    SelectModule,
    ToastModule,
    ConfirmDialog,
    TooltipModule,
  ],
  templateUrl: './listado-despacho.html',
  styleUrl: './listado-despacho.css',
  providers: [ConfirmationService, MessageService],
})
export class ListadoDespacho implements OnInit {
  tituloKicker = 'ADMINISTRADOR - DESPACHO - PRODUCTOS';
  subtituloKicker = 'LISTADO DE DESPACHO';
  iconoCabecera = 'pi pi-truck';

  searchTerm: string | null = null;
  sugerencias: DespachoRow[] = [];

  filas: DespachoRow[] = [];
  filasFiltradas: DespachoRow[] = [];
  estadoFiltro: 'TODOS' | DespachoRow['estado'] = 'TODOS';
  estadoOptions = [
    { label: 'Todos', value: 'TODOS' },
    { label: 'Despachado', value: 'DESPACHADO' },
    { label: 'Sin despachar', value: 'SIN DESPACHAR' },
  ];

  private empleados: Empleado[] = [];
  private ventas: ComprobanteVenta[] = [];

  private readonly baseDespachos: DespachoBase[] = [
    {
      cantidad: 1,
      comprobante: '8060',
      salida: 'PROVINCIA',
      ubicacion: 'TRUJILLO',
      agencia: 'SHALOM',
      hora: '09:45',
    },
    {
      cantidad: 1,
      comprobante: '8061',
      salida: 'PROVINCIA',
      ubicacion: 'CUSCO',
      agencia: 'MARVISUR',
      hora: '09:46',
    },
    {
      cantidad: 1,
      comprobante: '8061',
      salida: 'PROVINCIA',
      ubicacion: 'AREQUIPA',
      agencia: 'MARVISUR',
      hora: '09:46',
    },
    {
      cantidad: 1,
      comprobante: '8065',
      salida: 'PROVINCIA',
      ubicacion: 'FERRENAFE',
      agencia: 'SHALOM',
      hora: '11:43',
    },
    {
      cantidad: 1,
      comprobante: '8065',
      salida: 'PROVINCIA',
      ubicacion: 'FERRENAFE',
      agencia: 'SHALOM',
      hora: '11:43',
    },
    {
      cantidad: 1,
      comprobante: '8065',
      salida: 'PROVINCIA',
      ubicacion: 'FERRENAFE',
      agencia: 'SHALOM',
      hora: '11:43',
    },
    {
      cantidad: 1,
      comprobante: '8065',
      salida: 'PROVINCIA',
      ubicacion: 'FERRENAFE',
      agencia: 'SHALOM',
      hora: '11:43',
    },
    {
      cantidad: 1,
      comprobante: '8065',
      salida: 'PROVINCIA',
      ubicacion: 'RICA',
      agencia: 'SHALOM',
      hora: '10:17',
    },
    {
      cantidad: 1,
      comprobante: '8067',
      salida: 'PROVINCIA',
      ubicacion: 'CUSCO',
      agencia: 'SHALOM',
      hora: '12:01',
    },
    {
      cantidad: 1,
      comprobante: '8069',
      salida: 'PROVINCIA',
      ubicacion: 'CANETE',
      agencia: 'SHALOM',
      hora: '12:02',
    },
    {
      cantidad: 1,
      comprobante: '8066',
      salida: 'PROVINCIA',
      ubicacion: 'CHINCHA',
      agencia: 'SHALOM',
      hora: '11:47',
    },
    {
      cantidad: 1,
      comprobante: '8063',
      salida: 'PROVINCIA',
      ubicacion: 'ICA',
      agencia: 'SHALOM',
      hora: '10:22',
    },
    {
      cantidad: 1,
      comprobante: '8080',
      salida: 'PROVINCIA',
      ubicacion: 'CHICLAYO',
      agencia: 'SHALOM',
      hora: '14:46',
    },
    {
      cantidad: 1,
      comprobante: '8079',
      salida: 'PROVINCIA',
      ubicacion: 'LIMA',
      agencia: 'SHALOM',
      hora: '14:46',
    },
  ];

  constructor(
    private empleadosService: EmpleadosService,
    private ventasService: VentasService,
    private messageService: MessageService,
  ) {}

  ngOnInit(): void {
    this.cargarVentas();
    this.cargarEmpleados();
  }

  private cargarEmpleados(): void {
    this.empleadosService.getEmpleados().subscribe({
      next: (empleados) => {
        this.empleados = empleados;
        this.actualizarResponsables();
      },
      error: () => {
        this.empleados = [];
        this.actualizarResponsables();
      },
    });
  }

  private cargarVentas(): void {
    this.ventas = this.ventasService.getComprobantes();
    const despachador = this.obtenerNombreEmpleado('ALMACENERO');
    const asesor = this.obtenerNombreEmpleado('VENTAS');

    this.filas = this.ventas.map((venta, index) =>
      this.armarFila(venta, index, despachador, asesor),
    );
    this.sugerencias = [...this.filas];
    this.aplicarFiltros();
  }

  private actualizarResponsables(): void {
    const despachador = this.obtenerNombreEmpleado('ALMACENERO');
    const asesor = this.obtenerNombreEmpleado('VENTAS');
    this.filas = this.filas.map((fila) => ({
      ...fila,
      despachador,
      asesor,
    }));
    this.aplicarFiltros();
  }

  private armarFila(
    venta: ComprobanteVenta,
    index: number,
    despachador: string,
    asesor: string,
  ): DespachoRow {
    const base = this.baseDespachos[index % this.baseDespachos.length];
    const estado = venta.estado ? 'DESPACHADO' : 'SIN DESPACHAR';
    const totalCantidad = venta.detalles?.reduce((sum, d) => sum + (d.cantidad || 0), 0) || 0;
    const descripcion = venta.cliente_nombre || venta.cliente_doc || 'Venta sin cliente';
    const comprobante = `${venta.serie}-${String(venta.numero).padStart(8, '0')}`;

    return {
      codigo: venta.id_comprobante,
      descripcion,
      cantidad: Math.max(1, totalCantidad || base.cantidad),
      comprobante,
      despachador,
      asesor,
      salida: base.salida,
      ubicacion: base.ubicacion,
      agencia: base.agencia,
      hora: base.hora,
      estado,
    };
  }

  private obtenerNombreEmpleado(cargo: Empleado['cargo']): string {
    const empleado = this.empleados.find((item) => item.cargo === cargo && item.estado);
    if (!empleado) return 'Sin asignar';
    return `${empleado.nombres} ${empleado.apellidos}`.trim();
  }

  editarFila(fila: DespachoRow): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Editar',
      detail: `Editar venta ${fila.codigo}`,
      life: 2000,
    });
  }

  limpiarFiltros(): void {
    this.searchTerm = null;
    this.estadoFiltro = 'TODOS';
    this.aplicarFiltros();
  }

  aplicarFiltros(): void {
    if (this.estadoFiltro === 'TODOS') {
      this.filasFiltradas = [...this.filas];
      return;
    }

    this.filasFiltradas = this.filas.filter((fila) => fila.estado === this.estadoFiltro);
  }


  getSalidaSeverity(salida: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    const salidaUpper = salida.toUpperCase();
    if (salidaUpper === 'LIMA') return 'success';
    if (salidaUpper === 'PROVINCIA') return 'info';
    return 'secondary';
  }

  getEstadoSeverity(estado: DespachoRow['estado']): 'success' | 'danger' {
    return estado === 'DESPACHADO' ? 'success' : 'danger';
  }
}
