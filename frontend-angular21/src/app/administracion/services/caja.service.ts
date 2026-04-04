// services/caja.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../enviroments/enviroment';

// ── Interfaces ─────────────────────────────────────────────────────────────

export interface CajaResponse {
  id_caja:           number;
  id_producto:       number;
  cantidad_unidades: number;
  cod_caja:          string;
  pre_caja:          number;
  pre_mayorista:     number | null;
  fecha_ingreso:     string;
}

export interface CreateCajaDto {
  id_producto:       number;
  cantidad_unidades: number;
  cod_caja:          string;
  pre_caja:          number;
  pre_mayorista?:    number | null;
}

export interface UpdateCajaPreciosDto {
  pre_caja:       number;
  pre_mayorista?: number | null;
}

// ── Service ────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class CajaService {
  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /** POST /cajas */
  crearCaja(dto: CreateCajaDto): Observable<CajaResponse> {
    return this.http.post<CajaResponse>(`${this.api}/logistics/cajas`, dto);
  }

  /** GET /cajas/:id */
  getCajaById(id_caja: number): Observable<CajaResponse> {
    return this.http.get<CajaResponse>(`${this.api}/logistics/cajas/${id_caja}`);
  }

  /** GET /cajas/producto/:id_producto */
  getCajasByProducto(id_producto: number): Observable<CajaResponse[]> {
    return this.http.get<CajaResponse[]>(
      `${this.api}/logistics/cajas/producto/${id_producto}`,
    );
  }

  /** GET /cajas/codigo/:cod_caja */
  getCajaByCodigo(cod_caja: string): Observable<CajaResponse> {
    return this.http.get<CajaResponse>(
      `${this.api}/logistics/cajas/codigo/${encodeURIComponent(cod_caja)}`,
    );
  }

  /** PUT /cajas/:id/precios */
  actualizarPrecios(id_caja: number, dto: UpdateCajaPreciosDto): Observable<CajaResponse> {
    return this.http.put<CajaResponse>(
      `${this.api}/logistics/cajas/${id_caja}/precios`,
      dto,
    );
  }

  /** DELETE /cajas/:id */
  eliminarCaja(id_caja: number): Observable<{ ok: boolean }> {
    return this.http.delete<{ ok: boolean }>(
      `${this.api}/logistics/cajas/${id_caja}`,
    );
  }
}