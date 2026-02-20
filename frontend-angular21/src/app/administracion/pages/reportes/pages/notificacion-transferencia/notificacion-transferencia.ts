import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { forkJoin, map } from 'rxjs';
import { TransferenciaService } from '../../../../services/transferencia.service';
import { SedeService } from '../../../../services/sede.service';
import { TransferenciaInterfaceResponse } from '../../../../interfaces/transferencia.interface';
import { Headquarter } from '../../../../interfaces/sedes.interface';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

interface NotificacionTransferenciaItem {
  id: string;
  titulo: string;
  detalle: string;
  tiempo: string;
  tipo: 'nueva' | 'estado';
}

@Component({
  selector: 'app-notificacion-transferencia',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule, ButtonModule],
  templateUrl: './notificacion-transferencia.html',
  styleUrl: './notificacion-transferencia.css',
})
export class NotificacionTransferencia implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly transferenciaService = inject(TransferenciaService);
  private readonly sedeService = inject(SedeService);

  private readonly notificacionesSig = signal<NotificacionTransferenciaItem[]>([]);
  private readonly userSedeIdSig = signal<string | null>(null);
  private readonly userSedeNombreSig = signal<string | null>(null);

  private readonly sedeNombrePorId = new Map<string, string>();

  get notificaciones(): NotificacionTransferenciaItem[] {
    return this.notificacionesSig();
  }

  set notificaciones(value: NotificacionTransferenciaItem[]) {
    this.notificacionesSig.set(value ?? []);
  }

  ngOnInit(): void {
    this.cargarUsuarioDesdeStorage();
    this.cargarNotificaciones();
  }

  private cargarUsuarioDesdeStorage(): void {
    const userStr = localStorage.getItem('user');
    if (!userStr) return;

    try {
      const user = JSON.parse(userStr);
      if (user?.idSede !== undefined && user?.idSede !== null) {
        this.userSedeIdSig.set(String(user.idSede));
      }
      if (user?.sedeNombre) {
        this.userSedeNombreSig.set(String(user.sedeNombre));
      }
    } catch (error) {
      console.error('Error al leer user del localStorage:', error);
    }
  }

  private cargarNotificaciones(): void {
    const sedes$ = this.sedeService.getSedes().pipe(
      map((response) => (Array.isArray(response) ? response : response?.headquarters ?? [])),
    );

    forkJoin({
      transferencias: this.transferenciaService.getTransferencias(),
      sedes: sedes$,
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ transferencias, sedes }) => {
          this.indexarSedes(sedes);
          const lista = Array.isArray(transferencias) ? transferencias : [];
          this.notificaciones = this.mapNotificaciones(lista);
          localStorage.setItem('transferencia_notif_count', String(this.notificaciones.length));
        },
        error: (error) => {
          console.error('Error al cargar notificaciones:', error);
          this.notificaciones = [];
          localStorage.setItem('transferencia_notif_count', '0');
        },
      });
  }

  private indexarSedes(sedes: Headquarter[]): void {
    this.sedeNombrePorId.clear();
    sedes.forEach((sede) => {
      this.sedeNombrePorId.set(String(sede.id_sede), sede.nombre);
    });
  }

  private mapNotificaciones(
    transferencias: TransferenciaInterfaceResponse[],
  ): NotificacionTransferenciaItem[] {
    const sedeId = this.userSedeIdSig();
    const sedeNombre = this.userSedeNombreSig();

    const filtradas = transferencias.filter((t) => {
      if (!sedeId && !sedeNombre) return false;
      const destinoId = this.getSedeId(t.destination?.id_sede ?? t.destinationHeadquartersId);
      const destinoNombre = t.destination?.nomSede || this.getSedeNombre(t.destinationHeadquartersId);
      if (sedeId && destinoId === sedeId) return true;
      if (sedeNombre && destinoNombre === sedeNombre) return true;
      return false;
    });

    return filtradas.map((t) => {
      const origen = t.origin?.nomSede || this.getSedeNombre(t.originHeadquartersId);
      const destino = t.destination?.nomSede || this.getSedeNombre(t.destinationHeadquartersId);
      const ruta = `Ruta: ${origen} -> ${destino}`;
      return {
        id: `#${t.id}`,
        titulo: 'Nueva Transferencia',
        detalle: ruta,
        tiempo: this.formatTiempo(t.requestDate),
        tipo: 'nueva',
      };
    });
  }

  private getSedeNombre(id: string | null | undefined): string {
    if (!id) return '-';
    return this.sedeNombrePorId.get(String(id)) ?? String(id);
  }

  private getSedeId(id: string | null | undefined): string {
    if (!id) return '';
    return String(id);
  }

  private formatTiempo(iso: string | null | undefined): string {
    if (!iso) return '-';
    const fecha = new Date(iso);
    if (Number.isNaN(fecha.getTime())) return '-';
    const diffMs = Date.now() - fecha.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'Hace un momento';
    if (diffMin < 60) return `Hace ${diffMin} minutos`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `Hace ${diffH} horas`;
    const diffD = Math.floor(diffH / 24);
    return `Hace ${diffD} dias`;
  }
}
