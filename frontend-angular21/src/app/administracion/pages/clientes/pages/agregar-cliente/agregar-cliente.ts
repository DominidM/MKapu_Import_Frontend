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
  ],
  templateUrl: './agregar-cliente.html',
  styleUrl: './agregar-cliente.css',
  providers: [
    ConfirmationService
  ],
})
export class AgregarCliente {
  cliente = {
    nro_documento: '',
    razon_social: '',
    nombres: '',
    apellidos: '',
    direccion: '',
    email: '',
    telefono: '',
  };
}
