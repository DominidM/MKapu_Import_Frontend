import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../enviroments/enviroment';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private http    = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/admin/chat`; 

  getMisConversaciones(idCuenta: number) {
    return this.http.get<any[]>(`${this.baseUrl}/conversaciones/${idCuenta}`);
  }

  crearConversacionPrivada(idCuenta1: number, idCuenta2: number, idSede: number) {
    return this.http.post<any>(`${this.baseUrl}/conversacion`, {
      id_cuenta_1: idCuenta1,
      id_cuenta_2: idCuenta2,
      id_sede:     idSede,
    });
  }

  getMensajes(idConversacion: number) {
    return this.http.get<any[]>(`${this.baseUrl}/mensajes/${idConversacion}`);
  }

  enviarMensaje(idConversacion: number, idCuenta: number, contenido: string) {
    return this.http.post<any>(`${this.baseUrl}/mensaje`, {
      id_conversacion: idConversacion,
      id_cuenta:       idCuenta,
      contenido,
    });
  }

  getNoLeidos(idCuenta: number) {
    return this.http.get<any[]>(`${this.baseUrl}/no-leidos/${idCuenta}`);
  }

  marcarLeidos(idConversacion: number, idCuenta: number) {
    return this.http.patch(`${this.baseUrl}/leidos`, {
      id_conversacion: idConversacion,
      id_cuenta:       idCuenta,
    });
  }

  getUsuariosDisponibles(idSede: number, idCuentaActual: number) {
    return this.http.get<any[]>(`${this.baseUrl}/usuarios/${idSede}/${idCuentaActual}`);
  }
}