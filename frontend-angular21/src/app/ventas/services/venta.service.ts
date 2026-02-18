/* frontend-angular21/src/app/ventas/services/venta.service.ts */

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../enviroments/enviroment';

import {
  RegistroVentaRequest,
  RegistroVentaResponse,
  SalesReceiptSummaryListResponse,
  SalesReceiptWithHistoryDto,
  CustomerPurchaseHistoryDto,
  SalesReceiptsQuery,
} from '../interfaces';

@Injectable({ providedIn: 'root' })
export class VentaService {
  private readonly apiUrl = `${environment.apiUrl}/sales`;

  constructor(private http: HttpClient) {}

  registrarVenta(request: RegistroVentaRequest): Observable<RegistroVentaResponse> {
    return this.http.post<RegistroVentaResponse>(`${this.apiUrl}/receipts`, request);
  }

  // ✅ ACTUALIZADO: Devuelve listado resumido enriquecido
  listarVentas(query: SalesReceiptsQuery = {}): Observable<SalesReceiptSummaryListResponse> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    let params = new HttpParams()
      .set('page', String(page))
      .set('limit', String(limit));

    if (query.status) params = params.set('status', query.status);
    if (query.customerId) params = params.set('customerId', query.customerId);
    if (query.receiptTypeId != null) params = params.set('receiptTypeId', String(query.receiptTypeId));
    if (query.dateFrom) params = params.set('dateFrom', query.dateFrom);
    if (query.dateTo) params = params.set('dateTo', query.dateTo);
    if (query.search) params = params.set('search', query.search);
    if (query.sedeId) params = params.set('sedeId', String(query.sedeId));

    return this.http.get<SalesReceiptSummaryListResponse>(`${this.apiUrl}/receipts`, { params });
  }

  // ✅ ACTUALIZADO: Devuelve detalle + historial
  obtenerVentaPorId(ventaId: number): Observable<SalesReceiptWithHistoryDto> {
    return this.http.get<SalesReceiptWithHistoryDto>(`${this.apiUrl}/receipts/${ventaId}`);
  }

  // ✅ NUEVO: Obtener historial del cliente
  obtenerHistorialCliente(customerId: string): Observable<CustomerPurchaseHistoryDto> {
    return this.http.get<CustomerPurchaseHistoryDto>(`${this.apiUrl}/receipts/customer/${customerId}/history`);
  }

  anularVenta(ventaId: number, reason: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/receipts/${ventaId}/annul`, { reason });
  }
}
