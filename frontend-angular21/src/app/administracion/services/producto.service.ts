import { Injectable } from '@angular/core';
import { environment } from '../../../enviroments/enviroment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ProductoResponse } from '../interfaces/producto.interface';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProductoService {
  
  private api = environment.apiUrl;
  constructor(private http: HttpClient) {}

  getProductos(
      page: number = 1,
      limit: number = 5,
      estado?: boolean,
      search?: string,
      idCategoria?: number
    ): Observable<ProductoResponse> {

      let params = new HttpParams()
        .set('page', page)
        .set('limit', limit);

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

}
