import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../enviroments/enviroment';

// ── Interfaces de administración ─────────────────────────────────────────────
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

// ── Interfaces de ventas ──────────────────────────────────────────────────────
import {
  ProductoStockVentasResponse,
  ProductoStockVentas,
  ProductoAutocompleteVentasResponse,
  ProductoAutocompleteVentas,
  ProductoDetalle,
  CategoriaConStock,
  ProductoUI,
} from '../interfaces';

// ── DTO ajuste inventario ─────────────────────────────────────────────────────
export interface AjusteInventarioDto {
  productId:   number;
  warehouseId: number;
  idSede:      number;
  quantity:    number;
  reason:      string;
  userId:      number;
}


export interface Producto {
  id?: number;
  codigo: string;
  anexo?: string;
  nombre: string;
  descripcion?: string;
  familia: string;
  precioCompra: number;
  precioVenta: number;
  precioUnidad: number;
  precioCaja: number;
  precioMayorista: number;
  unidadMedida: string;
  estado: 'Activo' | 'Eliminado';
  fechaCreacion: Date;
  fechaActualizacion: Date;
  variantes?: VarianteProducto[];
  stockTotal?: number;
  cantidadSedes?: number;
  sede?: string;
  stock?: number;
}

export interface VarianteProducto {
  id?: number;
  sede: string;
  stock: number;
}

@Injectable({ providedIn: 'root' })
export class ProductoService {
  private readonly api      = environment.apiUrl;
  private readonly apiLogistics = `${environment.apiUrl}/logistics`;

  constructor(private readonly http: HttpClient) {}

  // ══════════════════════════════════════════════════════════════════════════
  // CONSULTAS — Productos con stock
  // ══════════════════════════════════════════════════════════════════════════

  /** Listado paginado para gestión (administración) */
  getProductosConStock(
    idSede: number,
    page: number,
    size: number,
    categoria?: string,
    activo?: boolean,
  ): Observable<ProductoStockResponse> {
    let params = new HttpParams().set('id_sede', idSede);
    if (page)     params = params.set('page', page);
    if (size)     params = params.set('size', size);
    if (categoria) params = params.set('categoria', categoria);
    if (activo !== undefined && activo !== null)
      params = params.set('activo', activo.toString());
    return this.http.get<ProductoStockResponse>(
      `${this.apiLogistics}/products/productos_stock`, { params }
    );
  }

  /** Listado paginado para ventas */
  obtenerProductosConStock(
    idSede: number,
    idCategoria?: number,
    page: number = 1,
    size: number = 10,
  ): Observable<ProductoStockVentasResponse> {
    let params = new HttpParams()
      .set('id_sede', String(idSede))
      .set('page', String(page))
      .set('size', String(size));
    if (idCategoria) params = params.set('id_categoria', String(idCategoria));
    return this.http.get<ProductoStockVentasResponse>(
      `${this.apiLogistics}/products/ventas/stock`, { params }
    );
  }

  /** Detalle de producto con stock — usado en administración y ventas */
  getProductoDetalleStock(idProducto: number, idSede: number): Observable<ProductoDetalleStockResponse> {
    const params = new HttpParams().set('id_sede', idSede);
    return this.http.get<ProductoDetalleStockResponse>(
      `${this.apiLogistics}/products/${idProducto}/stock`, { params }
    );
  }

  /** Alias para ventas */
  obtenerDetalleProducto(idProducto: number, idSede: number): Observable<ProductoDetalle> {
    const params = new HttpParams().set('id_sede', String(idSede));
    return this.http.get<ProductoDetalle>(
      `${this.apiLogistics}/products/${idProducto}/stock`, { params }
    );
  }
  
  getPorcentajeMargen(producto: Producto): number {
      return producto.precioCompra > 0
        ? ((producto.precioVenta - producto.precioCompra) / producto.precioCompra) * 100
        : 0;
    }
  // ══════════════════════════════════════════════════════════════════════════
  // AUTOCOMPLETE
  // ══════════════════════════════════════════════════════════════════════════

  /** Autocomplete para administración */
  getProductosAutocomplete(search: string, idSede: number): Observable<ProductoAutocompleteResponse> {
    const params = new HttpParams().set('search', search).set('id_sede', idSede);
    return this.http.get<ProductoAutocompleteResponse>(
      `${this.apiLogistics}/products/autocomplete`, { params }
    );
  }

  /** Autocomplete para ventas */
  buscarProductos(
    query: string,
    idSede: number,
    idCategoria?: number,
  ): Observable<ProductoAutocompleteResponse> {
    let params = new HttpParams().set('search', query).set('id_sede', String(idSede));
    if (idCategoria) params = params.set('id_categoria', String(idCategoria));
    return this.http.get<ProductoAutocompleteResponse>(
      `${this.apiLogistics}/products/autocomplete`, { params }
    );
  }

  /** Autocomplete con precios para ventas */
  getProductosAutocompleteConPrecio(search: string, idSede: number): Observable<any> {
    const params = new HttpParams().set('search', search).set('id_sede', idSede);
    return this.http.get<any>(
      `${this.apiLogistics}/products/ventas/autocomplete`, { params }
    );
  }

