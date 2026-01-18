import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';

@Component({
  selector: 'app-transferencia',
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    CardModule,
    ButtonModule,
    AutoCompleteModule,
    TableModule,
    TagModule,
    ConfirmDialogModule,
    ToastModule
  ],
  templateUrl: './transferencia.html',
  styleUrl: './transferencia.css',
  providers: [ConfirmationService, MessageService]
})
export class Transferencia {
  transferencias = [
    {
      codigo: 'TRF-1001',
      producto: 'Cable HDMI 2m',
      origen: 'Flores 15',
      destino: 'Lurin',
      cantidad: 20,
      estado: 'En transito',
      fecha: '12/09/2024'
    },
    {
      codigo: 'TRF-1002',
      producto: 'Teclado Mecanico RGB',
      origen: 'Callao',
      destino: 'Ate',
      cantidad: 12,
      estado: 'Pendiente',
      fecha: '13/09/2024'
    },
    {
      codigo: 'TRF-1003',
      producto: 'Mouse Inalambrico',
      origen: 'Lurin',
      destino: 'Flores 15',
      cantidad: 30,
      estado: 'Completada',
      fecha: '14/09/2024'
    },
    {
      codigo: 'TRF-1004',
      producto: 'Impresora Termica',
      origen: 'Ate',
      destino: 'Callao',
      cantidad: 4,
      estado: 'En transito',
      fecha: '15/09/2024'
    }
  ];
  filteredTransferencias = [...this.transferencias];
  transferenciaSuggestions = [...this.transferencias];
  searchTerm = '';

  constructor(
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  onSearch(event: { query: string }): void {
    this.updateFilteredTransferencias(event.query);
  }

  onSearchChange(term: string | { producto?: string } | null): void {
    this.updateFilteredTransferencias(this.getSearchValue(term));
  }

  onSelectTransferencia(event: { value?: { producto?: string } } | null): void {
    const value = this.getSearchValue(event?.value ?? this.searchTerm);
    this.searchTerm = value;
    this.updateFilteredTransferencias(value);
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.updateFilteredTransferencias('');
  }

  confirmDelete(transferencia: { codigo: string; producto: string }): void {
    this.confirmationService.confirm({
      header: 'Confirmacion',
      message: `¿Seguro que deseas eliminar la transferencia ${transferencia.codigo}?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonProps: {
        severity: 'danger'
      },
      rejectButtonProps: {
        severity: 'secondary',
        outlined: true
      },
      accept: () => {
        this.transferencias = this.transferencias.filter(item => item.codigo !== transferencia.codigo);
        this.updateFilteredTransferencias(this.searchTerm);
        this.messageService.add({
          severity: 'success',
          summary: 'Transferencia eliminada',
          detail: `Se elimino la transferencia ${transferencia.codigo}.`
        });
      }
    });
  }

  getEstadoSeverity(estado: string): 'success' | 'warn' | 'danger' | 'secondary' {
    switch (estado.toLowerCase()) {
      case 'completada':
        return 'success';
      case 'en transito':
        return 'secondary';
      case 'pendiente':
        return 'warn';
      default:
        return 'secondary';
    }
  }

  private updateFilteredTransferencias(term: string): void {
    const value = term?.trim().toLowerCase();

    if (!value) {
      this.filteredTransferencias = [...this.transferencias];
      this.transferenciaSuggestions = [...this.transferencias];
      return;
    }

    this.filteredTransferencias = this.transferencias.filter(transferencia =>
      [
        transferencia.codigo,
        transferencia.producto,
        transferencia.origen,
        transferencia.destino
      ].some(field => field.toLowerCase().includes(value))
    );
    this.transferenciaSuggestions = [...this.filteredTransferencias];
  }

  private getSearchValue(term: string | { producto?: string } | null): string {
    if (!term) {
      return '';
    }

    if (typeof term === 'string') {
      return term;
    }

    return term.producto ?? '';
  }
}
