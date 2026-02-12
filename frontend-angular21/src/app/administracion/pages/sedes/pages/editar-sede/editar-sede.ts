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
import { Observable, Subject } from 'rxjs';
import { CanComponentDeactivate } from '../../../../../core/guards/pending-changes.guard';

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
    InputNumberModule,
    ConfirmDialogModule,
    ToastModule,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './editar-sede.html',
  styleUrl: './editar-sede.css',
})
export class EditarSede implements CanComponentDeactivate {
  @ViewChild('sedeForm') sedeForm?: NgForm;

  private allowNavigate = false;
  sede = {
    codigo: 'SJL-FL15',
    nombre: 'FLORES 15',
    ciudad: 'Lima',
    telefono: '987654324',
    departamento: 'San Juan de Lurigancho',
    direccion: 'Av. Las Flores de Primavera 1538',
  };

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

  updateSede(): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Sede actualizada',
      detail: `Se actualizo la sede ${this.sede.nombre || this.sede.codigo}.`,
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
        detail: 'Se canceló la edición de la sede.',
      })
    );
    this.router.navigate(['/admin/sedes']);
  }
}
