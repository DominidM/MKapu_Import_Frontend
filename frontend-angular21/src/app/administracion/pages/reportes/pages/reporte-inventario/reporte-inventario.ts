import { Component } from '@angular/core';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { TextareaModule } from 'primeng/textarea';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-reporte-inventario',
  imports: [SelectModule, InputNumberModule, ButtonModule, DatePickerModule, TextareaModule, CardModule],
  templateUrl: './reporte-inventario.html',
  styleUrl: './reporte-inventario.css',
})
export class ReporteInventario {
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
}
