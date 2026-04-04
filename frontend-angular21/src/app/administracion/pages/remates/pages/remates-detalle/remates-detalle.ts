import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';

import { AuthService } from '../../../../../auth/services/auth.service';
import { UserRole } from '../../../../../core/constants/roles.constants';
import { AuctionService } from '../../../../services/auction.service';
import { SedeService } from '../../../../services/sede.service';

interface RemateUI {
  id_remate: number;
  codigo: string;
  nombre: string;
  cantidad: number;
  precioRemate: number;
  precioOriginal: number;
  responsable: string;
  estado: string;
  observacion?: string;
  descuento: number;
  id_sede: number;
  nombreSede: string;
}

@Component({
  selector: 'app-detalle-remate',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, TagModule, ConfirmDialogModule, ToastModule],
  templateUrl: './remates-detalle.html',
  styleUrls: ['./remates-detalle.css'],
  providers: [MessageService, ConfirmationService]
})
export class DetalleRemateComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);
  
  private auctionService = inject(AuctionService);
  private sedeService = inject(SedeService);
  private authService = inject(AuthService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  // Estados
  remate = signal<RemateUI | null>(null);
  cargando = signal(true);

  // Permisos
  esAdmin = signal(false);
  puedeEditarRemates = signal(false);

  ngOnInit(): void {
    // Verificar Permisos
    this.esAdmin.set(this.authService.getRoleId() === UserRole.ADMIN);
    this.puedeEditarRemates.set(this.authService.hasPermiso('EDITAR_REMATES'));

    // Asegurarse de que las sedes estén cargadas para mapear el nombre
    this.sedeService.loadSedes().subscribe();

    // Obtener ID de la URL
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.cargarDetalle(Number(idParam));
    } else {
      this.volver();
    }
  }

  cargarDetalle(id: number) {
    this.cargando.set(true);
    // Asumiendo que tu AuctionService tiene un getById o similar
    this.auctionService.getAuctionById(id).subscribe({
      next: (response: any) => {
        // Ojo: Ajusta 'response' si la API lo envuelve en 'data' (ej. response.data)
        const data = response.data || response;
        this.remate.set(this.mapToUI(data));
        this.cargando.set(false);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar el remate.' });
        this.cargando.set(false);
        setTimeout(() => this.volver(), 1500);
      }
    });
  }

  private mapToUI(a: any): RemateUI {
    const d = a.detalles?.[0] || a.detalle || {};
    const precioOriginal = d.pre_original ?? a.precioOriginal ?? 0;
    const precioRemate = d.pre_remate ?? a.precioRemate ?? 0;
    const descuento = precioOriginal > 0 ? Math.round(((precioOriginal - precioRemate) / precioOriginal) * 100) : 0;
    const id_sede = a.id_sede_ref ?? a.id_sede ?? 0;

    return {
      id_remate: a.id_remate,
      codigo: a.cod_remate ?? a.codigo,
      nombre: a.descripcion ?? a.nombre,
      cantidad: d.stock_remate ?? d.cantidad ?? 0,
      precioRemate,
      precioOriginal,
      responsable: a.usuario?.nombre ?? 'Sin asignar',
      estado: a.estado ?? 'ACTIVO',
      observacion: a.observacion ?? d.observacion ?? '',
      descuento,
      id_sede,
      nombreSede: this.getNombreSede(id_sede),
    };
  }

  private getNombreSede(id_sede: number): string {
    if (!id_sede) return '—';
    return this.sedeService.sedes().find((s) => s.id_sede === id_sede)?.nombre ?? `Sede #${id_sede}`;
  }

  volver() {
    this.location.back();
  }

  editarRemate(r: RemateUI) {
    this.router.navigate(['/admin/remates/editar-remate', r.id_remate]);
  }

  confirmarCambioEstado(remate: RemateUI): void {
    this.confirmationService.confirm({
      header: 'Confirmación',
      message: `¿Estás seguro que deseas finalizar el remate <strong>${remate.codigo}</strong>? No podrás deshacer esta acción.`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, finalizar',
      rejectLabel: 'Cancelar',
      acceptButtonProps: { severity: 'danger' as any },
      rejectButtonProps: { severity: 'secondary', outlined: true },
      accept: () => {
        this.auctionService.finalizeAuction(remate.id_remate).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: `El remate fue finalizado.` });
            this.cargarDetalle(remate.id_remate); // Recargar el detalle para actualizar estado
          },
          error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cambiar el estado.' })
        });
      }
    });
  }

  getEstadoSeverity(estado: string): any {
    const map: Record<string, string> = {
      ACTIVO: 'success',
      FINALIZADO: 'secondary',
      CANCELADO: 'danger',
    };
    return map[estado] || 'info';
  }
}
