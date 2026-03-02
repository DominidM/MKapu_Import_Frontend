import { computed, Injectable, signal } from '@angular/core';
import { environment } from '../../../enviroments/enviroment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { finalize, tap, catchError, switchMap, map } from 'rxjs/operators';
import { Observable, throwError, forkJoin, of } from 'rxjs';
import { Headquarter, SedeBasica } from '../interfaces/almacen.interface';

export interface WarehouseListResponse {
  warehouses: Headquarter[];
  total: number;
  page: number;
  pageSize: number;
}

export interface SedeAlmacenRelacion {
  id_sede: number;
  sede: SedeBasica;
  almacenes: { id_almacen: number; almacen: any }[];
  total: number;
}

export type CreateWarehouseRequest = Omit<Headquarter, 'id' | 'id_almacen' | 'activo' | 'sede' | 'createdAt' | 'updatedAt'>;
export type UpdateWarehouseRequest = Partial<Omit<Headquarter, 'id' | 'id_almacen' | 'sede' | 'createdAt' | 'updatedAt'>>;

@Injectable({ providedIn: 'root' })
export class AlmacenService {
  private readonly api = environment.apiUrl;

  private readonly _almacenResponse = signal<WarehouseListResponse | null>(null);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly sedesResponse = computed(() => this._almacenResponse());
  readonly sedes = computed(() => this._almacenResponse()?.warehouses ?? []);
  readonly total = computed(() => this._almacenResponse()?.total ?? 0);
  readonly loading = computed(() => this._loading());
  readonly error = computed(() => this._error());

  constructor(private readonly http: HttpClient) {}

  private buildHeaders(role: string = 'Administrador'): HttpHeaders {
    return new HttpHeaders({ 'x-role': role });
  }

  // ─── LOAD principal: almacenes + mapa de sedes ───────────────────────────────

  loadAlmacen(role: string = 'Administrador'): Observable<WarehouseListResponse> {
    this._loading.set(true);
    this._error.set(null);

    return this.http
      .get<WarehouseListResponse>(`${this.api}/logistics/warehouses`, {
        headers: this.buildHeaders(role),
        params: { page: '1', pageSize: '1000' },
      })
      .pipe(
        tap((res) => this._almacenResponse.set(res)),

        // Después de cargar almacenes, cargamos sedes para el mapa
        switchMap((res) =>
          this.buildSedeMap(role).pipe(
            tap((sedeMap) => this.enrichWithSedeMap(sedeMap)),
            map(() => res) // devolvemos el response original
          )
        ),

        catchError((err) => {
          this._error.set('No se pudo cargar almacenes.');
          return throwError(() => err);
        }),
        finalize(() => this._loading.set(false))
      );
  }

  // ─── Construye mapa id_almacen → SedeBasica ──────────────────────────────────

  private buildSedeMap(role: string): Observable<Map<number, SedeBasica>> {
    return this.http
      .get<any>(`${this.api}/admin/headquarters`, {
        headers: this.buildHeaders(role),
      })
      .pipe(
        switchMap((resp) => {
          // El endpoint puede devolver array directo o { data: [] } o { headquarters: [] }
          const sedesList: SedeBasica[] = Array.isArray(resp)
            ? resp
            : (resp?.data ?? resp?.headquarters ?? []);

          if (sedesList.length === 0) return of(new Map<number, SedeBasica>());

          // Por cada sede consultamos sus almacenes asignados
          const requests$ = sedesList.map((sede) =>
            this.http
              .get<SedeAlmacenRelacion>(
                `${this.api}/admin/sede-almacen/sede/${sede.id_sede}`,
                { headers: this.buildHeaders(role) }
              )
              .pipe(catchError(() => of({ id_sede: sede.id_sede, sede, almacenes: [], total: 0 })))
          );

          return forkJoin(requests$).pipe(
            map((relaciones) => {
              const map = new Map<number, SedeBasica>();
              for (const rel of relaciones) {
                for (const item of rel.almacenes) {
                  map.set(item.id_almacen, rel.sede);
                }
              }
              return map;
            })
          );
        }),
        catchError(() => of(new Map<number, SedeBasica>()))
      );
  }

  // ─── Enriquece los warehouses en caché con su sede ───────────────────────────

  private enrichWithSedeMap(sedeMap: Map<number, SedeBasica>): void {
    const prev = this._almacenResponse();
    if (!prev) return;
    const enriched = prev.warehouses.map((w) => ({
      ...w,
      sede: sedeMap.get(w.id_almacen ?? w.id ?? 0) ?? null,
    }));
    this._almacenResponse.set({ ...prev, warehouses: enriched });
  }

  // ─── CRUD ────────────────────────────────────────────────────────────────────

