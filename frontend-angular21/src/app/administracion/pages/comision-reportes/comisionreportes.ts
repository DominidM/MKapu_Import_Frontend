import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { AvatarModule } from 'primeng/avatar';

@Component({
  selector: 'app-comision-reportes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    AutoCompleteModule,
    TableModule,
    TagModule,
    AvatarModule
  ],
  templateUrl: './comisionreportes.html',
  styleUrls: ['./comisionreportes.css']
})
export class ComisionReportes {

  /* ================= RESUMEN ================= */
  totalPagar = 12450;
  ventasTotales = 450000;
  vendedorTop = {
    nombre: 'Juan Pérez',
    comision: 2850
  };

  /* ================= FILTROS ================= */
  filtroBusqueda = '';

  periodoSeleccionado: any;
  estadoSeleccionado: any;

  periodos = [
    { nombre: 'Este Mes', value: 'mes' },
    { nombre: 'Mes Anterior', value: 'anterior' }
  ];

  estados = [
    { nombre: 'Todos los estados', value: 'todos' },
    { nombre: 'Pagado', value: 'pagado' },
    { nombre: 'Pendiente', value: 'pendiente' },
    { nombre: 'Procesando', value: 'procesando' }
  ];

  periodosFiltrados: any[] = [];
  estadosFiltrados: any[] = [];

  /* ================= TABLA ================= */
  reportes = [
    {
      vendedor: 'Juan Pérez',
      periodo: 'Octubre 2023',
      ventas: 95000,
      porcentaje: '3.0%',
      comision: 2850,
      estado: 'Pagado'
    },
    {
      vendedor: 'Maria Rodriguez',
      periodo: 'Octubre 2023',
      ventas: 45000,
      porcentaje: '2.5%',
      comision: 1125,
      estado: 'Pendiente'
    },
    {
      vendedor: 'Carlos Ruiz',
      periodo: 'Octubre 2023',
      ventas: 28400,
      porcentaje: '2.0%',
      comision: 568,
      estado: 'Pendiente'
    },
    {
      vendedor: 'Ana Gomez',
      periodo: 'Octubre 2023',
      ventas: 62150,
      porcentaje: '2.5%',
      comision: 1553.75,
      estado: 'Procesando'
    },
    {
      vendedor: 'Roberto Diaz',
      periodo: 'Septiembre 2023',
      ventas: 38200,
      porcentaje: '2.0%',
      comision: 764,
      estado: 'Pagado'
    }
  ];

  /* ================= AUTOCOMPLETE ================= */
  filtrarPeriodos(event: any) {
    const query = event.query.toLowerCase();
    this.periodosFiltrados = this.periodos.filter(p =>
      p.nombre.toLowerCase().includes(query)
    );
  }

  filtrarEstados(event: any) {
    const query = event.query.toLowerCase();
    this.estadosFiltrados = this.estados.filter(e =>
      e.nombre.toLowerCase().includes(query)
    );
  }

}
