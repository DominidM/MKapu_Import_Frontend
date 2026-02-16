import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../enviroments/enviroment';

import {
  ProductoStockResponse,
  ProductoAutocompleteResponse,
  ProductoDetalle,
  Producto,
  ProductoConStock,
} from '../interfaces';

@Injectable({
  providedIn: 'root',
})
export class ProductoService {
  private apiUrl = `${environment.apiUrl}/logistics`;

  constructor(private http: HttpClient) {}

  buscarProductos(query: string, idSede: number): Observable<ProductoAutocompleteResponse> {
    const params = new HttpParams().set('search', query).set('id_sede', idSede.toString());

    return this.http.get<ProductoAutocompleteResponse>(`${this.apiUrl}/products/autocomplete`, {
      params,
    });
  }

  obtenerProductosConStock(
    idSede: number,
    idCategoria?: number,
    page: number = 1,
    size: number = 500,
  ): Observable<ProductoStockResponse> {
    let params = new HttpParams()
      .set('id_sede', idSede.toString())
      .set('page', page.toString())
      .set('size', size.toString());

    if (idCategoria) {
      params = params.set('id_categoria', idCategoria.toString());
    }

    return this.http.get<ProductoStockResponse>(`${this.apiUrl}/products/productos_stock`, {
      params,
    });
  }

  obtenerDetalleProducto(idProducto: number, idSede: number): Observable<ProductoDetalle> {
    const params = new HttpParams().set('id_sede', idSede.toString());

    return this.http.get<ProductoDetalle>(`${this.apiUrl}/products/${idProducto}/stock`, {
      params,
    });
  }

  mapearProductoConStock(prod: ProductoConStock, detalle: ProductoDetalle): Producto {
    return {
      id: prod.id_producto,
      codigo: prod.codigo,
      nombre: prod.nombre,
      familia: detalle.producto.categoria.nombre,
      stock: prod.stock,
      precioUnidad: detalle.producto.precio_unitario,
      precioCaja: detalle.producto.precio_caja,
      precioMayorista: detalle.producto.precio_mayor,
      sede: prod.sede,
    };
  }
}
