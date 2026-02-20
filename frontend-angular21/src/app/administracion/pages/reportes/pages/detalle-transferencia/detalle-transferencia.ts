import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { catchError, finalize, forkJoin, map, of, switchMap, throwError } from 'rxjs';
import {
  TransferStatus,
  TransferTargetStatus,
  TransferenciaCreatorUserResponse,
  TransferenciaBulkStatusRequest,
  TransferenciaInterfaceResponse,
  TransferenciaItemResponse,
  TransferenciaProductoCategoriaResponse,
  TransferenciaProductoResponse,
} from '../../../../interfaces/transferencia.interface';
import { TransferenciaService } from '../../../../services/transferencia.service';
import { SedeService } from '../../../../services/sede.service';
import { Headquarter } from '../../../../interfaces/sedes.interface';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

interface TransferenciaDetalle {
  codigo: string;
  producto: string;
  productoCodigo: string;
  productoDescripcion: string;
  productoCategoria: string;
  origen: string;
  destino: string;
  almacenOrigen: string;
  almacenDestino: string;
  cantidad: number;
  responsable: string;
  estado: string;
  fechaEnvio: string;
  fechaLlegada: string;
  observacion?: string;
}

interface TransferenciaDetalleItem {
  producto: string;
  codigo: string;
  categoria: string;
  cantidad: number;
  series: string;
  seriesList: string[];
}

