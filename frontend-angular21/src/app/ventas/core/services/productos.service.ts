// src/app/ventas/core/services/productos.service.ts

import { Injectable } from '@angular/core';

export interface Producto {
  id: number;
  codigo: string;
  nombre: string;
  familia: string;
  sede: string;
  precioUnidad: number;
  precioCaja: number;
  precioMayorista: number;
  stock: number;
  estado: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductosService {
  
  private productos: Producto[] = [
    // LIMA
    { id: 1, codigo: 'RAF-TV55', nombre: 'Smart TV LED 55" 4K RAF', familia: 'Televisores', sede: 'Lima', precioUnidad: 1599.00, precioCaja: 1550.00, precioMayorista: 1499.00, stock: 15, estado: 'Activo' },
    { id: 2, codigo: 'RAF-LG32', nombre: 'Lavarropas Automático 10kg RAF', familia: 'Lavadoras', sede: 'Lima', precioUnidad: 899.00, precioCaja: 870.00, precioMayorista: 850.00, stock: 20, estado: 'Activo' },
    { id: 3, codigo: 'RAF-RF45', nombre: 'Refrigerador No Frost 12 pies RAF', familia: 'Refrigeradoras', sede: 'Lima', precioUnidad: 1200.00, precioCaja: 1180.00, precioMayorista: 1150.00, stock: 12, estado: 'Activo' },
    { id: 4, codigo: 'RAF-MW900', nombre: 'Microondas Inverter 900W RAF', familia: 'Electrodomésticos', sede: 'Lima', precioUnidad: 299.00, precioCaja: 290.00, precioMayorista: 280.00, stock: 30, estado: 'Activo' },
    { id: 5, codigo: 'RAF-ASP2000', nombre: 'Aspiradora Industrial 2000W RAF', familia: 'Electrodomésticos', sede: 'Lima', precioUnidad: 549.00, precioCaja: 535.00, precioMayorista: 520.00, stock: 18, estado: 'Activo' },
    
    // AREQUIPA
    { id: 6, codigo: 'RAF-COF800', nombre: 'Cafetera Automática 800W RAF', familia: 'Electrodomésticos', sede: 'Arequipa', precioUnidad: 379.00, precioCaja: 365.00, precioMayorista: 350.00, stock: 25, estado: 'Activo' },
    { id: 7, codigo: 'RAF-LIC500', nombre: 'Licuadora Profesional 500W RAF', familia: 'Electrodomésticos', sede: 'Arequipa', precioUnidad: 189.00, precioCaja: 180.00, precioMayorista: 170.00, stock: 40, estado: 'Activo' },
    { id: 8, codigo: 'RAF-HOR1800', nombre: 'Horno Eléctrico 1800W RAF', familia: 'Electrodomésticos', sede: 'Arequipa', precioUnidad: 499.00, precioCaja: 485.00, precioMayorista: 470.00, stock: 15, estado: 'Activo' },
    
    // CUSCO
    { id: 9, codigo: 'RAF-AIR12', nombre: 'Aire Acondicionado 12000 BTU RAF', familia: 'Climatización', sede: 'Cusco', precioUnidad: 1900.00, precioCaja: 1870.00, precioMayorista: 1850.00, stock: 10, estado: 'Activo' },
    { id: 10, codigo: 'RAF-VENT16', nombre: 'Ventilador Industrial 16" RAF', familia: 'Climatización', sede: 'Cusco', precioUnidad: 259.00, precioCaja: 250.00, precioMayorista: 240.00, stock: 35, estado: 'Activo' },
  ];

  constructor() {}

  getSedes(): string[] {
    return ['Lima', 'Arequipa', 'Cusco'];
  }

  getProductos(sede?: string, estado?: string): Producto[] {
    let productos = [...this.productos];

    if (sede) {
      productos = productos.filter(p => p.sede === sede);
    }

    if (estado) {
      productos = productos.filter(p => p.estado === estado);
    }

    return productos;
  }

  getProductoPorId(id: number): Producto | undefined {
    return this.productos.find(p => p.id === id);
  }

  getProductoPorCodigo(codigo: string): Producto | undefined {
    return this.productos.find(p => p.codigo === codigo);
  }
}
