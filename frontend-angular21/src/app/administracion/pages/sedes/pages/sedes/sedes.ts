import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { InputNumberModule } from 'primeng/inputnumber';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-sedes',
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    CardModule,
    SelectModule,
    InputTextModule,
    TableModule,
    TagModule,
    RouterModule,
    InputNumberModule,
    ConfirmDialogModule,
  ],
  providers: [ConfirmationService],
  templateUrl: './sedes.html',
  styleUrl: './sedes.css',
})
export class Sedes {
  searchTerm = '';

  sedes = [
    {
      codigo: 'SJL-FL15',
      nombre: 'Flores 15',
      ciudad: 'San Juan de Lurigancho',
      telefono: '+51 987654324',
      direccion: 'Av. Las Flores 15-16, Urb. Las Flores',
    },
    {
      codigo: 'LRN-26',
      nombre: 'Lurin',
      ciudad: 'Lurin',
      telefono: '+51 987654325',
      direccion: 'Av. San Pedro 890',
    },
    {
      codigo: 'CLL-04',
      nombre: 'Callao',
      ciudad: 'Callao',
      telefono: '+51 987654326',
      direccion: 'Jr. Lima 105',
    },
    {
      codigo: 'ATE-09',
      nombre: 'Ate',
      ciudad: 'Ate',
      telefono: '+51 987654327',
      direccion: 'Av. Metropolitana 220',
    },
  ];

  constructor(private confirmationService: ConfirmationService) {}

  confirmDelete(sede: { codigo: string; nombre: string }): void {
    this.confirmationService.confirm({
      header: 'Confirmacion',
      message: `¿Seguro que deseas eliminar la sede ${sede.nombre}?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonProps: {
        severity: 'danger',
      },
      rejectButtonProps: {
        severity: 'secondary',
        outlined: true,
      },
      accept: () => {
        this.sedes = this.sedes.filter(item => item.codigo !== sede.codigo);
      },
    });
  }
}
