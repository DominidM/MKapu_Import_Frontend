import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';

import { CardModule } from 'primeng/card';
import { Button } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';

import { ProductosService, Producto, ComparativaProducto } from '../../../../core/services/productos.service';

@Component({
  selector: 'app-productos-detalles',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    Button,
    TagModule,
    DividerModule,
    ToastModule,
    ConfirmDialog
  ],
  templateUrl: './productos-detalles.html',
  styleUrl: './productos-detalles.css',
  providers: [ConfirmationService, MessageService]
})
export class ProductosDetalles implements OnInit {
  producto: Producto | null = null;
  productoId: number | null = null;
  loading = true;
  comparativa: ComparativaProducto | null = null;
  tieneVariasSedes = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private productosService: ProductosService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.productoId = +params['id'];
        this.cargarProducto(this.productoId);
      }
    });
  }

  cargarProducto(id: number) {
    this.loading = true;
    this.producto = this.productosService.getProductoPorId(id);
    
    if (!this.producto) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Producto no encontrado',
        life: 3000
      });
      setTimeout(() => this.volver(), 2000);
    } else {
      this.cargarComparativa();
    }
    
    this.loading = false;
  }

  cargarComparativa() {
    if (!this.producto) return;
    
    this.comparativa = this.productosService.getComparativaPorCodigo(this.producto.codigo);
    this.tieneVariasSedes = (this.comparativa?.variantes.length || 0) > 1;
  }

  volver() {
    this.router.navigate(['/admin/gestion-productos']);
  }

  irEditar() {
    if (this.productoId) {
      this.router.navigate(['/admin/gestion-productos/editar-producto', this.productoId], {
        queryParams: { returnUrl: `/admin/gestion-productos/ver-detalle-producto/${this.productoId}` }
      });
    }
  }

  irEditarVariante(varianteId: number) {
    this.router.navigate(['/admin/gestion-productos/editar-producto', varianteId], {
      queryParams: { returnUrl: `/admin/gestion-productos/ver-detalle-producto/${this.productoId}` }
    });
  }

  eliminarProducto(event: Event) {
    if (!this.producto) return;

    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `¿Seguro que deseas eliminar el producto "${this.producto.nombre}"?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      rejectLabel: 'Cancelar',
      acceptLabel: 'Eliminar',
      acceptButtonProps: { severity: 'danger' },
      rejectButtonProps: { severity: 'secondary', outlined: true },
      accept: () => {
        const exito = this.productosService.eliminarProducto(this.producto!.id);
        if (exito) {
          this.messageService.add({
            severity: 'success',
            summary: 'Producto Eliminado',
            detail: `"${this.producto!.nombre}" movido a eliminados`,
            life: 3000
          });
          setTimeout(() => this.volver(), 1500);
        }
      },
      reject: () => {
        this.messageService.add({
          severity: 'info',
          summary: 'Cancelado',
          detail: 'Eliminación cancelada',
          life: 2000
        });
      }
    });
  }

  restaurarProducto(event: Event) {
    if (!this.producto) return;

    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `¿Restaurar <strong>${this.producto.nombre}</strong>?`,
      header: 'Confirmar Restauración',
      icon: 'pi pi-info-circle',
      rejectLabel: 'Cancelar',
      acceptLabel: 'Restaurar',
      acceptButtonProps: { severity: 'warning' },
      rejectButtonProps: { severity: 'secondary', outlined: true },
      accept: () => {
        const exito = this.productosService.restaurarProducto(this.producto!.id);
        if (exito) {
          this.messageService.add({
            severity: 'success',
            summary: 'Producto Restaurado',
            detail: `"${this.producto!.nombre}" restaurado exitosamente`,
            life: 3000
          });
          this.cargarProducto(this.productoId!);
        }
      },
      reject: () => {
        this.messageService.add({
          severity: 'info',
          summary: 'Cancelado',
          detail: 'Restauración cancelada',
          life: 2000
        });
      }
    });
  }

  get esProductoEliminado(): boolean {
    return this.producto?.estado === 'Eliminado';
  }

  get margenGanancia(): number {
    if (!this.producto) return 0;
    return this.productosService.getMargenGanancia(this.producto);
  }

  get porcentajeMargen(): number {
    if (!this.producto) return 0;
    return this.productosService.getPorcentajeMargen(this.producto);
  }

  formatearNombreSede(sede: string): string {
    return sede
      .split(' ')
      .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase())
      .join(' ');
  }

  getSeverityPorDiferencia(porcentaje: number): 'success' | 'warning' | 'danger' | 'secondary' {
    if (porcentaje < -5) return 'success';
    if (porcentaje > 5) return 'danger';
    if (Math.abs(porcentaje) > 2) return 'warning';
    return 'secondary';
  }

  getIconoPorDiferencia(diferencia: number): string {
    if (diferencia < 0) return 'pi-arrow-down';
    if (diferencia > 0) return 'pi-arrow-up';
    return 'pi-minus';
  }
}
