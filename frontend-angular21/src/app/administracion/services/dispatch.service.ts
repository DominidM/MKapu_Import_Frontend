import { computed, Injectable, signal } from '@angular/core';
import { environment } from '../../../enviroments/enviroment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { finalize, tap, catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import {
  Dispatch,
  CreateDispatchRequest,
  IniciarTransitoRequest,
  ConfirmarEntregaRequest,
  CancelarDespachoRequest,
  MarcarDetallePreparadoRequest,
} from '../interfaces/dispatch.interfaces';

export interface EnrichedDispatch extends Dispatch {
  comprobante?: string;
  tipoComprobante?: string;
  fechaEmision?: string;
  subtotal?: number;
  igv?: number;
  total?: number;
  descuento?: number;
  metodoPago?: string;
  clienteNombre?: string;
  clienteDoc?: string;
  clienteTelefono?: string;
  clienteDireccion?: string;
  sedeNombre?: string;
  responsableNombre?: string;
  productosDetalle?: {
    id_prod_ref: number;
    cod_prod: string;
    descripcion: string;
    cantidad: number;
    precio_unit: number;
    total: number;
  }[];
}

export interface DispatchPageResult {
  data: EnrichedDispatch[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface LoadDispatchParams {
  page?: number;
  limit?: number;
  fechaDesde?: string;
  fechaHasta?: string;
  id_sede?: number;
  estado?: string;
  search?: string;
}

@Injectable({ providedIn: 'root' })
export class DispatchService {
  private readonly baseUrl = `${environment.apiUrl}/logistics/despachos`;

  // ── Estado interno ────────────────────────────────────────────────────────
  private readonly _pageResult   = signal<DispatchPageResult | null>(null);
  private readonly _loading      = signal(false);
  private readonly _error        = signal<string | null>(null);
  // Guarda los últimos params usados para poder recargar con el mismo contexto
  private _lastParams: LoadDispatchParams = {};
  private _lastRole = 'Administrador';

  // ── Señales públicas ──────────────────────────────────────────────────────
  readonly dispatches  = computed(() => this._pageResult()?.data ?? []);
  readonly totalItems  = computed(() => this._pageResult()?.total ?? 0);
  readonly totalPages  = computed(() => this._pageResult()?.totalPages ?? 0);
  readonly currentPage = computed(() => this._pageResult()?.page ?? 1);
  readonly loading     = computed(() => this._loading());
  readonly error       = computed(() => this._error());

  constructor(private http: HttpClient) {}

  private buildHeaders(role = 'Administrador'): HttpHeaders {
    return new HttpHeaders({ 'x-role': role });
  }

  // ── Carga principal ───────────────────────────────────────────────────────
  loadDispatches(
    role = 'Administrador',
    params?: LoadDispatchParams,
  ): Observable<DispatchPageResult> {
    // Persiste los últimos params para poder recargar desde el componente
    this._lastRole   = role;
    this._lastParams = params ?? {};

    this._loading.set(true);
    this._error.set(null);

    let qp = new HttpParams()
      .set('page',  String(params?.page  ?? 1))
      .set('limit', String(params?.limit ?? 10));

    if (params?.fechaDesde) qp = qp.set('fechaDesde', params.fechaDesde);
    if (params?.fechaHasta) qp = qp.set('fechaHasta', params.fechaHasta);
    if (params?.id_sede)    qp = qp.set('id_sede',    String(params.id_sede));
    if (params?.estado)     qp = qp.set('estado',     params.estado);
    if (params?.search)     qp = qp.set('search',     params.search);

    return this.http
      .get<DispatchPageResult>(this.baseUrl, {
        headers: this.buildHeaders(role),
        params:  qp,
      })
      .pipe(
        tap((res) => this._pageResult.set(res)),
        catchError((err) => {
          this._error.set('No se pudo cargar los despachos.');
          return throwError(() => err);
        }),
        finalize(() => this._loading.set(false)),
      );
  }

  /**
   * Recarga usando exactamente los mismos parámetros de la última llamada.
   * Úsalo después de cancelar, cambiar estado o confirmar entrega
   * para que la tabla respete los filtros activos del usuario.
   */
  recargarUltima(): Observable<DispatchPageResult> {
    return this.loadDispatches(this._lastRole, this._lastParams);
  }

  // ── Resto de métodos sin cambios ──────────────────────────────────────────
  getDispatchById(id: number, role = 'Administrador'): Observable<Dispatch> {
    return this.http
      .get<Dispatch>(`${this.baseUrl}/${id}`, { headers: this.buildHeaders(role) })
      .pipe(catchError((err) => throwError(() => err)));
  }

  getDispatchByVenta(id_venta: number, role = 'Administrador'): Observable<Dispatch[]> {
    return this.http
      .get<Dispatch[]>(`${this.baseUrl}/venta/${id_venta}`, { headers: this.buildHeaders(role) })
      .pipe(catchError((err) => throwError(() => err)));
  }

  createDispatch(payload: CreateDispatchRequest, role = 'Administrador'): Observable<Dispatch> {
    return this.http
      .post<Dispatch>(this.baseUrl, payload, { headers: this.buildHeaders(role) })
      .pipe(catchError((err) => throwError(() => err)));
  }

  cancelarDespacho(
    id: number | null,
    payload: CancelarDespachoRequest = {},
    role = 'Administrador',
  ): Observable<Dispatch> {
    return this.http
      .patch<Dispatch>(`${this.baseUrl}/${id}/cancelar`, payload, {
        headers: this.buildHeaders(role),
      })
      .pipe(catchError((err) => throwError(() => err)));
  }

  iniciarPreparacion(id: number, role = 'Administrador'): Observable<Dispatch> {
    return this.http
      .patch<Dispatch>(`${this.baseUrl}/${id}/preparacion`, {}, { headers: this.buildHeaders(role) })
      .pipe(catchError((err) => throwError(() => err)));
  }

  iniciarTransito(
    id: number,
    payload: IniciarTransitoRequest,
    role = 'Administrador',
  ): Observable<Dispatch> {
    return this.http
      .patch<Dispatch>(`${this.baseUrl}/${id}/transito`, payload, {
        headers: this.buildHeaders(role),
      })
      .pipe(catchError((err) => throwError(() => err)));
  }

  confirmarEntrega(
    id: number,
    payload: ConfirmarEntregaRequest,
    role = 'Administrador',
  ): Observable<Dispatch> {
    return this.http
      .patch<Dispatch>(`${this.baseUrl}/${id}/entrega`, payload, {
        headers: this.buildHeaders(role),
      })
      .pipe(catchError((err) => throwError(() => err)));
  }

  marcarDetallePreparado(
    id_detalle: number,
    payload: MarcarDetallePreparadoRequest,
    role = 'Administrador',
  ): Observable<Dispatch> {
    return this.http
      .patch<Dispatch>(`${this.baseUrl}/detalle/${id_detalle}/preparado`, payload, {
        headers: this.buildHeaders(role),
      })
      .pipe(catchError((err) => throwError(() => err)));
  }

  marcarDetalleDespachado(id_detalle: number, role = 'Administrador'): Observable<Dispatch> {
    return this.http
      .patch<Dispatch>(`${this.baseUrl}/detalle/${id_detalle}/despachado`, {}, {
        headers: this.buildHeaders(role),
      })
      .pipe(catchError((err) => throwError(() => err)));
  }
}