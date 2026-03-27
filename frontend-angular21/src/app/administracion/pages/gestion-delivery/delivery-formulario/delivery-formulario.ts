import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { DividerModule } from 'primeng/divider';
import { TextareaModule } from 'primeng/textarea';
import { TableModule } from 'primeng/table';
import { DatePickerModule } from 'primeng/datepicker';
import { MessageService } from 'primeng/api';

type TipoOperacion = 'VENTA_DELIVERY' | 'COMPRA_RECOJO';
type EstadoDelivery = 'PENDIENTE' | 'EN_CAMINO' | 'ENTREGADO' | 'CANCELADO';

interface Personal {
  id: number;
  nombre: string;
  cargo: string;
  telefono: string;
  disponible: boolean;
}

interface ProductoLinea {
  _uid: number;
  codigo: string;
  descripcion: string;
  cantidad: number;
  precio: number;
}

interface DeliveryForm {
  tipo: TipoOperacion | null;
  comprobante: string;
  cliente: string;
  origen: string;
  destino: string;
  fechaEntrega: Date | null;
  responsableId: number | null;
  estado: EstadoDelivery;
  observaciones: string;
  productos: ProductoLinea[];
}

@Component({
  selector: 'app-delivery-formulario',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    TagModule,
    ToastModule,
    TooltipModule,
    DividerModule,
    TextareaModule,
    TableModule,
    DatePickerModule,
  ],
  templateUrl: './delivery-formulario.html',
  styleUrl: './delivery-formulario.css',
  providers: [MessageService],
})
export class DeliveryFormulario implements OnInit {
  tituloKicker = 'ADMINISTRADOR - DELIVERY';
  subtituloKicker = 'ASIGNACIÓN DE DELIVERY';

  private _uidCounter = 1;

  form: DeliveryForm = {
    tipo: null,
    comprobante: '',
    cliente: '',
    origen: '',
    destino: '',
    fechaEntrega: null,
    responsableId: null,
    estado: 'PENDIENTE',
    observaciones: '',
    productos: [],
  };

  readonly personal: Personal[] = [
    { id: 1, nombre: 'Carlos Mendoza',  cargo: 'REPARTIDOR',   telefono: '999-001-001', disponible: true  },
    { id: 2, nombre: 'Luis Quispe',     cargo: 'REPARTIDOR',   telefono: '999-001-002', disponible: true  },
    { id: 3, nombre: 'Ana Torres',      cargo: 'COORDINADORA', telefono: '999-001-003', disponible: true  },
    { id: 4, nombre: 'Jorge Castillo',  cargo: 'REPARTIDOR',   telefono: '999-001-004', disponible: false },
    { id: 5, nombre: 'María Sánchez',   cargo: 'SUPERVISOR',   telefono: '999-001-005', disponible: true  },
    { id: 6, nombre: 'Pedro Huanca',    cargo: 'RECOGEDOR',    telefono: '999-001-006', disponible: true  },
    { id: 7, nombre: 'Rosa Mamani',     cargo: 'RECOGEDOR',    telefono: '999-001-007', disponible: true  },
  ];

  personalOptions: { label: string; value: number; cargo: string; disponible: boolean }[] = [];
  personalSeleccionado: Personal | null = null;

  tipoOptions = [
    { label: 'Venta / Delivery', value: 'VENTA_DELIVERY' },
    { label: 'Compra / Recojo',  value: 'COMPRA_RECOJO'  },
  ];

  estadoOptions = [
    { label: 'Pendiente',  value: 'PENDIENTE'  },
    { label: 'En camino',  value: 'EN_CAMINO'  },
    { label: 'Entregado',  value: 'ENTREGADO'  },
    { label: 'Cancelado',  value: 'CANCELADO'  },
  ];

  get subtotal(): number {
    return this.form.productos.reduce((s, p) => s + p.cantidad * p.precio, 0);
  }

  get igv(): number {
    return this.subtotal * 0.18;
  }

  get total(): number {
    return this.subtotal + this.igv;
  }

  constructor(
    private router: Router,
    private messageService: MessageService,
  ) {}

  ngOnInit(): void {
    this.personalOptions = this.personal.map(p => ({
      label: `${p.nombre} — ${p.cargo}${p.disponible ? '' : ' (no disponible)'}`,
      value: p.id,
      cargo: p.cargo,
      disponible: p.disponible,
    }));
    this.agregarProducto();
  }

  onResponsableChange(): void {
    this.personalSeleccionado = this.personal.find(p => p.id === this.form.responsableId) ?? null;
  }

  agregarProducto(): void {
    this.form.productos.push({
      _uid: this._uidCounter++,
      codigo: '',
      descripcion: '',
      cantidad: 1,
      precio: 0,
    });
  }

  eliminarProducto(uid: number): void {
    this.form.productos = this.form.productos.filter(p => p._uid !== uid);
  }

  guardar(): void {
    if (!this.form.tipo || !this.form.cliente || !this.form.destino) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Campos requeridos',
        detail: 'Completa tipo, cliente y destino antes de guardar.',
        life: 3500,
      });
      return;
    }

    this.messageService.add({
      severity: 'success',
      summary: 'Delivery asignado',
      detail: `Delivery registrado correctamente para ${this.form.cliente}`,
      life: 3500,
    });

    setTimeout(() => this.router.navigate(['/admin/gestion-delivery']), 1800);
  }

  cancelar(): void {
    this.router.navigate(['/admin/gestion-delivery']);
  }

  getTipoLabel(tipo: TipoOperacion | null): string {
    if (!tipo) return '—';
    return tipo === 'VENTA_DELIVERY' ? 'Venta / Delivery' : 'Compra / Recojo';
  }

  getTipoSeverity(tipo: TipoOperacion | null): 'info' | 'warn' {
    return tipo === 'COMPRA_RECOJO' ? 'warn' : 'info';
  }

  getEstadoSeverity(estado: EstadoDelivery): 'success' | 'info' | 'warn' | 'danger' {
    switch (estado) {
      case 'ENTREGADO': return 'success';
      case 'EN_CAMINO': return 'info';
      case 'PENDIENTE': return 'warn';
      case 'CANCELADO': return 'danger';
    }
  }
}