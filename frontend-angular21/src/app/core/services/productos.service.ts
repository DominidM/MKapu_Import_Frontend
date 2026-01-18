import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

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

  private inicializarDatos() {
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
        estado: 'Activo',
        fechaCreacion: new Date('2024-04-10'),
        fechaActualizacion: new Date('2026-01-10')
      },
      {
        id: 11,
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
        estado: 'Activo',
        fechaCreacion: new Date('2024-04-15'),
        fechaActualizacion: new Date('2026-01-10')
      },
      {
        id: 12,
        codigo: 'RAF-SEC8K',
        anexo: 'SEC-001',
        nombre: 'Secadora Eléctrica 8kg RAF',
        descripcion: 'Secadora eléctrica a condensación 8kg',
        sede: 'LURIN',
        familia: 'Lavarropas',
        precioCompra: 820.00,
        precioVenta: 1099.00,
        precioUnidad: 1099.00,
        precioCaja: 10500.00,
        precioMayorista: 1020.00,
        unidadMedida: 'UND',
        estado: 'Activo',
        fechaCreacion: new Date('2024-02-18'),
        fechaActualizacion: new Date('2026-01-10')
      },
      {
        id: 13,
        codigo: 'RAF-REF20',
        anexo: 'REF-002',
        nombre: 'Refrigerador Side by Side 20 pies RAF',
        descripcion: 'Refrigerador Side by Side 20 pies con dispensador',
        sede: 'LAS FLORES',
        familia: 'Refrigeradores',
        precioCompra: 1800.00,
        precioVenta: 2399.00,
        precioUnidad: 2399.00,
        precioCaja: 23000.00,
        precioMayorista: 2200.00,
        unidadMedida: 'UND',
        estado: 'Activo',
        fechaCreacion: new Date('2024-01-25'),
        fechaActualizacion: new Date('2026-01-10')
      },
      {
        id: 14,
        codigo: 'RAF-MW1200',
        anexo: 'MW-002',
        nombre: 'Microondas Digital 1200W RAF',
        descripcion: 'Microondas digital 1200W con grill',
        sede: 'LAS FLORES',
        familia: 'Microondas',
        precioCompra: 290.00,
        precioVenta: 389.00,
        precioUnidad: 389.00,
        precioCaja: 3700.00,
        precioMayorista: 360.00,
        unidadMedida: 'UND',
        estado: 'Eliminado',
        fechaCreacion: new Date('2024-03-08'),
        fechaActualizacion: new Date('2026-01-08')
      },
      {
        id: 15,
        codigo: 'RAF-TV65',
        anexo: 'TV-002',
        nombre: 'Smart TV LED 65" 4K RAF',
        descripcion: 'Televisor LED 65 pulgadas 4K UHD Smart TV',
        sede: 'LURIN',
        familia: 'Televisores',
        precioCompra: 1700.00,
        precioVenta: 2299.00,
        precioUnidad: 2299.00,
        precioCaja: 22000.00,
        precioMayorista: 2100.00,
        unidadMedida: 'UND',
        estado: 'Activo',
        fechaCreacion: new Date('2024-01-18'),
        fechaActualizacion: new Date('2026-01-10')
      },
      {
        id: 16,
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
        estado: 'Activo',
        fechaCreacion: new Date('2024-04-20'),
        fechaActualizacion: new Date('2026-01-10')
      },
      {
        id: 17,
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
        estado: 'Activo',
        fechaCreacion: new Date('2024-04-25'),
        fechaActualizacion: new Date('2026-01-10')
      },
      {
        id: 18,
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
        estado: 'Activo',
        fechaCreacion: new Date('2024-03-22'),
        fechaActualizacion: new Date('2026-01-10')
      },
      {
        id: 19,
        codigo: 'RAF-LAV15',
        anexo: 'LAV-002',
        nombre: 'Lavavajillas 15 Servicios RAF',
        descripcion: 'Lavavajillas 15 servicios 6 programas',
        sede: 'LAS FLORES',
        familia: 'Cocina',
        precioCompra: 1200.00,
        precioVenta: 1599.00,
        precioUnidad: 1599.00,
        precioCaja: 15200.00,
        precioMayorista: 1480.00,
        unidadMedida: 'UND',
        estado: 'Activo',
        fechaCreacion: new Date('2024-02-28'),
        fechaActualizacion: new Date('2026-01-10')
      },
      {
        id: 20,
        codigo: 'RAF-CAMP4H',
        anexo: 'CAM-001',
        nombre: 'Campana Extractora 4 Hornillas RAF',
        descripcion: 'Campana extractora decorativa 4 hornillas',
        sede: 'LAS FLORES',
        familia: 'Cocina',
        precioCompra: 340.00,
        precioVenta: 459.00,
        precioUnidad: 459.00,
        precioCaja: 4300.00,
        precioMayorista: 415.00,
        unidadMedida: 'UND',
        estado: 'Activo',
        fechaCreacion: new Date('2024-03-15'),
        fechaActualizacion: new Date('2026-01-10')
      },
      {
        id: 21,
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
        estado: 'Activo',
        fechaCreacion: new Date('2024-01-16'),
        fechaActualizacion: new Date('2026-01-10')
      },
      {
        id: 22,
        codigo: 'RAF-RF45',
        anexo: 'REF-003',
        nombre: 'Refrigerador No Frost 12 pies RAF',
        descripcion: 'Refrigeradora No Frost 12 pies cúbicos con dispensador',
        sede: 'LURIN',
        familia: 'Refrigeradores',
        precioCompra: 1000.00,
        precioVenta: 1350.00,
        precioUnidad: 1350.00,
        precioCaja: 12800.00,
        precioMayorista: 1230.00,
        unidadMedida: 'UND',
        estado: 'Activo',
        fechaCreacion: new Date('2024-01-22'),
        fechaActualizacion: new Date('2026-01-10')
      },
      {
        id: 23,
        codigo: 'RAF-TV55',
        anexo: 'TV-004',
        nombre: 'Smart TV LED 55" 4K RAF',
        descripcion: 'Televisor LED 55 pulgadas 4K UHD Smart TV con WiFi integrado',
        sede: 'SAN BORJA',
        familia: 'Televisores',
        precioCompra: 1230.00,
        precioVenta: 1625.00,
        precioUnidad: 1625.00,
        precioCaja: 15500.00,
        precioMayorista: 1475.00,
        unidadMedida: 'UND',
        estado: 'Activo',
        fechaCreacion: new Date('2024-01-17'),
        fechaActualizacion: new Date('2026-01-10')
      },
      {
        id: 24,
        codigo: 'RAF-RF45',
        anexo: 'REF-004',
        nombre: 'Refrigerador No Frost 12 pies RAF',
        descripcion: 'Refrigeradora No Frost 12 pies cúbicos con dispensador',
        sede: 'SAN BORJA',
        familia: 'Refrigeradores',
        precioCompra: 980.00,
        precioVenta: 1320.00,
        precioUnidad: 1320.00,
        precioCaja: 12550.00,
        precioMayorista: 1200.00,
        unidadMedida: 'UND',
        estado: 'Activo',
        fechaCreacion: new Date('2024-01-23'),
        fechaActualizacion: new Date('2026-01-10')
      },
      {
        id: 25,
        codigo: 'RAF-LG32',
        anexo: 'LAV-003',
        nombre: 'Lavarropas Automático 10kg RAF',
        descripcion: 'Lavadora automática carga frontal 10kg con 15 programas',
        sede: 'SAN BORJA',
        familia: 'Lavarropas',
        precioCompra: 680.00,
        precioVenta: 920.00,
        precioUnidad: 920.00,
        precioCaja: 8700.00,
        precioMayorista: 840.00,
        unidadMedida: 'UND',
        estado: 'Activo',
        fechaCreacion: new Date('2024-02-12'),
        fechaActualizacion: new Date('2026-01-10')
      },
      {
        id: 26,
        codigo: 'RAF-AIR12',
        anexo: 'AIR-002',
        nombre: 'Aire Acondicionado 12000 BTU RAF',
        descripcion: 'Aire acondicionado split 12000 BTU inverter',
        sede: 'SAN BORJA',
        familia: 'Climatización',
        precioCompra: 1450.00,
        precioVenta: 1950.00,
        precioUnidad: 1950.00,
        precioCaja: 18700.00,
        precioMayorista: 1800.00,
        unidadMedida: 'UND',
        estado: 'Activo',
        fechaCreacion: new Date('2024-02-01'),
        fechaActualizacion: new Date('2026-01-10')
      },
      {
        id: 27,
        codigo: 'RAF-MW900',
        anexo: 'MW-003',
        nombre: 'Microondas Inverter 900W RAF',
        descripcion: 'Horno microondas con tecnología inverter 900W',
        sede: 'SAN BORJA',
        familia: 'Microondas',
        precioCompra: 235.00,
        precioVenta: 315.00,
        precioUnidad: 315.00,
        precioCaja: 2950.00,
        precioMayorista: 285.00,
        unidadMedida: 'UND',
        estado: 'Activo',
        fechaCreacion: new Date('2024-03-07'),
        fechaActualizacion: new Date('2026-01-10')
      },
      {
        id: 28,
        codigo: 'RAF-COF800',
        anexo: 'COF-002',
        nombre: 'Cafetera Automática 800W RAF',
        descripcion: 'Cafetera automática programable 12 tazas',
        sede: 'SAN BORJA',
        familia: 'Cocina',
        precioCompra: 295.00,
        precioVenta: 395.00,
        precioUnidad: 395.00,
        precioCaja: 3750.00,
        precioMayorista: 360.00,
        unidadMedida: 'UND',
        estado: 'Activo',
        fechaCreacion: new Date('2024-03-14'),
        fechaActualizacion: new Date('2026-01-10')
      },
      {
        id: 29,
        codigo: 'RAF-HOR1800',
        anexo: 'HOR-002',
        nombre: 'Horno Eléctrico 1800W RAF',
        descripcion: 'Horno eléctrico 45L con control de temperatura',
        sede: 'SAN BORJA',
        familia: 'Cocina',
        precioCompra: 390.00,
        precioVenta: 520.00,
        precioUnidad: 520.00,
        precioCaja: 4900.00,
        precioMayorista: 480.00,
        unidadMedida: 'UND',
        estado: 'Activo',
        fechaCreacion: new Date('2024-03-20'),
        fechaActualizacion: new Date('2026-01-10')
      },
      {
        id: 30,
        codigo: 'RAF-TV65',
        anexo: 'TV-005',
        nombre: 'Smart TV LED 65" 4K RAF',
        descripcion: 'Televisor LED 65 pulgadas 4K UHD Smart TV',
        sede: 'SAN BORJA',
        familia: 'Televisores',
        precioCompra: 1750.00,
        precioVenta: 2350.00,
        precioUnidad: 2350.00,
        precioCaja: 22500.00,
        precioMayorista: 2150.00,
        unidadMedida: 'UND',
        estado: 'Activo',
        fechaCreacion: new Date('2024-01-19'),
        fechaActualizacion: new Date('2026-01-10')
      },
      {
        id: 31,
        codigo: 'RAF-REF20',
        anexo: 'REF-005',
        nombre: 'Refrigerador Side by Side 20 pies RAF',
        descripcion: 'Refrigerador Side by Side 20 pies con dispensador',
        sede: 'SAN BORJA',
        familia: 'Refrigeradores',
        precioCompra: 1850.00,
        precioVenta: 2450.00,
        precioUnidad: 2450.00,
        precioCaja: 23500.00,
        precioMayorista: 2250.00,
        unidadMedida: 'UND',
        estado: 'Activo',
        fechaCreacion: new Date('2024-01-27'),
        fechaActualizacion: new Date('2026-01-10')
      },
      {
        id: 32,
        codigo: 'RAF-SEC8K',
        anexo: 'SEC-002',
        nombre: 'Secadora Eléctrica 8kg RAF',
        descripcion: 'Secadora eléctrica a condensación 8kg',
        sede: 'SAN BORJA',
        familia: 'Lavarropas',
        precioCompra: 860.00,
        precioVenta: 1150.00,
        precioUnidad: 1150.00,
        precioCaja: 11000.00,
        precioMayorista: 1070.00,
        unidadMedida: 'UND',
        estado: 'Activo',
        fechaCreacion: new Date('2024-02-20'),
        fechaActualizacion: new Date('2026-01-10')
      },
      {
        id: 33,
        codigo: 'RAF-PROC1500',
        anexo: 'PRO-001',
        nombre: 'Procesadora de Alimentos 1500W RAF',
        descripcion: 'Procesadora multifunción 1500W 12 accesorios',
        sede: 'SAN BORJA',
        familia: 'Cocina',
        precioCompra: 335.00,
        precioVenta: 449.00,
        precioUnidad: 449.00,
        precioCaja: 4200.00,
        precioMayorista: 410.00,
        unidadMedida: 'UND',
        estado: 'Activo',
        fechaCreacion: new Date('2024-04-05'),
        fechaActualizacion: new Date('2026-01-10')
      },
      {
        id: 34,
        codigo: 'RAF-SAND900',
        anexo: 'SAN-001',
        nombre: 'Sandwichera Antiadherente 900W RAF',
        descripcion: 'Sandwichera antiadherente placas desmontables',
        sede: 'SAN BORJA',
        familia: 'Cocina',
        precioCompra: 88.00,
        precioVenta: 119.00,
        precioUnidad: 119.00,
        precioCaja: 1100.00,
        precioMayorista: 105.00,
        unidadMedida: 'UND',
        estado: 'Activo',
        fechaCreacion: new Date('2024-04-28'),
        fechaActualizacion: new Date('2026-01-10')
      },
      {
        id: 35,
        codigo: 'RAF-CAL1000',
        anexo: 'CAL-001',
        nombre: 'Calefactor Cerámico 1000W RAF',
        descripcion: 'Calefactor cerámico con termostato ajustable',
        sede: 'SAN BORJA',
        familia: 'Climatización',
        precioCompra: 132.00,
        precioVenta: 179.00,
        precioUnidad: 179.00,
        precioCaja: 1650.00,
        precioMayorista: 160.00,
        unidadMedida: 'UND',
        estado: 'Activo',
        fechaCreacion: new Date('2024-04-22'),
        fechaActualizacion: new Date('2026-01-10')
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
      fechaActualizacion: new Date(),
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

  getUnidadesMedida(): string[] {
    return ['UND', 'KG', 'LT', 'MT', 'CJ', 'PQ'];
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
      productos.reduce((sum, p) => sum + p.precioVenta, 0) / productos.length : 0;
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

  getMargenGanancia(producto: Producto): number {
    return producto.precioVenta - producto.precioCompra;
  }

  getPorcentajeMargen(producto: Producto): number {
    return producto.precioCompra > 0 
      ? ((producto.precioVenta - producto.precioCompra) / producto.precioCompra) * 100 
      : 0;
  }
}
