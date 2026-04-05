import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../enviroments/enviroment';

export interface CreditNoteFilter {
  startDate?: string;
  endDate?: string;
  status?: string;
  serie?: string;
  numberDoc?: string;
  serieRef?: string;
  numberDocRef?: string;
  page?: number;
  limit?: number;
  sedeId?: number;
}

export interface CreditNoteSummary {
  noteSummaryId: number;
  correlative: string;
  customerName: string;
  customerDocument: string;
  currency: string;
  totalAmount: number;
  emissionDate: Date | string;
  status: string;
}

export interface CreditNoteListResponse {
  data: CreditNoteSummary[];
  total: number;
  page: number;
  limit: number;
}

export interface CreditNoteItem {
  itemId: number;
  description: string;
  quantity: number;
  unitPrice: number;
  igv: number;
  total: number;
}

// RESTAURADO a las propiedades originales
export interface CreditNoteDetail {
  noteDetailId: number;
  correlative: string;
  serieRef: string;
  numberDocRef: string;
  issueDate: Date | string;
  customerName: string;
  customerDocument: string;
  businessType: string;
  currency: string;
  saleValue: number;
  igv: number;
  isc: number;
  totalAmount: number;
  status: string;
  items: CreditNoteItem[];
}

export interface RegisterCreditNoteItemDto {
  itemId: number;
  quantity: number;
}

export interface RegisterCreditNoteDto {
  salesReceiptId: number;
  reasonCode: string;
  reasonDescription: string;
  clientName?: string;
  clientDocument?: string;
  clientId?: number;
  items: RegisterCreditNoteItemDto[];
}

export interface AnnulCreditNoteDto {
  reason: string;
}

@Injectable({
  providedIn: 'root',
})
export class CreditNoteService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/sales/credit-note`;

  listar(filtros: CreditNoteFilter): Observable<CreditNoteListResponse> {
    let params = new HttpParams();

    if (filtros.page) params = params.set('page', filtros.page.toString());
    if (filtros.limit) params = params.set('limit', filtros.limit.toString());
    if (filtros.startDate) params = params.set('startDate', filtros.startDate);
    if (filtros.endDate) params = params.set('endDate', filtros.endDate);
    if (filtros.status) params = params.set('status', filtros.status);
    if (filtros.serie) params = params.set('serie', filtros.serie);
    if (filtros.numberDoc) params = params.set('numberDoc', filtros.numberDoc);
    if (filtros.serieRef) params = params.set('serieRef', filtros.serieRef);
    if (filtros.numberDocRef) params = params.set('numberDocRef', filtros.numberDocRef);
    if (filtros.sedeId != null) params = params.set('sedeId', filtros.sedeId.toString());

    return this.http.get<any>(this.apiUrl, { params }).pipe(
      map((res) => {
        // INTERCEPTOR: Extraemos los datos dinámicamente para evitar que se pierdan
        const notasMapeadas: CreditNoteSummary[] = res.data.map((nota: any) => {
          return {
            noteSummaryId: nota.noteSummaryId || nota.noteId || nota.id,
            correlative: nota.correlative || nota.correlativo,
            // Buscamos cualquier llave que el backend use para el cliente
            customerName:
              nota.customerName || nota.clientName || nota.cliente || 'CLIENTE GENÉRICO',
            customerDocument:
              nota.customerDocument || nota.clientDocument || nota.clientId?.toString() || 'S/D',
            currency: nota.currency || nota.moneda,
            totalAmount: nota.totalAmount || nota.total,
            emissionDate: nota.emissionDate || nota.issueDate || nota.fechaEmision,
            status: nota.status || nota.estado,
          };
        });

        return {
          data: notasMapeadas,
          total: res.total,
          page: res.page,
          limit: res.limit,
        };
      }),
    );
  }

  detalle(id: number): Observable<CreditNoteDetail> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map((nota: any) => ({
        ...nota,
        noteDetailId: nota.noteDetailId || nota.noteId || nota.id,
        customerName: nota.customerName || nota.clientName || nota.cliente || 'CLIENTE GENÉRICO',
        customerDocument:
          nota.customerDocument || nota.clientDocument || nota.clientId?.toString() || 'S/D',
      })),
    );
  }

  registrar(payload: RegisterCreditNoteDto): Observable<any> {
    return this.http.post<any>(this.apiUrl, payload);
  }

  anular(id: number, payload: AnnulCreditNoteDto): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${id}/annul`, payload);
  }

  exportarExcel(filtros: CreditNoteFilter): Observable<Blob> {
    let params = new HttpParams();

    if (filtros.startDate) params = params.set('startDate', filtros.startDate);
    if (filtros.endDate) params = params.set('endDate', filtros.endDate);
    if (filtros.status) params = params.set('status', filtros.status);
    if (filtros.serie) params = params.set('serie', filtros.serie);
    if (filtros.numberDoc) params = params.set('numberDoc', filtros.numberDoc);
    if (filtros.serieRef) params = params.set('serieRef', filtros.serieRef);
    if (filtros.numberDocRef) params = params.set('numberDocRef', filtros.numberDocRef);
    if (filtros.sedeId != null) params = params.set('sedeId', filtros.sedeId.toString());

    return this.http.get(`${this.apiUrl}/export`, { params, responseType: 'blob' });
  }
}
