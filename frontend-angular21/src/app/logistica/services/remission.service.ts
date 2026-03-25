import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../enviroments/enviroment';
import {
  CreateRemissionDto,
  RemisionPaginatedResponse,
  RemissionResponse,
  RemissionSummaryResponse,
} from '../interfaces/remision.interface';
import { Injectable, inject } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class RemissionService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/logistics/remission`;

  create(dto: CreateRemissionDto): Observable<any> {
    return this.http.post<any>(this.apiUrl, dto);
  }

  findAll(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  findById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  annul(id: string, motivo: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/annul`, { motivo });
  }

  findSaleForRemission(correlativo: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/sale/${correlativo}`);
  }

  getRemisiones(
    page: number = 1,
    limit: number = 10,
    search?: string,
    estado?: string | number | null,
    startDate?: string,
    endDate?: string,
    sedeId?: number | null,
  ): Observable<RemisionPaginatedResponse> {
    let params = new HttpParams().set('page', page.toString()).set('limit', limit.toString());

    if (search) params = params.set('search', search);
    if (estado !== null && estado !== undefined) params = params.set('estado', estado.toString());
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    if (sedeId != null) params = params.set('id_sede', sedeId.toString());

    return this.http.get<RemisionPaginatedResponse>(this.apiUrl, { params });
  }

  getRemisionById(id: string): Observable<RemissionResponse> {
    return this.http.get<RemissionResponse>(`${this.apiUrl}/${id}`);
  }

  getRemissionSummary(
    sedeId?: number | null,
    startDate?: string,
    endDate?: string,
  ): Observable<RemissionSummaryResponse> {
    let params = new HttpParams();

    if (sedeId != null) params = params.set('id_sede', sedeId.toString());
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);

    return this.http.get<RemissionSummaryResponse>(`${this.apiUrl}/summary`, { params });
  }

  exportPdf(id: string) {
    return this.http.get(`${this.apiUrl}/${id}/export/pdf`, { responseType: 'blob' });
  }

  exportExcel(id: string) {
    return this.http.get(`${this.apiUrl}/${id}/export/excel`, { responseType: 'blob' });
  }
  cambiarEstado(id: string, nuevoEstado: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/status`, { estado: nuevoEstado });
  }
}
