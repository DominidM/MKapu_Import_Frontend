import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TransferenciaService } from '../../../../services/transferencia.service';
import { SedeService } from '../../../../services/sede.service';
import {
  TransferenciaCreatorUserResponse,
  TransferenciaInterfaceResponse,
} from '../../../../interfaces/transferencia.interface';
import { Headquarter } from '../../../../interfaces/sedes.interface';
import { finalize, forkJoin, map } from 'rxjs';

interface TransferenciaRow {
  codigo: string;
  producto: string;
  origen: string;
  destino: string;
  cantidad: number;
  solicitud: string;
  responsable: string;
  estado: string;
  fechaEnvio: string;
  fechaLlegada: string;
}

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
  transferencias: TransferenciaRow[] = [];
  filteredTransferencias: TransferenciaRow[] = [];
  transferenciaSuggestions: TransferenciaRow[] = [];
  searchTerm = '';
  estadoFilter: string | null = null;
  solicitudFilter: string | null = null;
  loading = false;
  private sedeNombrePorId = new Map<string, string>();
  estadoOptions = [
    { label: 'Todos', value: null },
    { label: 'Pendiente', value: 'Pendiente' },
    { label: 'En transito', value: 'En transito' },
    { label: 'Completada', value: 'Completada' },
    { label: 'Incidencia', value: 'Incidencia' },
  ];
  solicitudOptions = [
    { label: 'Todas', value: null },
    { label: 'Con observacion', value: 'Con observacion' },
    { label: 'Sin observacion', value: 'Sin observacion' },
  ];

  constructor(
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private transferenciaService: TransferenciaService,
    private sedeService: SedeService,
    private cdr: ChangeDetectorRef,
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
    this.loading = true;
    const sedes$ = this.sedeService.getSedes().pipe(
      map((response) => (Array.isArray(response) ? response : response?.headquarters ?? [])),
    );

    forkJoin({
      transferencias: this.transferenciaService.getTransferencias(),
      sedes: sedes$,
    })
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: ({ transferencias, sedes }) => {
          const lista = Array.isArray(transferencias) ? transferencias : [];
          this.indexarSedes(sedes);
          this.transferencias = lista.map((t) => this.mapTransferencia(t));
          this.filteredTransferencias = [...this.transferencias];
          this.transferenciaSuggestions = [...this.transferencias];
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error al cargar transferencias:', error);
          this.transferencias = [];
          this.filteredTransferencias = [];
          this.transferenciaSuggestions = [];
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron cargar las transferencias',
          });
          this.cdr.detectChanges();
        },
      });
  }

  private mapTransferencia(transferencia: TransferenciaInterfaceResponse): TransferenciaRow {
    const fechaEnvio = this.formatearFecha(transferencia.requestDate);
    const producto = transferencia.items?.[0]?.producto?.[0];
    const responsable = this.getResponsableNombre(transferencia.creatorUser?.[0]);
    const observacion = transferencia.observation?.trim() || '-';
    const solicitud = transferencia.observation?.trim() ? 'Con observacion' : 'Sin observacion';

    return {
      codigo: String(transferencia.id),
      producto: producto?.anexo || producto?.descripcion || producto?.codigo || '-',
      origen: this.getSedeNombre(transferencia.originHeadquartersId),
      destino: this.getSedeNombre(transferencia.destinationHeadquartersId),
      cantidad: transferencia.totalQuantity ?? 0,
      solicitud: `${solicitud}: ${observacion}`,
      responsable,
      estado: this.mapEstado(transferencia.status),
      fechaEnvio,
      fechaLlegada: '-',
    };
  }

  private getResponsableNombre(creator: TransferenciaCreatorUserResponse | undefined): string {
    if (!creator) return '-';

    const nombre = creator.usuNom || creator.nombres || '';
    const apellidos = creator.apellidos || [creator.apePat, creator.apeMat].filter(Boolean).join(' ');
    const fullName = [nombre, apellidos].filter(Boolean).join(' ').trim();
    const idLabel = creator.idUsuario ? `#${creator.idUsuario}` : '';

    if (fullName && idLabel) {
      return `${idLabel} - ${fullName}`;
    }
    if (fullName) return fullName;
    if (idLabel) return `Usuario ${idLabel}`;
    return '-';
  }

  private indexarSedes(sedes: Headquarter[]): void {
    this.sedeNombrePorId.clear();
    sedes.forEach((sede) => {
      this.sedeNombrePorId.set(String(sede.id_sede), sede.nombre);
    });
  }

  private getSedeNombre(id: string | null | undefined): string {
    if (!id) return '-';
    return this.sedeNombrePorId.get(String(id)) ?? String(id);
  }

  private mapEstado(estado: string | null | undefined): string {
    if (!estado) return 'Pendiente';
    const normalizado = estado.toLowerCase();
    if (normalizado.includes('aprob')) return 'En transito';
    if (normalizado.includes('complet')) return 'Completada';
    if (normalizado.includes('inci')) return 'Incidencia';
    if (normalizado.includes('pende')) return 'Pendiente';
    return estado;
  }

  private formatearFecha(iso: string | null | undefined): string {
    if (!iso) return '-';
    const fecha = new Date(iso);
    if (Number.isNaN(fecha.getTime())) return '-';
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
    this.solicitudFilter = null;
    this.filtrar('');
  }

  get hasActiveFilters(): boolean {
    return !!(this.searchTerm || this.estadoFilter || this.solicitudFilter);
  }

  confirmDelete(transferencia: any): void {
    this.confirmationService.confirm({
      message: `¿Eliminar la transferencia ${transferencia.codigo}?`,
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.transferencias = this.transferencias.filter((t) => t.codigo !== transferencia.codigo);
        this.filteredTransferencias = [...this.transferencias];
        this.transferenciaSuggestions = [...this.transferencias];

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
      const matchesText = [t.codigo, t.producto, t.origen, t.destino, t.responsable, t.solicitud]
        .some((campo) => campo.toLowerCase().includes(v));
      const matchesEstado = this.estadoFilter ? t.estado === this.estadoFilter : true;
      const matchesSolicitud = this.solicitudFilter
        ? t.solicitud.toLowerCase().startsWith(this.solicitudFilter.toLowerCase())
        : true;
      return matchesText && matchesEstado && matchesSolicitud;
    });

    this.transferenciaSuggestions = [...this.filteredTransferencias];
  }

  obtenerValor(term: any): string {
    if (!term) return '';
    if (typeof term === 'string') return term;
    return term.producto ?? '';
  }
}
