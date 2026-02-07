import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Toast } from 'primeng/toast';


@Component({
  selector: 'app-agregar-cliente',
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
    Toast,

  ],
  templateUrl: './agregar-cliente.html',
  styleUrl: './agregar-cliente.css',
  providers: [
    ConfirmationService,
    MessageService
  ],
})
export class AgregarCliente {
  constructor(private messageService: MessageService) {}

  cliente = {
    nro_documento: '',
    razon_social: '',
    nombres: '',
    apellidos: '',
    direccion: '',
    email: '',
    telefono: '',
  };

  registrar() {
      this.messageService.add({ severity: 'success', summary: 'Registro Exitoso', detail: 'Se realizo un cambio en el registro', life: 3000 });
  }
}
