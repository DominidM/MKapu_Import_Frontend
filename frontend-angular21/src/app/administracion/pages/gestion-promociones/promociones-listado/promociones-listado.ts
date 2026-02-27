import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { PaginatorModule } from 'primeng/paginator';
import { ConfirmationService, MessageService, PaginatorState } from 'primeng/api';
import { PromocionesService, Promocion } from '../services/promociones.service';

@Component({
  selector: 'app-promociones-listado',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    ConfirmDialogModule,
    ToastModule,
    TableModule,
    TagModule,
    TooltipModule,
    PaginatorModule,
  ],
  templateUrl: './promociones-listado.html',
  styleUrl: './promociones-listado.css',
  providers: [ConfirmationService, MessageService],
})
export class PromocionesListado implements OnInit, OnDestroy {
  promociones: Promocion[] = [];
  filteredPromociones: Promocion[] = [];
  loading = false;
  searchText = '';
  selectedEstado = '';
  paginaActual = 0;
  itemsPorPagina = 10;
  totalItems = 0;
  estados = [
    { label: 'Todos', value: '' },
    { label: 'Activa', value: 'Activa' },
    { label: 'Inactiva', value: 'Inactiva' },
    { label: 'Expirada', value: 'Expirada' },
  ];
  private destroy$ = new Subject<void>();

  constructor(
    private promocionesService: PromocionesService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
  ) {}

  ngOnInit(): void {
    this.cargarPromociones();
  }

  cargarPromociones(): void {
    this.loading = true;
    const pagina = this.paginaActual + 1;
    this.promocionesService
      .getPromociones(pagina, this.itemsPorPagina)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.promociones = data.promociones;
          this.totalItems = data.total;
          this.aplicarFiltros();
          this.loading = false;
        },
        error: (error) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar promociones', });
          this.loading = false;
        },
      });
  }

  aplicarFiltros(): void {
    this.filteredPromociones = this.promociones.filter((promo) => {
      const matchSearch = promo.nombre.toLowerCase().includes(this.searchText.toLowerCase()) || promo.descripcion.toLowerCase().includes(this.searchText.toLowerCase()) || promo.codigo.toLowerCase().includes(this.searchText.toLowerCase());
      const matchEstado = !this.selectedEstado || promo.estado === this.selectedEstado;
      return matchSearch && matchEstado;
    });
  }

  onSearchChange(): void {
    this.paginaActual = 0;
    this.aplicarFiltros();
  }

  onEstadoChange(): void {
    this.paginaActual = 0;
    this.aplicarFiltros();
  }

  onPageChange(event: PaginatorState): void {
    this.paginaActual = event.first || 0;
    this.itemsPorPagina = event.rows || 10;
    this.cargarPromociones();
  }

  editarPromocion(id: number): void {
    console.log('Editar promoción:', id);
  }

  eliminarPromocion(id: number, nombre: string): void {
    this.confirmationService.confirm({
      message: `¿Deseas eliminar la promoción "${nombre}"?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.loading = true;
        this.promocionesService
          .deletePromocion(id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Promoción eliminada correctamente', });
              this.cargarPromociones();
            },
            error: () => {
              this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al eliminar la promoción', });
              this.loading = false;
            },
          });
      },
    });
  }

  obtenerSeveridadEstado(estado: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | null | undefined {
    switch (estado) {
      case 'Activa': return 'success';
      case 'Inactiva': return 'warning';
      case 'Expirada': return 'danger';
      default: return 'info';
    }
  }

  irANueva(): void {
    console.log('Crear nueva promoción');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}