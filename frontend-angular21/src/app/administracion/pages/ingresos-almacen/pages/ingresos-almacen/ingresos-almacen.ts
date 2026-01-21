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
      valor_total: 28500.00,
      estado: 'Almacenado'
    },
    {
      nro_guia: 'GR-2026-002',
      fecha_de_entrada: '14/01/2026',
      proveedor: 'Samsung Electronics Perú S.A.C.',
      nro_productos: 5,
      cant_total: 80,
      valor_total: 15200.00,
      estado: 'Verificado'
    },
    {
      nro_guia: 'GR-2026-003',
      fecha_de_entrada: '13/01/2026',
      proveedor: 'Global Electronics Ltd.',
      nro_productos: 8,
      cant_total: 200,
      valor_total: 18750.00,
      estado: 'Pendiente Verificación'
    },
    {
      nro_guia: 'GR-2026-004',
      fecha_de_entrada: '12/01/2026',
      proveedor: 'HP Inc. Perú',
      nro_productos: 15,
      cant_total: 125,
      valor_total: 22800.00,
      estado: 'Almacenado'
    },
    {
      nro_guia: 'GR-2026-005',
      fecha_de_entrada: '10/01/2026',
      proveedor: 'Xiaomi Technology Import S.A.C.',
      nro_productos: 20,
      cant_total: 600,
      valor_total: 35600.00,
      estado: 'Almacenado'
    }
  ]
  filteredClientes = [...this.ingresos];
  clienteSuggestions = [...this.ingresos];
  searchTerm = '';

  constructor(
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}


  onSearch(event: { query: string }): void {
    this.updateFilteredClientes(event.query);
  }

  onSearchChange(term: string): void {
    this.updateFilteredClientes(term);
  }

  onSelectCliente(): void {
    this.updateFilteredClientes(this.searchTerm);
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.updateFilteredClientes('');
  }

private updateFilteredClientes(term: string): void {
    const value = term?.trim().toLowerCase();

    if (!value) {
      this.filteredClientes = [...this.ingresos];
      this.clienteSuggestions = [...this.ingresos];
      return;
    }

    this.filteredClientes = this.ingresos.filter(cliente =>
      [cliente.nro_guia, cliente.fecha_de_entrada, cliente.proveedor].some(field =>
        field.toLowerCase().includes(value)
      )
    );
    this.clienteSuggestions = [...this.filteredClientes];
  }
  confirmDelete(cliente: { nro_guia: string; fecha_de_entrada: string; proveedor: string; }): void {
    this.confirmationService.confirm({
      header: 'Confirmacion',
      message: `¿Seguro que deseas eliminar al cliente ${cliente.nro_guia}?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonProps: {
        severity: 'danger',
      },
      rejectButtonProps: {
        severity: 'secondary',
        outlined: true,
      },
      accept: () => {
        this.ingresos = this.ingresos.filter(item => item.nro_guia !== cliente.nro_guia);
        this.updateFilteredClientes(this.searchTerm);
        this.messageService.add({
          severity: 'success',
          summary: 'Ingreso eliminado',
          detail: `Se elimino el ingreso ${cliente.nro_guia}.`,
        });
      },
    });
  }
}
