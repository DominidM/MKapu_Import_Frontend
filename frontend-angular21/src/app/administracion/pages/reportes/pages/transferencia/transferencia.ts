import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
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
  standalone: true,
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
export class Transferencia implements OnInit {

  transferencias: any[] = [];
  filteredTransferencias: any[] = [];
  transferenciaSuggestions: any[] = [];
  searchTerm = '';

  constructor(
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private router: Router
  ) {}

  // 🔥 SIEMPRE SE EJECUTA AL ENTRAR A LA RUTA
  ngOnInit(): void {
    this.cargarTransferencias();
  }

  // 🔁 TAMBIÉN CUANDO REGRESAS DESDE OTRA PÁGINA
  ionViewWillEnter(): void {
    this.cargarTransferencias();
  }

  cargarTransferencias(): void {
    const data = localStorage.getItem('transferencias');
    this.transferencias = data ? JSON.parse(data) : [];

    this.filteredTransferencias = [...this.transferencias];
    this.transferenciaSuggestions = [...this.transferencias];
  }

  onSearch(event: { query: string }): void {
    this.filtrar(event.query);
  }

  onSearchChange(term: string | { producto?: string } | null): void {
    this.filtrar(this.obtenerValor(term));
  }

  onSelectTransferencia(event: any): void {
    const value = this.obtenerValor(event?.value ?? this.searchTerm);
    this.searchTerm = value;
    this.filtrar(value);
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.filtrar('');
  }

  confirmDelete(transferencia: any): void {
    this.confirmationService.confirm({
      message: `¿Eliminar la transferencia ${transferencia.codigo}?`,
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.transferencias = this.transferencias.filter(
          t => t.codigo !== transferencia.codigo
        );

        localStorage.setItem(
          'transferencias',
          JSON.stringify(this.transferencias)
        );

        this.cargarTransferencias();

        this.messageService.add({
          severity: 'success',
          summary: 'Eliminada',
          detail: 'Transferencia eliminada correctamente'
        });
      }
    });
  }

  getEstadoSeverity(estado: string) {
    switch (estado.toLowerCase()) {
      case 'completada': return 'success';
      case 'pendiente': return 'warn';
      case 'en transito': return 'secondary';
      default: return 'secondary';
    }
  }

  filtrar(valor: string): void {
    const v = valor.toLowerCase();

    this.filteredTransferencias = this.transferencias.filter(t =>
      [t.codigo, t.producto, t.origen, t.destino]
        .some(campo => campo.toLowerCase().includes(v))
    );

    this.transferenciaSuggestions = [...this.filteredTransferencias];
  }

  obtenerValor(term: any): string {
    if (!term) return '';
    if (typeof term === 'string') return term;
    return term.producto ?? '';
  }

  
}
