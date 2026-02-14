import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { InputNumberModule } from 'primeng/inputnumber';
import { RadioButtonModule } from 'primeng/radiobutton';
import { Select } from 'primeng/select';

import { WastageService, CreateWastageDto } from '../../../../services/wastage.service';
import { ProductoService } from '../../../../services/producto.service';

interface Producto {
  id_producto: number;
  id_categoria: number;
  categoriaNombre: string;
  codigo: string;
  anexo: string;
  descripcion: string;
  pre_unit: number;
  estado: boolean;
  stock?: number;
  id_almacen?: number | null;
}

interface MotivoMerma {
  label: string;
  value: string;
}

interface MotivoRemate {
  label: string;
  value: string;
}

@Component({
  selector: 'app-mermas-remates-registro',
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    TextareaModule,
    ToastModule,
    InputNumberModule,
    RadioButtonModule,
    Select,
  ],
  templateUrl: './mermas-remates-registro.html',
  styleUrl: './mermas-remates-registro.css',
  providers: [MessageService],
})
export class MermasRematesRegistro implements OnInit {
  tipoRegistro: 'merma' | 'remate' | null = null;

  codigoProducto = '';
  productoSeleccionado: Producto | null = null;
  productoNoEncontrado = false;

  cantidad = 1;

  motivo = '';
  observaciones = '';

  responsableNombre = 'Usuario en sesión';

  // REMATE
  codigoRemate = '';
  precioRemate = 0;

  // Contexto (TODO: reemplazar por token/auth)
  id_usuario_ref = 1;
  id_sede_ref = 1;
  id_almacen_ref = 1;

  id_tipo_merma = 1;

  motivosMerma: MotivoMerma[] = [
    { label: 'Producto vencido', value: 'vencido' },
    { label: 'Producto dañado', value: 'dañado' },
    { label: 'Producto defectuoso', value: 'defectuoso' },
    { label: 'Producto obsoleto', value: 'obsoleto' },
    { label: 'Pérdida por robo', value: 'robo' },
    { label: 'Pérdida en inventario', value: 'inventario' },
    { label: 'Otro motivo', value: 'otro' },
  ];

