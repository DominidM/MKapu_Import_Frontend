import { Component } from '@angular/core';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { InputNumberModule } from 'primeng/inputnumber';
import { RouterModule } from '@angular/router';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-clientes',
  imports: [
    CardModule,
    ButtonModule,
    FormsModule,
    TableModule,
    TagModule,
    InputTextModule,
    SelectModule,
    CommonModule,
    InputNumberModule,
    RouterModule,
    ConfirmDialogModule
  ],
  templateUrl: './clientes.html',
  styleUrl: './clientes.css',
})
export class Clientes {
  searchTerm = '';

  clientes = [
    {
      nro_documento: '74283915',
      razon_social: 'Servicios Integrales Andina S.A.C.',
      nombres: 'Carlos Alberto',
      apellidos: 'Torres',
      direccion: 'Av. Las Flores 15-16, Urb. Las Flores',
      email:'abc@gmail.com', 
      telefono: '987654321', 
    },
    {
      nro_documento: '60827493',
      razon_social: 'Comercializadora Sol del Pacífico E.I.R.L.',
      nombres: 'María Fernanda',
      apellidos: 'Rios',
      direccion: 'Av. Las Flores 15-16, Urb. Las Flores',
      email:'abc@gmail.com', 
      telefono: '987654321', 
    },
    {
      nro_documento: '91536248',
      razon_social: 'Tecnología y Sistemas QoriTech S.R.L.',
      nombres: 'José Luis',
      apellidos: 'Quispe',
      direccion: 'Av. Las Flores 15-16, Urb. Las Flores',
      email:'abc@gmail.com', 
      telefono: '987654321', 
    },
    {
      nro_documento: '48392076',
      razon_social: 'Inversiones Horizonte del Sur S.A.',
      nombres: 'Ana Paula',
      apellidos: 'Huaman',
      direccion: 'Av. Las Flores 15-16, Urb. Las Flores',
      email:'abc@gmail.com', 
      telefono: '987654321', 
    },
  ];
}
