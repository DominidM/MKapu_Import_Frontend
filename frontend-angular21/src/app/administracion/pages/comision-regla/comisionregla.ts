import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { RouterModule } from '@angular/router';

interface Familia {
  label: string;
  value: string;
}

@Component({
  selector: 'app-comision-regla',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    AutoCompleteModule,
    CheckboxModule,
    InputTextModule,
    RouterModule
  ],
  templateUrl: './comisionregla.html',
  styleUrls: ['./comisionregla.css']
})
export class ComisionRegla {

  /* =========================
     AUTOCOMPLETE
  ========================== */
  familias: Familia[] = [
    { label: 'Electrónica', value: 'electronica' },
    { label: 'Hogar', value: 'hogar' },
    { label: 'Moda', value: 'moda' },
    { label: 'Deportes', value: 'deportes' },
    { label: 'Oficina', value: 'oficina' }
  ];

  familiasFiltradas: Familia[] = [];
  familiaSeleccionada!: Familia;

  filtrarFamilias(event: any) {
    const query = event.query.toLowerCase();
    this.familiasFiltradas = this.familias.filter(f =>
      f.label.toLowerCase().includes(query)
    );
  }

  /* =========================
     TIPO DE VENTA
  ========================== */
  tipoVenta: 'general' | 'remate' | 'unitarias' = 'general';

  /* =========================
     CHECKBOX SWITCH
  ========================== */
  comisionPorLote = false;

  /* =========================
     MONTO
  ========================== */
  montoComision: number | null = null;

  /* =========================
     ACCIONES
  ========================== */
  guardarRegla() {
    console.log({
      familia: this.familiaSeleccionada,
      tipoVenta: this.tipoVenta,
      comisionPorLote: this.comisionPorLote,
      monto: this.montoComision
    });
  }

  cancelar() {
    history.back();
  }
}
