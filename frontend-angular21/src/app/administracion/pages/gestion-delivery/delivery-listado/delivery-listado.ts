import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';

import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { SelectModule } from 'primeng/select';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';

type TipoOperacion = 'VENTA_DELIVERY' | 'COMPRA_RECOJO';
type EstadoDelivery = 'PENDIENTE' | 'EN_CAMINO' | 'ENTREGADO' | 'CANCELADO';

interface DeliveryRow {
  id: string;
  tipo: TipoOperacion;
  comprobante: string;
  cliente: string;
  origen: string;
  destino: string;
  monto: number;
  responsable: string;
  estado: EstadoDelivery;
  fecha: string;
  hora: string;
}

@Component({
  selector: 'app-delivery-listado',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    CardModule,
    TableModule,
    ButtonModule,
    AutoCompleteModule,
    TagModule,
    SelectModule,
    ToastModule,
    ConfirmDialog,
    TooltipModule,
  ],
  templateUrl: './delivery-listado.html',
  styleUrl: './delivery-listado.css',
  providers: [ConfirmationService, MessageService],
})
export class DeliveryListado implements OnInit {
  tituloKicker = 'ADMINISTRADOR - DELIVERY - GESTIÓN';
  subtituloKicker = 'LISTADO DE DELIVERY';

  // KPIs
  kpiTotal = 0;
  kpiPendientes = 0;
  kpiEnCamino = 0;
  kpiEntregados = 0;

  searchTerm: string | null = null;
  sugerencias: DeliveryRow[] = [];

  filas: DeliveryRow[] = [];
  filasFiltradas: DeliveryRow[] = [];

  filtroTipo: TipoOperacion | 'TODOS' = 'TODOS';
  filtroEstado: EstadoDelivery | 'TODOS' = 'TODOS';

  tipoOptions = [
    { label: 'Todos', value: 'TODOS' },
    { label: 'Venta / Delivery', value: 'VENTA_DELIVERY' },
    { label: 'Compra / Recojo', value: 'COMPRA_RECOJO' },
  ];

  estadoOptions = [
    { label: 'Todos', value: 'TODOS' },
    { label: 'Pendiente', value: 'PENDIENTE' },
    { label: 'En camino', value: 'EN_CAMINO' },
    { label: 'Entregado', value: 'ENTREGADO' },
    { label: 'Cancelado', value: 'CANCELADO' },
  ];

  private readonly dataBase: DeliveryRow[] = [
    {
      id: 'DLV-001',
      tipo: 'VENTA_DELIVERY',
      comprobante: 'B001-00008060',
      cliente: 'Juan Pérez Rojas',
      origen: 'Almacén Central - San Isidro',
      destino: 'Av. Larco 450, Miraflores',
      monto: 320.5,
      responsable: 'Carlos Mendoza',
      estado: 'EN_CAMINO',
      fecha: '2026-03-25',
      hora: '09:45',
    },
    {
      id: 'DLV-002',
      tipo: 'VENTA_DELIVERY',
      comprobante: 'B001-00008061',
      cliente: 'Empresa ABC S.A.C.',
      origen: 'Almacén Central - San Isidro',
      destino: 'Jr. Ucayali 320, Lima Centro',
      monto: 850.0,
      responsable: 'Luis Quispe',
      estado: 'PENDIENTE',
      fecha: '2026-03-25',
      hora: '10:00',
    },
    {
      id: 'DLV-003',
      tipo: 'COMPRA_RECOJO',
      comprobante: 'OC-00000125',
      cliente: 'Proveedor XYZ SAC',
      origen: 'Depósito Proveedor - Ate Vitarte',
      destino: 'Almacén Central - San Isidro',
      monto: 4200.0,
      responsable: 'Pedro Huanca',
      estado: 'PENDIENTE',
      fecha: '2026-03-25',
      hora: '10:30',
    },
    {
      id: 'DLV-004',
      tipo: 'VENTA_DELIVERY',
      comprobante: 'B001-00008063',
      cliente: 'Claudia Vega',
      origen: 'Almacén Central - San Isidro',
      destino: 'Calle Las Flores 88, San Borja',
      monto: 175.0,
      responsable: 'Sin asignar',
      estado: 'PENDIENTE',
      fecha: '2026-03-25',
      hora: '11:15',
    },
    {
      id: 'DLV-005',
      tipo: 'COMPRA_RECOJO',
      comprobante: 'OC-00000126',
      cliente: 'Importadora Sur EIRL',
      origen: 'Puerto del Callao - Terminal 3',
      destino: 'Almacén Central - San Isidro',
      monto: 12500.0,
      responsable: 'Rosa Mamani',
      estado: 'EN_CAMINO',
      fecha: '2026-03-24',
      hora: '14:00',
    },
    {
      id: 'DLV-006',
      tipo: 'VENTA_DELIVERY',
      comprobante: 'B001-00008065',
      cliente: 'Roberto Lima',
      origen: 'Almacén Central - San Isidro',
      destino: 'Urb. Los Pinos 210, Surco',
      monto: 560.0,
      responsable: 'Carlos Mendoza',
      estado: 'ENTREGADO',
      fecha: '2026-03-24',
      hora: '15:30',
    },
    {
      id: 'DLV-007',
      tipo: 'VENTA_DELIVERY',
      comprobante: 'B001-00008066',
      cliente: 'Sofía Ramos',
      origen: 'Almacén Central - San Isidro',
      destino: 'Av. Brasil 1200, Jesús María',
      monto: 240.0,
      responsable: 'Luis Quispe',
      estado: 'CANCELADO',
      fecha: '2026-03-24',
      hora: '16:00',
    },
    {
      id: 'DLV-008',
      tipo: 'COMPRA_RECOJO',
      comprobante: 'OC-00000127',
      cliente: 'Distribuidora Norte SRL',
      origen: 'Almacén Norte - Los Olivos',
      destino: 'Almacén Central - San Isidro',
      monto: 3100.0,
      responsable: 'Pedro Huanca',
      estado: 'ENTREGADO',
      fecha: '2026-03-23',
      hora: '08:00',
    },
  ];

