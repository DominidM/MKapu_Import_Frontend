import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Producto {
  id: number;
  codigo: string;
  sede: string;
  nombre: string;
  familia: string;
  precioUnidad: number;
  precioCaja: number;
  precioMayorista: number;
  estado: 'Activo' | 'Eliminado';
  fechaCreacion?: Date;
  fechaActualizacion?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ProductosService {
  private productosSubject = new BehaviorSubject<Producto[]>([]);
  public productos$ = this.productosSubject.asObservable();

  constructor() {
    this.inicializarDatos();
  }

  private inicializarDatos() {
    const datosIniciales: Producto[] = [
      {
        id: 1, codigo: 'RAF-TV55', sede: 'LAS FLORES', 
        nombre: 'Smart TV LED 55" 4K RAF', familia: 'Televisores', 
        precioUnidad: 1599.00, precioCaja: 15200.00, precioMayorista: 1450.00,
        estado: 'Activo'
      },
      {
        id: 2, codigo: 'RAF-LG32', sede: 'LURIN', 
        nombre: 'Lavarropas Automático 10kg RAF', familia: 'Lavarropas',
        precioUnidad: 899.00, precioCaja: 8500.00, precioMayorista: 820.00,
        estado: 'Activo'
      },
      {
        id: 3, codigo: 'RAF-RF45', sede: 'LAS FLORES', 
        nombre: 'Refrigerador No Frost 12 pies RAF', familia: 'Refrigeradores',
        precioUnidad: 1299.00, precioCaja: 12300.00, precioMayorista: 1180.00,
        estado: 'Activo'
      },
      {
        id: 4, codigo: 'RAF-MW900', sede: 'LAS FLORES', 
        nombre: 'Microondas Inverter 900W RAF', familia: 'Microondas',
        precioUnidad: 299.00, precioCaja: 2800.00, precioMayorista: 275.00,
        estado: 'Activo'
      }
    ];
    this.productosSubject.next(datosIniciales);
  }

  // ✅ 1. CRUD BÁSICO
  getProductos(sede?: string, estado: 'Activo' | 'Eliminado' = 'Activo'): Producto[] {
    let productos = this.productosSubject.value.filter(p => p.estado === estado);
    if (sede) productos = productos.filter(p => p.sede === sede);
    return productos;
  }

  getProductoPorId(id: number): Producto | null {
    return this.productosSubject.value.find(p => p.id === id) || null;
  }

  crearProducto(productoData: Omit<Producto, 'id'>): Producto {
    const productos = [...this.productosSubject.value];
    const nuevoId = Math.max(...productos.map(p => p.id), 0) + 1;
    
    const nuevoProducto: Producto = {
      ...productoData,
      id: nuevoId,
      fechaCreacion: new Date(),
      estado: 'Activo'
    };
    
    productos.push(nuevoProducto);
    this.productosSubject.next(productos);
    return nuevoProducto;
  }

  actualizarProducto(id: number, cambios: Partial<Producto>): boolean {
    const productos = [...this.productosSubject.value];
    const index = productos.findIndex(p => p.id === id);
    
    if (index !== -1) {
      productos[index] = { 
        ...productos[index], 
        ...cambios, 
        fechaActualizacion: new Date() 
      };
      this.productosSubject.next(productos);
      return true;
    }
    return false;
  }

  eliminarProducto(id: number): boolean {
    return this.actualizarProducto(id, { estado: 'Eliminado' });
  }

  restaurarProducto(id: number): boolean {
    return this.actualizarProducto(id, { estado: 'Activo' });
  }

  // ✅ 2. UTILIDADES BÁSICAS
  getSedes(): string[] {
    return [...new Set(this.productosSubject.value.map(p => p.sede))];
  }

  getFamilias(sede?: string): string[] {
    const productos = sede ? this.getProductos(sede) : this.getProductos();
    return [...new Set(productos.map(p => p.familia))];
  }

  existeCodigo(codigo: string): boolean {
    return this.productosSubject.value.some(p => p.codigo === codigo);
  }

  // ✅ 3. CONTADORES POR SEDE (NUEVO)
  getTotalProductosPorSede(sede: string, estado: 'Activo' | 'Eliminado' = 'Activo'): number {
    return this.getProductos(sede, estado).length;
  }

  getTotalProductosActivosPorSede(sede: string): number {
    return this.getTotalProductosPorSede(sede, 'Activo');
  }

  getTotalProductosEliminadosPorSede(sede: string): number {
    return this.getTotalProductosPorSede(sede, 'Eliminado');
  }

  // ✅ 4. RESUMEN COMPLETO (NUEVO)
  getResumenPorSedes(): {sede: string, activos: number, eliminados: number, total: number}[] {
    const sedes = this.getSedes();
    return sedes.map(sede => ({
      sede,
      activos: this.getTotalProductosActivosPorSede(sede),
      eliminados: this.getTotalProductosEliminadosPorSede(sede),
      total: this.getTotalProductosPorSede(sede)
    }));
  }

  // ✅ 5. ESTADÍSTICAS GLOBALES (NUEVO)
  getTotalProductos(estado: 'Activo' | 'Eliminado'): number {
    return this.getProductos(undefined, estado).length;
  }

  getTotalProductosActivos(): number {
    return this.getTotalProductos('Activo');
  }

  getTotalProductosEliminados(): number {
    return this.getTotalProductos('Eliminado');
  }

  // ✅ 6. COMPARATIVA PRECIOS (NUEVO - útil para tu diagrama)
  getComparativaPorProducto(codigo: string): Producto[] {
    return this.productosSubject.value.filter(p => p.codigo === codigo);
  }

  getPrecioPromedioPorProducto(codigo: string): number {
    const productos = this.getComparativaPorProducto(codigo);
    return productos.length > 0 ? 
      productos.reduce((sum, p) => sum + p.precioUnidad, 0) / productos.length : 0;
  }
}
