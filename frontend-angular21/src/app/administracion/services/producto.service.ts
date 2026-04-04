import { Injectable } from '@angular/core';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { environment } from '../../../enviroments/enviroment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import {
  CreateProductoDto,
  MovimientoInventarioDto,
  MovimientoInventarioResponse,
  ProductoAutocompleteResponse,
  ProductoDetalleStockResponse,
  ProductoInterface,
  ProductoResponse,
  ProductoStockResponse,
  UpdateProductoDto,
  UpdateProductoPreciosDto,
} from '../interfaces/producto.interface';
import { Observable } from 'rxjs';

export interface AjusteInventarioDto {
  productId: number;
  warehouseId: number;
  idSede: number;
  quantity: number;
  reason: string;
  userId: number;
}

@Injectable({ providedIn: 'root' })
export class ProductoService {
  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getProductos(
    page?: number,
    limit?: number,
    estado?: boolean,
    search?: string,
    idCategoria?: number,
  ): Observable<ProductoResponse> {
    let params = new HttpParams();
    if (page) params = params.set('page', page);
    if (limit) params = params.set('limit', limit);
    if (estado !== undefined) params = params.set('estado', estado);
    if (search) params = params.set('search', search);
    if (idCategoria) params = params.set('id_categoria', idCategoria);
    return this.http.get<ProductoResponse>(`${this.api}/logistics/products`, { params });
  }

  getProductosConStock(
    idSede: number,
    page: number,
    size: number,
    categoria?: string,
    activo?: boolean,
  ): Observable<ProductoStockResponse> {
    let params = new HttpParams().set('id_sede', idSede);
    if (page) params = params.set('page', page);
    if (size) params = params.set('size', size);
    if (categoria) params = params.set('categoria', categoria);
    if (activo !== undefined && activo !== null) params = params.set('activo', activo.toString());
    return this.http.get<ProductoStockResponse>(`${this.api}/logistics/products/productos_stock`, {
      params,
    });
  }

  getCajasByProducto(idProducto: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/logistics/cajas/producto/${idProducto}`);
  }

  getProductosAutocomplete(
    search: string,
    idSede: number,
  ): Observable<ProductoAutocompleteResponse> {
    const params = new HttpParams().set('search', search).set('id_sede', idSede);
    return this.http.get<ProductoAutocompleteResponse>(
      `${this.api}/logistics/products/autocomplete`,
      { params },
    );
  }

  getProductoDetalleStock(
    idProducto: number,
    idSede: number,
  ): Observable<ProductoDetalleStockResponse> {
    const params = new HttpParams().set('id_sede', idSede);
    return this.http.get<ProductoDetalleStockResponse>(
      `${this.api}/logistics/products/${idProducto}/stock`,
      { params },
    );
  }

  getProductoByCodigo(codigo: string): Observable<any> {
    return this.http.get<any>(`${this.api}/logistics/products/code/${encodeURIComponent(codigo)}`);
  }

  getProductoByCodigoConStock(codigo: string, idSede: number): Observable<any> {
    const params = new HttpParams().set('id_sede', idSede);
    return this.http.get<any>(
      `${this.api}/logistics/products/code/${encodeURIComponent(codigo)}/stock`,
      { params },
    );
  }

  crearProducto(producto: CreateProductoDto): Observable<ProductoInterface> {
    return this.http.post<ProductoInterface>(`${this.api}/logistics/products`, producto);
  }

  /** Registra un ingreso de inventario (COMPRA) — para creación de productos */
  registrarIngresoInventario(
    movimiento: MovimientoInventarioDto,
  ): Observable<MovimientoInventarioResponse> {
    const headers = new HttpHeaders({ 'x-role': 'Administrador' });
    return this.http.post<MovimientoInventarioResponse>(
      `${this.api}/logistics/inventory-movements/income`,
      movimiento,
      { headers },
    );
  }

  /** Registra un ajuste de inventario — para edición de productos (POST /adjustment) */
  registrarAjusteInventario(dto: AjusteInventarioDto): Observable<any> {
    return this.http.post<any>(`${this.api}/logistics/inventory-movements/adjustment`, dto);
  }

  actualizarProductoInfo(producto: UpdateProductoDto): Observable<any> {
    return this.http.put<any>(`${this.api}/logistics/products`, producto);
  }

  actualizarProductoPrecios(precios: UpdateProductoPreciosDto): Observable<any> {
    return this.http.put<any>(`${this.api}/logistics/products/prices`, precios);
  }

  actualizarProductoEstado(idProducto: number, estado: boolean): Observable<any> {
    return this.http.put<any>(`${this.api}/logistics/products/status`, {
      id_producto: idProducto,
      estado,
    });
  }

  getProductosAutocompleteConPrecio(search: string, idSede: number): Observable<any> {
    const params = new HttpParams().set('search', search).set('id_sede', idSede);
    return this.http.get<any>(`${this.api}/logistics/products/ventas/autocomplete`, { params });
  }

  existsByCode(codigo: string): Observable<boolean> {
    return this.getProductoByCodigo(codigo).pipe(
      map((resp: any) => !!resp?.id_producto || !!resp?.producto?.id_producto),
      catchError(() => of(false)) 
    );
  }
}
