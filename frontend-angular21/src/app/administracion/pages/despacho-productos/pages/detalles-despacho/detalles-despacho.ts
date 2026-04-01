import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';

import { ConfirmacionDespachoData } from '../../../../services/confirmacion-despacho.state.service';
import { DispatchDetailStatus, DispatchStatus, Dispatch } from '../../../../interfaces/dispatch.interfaces';
import { DispatchService, EnrichedDispatch } from '../../../../services/dispatch.service';

type DispatchProductInfo = NonNullable<EnrichedDispatch['productosDetalle']>[number];

interface DispatchProductRow {
  idProducto: number;
  codigo: string;
  descripcion: string;
  cantidadSolicitada: number;
  cantidadDespachada: number;
  cantidadPendiente: number;
  precioUnitario: number;
  total: number;
  estado: DispatchDetailStatus;
  tieneFaltante: boolean;
}

function cleanText(value: string | number | null | undefined, fallback = 'Sin registro'): string {
  const normalized = String(value ?? '').trim();
  return normalized.length > 0 ? normalized : fallback;
}

function resolveDeliveryType(address: string | null | undefined): 'tienda' | 'delivery' {
  const normalized = (address ?? '').toLowerCase();
  return normalized.includes('tienda') || normalized.includes('recojo') ? 'tienda' : 'delivery';
}