@Component({
  selector: 'app-detalle-transferencia',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,
    CardModule,
    ButtonModule,
    TagModule,
    DividerModule,
    ToastModule,
  ],
  templateUrl: './detalle-transferencia.html',
  styleUrl: './detalle-transferencia.css',
  providers: [MessageService],
})
export class DetalleTransferencia implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly transferenciaService = inject(TransferenciaService);
  private readonly sedeService = inject(SedeService);
  private readonly messageService = inject(MessageService);

  private readonly transferenciaSig = signal<TransferenciaDetalle | null>(null);
  private readonly detalleItemsSig = signal<TransferenciaDetalleItem[]>([]);
  private readonly codigoSig = signal('');
  private readonly loadingSig = signal(false);
  private readonly submittingDecisionSig = signal(false);
  private readonly errorMensajeSig = signal('');

  private readonly canResolverSolicitudSig = computed(() => {
    const transferencia = this.transferenciaSig();
    if (!transferencia) return false;
    return transferencia.estado.toLowerCase().includes('solicit') && this.isUsuarioSedeDestino();
  });

  private readonly canCompletarSolicitudSig = computed(() => {
    const transferencia = this.transferenciaSig();
    if (!transferencia) return false;
    return transferencia.estado.toLowerCase().includes('aprob') && this.isUsuarioSedeDestino();
  });

  private readonly sedeNombrePorId = new Map<string, string>();
  private transferenciaActual: TransferenciaInterfaceResponse | null = null;

  get transferencia(): TransferenciaDetalle | null {
    return this.transferenciaSig();
  }

  set transferencia(value: TransferenciaDetalle | null) {
    this.transferenciaSig.set(value);
  }

  get detalleItems(): TransferenciaDetalleItem[] {
    return this.detalleItemsSig();
  }

  set detalleItems(value: TransferenciaDetalleItem[]) {
    this.detalleItemsSig.set(value ?? []);
  }

  get codigo(): string {
    return this.codigoSig();
  }

  set codigo(value: string) {
    this.codigoSig.set(value ?? '');
  }

  get loading(): boolean {
    return this.loadingSig();
  }

  set loading(value: boolean) {
    this.loadingSig.set(value);
  }

  get submittingDecision(): boolean {
    return this.submittingDecisionSig();
  }

  set submittingDecision(value: boolean) {
    this.submittingDecisionSig.set(value);
  }

  get errorMensaje(): string {
    return this.errorMensajeSig();
  }

  set errorMensaje(value: string) {
    this.errorMensajeSig.set(value ?? '');
  }

  get canResolverSolicitud(): boolean {
    return this.canResolverSolicitudSig();
  }

  get canCompletarSolicitud(): boolean {
    return this.canCompletarSolicitudSig();
  }

  ngOnInit(): void {
    const rawCodigo =
      this.route.snapshot.queryParamMap.get('codigo') ??
      this.route.snapshot.queryParamMap.get('id') ??
      this.route.snapshot.paramMap.get('id') ??
      '';
    this.codigo = this.normalizarCodigo(rawCodigo);
    this.cargarDetalle(this.codigo);
  }

  cargarDetalle(id: string): void {
    if (!id) {
      this.errorMensaje = 'No se recibió el identificador de la transferencia';
      this.transferencia = null;
      return;
    }

    this.loading = true;
    this.errorMensaje = '';

    const sedes$ = this.sedeService.getSedes().pipe(
      map((response) => (Array.isArray(response) ? response : response?.headquarters ?? [])),
      catchError((error) => {
        console.error('Error al cargar sedes para detalle:', error);
        return of([] as Headquarter[]);
      }),
    );

    const transferencia$ = this.transferenciaService.getTransferenciaById(id).pipe(
      catchError((error) => {
        console.warn('Fallo GET /transfer/:id, se intentara fallback con listado:', error);
        return this.transferenciaService.getTransferencias().pipe(
          map((lista) => (Array.isArray(lista) ? lista : [])),
          map((lista) => lista.find((item) => String(item.id) === id)),
          switchMap((item) => {
            if (item) return of(item);
            return throwError(() => error);
          }),
        );
      }),
    );

    forkJoin({
      transferencia: transferencia$,
      sedes: sedes$,
    })
      .pipe(
        finalize(() => {
          this.loading = false;
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: ({ transferencia, sedes }) => {
          this.indexarSedes(sedes);
          this.transferenciaActual = transferencia;
          this.transferencia = this.mapTransferencia(transferencia);
          this.detalleItems = this.mapDetalleItems(transferencia.items ?? []);
        },
        error: (error) => {
          console.error('Error al cargar detalle de transferencia:', error);
          this.transferenciaActual = null;
          this.transferencia = null;
          this.detalleItems = [];
          this.errorMensaje = `No se pudo cargar el detalle de la transferencia (HTTP ${error?.status ?? 'N/A'})`;
        },
      });
  }

  private normalizarCodigo(raw: string | null | undefined): string {
    if (!raw) return '';
    return String(raw).replace('#', '').trim();
  }

  volver(): void {
    this.router.navigate(['/admin/transferencia']);
  }

  private indexarSedes(sedes: Headquarter[]): void {
    this.sedeNombrePorId.clear();
    sedes.forEach((sede) => {
      this.sedeNombrePorId.set(String(sede.id_sede), sede.nombre);
    });
  }

  private mapTransferencia(transferencia: TransferenciaInterfaceResponse): TransferenciaDetalle {
    const primerItem = transferencia.items?.[0];
    const primerProducto = this.getProductoFromItem(primerItem);
    const categoria = this.getCategoriaNombre(primerProducto?.categoria);

    return {
      codigo: String(transferencia.id),
      producto: primerProducto?.nomProducto || primerProducto?.descripcion || primerProducto?.codigo || '-',
      productoCodigo: primerProducto?.codigo || '-',
      productoDescripcion: primerProducto?.descripcion || '-',
      productoCategoria: categoria,
      origen: this.getSedeNombre(transferencia.origin?.id_sede ?? transferencia.originHeadquartersId),
      destino: this.getSedeNombre(
        transferencia.destination?.id_sede ?? transferencia.destinationHeadquartersId,
      ),
      almacenOrigen: this.getWarehouseNombre(
        transferencia.originWarehouse?.nomAlm,
        transferencia.originWarehouse?.id_almacen ?? transferencia.originWarehouseId,
      ),
      almacenDestino: this.getWarehouseNombre(
        transferencia.destinationWarehouse?.nomAlm,
        transferencia.destinationWarehouse?.id_almacen ?? transferencia.destinationWarehouseId,
      ),
      cantidad: transferencia.totalQuantity ?? 0,
      responsable: this.getResponsableNombre(this.getCreatorUser(transferencia.creatorUser)),
      estado: this.mapEstado(transferencia.status),
      fechaEnvio: this.formatearFecha(transferencia.requestDate),
      fechaLlegada: '-',
      observacion: transferencia.observation?.trim() || '-',
    };
  }

  private mapDetalleItems(items: TransferenciaItemResponse[]): TransferenciaDetalleItem[] {
    if (!items?.length) return [];

    return items.map((item) => {
      const producto = this.getProductoFromItem(item);
      const categoria = this.getCategoriaNombre(producto?.categoria);

      return {
        producto: producto?.nomProducto || producto?.descripcion || '-',
        codigo: producto?.codigo || '-',
        categoria,
        cantidad: item.quantity ?? 0,
        series: item.series?.length ? item.series.join(', ') : '-',
        seriesList: item.series ?? [],
      };
    });
  }

  private getProductoFromItem(
    item: TransferenciaItemResponse | undefined,
  ): TransferenciaProductoResponse | undefined {
    if (!item?.producto) return undefined;
    return Array.isArray(item.producto) ? item.producto[0] : item.producto;
  }

  private getCategoriaNombre(
    categoria:
      | TransferenciaProductoCategoriaResponse
      | TransferenciaProductoCategoriaResponse[]
      | undefined,
  ): string {
    if (!categoria) return '-';
    if (Array.isArray(categoria)) return categoria[0]?.nombre || '-';
    return categoria.nombre || '-';
  }

  private getSedeNombre(id: string | null | undefined): string {
    if (!id) return '-';
    return this.sedeNombrePorId.get(String(id)) ?? String(id);
  }

  private getWarehouseNombre(nombre: string | null | undefined, id: number | null | undefined): string {
    const nom = nombre?.trim();
    if (nom) return nom;
    if (id !== null && id !== undefined) return String(id);
    return '-';
  }

  private mapEstado(estado: string | null | undefined): string {
    if (!estado) return 'Pendiente';
    const normalizado = estado.toLowerCase();
    if (normalizado.includes('solicit')) return 'SOLICITADA';
    if (normalizado.includes('aprob')) return 'APROBADA';
    if (normalizado.includes('rech')) return 'RECHAZADA';
    if (normalizado.includes('complet')) return 'COMPLETADA';
    if (normalizado.includes('inci')) return 'INCIDENCIA';
    if (normalizado.includes('pende')) return 'PENDIENTE';
    return estado;
  }

  private formatearFecha(iso: string | null | undefined): string {
    if (!iso) return '-';
    const fecha = new Date(iso);
    if (Number.isNaN(fecha.getTime())) return '-';
    return fecha.toLocaleString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  private getCreatorUser(
    creator: TransferenciaCreatorUserResponse | TransferenciaCreatorUserResponse[] | undefined,
  ): TransferenciaCreatorUserResponse | undefined {
    if (!creator) return undefined;
    return Array.isArray(creator) ? creator[0] : creator;
  }

  private getResponsableNombre(creator: TransferenciaCreatorUserResponse | undefined): string {
    if (!creator) return '-';
    const nombre = creator.usuNom || creator.nombres || '';
    const apellidos = creator.apellidos || [creator.apePat, creator.apeMat].filter(Boolean).join(' ');
    const fullName = [nombre, apellidos].filter(Boolean).join(' ').trim();
    const idLabel = creator.idUsuario ? `#${creator.idUsuario}` : '';

    if (fullName && idLabel) return `${idLabel} - ${fullName}`;
    if (fullName) return fullName;
    if (idLabel) return `Usuario ${idLabel}`;
    return '-';
  }

  getEstadoSeverity(estado: string): 'success' | 'warn' | 'info' | 'secondary' | 'danger' {
    switch (estado.toLowerCase()) {
      case 'completada':
        return 'success';
      case 'solicitada':
        return 'warn';
      case 'aprobada':
        return 'info';
      case 'rechazada':
        return 'danger';
      case 'pendiente':
        return 'warn';
      case 'en transito':
        return 'info';
      case 'incidencia':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  aprobarSolicitud(): void {
    this.actualizarEstadoSolicitud('APROBADA', 'TRANSFERIDO');
  }

  rechazarSolicitud(): void {
    this.actualizarEstadoSolicitud('RECHAZADA', 'DISPONIBLE');
  }

  completarSolicitud(): void {
    this.actualizarEstadoSolicitud('COMPLETADA', 'DISPONIBLE');
  }

  private actualizarEstadoSolicitud(
    transferStatus: TransferStatus,
    targetStatus: TransferTargetStatus,
  ): void {
    if (!this.transferencia || this.submittingDecision) return;

    if (!this.isUsuarioSedeDestino()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Acción no permitida',
        detail: 'Solo usuarios de la sede destino pueden gestionar esta solicitud',
      });
      return;
    }

    if (transferStatus === 'APROBADA' && !this.validarPermisosAprobacion()) {
      return;
    }

    const series = this.getSeriesPayload();
    if (!series.length) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Series no disponibles',
        detail: 'No se encontraron series para procesar la solicitud',
      });
      return;
    }

    const payload: TransferenciaBulkStatusRequest = {
      series,
      targetStatus,
      transferStatus,
    };

    this.submittingDecision = true;
    this.transferenciaService
      .patchTransferenciaStatusBulk(this.transferencia.codigo, payload)
      .pipe(
        finalize(() => {
          this.submittingDecision = false;
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Solicitud actualizada',
            detail:
              transferStatus === 'APROBADA'
                ? 'La solicitud fue aprobada correctamente'
                : transferStatus === 'COMPLETADA'
                  ? 'La solicitud fue completada correctamente'
                  : 'La solicitud fue rechazada correctamente',
          });
          this.cargarDetalle(this.codigo || this.transferencia!.codigo);
        },
        error: (error) => {
          console.error('Error al actualizar estado de la solicitud:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo actualizar el estado de la solicitud',
          });
        },
      });
  }

  private getSeriesPayload(): string[] {
    const series = this.detalleItems
      .flatMap((item) => item.seriesList ?? [])
      .map((serie) => serie?.trim())
      .filter((serie): serie is string => !!serie);

    return Array.from(new Set(series));
  }

  private validarPermisosAprobacion(): boolean {
    const user = this.getCurrentUserFromStorage();
    const userId = user?.userId;
    const userSedeId = this.normalizarId(user?.idSede);

    if (!userId) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Usuario no válido',
        detail: 'No se pudo identificar al usuario actual para aprobar la solicitud',
      });
      return false;
    }

    const creatorId = this.getTransferCreatorUserId();
    if (creatorId && String(creatorId) === String(userId)) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Aprobación no permitida',
        detail: 'El solicitante no puede aprobar su propia solicitud',
      });
      return false;
    }

    const originSedeId = this.getTransferOriginSedeId();
    if (originSedeId && userSedeId && originSedeId === userSedeId) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Aprobación no permitida',
        detail: 'Los usuarios de la sede de origen no pueden aprobar esta solicitud',
      });
      return false;
    }

    return true;
  }

  private getCurrentUserFromStorage(): { userId?: number; idSede?: number | string } | null {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      console.error('Error leyendo usuario desde localStorage:', error);
      return null;
    }
  }

  private getTransferCreatorUserId(): number | null {
    const creator = this.getCreatorUser(this.transferenciaActual?.creatorUser);
    if (!creator?.idUsuario) return null;
    return creator.idUsuario;
  }

  private getTransferOriginSedeId(): string | null {
    const rawId =
      this.transferenciaActual?.origin?.id_sede ?? this.transferenciaActual?.originHeadquartersId;
    return this.normalizarId(rawId);
  }

  private getTransferDestinationSedeId(): string | null {
    const rawId =
      this.transferenciaActual?.destination?.id_sede ?? this.transferenciaActual?.destinationHeadquartersId;
    return this.normalizarId(rawId);
  }

  private isUsuarioSedeDestino(): boolean {
    const user = this.getCurrentUserFromStorage();
    const userSedeId = this.normalizarId(user?.idSede);
    const destinationSedeId = this.getTransferDestinationSedeId();
    if (!userSedeId || !destinationSedeId) return false;
    return userSedeId === destinationSedeId;
  }

  private normalizarId(value: string | number | null | undefined): string | null {
    if (value === null || value === undefined) return null;
    const v = String(value).trim();
    return v ? v : null;
  }

  getTotalSeriesRegistradas(): number {
    return this.detalleItems.reduce((acumulado, item) => acumulado + (item.seriesList?.length ?? 0), 0);
  }
}
