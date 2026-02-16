// src/app/ventas/pages/cotizaciones/cotizaciones.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, RouterOutlet } from '@angular/router';

import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { PaginatorModule } from 'primeng/paginator';
import { InputTextModule } from 'primeng/inputtext';

import {
  MockDataService,
  CotizacionMock,
} from '../../../core/services/mock-data.service';

@Component({
  selector: 'app-cotizaciones',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    RouterOutlet,
    TableModule,
    CardModule,
    ButtonModule,
    SelectModule,
    TagModule,
    PaginatorModule,
    InputTextModule,
  ],
  templateUrl: './cotizaciones.html',
  styleUrl: './cotizaciones.css',
})
export class Cotizaciones implements OnInit {
  pageSizeOptions = [10, 20, 50];
  loading = false;

  buscarValue: string | null = null;
  estadoFiltro: string | null = null;

  estadosOptions = [
    { label: 'Todos', value: null },
    { label: 'Borrador', value: 'BORRADOR' },
    { label: 'Enviada', value: 'ENVIADA' },
    { label: 'Aceptada', value: 'ACEPTADA' },
    { label: 'Rechazada', value: 'RECHAZADA' },
  ];

  cotizaciones: CotizacionMock[] = [];
  cotizacionesFiltradas: CotizacionMock[] = [];
  cotizacionesPaginadas: CotizacionMock[] = [];

  rows = 10;
  first = 0;
  totalRecords = 0;

  constructor(
    private router: Router,
    private mockData: MockDataService,
  ) {}

  ngOnInit(): void {
    this.cotizaciones = this.mockData.getCotizaciones();
    this.aplicarFiltros();
  }

  cargarCotizaciones(): void {
    this.aplicarFiltros();
  }

  aplicarFiltros(): void {
    let lista = [...this.cotizaciones];

    if (this.estadoFiltro) {
      lista = lista.filter(c => c.estado === this.estadoFiltro);
    }

    if (this.buscarValue) {
      const q = this.buscarValue.toLowerCase();
      lista = lista.filter(
        c =>
          c.numero.toLowerCase().includes(q) ||
          c.cliente.razon_social.toLowerCase().includes(q) ||
          c.cliente.ruc.toLowerCase().includes(q),
      );
    }

    this.cotizacionesFiltradas = lista;
    this.totalRecords = lista.length;
    this.first = 0;
    this.aplicarPaginacion();
  }

  aplicarPaginacion(): void {
    this.cotizacionesPaginadas = this.cotizacionesFiltradas.slice(
      this.first,
      this.first + this.rows,
    );
  }

  onPageChange(event: any): void {
    this.first = event.first;
    this.rows = event.rows;
    this.aplicarPaginacion();
  }

  cambiarFilas(rows: number): void {
    this.rows = rows;
    this.first = 0;
    this.aplicarPaginacion();
  }

  getLast(): number {
    return Math.min(this.first + this.rows, this.totalRecords);
  }

  mapEstadoSeverity(estado: CotizacionMock['estado']) {
    switch (estado) {
      case 'ACEPTADA':
        return 'success';
      case 'RECHAZADA':
        return 'danger';
      case 'ENVIADA':
        return 'info';
      default:
        return 'warn';
    }
  }

  irNueva(): void {
    this.router.navigate(['/ventas/cotizaciones/crear']);
  }

  irDetalle(id: number): void {
    this.router.navigate(['/ventas/cotizaciones/ver-detalle', id]);
  }

  irEditar(id: number): void {
    this.router.navigate(['/ventas/cotizaciones/editar', id]);
  }

  isRutaHija(): boolean {
    const url = this.router.url;
    return (
      url.includes('crear') ||
      url.includes('editar') ||
      url.includes('ver-detalle')
    );
  }

  limpiarFiltros(): void {
    this.buscarValue = null;
    this.estadoFiltro = null;
    this.cargarCotizaciones();
  }
}
