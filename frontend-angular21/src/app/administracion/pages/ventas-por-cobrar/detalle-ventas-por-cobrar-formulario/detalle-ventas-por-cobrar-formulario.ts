import { Component, OnInit, OnDestroy, signal, computed, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { Subscription } from 'rxjs';

import { Card } from 'primeng/card';
import { Button } from 'primeng/button';
import { Divider } from 'primeng/divider';
import { Tag } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { Skeleton } from 'primeng/skeleton';
import { Tooltip } from 'primeng/tooltip';
import { Toast } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import {
  AccountReceivableService,
  AccountReceivableResponse,
  ClienteDetalleAR,
  ComprobanteDetalleAR,
  PagoAR,
} from '../../../services/account-receivable.service';
import { environment } from '../../../../../enviroments/enviroment';

// ─── View Models ──────────────────────────────────────────────────────────────

interface DetalleProductoVM {
  cod_prod:    string;
  descripcion: string;
  cantidad:    number;
  pre_uni:     number;
  igv:         number;
  total:       number;
}

interface ComprobanteOrigenVM {
  numero_completo: string;
  tipo_label:      string;
  fec_emision:     string;
  responsable:     string;
  sede_nombre:     string;
  total:           number;
  estado:          string;
  detalles:        DetalleProductoVM[];
}

interface CuentaPorCobrarVM {
  id:               number;
  cliente_nombre:   string;
  cliente_doc:      string;
  cliente_email:    string;
  cliente_telefono: string;
  fec_creacion:     string;
  fec_vencimiento:  string;
  tipo_pago:        string;
  moneda:           string;
  monto_total:      number;
  monto_pagado:     number;
  saldo:            number;
  estado:           string;
  observacion:      string | null;
  comprobante:      ComprobanteOrigenVM | null;
}

// ─── Mapas ────────────────────────────────────────────────────────────────────

const ICONO_PAGO: Record<string, string> = {
  EFECTIVO:      'pi pi-money-bill',
  TARJETA:       'pi pi-credit-card',
  YAPE:          'pi pi-mobile',
  PLIN:          'pi pi-mobile',
  TRANSFERENCIA: 'pi pi-arrow-right-arrow-left',
};

@Component({
  selector: 'app-detalle-venta-por-cobrar',
  standalone: true,
  imports: [
    CommonModule,
    Card,
    Button,
    Divider,
    Tag,
    TableModule,
    Skeleton,
    Tooltip,
    Toast,
  ],
  providers: [MessageService],
  templateUrl: './detalle-venta-por-cobrar.html',
  styleUrls: ['./detalle-venta-por-cobrar.css'],
})
export class DetalleVentaPorCobrar implements OnInit, OnDestroy {

  private readonly route          = inject(ActivatedRoute);
  private readonly router         = inject(Router);
  private readonly location       = inject(Location);
  private readonly messageService = inject(MessageService);
  private readonly arService      = inject(AccountReceivableService);

  readonly tituloKicker    = 'ADMINISTRACIÓN · VENTAS POR COBRAR · DETALLE';
  readonly subtituloKicker = 'DETALLE DE VENTA POR COBRAR';
  readonly iconoCabecera   = 'pi pi-credit-card';

  cuenta  = signal<CuentaPorCobrarVM | null>(null);
  pagos   = signal<PagoAR[]>([]);
  loading = signal(true);

  totalPagado = computed(() =>
    this.pagos().reduce((sum, p) => sum + Number(p.monto), 0)
  );

  private subs = new Subscription();

  ngOnInit(): void {
    this.subs.add(
      this.route.paramMap.subscribe((params) => {
        const id = params.get('id');
        id ? this.cargarDetalle(+id) : this.volver();
      }),
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  cargarDetalle(id: number): void {
    this.loading.set(true);
    this.cuenta.set(null);
    this.pagos.set([]);

    this.arService
      .getDetalleEnriquecidoAsync(id)
      .then(({ cuenta, cliente, comprobante, pagos }) => {
        this.cuenta.set(this.mapVM(cuenta, cliente, comprobante));
        this.pagos.set(pagos);
        this.loading.set(false);
      })
      .catch((err) => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary:  'Error',
          detail:   err?.error?.message ?? 'No se pudo cargar el detalle.',
          life:     3000,
        });
        setTimeout(() => this.volver(), 2500);
      });
  }

  private mapVM(
    c:    AccountReceivableResponse,
    cli:  ClienteDetalleAR,
    comp: ComprobanteDetalleAR,
  ): CuentaPorCobrarVM {
    return {
      id:               c.id,
      cliente_nombre:   cli.nombre,
      cliente_doc:      cli.documento,
      cliente_email:    cli.email    || '—',
      cliente_telefono: cli.telefono || '—',
      fec_creacion:     c.issueDate,
      fec_vencimiento:  c.dueDate,
      tipo_pago:        comp.metodo_pago || String(c.paymentTypeId),
      moneda:           c.currencyCode,
      monto_total:      Number(c.totalAmount),
      monto_pagado:     Number(c.paidAmount),
      saldo:            Number(c.pendingBalance),
      estado:           c.status,
      observacion:      c.observation,
      comprobante: {
        numero_completo: comp.numero_completo,
        tipo_label:      comp.tipo_comprobante,
        fec_emision:     comp.fec_emision,
        responsable:     comp.responsable.nombre,
        sede_nombre:     comp.responsable.nombreSede,
        total:           comp.total,
        estado:          comp.estado,
        detalles:        comp.productos.map((p) => ({
          cod_prod:    p.cod_prod,
          descripcion: p.descripcion,
          cantidad:    p.cantidad,
          pre_uni:     p.precio_unit,
          igv:         p.igv,
          total:       p.total,
        })),
      },
    };
  }

  volver():    void { this.location.back(); }
  irListado(): void { this.router.navigate(['/admin/ventas-por-cobrar']); }

  registrarPago(id: number): void {
    this.router.navigate(['/admin/ventas-por-cobrar/pagar', id]);
  }

  imprimirDetalle(): void {
    this.messageService.add({
      severity: 'info',
      summary:  'Imprimir',
      detail:   'Función de impresión en desarrollo.',
      life:     3000,
    });
  }

  imprimirPago(pago: PagoAR): void {
    const c = this.cuenta();
    if (!c) return;
    window.open(
      `${environment.apiUrl}/sales/account-receivables/${c.id}/payments/${pago.id}/voucher`,
      '_blank'
    );
  }

  // ─── Helpers UI ───────────────────────────────────────────────────────────
  getEstadoSeverity(estado: string): 'success' | 'warn' | 'danger' | 'info' | 'secondary' {
    const map: Record<string, 'success' | 'warn' | 'danger' | 'info' | 'secondary'> = {
      PAGADO:    'success',
      PARCIAL:   'warn',
      PENDIENTE: 'info',
      VENCIDO:   'danger',
      ANULADO:   'secondary',
    };
    return map[estado] ?? 'secondary';
  }

  getEstadoComprobanteTag(estado: string): 'success' | 'warn' | 'danger' | 'secondary' {
    const map: Record<string, 'success' | 'warn' | 'danger' | 'secondary'> = {
      EMITIDO:   'success',
      ANULADO:   'warn',
      RECHAZADO: 'danger',
    };
    return map[estado] ?? 'secondary';
  }

  getPagoEstadoTag(estado: string): 'success' | 'warn' | 'danger' | 'info' {
    const map: Record<string, 'success' | 'warn' | 'danger' | 'info'> = {
      CONFIRMADO: 'success',
      PENDIENTE:  'warn',
      RECHAZADO:  'danger',
    };
    return map[estado] ?? 'info';
  }

  getIconoPago(medio: string): string {
    return ICONO_PAGO[medio?.toUpperCase()] ?? 'pi pi-wallet';
  }

  getPorcentajePago(c: CuentaPorCobrarVM): number {
    if (!c.monto_total || c.monto_total === 0) return 0;
    return Math.min((c.monto_pagado / c.monto_total) * 100, 100);
  }

  getDiasRestantes(fecVenc: string | Date | null): number {
    if (!fecVenc) return 0;
    const hoy  = new Date(); hoy.setHours(0, 0, 0, 0);
    const venc = new Date(fecVenc); venc.setHours(0, 0, 0, 0);
    return Math.round((venc.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
  }

  getDiasLabel(fecVenc: string | Date | null): string {
    const dias = this.getDiasRestantes(fecVenc);
    if (dias < 0)   return 'Vencido';
    if (dias === 0) return 'Hoy';
    if (dias === 1) return '1 día';
    return `${dias} días`;
  }

  getDiasBadgeClass(fecVenc: string | Date | null): string {
    const dias = this.getDiasRestantes(fecVenc);
    if (dias < 0)   return 'dias-badge dias-badge--vencido';
    if (dias === 0) return 'dias-badge dias-badge--hoy';
    if (dias <= 3)  return 'dias-badge dias-badge--urgente';
    if (dias <= 7)  return 'dias-badge dias-badge--proximo';
    return 'dias-badge dias-badge--ok';
  }

  getDiasColor(fecVenc: string | Date | null): string {
    const dias = this.getDiasRestantes(fecVenc);
    if (dias < 0)  return '#f87171';
    if (dias <= 3) return '#fb923c';
    if (dias <= 7) return '#facc15';
    return 'var(--text-color)';
  }
}