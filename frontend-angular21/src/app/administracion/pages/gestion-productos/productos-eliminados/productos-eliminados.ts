import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

@Component({
  selector: 'app-productos-eliminados',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    CardModule,
    TagModule,
    TableModule,
    SelectModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule
  ],
  templateUrl: './productos-eliminados.html',
  styleUrl: './productos-eliminados.css'
})
export class ProductosEliminados implements OnInit {
  productosEliminados: any[] = [];
  productosOriginal: any[] = [];
  loading = false;
  sedeValue: string | null = null;
  buscarValue: string | null = null;
  sedes: {label: string, value: string}[] = [];
  totalEliminados: number = 0;

  constructor(private router: Router) {}

  ngOnInit() {
    this.cargarProductosEliminados();
  }

  cargarProductosEliminados() {
    this.loading = true;
    
    this.productosOriginal = [
      {
        id: 4, codigo: 'P004', nombre: 'Coca Cola 1L', familia: 'Bebidas', sede: 'LAS FLORES',
        stock: 15, precioUnidad: 5.50, precioCaja: 60.00, estado: 'Eliminado'
      },
      {
        id: 6, codigo: 'P006', nombre: 'Galletas Oreo 120g', familia: 'Snacks', sede: 'LURIN',
        stock: 0, precioUnidad: 4.00, precioCaja: 45.00, estado: 'Eliminado'
      }
    ];

    this.sedes = [...new Set(this.productosOriginal.map(p => p.sede))]
      .map(s => ({ label: s, value: s }));
    
    this.loading = false;
    this.aplicarFiltros();
  }

  aplicarFiltros() {
    if (!this.sedeValue) {
      this.productosEliminados = [];
      this.totalEliminados = 0;
      return;
    }

    this.productosEliminados = this.productosOriginal.filter((p: any) => {
      const matchesSede = p.sede === this.sedeValue;
      let query = '';
      if (this.buscarValue && typeof this.buscarValue === 'string') {
        query = this.buscarValue.toLowerCase();
      }
      const matchesBusqueda = !query || 
        p.nombre.toLowerCase().includes(query) ||
        p.codigo.toLowerCase().includes(query);
      
      return matchesSede && matchesBusqueda && p.estado === 'Eliminado';
    });

    this.totalEliminados = this.productosEliminados.length;
  }

  onSelectSede() {
    this.buscarValue = null;
    this.aplicarFiltros();
  }

  onBuscar() {
    this.aplicarFiltros();
  }

  limpiarFiltros() {
    this.sedeValue = null;
    this.buscarValue = null;
    this.aplicarFiltros();
  }

  restaurarProducto(producto: any) {
    const confirmacion = confirm(
      `¿Restaurar "${producto.nombre}"?\n\n` +
      `Código: ${producto.codigo}\n` +
      `Sede: ${producto.sede}\n\n` +
      `✅ Se cambiará estado de "Eliminado" → "Activo"`
    );
    
    if (confirmacion) {
      const index = this.productosOriginal.findIndex(p => p.id === producto.id);
      if (index !== -1) {
        this.productosOriginal[index].estado = 'Activo';
        this.aplicarFiltros();
      }
    }
  }

  eliminarPermanente(producto: any) {
    const confirmacion = confirm(
      `¿ELIMINAR PERMANENTEMENTE "${producto.nombre}"?\n\n` +
      `Código: ${producto.codigo}\n` +
      `Esta acción NO se puede deshacer.`
    );
    
    if (confirmacion) {
      this.productosOriginal = this.productosOriginal.filter(p => p.id !== producto.id);
      this.aplicarFiltros();
    }
  }

  volverActivos() {
    this.router.navigate(['/admin/gestion-productos']);
  }

  getStockSeverity(stock: number): "success" | "secondary" | "info" | "warn" | "danger" {
    if (stock > 10) return 'success';
    if (stock > 0) return 'warn';
    return 'danger';
  }
}
