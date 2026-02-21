import { Component, inject, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
interface ItemConteo {
  id: number;
  codigo: string;
  nombre: string;
  familia: string;
  stockSistema: number;
  conteoFisico: number | null;
  diferencia: number;
  ubicacion: string;
  estado: 'PENDIENTE' | 'CUADRADO' | 'DESVIACION';
  ultimoConteo?: string;
}
@Component({
  selector: 'app-conteo-inventario',
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    TagModule,
    CardModule,
    TooltipModule,
    DialogModule,
    ToastModule,
  ],
  providers: [MessageService],
  templateUrl: './conteo-inventario.html',
  styleUrl: './conteo-inventario.css',
})
export class ConteoInventario {
  private messageService = inject(MessageService);
  conteoIniciado: boolean = false;
  loading: boolean = false;

  inventarioOriginal: ItemConteo[] = [];
  inventario: ItemConteo[] = [];
  itemSeleccionado: ItemConteo | null = null;

  mostrarDialogDetalle: boolean = false;
  filtroGlobal: string = '';

  ngOnInit() {
    this.cargarDatosMock();
  }
  cargarDatosMock() {
    this.inventario = [
      {
        id: 1,
        codigo: 'GRIF-001',
        nombre: 'Grifería Monocomando Lavatorio',
        familia: 'Grifería',
        stockSistema: 50,
        conteoFisico: null,
        diferencia: 0,
        ubicacion: 'Pasillo A-01',
        estado: 'PENDIENTE',
        ultimoConteo: '2024-01-15',
      },
      {
        id: 2,
        codigo: 'TUB-PVC-2',
        nombre: 'Tubo PVC 2 Pulgadas',
        familia: 'Tuberías',
        stockSistema: 120,
        conteoFisico: null,
        diferencia: 0,
        ubicacion: 'Patio Externo',
        estado: 'PENDIENTE',
        ultimoConteo: '2024-01-10',
      },
      {
        id: 3,
        codigo: 'VAL-ESF-1',
        nombre: 'Válvula Esférica 1"',
        familia: 'Válvulas',
        stockSistema: 30,
        conteoFisico: null,
        diferencia: 0,
        ubicacion: 'Estante B-03',
        estado: 'PENDIENTE',
        ultimoConteo: '2024-02-01',
      },
      {
        id: 4,
        codigo: 'CEMP-PEG',
        nombre: 'Pegamento PVC Oatey',
        familia: 'Químicos',
        stockSistema: 15,
        conteoFisico: null,
        diferencia: 0,
        ubicacion: 'Mostrador',
        estado: 'PENDIENTE',
        ultimoConteo: '2024-01-20',
      },
      {
        id: 5,
        codigo: 'LLAV-ANG',
        nombre: 'Llave Angular Cromada',
        familia: 'Grifería',
        stockSistema: 200,
        conteoFisico: null,
        diferencia: 0,
        ubicacion: 'Pasillo A-02',
        estado: 'PENDIENTE',
        ultimoConteo: '2024-01-15',
      },
    ];
  }
  iniciarConteo() {
    this.loading = true;
    setTimeout(() => {
      this.conteoIniciado = true;
      this.loading = false;
      this.messageService.add({
        severity: 'info',
        summary: 'Conteo Iniciado',
        detail: 'Ya puedes ingresar las cantidades físicas.',
      });
    }, 100);
  }
  detenerConteo() {
    this.conteoIniciado = false;
    this.messageService.add({
      severity: 'warn',
      summary: 'Conteo Pausado',
      detail: 'Se ha deshabilitado la edición.',
    });
  }
  actualizarDiferencia(item: ItemConteo) {
    if (item.conteoFisico === null) {
      item.diferencia = 0;
      item.estado = 'PENDIENTE';
      return;
    }
    item.diferencia = item.conteoFisico - item.stockSistema;
    if (item.diferencia === 0) {
      item.estado = 'CUADRADO';
    } else if(item.diferencia <= 0) {
      item.estado = 'DESVIACION';
    }
  }
  verDetalle(item: ItemConteo) {
    this.itemSeleccionado = { ...item };
    this.mostrarDialogDetalle = true;
  }
  guardarProgreso() {
    this.messageService.add({
      severity: 'success',
      summary: 'Guardado',
      detail: 'El avance del conteo se ha guardado correctamente.',
    });
  }
  getEstadoSeverity(
    estado: string,
  ): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' | undefined {
    switch (estado) {
      case 'CUADRADO':
        return 'success';
      case 'DESVIACION':
        return 'danger';
      default:
        return 'warn';
    }
  }
  getStockSeverity(stock: number): 'success' | 'warning' | 'danger' {
    if (stock > 20) return 'success';
    if (stock > 0) return 'warning';
    return 'danger';
  }
  get totalPendientes(): number {
    return this.inventario.filter((item) => item.estado === 'PENDIENTE').length;
  }
  get totalCuadrados(): number {
    return this.inventario.filter((item) => item.estado === 'CUADRADO').length;
  }
  get totalDesviaciones(): number {
    return this.inventario.filter((item) => item.estado === 'DESVIACION').length;
  }
}
