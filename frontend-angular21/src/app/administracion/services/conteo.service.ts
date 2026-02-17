import { Injectable } from '@angular/core';

export interface ConteoInventario {
  id: number;
  fecha: string;
  detalle: string;
  estado: string;
  familia: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConteoService {

  private conteos: ConteoInventario[] = [
    {
      id: 1,
      fecha: '08/02/2026',
      detalle: 'Conteo mensual licuadoras',
      estado: 'Inicio',
      familia: 'Licuadoras'
    },
    {
      id: 2,
      fecha: '07/02/2026',
      detalle: 'Revisión anual freidoras',
      estado: 'Finalizado',
      familia: 'Freidoras'
    },
    {
      id: 3,
      fecha: '06/02/2026',
      detalle: 'Conteo REFRIS - Sede Norte',
      estado: 'Anulado',
      familia: 'Refris'
    },
    {
      id: 4,
      fecha: '05/02/2026',
      detalle: 'Stock Cocinas industriales',
      estado: 'Inicio',
      familia: 'Cocinas'
    },
    {
      id: 5,
      fecha: '04/02/2026',
      detalle: 'Inventario licuadoras portátiles',
      estado: 'Finalizado',
      familia: 'Licuadoras'
    }
  ];

  getConteos() {
    return this.conteos;
  }

  getConteoById(id: number) {
    return this.conteos.find(c => c.id === id);
  }

}
