import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';

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
  ],
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
}
