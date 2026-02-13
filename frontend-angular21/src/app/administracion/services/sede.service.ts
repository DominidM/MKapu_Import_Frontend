import { Injectable, computed, signal } from '@angular/core';
import { environment } from '../../../enviroments/enviroment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { finalize, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Headquarter, HeadquarterResponse } from '../interfaces/sedes.interface';

export type CreateHeadquarterRequest = Omit<Headquarter, 'id_sede' | 'activo'>;

@Injectable({ providedIn: 'root' })
export class SedeService {
  private readonly api = environment.apiUrl;

  private readonly _sedesResponse = signal<HeadquarterResponse | null>(null);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly sedesResponse = computed(() => this._sedesResponse());
  readonly sedes = computed(() => this._sedesResponse()?.headquarters ?? []);
  readonly total = computed(() => this._sedesResponse()?.total ?? 0);

  readonly loading = computed(() => this._loading());
  readonly error = computed(() => this._error());

  constructor(private http: HttpClient) {}

  private buildHeaders(role: string = 'Administrador'): HttpHeaders {
    return new HttpHeaders({ 'x-role': role ?? '' });
  }

  loadSedes(role: string = 'Administrador'): Observable<HeadquarterResponse> {
    this._loading.set(true);
    this._error.set(null);

    return this.http
      .get<HeadquarterResponse>(`${this.api}/admin/headquarters`, {
        headers: this.buildHeaders(role),
      })
      .pipe(
        tap((res) => this._sedesResponse.set(res)),
        finalize(() => this._loading.set(false))
      );
  }

  createSede(
    payload: CreateHeadquarterRequest,
    role: string = 'Administrador'
  ): Observable<Headquarter> {
    this._loading.set(true);
    this._error.set(null);

    return this.http
      .post<Headquarter>(`${this.api}/admin/headquarters`, payload, {
        headers: this.buildHeaders(role),
      })
      .pipe(
        tap((created) => {
            const prev = this._sedesResponse();
          if (!prev) return;

          this._sedesResponse.set({
            headquarters: [created, ...prev.headquarters],
            total: prev.total + 1,
          });
        }),
        finalize(() => this._loading.set(false))
      );
  }

  getSedes(role: string = 'Administrador'): Observable<HeadquarterResponse> {
    return this.http.get<HeadquarterResponse>(`${this.api}/admin/headquarters`, {
      headers: this.buildHeaders(role),
    });
  }
}