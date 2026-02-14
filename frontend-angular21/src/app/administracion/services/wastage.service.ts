    import { Injectable, computed, signal } from '@angular/core';
    import { HttpClient, HttpHeaders } from '@angular/common/http';
    import { Observable, throwError } from 'rxjs';
    import { catchError, finalize, tap } from 'rxjs/operators';
    import { environment } from '../../../enviroments/enviroment';

    export interface CreateWastageDetailDto {
    id_producto: number;
    cod_prod: string;
    desc_prod: string;
    cantidad: number;
    pre_unit: number;
    id_tipo_merma: number;
    observacion?: string;
    }

    export interface CreateWastageDto {
    id_usuario_ref: number;
    id_sede_ref: number;
    id_almacen_ref: number;
    motivo: string;
    detalles: CreateWastageDetailDto[];
    }

    export interface WastageResponseDto {
    id_merma: number;
    fec_merma: string;
    motivo: string;
    total_items: number;
    estado: boolean;
    }

    @Injectable({ providedIn: 'root' })
    export class WastageService {
    private readonly api = environment.apiUrl;

    private readonly _loading = signal(false);
    private readonly _error = signal<string | null>(null);

    // Opcional: cache de lista
    private readonly _wastages = signal<WastageResponseDto[]>([]);

    readonly loading = computed(() => this._loading());
    readonly error = computed(() => this._error());
    readonly wastages = computed(() => this._wastages());

    constructor(private http: HttpClient) {}

    private buildHeaders(role: string = 'Administrador'): HttpHeaders {
        return new HttpHeaders({ 'x-role': role ?? '' });
    }

    createWastage(
        dto: CreateWastageDto,
        role: string = 'Administrador'
    ): Observable<WastageResponseDto> {
        this._loading.set(true);
        this._error.set(null);

        return this.http
        .post<WastageResponseDto>(`${this.api}/logistics/catalog/wastage`, dto, {
            headers: this.buildHeaders(role),
        })
        .pipe(
            tap((created) => {
            // opcional: agrega al cache
            const prev = this._wastages();
            this._wastages.set([created, ...prev]);
            }),
            catchError((err) => {
            this._error.set('No se pudo registrar la merma.');
            return throwError(() => err);
            }),
            finalize(() => this._loading.set(false))
        );
    }

    loadWastages(role: string = 'Administrador'): Observable<WastageResponseDto[]> {
        this._loading.set(true);
        this._error.set(null);

        return this.http
        .get<WastageResponseDto[]>(`${this.api}/logistics/catalog/wastage`, {
            headers: this.buildHeaders(role),
        })
        .pipe(
            tap((list) => this._wastages.set(list ?? [])),
            catchError((err) => {
            this._error.set('No se pudo cargar mermas.');
            return throwError(() => err);
            }),
            finalize(() => this._loading.set(false))
        );
    }

    getWastageById(id: number, role: string = 'Administrador'): Observable<WastageResponseDto> {
        this._loading.set(true);
        this._error.set(null);

        return this.http
        .get<WastageResponseDto>(`${this.api}/logistics/catalog/wastage/${id}`, {
            headers: this.buildHeaders(role),
        })
        .pipe(
            catchError((err) => {
            this._error.set('No se pudo cargar la merma.');
            return throwError(() => err);
            }),
            finalize(() => this._loading.set(false))
        );
    }
    }