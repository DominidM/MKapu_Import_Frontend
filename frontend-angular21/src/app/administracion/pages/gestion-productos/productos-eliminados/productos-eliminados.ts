import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { AutoCompleteModule } from 'primeng/autocomplete';

@Component({
  selector: 'app-productos-eliminados',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    CardModule,
    TagModule,
    AutoCompleteModule
  ],
  template: `
    <div class="p-4">
      <div class="flex justify-content-between align-items-center mb-4">
        <h2 class="m-0">Productos Retirados/Eliminados</h2>
        <button 
          pButton 
          label="Volver a Activos" 
          icon="pi pi-arrow-left" 
          (click)="volverActivos()">
        </button>
      </div>

      <!-- FILTROS -->
      <div class="flex flex-wrap gap-3 align-items-end mb-4">
        <div class="flex flex-column md:w-48">
          <label class="text-sm mb-1">Sede</label>
          <p-autocomplete
            [(ngModel)]="sedeValue"
            [suggestions]="items"
            (completeMethod)="searchSede($event)"
            (onSelect)="onSelectSede()"
            placeholder="Seleccionar sede"
            [dropdown]="true">
          </p-autocomplete>
        </div>
      </div>

      <div *ngIf="!sedeValue" class="p-4 text-center text-gray-500">
        Selecciona una sede para ver productos eliminados.
      </div>

      <div class="grid" *ngIf="sedeValue && productosEliminados.length > 0">
        <div class="col-12 md:col-6 lg:col-4" *ngFor="let p of productosEliminados">
          <p-card>
            <ng-template pTemplate="title">{{ p.nombre }}</ng-template>
            <ng-template pTemplate="subtitle">{{ p.codigo }} - {{ p.familia }}</ng-template>
            <div class="mb-2">
              <p-tag [value]="p.estado" severity="danger"></p-tag>
            </div>
            <div class="text-sm mb-1"><strong>Sede:</strong> {{ p.sede }}</div>
            <div class="text-sm mb-1"><strong>Stock:</strong> {{ p.stock }}</div>
            <div class="text-sm mb-1"><strong>Precio Unidad:</strong> S/ {{ p.precioUnidad }}</div>
            <div class="text-sm mb-3"><strong>Precio Caja:</strong> S/ {{ p.precioCaja }}</div>
            <div class="flex justify-content-between gap-2">
              <button
                pButton
                label="Restaurar"
                icon="pi pi-undo"
                severity="success"
                size="small"
                (click)="restaurarProducto(p)">
              </button>
              <button
                pButton
                label="Eliminar"
                icon="pi pi-trash"
                severity="danger"
                size="small"
                (click)="eliminarPermanente(p)">
              </button>
            </div>
          </p-card>
        </div>
      </div>

      <div *ngIf="sedeValue && productosEliminados.length === 0" class="p-4 text-center text-gray-500">
        No hay productos eliminados en esta sede.
      </div>
    </div>
  `
})
export class ProductosEliminados {
  productosEliminados: any[] = [];
  productosOriginal: any[] = [];
  
  sedeValue: string | null = null;
  sedes: string[] = [];
  items: string[] = [];

  constructor(private router: Router) {
    this.cargarProductosEliminados();
  }

  cargarProductosEliminados() {
    // Simulación - reemplazar con servicio
    this.productosOriginal = [
      {
        id: 4,
        codigo: 'P004',
        nombre: 'Coca Cola 1L',
        familia: 'Bebidas',
        sede: 'Lima',
        stock: 0,
        precioUnidad: 5.5,
        precioCaja: 60,
        precioMayorista: 5,
        estado: 'Retirado'
      },
      {
        id: 5,
        codigo: 'P005',
        nombre: 'Galletas Oreo',
        familia: 'Snacks',
        sede: 'Arequipa',
        stock: 0,
        precioUnidad: 4,
        precioCaja: 45,
        precioMayorista: 3.5,
        estado: 'Eliminado'
      }
    ];
    
    this.sedes = [...new Set(this.productosOriginal.map(p => p.sede))];
    this.productosEliminados = [];
  }

  onSelectSede() {
    this.productosEliminados = this.productosOriginal.filter(p => 
      p.sede === this.sedeValue && 
      (p.estado === 'Retirado' || p.estado === 'Eliminado')
    );
  }

  searchSede(event: any) {
    const query = event.query.toLowerCase();
    this.items = this.sedes.filter(s => s.toLowerCase().includes(query));
  }

  restaurarProducto(producto: any) {
    const confirmacion = confirm(`¿Restaurar el producto "${producto.nombre}" a activos?`);
    
    if (confirmacion) {
      producto.estado = 'Activo';

      this.onSelectSede();
      console.log('Producto restaurado:', producto);
    }
  }

  eliminarPermanente(producto: any) {
    const confirmacion = confirm(`¿ELIMINAR PERMANENTEMENTE "${producto.nombre}"? Esta acción no se puede deshacer.`);
    
    if (confirmacion) {

      this.productosEliminados = this.productosEliminados.filter(p => p.id !== producto.id);
      console.log('Producto eliminado permanentemente:', producto);
    }
  }

  volverActivos() {
    this.router.navigate(['/admin/gestion-productos']);
  }
}
