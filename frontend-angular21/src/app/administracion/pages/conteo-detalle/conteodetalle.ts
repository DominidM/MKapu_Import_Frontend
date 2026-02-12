import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ProgressBarModule } from 'primeng/progressbar';

interface ProductoDetalle {
  codigo: string;
  producto: string;
  stockSistema: number;
  conteoReal: number;
}

@Component({
  selector: 'app-conteo-detalle',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    TableModule,
    TagModule,
    ProgressBarModule,
    RouterModule
  ],
  templateUrl: './conteodetalle.html',
  styleUrls: ['./conteodetalle.css']
})
export class ConteoDetalle implements OnInit {

  conteo: any;
  productos: ProductoDetalle[] = [];

  totalSistema = 0;
  totalReal = 0;
  diferenciaNeta = 0;
  exactitud = 92;

  constructor(private router: Router) {}

  ngOnInit() {
    this.conteo = history.state.conteo;

    if (!this.conteo) {
      this.router.navigate(['/admin/conteo-inventario']);
    }

    this.cargarDetalleMock();
  }

  cargarDetalleMock() {
    this.productos = [
      { codigo: 'MK-7721', producto: 'Licuadora Industrial 2L', stockSistema: 45, conteoReal: 45 },
      { codigo: 'MK-8816', producto: 'Freidora Aire Digital', stockSistema: 12, conteoReal: 10 },
      { codigo: 'MK-1022', producto: 'Hervidor Eléctrico 1.7L', stockSistema: 30, conteoReal: 31 },
      { codigo: 'MK-5541', producto: 'Cafetera Expreso Duo', stockSistema: 8, conteoReal: 8 }
    ];

    this.calcularTotales();
  }

  calcularDiferencia(row: ProductoDetalle) {
    return row.conteoReal - row.stockSistema;
  }

  calcularTotales() {
    this.totalSistema = this.productos.reduce((a, b) => a + b.stockSistema, 0);
    this.totalReal = this.productos.reduce((a, b) => a + b.conteoReal, 0);
    this.diferenciaNeta = this.totalReal - this.totalSistema;
  }

  regresar() {
    this.router.navigate(['/admin/conteo-inventario']);
  }

  descargarPDF() {
    console.log('Descargar PDF');
  }

}
