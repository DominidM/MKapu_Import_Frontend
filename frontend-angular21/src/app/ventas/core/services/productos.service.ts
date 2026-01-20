import { Injectable } from '@angular/core';

export interface Producto {
  id: number;
  codigo: string;
  nombre: string;
  familia: string;
  id_sede: string;
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
    { id: 1, codigo: 'RAF-TV55', nombre: 'Smart TV LED 55" 4K RAF', familia: 'Televisores', id_sede: 'SEDE001', precioUnidad: 1599.00, precioCaja: 1550.00, precioMayorista: 1499.00, stock: 15, estado: 'Activo' },
    { id: 2, codigo: 'RAF-LG32', nombre: 'Lavarropas Automático 10kg RAF', familia: 'Lavadoras', id_sede: 'SEDE001', precioUnidad: 899.00, precioCaja: 870.00, precioMayorista: 850.00, stock: 20, estado: 'Activo' },
    { id: 3, codigo: 'RAF-RF45', nombre: 'Refrigerador No Frost 12 pies RAF', familia: 'Refrigeradoras', id_sede: 'SEDE001', precioUnidad: 1200.00, precioCaja: 1180.00, precioMayorista: 1150.00, stock: 12, estado: 'Activo' },
    { id: 4, codigo: 'RAF-MW900', nombre: 'Microondas Inverter 900W RAF', familia: 'Electrodomésticos', id_sede: 'SEDE001', precioUnidad: 299.00, precioCaja: 290.00, precioMayorista: 280.00, stock: 30, estado: 'Activo' },
    { id: 5, codigo: 'RAF-ASP2000', nombre: 'Aspiradora Industrial 2000W RAF', familia: 'Electrodomésticos', id_sede: 'SEDE001', precioUnidad: 549.00, precioCaja: 535.00, precioMayorista: 520.00, stock: 18, estado: 'Activo' },
    { id: 6, codigo: 'RAF-COF800', nombre: 'Cafetera Automática 800W RAF', familia: 'Electrodomésticos', id_sede: 'SEDE002', precioUnidad: 379.00, precioCaja: 365.00, precioMayorista: 350.00, stock: 25, estado: 'Activo' },
    { id: 7, codigo: 'RAF-LIC500', nombre: 'Licuadora Profesional 500W RAF', familia: 'Electrodomésticos', id_sede: 'SEDE002', precioUnidad: 189.00, precioCaja: 180.00, precioMayorista: 170.00, stock: 40, estado: 'Activo' },
    { id: 8, codigo: 'RAF-HOR1800', nombre: 'Horno Eléctrico 1800W RAF', familia: 'Electrodomésticos', id_sede: 'SEDE002', precioUnidad: 499.00, precioCaja: 485.00, precioMayorista: 470.00, stock: 15, estado: 'Activo' },
    { id: 9, codigo: 'RAF-AIR12', nombre: 'Aire Acondicionado 12000 BTU RAF', familia: 'Climatización', id_sede: 'SEDE003', precioUnidad: 1900.00, precioCaja: 1870.00, precioMayorista: 1850.00, stock: 10, estado: 'Activo' },
    { id: 10, codigo: 'RAF-VENT16', nombre: 'Ventilador Industrial 16" RAF', familia: 'Climatización', id_sede: 'SEDE003', precioUnidad: 259.00, precioCaja: 250.00, precioMayorista: 240.00, stock: 35, estado: 'Activo' },
    { id: 11, codigo: 'RAF-PLAN200', nombre: 'Plancha a Vapor 2000W RAF', familia: 'Electrodomésticos', id_sede: 'SEDE001', precioUnidad: 129.00, precioCaja: 120.00, precioMayorista: 115.00, stock: 45, estado: 'Activo' },
    { id: 12, codigo: 'RAF-BAT100', nombre: 'Batidora Eléctrica 5 Velocidades RAF', familia: 'Electrodomésticos', id_sede: 'SEDE002', precioUnidad: 149.00, precioCaja: 140.00, precioMayorista: 135.00, stock: 50, estado: 'Activo' },
    { id: 13, codigo: 'RAF-TER150', nombre: 'Termo Eléctrico 1.5L RAF', familia: 'Electrodomésticos', id_sede: 'SEDE003', precioUnidad: 99.00, precioCaja: 95.00, precioMayorista: 90.00, stock: 60, estado: 'Activo' },
    { id: 14, codigo: 'RAF-SAND900', nombre: 'Sandwichera Antiadherente 900W RAF', familia: 'Electrodomésticos', id_sede: 'SEDE001', precioUnidad: 119.00, precioCaja: 110.00, precioMayorista: 105.00, stock: 35, estado: 'Activo' },
    { id: 15, codigo: 'RAF-EXTR90', nombre: 'Extractor de Aire 90cm RAF', familia: 'Electrodomésticos', id_sede: 'SEDE002', precioUnidad: 349.00, precioCaja: 335.00, precioMayorista: 320.00, stock: 22, estado: 'Activo' }
  ];

  constructor() {}

  getSedes(): string[] {
    return ['SEDE001', 'SEDE002', 'SEDE003'];
  }

  getProductos(idSede?: string, estado?: 'Activo' | 'Inactivo'): Producto[] {
    let productos = [...this.productos];

    if (idSede) {
      productos = productos.filter((p: Producto) => p.id_sede === idSede);
    }

    if (estado) {
      productos = productos.filter((p: Producto) => p.estado === estado);
    }

    return productos;
  }

  getProductoPorId(id: number): Producto | undefined {
    return this.productos.find(p => p.id === id);
  }

  getProductoPorCodigo(codigo: string): Producto | undefined {
    return this.productos.find(p => p.codigo === codigo);
  }

  getFamilias(): string[] {
    const familias = [...new Set(this.productos.map(p => p.familia))];
    return familias.sort();
  }

  getProductosPorFamilia(familia: string): Producto[] {
    return this.productos.filter(p => p.familia === familia && p.estado === 'Activo');
  }

  buscarProductos(termino: string): Producto[] {
    const busqueda = termino.toLowerCase();
    return this.productos.filter(p => 
      p.estado === 'Activo' && (
        p.nombre.toLowerCase().includes(busqueda) ||
        p.codigo.toLowerCase().includes(busqueda)
      )
    );
  }

  actualizarStock(id: number, cantidad: number): boolean {
    const producto = this.productos.find(p => p.id === id);
    if (producto && producto.stock >= cantidad) {
      producto.stock -= cantidad;
      return true;
    }
    return false;
  }

  getStockDisponible(id: number): number {
    const producto = this.productos.find(p => p.id === id);
    return producto ? producto.stock : 0;
  }
}
