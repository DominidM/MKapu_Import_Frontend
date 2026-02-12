import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';

interface NotificacionTransferenciaItem {
  id: string;
  titulo: string;
  detalle: string;
  tiempo: string;
  tipo: 'nueva' | 'estado';
}

@Component({
  selector: 'app-notificacion-transferencia',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule],
  templateUrl: './notificacion-transferencia.html',
  styleUrl: './notificacion-transferencia.css',
})
export class NotificacionTransferencia {
  notificaciones: NotificacionTransferenciaItem[] = [
    {
      id: '#4',
      titulo: 'Nueva Transferencia',
      detalle: 'Ruta: Sede Principal -> Sede SJL',
      tiempo: 'Hace 5 minutos',
      tipo: 'nueva',
    },
    {
      id: '#5',
      titulo: 'Nueva Transferencia',
      detalle: 'Ruta: Sede Norte -> Sede Sur',
      tiempo: 'Hace 20 minutos',
      tipo: 'nueva',
    },
    {
      id: '#3',
      titulo: 'Actualizacion de Estado',
      detalle: 'Estado: En transito',
      tiempo: 'Hace 1 hora',
      tipo: 'estado',
    },
  ];
}
