import { Injectable, computed, signal, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { finalize, tap, catchError, map } from 'rxjs/operators';
import { environment } from '../../../enviroments/enviroment';

// ── Interfaces de administración ─────────────────────────────────────────────
export interface Customer {
  customerId: string;
  documentTypeId: number;
  documentTypeDescription: string;
  documentTypeSunatCode: string;
  documentValue: string;
  name: string;
  lastName: string | null;
  apellido?: string | null;
  businessName: string | null;
  address: string | null;
  email: string | null;
  phone: string | null;
  status: boolean;
  displayName: string;
  invoiceType: string;
}

export interface CustomerResponse {
  customers: Customer[];
  total: number;
}

export type CreateCustomerRequest = Omit<
  Customer,
  | 'customerId'
  | 'status'
  | 'displayName'
  | 'invoiceType'
  | 'documentTypeDescription'
  | 'documentTypeSunatCode'
>;
export type UpdateCustomerRequest = Partial<CreateCustomerRequest>;

export interface LoadCustomersFilters {
  search?: string;
  page?: number;
  limit?: number;
  tipo?: string;
  status?: boolean;
}

export interface ConsultaDocumentoResponse {
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  nombreCompleto: string;
  tipoDocumento: string;
  razonSocial?: string;
  direccion?: string;
}

// ── Interfaces de ventas ──────────────────────────────────────────────────────
import {
  CrearClienteRequest,
  ActualizarClienteRequest,
  ClienteBusquedaResponse,
  ClienteResponse,
  ListarClientesResponse,
  TipoDocumento,
} from '../interfaces';


@Injectable({ providedIn: 'root' })
export class ClienteService {
  private readonly http = inject(HttpClient);
  private readonly api     = `${environment.apiUrl}/sales/customers`;
  private readonly salesUrl = `${environment.apiUrl}/sales`;

  // ── Estado reactivo (usado en administración) ─────────────────────────────
  private readonly _customers = signal<Customer[]>([]);
  private readonly _total     = signal<number>(0);
  private readonly _loading   = signal(false);
  private readonly _error     = signal<string | null>(null);

  readonly customers       = computed(() => this._customers());
  readonly total           = computed(() => this._total());
  readonly loading         = computed(() => this._loading());
  readonly error           = computed(() => this._error());
  readonly customerResponse = computed(() => ({
    customers: this._customers(),
    total:     this._total(),
  }));

  private buildHeaders(role = 'Administrador'): HttpHeaders {
    return new HttpHeaders({ 'x-role': role });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // CONSULTAS
  // ══════════════════════════════════════════════════════════════════════════

  loadCustomers(filters?: LoadCustomersFilters, role = 'Administrador'): Observable<CustomerResponse> {
    this._loading.set(true);
    this._error.set(null);

    let params = new HttpParams();
    if (filters?.search)  params = params.set('search', filters.search);
    if (filters?.page)    params = params.set('page', filters.page.toString());
    if (filters?.limit)   params = params.set('limit', filters.limit.toString());
    if (filters?.tipo && filters.tipo !== 'todas') params = params.set('tipo', filters.tipo);
    if (filters?.status !== undefined) params = params.set('status', String(filters.status));

    return this.http
      .get<CustomerResponse>(this.api, { headers: this.buildHeaders(role), params })
      .pipe(
        tap((res) => {
          this._customers.set(res.customers ?? []);
          this._total.set(res.total ?? 0);
        }),
        catchError((err) => {
          this._error.set('No se pudo cargar la lista de clientes.');
          return throwError(() => err);
        }),
        finalize(() => this._loading.set(false)),
      );
  }

  /** Listado paginado para ventas */
  listarClientes(params?: { page?: number; size?: number; search?: string }): Observable<ListarClientesResponse> {
    const httpParams = new HttpParams()
      .set('page',   String(params?.page   ?? 1))
      .set('size',   String(params?.size   ?? 10))
      .set('search', params?.search ?? '');
    return this.http.get<ListarClientesResponse>(this.api, { params: httpParams });
  }

  getClientes(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(this.api);
  }

  suggestCustomers(query: string, limit = 5, role = 'Administrador'): Observable<Customer[]> {
    let params = new HttpParams().set('limit', String(limit));
    if (query) params = params.set('q', query);
    return this.http
      .get<Customer[]>(`${this.api}/suggest`, { headers: this.buildHeaders(role), params })
      .pipe(catchError((err) => throwError(() => err)));
  }

  getCustomerById(id: string, role = 'Administrador'): Observable<Customer> {
    this._loading.set(true);
    this._error.set(null);
    return this.http
      .get<Customer>(`${this.api}/${id}`, { headers: this.buildHeaders(role) })
      .pipe(
        catchError((err) => {
          this._error.set('No se pudo obtener la información del cliente.');
          return throwError(() => err);
        }),
        finalize(() => this._loading.set(false)),
      );
  }

  /** Obtener cliente por ID para ventas */
  obtenerClientePorId(customerId: string): Observable<ClienteResponse> {
    return this.http.get<ClienteResponse>(`${this.api}/${customerId}`);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // BÚSQUEDA POR DOCUMENTO
  // ══════════════════════════════════════════════════════════════════════════

  /** Búsqueda por documento para ventas — devuelve ClienteBusquedaResponse */
  buscarCliente(documento: string): Observable<ClienteBusquedaResponse> {
    return this.http.get<ClienteBusquedaResponse>(`${this.api}/document/${documento}`);
  }

  /** Búsqueda por documento mapeada al modelo Cliente interno */
  buscarPorDocumento(documento: string): Observable<Cliente | null> {
    return this.http.get<any>(`${this.api}/document/${documento}`).pipe(
      map((data) => {
        if (!data) return null;
        return {
          id_cliente:   data.customerId    || '',
          tipo_doc:     data.documentTypeSunatCode === '06' ? 'RUC' : 'DNI',
          num_doc:      data.documentValue || documento,
          razon_social: data.displayName   || null,
          nombres:      data.name          || null,
          apellidos:    data.apellido       || null,
          direccion:    data.address        || null,
          email:        data.email          || null,
          telefono:     data.phone          || null,
          estado:       data.status !== undefined ? data.status : true,
        } as Cliente;
      }),
    );
  }

  /** Consulta RENIEC/SUNAT */
  consultarDocumentoIdentidad(numero: string): Observable<ConsultaDocumentoResponse> {
    return this.http
      .get<ConsultaDocumentoResponse>(`${this.salesUrl}/reniec/consultar/${numero}`)
      .pipe(
        catchError(() =>
          of({
            nombres: '', apellidoPaterno: '', apellidoMaterno: '',
            nombreCompleto: '', tipoDocumento: '',
          }),
        ),
      );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // TIPOS DE DOCUMENTO
  // ══════════════════════════════════════════════════════════════════════════

  obtenerTiposDocumento(): Observable<TipoDocumento[]> {
    return this.http.get<TipoDocumento[]>(`${this.api}/document-types`);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // CRUD
  // ══════════════════════════════════════════════════════════════════════════

  createCustomer(payload: CreateCustomerRequest, role = 'Administrador'): Observable<Customer> {
    this._loading.set(true);
    this._error.set(null);
    return this.http
      .post<Customer>(this.api, payload, { headers: this.buildHeaders(role) })
      .pipe(
        catchError((err) => {
          this._error.set('No se pudo registrar al cliente.');
          return throwError(() => err);
        }),
        finalize(() => this._loading.set(false)),
      );
  }

  /** Crear cliente para ventas */
  crearCliente(data: CrearClienteRequest): Observable<ClienteResponse> {
    return this.http.post<ClienteResponse>(this.api, data);
  }

  updateCustomer(id: string, payload: UpdateCustomerRequest, role = 'Administrador'): Observable<Customer> {
    this._loading.set(true);
    this._error.set(null);
    return this.http
      .put<Customer>(`${this.api}/${id}`, payload, { headers: this.buildHeaders(role) })
      .pipe(
        catchError((err) => {
          this._error.set('No se pudo actualizar los datos del cliente.');
          return throwError(() => err);
        }),
        finalize(() => this._loading.set(false)),
      );
  }

  /** Actualizar cliente para ventas */
  actualizarCliente(customerId: string, data: ActualizarClienteRequest): Observable<ClienteResponse> {
    return this.http.put<ClienteResponse>(`${this.api}/${customerId}`, data);
  }

  updateCustomerStatus(id: string, status: boolean, role = 'Administrador'): Observable<Customer> {
    this._loading.set(true);
    this._error.set(null);
    return this.http
      .put<Customer>(`${this.api}/${id}/status`, { status }, { headers: this.buildHeaders(role) })
      .pipe(
        catchError((err) => {
          this._error.set('No se pudo cambiar el estado del cliente.');
          return throwError(() => err);
        }),
        finalize(() => this._loading.set(false)),
      );
  }

  deleteCustomer(id: string, role = 'Administrador'): Observable<any> {
    this._loading.set(true);
    return this.http
      .delete(`${this.api}/${id}`, { headers: this.buildHeaders(role) })
      .pipe(finalize(() => this._loading.set(false)));
  }
}