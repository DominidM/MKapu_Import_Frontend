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

  // 🔹 Stock disponible (puede venir luego del backend)
  stockDisponible: number = 60;

  // 🔹 Cantidad a transferir (input)
  cantidadTransferir: number = 1;

  sedes = [
    { label: 'Flores 15 - San Juan Lurigancho', value: 'flores-15' },
    { label: 'Lurin', value: 'lurin' }
  ];

  motivos = [
    { label: 'Reposición', value: 'reposicion' },
    { label: 'Ajuste de stock', value: 'ajuste' },
    { label: 'Solicitud interna', value: 'solicitud' }
  ];

  responsables = [
    { label: 'Jefatura de almacén', value: 'jefatura' },
    { label: 'Supervisor de sede', value: 'supervisor' }
  ];

  // ➕ Botón +
  aumentarCantidad() {
    if (this.cantidadTransferir < this.stockDisponible) {
      this.cantidadTransferir++;
    }
  }

  // ➖ Botón -
  disminuirCantidad() {
    if (this.cantidadTransferir > 1) {
      this.cantidadTransferir--;
    }
  }

  // ✏️ Escritura manual (doble click / teclado)
  validarCantidadManual() {
    if (!this.cantidadTransferir || this.cantidadTransferir < 1) {
      this.cantidadTransferir = 1;
    }

    if (this.cantidadTransferir > this.stockDisponible) {
      this.cantidadTransferir = this.stockDisponible;
    }
  }

  confirmarTransferencia() {

    const nuevaTransferencia = {
      codigo: 'TRF-' + Math.floor(1000 + Math.random() * 9000),
      producto: 'Cable HDMI 2m',
      origen: 'Flores 15',
      destino: 'Lurin',
      cantidad: this.cantidadTransferir,
      estado: 'Pendiente',
      fecha: new Date().toLocaleDateString()
    };

    const transferenciasGuardadas = JSON.parse(
      localStorage.getItem('transferencias') || '[]'
    );

    transferenciasGuardadas.unshift(nuevaTransferencia);

    localStorage.setItem(
      'transferencias',
      JSON.stringify(transferenciasGuardadas)
    );

    this.messageService.add({
      severity: 'success',
      summary: 'Registro Exitoso',
      detail: 'Se realizó la solicitud de Transferencia',
      life: 3000
    });

    // Reset
    this.cantidadTransferir = 1;
  }
}
