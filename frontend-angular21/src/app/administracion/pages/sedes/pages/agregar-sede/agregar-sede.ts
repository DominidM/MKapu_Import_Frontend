import { CommonModule } from '@angular/common';
import { Component, ViewChild, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { Message } from 'primeng/message';
import { Observable, Subject } from 'rxjs';
import { CanComponentDeactivate } from '../../../../../core/guards/pending-changes.guard';
import { SedeService } from '../../../../services/sede.service';

@Component({
  selector: 'app-agregar-sede',
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ButtonModule,
    CardModule,
    DividerModule,
    InputTextModule,
    InputNumberModule,
    ConfirmDialogModule,
    ToastModule,
    Message,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './agregar-sede.html',
  styleUrl: './agregar-sede.css',
})
export class AgregarSede implements CanComponentDeactivate {
  @ViewChild('sedeForm') sedeForm?: NgForm;

  private allowNavigate = false;
  submitted = false;

  sede = {
    codigo: '',
    nombre: '',
    ciudad: '',
    telefono: null as number | null,
    departamento: '',
    direccion: '',
  };

  private readonly sedeService = inject(SedeService);

  readonly loading = this.sedeService.loading;
  readonly error = this.sedeService.error;

  constructor(
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private router: Router
  ) {}

  saveSede(form: NgForm): void {
    this.submitted = true;

    if (form.invalid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Campos incompletos',
        detail: 'Completa los campos obligatorios para registrar la sede.',
      });
      return;
    }

    const payload = {
      codigo: this.sede.codigo.trim(),
      nombre: this.sede.nombre.trim(),
      ciudad: this.sede.ciudad.trim(),
      departamento: this.sede.departamento.trim(),
      direccion: this.sede.direccion.trim(),
      telefono: String(this.sede.telefono ?? '').trim(),
    };

    this.sedeService.createSede(payload, 'Administrador').subscribe({
      next: (created) => {
        this.allowNavigate = true;

        this.messageService.add({
          severity: 'success',
          summary: 'Sede registrada',
          detail: `Se registró la sede ${created.nombre} (${created.codigo}).`,
        });

        this.router.navigate(['/admin/sedes']);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo registrar la sede. Revisa el backend o la consola.',
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
        detail: 'Se canceló el registro de la sede.',
      })
    );
    this.router.navigate(['/admin/sedes']);
  }
}