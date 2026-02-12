import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';

/* PrimeNG */
import { ButtonModule } from 'primeng/button';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { SelectButtonModule } from 'primeng/selectbutton';
import { InputNumberModule } from 'primeng/inputnumber';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { PaginatorModule } from 'primeng/paginator';
import { RouterModule } from '@angular/router';

/* 👉 NUEVA REGLA COMPONENT */

@Component({
  selector: 'app-comision',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    AutoCompleteModule,
    SelectButtonModule,
    InputNumberModule,
    TableModule,
    TagModule,
    PaginatorModule,
    CardModule,
    RouterModule
  ],
  templateUrl: './comision.html',
  styleUrls: ['./comision.css'],
})
export class Comision {

  /* =======================
     CONTROL UI
 
  /* =======================
     AUTOCOMPLETE FAMILIAS
  ======================= */
  familias = [
    { nombre: 'Electrónica' },
    { nombre: 'Hogar' },
    { nombre: 'Ropa' },
    { nombre: 'Herramientas' },
    { nombre: 'Juguetes' },
  ];

  familiasFiltradas: any[] = [];
  familiaSeleccionada: any;

  filtrarFamilias(event: any) {
    const query = event.query.toLowerCase();
    this.familiasFiltradas = this.familias.filter(f =>
      f.nombre.toLowerCase().includes(query)
    );
  }

  /* =======================
     TIPO DE VENTA
  ======================= */
  tiposVenta = [
    { label: 'General', value: 'general' },
    { label: 'Remate', value: 'remate' },
    { label: 'Unitarias', value: 'unitarias' },
  ];

  tipoVentaSeleccionado = 'general';

  /* =======================
     FORMULARIO
  ======================= */
  comisionPorLote = false;
  montoComision = 0;

  /* =======================
     TABLA (mock)
  ======================= */
  reglas = [
    { id: 'RC-001', familia: 'Electrónica', tipo: 'General', condicion: 'Por Unidad', comision: 5.0, severity: 'info' },
    { id: 'RC-002', familia: 'Hogar', tipo: 'Remate', condicion: 'Lote (>10)', comision: 12.5, severity: 'danger' },
    { id: 'RC-003', familia: 'Ropa', tipo: 'Unitarias', condicion: 'Por Unidad', comision: 2.0, severity: 'success' },
    { id: 'RC-004', familia: 'Ropa', tipo: 'Unitarias', condicion: 'Por Unidad', comision: 2.0, severity: 'success' },
    { id: 'RC-005', familia: 'Herramientas', tipo: 'General', condicion: 'Por Unidad', comision: 6.0, severity: 'info' },
  ];

  /* =======================
     KPIs
  ======================= */
  get totalReglasActivas() {
    return this.reglas.length;
  }

  get totalCategorias() {
    return new Set(this.reglas.map(r => r.familia)).size;
  }

  get promedioComision() {
    if (!this.reglas.length) return 0;
    return this.reglas.reduce((a, r) => a + r.comision, 0) / this.reglas.length;
  }
}
