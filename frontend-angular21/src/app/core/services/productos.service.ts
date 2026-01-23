import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Producto {
  id: number;
  codigo: string;
  anexo?: string;
  nombre: string;
  descripcion?: string;
  sede: string;
  familia: string;
  
  precioCompra: number;
  precioVenta: number;
  precioUnidad: number;
  precioCaja: number;
  precioMayorista: number;
  
  unidadMedida: string;
  stock?: number;
  
  estado: 'Activo' | 'Eliminado';
  fechaCreacion: Date;
  fechaActualizacion: Date;
}

export interface ComparativaProducto {
  codigo: string;
  nombre: string;
  familia: string;
  variantes: {
    id: number;
    sede: string;
    precioCompra: number;
    precioVenta: number;
    precioUnidad: number;
    precioCaja: number;
    precioMayorista: number;
    estado: 'Activo' | 'Eliminado';
    diferenciaPrecioCompra?: number;
    diferenciaPrecioVenta?: number;
    diferenciaPrecioUnidad?: number;
    diferenciaPrecioCaja?: number;
    diferenciaPrecioMayorista?: number;
    porcentajeDiferencia?: number;
  }[];
  precioPromedioCompra: number;
  precioPromedioVenta: number;
  precioPromedioUnidad: number;
  precioCajaPromedio: number;
  precioMayoristaPromedio: number;
  precioMinimoVenta: number;
  precioMaximoVenta: number;
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