  createAlmacen(payload: CreateWarehouseRequest, role: string = 'Administrador'): Observable<Headquarter> {
    this._loading.set(true);
    this._error.set(null);
    return this.http
      .post<Headquarter>(`${this.api}/logistics/warehouses`, payload, { headers: this.buildHeaders(role) })
      .pipe(
        tap((created) => {
          const prev = this._almacenResponse();
          if (!prev) return;
          this._almacenResponse.set({ ...prev, warehouses: [created, ...prev.warehouses], total: prev.total + 1 });
        }),
        catchError((err: any) => {
          let msg = 'No se pudo registrar el almacén.';
          if (err?.error) msg = typeof err.error === 'string' ? err.error : (err.error.message ?? JSON.stringify(err.error));
          this._error.set(msg);
          return throwError(() => err);
        }),
        finalize(() => this._loading.set(false))
      );
  }

  getAlmacenById(id: number, role: string = 'Administrador'): Observable<Headquarter> {
    this._loading.set(true);
    this._error.set(null);
    return this.http
      .get<Headquarter>(`${this.api}/logistics/warehouses/${id}`, { headers: this.buildHeaders(role) })
      .pipe(
        catchError((err) => { this._error.set('No se pudo cargar el almacén.'); return throwError(() => err); }),
        finalize(() => this._loading.set(false))
      );
  }

  getSedeDeAlmacen(id_almacen: number): Observable<any> {
    return this.http
      .get(`${this.api}/admin/sede-almacen/almacen/${id_almacen}`, {
        headers: this.buildHeaders(),
      })
      .pipe(catchError(() => of(null)));
  }

  reassignSede(id_almacen: number, id_sede: number): Observable<any> {
    return this.http.put(
      `${this.api}/admin/sede-almacen/${id_almacen}/sede`,
      { id_sede },
      { headers: this.buildHeaders() }
    );
  }

  unassignSede(id_almacen: number): Observable<any> {
    return this.http.delete(
      `${this.api}/admin/sede-almacen/${id_almacen}/sede`,
      { headers: this.buildHeaders() }
    );
  }
  updateAlmacen(id: number, payload: UpdateWarehouseRequest, role: string = 'Administrador'): Observable<Headquarter> {
    this._loading.set(true);
    this._error.set(null);
    return this.http
      .put<Headquarter>(`${this.api}/logistics/warehouses/${id}`, payload, { headers: this.buildHeaders(role) })
      .pipe(
        tap((updated) => this.patchCachedHeadquarter(id, updated)),
        catchError((err) => { this._error.set('No se pudo actualizar el almacén.'); return throwError(() => err); }),
        finalize(() => this._loading.set(false))
      );
  }

  updateAlmacenStatus(id: number, activo: boolean, role: string = 'Administrador'): Observable<Headquarter> {
    this._loading.set(true);
    this._error.set(null);
    const headers = this.buildHeaders(role).set('Content-Type', 'application/json');
    return this.http
      .put<Headquarter>(`${this.api}/logistics/warehouses/${id}/status`, { activo: !!activo }, { headers })
      .pipe(
        tap((updated) => this.patchCachedHeadquarter(id, updated)),
        catchError((err) => { this._error.set('No se pudo actualizar el estado del almacén.'); return throwError(() => err); }),
        finalize(() => this._loading.set(false))
      );
  }

  deleteAlmacen(id: number, role: string = 'Administrador'): Observable<Headquarter> {
    return this.updateAlmacenStatus(id, false, role);
  }

  getSedes(role: string = 'Administrador'): Observable<WarehouseListResponse> {
    return this.http.get<WarehouseListResponse>(`${this.api}/logistics/warehouses`, {
      headers: this.buildHeaders(role),
      params: { page: '1', pageSize: '1000' },
    });
  }

  getAlmacenesPorSede(id_sede: number): Observable<SedeAlmacenRelacion> {
    return this.http.get<SedeAlmacenRelacion>(
      `${this.api}/admin/sede-almacen/sede/${id_sede}`,
      { headers: this.buildHeaders() }
    );
  }

  private patchCachedHeadquarter(id: number, updated: Headquarter): void {
    const prev = this._almacenResponse();
    if (!prev) return;
    const normalizedId = Number(id);
    let found = false;
    const newWarehouses = prev.warehouses.map((h) => {
      const hId = Number(h.id ?? h.id_almacen);
      if (hId === normalizedId) {
        found = true;
        return { ...updated, sede: h.sede }; // preserva la sede al hacer patch
      }
      return h;
    });
    if (found) {
      this._almacenResponse.set({ ...prev, warehouses: newWarehouses });
      return;
    }
    this.loadAlmacen('Administrador').subscribe({ next: () => {}, error: () => {} });
  }
}