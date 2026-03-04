import { Injectable, computed, signal } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from '../../../enviroments/enviroment';
import { finalize, tap, catchError, map } from 'rxjs/operators';
import { Observable, throwError, firstValueFrom } from 'rxjs';

export type CommissionTargetType = 'PRODUCTO' | 'CATEGORIA';
export type CommissionRewardType = 'PORCENTAJE' | 'MONTO_FIJO';
export type CommissionStatus = 'PENDIENTE' | 'LIQUIDADA' | 'CANCELADA';

export interface CreateCommissionRuleDto {
  nombre: string;
  descripcion?: string;
  tipo_objetivo?: CommissionTargetType;
  id_objetivo: number;
  meta_unidades?: number;
  tipo_recompensa: CommissionRewardType;
  valor_recompensa: number;
  fecha_inicio: string;
  fecha_fin?: string;
}

export interface CommissionRule {
  id_regla: number;
  nombre: string;
  descripcion?: string;
  tipo_objetivo: CommissionTargetType;
  id_objetivo: number;
  meta_unidades: number;
  tipo_recompensa: CommissionRewardType;
  valor_recompensa: number;
  activo: boolean;
  fecha_inicio: Date;
  fecha_fin?: Date;
}

export interface CommissionReport {
  id_comision: number;
  id_vendedor_ref: string;
  id_comprobante: number;
  porcentaje: number;
  monto: number;
  estado: CommissionStatus;
  fecha_registro: Date;
  fecha_liquidacion?: Date;
  id_regla?: number;
}

@Injectable({ providedIn: 'root' })
export class CommissionService {
  private readonly api = environment.apiUrl;

  private readonly _rules   = signal<CommissionRule[]>([]);
  private readonly _report  = signal<CommissionReport[]>([]);
  private readonly _loading = signal(false);
  private readonly _error   = signal<string | null>(null);

  readonly rules    = computed(() => this._rules());
  readonly report   = computed(() => this._report());
  readonly loading  = computed(() => this._loading());
  readonly error    = computed(() => this._error());

  readonly activeRules = computed(() => this._rules().filter(r => r.activo));

  readonly productRules = computed(() =>
    this._rules().filter(r => r.tipo_objetivo === 'PRODUCTO'),
  );

  readonly categoryRules = computed(() =>
    this._rules().filter(r => r.tipo_objetivo === 'CATEGORIA'),
  );

  readonly totalCommissions = computed(() =>
    this._report().reduce((acc, c) => acc + Number(c.monto), 0),
  );

  constructor(private readonly http: HttpClient) {}

  private buildHeaders(role: string = 'Administrador'): HttpHeaders {
    return new HttpHeaders({ 'x-role': role });
  }

  // ── Rules ──────────────────────────────────────────────────────────────────

    loadRules(role: string = 'Administrador'): Observable<CommissionRule[]> {
    this._loading.set(true);
    this._error.set(null);

    return this.http
        .get<any[]>(`${this.api}/sales/commissions/rules`, {
        headers: this.buildHeaders(role),
        })
        .pipe(
        tap(response => {
            // El backend devuelve [{ props: {...} }, ...] — normalizar
            const rules: CommissionRule[] = response.map(item =>
            item.props ? item.props : item
            );
            this._rules.set(rules);
        }),
        map(response => response.map((item: any) => item.props ?? item)),
        catchError(err => {
            this._error.set('Error al cargar las reglas de comisión');
            return throwError(() => err);
        }),
        finalize(() => this._loading.set(false)),
        );
    }

    createCategoryRule(
    dto: CreateCommissionRuleDto,
    role: string = 'Administrador',
    ): Observable<CommissionRule> {
    this._loading.set(true);
    this._error.set(null);

    return this.http
        .post<any>(`${this.api}/sales/commissions/rules/category`, dto, {
        headers: this.buildHeaders(role),
        })
        .pipe(
        map(res => res.props ?? res),                              // 👈 normalizar
        tap(created => this._rules.update(rules => [...rules, created])),
        catchError(err => {
            this._error.set('Error al crear la regla de categoría');
            return throwError(() => err);
        }),
        finalize(() => this._loading.set(false)),
        );
    }

    createProductRule(
    dto: CreateCommissionRuleDto,
    role: string = 'Administrador',
    ): Observable<CommissionRule> {
    this._loading.set(true);
    this._error.set(null);

    return this.http
        .post<any>(`${this.api}/sales/commissions/rules/product`, dto, {
        headers: this.buildHeaders(role),
        })
        .pipe(
        map(res => res.props ?? res),                              // 👈 normalizar
        tap(created => this._rules.update(rules => [...rules, created])),
        catchError(err => {
            this._error.set('Error al crear la regla de producto');
            return throwError(() => err);
        }),
        finalize(() => this._loading.set(false)),
        );
    }

  toggleRuleStatus(
    id: number,
    isActive: boolean,
    role: string = 'Administrador',
  ): Observable<CommissionRule> {
    this._loading.set(true);
    this._error.set(null);

    return this.http
      .patch<CommissionRule>(
        `${this.api}/sales/commissions/rules/${id}/status`,
        { isActive },
        { headers: this.buildHeaders(role) },
      )
      .pipe(
        tap(updated =>
          this._rules.update(rules =>
            rules.map(r => (r.id_regla === id ? updated : r)),
          ),
        ),
        catchError(err => {
          this._error.set('Error al cambiar el estado de la regla');
          return throwError(() => err);
        }),
        finalize(() => this._loading.set(false)),
      );
  }

  // ── Report ─────────────────────────────────────────────────────────────────

  calculateCommissions(
    from: Date,
    to: Date,
    role: string = 'Administrador',
  ): Observable<CommissionReport[]> {
    this._loading.set(true);
    this._error.set(null);

    const params = new HttpParams()
      .set('from', from.toISOString().split('T')[0])
      .set('to', to.toISOString().split('T')[0]);

    return this.http
      .get<CommissionReport[]>(`${this.api}/sales/commissions/calculate`, {
        headers: this.buildHeaders(role),
        params,
      })
      .pipe(
        tap(data => this._report.set(data)),
        catchError(err => {
          this._error.set('Error al calcular las comisiones');
          return throwError(() => err);
        }),
        finalize(() => this._loading.set(false)),
      );
  }

  clearError(): void { this._error.set(null); }
  clearReport(): void { this._report.set([]); }
}