  private inicializarDatos(): void {
    const datosIniciales: Producto[] = [
      {
        id: 1,
        codigo: 'RAF-TV55',
        anexo: 'TV-001',
        nombre: 'Smart TV LED 55" 4K RAF',
        descripcion: 'Televisor LED 55 pulgadas 4K UHD Smart TV con WiFi integrado',
        sede: 'LAS FLORES',
        familia: 'Televisores',
        precioCompra: 1200.00,
        precioVenta: 1599.00,
        precioUnidad: 1599.00,
        precioCaja: 15200.00,
        precioMayorista: 1450.00,
        unidadMedida: 'UND',
        stock: 15,
        estado: 'Activo',
        fechaCreacion: new Date('2024-01-15'),
        fechaActualizacion: new Date('2026-01-10')
      },
      {
        id: 2,
        codigo: 'RAF-LG32',
        anexo: 'LAV-001',
        nombre: 'Lavarropas Automático 10kg RAF',
        descripcion: 'Lavadora automática carga frontal 10kg con 15 programas',
        sede: 'LURIN',
        familia: 'Lavarropas',
        precioCompra: 650.00,
        precioVenta: 899.00,
        precioUnidad: 899.00,
        precioCaja: 8500.00,
        precioMayorista: 820.00,
        unidadMedida: 'UND',
        stock: 20,
        estado: 'Activo',
        fechaCreacion: new Date('2024-02-10'),
        fechaActualizacion: new Date('2026-01-10')
      },
      {
        id: 3,
        codigo: 'RAF-RF45',
        anexo: 'REF-001',
        nombre: 'Refrigerador No Frost 12 pies RAF',
        descripcion: 'Refrigeradora No Frost 12 pies cúbicos con dispensador',
        sede: 'LAS FLORES',
        familia: 'Refrigeradores',
        precioCompra: 950.00,
        precioVenta: 1299.00,
        precioUnidad: 1299.00,
        precioCaja: 12300.00,
        precioMayorista: 1180.00,
        unidadMedida: 'UND',
        stock: 12,
        estado: 'Activo',
        fechaCreacion: new Date('2024-01-20'),
        fechaActualizacion: new Date('2026-01-10')
      },
      {
        id: 4,
        codigo: 'RAF-MW900',
        anexo: 'MW-001',
        nombre: 'Microondas Inverter 900W RAF',
        descripcion: 'Horno microondas con tecnología inverter 900W',
        sede: 'LAS FLORES',
        familia: 'Microondas',
        precioCompra: 220.00,
        precioVenta: 299.00,
        precioUnidad: 299.00,
        precioCaja: 2800.00,
        precioMayorista: 275.00,
        unidadMedida: 'UND',
        stock: 30,
        estado: 'Activo',
        fechaCreacion: new Date('2024-03-05'),
        fechaActualizacion: new Date('2026-01-10')
      },
      {
        id: 5,
        codigo: 'RAF-ASP2000',
        anexo: 'ASP-001',
        nombre: 'Aspiradora Industrial 2000W RAF',
        descripcion: 'Aspiradora industrial potencia 2000W con filtro HEPA',
        sede: 'LURIN',
        familia: 'Electrodomésticos',
        precioCompra: 400.00,
        precioVenta: 549.00,
        precioUnidad: 549.00,
        precioCaja: 5200.00,
        precioMayorista: 500.00,
        unidadMedida: 'UND',
        stock: 18,
        estado: 'Activo',
        fechaCreacion: new Date('2024-02-25'),
        fechaActualizacion: new Date('2026-01-10')
      },
      {
        id: 6,
        codigo: 'RAF-COF800',
        anexo: 'COF-001',
        nombre: 'Cafetera Automática 800W RAF',
        descripcion: 'Cafetera automática programable 12 tazas',
        sede: 'LAS FLORES',
        familia: 'Cocina',
        precioCompra: 280.00,
        precioVenta: 379.00,
        precioUnidad: 379.00,
        precioCaja: 3600.00,
        precioMayorista: 345.00,
        unidadMedida: 'UND',
        stock: 25,
        estado: 'Activo',
        fechaCreacion: new Date('2024-03-12'),
        fechaActualizacion: new Date('2026-01-10')
      },
      {
        id: 7,
        codigo: 'RAF-LIC500',
        anexo: 'LIC-001',
        nombre: 'Licuadora Profesional 500W RAF',
        descripcion: 'Licuadora profesional 5 velocidades jarra de vidrio',
        sede: 'LAS FLORES',
        familia: 'Cocina',
        precioCompra: 135.00,
        precioVenta: 189.00,
        precioUnidad: 189.00,
        precioCaja: 1800.00,
        precioMayorista: 170.00,
        unidadMedida: 'UND',
        stock: 40,
        estado: 'Activo',
        fechaCreacion: new Date('2024-04-01'),
        fechaActualizacion: new Date('2026-01-10')
      },
      {
        id: 8,
        codigo: 'RAF-HOR1800',
        anexo: 'HOR-001',
        nombre: 'Horno Eléctrico 1800W RAF',
        descripcion: 'Horno eléctrico 45L con control de temperatura',
        sede: 'LAS FLORES',
        familia: 'Cocina',
        precioCompra: 370.00,
        precioVenta: 499.00,
        precioUnidad: 499.00,
        precioCaja: 4700.00,
        precioMayorista: 460.00,
        unidadMedida: 'UND',
        stock: 15,
        estado: 'Activo',
        fechaCreacion: new Date('2024-03-18'),
        fechaActualizacion: new Date('2026-01-10')
      },
      {
        id: 9,
        codigo: 'RAF-AIR12',
        anexo: 'AIR-001',
        nombre: 'Aire Acondicionado 12000 BTU RAF',
        descripcion: 'Aire acondicionado split 12000 BTU inverter',
        sede: 'LURIN',
        familia: 'Climatización',
        precioCompra: 1400.00,
        precioVenta: 1899.00,
        precioUnidad: 1899.00,
        precioCaja: 18200.00,
        precioMayorista: 1750.00,
        unidadMedida: 'UND',
        stock: 10,
        estado: 'Activo',
        fechaCreacion: new Date('2024-01-30'),
        fechaActualizacion: new Date('2026-01-10')
      },
      {
        id: 10,
        codigo: 'RAF-VENT16',
        anexo: 'VEN-001',
        nombre: 'Ventilador Industrial 16" RAF',
        descripcion: 'Ventilador de pie industrial 16 pulgadas 3 velocidades',
        sede: 'LAS FLORES',
        familia: 'Climatización',
        precioCompra: 190.00,
        precioVenta: 259.00,
        precioUnidad: 259.00,
        precioCaja: 2450.00,
        precioMayorista: 235.00,
        unidadMedida: 'UND',
        stock: 35,
        estado: 'Activo',
        fechaCreacion: new Date('2024-04-10'),
        fechaActualizacion: new Date('2026-01-10')
      },
      {
        id: 11,
        codigo: 'RAF-PLAN200',
        anexo: 'PLA-001',
        nombre: 'Plancha a Vapor 2000W RAF',
        descripcion: 'Plancha a vapor vertical y horizontal 2000W',
        sede: 'LAS FLORES',
        familia: 'Electrodomésticos',
        precioCompra: 95.00,
        precioVenta: 129.00,
        precioUnidad: 129.00,
        precioCaja: 1200.00,
        precioMayorista: 115.00,
        unidadMedida: 'UND',
        stock: 45,
        estado: 'Activo',
        fechaCreacion: new Date('2024-04-20'),
        fechaActualizacion: new Date('2026-01-10')
      },
      {
        id: 12,
        codigo: 'RAF-BAT100',
        anexo: 'BAT-001',
        nombre: 'Batidora Eléctrica 5 Velocidades RAF',
        descripcion: 'Batidora eléctrica de mano 5 velocidades con turbo',
        sede: 'LAS FLORES',
        familia: 'Cocina',
        precioCompra: 110.00,
        precioVenta: 149.00,
        precioUnidad: 149.00,
        precioCaja: 1400.00,
        precioMayorista: 135.00,
        unidadMedida: 'UND',
        stock: 50,
        estado: 'Activo',
        fechaCreacion: new Date('2024-04-15'),
        fechaActualizacion: new Date('2026-01-10')
      },
      {
        id: 13,
        codigo: 'RAF-TER150',
        anexo: 'TER-001',
        nombre: 'Termo Eléctrico 1.5L RAF',
        descripcion: 'Termo eléctrico 1.5 litros acero inoxidable',
        sede: 'LAS FLORES',
        familia: 'Cocina',
        precioCompra: 72.00,
        precioVenta: 99.00,
        precioUnidad: 99.00,
        precioCaja: 920.00,
        precioMayorista: 88.00,
        unidadMedida: 'UND',
        stock: 60,
        estado: 'Activo',
        fechaCreacion: new Date('2024-04-25'),
        fechaActualizacion: new Date('2026-01-10')
      },
      {
        id: 14,
        codigo: 'RAF-SAND900',
        anexo: 'SAN-001',
        nombre: 'Sandwichera Antiadherente 900W RAF',
        descripcion: 'Sandwichera antiadherente placas desmontables',
        sede: 'LAS FLORES',
        familia: 'Cocina',
        precioCompra: 88.00,
        precioVenta: 119.00,
        precioUnidad: 119.00,
        precioCaja: 1100.00,
        precioMayorista: 105.00,
        unidadMedida: 'UND',
        stock: 35,
        estado: 'Activo',
        fechaCreacion: new Date('2024-04-28'),
        fechaActualizacion: new Date('2026-01-10')
      },
      {
        id: 15,
        codigo: 'RAF-EXTR90',
        anexo: 'EXT-001',
        nombre: 'Extractor de Aire 90cm RAF',
        descripcion: 'Extractor de cocina 90cm acero inoxidable',
        sede: 'LURIN',
        familia: 'Climatización',
        precioCompra: 260.00,
        precioVenta: 349.00,
        precioUnidad: 349.00,
        precioCaja: 3300.00,
        precioMayorista: 320.00,
        unidadMedida: 'UND',
        stock: 22,
        estado: 'Activo',
        fechaCreacion: new Date('2024-03-22'),
        fechaActualizacion: new Date('2026-01-10')
      },
      {
        id: 16,
        codigo: 'RAF-TV55',
        anexo: 'TV-003',
        nombre: 'Smart TV LED 55" 4K RAF',
        descripcion: 'Televisor LED 55 pulgadas 4K UHD Smart TV con WiFi integrado',
        sede: 'LURIN',
        familia: 'Televisores',
        precioCompra: 1250.00,
        precioVenta: 1650.00,
        precioUnidad: 1650.00,
        precioCaja: 15700.00,
        precioMayorista: 1500.00,
        unidadMedida: 'UND',
        stock: 12,
        estado: 'Activo',
        fechaCreacion: new Date('2024-01-16'),
        fechaActualizacion: new Date('2026-01-10')
      },
      {
        id: 17,
        codigo: 'RAF-TV55',
        anexo: 'TV-004',
        nombre: 'Smart TV LED 55" 4K RAF',
        descripcion: 'Televisor LED 55 pulgadas 4K UHD Smart TV con WiFi integrado',
        sede: 'VES',
        familia: 'Televisores',
        precioCompra: 1230.00,
        precioVenta: 1625.00,
        precioUnidad: 1625.00,
        precioCaja: 15500.00,
        precioMayorista: 1475.00,
        unidadMedida: 'UND',
        stock: 18,
        estado: 'Activo',
        fechaCreacion: new Date('2024-01-17'),
        fechaActualizacion: new Date('2026-01-10')
      }
    ];

    this.productosSubject.next(datosIniciales);
  }

