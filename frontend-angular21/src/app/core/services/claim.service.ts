import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { firstValueFrom, Observable } from 'rxjs';
import { environment } from '../../../enviroments/enviroment';
import { AuthService } from '../../auth/services/auth.service';

export enum ClaimStatus {
  REGISTRADO = 'REGISTRADO',
  EN_PROCESO = 'EN_PROCESO',
  RESUELTO   = 'RESUELTO',
  RECHAZADO  = 'RECHAZADO',
}

export interface ClaimResponseDto {
  id:                  string;
  codigoReclamo?:      string;
  saleReceiptId:       string;
  customerId:          string;
  reason:              string;
  description:         string;
  status:              ClaimStatus;
  createdAt:           string;
  updatedAt?:          string;
  customerName:        string;
  productDescription:  string;
  registerDate:        Date;
}

export interface ClaimListResponse {
  data:  ClaimResponseDto[];
  total: number;
}

export interface RegisterClaimPayload {
  id_comprobante:  number;
  id_vendedor_ref: string;
  motivo:          string;
  descripcion:     string;
  id_sede?:        number;
  detalles?:       ClaimDetailDto[];
}

export interface ClaimDetailDto {
  tipo:       string;
  descripcion: string;
}

export interface ChangeClaimStatusDto {
  status: ClaimStatus;
}

