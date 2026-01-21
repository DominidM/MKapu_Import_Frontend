import { Component } from '@angular/core';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { TextareaModule } from 'primeng/textarea';
import { CardModule } from 'primeng/card';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-reporte-inventario',
  standalone: true,
  imports: [
    SelectModule,
    InputNumberModule,
    ButtonModule,
    DatePickerModule,
    TextareaModule,
    CardModule,
    ToastModule
  ],
  templateUrl: './reporte-inventario.html',
  styleUrl: './reporte-inventario.css',
  providers: [MessageService]
})
export class ReporteInventario {

  constructor(private messageService: MessageService) {}

  sedes = [
    { label: 'Flores 15 - San Juan Lurigancho', value: 'flores-15' },
    { label: 'Lurin', value: 'lurin' },
  ];

  motivos = [
    { label: 'Reposicion', value: 'reposicion' },
    { label: 'Ajuste de stock', value: 'ajuste' },
    { label: 'Solicitud interna', value: 'solicitud' },
  ];

  responsables = [
    { label: 'Jefatura de almacen', value: 'jefatura' },
    { label: 'Supervisor de sede', value: 'supervisor' },
  ];

  confirmarTransferencia() {
    this.messageService.add({
      severity: 'success',
      summary: 'Registro Exitoso',
      detail: 'Se realizó un cambio en el inventario',
      life: 3000
    });
  }

  
}