  motivosRemate: MotivoRemate[] = [
    { label: 'Próximo a vencer', value: 'proximo_vencer' },
    { label: 'Liquidación de stock', value: 'liquidacion' },
    { label: 'Cambio de temporada', value: 'temporada' },
    { label: 'Producto descontinuado', value: 'descontinuado' },
    { label: 'Fin de colección', value: 'fin_coleccion' },
    { label: 'Promoción especial', value: 'promocion' },
    { label: 'Otro motivo', value: 'otro' },
  ];

  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);
  private readonly wastageService = inject(WastageService);
  private readonly productoService = inject(ProductoService);

  // ✅ FIX NG0100
  private readonly cdr = inject(ChangeDetectorRef);

  readonly loading = this.wastageService.loading;
  readonly error = this.wastageService.error;

  ngOnInit(): void {}

  private isProductoValido(data: any): data is Producto {
    return (
      !!data &&
      typeof data === 'object' &&
      typeof data.id_producto === 'number' &&
      typeof data.codigo === 'string' &&
      typeof data.anexo === 'string' &&
      typeof data.pre_unit === 'number'
    );
  }

  private mapDetailWithStockToProducto(resp: any): Producto | null {
    const p = resp?.producto;
    const s = resp?.stock;

    if (!p || typeof p !== 'object') return null;

    const id_producto = Number(p.id_producto);
    if (!id_producto || Number.isNaN(id_producto)) return null;

    return {
      id_producto,
      id_categoria: Number(p.categoria?.id_categoria ?? 0),
      categoriaNombre: String(p.categoria?.nombre ?? ''),
      codigo: String(p.codigo ?? ''),
      anexo: String(p.nombre ?? ''),
      descripcion: String(p.descripcion ?? ''),
      pre_unit: Number(p.precio_unitario ?? 0),
      estado: Number(p.estado ?? 0) === 1,
      stock: Number(s?.cantidad ?? 0),
      id_almacen: s?.id_almacen != null ? Number(s.id_almacen) : null,
    };
  }

  // ✅ FIX DEFINITIVO para NG0100 en Angular 21 + PrimeNG v21
  // PrimeNG Button dispara un segundo CD tick tras el click.
  // setTimeout(50) garantiza que el cambio ocurra DESPUÉS de ese tick.
  private applyStateSafe(fn: () => void): void {
    setTimeout(() => {
      fn();
      this.cdr.detectChanges();
    }, 50);
  }

  buscarProductoPorCodigo(): void {
    const codigo = (this.codigoProducto ?? '').trim().toUpperCase();

    // reset síncrono (esto es seguro porque va de "algo" a null/false)
    this.productoNoEncontrado = false;
    this.productoSeleccionado = null;

    if (!codigo) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Falta código',
        detail: 'Ingrese el código del producto (ej: R6602).',
        life: 2500,
      });
      return;
    }

    this.productoService.getProductoByCodigoConStock(codigo, this.id_sede_ref).subscribe({
      next: (resp: any) => {
        const producto = this.mapDetailWithStockToProducto(resp);

        if (!producto || !this.isProductoValido(producto)) {
          this.applyStateSafe(() => {
            this.productoNoEncontrado = true;
            this.productoSeleccionado = null;
          });
          return;
        }

        this.applyStateSafe(() => {
          this.productoNoEncontrado = false;
          this.productoSeleccionado = producto;
          this.cantidad = 1;

          if (this.tipoRegistro === 'remate' && this.precioRemate === 0) {
            this.precioRemate = (producto.pre_unit ?? 0) * 0.5;
          }
        });
      },
      error: () => {
        this.applyStateSafe(() => {
          this.productoNoEncontrado = true;
          this.productoSeleccionado = null;
        });
      },
    });
  }

  onTipoChange(): void {
    this.motivo = '';
    this.observaciones = '';

    if (this.tipoRegistro === 'remate') {
      this.codigoRemate = this.generarCodigoRemate();

      if (this.productoSeleccionado && this.precioRemate === 0) {
        this.precioRemate = (this.productoSeleccionado.pre_unit ?? 0) * 0.5;
      }
      return;
    }

    this.codigoRemate = '';
    this.precioRemate = 0;
  }

  generarCodigoRemate(): string {
    const año = new Date().getFullYear();
    const random = Math.floor(Math.random() * 1000);
    return `RMT-${año}-${String(random).padStart(3, '0')}`;
  }

  validarFormulario(): boolean {
    if (!this.tipoRegistro) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error de validación',
        detail: 'Debe seleccionar un tipo de registro (Merma o Remate)',
        life: 3000,
      });
      return false;
    }

    if (!this.productoSeleccionado) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error de validación',
        detail: 'Debe buscar/seleccionar un producto por código',
        life: 3000,
      });
      return false;
    }

    if (!this.productoSeleccionado.id_almacen) {
      this.messageService.add({
        severity: 'error',
        summary: 'No se pudo determinar almacén',
        detail: 'No se encontró id_almacen en el stock del producto para esta sede.',
        life: 4000,
      });
      return false;
    }

    if (!this.cantidad || this.cantidad <= 0) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error de validación',
        detail: 'La cantidad debe ser mayor a 0',
        life: 3000,
      });
      return false;
    }

    const stock = Number(this.productoSeleccionado.stock ?? 0);
    if (this.cantidad > stock) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error de validación',
        detail: `La cantidad no puede ser mayor al stock disponible (${stock} unidades)`,
        life: 3000,
      });
      return false;
    }

    if (!this.motivo) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error de validación',
        detail: 'Debe seleccionar un motivo',
        life: 3000,
      });
      return false;
    }

    if (this.tipoRegistro === 'remate') {
      if (!this.codigoRemate) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error de validación',
          detail: 'El código de remate es obligatorio',
          life: 3000,
        });
        return false;
      }

      if (!this.precioRemate || this.precioRemate <= 0) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error de validación',
          detail: 'El precio de remate debe ser mayor a 0',
          life: 3000,
        });
        return false;
      }

      if (this.precioRemate >= (this.productoSeleccionado.pre_unit ?? 0)) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Advertencia',
          detail: 'El precio de remate debería ser menor al precio original del producto',
          life: 4000,
        });
      }
    }

    return true;
  }

  registrar(): void {
    if (!this.validarFormulario()) return;

    if (this.tipoRegistro === 'merma') {
      const idAlmacen = Number(this.productoSeleccionado?.id_almacen ?? this.id_almacen_ref);

      // ⚠️ Cast IDs SIEMPRE a number explícito
      const idUsuarioRef = Number(this.id_usuario_ref);
      const idSedeRef = Number(this.id_sede_ref);

      // Validar que son números reales
      if (!idUsuarioRef || !idSedeRef || Number.isNaN(idAlmacen)) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Faltan datos obligatorios del usuario, sede o almacén.',
          life: 4000,
        });
        return;
      }

      const detalle = {
        id_producto: this.productoSeleccionado!.id_producto,
        cod_prod: this.productoSeleccionado!.codigo,
        desc_prod: this.productoSeleccionado!.anexo,
        cantidad: this.cantidad,
        pre_unit: this.productoSeleccionado!.pre_unit,
        id_tipo_merma: this.id_tipo_merma,
        observacion: this.observaciones ?? '',
      };

      const dto: CreateWastageDto = {
        id_usuario_ref: idUsuarioRef,
        id_sede_ref: idSedeRef,
        id_almacen_ref: idAlmacen,
        motivo: this.getMotivoLabel(this.motivo),
        detalles: [detalle],
      };

      // LOG PARA DEBUG
      console.log('[WASTAGE DTO]', JSON.stringify(dto, null, 2));
      console.log('[detalles is Array?]', Array.isArray(dto.detalles));
      console.log('id_usuario_ref', typeof dto.id_usuario_ref, dto.id_usuario_ref);
      console.log('id_sede_ref', typeof dto.id_sede_ref, dto.id_sede_ref);

      this.wastageService.createWastage(dto).subscribe({
        next: (res) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Merma registrada',
            detail: `Merma #${res.id_merma} registrada correctamente.`,
            life: 3000,
          });

          setTimeout(() => this.router.navigate(['/admin/mermas-remates']), 1500);
        },
        error: (err) => {
          console.error('Error createWastage:', err);
          console.error('Backend body:', err?.error);

          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: err?.error?.message ?? err?.error ?? 'No se pudo registrar la merma.',
            life: 5000,
          });
        },
      });

      return;
    }

    this.messageService.add({
      severity: 'info',
      summary: 'Pendiente',
      detail: 'El flujo de Remate aún no está conectado a un endpoint.',
      life: 3000,
    });
  }

  cancelar(): void {
    this.router.navigate(['/admin/mermas-remates']);
  }

  limpiarFormulario(): void {
    this.tipoRegistro = null;
    this.codigoProducto = '';
    this.productoSeleccionado = null;
    this.productoNoEncontrado = false;
    this.cantidad = 1;
    this.motivo = '';
    this.observaciones = '';
    this.codigoRemate = '';
    this.precioRemate = 0;
    this.responsableNombre = 'Usuario en sesión';
  }

  getMotivoLabel(value: string): string {
    if (this.tipoRegistro === 'merma') {
      const m = this.motivosMerma.find((x) => x.value === value);
      return m ? m.label : value;
    }
    const r = this.motivosRemate.find((x) => x.value === value);
    return r ? r.label : value;
  }

  calcularPorcentajeDescuento(): number {
    if (!this.productoSeleccionado || !this.precioRemate) return 0;
    const descuento =
      ((this.productoSeleccionado.pre_unit - this.precioRemate) / this.productoSeleccionado.pre_unit) * 100;
    return Math.round(descuento);
  }
}