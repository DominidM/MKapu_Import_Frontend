import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

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
export class EditarSede {
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
    this.confirmationService.confirm({
      header: 'Confirmacion',
      message: '¿Seguro que deseas cancelar la edicion de la sede?',
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
        this.router.navigate(['/admin/sedes']);
      },
    });
  }

  updateSede(): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Sede actualizada',
      detail: `Se actualizo la sede ${this.sede.nombre || this.sede.codigo}.`,
    });
  }
}
