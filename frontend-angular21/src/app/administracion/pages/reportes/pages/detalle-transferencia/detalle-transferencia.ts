import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { catchError, finalize, forkJoin, map, of, switchMap, throwError } from 'rxjs';
import {
  TransferenciaCreatorUserResponse,
  TransferenciaInterfaceResponse,
  TransferenciaItemResponse,
} from '../../../../interfaces/transferencia.interface';
import { TransferenciaService } from '../../../../services/transferencia.service';
import { SedeService } from '../../../../services/sede.service';
import { Headquarter } from '../../../../interfaces/sedes.interface';

interface TransferenciaDetalle {
  codigo: string;
  producto: string;
  productoCodigo: string;
  productoAnexo: string;
  productoDescripcion: string;
  productoCategoria: string;
  origen: string;
  destino: string;
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
  imports: [
    CommonModule,
    RouterModule,
    CardModule,
    ButtonModule,
    TagModule,
    DividerModule,
  ],
  templateUrl: './detalle-transferencia.html',
  styleUrl: './detalle-transferencia.css',
})
export class DetalleTransferencia implements OnInit {
  transferencia: TransferenciaDetalle | null = null;
  detalleItems: TransferenciaDetalleItem[] = [];
  codigo = '';
  loading = false;
  errorMensaje = '';
  private sedeNombrePorId = new Map<string, string>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private transferenciaService: TransferenciaService,
    private sedeService: SedeService,
  ) {}

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

    const sedes$ = this.sedeService
      .getSedes()
      .pipe(
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
      )
      .subscribe({
        next: ({ transferencia, sedes }) => {
          this.indexarSedes(sedes);
          this.transferencia = this.mapTransferencia(transferencia);
          this.detalleItems = this.mapDetalleItems(transferencia.items ?? []);
        },
        error: (error) => {
          console.error('Error al cargar detalle de transferencia:', error);
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
    const primerProducto = primerItem?.producto?.[0];

    return {
      codigo: String(transferencia.id),
      producto: primerProducto?.anexo || primerProducto?.descripcion || primerProducto?.codigo || '-',
      productoCodigo: primerProducto?.codigo || '-',
      productoAnexo: primerProducto?.anexo || '-',
      productoDescripcion: primerProducto?.descripcion || '-',
      productoCategoria: primerProducto?.categoria?.[0]?.nombre || '-',
      origen: this.getSedeNombre(transferencia.originHeadquartersId),
      destino: this.getSedeNombre(transferencia.destinationHeadquartersId),
      cantidad: transferencia.totalQuantity ?? 0,
      responsable: this.getResponsableNombre(transferencia.creatorUser?.[0]),
      estado: this.mapEstado(transferencia.status),
      fechaEnvio: this.formatearFecha(transferencia.requestDate),
      fechaLlegada: '-',
      observacion: transferencia.observation?.trim() || '-',
    };
  }

  private mapDetalleItems(items: TransferenciaItemResponse[]): TransferenciaDetalleItem[] {
    if (!items?.length) return [];

    return items.map((item) => {
      const producto = item.producto?.[0];
      const categoria = producto?.categoria?.[0]?.nombre || '-';

      return {
        producto: producto?.anexo || producto?.descripcion || '-',
        codigo: producto?.codigo || '-',
        categoria,
        cantidad: item.quantity ?? 0,
        series: item.series?.length ? item.series.join(', ') : '-',
        seriesList: item.series ?? [],
      };
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
    return fecha.toLocaleString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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

}