  getProductos(sede?: string, estado: 'Activo' | 'Eliminado' = 'Activo'): Producto[] {
    let productos = this.productosSubject.value.filter(p => p.estado === estado);
    if (sede) {
      productos = productos.filter(p => p.sede === sede);
    }
    return productos;
  }

  getProductoPorId(id: number): Producto | null {
    return this.productosSubject.value.find(p => p.id === id) || null;
  }

  getProductoById(id: number): Producto | null {
    return this.getProductoPorId(id);
  }

  getProductoPorCodigo(codigo: string): Producto | undefined {
    return this.productosSubject.value.find(p => p.codigo === codigo && p.estado === 'Activo');
  }

  getProductosPorCodigo(codigo: string, incluirEliminados: boolean = false): Producto[] {
    let productos = this.productosSubject.value.filter(p => p.codigo === codigo);
    if (!incluirEliminados) {
      productos = productos.filter(p => p.estado === 'Activo');
    }
    return productos;
  }

  buscarProductos(termino: string, sede?: string): Producto[] {
    const busqueda = termino.toLowerCase();
    let productos = this.productosSubject.value.filter(p => 
      p.estado === 'Activo' && (
        p.nombre.toLowerCase().includes(busqueda) ||
        p.codigo.toLowerCase().includes(busqueda)
      )
    );
    
    if (sede) {
      productos = productos.filter(p => p.sede === sede);
    }
    
    return productos;
  }

