import { CommonModule } from '@angular/common';
import { Component, ViewChild, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { MessageModule } from 'primeng/message'; // <-- AÑADE ESTO
import { Observable, Subject } from 'rxjs';
import { CanComponentDeactivate } from '../../../../../core/guards/pending-changes.guard';
import { SedeService } from '../../../../services/sede.service';
import { Headquarter } from '../../../../interfaces/sedes.interface';

@Component({
  selector: 'app-editar-sede',
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ButtonModule,
    CardModule,
    DividerModule,
    InputTextModule,
    ConfirmDialogModule,
    ToastModule,
    MessageModule, 
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './editar-sede.html',
  styleUrl: './editar-sede.css',
})
export class EditarSede implements CanComponentDeactivate {
  @ViewChild('sedeForm') sedeForm?: NgForm;

  private readonly sedeService = inject(SedeService);
  private readonly route = inject(ActivatedRoute);

  readonly loading = this.sedeService.loading;
  readonly error = this.sedeService.error;

  private allowNavigate = false;
  private sedeId!: number;

  sede: Partial<Headquarter> = {
    codigo: '',
    nombre: '',
    ciudad: '',
    telefono: '',
    departamento: '',
    direccion: '',
    activo: false,
  };

  constructor(
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private router: Router
  ) {
    const idRaw = this.route.snapshot.queryParamMap.get('id');
    const id = Number(idRaw);

    if (!idRaw || Number.isNaN(id)) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se recibió el id de la sede para editar.',
      });
      this.router.navigate(['/admin/sedes']);
      return;
    }

    this.sedeId = id;

    this.sedeService.getSedeById(this.sedeId, 'Administrador').subscribe({
      next: (data) => (this.sede = { ...data }),
      error: (err) => {
        console.error(err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err?.error?.message ?? 'No se pudo cargar la sede.',
        });
      },
    });
  }

  updateSede(): void {
    if (!this.sedeId) return;

    const payload = {
      nombre: this.sede.nombre?.trim(),
      ciudad: this.sede.ciudad?.trim(),
      departamento: this.sede.departamento?.trim(),
      direccion: this.sede.direccion?.trim(),
      telefono: String(this.sede.telefono ?? '').trim(),
    };

    this.sedeService.updateSede(this.sedeId, payload, 'Administrador').subscribe({
      next: (updated) => {
        this.allowNavigate = true;
        this.messageService.add({
          severity: 'success',
          summary: 'Sede actualizada',
          detail: `Se actualizó la sede ${updated.nombre} (${updated.codigo}).`,
        });
        this.router.navigate(['/admin/sedes']);
      },
      error: (err) => {
        console.error(err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err?.error?.message ?? 'No se pudo actualizar la sede.',
        });
      },
    });
  }

  confirmCancel(): void {
    if (!this.sedeForm?.dirty) {
      this.navigateWithToast();
      return;
    }

    this.confirmDiscardChanges().subscribe((confirmed) => {
      if (confirmed) {
        this.allowNavigate = true;
        this.navigateWithToast();
      }
    });
  }

  canDeactivate(): boolean | Observable<boolean> {
    if (this.allowNavigate || !this.sedeForm?.dirty) return true;
    return this.confirmDiscardChanges();
  }

  private confirmDiscardChanges(): Observable<boolean> {
    const result = new Subject<boolean>();

    this.confirmationService.confirm({
      header: 'Cambios sin guardar',
      message: 'Tienes cambios sin guardar. ¿Deseas salir?',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Salir',
      rejectLabel: 'Continuar',
      acceptButtonProps: { severity: 'danger' },
      rejectButtonProps: { severity: 'secondary', outlined: true },
      accept: () => {
        this.allowNavigate = true;
        result.next(true);
        result.complete();
      },
      reject: () => {
        result.next(false);
        result.complete();
      },
    });

    return result.asObservable();
  }

  private navigateWithToast(): void {
    sessionStorage.setItem(
      'sedesToast',
      JSON.stringify({
        severity: 'info',
        summary: 'Cancelado',
        detail: 'Se canceló la edición de la sede.',
      })
    );
    this.router.navigate(['/admin/sedes']);
  }
}