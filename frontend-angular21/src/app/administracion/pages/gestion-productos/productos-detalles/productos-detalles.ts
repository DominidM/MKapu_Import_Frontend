import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { combineLatest, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialog, ConfirmDialogModule } from 'primeng/confirmdialog';
import { TableModule } from 'primeng/table';
import { ConfirmationService, MessageService } from 'primeng/api';

import { ProductoDetalle, ProductoStockDetalle } from '../../../interfaces/producto.interface';
import { ProductoService } from '../../../services/producto.service';

@Component({
  selector: 'app-productos-detalles',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    TagModule,
    DividerModule,
    ToastModule,
    ConfirmDialog,
    ConfirmDialogModule,
    TableModule,
  ],
  templateUrl: './productos-detalles.html',
  styleUrl: './productos-detalles.css',
  providers: [ConfirmationService, MessageService],
})
export class ProductosDetalles implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private productoService = inject(ProductoService);
  private messageService = inject(MessageService);

  readonly productoDetalle = signal<ProductoDetalle | null>(null);
  readonly stockDetalle = signal<ProductoStockDetalle | null>(null);
  readonly cajaDetalle = signal<any | null>(null);

  readonly loading = signal(true);
  readonly errorMsg = signal<string | null>(null);

  readonly cajasFormables = computed(() => {
    const stock = Number(this.stockDetalle()?.cantidad ?? 0);
    const unidadesPorCaja = Number(this.cajaDetalle()?.cantidad_unidades ?? 0);
    if (!unidadesPorCaja || unidadesPorCaja <= 0) return 0;
    return Math.floor(stock / unidadesPorCaja);
  });

  readonly unidadesSueltas = computed(() => {
    const stock = Number(this.stockDetalle()?.cantidad ?? 0);
    const unidadesPorCaja = Number(this.cajaDetalle()?.cantidad_unidades ?? 0);
    if (!unidadesPorCaja || unidadesPorCaja <= 0) return stock;
    return stock % unidadesPorCaja;
  });

  /** Prioridad: queryParam → localStorage.idSede */
  private resolverSede(qParams: any): number | null {
    const fromQuery = Number(qParams.get('idSede'));
    if (fromQuery) return fromQuery;

    try {
      const user = JSON.parse(localStorage.getItem('user') ?? '{}');
      return user.idSede ?? null;
    } catch {
      return null;
    }
  }

  ngOnInit() {
    combineLatest([this.route.paramMap, this.route.queryParamMap]).subscribe(
      ([params, qParams]) => {
        const idProducto = Number(params.get('id'));
        const idSede = this.resolverSede(qParams);

        if (!idProducto) {
          this.loading.set(false);
          this.errorMsg.set('ID de producto inválido.');
          return;
        }

        if (!idSede) {
          this.loading.set(false);
          this.errorMsg.set(
            'No se pudo determinar la sede. Abre el producto desde el listado seleccionando una sede primero.'
          );
          return;
        }

        this.cargarDetalle(idProducto, idSede);
      }
    );
  }

  cargarDetalle(idProducto: number, idSede: number) {
    this.loading.set(true);
    this.errorMsg.set(null);

    forkJoin({
      detalle: this.productoService.getProductoDetalleStock(idProducto, idSede),
      cajas: this.productoService.getCajasByProducto(idProducto).pipe(
        catchError((err) => {
          if (err?.status === 404) return of([]); // sin caja no rompe la vista
          throw err;
        })
      ),
    }).subscribe({
      next: ({ detalle, cajas }) => {
        this.productoDetalle.set(detalle.producto);
        this.stockDetalle.set(detalle.stock ?? null);
        this.cajaDetalle.set(cajas.length > 0 ? cajas[0] : null);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);

        if (err?.status === 404) {
          this.errorMsg.set(
            'Este producto no tiene stock en la sede seleccionada. Cambia la sede en el listado para ver el stock correcto.'
          );
        } else {
          this.errorMsg.set('No se pudo conectar con el servidor. Intenta nuevamente.');
        }
      },
    });
  }

  getStockSeverity(stock: number): 'success' | 'warn' | 'danger' {
    if (stock >= 10) return 'success';
    if (stock > 0) return 'warn';
    return 'danger';
  }

  getEstadoAlmacen(estado: any): string {
    if (estado === 1 || estado === true) return 'Activo';
    if (estado === 0 || estado === false) return 'Inactivo';
    return String(estado);
  }

  volver() {
    this.router.navigate(['/admin/gestion-productos']);
  }

  irEditar() {
    const idSede = this.resolverSede(this.route.snapshot.queryParamMap);
    const idProducto = Number(this.route.snapshot.paramMap.get('id'));

    this.router.navigate(['/admin/gestion-productos/editar-producto', idProducto], {
      queryParams: { idSede },
    });
  }
}