import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../enviroments/enviroment';

// ── DTOs de entrada ────────────────────────────────────────────────────────────

export interface RegisterWarrantyDto {
  id_comprobante: number;
  cod_prod: string;
  prod_nombre: string;
  motivo: string;        
  observaciones?: string;
  num_garantia?: string;
  id_sede_ref: number;
  id_usuario_ref?: string;
  fec_recepcion?: string;
}

export interface UpdateWarrantyDto {
  fec_recepcion?: string; // ISO date string
  observaciones?: string;
}

export interface ChangeWarrantyStatusDto {
  id_estado: number;
  comentario: string;
  id_usuario: string;
  resolutionAction?: 'REFUND' | 'REPLACE';
}

export interface ListWarrantyFilterDto {
  id_sede_ref?: number;
  id_estado_garantia?: number;
  cod_prod?: string;
  id_comprobante?: number;
  fecha_desde?: string; // ISO date string
  fecha_hasta?: string; // ISO date string
  page?: number;
  limit?: number;
}

// ── DTOs de salida ─────────────────────────────────────────────────────────────

export interface WarrantyTrackingDto {
  id_tracking: number;
  id_garantia: number;
  id_usuario_ref: string;
  fec_registro: string;
  id_estado: number;
  comentario: string;
}

// En warranty.service.ts — agregar al interface:
export interface WarrantyResponseDto {
  id_garantia: number;
  num_garantia: string;
  id_comprobante: number;
  cod_prod: string;
  prod_nombre: string;
  id_estado_garantia: number;
  id_sede_ref: number;
  id_usuario_recepcion?: string;
  fec_registro: string;
  fec_recepcion?: string;
  fec_vencimiento?: string; 
  tracking: WarrantyTrackingDto[];
}

export interface DeleteWarrantyResponseDto {
  id_garantia: number;
  message: string;
  deletedAt: string;
}

// ── Service ────────────────────────────────────────────────────────────────────

@Injectable({
  providedIn: 'root',
})
export class WarrantyService {
  private readonly baseUrl = `${environment.apiUrl}/sales/warranties`;

  constructor(private readonly http: HttpClient) {}

  /**
   * POST /warranties
   * Registra una nueva garantía
   */
  registerWarranty(dto: RegisterWarrantyDto): Observable<WarrantyResponseDto> {
    return this.http.post<WarrantyResponseDto>(this.baseUrl, dto);
  }

  /**
   * PUT /warranties/:id
   * Actualiza fecha de recepción y/u observaciones
   */
  updateWarranty(id: number, dto: UpdateWarrantyDto): Observable<WarrantyResponseDto> {
    return this.http.put<WarrantyResponseDto>(`${this.baseUrl}/${id}`, dto);
  }

  /**
   * PUT /warranties/:id/status
   * Cambia el estado de una garantía y opcionalmente ejecuta REFUND o REPLACE
   */
  changeStatus(id: number, dto: ChangeWarrantyStatusDto): Observable<WarrantyResponseDto> {
    return this.http.put<WarrantyResponseDto>(`${this.baseUrl}/${id}/status`, dto);
  }

  /**
   * GET /warranties
   * Lista garantías con filtros opcionales
   */
  listWarranties(filters?: ListWarrantyFilterDto): Observable<WarrantyResponseDto[]> {
    let params = new HttpParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, String(value));
        }
      });
    }

    return this.http.get<WarrantyResponseDto[]>(this.baseUrl, { params });
  }

  /**
   * GET /warranties/:id
   * Obtiene una garantía por ID
   */
  getWarrantyById(id: number): Observable<WarrantyResponseDto> {
    return this.http.get<WarrantyResponseDto>(`${this.baseUrl}/${id}`);
  }

  /**
   * GET /warranties/receipt/:id_comprobante
   * Obtiene todas las garantías de un comprobante
   */
  getWarrantiesByReceipt(idComprobante: number): Observable<WarrantyResponseDto[]> {
    return this.http.get<WarrantyResponseDto[]>(`${this.baseUrl}/receipt/${idComprobante}`);
  }

  /**
   * DELETE /warranties/:id  (si lo agregas al controller)
   * Elimina una garantía en estado pendiente
   */
  deleteWarranty(id: number): Observable<DeleteWarrantyResponseDto> {
    return this.http.delete<DeleteWarrantyResponseDto>(`${this.baseUrl}/${id}`);
  }
}
