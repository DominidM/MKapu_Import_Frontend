import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { CommonModule } from '@angular/common';

import { AuctionService, AuctionResponseDto } from '../../../../services/auction.service';

interface Producto {
  id_remate?: number;
  codigo: string;
  nombre: string;
  responsable: string;
  cantidad: number;
  tipo?: 'remate';
  codigoRemate?: string;
  precioRemate?: number;
  fechaRegistro: Date;
  productId?: number;
  id_almacen_ref?: number;
}

@Component({
  selector: 'app-remates-pr',
  standalone: true,
  imports: [
    CardModule,
    ButtonModule,
    RouterModule,
    FormsModule,
    InputTextModule,
    ConfirmDialogModule,
    ToastModule,
    TableModule,
    TooltipModule,
    TagModule,
    CommonModule
  ],
  templateUrl: './remates-pr.html',
  styleUrl: './remates-pr.css',
  providers: [ConfirmationService, MessageService],
})
export class RematesPr implements OnInit {
  private readonly auctionService = inject(AuctionService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly router = inject(Router);

  // almacenes (si los necesitas para mostrar)
  almacenes = [
    { id: 1, name: 'Almacén Central' },
    { id: 2, name: 'Almacén Sucursal' }
  ];

  // filtros / paging
  busqueda = signal('');
  productosPorPagina = signal(10);
  paginaActual = signal(1);

  // loading proviene del servicio
  cargando = this.auctionService.loading;

  // productos computed mapeando la señal del servicio
  productos = computed(() =>
    this.auctionService.auctions().map((a: AuctionResponseDto) => this.mapToProducto(a))
  );

  productosFiltrados = computed(() => {
    const q = this.busqueda().trim().toLowerCase();
    if (!q) return this.productos();
    return this.productos().filter(p =>
      (p.codigo || '').toLowerCase().includes(q) ||
      (p.nombre || '').toLowerCase().includes(q)
    );
  });

  totalRemates = computed(() => this.productos().length);
  valorTotalRemates = computed(() =>
    this.productos()
      .reduce((sum, p) => sum + ((p.precioRemate || 0) * p.cantidad), 0)
  );

  ngOnInit(): void {
    this.loadRemates();
  }

  private mapToProducto(a: AuctionResponseDto): Producto {
    return {
      id_remate: a.id_remate,
      codigo: a.cod_remate,
      nombre: a.descripcion,
      responsable: 'Sistema',
      cantidad: a.total_items ?? (a.detalles?.reduce((s: number, d: any) => s + (d.stock_remate || 0), 0) || 0),
      tipo: 'remate',
      fechaRegistro: a.fec_inicio ? new Date(a.fec_inicio) : new Date(),
      codigoRemate: a.cod_remate,
      precioRemate: a.detalles?.[0]?.pre_remate,
      productId: a.detalles?.[0]?.id_producto,
      id_almacen_ref: this.almacenes[0].id
    };
  }

  loadRemates(): void {
    this.auctionService.loadAuctions(this.paginaActual(), this.productosPorPagina()).subscribe({
      next: () => {
        // lista actualizada automáticamente por el servicio (signals)
      },
      error: (err) => {
        console.error('Error cargando remates', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los remates', life: 3000 });
      }
    });
  }

  // Navegar a la página de registro (nuevo remate)
  abrirRegistro(): void {
    this.router.navigate(['/admin/remates/registro-remate']);
  }

  // Editar: navegar a la página de registro con queryParam id para editar
  editarProducto(producto: Producto): void {
    if (producto.id_remate) {
      this.router.navigate(['/admin/remates/registro-remate'], { queryParams: { id: producto.id_remate } });
    } else {
      this.messageService.add({ severity: 'warn', summary: 'Editar', detail: 'Remate sin id disponible para editar', life: 2500 });
    }
  }
}