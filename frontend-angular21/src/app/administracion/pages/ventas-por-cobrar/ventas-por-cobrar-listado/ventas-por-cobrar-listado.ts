import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { SelectModule } from 'primeng/select';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialog, ConfirmDialogModule } from 'primeng/confirmdialog';
import { Router, RouterModule } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AutoComplete } from 'primeng/autocomplete';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-ventas-por-cobrar-listado',
  standalone: true,
  imports: [
    CommonModule, FormsModule, TableModule, SelectModule, CardModule,
    ButtonModule, TagModule, ToastModule, ConfirmDialog, ConfirmDialogModule,
    RouterModule, AutoComplete, TooltipModule
  ],
  templateUrl: './ventas-por-cobrar-listado.html',
  styleUrl: './ventas-por-cobrar-listado.css',
  providers: [MessageService, ConfirmationService]
})
export class VentasPorCobrarListadoComponent implements OnInit {
  public iconoCabecera   = 'pi pi-credit-card';
  public tituloKicker    = 'VENTAS POR COBRAR';
  public subtituloKicker = 'LISTADO PENDIENTE';

  // Hardcode para maqueta
  hardcodedVentasPorCobrar = [
    { id: 1, fecha: '08/02/2024', cliente: 'Jorge Luna', sede: 'SEDE SJL', estado: 'Por Cobrar' },
    { id: 2, fecha: '07/02/2024', cliente: 'Carlos Hinostroza', sede: 'SEDE SJL', estado: 'Por Cobrar' },
    { id: 3, fecha: '06/02/2024', cliente: 'Jose Paredes', sede: 'SEDE SJL', estado: 'Por Cobrar' },
  ];

  // ── Signals para buscador/autocompletar ──────────────────────────
  buscarValue = signal<string>('');
  cotizacionSugerencias = signal<any[]>([]); // hardcoded/autocomplete

  // ── Filtros hardcodeados ─────────────────────────────────────────
  estadoSeleccionado = signal<string | null>('POR_COBRAR');
  sedeSeleccionada   = signal<string | null>('SEDE SJL');
  rows               = signal<number>(10);

  // Opciones para filtros (puedes actualizar con tu real)
  estadosOptions = [
    { label: 'Todos',     value: null        },
    { label: 'Por Cobrar', value: 'POR_COBRAR' },
    { label: 'Pagada',  value: 'PAGADA'  },
    { label: 'Cancelada', value: 'CANCELADA' },
  ];

  sedesOptions = signal([
    { label: 'Todas las sedes', value: null },
    { label: 'SEDE SJL', value: 'SEDE SJL' },
    { label: 'SEDE San Miguel', value: 'SEDE San Miguel' },
    { label: 'SEDE Principal', value: 'SEDE Principal' },
  ]);
  messageService: any;

  // ── Lifecycle ────────────────────────────────────────────────────
  ngOnInit() {
    // Hardcodeo no requiere inicialización aún
  }

  // ── Acciones y handlers vacíos (listos para conectar backend) ───
  onSedeChange(nuevaSedeId: string | null) { 
    this.sedeSeleccionada.set(nuevaSedeId);
    // Filtro no implementado aún
  }

  onEstadoChange(estado: string | null) {
    this.estadoSeleccionado.set(estado);
    // Filtro no implementado aún
  }

  onPageChange(event: any) {
    this.rows.set(event.rows);
    // Paginación no implementada aún
  }

  searchCotizacion(event: any) {
    // Maquetado: sugiere 2 clientes por ejemplo
    const q = event.query?.toLowerCase() ?? '';
    if (!q || q.length < 2) { 
      this.cotizacionSugerencias.set([]); 
      return; 
    }
    this.cotizacionSugerencias.set(
      this.hardcodedVentasPorCobrar
        .filter(v => v.cliente.toLowerCase().includes(q) || v.id.toString().includes(q))
        // Puedes limitar y mapear según tu UI!
    );
  }

  seleccionarCotizacionBusqueda(event: any) {
    // Ejemplo: navegar a detalle, por ahora solo console
    const v = event.value;
    console.log('Seleccionado en autocomplete:', v);
  }

  limpiarBusquedaCotizacion() {
    this.buscarValue.set('');
    this.cotizacionSugerencias.set([]);
  }

  // ── Botones de acción de la tabla ───────────────────────────────
  irAgregarVentaPorCobrar(id: number | null) {
    // Navega a crear venta por cobrar
    console.log('Crear Venta por Cobrar, id:', id);
    // this.router.navigate(['/admin/ventas-por-cobrar/nueva'], { queryParams: id ? { cotizacion: id } : {} });
  }

  rechazarCotizacion(id: number) {
    // Simulación de rechazo (sólo para maqueta)
    console.log('Cancelar venta por cobrar, id:', id);
    // Mostrar toast ejemplo
    this.messageService.add({ severity: 'info', summary: 'Cancelada', detail: 'La venta por cobrar fue cancelada.' });
    // Aquí puedes eliminar del array hardcoded si lo deseas
    this.hardcodedVentasPorCobrar = this.hardcodedVentasPorCobrar.filter(v => v.id !== id);
  }
}