@Injectable({ providedIn: 'root' })
export class ClaimService {
  private readonly http    = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/sales/claims`;
  private readonly DIAS_GARANTIA = 60;

  readonly claims   = signal<ClaimResponseDto[]>([]);
  readonly selected = signal<ClaimResponseDto | null>(null);
  readonly loading  = signal<boolean>(false);
  readonly error    = signal<string | null>(null);

  private get headers(): HttpHeaders {
    return new HttpHeaders({ 'x-role': 'Administrador' });
  }

  readonly stats = computed(() => {
    const list = this.claims();
    return {
      total:       list.length,
      registrados: list.filter(c => c.status === ClaimStatus.REGISTRADO).length,
      en_proceso:  list.filter(c => c.status === ClaimStatus.EN_PROCESO).length,
      resueltos:   list.filter(c => c.status === ClaimStatus.RESUELTO).length,
      rechazados:  list.filter(c => c.status === ClaimStatus.RECHAZADO).length,
    };
  });

  // ── Garantía ──────────────────────────────────────────────────────

  calcularDiasRestantes(fechaEmision: Date | string): number {
    const dias = this.DIAS_GARANTIA - this.calcularDiasTranscurridos(fechaEmision);
    return dias > 0 ? dias : 0;
  }

  validarGarantia(fechaEmision: Date | string): boolean {
    return this.calcularDiasTranscurridos(fechaEmision) <= this.DIAS_GARANTIA;
  }

  private calcularDiasTranscurridos(fecha: Date | string): number {
    return Math.floor((Date.now() - new Date(fecha).getTime()) / (1000 * 60 * 60 * 24));
  }

  // ── Carga ─────────────────────────────────────────────────────────

  async loadClaims(sedeId: string, filters: any = {}): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      let params = new HttpParams();
      Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
          params = params.set(key, filters[key]);
        }
      });

      const res: any = await firstValueFrom(
        this.http.get(`${this.baseUrl}/sede/${sedeId}`, { params })
      );

      const rawData = res.data || res;
      this.claims.set(rawData.map((c: any): ClaimResponseDto => ({
        id:                 c.claimId ? String(c.claimId) : '',
        saleReceiptId:      c.receiptId ? String(c.receiptId) : '',
        customerId:         c.sellerId || '',
        reason:             c.reason,
        description:        c.description,
        status:             c.status,
        createdAt:          c.registeredAt ? new Date(c.registeredAt).toISOString() : '',
        updatedAt:          c.resolvedAt ? new Date(c.resolvedAt).toISOString() : undefined,
        registerDate:       c.registeredAt ? new Date(c.registeredAt) : new Date(),
        customerName:       'Cliente Generico',
        productDescription: 'Artículos de venta',
      })));
    } catch (err: any) {
      this.error.set(err?.error?.message ?? 'Error al cargar los reclamos de la sede');
    } finally {
      this.loading.set(false);
    }
  }

  async getById(id: string): Promise<ClaimResponseDto | null> {
    this.loading.set(true);
    try {
      const res = await firstValueFrom(
        this.http.get<ClaimResponseDto>(`${this.baseUrl}/${id}`)
      );
      this.selected.set(res);
      return res;
    } catch (err: any) {
      this.error.set(err?.error?.message ?? 'No se encontró el reclamo');
      return null;
    } finally {
      this.loading.set(false);
    }
  }

  async register(payload: RegisterClaimPayload): Promise<ClaimResponseDto | null> {
    this.loading.set(true);
    try {
      const res: any = await firstValueFrom(this.http.post(this.baseUrl, payload));
      const mapped: ClaimResponseDto = {
        id:                 String(res.claimId || res.id || ''),
        codigoReclamo:      res.codigoReclamo || res.codigo_reclamo || undefined,
        saleReceiptId:      String(res.receiptId || res.id_comprobante || ''),
        customerId:         res.sellerId || res.id_vendedor_ref || '',
        reason:             res.reason || res.motivo || '',
        description:        res.description || res.descripcion || '',
        status:             res.status || res.estado || ClaimStatus.REGISTRADO,
        createdAt:          res.registeredAt || res.fec_creacion || new Date().toISOString(),
        registerDate:       new Date(res.registeredAt || res.fec_creacion || new Date()),
        customerName:       '',
        productDescription: '',
      };
      this.claims.update(list => [mapped, ...list]);
      return mapped;
    } catch (err: any) {
      this.error.set(err?.error?.message ?? 'Error al registrar el reclamo');
      return null;
    } finally {
      this.loading.set(false);
    }
  }

  async changeStatus(id: string, status: ClaimStatus): Promise<ClaimResponseDto | null> {
    this.loading.set(true);
    try {
      const res = await firstValueFrom(
        this.http.patch<ClaimResponseDto>(`${this.baseUrl}/${id}/status`, { status })
      );
      this._updateInList(res);
      return res;
    } catch (err: any) {
      this.error.set(err?.error?.message ?? 'Error al actualizar el estado');
      return null;
    } finally {
      this.loading.set(false);
    }
  }

  // ── Acciones de documento ─────────────────────────────────────────

  imprimirReclamo(id: number | string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${id}/pdf`, { responseType: 'blob' });
  }

  getReclamoById(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}`);
  }

  atenderReclamo(id: number, respuesta: string): Observable<any> {
    return this.http.patch<any>(
      `${this.baseUrl}/${id}/attend`,
      { respuesta },
      { headers: this.headers }
    );
  }

  resolverReclamo(id: number, respuesta: string): Observable<any> {
    return this.http.patch<any>(
      `${this.baseUrl}/${id}/resolve`,
      { respuesta },
      { headers: this.headers }
    );
  }

  // ── Email ─────────────────────────────────────────────────────────

  sendByEmail(id: number | string): Observable<{ message: string; sentTo: string }> {
    return this.http.post<{ message: string; sentTo: string }>(
      `${this.baseUrl}/${id}/send-email`, {}
    );
  }

  // ── WhatsApp ──────────────────────────────────────────────────────

  getWhatsAppStatus(): Observable<{ ready: boolean; qr: string | null }> {
    return this.http.get<{ ready: boolean; qr: string | null }>(
      `${this.baseUrl}/whatsapp/status`
    );
  }

  sendByWhatsApp(id: number | string): Observable<{ message: string; sentTo: string }> {
    return this.http.post<{ message: string; sentTo: string }>(
      `${this.baseUrl}/${id}/send-whatsapp`, {}
    );
  }

  // ── Helpers UI ────────────────────────────────────────────────────

  getStatusLabel(status: ClaimStatus): string {
    const labels: Record<ClaimStatus, string> = {
      [ClaimStatus.REGISTRADO]: 'Registrado',
      [ClaimStatus.EN_PROCESO]: 'En Proceso',
      [ClaimStatus.RESUELTO]:   'Resuelto',
      [ClaimStatus.RECHAZADO]:  'Rechazado',
    };
    return labels[status] ?? status;
  }

  getStatusSeverity(status: ClaimStatus): 'info' | 'warn' | 'success' | 'danger' {
    const map: Record<ClaimStatus, 'info' | 'warn' | 'success' | 'danger'> = {
      [ClaimStatus.REGISTRADO]: 'info',
      [ClaimStatus.EN_PROCESO]: 'warn',
      [ClaimStatus.RESUELTO]:   'success',
      [ClaimStatus.RECHAZADO]:  'danger',
    };
    return map[status] ?? 'info';
  }

  formatDate(iso: string): string {
    if (!iso) return '-';
    return new Date(iso).toLocaleDateString('es-PE', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit',
    });
  }

  calcularDiasDesdeRegistro(iso: string): number {
    return Math.floor((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24));
  }

  private _updateInList(updated: ClaimResponseDto): void {
    this.claims.update(list => list.map(c => c.id === updated.id ? updated : c));
    if (this.selected()?.id === updated.id) this.selected.set(updated);
  }
}