  buscarProductosVentas(
    query: string,
    idSede: number,
    idCategoria?: number,
  ): Observable<ProductoAutocompleteVentasResponse> {
    let params = new HttpParams().set('search', query).set('id_sede', String(idSede));
    if (idCategoria) params = params.set('id_categoria', String(idCategoria));
    return this.http.get<ProductoAutocompleteVentasResponse>(
      `${this.apiLogistics}/products/ventas/autocomplete`, { params }
    );
  }

  buscarPorCodigo(codigo: string): Observable<any[]> {
    const params = new HttpParams().set('codigo', codigo);
    return this.http.get<any[]>(
      `${this.apiLogistics}/inventory-movements/autocomplete`, { params }
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // CATEGORÍAS
  // ══════════════════════════════════════════════════════════════════════════

  obtenerCategoriasConStock(idSede: number): Observable<CategoriaConStock[]> {
    const params = new HttpParams().set('id_sede', String(idSede));
    return this.http.get<CategoriaConStock[]>(
      `${this.apiLogistics}/products/categorias-con-stock`, { params }
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // CRUD — Productos
  // ══════════════════════════════════════════════════════════════════════════

  getProductos(
    page?: number,
    limit?: number,
    estado?: boolean,
    search?: string,
    idCategoria?: number,
  ): Observable<ProductoResponse> {
    let params = new HttpParams();
    if (page)                  params = params.set('page', page);
    if (limit)                 params = params.set('limit', limit);
    if (estado !== undefined)  params = params.set('estado', estado);
    if (search)                params = params.set('search', search);
    if (idCategoria)           params = params.set('id_categoria', idCategoria);
    return this.http.get<ProductoResponse>(`${this.apiLogistics}/products`, { params });
  }

  getProductoByCodigo(codigo: string): Observable<any> {
    return this.http.get<any>(
      `${this.apiLogistics}/products/code/${encodeURIComponent(codigo)}`
    );
  }

  getProductoByCodigoConStock(codigo: string, idSede: number): Observable<any> {
    const params = new HttpParams().set('id_sede', idSede);
    return this.http.get<any>(
      `${this.apiLogistics}/products/code/${encodeURIComponent(codigo)}/stock`, { params }
    );
  }

  crearProducto(producto: CreateProductoDto): Observable<ProductoInterface> {
    return this.http.post<ProductoInterface>(`${this.apiLogistics}/products`, producto);
  }

  actualizarProductoInfo(producto: UpdateProductoDto): Observable<any> {
    return this.http.put<any>(`${this.apiLogistics}/products`, producto);
  }

  actualizarProductoPrecios(precios: UpdateProductoPreciosDto): Observable<any> {
    return this.http.put<any>(`${this.apiLogistics}/products/prices`, precios);
  }

  actualizarProductoEstado(idProducto: number, estado: boolean): Observable<any> {
    return this.http.put<any>(`${this.apiLogistics}/products/status`, {
      id_producto: idProducto,
      estado,
    });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // INVENTARIO
  // ══════════════════════════════════════════════════════════════════════════

  /** Ingreso de inventario por COMPRA — usado al crear un producto */
  registrarIngresoInventario(
    movimiento: MovimientoInventarioDto,
  ): Observable<MovimientoInventarioResponse> {
    const headers = new HttpHeaders({ 'x-role': 'Administrador' });
    return this.http.post<MovimientoInventarioResponse>(
      `${this.apiLogistics}/inventory-movements/income`,
      movimiento,
      { headers },
    );
  }

  /** Ajuste de inventario — usado al editar stock de un producto */
  registrarAjusteInventario(dto: AjusteInventarioDto): Observable<any> {
    return this.http.post<any>(
      `${this.apiLogistics}/inventory-movements/adjustment`,
      dto,
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // MAPPERS — helpers para transformar respuesta a ProductoUI
  // ══════════════════════════════════════════════════════════════════════════

  mapearProductoConStock(prod: ProductoStockVentas): ProductoUI {
    return {
      id:              prod.id_producto,
      codigo:          prod.codigo,
      nombre:          prod.nombre,
      familia:         prod.familia,
      id_categoria:    prod.id_categoria,
      stock:           prod.stock,
      precioUnidad:    prod.precio_unitario,
      precioCaja:      prod.precio_caja,
      precioMayorista: prod.precio_mayor,
      sede:            prod.sede,
    };
  }

  mapearAutocompleteVentas(prod: ProductoAutocompleteVentas, sedeNombre: string): ProductoUI {
    return {
      id:              prod.id_producto,
      codigo:          prod.codigo,
      nombre:          prod.nombre,
      familia:         prod.familia,
      id_categoria:    prod.id_categoria,
      stock:           prod.stock,
      precioUnidad:    prod.precio_unitario,
      precioCaja:      prod.precio_caja,
      precioMayorista: prod.precio_mayor,
      sede:            sedeNombre,
    };
  }

  
  actualizarProducto(id: number, cambios: Partial<Producto>): boolean {
      const productos = [...this.productosSubject.value];
      const index = productos.findIndex((p) => p.id === id);

      if (index !== -1) {
        productos[index] = {
          ...productos[index],
          ...cambios,
          fechaActualizacion: new Date(),
        };
        productos[index] = this.calcularPropiedadesDerivadas(productos[index]);
        this.productosSubject.next(productos);
        return true;
      }
      return false;
  }

  eliminarProducto(id: number): boolean {
    return this.actualizarProducto(id, { estado: 'Eliminado' });
  }

}