import { Injectable } from '@angular/core';
import { environment } from '../../../enviroments/enviroment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ProductoAutocompleteResponse, ProductoResponse, ProductoStockResponse } from '../interfaces/producto.interface';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProductoService {

  private api = environment.apiUrl;
  constructor(private http: HttpClient) { }

  getProductos(
    page?: number,
    limit?: number,
    estado?: boolean,
    search?: string,
    idCategoria?: number
  ): Observable<ProductoResponse> {

    let params = new HttpParams()

    if (page) {
      params = params.set('page', page);
    }

    if (limit) {
      params = params.set('limit', limit);
    }

    if (estado !== undefined) {
      params = params.set('estado', estado);
    }

    if (search) {
      params = params.set('search', search);
    }

    if (idCategoria) {
      params = params.set('id_categoria', idCategoria);
    }

    return this.http.get<ProductoResponse>(
      `${this.api}/logistics/products`,
      { params }
    );
  }

  getProductosConStock(
    idSede: number,
    page?: number,
    size?: number
  ): Observable<ProductoStockResponse> {

    let params = new HttpParams()
      .set('id_sede', idSede);

    if (page) {
      params = params.set('page', page);
    }

    if (size) {
      params = params.set('size', size);
    }

    return this.http.get<ProductoStockResponse>(
      `${this.api}/logistics/products/productos_stock`,
      { params }
    );
  }

  getProductosAutocomplete(
    search: string,
    idSede: number
  ): Observable<ProductoAutocompleteResponse> {

    const params = new HttpParams()
      .set('search', search)
      .set('id_sede', idSede);

    return this.http.get<ProductoAutocompleteResponse>(
      `${this.api}/logistics/products/autocomplete`,
      { params }
    );
  }


}
