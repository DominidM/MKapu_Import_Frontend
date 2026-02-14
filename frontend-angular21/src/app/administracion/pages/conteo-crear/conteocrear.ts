import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

/* PrimeNG 21+ */
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';

interface ProductoConteo {
  codigo: string;
  nombre: string;
  familia: string;
  sede: string;
  stockSistema: number;
  conteoPropio: number;
}

@Component({
  selector: 'app-conteo-crear',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    TableModule,
    InputTextModule,
    SelectModule,
    RouterModule
  ],
  templateUrl: './conteocrear.html',
  styleUrls: ['./conteocrear.css']
})
export class ConteoCrear implements OnInit {

  constructor(private router: Router) {}

  /* ================= FILTROS ================= */

  filtroCodigo: string = '';
  filtroNombre: string = '';

  familias = [
    { label: 'Todas las familias', value: '' },
    { label: 'Cafeteras', value: 'Cafeteras' }
  ];

  sedes = [
    { label: 'SJL', value: 'SJL' },
    { label: 'Miraflores', value: 'Miraflores' }
  ];

  familiaSeleccionada: string = '';
  sedeSeleccionada: string = 'SJL';

  /* ================= DATA ================= */

  productos: ProductoConteo[] = [];
  productosFiltrados: ProductoConteo[] = [];

  ngOnInit() {
    this.cargarProductos();
  }

  cargarProductos() {
    this.productos = [
      {
        codigo: 'CP-1029',
        nombre: 'Cafetera Espresso Pro',
        familia: 'Cafeteras',
        sede: 'SJL',
        stockSistema: 2,
        conteoPropio: 2
      },
      {
        codigo: 'CP-1030',
        nombre: 'Cafetera Goteo XL',
        familia: 'Cafeteras',
        sede: 'SJL',
        stockSistema: 6,
        conteoPropio: 5
      },
      {
        codigo: 'CP-1035',
        nombre: 'Prensa Francesa 1L',
        familia: 'Cafeteras',
        sede: 'SJL',
        stockSistema: 13,
        conteoPropio: 14
      },
      {
        codigo: 'CP-1036',
        nombre: 'Molinillo Eléctrico',
        familia: 'Cafeteras',
        sede: 'SJL',
        stockSistema: 15,
        conteoPropio: 15
      }
    ];

    this.aplicarFiltros();
  }

  /* ================= FILTROS ================= */

  aplicarFiltros() {
    this.productosFiltrados = this.productos.filter(p => {

      const coincideCodigo =
        p.codigo.toLowerCase().includes(this.filtroCodigo.toLowerCase());

      const coincideNombre =
        p.nombre.toLowerCase().includes(this.filtroNombre.toLowerCase());

      const coincideFamilia =
        !this.familiaSeleccionada ||
        p.familia === this.familiaSeleccionada;

      const coincideSede =
        p.sede === this.sedeSeleccionada;

      return coincideCodigo && coincideNombre && coincideFamilia && coincideSede;
    });
  }

  /* ================= LOGICA ================= */

  calcularDiferencia(p: ProductoConteo): number {
    return p.stockSistema - p.conteoPropio;
  }

  /* ================= ACCIONES ================= */

  cancelar() {
    this.router.navigate(['/conteo-inventario']);
  }

  guardarConteo() {
    console.log('Conteo guardado:', this.productosFiltrados);
    this.router.navigate(['/conteo-inventario']);
  }

  exportar() {
    console.log('Exportar conteo');
  }
}
