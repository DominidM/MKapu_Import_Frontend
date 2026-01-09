import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';

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
  ],
  templateUrl: './agregar-sede.html',
  styleUrl: './agregar-sede.css',
})
export class AgregarSede {
  sede = {
    codigo: '',
    nombre: '',
    ciudad: '',
    telefono: '',
    departamento: '',
    direccion: '',
  };
}