  constructor(
    private router: Router,
    private messageService: MessageService,
  ) {}

  ngOnInit(): void {
    this.filas = [...this.dataBase];
    this.sugerencias = [...this.filas];
    this.calcularKpis();
    this.aplicarFiltros();
  }

  calcularKpis(): void {
    this.kpiTotal = this.filas.length;
    this.kpiPendientes = this.filas.filter((f) => f.estado === 'PENDIENTE').length;
    this.kpiEnCamino = this.filas.filter((f) => f.estado === 'EN_CAMINO').length;
    this.kpiEntregados = this.filas.filter((f) => f.estado === 'ENTREGADO').length;
  }

  aplicarFiltros(): void {
    this.filasFiltradas = this.filas.filter((f) => {
      const matchTipo = this.filtroTipo === 'TODOS' || f.tipo === this.filtroTipo;
      const matchEstado = this.filtroEstado === 'TODOS' || f.estado === this.filtroEstado;
      const matchSearch =
        !this.searchTerm ||
        f.cliente.toLowerCase().includes((this.searchTerm as string).toLowerCase()) ||
        f.comprobante.toLowerCase().includes((this.searchTerm as string).toLowerCase()) ||
        f.id.toLowerCase().includes((this.searchTerm as string).toLowerCase());
      return matchTipo && matchEstado && matchSearch;
    });
  }

  limpiarFiltros(): void {
    this.searchTerm = null;
    this.filtroTipo = 'TODOS';
    this.filtroEstado = 'TODOS';
    this.aplicarFiltros();
  }

  verDetalle(fila: DeliveryRow): void {
    this.router.navigate(['/admin/detalle-delivery', fila.id]);
  }

  irFormulario(): void {
    this.router.navigate(['/admin/formulario-delivery']);
  }

  getTipoLabel(tipo: TipoOperacion): string {
    return tipo === 'VENTA_DELIVERY' ? 'Venta / Delivery' : 'Compra / Recojo';
  }

  getTipoSeverity(tipo: TipoOperacion): 'info' | 'warn' {
    return tipo === 'VENTA_DELIVERY' ? 'info' : 'warn';
  }

  getEstadoSeverity(estado: EstadoDelivery): 'success' | 'info' | 'warn' | 'danger' {
    switch (estado) {
      case 'ENTREGADO':
        return 'success';
      case 'EN_CAMINO':
        return 'info';
      case 'PENDIENTE':
        return 'warn';
      case 'CANCELADO':
        return 'danger';
    }
  }
}
