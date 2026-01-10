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
import { ConfirmationService } from 'primeng/api';

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
  ],
  providers: [ConfirmationService],
  templateUrl: './agregar-sede.html',
  styleUrl: './agregar-sede.css',
})
export class AgregarSede {
  sede = {
    codigo: '',
    nombre: '',
    ciudad: '',
    telefono: null as number | null,
    departamento: '',
    direccion: '',
  };

  constructor(
    private confirmationService: ConfirmationService,
    private router: Router
  ) {}

  confirmCancel(): void {
    this.confirmationService.confirm({
      header: 'Confirmacion',
      message: '¿Seguro que deseas cancelar la creacion de la sede?',
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
}
