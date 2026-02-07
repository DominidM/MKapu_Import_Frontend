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
import { ProductosService } from '../../../../../core/services/productos.service';
import { SedeService } from '../../../../../core/services/sede.service';

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
    ToastModule,
  ],
  templateUrl: './transferencia.html',
  styleUrl: './transferencia.css',
  providers: [ConfirmationService, MessageService],
})
export class Transferencia implements OnInit {
  transferencias: any[] = [];
  filteredTransferencias: any[] = [];
  transferenciaSuggestions: any[] = [];
  searchTerm = '';
  estadoFilter: string | null = null;
  sedes: { label: string; value: string }[] = [];
  estadoOptions = [
    { label: 'Todos', value: null },
    { label: 'Pendiente', value: 'Pendiente' },
    { label: 'En transito', value: 'En transito' },
    { label: 'Completada', value: 'Completada' },
    { label: 'Incidencia', value: 'Incidencia' },
  ];

  constructor(
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private router: Router,
    private productosService: ProductosService,
    private sedeService: SedeService,
  ) {}

  // 🔥 SIEMPRE SE EJECUTA AL ENTRAR A LA RUTA
  ngOnInit(): void {
    this.cargarSedes();
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
      this.transferencias = this.crearTransferenciasIniciales();
      localStorage.setItem('transferencias', JSON.stringify(this.transferencias));
    }

    this.filteredTransferencias = [...this.transferencias];
    this.transferenciaSuggestions = [...this.transferencias];
  }

  private cargarSedes(): void {
    this.sedeService.getSedes().subscribe({
      next: (sedes) => {
        this.sedes = sedes.map((sede) => ({
          label: sede.nombre,
          value: sede.id_sede,
        }));
        this.cargarTransferencias();
      },
      error: (error) => {
        console.error('Error al cargar sedes:', error);
        this.cargarTransferencias();
      },
    });
  }

  private crearTransferenciasIniciales(): any[] {
    const productos = this.productosService.getProductos(undefined, 'Activo');
    const sedesDisponibles =
      this.sedes.length > 0
        ? this.sedes
        : [
            { label: 'SEDE001', value: 'SEDE001' },
            { label: 'SEDE002', value: 'SEDE002' },
            { label: 'SEDE003', value: 'SEDE003' },
          ];
    const sedeLabelMap = new Map(sedesDisponibles.map((sede) => [sede.value, sede.label]));
    const hoy = new Date();

    return productos.slice(0, 3).map((producto, index) => {

      const origen = producto.sede ? sedeLabelMap.get(producto.sede) || producto.sede : 'Sin sede';

      const destino = sedesDisponibles.find((sede) => sede.value !== producto.sede)?.label || '-';
      const fechaEnvio = this.formatearFecha(
        new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - (index + 2)),
      );
      const fechaLlegada = this.formatearFecha(
        new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - index),
      );

      return {
        codigo: `TRF-${hoy.getFullYear()}-${String(index + 1).padStart(4, '0')}`,
        producto: producto.nombre,
        origen,
        destino,
        cantidad: Math.min(10 + index * 5, producto.stock ?? 0),
        responsable: 'Jefatura de almacen',
        estado: index === 0 ? 'En transito' : index === 1 ? 'Pendiente' : 'Completada',
        fechaEnvio,
        fechaLlegada,
      };
    });
  }

  private formatearFecha(fecha: Date): string {
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const anio = fecha.getFullYear();
    return `${dia}/${mes}/${anio}`;
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
        this.transferencias = this.transferencias.filter((t) => t.codigo !== transferencia.codigo);

        localStorage.setItem('transferencias', JSON.stringify(this.transferencias));

        this.cargarTransferencias();

        this.messageService.add({
          severity: 'success',
          summary: 'Eliminada',
          detail: 'Transferencia eliminada correctamente',
        });
      },
    });
  }

  getEstadoSeverity(estado: string) {
    switch (estado.toLowerCase()) {
      case 'completada':
        return 'success';
      case 'pendiente':
        return 'warn';
      case 'en transito':
        return 'secondary';
      default:
        return 'secondary';
    }
  }

  filtrar(valor: string): void {
    const v = valor.toLowerCase();

    this.filteredTransferencias = this.transferencias.filter((t) => {
      const matchesText = [t.codigo, t.producto, t.origen, t.destino].some((campo) =>
        campo.toLowerCase().includes(v),
      );
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
