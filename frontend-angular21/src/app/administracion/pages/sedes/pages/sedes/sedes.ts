import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { InputNumberModule } from 'primeng/inputnumber';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-sedes',
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    CardModule,
    SelectModule,
    InputTextModule,
    TableModule,
    TagModule,
    RouterModule,
    InputNumberModule,
    ConfirmDialogModule,
    AutoCompleteModule,
    ToastModule,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './sedes.html',
  styleUrl: './sedes.css',
})
export class Sedes {
  sedes = [
    {
      codigo: 'SJL-FL15',
      nombre: 'Flores 15',
      ciudad: 'San Juan de Lurigancho',
      telefono: '+51 987654324',
      direccion: 'Av. Las Flores 15-16, Urb. Las Flores',
    },
    {
      codigo: 'LRN-26',
      nombre: 'Lurin',
      ciudad: 'Lurin',
      telefono: '+51 987654325',
      direccion: 'Av. San Pedro 890',
    },
    {
      codigo: 'CLL-04',
      nombre: 'Callao',
      ciudad: 'Callao',
      telefono: '+51 987654326',
      direccion: 'Jr. Lima 105',
    },
    {
      codigo: 'ATE-09',
      nombre: 'Ate',
      ciudad: 'Ate',
      telefono: '+51 987654327',
      direccion: 'Av. Metropolitana 220',
    },
  ];
  filteredSedes = [...this.sedes];
  sedeSuggestions = [...this.sedes];
  searchTerm = '';

  constructor(
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  onSearch(event: { query: string }): void {
    this.updateFilteredSedes(event.query);
  }

  onSearchChange(term: string | { nombre?: string } | null): void {
    this.updateFilteredSedes(this.getSearchValue(term));
  }

  onSelectSede(event: { value?: { nombre?: string } } | null): void {
    const value = this.getSearchValue(event?.value ?? this.searchTerm);
    this.searchTerm = value;
    this.updateFilteredSedes(value);
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.updateFilteredSedes('');
  }

  confirmDelete(sede: { codigo: string; nombre: string }): void {
    this.confirmationService.confirm({
      header: 'Confirmacion',
      message: `¿Seguro que deseas eliminar la sede ${sede.nombre}?`,
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
        this.sedes = this.sedes.filter(item => item.codigo !== sede.codigo);
        this.updateFilteredSedes(this.searchTerm);
        this.messageService.add({
          severity: 'success',
          summary: 'Sede eliminada',
          detail: `Se elimino la sede ${sede.nombre}.`,
        });
      },
    });
  }

  private updateFilteredSedes(term: string): void {
    const value = term?.trim().toLowerCase();

    if (!value) {
      this.filteredSedes = [...this.sedes];
      this.sedeSuggestions = [...this.sedes];
      return;
    }

    this.filteredSedes = this.sedes.filter(sede =>
      [sede.codigo, sede.nombre, sede.ciudad].some(field =>
        field.toLowerCase().includes(value)
      )
    );
    this.sedeSuggestions = [...this.filteredSedes];
  }

  private getSearchValue(term: string | { nombre?: string } | null): string {
    if (!term) {
      return '';
    }

    if (typeof term === 'string') {
      return term;
    }

    return term.nombre ?? '';
  }
}
