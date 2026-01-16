import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectButtonModule } from 'primeng/selectbutton';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { PaginatorModule } from 'primeng/paginator';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

import { MessageService, ConfirmationService } from 'primeng/api';

import { VentasService, ComprobanteVenta } from '../../../core/services/ventas.service';

@Component({
  selector: 'app-lista-ventas',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    TableModule,
    CardModule,
    TagModule,
    TooltipModule,
    InputTextModule,
    DatePickerModule,
    SelectButtonModule,
    IconFieldModule,
    InputIconModule,
    PaginatorModule,
    ToastModule,
    ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './lista-ventas.html',
  styleUrls: ['./lista-ventas.css']
})
export class ListaVentas implements OnInit {

  ventas: ComprobanteVenta[] = [];
  ventasFiltradas: ComprobanteVenta[] = [];
  loading = false;

  busqueda = '';
  fechaInicio: Date | null = null;
  fechaFin: Date | null = null;
  estadoSeleccionado: string = 'TODOS';
  tipoComprobanteSeleccionado: string = 'TODOS';

  estadoOptions = [
    { label: 'Todos', value: 'TODOS' },
    { label: 'Emitidos', value: 'true' },
    { label: 'Anulados', value: 'false' }
  ];

  tipoComprobanteOptions = [
    { label: 'Todos', value: 'TODOS' },
    { label: 'Boletas', value: '03' },
    { label: 'Facturas', value: '01' }
  ];

  first = 0;
  rows = 10;
  totalRecords = 0;

  Math = Math;

  constructor(
    private router: Router,
    private ventasService: VentasService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.cargarVentas();
  }

  cargarVentas(): void {
    this.loading = true;
    
    setTimeout(() => {
      this.ventas = this.ventasService.getComprobantes();
      this.aplicarFiltros();
      this.loading = false;
    }, 300);
  }

  aplicarFiltros(): void {
    this.ventasFiltradas = this.ventas.filter(venta => {
      const matchBusqueda = !this.busqueda || 
        `${venta.serie}-${venta.numero}`.toLowerCase().includes(this.busqueda.toLowerCase()) ||
        (venta.cliente_nombre && venta.cliente_nombre.toLowerCase().includes(this.busqueda.toLowerCase())) ||
        (venta.cliente_doc && venta.cliente_doc.includes(this.busqueda));

      const matchEstado = this.estadoSeleccionado === 'TODOS' || 
        String(venta.estado) === this.estadoSeleccionado;

      const matchTipo = this.tipoComprobanteSeleccionado === 'TODOS' || 
        venta.tipo_comprobante === this.tipoComprobanteSeleccionado;

      let matchFecha = true;
      if (this.fechaInicio && this.fechaFin) {
        const fechaVenta = new Date(venta.fec_emision);
        matchFecha = fechaVenta >= this.fechaInicio && fechaVenta <= this.fechaFin;
      } else if (this.fechaInicio) {
        matchFecha = new Date(venta.fec_emision) >= this.fechaInicio;
      } else if (this.fechaFin) {
        matchFecha = new Date(venta.fec_emision) <= this.fechaFin;
      }

      return matchBusqueda && matchEstado && matchTipo && matchFecha;
    });

    this.totalRecords = this.ventasFiltradas.length;
    this.first = 0;
  }

  limpiarFiltros(): void {
    this.busqueda = '';
    this.fechaInicio = null;
    this.fechaFin = null;
    this.estadoSeleccionado = 'TODOS';
    this.tipoComprobanteSeleccionado = 'TODOS';
    this.aplicarFiltros();
  }

  onPageChange(event: any): void {
    this.first = event.first;
    this.rows = event.rows;
  }

  verDetalle(venta: ComprobanteVenta): void {
    this.router.navigate(['/ventas/generar-venta/detalle', venta.id_comprobante]);
  }

  imprimirComprobante(venta: ComprobanteVenta): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Imprimiendo',
      detail: `Generando comprobante ${venta.serie}-${venta.numero.toString().padStart(8, '0')}...`
    });
  }

  anularVenta(venta: ComprobanteVenta): void {
    if (!venta.estado) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'Este comprobante ya está anulado'
      });
      return;
    }

    if (!this.ventasService.puedeAnular(venta.id_comprobante)) {
      this.messageService.add({
        severity: 'warn',
        summary: 'No permitido',
        detail: 'Solo se pueden anular comprobantes del día actual'
      });
      return;
    }

    this.confirmationService.confirm({
      message: `¿Está seguro de anular el comprobante ${venta.serie}-${venta.numero.toString().padStart(8, '0')}?`,
      header: 'Confirmar Anulación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, Anular',
      rejectLabel: 'Cancelar',
      accept: () => {
        const resultado = this.ventasService.anularComprobante(venta.id_comprobante);
        if (resultado) {
          venta.estado = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Venta Anulada',
            detail: 'El comprobante ha sido anulado correctamente'
          });
          this.aplicarFiltros();
        }
      }
    });
  }

  nuevaVenta(): void {
    this.router.navigate(['/ventas/generar-venta/crear']);
  }

  volver(): void {
    this.router.navigate(['/ventas/generar-venta']);
  }

  getSeverityEstado(estado: boolean): 'success' | 'danger' {
    return estado ? 'success' : 'danger';
  }

  getSeverityTipoComprobante(tipo: string): 'info' | 'warn' {
    return tipo === '03' ? 'info' : 'warn';
  }

  get totalVentas(): number {
    return this.ventasFiltradas
      .filter(v => v.estado)
      .reduce((sum, v) => sum + v.total, 0);
  }

  get totalFacturado(): number {
    return this.ventasFiltradas
      .filter(v => v.estado && v.tipo_comprobante === '01')
      .reduce((sum, v) => sum + v.total, 0);
  }

  get totalBoletas(): number {
    return this.ventasFiltradas
      .filter(v => v.estado && v.tipo_comprobante === '03')
      .reduce((sum, v) => sum + v.total, 0);
  }
}
