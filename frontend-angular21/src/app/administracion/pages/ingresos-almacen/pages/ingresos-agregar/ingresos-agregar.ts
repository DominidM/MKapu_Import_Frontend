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

@Component({
  selector: 'app-ingresos-agregar',
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
  templateUrl: './ingresos-agregar.html',
  styleUrl: './ingresos-agregar.css',
  providers: [
    ConfirmationService,
    MessageService
  ],
})
export class IngresosAgregar {
  constructor(private messageService: MessageService) {}

  ingreso = {
    nro_guia: '',
    fecha_de_entrada: '',
    proveedor: '',
    nro_productos: '',
    cant_total: '',
    valor_total: '',
    estado: '',
  };

  registrar() {
      this.messageService.add({ severity: 'success', summary: 'Registro Exitoso', detail: 'Se realizo un cambio en el registro', life: 3000 });
  }
  cancelar() {
    this.messageService.add({ severity: 'error', summary: 'Se cancelo el registro', detail: 'Se realizo un cambio en el registro', life: 3000 });
}
}
