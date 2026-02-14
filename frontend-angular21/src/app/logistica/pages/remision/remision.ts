import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, signal } from '@angular/core';
import { Button } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { Select } from 'primeng/select';
import { Card } from 'primeng/card';
import { DatePicker } from 'primeng/datepicker';
import { NuevaRemision } from './nueva-remision/nueva-remision';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-remision',
  imports: [CommonModule, Button, Tag, TableModule, Card, DatePicker, Select, NuevaRemision,InputTextModule],
  templateUrl: './remision.html',
  styleUrl: './remision.css',
})
export class Remision {
  remisiones = signal<any[]>([]);
  protected sidebarVisible = signal<boolean>(false);
  ngOnInit() {
    this.remisiones.set([
      {
        numero: 'GR01-0000451',
        fec_emision: new Date('2026-02-14T09:30:00'),
        cliente: 'Corporación Logística S.A.C.',
        punto_llegada: 'Av. Industrial 452, Ate',
        transportista: 'Juan Pérez (T-902)',
        estado: 'ENTREGADO',
        severity: 'success',
      },
      {
        numero: 'GR01-0000452',
        fec_emision: new Date('2026-02-14T11:15:00'),
        cliente: 'Importaciones Mkapu Lima',
        punto_llegada: 'Calle Las Begonias 123, San Isidro',
        transportista: 'Envios Express S.A.',
        estado: 'EN TRÁNSITO',
        severity: 'warn',
      },
      {
        numero: 'GR01-0000453',
        fec_emision: new Date('2026-02-14T13:00:00'),
        cliente: 'Ferretería Central',
        punto_llegada: 'Jr. Cuzco 567, Cercado',
        transportista: 'Propio (Camioneta 1)',
        estado: 'PENDIENTE',
        severity: 'info',
      },
    ]);
  }
  abrirFormulario(): void {
    this.sidebarVisible.set(true);
  }

  cerrarFormulario(): void {
    this.sidebarVisible.set(false);
  }
  verDetalle() {}
}
