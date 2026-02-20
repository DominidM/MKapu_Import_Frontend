import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
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
import {
  TransferenciaCreatorUserResponse,
  TransferenciaInterfaceResponse,
  TransferenciaProductoResponse,
  TransferenciaSedeResumenResponse,
} from '../../../../interfaces/transferencia.interface';
import { catchError, finalize, map, of } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
  changeDetection: ChangeDetectionStrategy.OnPush,
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
export class Transferencia {
  private readonly destroyRef = inject(DestroyRef);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);
  private readonly transferenciaService = inject(TransferenciaService);

  private readonly transferenciasSig = signal<TransferenciaRow[]>([]);
  private readonly searchTermSig = signal('');
  private readonly estadoFilterSig = signal<string | null>(null);
  private readonly solicitudFilterSig = signal<string | null>(null);
  private readonly loadingSig = signal(false);

  private readonly filteredTransferenciasSig = computed(() => {
    const v = this.searchTermSig().toLowerCase();
    const estado = this.estadoFilterSig();
    const solicitud = this.solicitudFilterSig();

    return this.transferenciasSig().filter((t) => {
      const matchesText = [t.codigo, t.producto, t.origen, t.destino, t.responsable, t.solicitud].some(
        (campo) => campo.toLowerCase().includes(v),
      );
      const matchesEstado = estado ? t.estado === estado : true;
      const matchesSolicitud = solicitud
        ? t.solicitud.toLowerCase().startsWith(solicitud.toLowerCase())
        : true;
      return matchesText && matchesEstado && matchesSolicitud;
    });
  });

  readonly estadoOptions = [
    { label: 'Todos', value: null },
    { label: 'SOLICITADA', value: 'SOLICITADA' },
    { label: 'APROBADA', value: 'APROBADA' },
    { label: 'RECHAZADA', value: 'RECHAZADA' },
    { label: 'COMPLETADA', value: 'COMPLETADA' },
  ];

  readonly solicitudOptions = [
    { label: 'Todas', value: null },
    { label: 'Con observacion', value: 'Con observacion' },
    { label: 'Sin observacion', value: 'Sin observacion' },
  ];

  get transferencias(): TransferenciaRow[] {
    return this.transferenciasSig();
  }

  set transferencias(value: TransferenciaRow[]) {
    this.transferenciasSig.set(value ?? []);
  }

  get filteredTransferencias(): TransferenciaRow[] {
    return this.filteredTransferenciasSig();
  }

  get transferenciaSuggestions(): TransferenciaRow[] {
    return this.filteredTransferenciasSig();
  }

  get searchTerm(): string {
    return this.searchTermSig();
  }

  set searchTerm(value: string) {
    this.searchTermSig.set(value ?? '');
  }

  get estadoFilter(): string | null {
    return this.estadoFilterSig();
  }

  set estadoFilter(value: string | null) {
    this.estadoFilterSig.set(value ?? null);
  }

  get solicitudFilter(): string | null {
    return this.solicitudFilterSig();
  }

  set solicitudFilter(value: string | null) {
    this.solicitudFilterSig.set(value ?? null);
  }

  get loading(): boolean {
    return this.loadingSig();
  }

  set loading(value: boolean) {
    this.loadingSig.set(value);
  }

  get hasActiveFilters(): boolean {
    return !!(this.searchTermSig() || this.estadoFilterSig() || this.solicitudFilterSig());
  }

  ngOnInit(): void {
    this.cargarTransferencias();
  }

  ionViewWillEnter(): void {
    this.cargarTransferencias();
  }

  cargarTransferencias(): void {
    this.loading = true;

    this.transferenciaService
      .getTransferencias()
      .pipe(
        map((response) => (Array.isArray(response) ? response : [])),
        map((lista) => lista.map((transferencia) => this.mapTransferencia(transferencia))),
        catchError((error) => {
          console.error('Error al cargar transferencias:', error);
          this.transferencias = [];
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron cargar las transferencias',
          });
          return of([] as TransferenciaRow[]);
        }),
        finalize(() => {
          this.loading = false;
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((rows) => {
        this.transferencias = rows;
      });
  }

  private mapTransferencia(transferencia: TransferenciaInterfaceResponse): TransferenciaRow {
    const fechaEnvio = this.formatearFecha(transferencia.requestDate);
    const producto = this.getProductoNombre(transferencia);
    const responsable = this.getResponsableNombre(this.getCreatorUser(transferencia.creatorUser));
    const observacion = transferencia.observation?.trim() || '-';
    const solicitud = transferencia.observation?.trim() ? 'Con observacion' : 'Sin observacion';

    return {
      codigo: String(transferencia.id),
      producto,
      origen: this.getSedeNombre(transferencia.origin, transferencia.originHeadquartersId),
      destino: this.getSedeNombre(transferencia.destination, transferencia.destinationHeadquartersId),
      cantidad: transferencia.totalQuantity ?? 0,
      solicitud: `${solicitud}: ${observacion}`,
      responsable,
      estado: this.mapEstado(transferencia.status),
      fechaEnvio,
      fechaLlegada: '-',
    };
  }

  private getCreatorUser(
    creator: TransferenciaCreatorUserResponse | TransferenciaCreatorUserResponse[] | undefined,
  ): TransferenciaCreatorUserResponse | undefined {
    if (!creator) return undefined;
    return Array.isArray(creator) ? creator[0] : creator;
  }

  private getProductoNombre(transferencia: TransferenciaInterfaceResponse): string {
    const nombrePlano = transferencia.nomProducto?.trim();
    if (nombrePlano) return nombrePlano;
    const producto = this.getProductoFromItems(transferencia);
    return producto?.nomProducto || producto?.descripcion || producto?.codigo || '-';
  }

  private getProductoFromItems(
    transferencia: TransferenciaInterfaceResponse,
  ): TransferenciaProductoResponse | undefined {
    const producto = transferencia.items?.[0]?.producto;
    if (!producto) return undefined;
    return Array.isArray(producto) ? producto[0] : producto;
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

  private getSedeNombre(
    sede: TransferenciaSedeResumenResponse | undefined,
    legacyId: string | null | undefined,
  ): string {
    const nombre = sede?.nomSede?.trim();
    if (nombre) return nombre;
    if (legacyId) return String(legacyId);
    return '-';
  }

  private mapEstado(estado: string | null | undefined): string {
    if (!estado) return 'SOLICITADA';
    const normalizado = estado.toLowerCase();
    if (normalizado.includes('solicit')) return 'SOLICITADA';
    if (normalizado.includes('aprob')) return 'APROBADA';
    if (normalizado.includes('rech')) return 'RECHAZADA';
    if (normalizado.includes('complet')) return 'COMPLETADA';
    return String(estado).toUpperCase();
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

  onSelectTransferencia(event: { value?: string | { producto?: string } } | null): void {
    const value = this.obtenerValor(event?.value ?? this.searchTerm);
    this.searchTerm = value;
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.estadoFilter = null;
    this.solicitudFilter = null;
  }

  confirmDelete(transferencia: TransferenciaRow): void {
    this.confirmationService.confirm({
      message: `¿Eliminar la transferencia ${transferencia.codigo}?`,
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.transferencias = this.transferencias.filter((t) => t.codigo !== transferencia.codigo);
        this.messageService.add({
          severity: 'success',
          summary: 'Eliminada',
          detail: 'Transferencia eliminada correctamente',
        });
      },
    });
  }

  getEstadoSeverity(estado: string): 'success' | 'warn' | 'info' | 'danger' | 'secondary' {
    switch (estado.toLowerCase()) {
      case 'completada':
        return 'success';
      case 'solicitada':
        return 'warn';
      case 'aprobada':
        return 'info';
      case 'rechazada':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  filtrar(valor: string): void {
    this.searchTerm = valor || '';
  }

  obtenerValor(term: string | { producto?: string } | null | undefined): string {
    if (!term) return '';
    if (typeof term === 'string') return term;
    return term.producto ?? '';
  }
}
