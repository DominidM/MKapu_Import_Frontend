import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';

/* PrimeNG */
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { DatePickerModule } from 'primeng/datepicker';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { InputTextModule } from 'primeng/inputtext';

interface ConteoInventario {
  fecha: string;
  detalle: string;
  estado: string;
  familia: string;
}

@Component({
  selector: 'app-conteo-inventario',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    TableModule,
    TagModule,
    DatePickerModule,
    AutoCompleteModule,
    InputTextModule,
    RouterModule
  ],
  templateUrl: './conteoinventario.html',
  styleUrls: ['./conteoinventario.css']
})
export class ConteoInventarios implements OnInit {

  // ================= DATA =================
  conteos: ConteoInventario[] = [];
  conteosFiltrados: ConteoInventario[] = [];

  // ================= FILTROS =================
  filtroBusqueda: string = '';
  fechaSeleccionada: Date | null = null;

  estados = [
    { nombre: 'Todos' },
    { nombre: 'Inicio' },
    { nombre: 'Finalizado' },
    { nombre: 'Anulado' }
  ];

  familias = [
    { nombre: 'Todas' },
    { nombre: 'Licuadoras' },
    { nombre: 'Freidoras' },
    { nombre: 'Refris' },
    { nombre: 'Cocinas' }
  ];

  estadosFiltrados: any[] = [];
  familiasFiltradas: any[] = [];

  estadoSeleccionado: any = this.estados[0];
  familiaSeleccionada: any = this.familias[0];

  constructor(private router: Router) {}

  ngOnInit() {
    this.cargarData();
  }

  cargarData() {
    this.conteos = [
      {
        fecha: '08/02/2026',
        detalle: 'Conteo mensual licuadoras',
        estado: 'Inicio',
        familia: 'Licuadoras'
      },
      {
        fecha: '07/02/2026',
        detalle: 'Revisión anual freidoras',
        estado: 'Finalizado',
        familia: 'Freidoras'
      },
      {
        fecha: '06/02/2026',
        detalle: 'Conteo REFRIS - Sede Norte',
        estado: 'Anulado',
        familia: 'Refris'
      },
      {
        fecha: '05/02/2026',
        detalle: 'Stock Cocinas industriales',
        estado: 'Inicio',
        familia: 'Cocinas'
      },
      {
        fecha: '04/02/2026',
        detalle: 'Inventario licuadoras portátiles',
        estado: 'Finalizado',
        familia: 'Licuadoras'
      }
    ];

    this.aplicarFiltros();
  }

  // ================= AUTOCOMPLETE =================

  filtrarEstados(event: any) {
    const query = event.query?.toLowerCase() || '';
    this.estadosFiltrados = this.estados.filter(e =>
      e.nombre.toLowerCase().includes(query)
    );
  }

  filtrarFamilias(event: any) {
    const query = event.query?.toLowerCase() || '';
    this.familiasFiltradas = this.familias.filter(f =>
      f.nombre.toLowerCase().includes(query)
    );
  }

  // ================= FILTROS =================

  aplicarFiltros() {

    this.conteosFiltrados = this.conteos.filter(c => {

      const coincideBusqueda =
        c.detalle.toLowerCase().includes(this.filtroBusqueda.toLowerCase());

      const coincideEstado =
        this.estadoSeleccionado?.nombre === 'Todos' ||
        c.estado === this.estadoSeleccionado?.nombre;

      const coincideFamilia =
        this.familiaSeleccionada?.nombre === 'Todas' ||
        c.familia === this.familiaSeleccionada?.nombre;

      let coincideFecha = true;

      if (this.fechaSeleccionada) {
        const fechaFormateada =
          this.fechaSeleccionada.getDate().toString().padStart(2, '0') +
          '/' +
          (this.fechaSeleccionada.getMonth() + 1).toString().padStart(2, '0') +
          '/' +
          this.fechaSeleccionada.getFullYear();

        coincideFecha = c.fecha === fechaFormateada;
      }

      return coincideBusqueda && coincideEstado && coincideFamilia && coincideFecha;
    });
  }

  // ================= ACCIONES =================

  verDetalle(row: ConteoInventario) {
    this.router.navigate(['/conteo-detalle'], {
        state: { conteo: row }
      });
      
      }
      
  

  crearConteo() {
    this.router.navigate(['/admin/conteo-crear']);
  }

}