  getProductosEliminados(sede?: string): Producto[] {
    return this.getProductos(sede, 'Eliminado');
  }

  getSedes(): string[] {
    return [...new Set(this.productosSubject.value.map(p => p.sede))].sort();
  }

  getFamilias(sede?: string): string[] {
    const productos = sede ? this.getProductos(sede) : this.getProductos();
    return [...new Set(productos.map(p => p.familia))].sort();
  }

  getProductosPorFamilia(familia: string, sede?: string): Producto[] {
    let productos = this.productosSubject.value.filter(p => 
      p.familia === familia && p.estado === 'Activo'
    );
    
    if (sede) {
      productos = productos.filter(p => p.sede === sede);
    }
    
    return productos;
  }

  getUnidadesMedida(): string[] {
    return ['UND', 'KG', 'LT', 'MT', 'CJ', 'PQ'];
  }

  crearProducto(productoData: Omit<Producto, 'id'>): Producto {
    const productos = [...this.productosSubject.value];
    const nuevoId = Math.max(...productos.map(p => p.id), 0) + 1;
    
    const nuevoProducto: Producto = {
      ...productoData,
      id: nuevoId,
      fechaCreacion: new Date(),
      fechaActualizacion: new Date(),
      estado: 'Activo'
    };
    
    productos.push(nuevoProducto);
    this.productosSubject.next(productos);
    return nuevoProducto;
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

  actualizarProductoCompleto(id: number, producto: Producto): boolean {
    return this.actualizarProducto(id, producto);
  }

  eliminarProducto(id: number): boolean {
    return this.actualizarProducto(id, { estado: 'Eliminado' });
  }

  restaurarProducto(id: number): boolean {
    return this.actualizarProducto(id, { estado: 'Activo' });
  }

  actualizarStock(id: number, cantidad: number): boolean {
    const producto = this.productosSubject.value.find(p => p.id === id);
    if (producto && (producto.stock || 0) >= cantidad) {
      return this.actualizarProducto(id, { stock: (producto.stock || 0) - cantidad });
    }
    return false;
  }

  descontarStock(id: number, cantidad: number): boolean {
    const producto = this.productosSubject.value.find(p => p.id === id);
    if (!producto) return false;
    
    const stockActual = producto.stock || 0;
    if (stockActual < cantidad) return false;
    
    return this.actualizarProducto(id, { stock: stockActual - cantidad });
  }

  devolverStock(id: number, cantidad: number): boolean {
    const producto = this.productosSubject.value.find(p => p.id === id);
    if (!producto) return false;
    
    const stockActual = producto.stock || 0;
    return this.actualizarProducto(id, { stock: stockActual + cantidad });
  }

  incrementarStock(id: number, cantidad: number): boolean {
    return this.devolverStock(id, cantidad);
  }

  establecerStock(id: number, nuevoStock: number): boolean {
    if (nuevoStock < 0) return false;
    return this.actualizarProducto(id, { stock: nuevoStock });
  }

  getStockDisponible(id: number): number {
    const producto = this.productosSubject.value.find(p => p.id === id);
    return producto?.stock || 0;
  }

  verificarStockDisponible(id: number, cantidadRequerida: number): boolean {
    const stockActual = this.getStockDisponible(id);
    return stockActual >= cantidadRequerida;
  }

  getProductosBajoStock(limite: number = 10, sede?: string): Producto[] {
    let productos = this.getProductos(sede, 'Activo');
    return productos.filter(p => (p.stock || 0) <= limite);
  }

  getProductosSinStock(sede?: string): Producto[] {
    return this.getProductosBajoStock(0, sede);
  }

  actualizarStockMultiple(actualizaciones: { id: number; cantidad: number }[]): boolean {
    try {
      actualizaciones.forEach(({ id, cantidad }) => {
        if (!this.descontarStock(id, cantidad)) {
          throw new Error(`No se pudo descontar stock del producto ${id}`);
        }
      });
      return true;
    } catch (error) {
      console.error('Error al actualizar stock múltiple:', error);
      return false;
    }
  }

  devolverStockMultiple(devoluciones: { id: number; cantidad: number }[]): boolean {
    try {
      devoluciones.forEach(({ id, cantidad }) => {
        if (!this.devolverStock(id, cantidad)) {
          throw new Error(`No se pudo devolver stock del producto ${id}`);
        }
      });
      return true;
    } catch (error) {
      console.error('Error al devolver stock múltiple:', error);
      return false;
    }
  }

  existeCodigo(codigo: string, sede?: string): boolean {
    if (sede) {
      return this.productosSubject.value.some(p => p.codigo === codigo && p.sede === sede);
    }
    return this.productosSubject.value.some(p => p.codigo === codigo);
  }

  getTotalProductos(estado: 'Activo' | 'Eliminado' = 'Activo'): number {
    return this.getProductos(undefined, estado).length;
  }

  getTotalProductosActivos(): number {
    return this.getTotalProductos('Activo');
  }

  getTotalProductosEliminados(): number {
    return this.getTotalProductos('Eliminado');
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

  getComparativaPorCodigo(codigo: string): ComparativaProducto | null {
    const variantes = this.getProductosPorCodigo(codigo);
    
    if (variantes.length === 0) return null;

    const preciosCompra = variantes.map(v => v.precioCompra);
    const preciosVenta = variantes.map(v => v.precioVenta);
    const preciosUnidad = variantes.map(v => v.precioUnidad);
    const preciosCaja = variantes.map(v => v.precioCaja);
    const preciosMayorista = variantes.map(v => v.precioMayorista);

    const precioPromedioCompra = preciosCompra.reduce((a, b) => a + b, 0) / preciosCompra.length;
    const precioPromedioVenta = preciosVenta.reduce((a, b) => a + b, 0) / preciosVenta.length;
    const precioPromedioUnidad = preciosUnidad.reduce((a, b) => a + b, 0) / preciosUnidad.length;
    const precioCajaPromedio = preciosCaja.reduce((a, b) => a + b, 0) / preciosCaja.length;
    const precioMayoristaPromedio = preciosMayorista.reduce((a, b) => a + b, 0) / preciosMayorista.length;

    const precioMinimoVenta = Math.min(...preciosVenta);
    const precioMaximoVenta = Math.max(...preciosVenta);

    const varianteMasBarata = variantes.find(v => v.precioVenta === precioMinimoVenta)!;
    const varianteMasCara = variantes.find(v => v.precioVenta === precioMaximoVenta)!;

    const variantesConDiferencia = variantes.map(v => ({
      id: v.id,
      sede: v.sede,
      precioCompra: v.precioCompra,
      precioVenta: v.precioVenta,
      precioUnidad: v.precioUnidad,
      precioCaja: v.precioCaja,
      precioMayorista: v.precioMayorista,
      estado: v.estado,
      diferenciaPrecioCompra: v.precioCompra - precioPromedioCompra,
      diferenciaPrecioVenta: v.precioVenta - precioPromedioVenta,
      diferenciaPrecioUnidad: v.precioUnidad - precioPromedioUnidad,
      diferenciaPrecioCaja: v.precioCaja - precioCajaPromedio,
      diferenciaPrecioMayorista: v.precioMayorista - precioMayoristaPromedio,
      porcentajeDiferencia: precioPromedioVenta > 0 
        ? ((v.precioVenta - precioPromedioVenta) / precioPromedioVenta) * 100 
        : 0
    }));

    return {
      codigo: variantes[0].codigo,
      nombre: variantes[0].nombre,
      familia: variantes[0].familia,
      variantes: variantesConDiferencia,
      precioPromedioCompra,
      precioPromedioVenta,
      precioPromedioUnidad,
      precioCajaPromedio,
      precioMayoristaPromedio,
      precioMinimoVenta,
      precioMaximoVenta,
      sedeMasBarata: varianteMasBarata.sede,
      sedeMasCara: varianteMasCara.sede
    };
  }

  getComparativaPorProducto(codigo: string): Producto[] {
    return this.getProductosPorCodigo(codigo);
  }

  getPrecioPromedioPorProducto(codigo: string): number {
    const productos = this.getComparativaPorProducto(codigo);
    return productos.length > 0 ? 
      productos.reduce((sum, p) => sum + p.precioVenta, 0) / productos.length : 0;
  }

  getMargenGanancia(producto: Producto): number {
    return producto.precioVenta - producto.precioCompra;
  }

  getPorcentajeMargen(producto: Producto): number {
    return producto.precioCompra > 0 
      ? ((producto.precioVenta - producto.precioCompra) / producto.precioCompra) * 100 
      : 0;
  }
}
