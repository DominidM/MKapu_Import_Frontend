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
      },
      {
        id: 5, codigo: 'RAF-ASP2000', sede: 'LURIN',
        nombre: 'Aspiradora Industrial 2000W RAF', familia: 'Electrodomésticos',
        precioUnidad: 549.00, precioCaja: 5200.00, precioMayorista: 500.00,
        estado: 'Activo'
      },
      {
        id: 6, codigo: 'RAF-COF800', sede: 'LAS FLORES',
        nombre: 'Cafetera Automática 800W RAF', familia: 'Cocina',
        precioUnidad: 379.00, precioCaja: 3600.00, precioMayorista: 345.00,
        estado: 'Activo'
      },
      {
        id: 7, codigo: 'RAF-LIC500', sede: 'LAS FLORES',
        nombre: 'Licuadora Profesional 500W RAF', familia: 'Cocina',
        precioUnidad: 189.00, precioCaja: 1800.00, precioMayorista: 170.00,
        estado: 'Activo'
      },
      {
        id: 8, codigo: 'RAF-HOR1800', sede: 'LAS FLORES',
        nombre: 'Horno Eléctrico 1800W RAF', familia: 'Cocina',
        precioUnidad: 499.00, precioCaja: 4700.00, precioMayorista: 460.00,
        estado: 'Activo'
      },
      {
        id: 9, codigo: 'RAF-AIR12', sede: 'LURIN',
        nombre: 'Aire Acondicionado 12000 BTU RAF', familia: 'Climatización',
        precioUnidad: 1899.00, precioCaja: 18200.00, precioMayorista: 1750.00,
        estado: 'Activo'
      },
      {
        id: 10, codigo: 'RAF-VENT16', sede: 'LAS FLORES',
        nombre: 'Ventilador Industrial 16" RAF', familia: 'Climatización',
        precioUnidad: 259.00, precioCaja: 2450.00, precioMayorista: 235.00,
        estado: 'Activo'
      },
      {
        id: 11, codigo: 'RAF-BAT100', sede: 'LAS FLORES',
        nombre: 'Batidora Eléctrica 5 Velocidades RAF', familia: 'Cocina',
        precioUnidad: 149.00, precioCaja: 1400.00, precioMayorista: 135.00,
        estado: 'Activo'
      },
      {
        id: 12, codigo: 'RAF-SEC8K', sede: 'LURIN',
        nombre: 'Secadora Eléctrica 8kg RAF', familia: 'Lavarropas',
        precioUnidad: 1099.00, precioCaja: 10500.00, precioMayorista: 1020.00,
        estado: 'Activo'
      },
      {
        id: 13, codigo: 'RAF-REF20', sede: 'LAS FLORES',
        nombre: 'Refrigerador Side by Side 20 pies RAF', familia: 'Refrigeradores',
        precioUnidad: 2399.00, precioCaja: 23000.00, precioMayorista: 2200.00,
        estado: 'Activo'
      },
      {
        id: 14, codigo: 'RAF-MW1200', sede: 'LAS FLORES',
        nombre: 'Microondas Digital 1200W RAF', familia: 'Microondas',
        precioUnidad: 389.00, precioCaja: 3700.00, precioMayorista: 360.00,
        estado: 'Activo'
      },
      {
        id: 15, codigo: 'RAF-TV65', sede: 'LURIN',
        nombre: 'Smart TV LED 65" 4K RAF', familia: 'Televisores',
        precioUnidad: 2299.00, precioCaja: 22000.00, precioMayorista: 2100.00,
        estado: 'Activo'
      },
      {
        id: 16, codigo: 'RAF-PLAN200', sede: 'LAS FLORES',
        nombre: 'Plancha a Vapor 2000W RAF', familia: 'Electrodomésticos',
        precioUnidad: 129.00, precioCaja: 1200.00, precioMayorista: 115.00,
        estado: 'Activo'
      },
      {
        id: 17, codigo: 'RAF-TER150', sede: 'LAS FLORES',
        nombre: 'Termo Eléctrico 1.5L RAF', familia: 'Cocina',
        precioUnidad: 99.00, precioCaja: 920.00, precioMayorista: 88.00,
        estado: 'Activo'
      },
      {
        id: 18, codigo: 'RAF-EXTR90', sede: 'LURIN',
        nombre: 'Extractor de Aire 90cm RAF', familia: 'Climatización',
        precioUnidad: 349.00, precioCaja: 3300.00, precioMayorista: 320.00,
        estado: 'Activo'
      },
      {
        id: 19, codigo: 'RAF-LAV15', sede: 'LAS FLORES',
        nombre: 'Lavavajillas 15 Servicios RAF', familia: 'Cocina',
        precioUnidad: 1599.00, precioCaja: 15200.00, precioMayorista: 1480.00,
        estado: 'Activo'
      },
      {
        id: 20, codigo: 'RAF-CAMP4H', sede: 'LAS FLORES',
        nombre: 'Campana Extractora 4 Hornillas RAF', familia: 'Cocina',
        precioUnidad: 459.00, precioCaja: 4300.00, precioMayorista: 415.00,
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

  getProductosEliminados(sede?: string): Producto[] {
  let eliminados = this.productosSubject.value.filter(p => p.estado === 'Eliminado');
  if (sede) eliminados = eliminados.filter(p => p.sede === sede);
  return eliminados;
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

  // ✅ ALIAS para compatibilidad con el componente
  getProductoById(id: number): Producto | null {
    return this.getProductoPorId(id);
  }

  // ✅ WRAPPER para crearProducto que retorna boolean
  crearProductoBoolean(productoData: Omit<Producto, 'id'>): boolean {
    try {
      this.crearProducto(productoData);
      return true;
    } catch (error) {
      console.error('Error al crear producto:', error);
      return false;
    }
  }

  // ✅ WRAPPER para actualizarProducto compatible
  actualizarProductoCompleto(id: number, producto: Producto): boolean {
    return this.actualizarProducto(id, producto);
  }



}
