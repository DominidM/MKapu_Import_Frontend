import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { environment } from '../../../enviroments/enviroment';

export interface Empresa {
  id:              number;
  nombreComercial: string;
  razonSocial:     string | null;
  ruc:             string;
  sitioWeb:        string | null;
  direccion:       string | null;
  ciudad:          string | null;
  departamento:    string | null;
  telefono:        string | null;
  email:           string | null;
  logoUrl:         string | null;
  updatedAt:       string;
}

export interface UpdateEmpresaPayload {
  nombreComercial: string;
  razonSocial?:    string;
  ruc:             string;
  sitioWeb?:       string;
  direccion?:      string;
  ciudad?:         string;
  departamento?:   string;
  telefono?:       string;
  email?:          string;
  logoUrl?:        string;
  logoPublicId?:   string;
}

@Injectable({ providedIn: 'root' })
export class EmpresaService {
  private readonly http    = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/admin/empresa`;

  empresaActual = signal<Empresa | null>(null);

  getEmpresa() {
    return this.http.get<Empresa>(this.baseUrl).pipe(
      tap(data => this.empresaActual.set(data)),
    );
  }

  updateEmpresa(payload: UpdateEmpresaPayload) {
    return this.http.put<Empresa>(this.baseUrl, payload).pipe(
      tap(data => this.empresaActual.set(data)),
    );
  }

  uploadLogo(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ url: string; publicId: string }>(
      `${this.baseUrl}/logo`,
      formData
    );
  }
}