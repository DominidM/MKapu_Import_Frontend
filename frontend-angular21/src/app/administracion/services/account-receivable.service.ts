import { Injectable, signal, inject, computed } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom, Observable } from 'rxjs';
import { environment } from '../../../enviroments/enviroment';

export type AccountReceivableStatus = 'PENDIENTE' | 'PARCIAL' | 'PAGADO' | 'VENCIDO' | 'CANCELADO';

export interface AccountReceivableResponse {
  id: number;
  salesReceiptId: number;
  userRef: string;
  totalAmount: number;
  paidAmount: number;
  pendingBalance: number;
  issueDate: string;
  dueDate: string;
  updatedAt: string | null;
  status: AccountReceivableStatus;
  paymentTypeId: number;
  currencyCode: string;
  observation: string | null;
}

export interface AccountReceivablePaginatedResponse {
  data: AccountReceivableResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ── Pago individual ───────────────────────────────────────────────────────────
export interface PagoAR {
  id: number;
  fec_pago: string;
  metodo_pago: string;
  referencia: string | null;
  monto: number;
  estado: string;
}

export interface CreateAccountReceivablePayload {
  salesReceiptId: number;
  userRef: string;
  totalAmount: number;
  dueDate: string;
  paymentTypeId: number;
  currencyCode: string;
  observation?: string | null;
}

export interface ApplyPaymentPayload {
  accountReceivableId: number;
  amount: number;
  currencyCode: string;
  paymentTypeId: number;
}

export interface CancelAccountReceivablePayload {
  accountReceivableId: number;
  reason?: string;
}

export interface UpdateDueDatePayload {
  accountReceivableId: number;
  newDueDate: string;
}

// ── Tipos del detalle enriquecido ─────────────────────────────────────────────

export interface ProductoDetalleAR {
  id_prod_ref: any;
  cod_prod: string;
  descripcion: string;
  cantidad: number;
  precio_unit: number;
  igv: number;
  total: number;
}

export interface ClienteDetalleAR {
  id_cliente: any;
  nombre: string;
  documento: string;
  tipo_documento: string;
  direccion: string;
  email: string;
  telefono: string;
}

export interface ComprobanteDetalleAR {
  id_comprobante: number;
  numero_completo: string;
  serie: string;
  numero: number;
  tipo_comprobante: string;
  fec_emision: string;
  estado: string;
  subtotal: number;
  igv: number;
  total: number;
  metodo_pago: string;
  responsable: { nombre: string; nombreSede: string };
  productos: ProductoDetalleAR[];
}

export interface AccountReceivableDetalle {
  cuenta: AccountReceivableResponse;
  cliente: ClienteDetalleAR;
  comprobante: ComprobanteDetalleAR;
  pagos: PagoAR[];
}

@Injectable({ providedIn: 'root' })
export class AccountReceivableService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/sales/account-receivables`;
  private readonly receiptsUrl = `${environment.apiUrl}/sales/receipts`;

  readonly list = signal<AccountReceivableResponse[]>([]);
  readonly selected = signal<AccountReceivableResponse | null>(null);
  readonly total = signal<number>(0);
  readonly page = signal<number>(1);
  readonly totalPages = signal<number>(1);
  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  readonly accounts = this.list.asReadonly();
  readonly totalRecords = this.total.asReadonly();

  readonly kpiTotal = signal<number>(0);
  readonly kpiPendientes = signal<number>(0);
  readonly kpiVencidos = signal<number>(0);
  readonly kpiCancelados = signal<number>(0);

  private _lastSedeId?: number;
  private _lastStatus?: AccountReceivableStatus;
  private _lastLimit = 10;

  readonly pendientes = computed(() => this.list().filter((a) => a.status === 'PENDIENTE'));
  readonly vencidos = computed(() => this.list().filter((a) => a.status === 'VENCIDO'));

  // ── Queries ───────────────────────────────────────────────────────

  async getAll(
    page = 1,
    limit = 10,
    sedeId?: number,
    status?: AccountReceivableStatus | null,
  ): Promise<void> {
    this._lastSedeId = sedeId;
    this._lastStatus = status === null || status === undefined ? undefined : status;
    this._lastLimit = limit;
    const statusParaQuery = status === null ? undefined : status;

    this.loading.set(true);
    this.error.set(null);

    try {
      let httpParams = new HttpParams().set('page', String(page)).set('limit', String(limit));
      if (sedeId != null) httpParams = httpParams.set('sedeId', String(sedeId));
      if (statusParaQuery != null) httpParams = httpParams.set('status', statusParaQuery);

      const kpiBase = new HttpParams().set('page', '1').set('limit', '1');

      const [res, totalRes, pendRes, vencRes, cancelRes] = await Promise.all([
        firstValueFrom(
          this.http.get<AccountReceivablePaginatedResponse>(this.baseUrl, { params: httpParams }),
        ),
        firstValueFrom(
          this.http.get<AccountReceivablePaginatedResponse>(this.baseUrl, { params: kpiBase }),
        ),
        firstValueFrom(
          this.http.get<AccountReceivablePaginatedResponse>(this.baseUrl, {
            params: kpiBase.set('status', 'PENDIENTE'),
          }),
        ),
        firstValueFrom(
          this.http.get<AccountReceivablePaginatedResponse>(this.baseUrl, {
            params: kpiBase.set('status', 'VENCIDO'),
          }),
        ),
        firstValueFrom(
          this.http.get<AccountReceivablePaginatedResponse>(this.baseUrl, {
            params: kpiBase.set('status', 'CANCELADO'),
          }),
        ),
      ]);

      this.list.set(res.data);
      this.total.set(res.total);
      this.page.set(res.page);
      this.totalPages.set(res.totalPages);
      this.kpiTotal.set(totalRes.total);
      this.kpiPendientes.set(pendRes.total);
      this.kpiVencidos.set(vencRes.total);
      this.kpiCancelados.set(cancelRes.total);
    } catch (err: any) {
      this.error.set(err?.error?.message ?? 'Error al cargar cuentas por cobrar');
    } finally {
      this.loading.set(false);
    }
  }

  goToPage(page: number): void {
    this.getAll(page, this._lastLimit, this._lastSedeId, this._lastStatus);
  }

  async loadAll(params: { page?: number; limit?: number } = {}): Promise<void> {
    await this.getAll(params.page ?? 1, params.limit ?? 10);
  }

  /**
   * Carga en paralelo:
   *  1. cuenta base            GET /account-receivables/:id
   *  2. detalle del comprobante GET /receipts/:salesReceiptId/detalle
   *  3. pagos                   GET /account-receivables/:id/payments
   */
  async getDetalleEnriquecidoAsync(id: number): Promise<AccountReceivableDetalle> {
    // Paso 1: cuenta base (necesitamos salesReceiptId antes de continuar)
    const cuenta = await firstValueFrom(
      this.http.get<AccountReceivableResponse>(`${this.baseUrl}/${id}`),
    );

    // Paso 2: detalle comprobante + pagos en paralelo
    const [detalleComprobante, pagos] = await Promise.all([
      firstValueFrom(this.http.get<any>(`${this.receiptsUrl}/${cuenta.salesReceiptId}/detalle`)),
      firstValueFrom(this.http.get<PagoAR[]>(`${this.baseUrl}/${id}/payments`)),
    ]);

    const cliente: ClienteDetalleAR = {
      id_cliente: detalleComprobante.cliente?.id_cliente ?? null,
      nombre: detalleComprobante.cliente?.nombre ?? '—',
      documento: detalleComprobante.cliente?.documento ?? '—',
      tipo_documento: detalleComprobante.cliente?.tipo_documento ?? '—',
      direccion: detalleComprobante.cliente?.direccion ?? '',
      email: detalleComprobante.cliente?.email ?? '',
      telefono: detalleComprobante.cliente?.telefono ?? '',
    };

    const comprobante: ComprobanteDetalleAR = {
      id_comprobante: detalleComprobante.id_comprobante,
      numero_completo: detalleComprobante.numero_completo,
      serie: detalleComprobante.serie,
      numero: detalleComprobante.numero,
      tipo_comprobante: detalleComprobante.tipo_comprobante ?? '—',
      fec_emision: detalleComprobante.fec_emision,
      estado: detalleComprobante.estado,
      subtotal: Number(detalleComprobante.subtotal),
      igv: Number(detalleComprobante.igv),
      total: Number(detalleComprobante.total),
      metodo_pago: detalleComprobante.metodo_pago ?? '—',
      responsable: {
        nombre: detalleComprobante.responsable?.nombre ?? '—',
        nombreSede: detalleComprobante.responsable?.nombreSede ?? '—',
      },
      productos: (detalleComprobante.productos ?? []).map((p: any) => ({
        id_prod_ref: p.id_prod_ref,
        cod_prod: p.cod_prod,
        descripcion: p.descripcion,
        cantidad: Number(p.cantidad),
        precio_unit: Number(p.precio_unit),
        igv: Number(p.igv),
        total: Number(p.total),
      })),
    };

    return { cuenta, cliente, comprobante, pagos: pagos ?? [] };
  }

  async getById(id: number): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const res = await firstValueFrom(
        this.http.get<AccountReceivableResponse>(`${this.baseUrl}/${id}`),
      );
      this.selected.set(res);
    } catch (err: any) {
      this.error.set(err?.error?.message ?? `No se encontró la cuenta #${id}`);
      this.selected.set(null);
    } finally {
      this.loading.set(false);
    }
  }

  // ── Mutations ─────────────────────────────────────────────────────

  async create(payload: CreateAccountReceivablePayload): Promise<AccountReceivableResponse | null> {
    this.loading.set(true);
    this.error.set(null);
    try {
      return await firstValueFrom(this.http.post<AccountReceivableResponse>(this.baseUrl, payload));
    } catch (err: any) {
      this.error.set(err?.error?.message ?? 'Error al crear cuenta por cobrar');
      return null;
    } finally {
      this.loading.set(false);
    }
  }

  async applyPayment(payload: ApplyPaymentPayload): Promise<AccountReceivableResponse | null> {
    this.loading.set(true);
    this.error.set(null);
    try {
      return await firstValueFrom(
        this.http.patch<AccountReceivableResponse>(`${this.baseUrl}/payment`, payload),
      );
    } catch (err: any) {
      this.error.set(err?.error?.message ?? 'Error al registrar el pago');
      return null;
    } finally {
      this.loading.set(false);
    }
  }

  async cancel(payload: CancelAccountReceivablePayload): Promise<AccountReceivableResponse | null> {
    this.loading.set(true);
    this.error.set(null);
    try {
      return await firstValueFrom(
        this.http.patch<AccountReceivableResponse>(`${this.baseUrl}/cancel`, payload),
      );
    } catch (err: any) {
      this.error.set(err?.error?.message ?? 'Error al cancelar la cuenta');
      return null;
    } finally {
      this.loading.set(false);
    }
  }

  async updateDueDate(payload: UpdateDueDatePayload): Promise<AccountReceivableResponse | null> {
    this.loading.set(true);
    this.error.set(null);
    try {
      return await firstValueFrom(
        this.http.patch<AccountReceivableResponse>(`${this.baseUrl}/due-date`, payload),
      );
    } catch (err: any) {
      this.error.set(err?.error?.message ?? 'Error al actualizar la fecha de vencimiento');
      return null;
    } finally {
      this.loading.set(false);
    }
  }

  // ── PDF / Voucher ─────────────────────────────────────────────────

  printVoucher(id: number): Observable<void> {
    return new Observable((observer) => {
      this.http.get(`${this.baseUrl}/${id}/export/thermal`, { responseType: 'blob' }).subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
          const win = window.open(url, '_blank');
          if (win) {
            win.onload = () => {
              win.focus();
              win.print();
            };
            setTimeout(() => {
              try {
                win.focus();
                win.print();
              } catch {}
            }, 1500);
          }
          setTimeout(() => window.URL.revokeObjectURL(url), 60_000);
          observer.next();
          observer.complete();
        },
        error: (err) => observer.error(err),
      });
    });
  }

  downloadVoucher(id: number): Observable<void> {
    return new Observable((observer) => {
      const link = document.createElement('a');
      link.href = `${this.baseUrl}/${id}/export/thermal`;
      link.download = `voucher-cxc-${id}.pdf`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      observer.next();
      observer.complete();
    });
  }

  exportPdf(id: number): void {
    window.open(`${this.baseUrl}/${id}/export/pdf`, '_blank');
  }

  printPdf(id: number): Observable<void> {
    return new Observable((observer) => {
      this.http.get(`${this.baseUrl}/${id}/export/pdf`, { responseType: 'blob' }).subscribe({
        next: (blob) => {
          const blobUrl = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
          const win = window.open(blobUrl, '_blank');
          if (win) {
            win.onload = () => {
              win.focus();
              win.print();
            };
            setTimeout(() => {
              try {
                win.focus();
                win.print();
              } catch {}
            }, 1500);
          }
          setTimeout(() => window.URL.revokeObjectURL(blobUrl), 60_000);
          observer.next();
          observer.complete();
        },
        error: (err) => observer.error(err),
      });
    });
  }

  downloadPdf(id: number): Observable<void> {
    return new Observable((observer) => {
      const link = document.createElement('a');
      link.href = `${this.baseUrl}/${id}/export/pdf`;
      link.download = `cuenta-por-cobrar-${id}.pdf`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      observer.next();
      observer.complete();
    });
  }

  sendByEmail(id: number): Observable<{ message: string; sentTo: string }> {
    return this.http.post<{ message: string; sentTo: string }>(
      `${this.baseUrl}/${id}/send-email`,
      {},
    );
  }

  getWhatsAppStatus(): Observable<{ ready: boolean; qr: string | null }> {
    return this.http.get<{ ready: boolean; qr: string | null }>(`${this.baseUrl}/whatsapp/status`);
  }

  sendByWhatsApp(id: number): Observable<{ message: string; sentTo: string }> {
    return this.http.post<{ message: string; sentTo: string }>(
      `${this.baseUrl}/${id}/send-whatsapp`,
      {},
    );
  }
}
