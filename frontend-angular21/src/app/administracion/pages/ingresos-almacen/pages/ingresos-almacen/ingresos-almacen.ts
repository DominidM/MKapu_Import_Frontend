import { Component } from '@angular/core';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { TagModule } from 'primeng/tag';
import { RouterModule } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { InputNumberModule } from 'primeng/inputnumber';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';


@Component({
  selector: 'app-ingresos-almacen',
  imports: [
    CardModule,
    ButtonModule,
    FormsModule,
    TagModule,
    RouterModule,
    InputTextModule,
    SelectModule,
    CommonModule,
    TableModule,
    InputNumberModule,
    ConfirmDialogModule,
    AutoCompleteModule,
    ToastModule
  ],
  templateUrl: './ingresos-almacen.html',
  styleUrl: './ingresos-almacen.css',
  providers: [ConfirmationService, MessageService],
})
export class IngresosAlmacen {

  ingresos = [
    {
      nro_guia: 'GR-2026-001',
      fecha_de_entrada: '15/01/2026',
      proveedor: 'Tech Imports China Co.',
      nro_productos: 12,
      cant_total: 450,
      valor_total: 28500.0,
      estado: 'Almacenado',
    },
    {
      nro_guia: 'GR-2026-002',
      fecha_de_entrada: '14/01/2026',
      proveedor: 'Samsung Electronics Perú S.A.C.',
      nro_productos: 5,
      cant_total: 80,
      valor_total: 15200.0,
      estado: 'Verificado',
    },
    {
      nro_guia: 'GR-2026-003',
      fecha_de_entrada: '13/01/2026',
      proveedor: 'Global Electronics Ltd.',
      nro_productos: 8,
      cant_total: 200,
      valor_total: 18750.0,
      estado: 'Pendiente Verificación',
    },
    {
      nro_guia: 'GR-2026-004',
      fecha_de_entrada: '12/01/2026',
      proveedor: 'HP Inc. Perú',
      nro_productos: 15,
      cant_total: 125,
      valor_total: 22800.0,
      estado: 'Almacenado',
    },
    {
      nro_guia: 'GR-2026-005',
      fecha_de_entrada: '10/01/2026',
      proveedor: 'Xiaomi Technology Import S.A.C.',
      nro_productos: 20,
      cant_total: 600,
      valor_total: 35600.0,
      estado: 'Almacenado',
    },
  ];

  filteredIngresos = [...this.ingresos];
  ingresoSuggestions = [...this.ingresos];
  searchTerm = '';

  constructor(
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  onSearch(event: { query: string }): void {
    this.updateFilteredIngresos(event.query);
  }

  onSearchChange(
    term: string | { nro_guia?: string } | null
  ): void {
    this.updateFilteredIngresos(this.getSearchValue(term));
  }

  onSelectIngreso(
    event: { value?: { nro_guia?: string } } | null
  ): void {
    const value = this.getSearchValue(event?.value ?? this.searchTerm);
    this.searchTerm = value;
    this.updateFilteredIngresos(value);
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.updateFilteredIngresos('');
  }

  private updateFilteredIngresos(term: string): void {
    const value = term?.trim().toLowerCase();

    if (!value) {
      this.filteredIngresos = [...this.ingresos];
      this.ingresoSuggestions = [...this.ingresos];
      return;
    }

    this.filteredIngresos = this.ingresos.filter(ingreso =>
      [
        ingreso.nro_guia,
        ingreso.fecha_de_entrada,
        ingreso.proveedor,
      ].some(field =>
        field.toLowerCase().includes(value)
      )
    );

    this.ingresoSuggestions = [...this.filteredIngresos];
  }

  private getSearchValue(
    term: string | { nro_guia?: string } | null
  ): string {
    if (!term) return '';
    if (typeof term === 'string') return term;
    return term.nro_guia ?? '';
  }
}
