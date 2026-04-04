import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  inject,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';

import { SedeService } from '../../../../services/sede.service';
import { Headquarter } from '../../../../interfaces/sedes.interface';
import { AuthService } from '../../../../../auth/services/auth.service';
import { UserRole } from '../../../../../core/constants/roles.constants';

@Component({
  selector: 'app-detalle-sede',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CardModule,
    ButtonModule,
    TagModule,
    ToastModule,
    TooltipModule,
    ConfirmDialogModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './detalle-sede.html',
  styleUrl: './detalle-sede.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetalleSede implements OnInit, OnDestroy {
  private readonly route               = inject(ActivatedRoute);
  private readonly router              = inject(Router);
  private readonly sedeService         = inject(SedeService);
  private readonly authService         = inject(AuthService);
  private readonly messageService      = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly cdr                 = inject(ChangeDetectorRef);

  readonly sede             = this.sedeService.selectedSede;
  readonly loading          = this.sedeService.loadingDetalle;
  readonly loadingAlmacenes = this.sedeService.loadingAlmacenes;
  readonly error            = this.sedeService.error;
  readonly notFound         = computed(() => !this.loading() && !this.sede());

  esAdmin         = false;
  puedeEditarSede = false;

  ngOnInit(): void {
    this.esAdmin         = this.authService.getRoleId() === UserRole.ADMIN;
    this.puedeEditarSede = this.authService.hasPermiso('EDITAR_SEDES');

    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!id || isNaN(id)) {
      this.router.navigate(['/admin/sedes']);
      return;
    }

    this.sedeService.loadSedeDetalle(id, 'Administrador').subscribe({
      next: (sede) => {
        if (!sede.almacenes || sede.almacenes.length === 0) {
          this.sedeService.loadAlmacenesParaSede(id, 'Administrador').subscribe({
            next: () => this.cdr.markForCheck(),
          });
        }
        this.cdr.markForCheck();
      },
      error: () => {
        this.router.navigate(['/admin/sedes']);
      },
    });
  }

  ngOnDestroy(): void {
    this.sedeService.clearSelectedSede();
  }

  volver(): void {
    this.router.navigate(['/admin/sedes']);
  }

  editarSede(): void {
    const s = this.sede();
    if (!s) return;
    this.router.navigate(['/admin/sedes/editar-sede'], { queryParams: { id: s.id_sede } });
  }

  confirmarToggle(): void {
    const s = this.sede();
    if (!s) return;
    const nextStatus = !s.activo;
    this.confirmationService.confirm({
      header:      'Confirmación',
      message:     `¿Deseas ${nextStatus ? 'activar' : 'desactivar'} la sede "${s.nombre}"?`,
      icon:        'pi pi-exclamation-triangle',
      acceptLabel: nextStatus ? 'Activar' : 'Desactivar',
      rejectLabel: 'Cancelar',
      acceptButtonProps: { severity: (nextStatus ? 'success' : 'danger') as any },
      rejectButtonProps: { severity: 'secondary', outlined: true },
      accept: () => this.executeToggle(s, nextStatus),
    });
  }

  
  private executeToggle(s: Headquarter, nextStatus: boolean): void {
    this.sedeService.updateSedeStatus(s.id_sede, nextStatus, 'Administrador').subscribe({
      next: () => {
        this.messageService.add({
          severity: nextStatus ? 'success' : 'warn',
          summary:  nextStatus ? 'Sede activada' : 'Sede desactivada',
          detail:   `Se ${nextStatus ? 'activó' : 'desactivó'} la sede "${s.nombre}".`,
        });
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary:  'Error',
          detail:   err?.error?.message ?? 'No se pudo cambiar el estado.',
        });
      },
    });
  }
}
