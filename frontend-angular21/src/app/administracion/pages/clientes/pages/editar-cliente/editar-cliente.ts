import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  selector: 'app-editar-cliente',
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
  templateUrl: './editar-cliente.html',
  styleUrl: './editar-cliente.css',
  providers: [ConfirmationService],
})
export class EditarCliente {
  cliente = 
    {
      nro_documento: '74283915',
      razon_social: 'Servicios Integrales Andina S.A.C.',
      nombres: 'Carlos Alberto',
      apellidos: 'Torres',
      direccion: 'Av. Las Flores 15-16, Urb. Las Flores',
      email:'abc@gmail.com', 
      telefono: '987654321', 
    }
}
