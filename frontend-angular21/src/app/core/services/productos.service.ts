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


export interface ComparativaProducto {
  codigo: string;
  nombre: string;
  familia: string;
  variantes: {
    id: number;
    sede: string;
    precioUnidad: number;
    precioCaja: number;
    precioMayorista: number;
    estado: 'Activo' | 'Eliminado';
    diferenciaPrecioUnidad?: number;
    diferenciaPrecioCaja?: number;
    diferenciaPrecioMayorista?: number;
    porcentajeDiferencia?: number;
  }[];
  precioPromedioUnidad: number;
  precioCajaPromedio: number;
  precioMayoristaPromedio: number;
  precioMinimoUnidad: number;
  precioMaximoUnidad: number;
  sedeMasBarata: string;
  sedeMasCara: string;
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
        estado: 'Eliminado'
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
      },
      {
        id: 21, codigo: 'RAF-TV55', sede: 'LURIN',
        nombre: 'Smart TV LED 55" 4K RAF', familia: 'Televisores',
        precioUnidad: 1650.00, precioCaja: 15700.00, precioMayorista: 1500.00,
        estado: 'Activo'
      },
      {
        id: 22, codigo: 'RAF-RF45', sede: 'LURIN',
        nombre: 'Refrigerador No Frost 12 pies RAF', familia: 'Refrigeradores',
        precioUnidad: 1350.00, precioCaja: 12800.00, precioMayorista: 1230.00,
        estado: 'Activo'
      },
      {
        id: 23, codigo: 'RAF-TV55', sede: 'SAN BORJA',
        nombre: 'Smart TV LED 55" 4K RAF', familia: 'Televisores',
        precioUnidad: 1625.00, precioCaja: 15500.00, precioMayorista: 1475.00,
        estado: 'Activo'
      },
      {
        id: 24, codigo: 'RAF-RF45', sede: 'SAN BORJA',
        nombre: 'Refrigerador No Frost 12 pies RAF', familia: 'Refrigeradores',
        precioUnidad: 1320.00, precioCaja: 12550.00, precioMayorista: 1200.00,
        estado: 'Activo'
      },
      {
        id: 25, codigo: 'RAF-LG32', sede: 'SAN BORJA',
        nombre: 'Lavarropas Automático 10kg RAF', familia: 'Lavarropas',
        precioUnidad: 920.00, precioCaja: 8700.00, precioMayorista: 840.00,
        estado: 'Activo'
      },
      {
        id: 26, codigo: 'RAF-AIR12', sede: 'SAN BORJA',
        nombre: 'Aire Acondicionado 12000 BTU RAF', familia: 'Climatización',
        precioUnidad: 1950.00, precioCaja: 18700.00, precioMayorista: 1800.00,
        estado: 'Activo'
      },
      {
        id: 27, codigo: 'RAF-MW900', sede: 'SAN BORJA',
        nombre: 'Microondas Inverter 900W RAF', familia: 'Microondas',
        precioUnidad: 315.00, precioCaja: 2950.00, precioMayorista: 285.00,
        estado: 'Activo'
      },
      {
        id: 28, codigo: 'RAF-COF800', sede: 'SAN BORJA',
        nombre: 'Cafetera Automática 800W RAF', familia: 'Cocina',
        precioUnidad: 395.00, precioCaja: 3750.00, precioMayorista: 360.00,
        estado: 'Activo'
      },
      {
        id: 29, codigo: 'RAF-HOR1800', sede: 'SAN BORJA',
        nombre: 'Horno Eléctrico 1800W RAF', familia: 'Cocina',
        precioUnidad: 520.00, precioCaja: 4900.00, precioMayorista: 480.00,
        estado: 'Activo'
      },
      {
        id: 30, codigo: 'RAF-TV65', sede: 'SAN BORJA',
        nombre: 'Smart TV LED 65" 4K RAF', familia: 'Televisores',
        precioUnidad: 2350.00, precioCaja: 22500.00, precioMayorista: 2150.00,
        estado: 'Activo'
      },
      {
        id: 31, codigo: 'RAF-REF20', sede: 'SAN BORJA',
        nombre: 'Refrigerador Side by Side 20 pies RAF', familia: 'Refrigeradores',
        precioUnidad: 2450.00, precioCaja: 23500.00, precioMayorista: 2250.00,
        estado: 'Activo'
      },
      {
        id: 32, codigo: 'RAF-SEC8K', sede: 'SAN BORJA',
        nombre: 'Secadora Eléctrica 8kg RAF', familia: 'Lavarropas',
        precioUnidad: 1150.00, precioCaja: 11000.00, precioMayorista: 1070.00,
        estado: 'Activo'
      },
      {
        id: 33, codigo: 'RAF-PROC1500', sede: 'SAN BORJA',
        nombre: 'Procesadora de Alimentos 1500W RAF', familia: 'Cocina',
        precioUnidad: 449.00, precioCaja: 4200.00, precioMayorista: 410.00,
        estado: 'Activo'
      },
      {
        id: 34, codigo: 'RAF-SAND900', sede: 'SAN BORJA',
        nombre: 'Sandwichera Antiadherente 900W RAF', familia: 'Cocina',
        precioUnidad: 119.00, precioCaja: 1100.00, precioMayorista: 105.00,
        estado: 'Activo'
      },
      {
        id: 35, codigo: 'RAF-CAL1000', sede: 'SAN BORJA',
        nombre: 'Calefactor Cerámico 1000W RAF', familia: 'Climatización',
        precioUnidad: 179.00, precioCaja: 1650.00, precioMayorista: 160.00,
        estado: 'Activo'
      }
    ];

    this.productosSubject.next(datosIniciales);
  }


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


  getTotalProductosPorSede(sede: string, estado: 'Activo' | 'Eliminado' = 'Activo'): number {
    return this.getProductos(sede, estado).length;
  }


  getTotalProductosActivosPorSede(sede: string): number {
    return this.getTotalProductosPorSede(sede, 'Activo');
  }


  getTotalProductosEliminadosPorSede(sede: string): number {
    return this.getTotalProductosPorSede(sede, 'Eliminado');
  }


  getResumenPorSedes(): {sede: string, activos: number, eliminados: number, total: number}[] {
    const sedes = this.getSedes();
    return sedes.map(sede => ({
      sede,
      activos: this.getTotalProductosActivosPorSede(sede),
      eliminados: this.getTotalProductosEliminadosPorSede(sede),
      total: this.getTotalProductosPorSede(sede)
    }));
  }


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


  getProductosPorCodigo(codigo: string, incluirEliminados: boolean = false): Producto[] {
    let productos = this.productosSubject.value.filter(p => p.codigo === codigo);
    if (!incluirEliminados) {
      productos = productos.filter(p => p.estado === 'Activo');
    }
    return productos;
  }


  getComparativaPorCodigo(codigo: string): ComparativaProducto | null {
    const variantes = this.getProductosPorCodigo(codigo);
    
    if (variantes.length === 0) return null;

    const preciosUnidad = variantes.map(v => v.precioUnidad);
    const preciosCaja = variantes.map(v => v.precioCaja);
    const preciosMayorista = variantes.map(v => v.precioMayorista);

    const precioPromedioUnidad = preciosUnidad.reduce((a, b) => a + b, 0) / preciosUnidad.length;
    const precioCajaPromedio = preciosCaja.reduce((a, b) => a + b, 0) / preciosCaja.length;
    const precioMayoristaPromedio = preciosMayorista.reduce((a, b) => a + b, 0) / preciosMayorista.length;

    const precioMinimoUnidad = Math.min(...preciosUnidad);
    const precioMaximoUnidad = Math.max(...preciosUnidad);

    const varianteMasBarata = variantes.find(v => v.precioUnidad === precioMinimoUnidad)!;
    const varianteMasCara = variantes.find(v => v.precioUnidad === precioMaximoUnidad)!;

    const variantesConDiferencia = variantes.map(v => ({
      id: v.id,
      sede: v.sede,
      precioUnidad: v.precioUnidad,
      precioCaja: v.precioCaja,
      precioMayorista: v.precioMayorista,
      estado: v.estado,
      diferenciaPrecioUnidad: v.precioUnidad - precioPromedioUnidad,
      diferenciaPrecioCaja: v.precioCaja - precioCajaPromedio,
      diferenciaPrecioMayorista: v.precioMayorista - precioMayoristaPromedio,
      porcentajeDiferencia: precioPromedioUnidad > 0 
        ? ((v.precioUnidad - precioPromedioUnidad) / precioPromedioUnidad) * 100 
        : 0
    }));

    return {
      codigo: variantes[0].codigo,
      nombre: variantes[0].nombre,
      familia: variantes[0].familia,
      variantes: variantesConDiferencia,
      precioPromedioUnidad,
      precioCajaPromedio,
      precioMayoristaPromedio,
      precioMinimoUnidad,
      precioMaximoUnidad,
      sedeMasBarata: varianteMasBarata.sede,
      sedeMasCara: varianteMasCara.sede
    };
  }


  getProductosConVariasSedes(): string[] {
    const codigosPorSedes = new Map<string, Set<string>>();
    
    this.productosSubject.value
      .filter(p => p.estado === 'Activo')
      .forEach(p => {
        if (!codigosPorSedes.has(p.codigo)) {
          codigosPorSedes.set(p.codigo, new Set());
        }
        codigosPorSedes.get(p.codigo)!.add(p.sede);
      });

    return Array.from(codigosPorSedes.entries())
      .filter(([_, sedes]) => sedes.size > 1)
      .map(([codigo, _]) => codigo);
  }


  getTotalProductosConVariasSedes(): number {
    return this.getProductosConVariasSedes().length;
  }


  getComparativaPorProducto(codigo: string): Producto[] {
    return this.getProductosPorCodigo(codigo);
  }


  getPrecioPromedioPorProducto(codigo: string): number {
    const productos = this.getComparativaPorProducto(codigo);
    return productos.length > 0 ? 
      productos.reduce((sum, p) => sum + p.precioUnidad, 0) / productos.length : 0;
  }


  getProductoById(id: number): Producto | null {
    return this.getProductoPorId(id);
  }


  crearProductoBoolean(productoData: Omit<Producto, 'id'>): boolean {
    try {
      this.crearProducto(productoData);
      return true;
    } catch (error) {
      console.error('Error al crear producto:', error);
      return false;
    }
  }


  actualizarProductoCompleto(id: number, producto: Producto): boolean {
    return this.actualizarProducto(id, producto);
  }
}
