import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { SelectModule } from 'primeng/select';
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
    SelectModule,
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
  estadoFilter: string | null = null;
  estadoOptions = [
    { label: 'Todos', value: null },
    { label: 'Pendiente', value: 'Pendiente' },
    { label: 'En transito', value: 'En transito' },
    { label: 'Completada', value: 'Completada' },
    { label: 'Incidencia', value: 'Incidencia' }
  ];

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
    if (data) {
      this.transferencias = JSON.parse(data);
    } else {
      this.transferencias = [
        {
          codigo: 'TRF-2025-0012',
          producto: 'Cable HDMI 2m',
          origen: 'Flores 15 - San Juan Lurigancho',
          destino: 'Lurin',
          cantidad: 40,
          responsable: 'Jefatura de almacen',
          estado: 'En transito',
          fechaEnvio: '12/02/2025',
          fechaLlegada: '14/02/2025'
        },
        {
          codigo: 'TRF-2025-0013',
          producto: 'Router WiFi AX3000',
          origen: 'Lurin',
          destino: 'San Borja',
          cantidad: 15,
          responsable: 'Supervisor de sede',
          estado: 'Pendiente',
          fechaEnvio: '15/02/2025',
          fechaLlegada: '16/02/2025'
        },
        {
          codigo: 'TRF-2025-0014',
          producto: 'Monitor 24\" IPS',
          origen: 'San Borja',
          destino: 'Flores 15 - San Juan Lurigancho',
          cantidad: 8,
          responsable: 'Encargado de despacho',
          estado: 'Completada',
          fechaEnvio: '05/02/2025',
          fechaLlegada: '06/02/2025'
        }
      ];
      localStorage.setItem('transferencias', JSON.stringify(this.transferencias));
    }

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
    this.estadoFilter = null;
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

    this.filteredTransferencias = this.transferencias.filter(t => {
      const matchesText = [t.codigo, t.producto, t.origen, t.destino]
        .some(campo => campo.toLowerCase().includes(v));
      const matchesEstado = this.estadoFilter ? t.estado === this.estadoFilter : true;
      return matchesText && matchesEstado;
    });

    this.transferenciaSuggestions = [...this.filteredTransferencias];
  }

  obtenerValor(term: any): string {
    if (!term) return '';
    if (typeof term === 'string') return term;
    return term.producto ?? '';
  }

  
}
