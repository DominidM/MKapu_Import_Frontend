// terminos-condiciones/terminos-condiciones.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../enviroments/enviroment';
import { TerminosDto, TerminosResponse } from '../interfaces/terminos-condiciones.interface';

@Injectable({ providedIn: 'root' })
export class TerminosCondicionesService {

  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/admin/terminos-condiciones`;

  getActivo(): Observable<TerminosResponse> {
    return this.http.get<TerminosResponse>(`${this.base}/activo`);
  }

  getAll(): Observable<TerminosResponse[]> {
    return this.http.get<TerminosResponse[]>(this.base);
  }

  getById(id: number): Observable<TerminosResponse> {
    return this.http.get<TerminosResponse>(`${this.base}/${id}`);
  }

  crear(dto: TerminosDto): Observable<TerminosResponse> {
    return this.http.post<TerminosResponse>(this.base, dto);
  }

  actualizar(id: number, dto: TerminosDto): Observable<TerminosResponse> {
    return this.http.put<TerminosResponse>(`${this.base}/${id}`, dto);
  }

  activar(id: number): Observable<void> {
    return this.http.patch<void>(`${this.base}/${id}/activar`, {});
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}