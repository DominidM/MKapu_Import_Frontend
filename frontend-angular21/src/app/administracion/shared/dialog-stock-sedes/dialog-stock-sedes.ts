import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { Producto } from '../../../core/services/productos.service';

interface SedeStock {
  sede: string;
  codigo: string;
  stock: number;
}

@Component({
  selector: 'app-dialog-stock-sedes',
  standalone: true,
  imports: [CommonModule, DialogModule, ButtonModule, TagModule],
  templateUrl: './dialog-stock-sedes.html',
  styleUrl: './dialog-stock-sedes.css'
})
export class DialogStockSedes {
  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();

  @Input() set variantes(value: Producto[]) {
    this._variantes = value;
    this.procesarSedes();
  }
  
  get variantes(): Producto[] {
    return this._variantes;
  }

  private _variantes: Producto[] = [];
  
  @Input() nombreProducto: string = '';

  sedesStock: SedeStock[] = [];

  get stockTotal(): number {
    return this.sedesStock.reduce((sum, s) => sum + (s.stock || 0), 0);
  }

  private procesarSedes(): void {
    this.sedesStock = [];
    
    this._variantes.forEach(producto => {
      if (producto.variantes && producto.variantes.length > 0) {
        producto.variantes.forEach(variante => {
          this.sedesStock.push({
            sede: variante.sede || 'Sin sede',
            codigo: producto.codigo,
            stock: variante.stock || 0
          });
        });
      } else {
        // Si no tiene variantes internas, usar el producto directamente
        this.sedesStock.push({
          sede: producto.sede || 'Sin sede',
          codigo: producto.codigo,
          stock: producto.stock || 0
        });
      }
    });
  }

  getSeverity(stock: number): 'success' | 'warn' | 'danger' {
    if (stock > 20) return 'success';
    if (stock > 10) return 'warn';
    return 'danger';
  }

  formatearNombreSede(sede: string): string {
    return sede
      .split(' ')
      .map((palabra) => palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase())
      .join(' ');
  }

  cerrar() {
    this.visible = false;
    this.visibleChange.emit(false);
  }
}
