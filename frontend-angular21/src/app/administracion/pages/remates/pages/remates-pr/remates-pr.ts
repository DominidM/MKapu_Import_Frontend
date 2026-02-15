import { Component, OnInit, inject, signal, computed, WritableSignal } from '@angular/core';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { CommonModule } from '@angular/common';

import { AuctionService, CreateAuctionDto, AuctionResponseDto } from '../../../../services/auction.service';

interface Producto {
  id_remate?: number;            // id del remate (necesario para delete)
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
    DialogModule,
    InputNumberModule,
    CommonModule
  ],
  templateUrl: './remates-pr.html',
  styleUrl: './remates-pr.css',
  providers: [ConfirmationService, MessageService],
})
export class RematesPr implements OnInit {
  // inject services as properties so field initializers can use them safely
  private readonly auctionService = inject(AuctionService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  // almacenes estático (declarado antes de productoActual)
  almacenes = [
    { id: 1, name: 'Almacén Central' },
    { id: 2, name: 'Almacén Sucursal' }
  ];

  // Signals local para forma/modal
  productoActual = signal<Producto>(this.nuevoProductoVacioSeed());
  mostrarModal = signal(false);
  modoEdicion = signal(false);

  // Filtros (signals)
  busqueda = signal('');
  paginaActual = signal(1);
  productosPorPagina = signal(10);

  // Loading proviene del servicio (computed signal)
  cargando = this.auctionService.loading;

  // computed: mapea la señal de auctions del servicio a tu interfaz Producto (incluye id_remate)
  productos = computed(() =>
    this.auctionService.auctions().map((a: AuctionResponseDto) => this.mapToProducto(a))
  );

  // filtered computed (basado en productos())
  productosFiltrados = computed(() => {
    const q = this.busqueda().trim().toLowerCase();
    if (!q) return this.productos();
    return this.productos().filter(p =>
      (p.codigo || '').toLowerCase().includes(q) ||
      (p.nombre || '').toLowerCase().includes(q) ||
      (p.responsable || '').toLowerCase().includes(q)
    );
  });

  // stats computed
  totalRemates = computed(() => this.productos().filter(p => p.tipo === 'remate').length);
  valorTotalRemates = computed(() =>
    this.productos()
      .filter(p => p.tipo === 'remate')
      .reduce((sum, p) => sum + ((p.precioRemate || 0) * p.cantidad), 0)
  );

  ngOnInit(): void {
    this.loadRemates();
  }

  // seed helper for initial productoActual (safe — almacenes already defined)
  private nuevoProductoVacioSeed(): Producto {
    const defaultAlmacenId = (this.almacenes && this.almacenes.length) ? this.almacenes[0].id : 1;
    return {
      codigo: this.generarCodigoAutomaticoSeed(),
      nombre: '',
      responsable: 'Jefatura de almacén',
      cantidad: 1,
      tipo: 'remate',
      fechaRegistro: new Date(),
      productId: undefined,
      id_almacen_ref: defaultAlmacenId
    };
  }

  private generarCodigoAutomaticoSeed(): string {
    const fecha = new Date();
    const año = fecha.getFullYear();
    return `TRF-${año}-0001`;
  }

  generarCodigoAutomatico(): string {
    const fecha = new Date();
    const año = fecha.getFullYear();
    const ultimoNumero = this.productos().length + 1;
    return `TRF-${año}-${String(ultimoNumero).padStart(4, '0')}`;
  }

  // Map server AuctionResponseDto -> Producto UI model
  private mapToProducto(a: AuctionResponseDto): Producto {
    return {
      id_remate: a.id_remate,
      codigo: a.cod_remate || `RMT-${a.id_remate}`,
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

  // ---------- CARGA DE SUBASTAS ----------
  loadRemates(): void {
    this.auctionService.loadAuctions(this.paginaActual(), this.productosPorPagina()).subscribe({
      next: () => {
        // servicio actualizó su señal internamente; actualizar código de productoActual
        this.productoActual.update(curr => ({ ...curr, codigo: this.generarCodigoAutomatico() }));
      },
      error: (err) => {
        console.error('Error cargando remates', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los remates', life: 3000 });
      }
    });
  }

  // ---------- MODAL ----------
  abrirModal(): void {
    this.modoEdicion.set(false);
    this.productoActual.set({
      ...this.nuevoProductoVacioSeed(),
      codigo: this.generarCodigoAutomatico()
    });
    this.mostrarModal.set(true);
  }

  cerrarModal(): void {
    this.mostrarModal.set(false);
    this.productoActual.set({
      ...this.nuevoProductoVacioSeed(),
      codigo: this.generarCodigoAutomatico()
    });
  }

  editarProducto(producto: Producto): void {
    this.modoEdicion.set(true);
    this.productoActual.set({ ...producto });
    this.mostrarModal.set(true);
  }

  setProductoField<K extends keyof Producto>(field: K, value: Producto[K]) {
    this.productoActual.update(curr => ({ ...curr, [field]: value }));
  }

  // ---------- GUARDAR REMATE (CALL BACKEND) ----------
  guardarProducto(): void {
    const p = this.productoActual();
    // validations
    if (!p.nombre?.trim()) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'El nombre es obligatorio', life: 3000 });
      return;
    }
    if (!p.productId) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Debe indicar el ID del producto', life: 3000 });
      return;
    }
    if (!p.precioRemate || p.precioRemate <= 0) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Precio de remate inválido', life: 3000 });
      return;
    }

    const payload: CreateAuctionDto = {
      cod_remate: p.codigoRemate || p.codigo || this.generarCodigoAutomatico(),
      descripcion: p.nombre,
      fec_fin: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      estado: 'ACTIVO',
      id_almacen_ref: p.id_almacen_ref || this.almacenes[0].id,
      detalles: [
        {
          id_producto: Number(p.productId),
          pre_original: Number(p.precioRemate || 0),
          pre_remate: Number(p.precioRemate || 0),
          stock_remate: Number(p.cantidad),
          observacion: ''
        }
      ]
    };

    this.auctionService.createAuction(payload).subscribe({
      next: (created) => {
        this.messageService.add({ severity: 'success', summary: 'Remate creado', detail: created.cod_remate, life: 3000 });
        // Servicio ya actualizó su señal; computed productos() se refrescará automáticamente
        this.cerrarModal();
      },
      error: (err) => {
        console.error('Error creando remate:', err);
        const detail = err?.error?.message || 'No se pudo crear remate';
        this.messageService.add({ severity: 'error', summary: 'Error', detail, life: 5000 });
      }
    });
  }

  eliminarProducto(producto: Producto): void {
    if (!producto.id_remate) {
      // Si no hay id_remate, solo actualizar UI localmente
      this.productoActual(); // no-op to keep usage consistent
      this.messageService.add({ severity: 'warn', summary: 'No eliminado', detail: 'Producto sin identificador de remate', life: 3000 });
      return;
    }

    this.confirmationService.confirm({
      message: `¿Está seguro de eliminar "${producto.nombre}"?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.auctionService.deleteAuction(producto.id_remate!).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Remate eliminado', detail: `${producto.nombre} eliminado correctamente`, life: 3000 });
            // la señal del servicio ya se actualiza dentro de deleteAuction
          },
          error: (err) => {
            console.error('Error eliminando remate:', err);
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar el remate', life: 4000 });
          }
        });
      }
    });
  }
}