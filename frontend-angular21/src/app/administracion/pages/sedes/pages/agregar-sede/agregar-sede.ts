import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
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
  sede = {
    codigo: '',
    nombre: '',
    ciudad: '',
    telefono: null as number | null,
    departamento: '',
    direccion: '',
  };
  submitted = false;

  constructor(
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private router: Router
  ) {}

  confirmCancel(): void {
    if (!this.sedeForm?.dirty) {
      this.navigateWithToast();
      return;
    }

    this.confirmDiscardChanges().subscribe(confirmed => {
      if (confirmed) {
        this.allowNavigate = true;
        this.navigateWithToast();
      }
    });
  }

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

    this.messageService.add({
      severity: 'success',
      summary: 'Sede registrada',
      detail: `Se registro la sede ${this.sede.nombre || this.sede.codigo}.`,
    });
  }

  canDeactivate(): boolean | Observable<boolean> {
    if (this.allowNavigate || !this.sedeForm?.dirty) {
      return true;
    }

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
      acceptButtonProps: {
        severity: 'danger',
      },
      rejectButtonProps: {
        severity: 'secondary',
        outlined: true,
      },
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
