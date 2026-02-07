import { Injectable } from '@angular/core';
import { environment } from '../../../enviroments/enviroment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs'

@Injectable({
  providedIn: 'root',
})
export class SedeService {
  private api = environment.apiUrl;
  constructor(private http: HttpClient) {}

  getSedes(): Observable<any> {
    const role = 'Administrador' // o la key real
    console.log('role', role)
    const headers = new HttpHeaders({
      'x-role': role ?? '',
    });

    return this.http.get<any>(`${this.api}/admin/headquarters`,{ headers } );
  }

}