@Component({
  selector: 'app-detalles-despacho',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, TagModule, TableModule, ToastModule, ConfirmDialogModule],
  providers: [MessageService, ConfirmationService],
  templateUrl: './detalles-despacho.html',
  styleUrl: './detalles-despacho.css',
})
export class DetallesDespacho {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dispatchService = inject(DispatchService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  private readonly paramMap = toSignal(this.route.paramMap, {
    initialValue: convertToParamMap({}),
  });

  readonly loading = signal(true);
  readonly actionLoading = signal(false);
  readonly errorMsg = signal<string | null>(null);
  readonly despacho = signal<EnrichedDispatch | null>(null);

  readonly despachoId = computed(() => this.paramMap().get('id'));
  readonly estadoKey = computed<DispatchStatus>(() => this.despacho()?.estado ?? 'GENERADO');
  readonly estadoLabel = computed(() => this.getEstadoLabel(this.estadoKey()));
  readonly comprobanteLabel = computed(() => {
    const detail = this.despacho();
    if (!detail) return '---';
    return cleanText(detail.comprobante, `Venta #${detail.id_venta_ref}`);
  });
  readonly tipoComprobanteLabel = computed(() => {
    const explicit = cleanText(this.despacho()?.tipoComprobante, '');
    if (explicit) return explicit;
    const comprobante = this.comprobanteLabel();
    if (comprobante.startsWith('F')) return 'Factura Electronica';
    if (comprobante.startsWith('B')) return 'Boleta Electronica';
    if (comprobante.startsWith('N')) return 'Nota de Venta';
    return 'Comprobante';
  });
  readonly clienteNombre = computed(() => cleanText(this.despacho()?.clienteNombre, 'Cliente no registrado'));
  readonly clienteDocumento = computed(() => cleanText(this.despacho()?.clienteDoc, 'Sin documento'));
  readonly clienteTelefono = computed(() => cleanText(this.despacho()?.clienteTelefono, 'Sin telefono'));
  readonly clienteDireccion = computed(() => cleanText(this.despacho()?.clienteDireccion, 'Sin direccion registrada'));
  readonly sedeNombre = computed(() => cleanText(this.despacho()?.sedeNombre, 'Sede no registrada'));
  readonly responsableNombre = computed(() => cleanText(this.despacho()?.responsableNombre, 'Sin responsable asignado'));
  readonly metodoPago = computed(() => cleanText(this.despacho()?.metodoPago, 'Sin metodo de pago'));
  readonly deliveryType = computed(() => resolveDeliveryType(this.despacho()?.direccion_entrega));
  readonly deliveryTypeLabel = computed(() => this.deliveryType() === 'tienda' ? 'Recojo en tienda' : 'Delivery');
  readonly totalItems = computed(() => this.productos().length);
  readonly totalUnidades = computed(() => this.productos().reduce((acc, item) => acc + item.cantidadSolicitada, 0));
  readonly totalDespachado = computed(() => this.productos().reduce((acc, item) => acc + item.cantidadDespachada, 0));
  readonly totalPendiente = computed(() => this.productos().reduce((acc, item) => acc + item.cantidadPendiente, 0));
  readonly subtotalAmount = computed(() => Number(this.despacho()?.subtotal ?? 0));
  readonly igvAmount = computed(() => Number(this.despacho()?.igv ?? 0));
  readonly descuentoAmount = computed(() => Number(this.despacho()?.descuento ?? 0));
  readonly totalAmount = computed(() => Number(this.despacho()?.total ?? 0));
  readonly itemsLabel = computed(() => {
    const count = this.totalItems();
    return count === 1 ? '1 item' : `${count} items`;
  });
  readonly unidadesLabel = computed(() => {
    const count = this.totalUnidades();
    return count === 1 ? '1 unidad' : `${count} unidades`;
  });
  readonly faltantesLabel = computed(() => this.despacho()?.tieneFaltantes ? 'Con faltantes' : 'Sin faltantes');
  readonly mapsUrl = computed(() => {
    const address = this.despacho()?.direccion_entrega?.trim();
    return address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${address}, Lima, Peru`)}` : null;
  });
  readonly canConfirmSalida = computed(() => this.estadoKey() === 'GENERADO' || this.estadoKey() === 'EN_PREPARACION');
  readonly canMarkDelivered = computed(() => this.estadoKey() === 'EN_PREPARACION' || this.estadoKey() === 'EN_TRANSITO');
  readonly canCancel = computed(() => this.estadoKey() !== 'ENTREGADO' && this.estadoKey() !== 'CANCELADO');
  readonly canPrint = computed(() => this.estadoKey() !== 'GENERADO' && this.estadoKey() !== 'CANCELADO');
  readonly totalPreparados = computed(() => this.productos().filter((item) => item.estado === 'PREPARADO').length);
  readonly totalDespachados = computed(() => this.productos().filter((item) => item.estado === 'DESPACHADO').length);
  readonly totalPendientesDetalle = computed(() => this.productos().filter((item) => item.estado === 'PENDIENTE').length);
  readonly totalFaltantesDetalle = computed(() => this.productos().filter((item) => item.estado === 'FALTANTE').length);

  constructor() {
    effect((onCleanup) => {
      const id = this.despachoId();
      if (!id) {
        this.loading.set(false);
        this.errorMsg.set('ID de despacho invalido.');
        this.despacho.set(null);
        return;
      }
      const subscription = this.fetchDetalle(Number(id));
      onCleanup(() => subscription.unsubscribe());
    });
  }

  readonly productos = computed<DispatchProductRow[]>(() => {
    const detail = this.despacho();
    if (!detail) return [];

    const detailMap = new Map<number, DispatchProductInfo>();
    for (const product of detail.productosDetalle ?? []) {
      detailMap.set(product.id_prod_ref, product);
    }

    return (detail.detalles ?? []).map((row) => {
      const productInfo = detailMap.get(row.id_producto);
      const cantidadSolicitada = Number(productInfo?.cantidad ?? row.cantidad_solicitada ?? 0);
      const cantidadDespachada = Number(row.cantidad_despachada ?? 0);
      const total = Number(productInfo?.total ?? 0);
      const precioUnitario = Number(productInfo?.precio_unit ?? 0);
      return {
        idProducto: row.id_producto,
        codigo: cleanText(productInfo?.cod_prod, `#${row.id_producto}`),
        descripcion: cleanText(productInfo?.descripcion, `Producto #${row.id_producto}`),
        cantidadSolicitada,
        cantidadDespachada,
        cantidadPendiente: Math.max(cantidadSolicitada - cantidadDespachada, 0),
        precioUnitario,
        total,
        estado: row.estado,
        tieneFaltante: row.tieneFaltante,
      };
    });
  });

  private fetchDetalle(id: number, showLoading = true) {
    if (showLoading) this.loading.set(true);
    this.errorMsg.set(null);

    return this.dispatchService.getDispatchById(id).subscribe({
      next: (response) => {
        this.despacho.set(response as EnrichedDispatch);
        this.loading.set(false);
        this.actionLoading.set(false);
      },
      error: (error) => {
        if (showLoading) this.despacho.set(null);
        this.loading.set(false);
        this.actionLoading.set(false);
        this.errorMsg.set(error?.error?.message ?? 'No se pudo cargar el despacho.');
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cargar el detalle del despacho.',
        });
      },
    });
  }

  volver(): void {
    this.router.navigate(['/admin/despacho-productos']);
  }

  confirmarSalida(): void {
    const detail = this.despacho();
    if (!detail || this.actionLoading()) return;

    this.confirmationService.confirm({
      header: 'Confirmar salida',
      message: `Deseas confirmar la salida del despacho #${detail.id_despacho}?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Si, confirmar',
      rejectLabel: 'Volver',
      accept: () => {
        this.actionLoading.set(true);

        const navigateToConfirmation = (dispatchData: Dispatch) => {
          this.actionLoading.set(false);
          this.navegarAConfirmacion({ ...detail, ...dispatchData } as EnrichedDispatch, 'EN_TRANSITO');
        };

        const iniciarTransito = (dispatchData: Dispatch) => {
          this.dispatchService.iniciarTransito(dispatchData.id_despacho, { fecha_salida: new Date() }).subscribe({
            next: (updated) => navigateToConfirmation(updated),
            error: () => navigateToConfirmation(dispatchData),
          });
        };

        const marcarYTransitar = (dispatchData: Dispatch) => {
          const pendientes = (dispatchData.detalles ?? []).filter((item) => item.estado === 'PENDIENTE');
          if (!pendientes.length) {
            iniciarTransito(dispatchData);
            return;
          }

          let processed = 0;
          let transitTriggered = false;
          const tryTransit = () => {
            if (transitTriggered) return;
            transitTriggered = true;
            iniciarTransito(dispatchData);
          };

          for (const pending of pendientes) {
            this.dispatchService
              .marcarDetallePreparado(pending.id_detalle_despacho!, { cantidad_despachada: pending.cantidad_solicitada })
              .subscribe({
                next: () => {
                  processed += 1;
                  if (processed === pendientes.length) tryTransit();
                },
                error: () => tryTransit(),
              });
          }
        };

        if (detail.estado === 'GENERADO') {
          this.dispatchService.iniciarPreparacion(detail.id_despacho).subscribe({
            next: (updated) => marcarYTransitar(updated),
            error: () => marcarYTransitar(detail),
          });
          return;
        }

        if (detail.estado === 'EN_PREPARACION') {
          marcarYTransitar(detail);
          return;
        }

        navigateToConfirmation(detail);
      },
    });
  }

  cambiarEstado(nuevoEstado: 'ENTREGADO' | 'CANCELADO'): void {
    const detail = this.despacho();
    if (!detail || this.actionLoading()) return;

    const actionLabel = nuevoEstado === 'ENTREGADO' ? 'marcar como entregado' : 'cancelar';

    this.confirmationService.confirm({
      header: 'Cambiar estado',
      message: `Deseas ${actionLabel} el despacho #${detail.id_despacho}?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Si, continuar',
      rejectLabel: 'Volver',
      accept: () => {
        this.actionLoading.set(true);

        const request = nuevoEstado === 'CANCELADO'
          ? this.dispatchService.cancelarDespacho(detail.id_despacho)
          : this.dispatchService.confirmarEntrega(detail.id_despacho, { fecha_entrega: new Date() });

        request.subscribe({
          next: (updated) => {
            this.despacho.set({ ...detail, ...updated } as EnrichedDispatch);
            this.actionLoading.set(false);
            this.messageService.add({
              severity: 'success',
              summary: nuevoEstado === 'ENTREGADO' ? 'Despacho entregado' : 'Despacho cancelado',
              detail: `El despacho #${detail.id_despacho} fue actualizado correctamente.`,
            });
          },
          error: () => {
            this.actionLoading.set(false);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'No se pudo actualizar el estado del despacho.',
            });
          },
        });
      },
    });
  }

  imprimirCopia(): void {
    const detail = this.despacho();
    if (!detail) return;

    const html = this.generarHtmlCopia(this.buildConfirmationPayload(detail, this.estadoKey(), true));
    const printWindow = window.open('', '_blank', 'width=430,height=800');

    if (!printWindow) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Aviso',
        detail: 'Activa las ventanas emergentes para imprimir.',
      });
      return;
    }

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  }

  getEstadoSeverity(estado: DispatchStatus): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    switch (estado) {
      case 'ENTREGADO':
        return 'success';
      case 'EN_TRANSITO':
        return 'warn';
      case 'EN_PREPARACION':
        return 'info';
      case 'CANCELADO':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  getEstadoLabel(estado: DispatchStatus): string {
    const labels: Record<DispatchStatus, string> = {
      GENERADO: 'Generado',
      EN_PREPARACION: 'En preparacion',
      EN_TRANSITO: 'En transito',
      ENTREGADO: 'Entregado',
      CANCELADO: 'Cancelado',
    };
    return labels[estado] ?? estado;
  }

  getDetalleSeverity(estado: DispatchDetailStatus): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    switch (estado) {
      case 'DESPACHADO':
        return 'success';
      case 'PREPARADO':
        return 'info';
      case 'FALTANTE':
        return 'danger';
      default:
        return 'warn';
    }
  }

  getDetalleLabel(estado: DispatchDetailStatus): string {
    const labels: Record<DispatchDetailStatus, string> = {
      PENDIENTE: 'Pendiente',
      PREPARADO: 'Preparado',
      DESPACHADO: 'Despachado',
      FALTANTE: 'Faltante',
    };
    return labels[estado] ?? estado;
  }

  private navegarAConfirmacion(detail: EnrichedDispatch, estadoForzado: string, esCopia = false): void {
    const payload = this.buildConfirmationPayload(detail, estadoForzado, esCopia);
    sessionStorage.setItem('confirmar_despacho_data', JSON.stringify(payload));
    this.router.navigateByUrl('/admin/despacho-productos/confirmar-despacho');
  }

  private buildConfirmationPayload(detail: EnrichedDispatch, estadoForzado: string, esCopia = false): ConfirmacionDespachoData {
    return {
      id_despacho: detail.id_despacho,
      numeroComprobante: this.comprobanteLabel(),
      tipoComprobante: this.tipoComprobanteLabel(),
      fechaEmision: String(detail.fechaEmision ?? detail.fecha_creacion ?? new Date().toISOString()),
      clienteNombre: this.clienteNombre(),
      clienteDoc: this.clienteDocumento(),
      clienteTipoDoc: this.clienteDocumento().length === 11 ? 'RUC' : 'DNI',
      clienteTelefono: this.clienteTelefono(),
      clienteDireccion: this.clienteDireccion(),
      sedeNombre: this.sedeNombre(),
      responsableNombre: this.responsableNombre(),
      direccionEntrega: cleanText(detail.direccion_entrega, 'Sin direccion registrada'),
      tipoEntrega: this.deliveryType(),
      observacion: detail.observacion ?? null,
      estado: estadoForzado,
      subtotal: this.subtotalAmount(),
      igv: this.igvAmount(),
      descuento: this.descuentoAmount(),
      total: this.totalAmount(),
      metodoPago: this.metodoPago(),
      esCopia,
      productos: this.productos().map((item) => ({
        id_producto: item.idProducto,
        nombre: item.descripcion,
        codigo: item.codigo,
        cantidad_solicitada: item.cantidadSolicitada,
        cantidad_despachada: item.cantidadDespachada,
        precio_unit: item.precioUnitario,
        total_item: item.total,
        estado: item.estado,
      })),
    };
  }

  private generarHtmlCopia(data: ConfirmacionDespachoData): string {
    const totalStr = Number(data.total ?? 0).toFixed(2);
    const tipoEntregaLabel = data.tipoEntrega === 'delivery' ? 'DELIVERY' : 'TIENDA';
    const filasProductos = (data.productos ?? []).map((product) => {
      return `<tr>
        <td class="td-desc">${product.nombre}<span class="sku">${product.codigo}</span></td>
        <td class="td-cant">${product.cantidad_solicitada}</td>
        <td class="td-tot">S/ ${totalStr}</td>
      </tr>`;
    }).join('');

    const css = `
      *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
      body{font-family:'Courier New',Courier,monospace;font-size:11px;line-height:1.6;color:#000;background:#fff;width:72mm;margin:0 auto;padding:4mm 3mm 8mm}
      .c{text-align:center}.r{text-align:right}.bold{font-weight:700}
      hr.dash{border:none;border-top:1px dashed #000;margin:4px 0}
      .copia-mark{text-align:center;font-size:11px;font-weight:900;letter-spacing:3px;border:1.5px solid #000;padding:3px 4px;margin:4px 0}
      table.prods{width:100%;border-collapse:collapse;font-size:10px;margin:2px 0}
      table.prods thead th{border-top:2px solid #000;border-bottom:2px solid #000;padding:2px 1px;font-size:9.5px;font-weight:700}
      table.prods tbody td{padding:2.5px 1px;vertical-align:top}
      table.prods tbody tr:last-child td{border-bottom:2px solid #000}
      .td-desc{width:50%}.td-cant{width:25%;text-align:center}.td-tot{width:25%;text-align:right;font-weight:700}
      .sku{display:block;font-size:8.5px;color:#555;font-style:italic}
      .footer{text-align:center;font-size:9.5px;line-height:1.55;margin-top:6px}
      @media print{html,body{width:72mm}@page{size:80mm auto;margin:0}}
    `;

    return `<!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>COPIA ${data.numeroComprobante}</title>
        <style>${css}</style>
      </head>
      <body>
        <p class="c bold" style="font-size:26px;letter-spacing:-1px;line-height:1">mkapu</p>
        <p class="c" style="font-size:9px;letter-spacing:5px;text-transform:uppercase">import</p>
        <hr class="dash">
        <p class="copia-mark">*** COPIA ***</p>
        <p class="c bold" style="font-size:12px">${data.tipoComprobante}</p>
        <hr class="dash">
        <p class="c bold">${data.clienteNombre}</p>
        <p class="c">${data.clienteDoc}</p>
        <p class="c" style="font-size:9px">${data.clienteTelefono}</p>
        <hr class="dash">
        <p class="c bold">${tipoEntregaLabel}</p>
        <p class="c" style="font-size:10px">${data.direccionEntrega}</p>
        <hr class="dash">
        <table class="prods">
          <thead><tr><th class="td-desc">Producto</th><th class="td-cant">Cant</th><th class="td-tot">Total</th></tr></thead>
          <tbody>${filasProductos}</tbody>
        </table>
        <hr class="dash">
        <p class="r bold" style="font-size:13px">S/ ${totalStr}</p>
        <div class="footer">
          <p class="bold">**GRACIAS POR SU COMPRA**</p>
        </div>
        <script>window.onload=function(){setTimeout(function(){window.print();},300);}</script>
      </body>
      </html>`;
  }
}