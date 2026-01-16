// src/app/ventas/core/services/ventas.service.ts

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

// ✅ INTERFACES SEGÚN TABLA `detalle_comprobante`
export interface DetalleComprobante {
  id_det_com: number;
  id_comprobante: string;
  id_producto: string;
  cod_prod: string;
  descripcion: string;
  cantidad: number;
  valor_unit: number;  // Precio sin IGV
  pre_uni: number;     // Precio con IGV
  igv: number;
  tipo_afe_igv: string; // '10' = Gravado, '20' = Exonerado
}

// ✅ INTERFACE SEGÚN TABLA `comprobante_venta`
export interface ComprobanteVenta {
  id_comprobante: string;
  id_cliente: string;
  tipo_comprobante: '01' | '03'; // '01' = Factura, '03' = Boleta
  serie: string;
  numero: number;
  fec_emision: Date;
  fec_venc: Date | null;
  moneda: 'PEN' | 'USD';
  tipo_op: string;
  subtotal: number;
  igv: number;
  isc: number;
  total: number;
  estado: boolean;
  hash_cpe: string;
  xml_cpe: string;
  cdr_cpe: string;
  responsable: string;
  
  // Relaciones (no están en DB pero útiles para UI)
  detalles?: DetalleComprobante[];
  cliente_nombre?: string;
  cliente_doc?: string;
}

// ✅ INTERFACE PARA WIZARD DE VENTA
export interface VentaWizard {
  tipoComprobante: '01' | '03';
  cliente: any | null;
  productos: DetalleComprobante[];
  promociones?: any[];
  tipoVenta: 'ENVIO' | 'RECOJO' | 'DELIVERY' | 'PRESENCIAL';
  departamento?: string;
  tipoPago: 'EFECTIVO' | 'TARJETA' | 'YAPE' | 'PLIN' | 'TRANSFERENCIA';
  montoPago?: number;
  banco?: string;
  numeroOperacion?: string;
}

// ✅ FILTROS DE BÚSQUEDA
export interface FiltrosVenta {
  fechaDesde?: Date;
  fechaHasta?: Date;
  tipoComprobante?: '01' | '03';
  estado?: boolean;
  cliente?: string;
  responsable?: string;
}

@Injectable({
  providedIn: 'root'
})
export class VentasService {
  private comprobantesSubject = new BehaviorSubject<ComprobanteVenta[]>([]);
  public comprobantes$: Observable<ComprobanteVenta[]> = this.comprobantesSubject.asObservable();
  
  private comprobanteActualSubject = new BehaviorSubject<Partial<ComprobanteVenta> | null>(null);
  public comprobanteActual$: Observable<Partial<ComprobanteVenta> | null> = this.comprobanteActualSubject.asObservable();

  private ventaWizardSubject = new BehaviorSubject<Partial<VentaWizard> | null>(null);
  public ventaWizard$: Observable<Partial<VentaWizard> | null> = this.ventaWizardSubject.asObservable();

  constructor() {
    this.inicializarDatos();
  }

  private inicializarDatos(): void {
    const datosIniciales: ComprobanteVenta[] = [
      // BOLETA 1
      {
        id_comprobante: 'CPE-2026-0001',
        id_cliente: 'CLI-001',
        tipo_comprobante: '03',
        serie: 'B001',
        numero: 1,
        fec_emision: new Date('2026-01-10T10:30:00'),
        fec_venc: null,
        moneda: 'PEN',
        tipo_op: '0101',
        subtotal: 1354.24,
        igv: 243.76,
        isc: 0,
        total: 1598.00,
        estado: true,
        hash_cpe: 'HASH-CPE-2026-0001-1736516400000',
        xml_cpe: '<?xml version="1.0"?>...',
        cdr_cpe: 'CDR-ACEPTADO',
        responsable: 'ADMIN',
        cliente_nombre: 'Juan Pérez García',
        cliente_doc: '12345678',
        detalles: [
          {
            id_det_com: 1,
            id_comprobante: 'CPE-2026-0001',
            id_producto: '1',
            cod_prod: 'RAF-TV55',
            descripcion: 'Smart TV LED 55" 4K RAF',
            cantidad: 1,
            valor_unit: 1354.24,
            pre_uni: 1599.00,
            igv: 243.76,
            tipo_afe_igv: '10'
          }
        ]
      },
      // FACTURA 1
      {
        id_comprobante: 'CPE-2026-0002',
        id_cliente: 'CLI-002',
        tipo_comprobante: '01',
        serie: 'F001',
        numero: 1,
        fec_emision: new Date('2026-01-10T14:20:00'),
        fec_venc: new Date('2026-02-10T14:20:00'),
        moneda: 'PEN',
        tipo_op: '0101',
        subtotal: 2033.90,
        igv: 366.10,
        isc: 0,
        total: 2400.00,
        estado: true,
        hash_cpe: 'HASH-CPE-2026-0002-1736530200000',
        xml_cpe: '<?xml version="1.0"?>...',
        cdr_cpe: 'CDR-ACEPTADO',
        responsable: 'CAJERO01',
        cliente_nombre: 'Empresa Ejemplo SAC',
        cliente_doc: '20123456789',
        detalles: [
          {
            id_det_com: 2,
            id_comprobante: 'CPE-2026-0002',
            id_producto: '3',
            cod_prod: 'RAF-RF45',
            descripcion: 'Refrigerador No Frost 12 pies RAF',
            cantidad: 2,
            valor_unit: 1016.95,
            pre_uni: 1200.00,
            igv: 183.05,
            tipo_afe_igv: '10'
          }
        ]
      },
      // BOLETA 2
      {
        id_comprobante: 'CPE-2026-0003',
        id_cliente: 'CLI-003',
        tipo_comprobante: '03',
        serie: 'B001',
        numero: 2,
        fec_emision: new Date('2026-01-11T09:15:00'),
        fec_venc: null,
        moneda: 'PEN',
        tipo_op: '0101',
        subtotal: 761.86,
        igv: 137.14,
        isc: 0,
        total: 899.00,
        estado: true,
        hash_cpe: 'HASH-CPE-2026-0003-1736594100000',
        xml_cpe: '<?xml version="1.0"?>...',
        cdr_cpe: 'CDR-ACEPTADO',
        responsable: 'ADMIN',
        cliente_nombre: 'María López Sánchez',
        cliente_doc: '87654321',
        detalles: [
          {
            id_det_com: 3,
            id_comprobante: 'CPE-2026-0003',
            id_producto: '2',
            cod_prod: 'RAF-LG32',
            descripcion: 'Lavarropas Automático 10kg RAF',
            cantidad: 1,
            valor_unit: 761.86,
            pre_uni: 899.00,
            igv: 137.14,
            tipo_afe_igv: '10'
          }
        ]
      },
      // BOLETA 3 - Venta múltiple
      {
        id_comprobante: 'CPE-2026-0004',
        id_cliente: 'CLI-005',
        tipo_comprobante: '03',
        serie: 'B001',
        numero: 3,
        fec_emision: new Date('2026-01-11T11:45:00'),
        fec_venc: null,
        moneda: 'PEN',
        tipo_op: '0101',
        subtotal: 906.78,
        igv: 163.22,
        isc: 0,
        total: 1070.00,
        estado: true,
        hash_cpe: 'HASH-CPE-2026-0004-1736603100000',
        xml_cpe: '<?xml version="1.0"?>...',
        cdr_cpe: 'CDR-ACEPTADO',
        responsable: 'CAJERO01',
        cliente_nombre: 'Carlos Ramírez Torres',
        cliente_doc: '45678912',
        detalles: [
          {
            id_det_com: 4,
            id_comprobante: 'CPE-2026-0004',
            id_producto: '4',
            cod_prod: 'RAF-MW900',
            descripcion: 'Microondas Inverter 900W RAF',
            cantidad: 2,
            valor_unit: 253.39,
            pre_uni: 299.00,
            igv: 45.61,
            tipo_afe_igv: '10'
          },
          {
            id_det_com: 5,
            id_comprobante: 'CPE-2026-0004',
            id_producto: '8',
            cod_prod: 'RAF-HOR1800',
            descripcion: 'Horno Eléctrico 1800W RAF',
            cantidad: 1,
            valor_unit: 422.88,
            pre_uni: 499.00,
            igv: 76.12,
            tipo_afe_igv: '10'
          }
        ]
      },
      // FACTURA 2
      {
        id_comprobante: 'CPE-2026-0005',
        id_cliente: 'CLI-004',
        tipo_comprobante: '01',
        serie: 'F001',
        numero: 2,
        fec_emision: new Date('2026-01-12T10:00:00'),
        fec_venc: new Date('2026-02-12T10:00:00'),
        moneda: 'PEN',
        tipo_op: '0101',
        subtotal: 3220.34,
        igv: 579.66,
        isc: 0,
        total: 3800.00,
        estado: true,
        hash_cpe: 'HASH-CPE-2026-0005-1736686800000',
        xml_cpe: '<?xml version="1.0"?>...',
        cdr_cpe: 'CDR-ACEPTADO',
        responsable: 'ADMIN',
        cliente_nombre: 'Distribuidora Norte EIRL',
        cliente_doc: '20987654321',
        detalles: [
          {
            id_det_com: 6,
            id_comprobante: 'CPE-2026-0005',
            id_producto: '9',
            cod_prod: 'RAF-AIR12',
            descripcion: 'Aire Acondicionado 12000 BTU RAF',
            cantidad: 2,
            valor_unit: 1610.17,
            pre_uni: 1900.00,
            igv: 289.83,
            tipo_afe_igv: '10'
          }
        ]
      },
      // BOLETA 4
      {
        id_comprobante: 'CPE-2026-0006',
        id_cliente: 'CLI-001',
        tipo_comprobante: '03',
        serie: 'B001',
        numero: 4,
        fec_emision: new Date('2026-01-13T15:30:00'),
        fec_venc: null,
        moneda: 'PEN',
        tipo_op: '0101',
        subtotal: 380.51,
        igv: 68.49,
        isc: 0,
        total: 449.00,
        estado: true,
        hash_cpe: 'HASH-CPE-2026-0006-1736791800000',
        xml_cpe: '<?xml version="1.0"?>...',
        cdr_cpe: 'CDR-ACEPTADO',
        responsable: 'CAJERO01',
        cliente_nombre: 'Juan Pérez García',
        cliente_doc: '12345678',
        detalles: [
          {
            id_det_com: 7,
            id_comprobante: 'CPE-2026-0006',
            id_producto: '33',
            cod_prod: 'RAF-PROC1500',
            descripcion: 'Procesadora de Alimentos 1500W RAF',
            cantidad: 1,
            valor_unit: 380.51,
            pre_uni: 449.00,
            igv: 68.49,
            tipo_afe_igv: '10'
          }
        ]
      },
      // BOLETA 5 - Compra pequeña
      {
        id_comprobante: 'CPE-2026-0007',
        id_cliente: 'CLI-003',
        tipo_comprobante: '03',
        serie: 'B001',
        numero: 5,
        fec_emision: new Date('2026-01-13T16:20:00'),
        fec_venc: null,
        moneda: 'PEN',
        tipo_op: '0101',
        subtotal: 287.29,
        igv: 51.71,
        isc: 0,
        total: 339.00,
        estado: true,
        hash_cpe: 'HASH-CPE-2026-0007-1736794800000',
        xml_cpe: '<?xml version="1.0"?>...',
        cdr_cpe: 'CDR-ACEPTADO',
        responsable: 'ADMIN',
        cliente_nombre: 'María López Sánchez',
        cliente_doc: '87654321',
        detalles: [
          {
            id_det_com: 8,
            id_comprobante: 'CPE-2026-0007',
            id_producto: '7',
            cod_prod: 'RAF-LIC500',
            descripcion: 'Licuadora Profesional 500W RAF',
            cantidad: 1,
            valor_unit: 160.17,
            pre_uni: 189.00,
            igv: 28.83,
            tipo_afe_igv: '10'
          },
          {
            id_det_com: 9,
            id_comprobante: 'CPE-2026-0007',
            id_producto: '16',
            cod_prod: 'RAF-PLAN200',
            descripcion: 'Plancha a Vapor 2000W RAF',
            cantidad: 1,
            valor_unit: 109.32,
            pre_uni: 129.00,
            igv: 19.68,
            tipo_afe_igv: '10'
          },
          {
            id_det_com: 10,
            id_comprobante: 'CPE-2026-0007',
            id_producto: '11',
            cod_prod: 'RAF-BAT100',
            descripcion: 'Batidora Eléctrica 5 Velocidades RAF',
            cantidad: 1,
            valor_unit: 126.27,
            pre_uni: 149.00,
            igv: 22.73,
            tipo_afe_igv: '10'
          }
        ]
      },
      // FACTURA 3 - Mayorista
      {
        id_comprobante: 'CPE-2026-0008',
        id_cliente: 'CLI-002',
        tipo_comprobante: '01',
        serie: 'F001',
        numero: 3,
        fec_emision: new Date('2026-01-14T09:00:00'),
        fec_venc: new Date('2026-02-14T09:00:00'),
        moneda: 'PEN',
        tipo_op: '0101',
        subtotal: 5932.20,
        igv: 1067.80,
        isc: 0,
        total: 7000.00,
        estado: true,
        hash_cpe: 'HASH-CPE-2026-0008-1736853600000',
        xml_cpe: '<?xml version="1.0"?>...',
        cdr_cpe: 'CDR-ACEPTADO',
        responsable: 'ADMIN',
        cliente_nombre: 'Empresa Ejemplo SAC',
        cliente_doc: '20123456789',
        detalles: [
          {
            id_det_com: 11,
            id_comprobante: 'CPE-2026-0008',
            id_producto: '13',
            cod_prod: 'RAF-REF20',
            descripcion: 'Refrigerador Side by Side 20 pies RAF',
            cantidad: 2,
            valor_unit: 2033.05,
            pre_uni: 2399.00,
            igv: 365.95,
            tipo_afe_igv: '10'
          },
          {
            id_det_com: 12,
            id_comprobante: 'CPE-2026-0008',
            id_producto: '15',
            cod_prod: 'RAF-TV65',
            descripcion: 'Smart TV LED 65" 4K RAF',
            cantidad: 1,
            valor_unit: 1948.31,
            pre_uni: 2299.00,
            igv: 350.69,
            tipo_afe_igv: '10'
          },
          {
            id_det_com: 13,
            id_comprobante: 'CPE-2026-0008',
            id_producto: '12',
            cod_prod: 'RAF-SEC8K',
            descripcion: 'Secadora Eléctrica 8kg RAF',
            cantidad: 1,
            valor_unit: 931.36,
            pre_uni: 1099.00,
            igv: 167.64,
            tipo_afe_igv: '10'
          }
        ]
      },
      // BOLETA 6
      {
        id_comprobante: 'CPE-2026-0009',
        id_cliente: 'CLI-005',
        tipo_comprobante: '03',
        serie: 'B001',
        numero: 6,
        fec_emision: new Date('2026-01-14T11:30:00'),
        fec_venc: null,
        moneda: 'PEN',
        tipo_op: '0101',
        subtotal: 219.49,
        igv: 39.51,
        isc: 0,
        total: 259.00,
        estado: true,
        hash_cpe: 'HASH-CPE-2026-0009-1736862600000',
        xml_cpe: '<?xml version="1.0"?>...',
        cdr_cpe: 'CDR-ACEPTADO',
        responsable: 'CAJERO01',
        cliente_nombre: 'Carlos Ramírez Torres',
        cliente_doc: '45678912',
        detalles: [
          {
            id_det_com: 14,
            id_comprobante: 'CPE-2026-0009',
            id_producto: '10',
            cod_prod: 'RAF-VENT16',
            descripcion: 'Ventilador Industrial 16" RAF',
            cantidad: 1,
            valor_unit: 219.49,
            pre_uni: 259.00,
            igv: 39.51,
            tipo_afe_igv: '10'
          }
        ]
      },
      // BOLETA 7
      {
        id_comprobante: 'CPE-2026-0010',
        id_cliente: 'CLI-001',
        tipo_comprobante: '03',
        serie: 'B001',
        numero: 7,
        fec_emision: new Date('2026-01-15T10:15:00'),
        fec_venc: null,
        moneda: 'PEN',
        tipo_op: '0101',
        subtotal: 465.25,
        igv: 83.75,
        isc: 0,
        total: 549.00,
        estado: true,
        hash_cpe: 'HASH-CPE-2026-0010-1736944500000',
        xml_cpe: '<?xml version="1.0"?>...',
        cdr_cpe: 'CDR-ACEPTADO',
        responsable: 'ADMIN',
        cliente_nombre: 'Juan Pérez García',
        cliente_doc: '12345678',
        detalles: [
          {
            id_det_com: 15,
            id_comprobante: 'CPE-2026-0010',
            id_producto: '5',
            cod_prod: 'RAF-ASP2000',
            descripcion: 'Aspiradora Industrial 2000W RAF',
            cantidad: 1,
            valor_unit: 465.25,
            pre_uni: 549.00,
            igv: 83.75,
            tipo_afe_igv: '10'
          }
        ]
      },
      // FACTURA 4
      {
        id_comprobante: 'CPE-2026-0011',
        id_cliente: 'CLI-004',
        tipo_comprobante: '01',
        serie: 'F001',
        numero: 4,
        fec_emision: new Date('2026-01-15T14:00:00'),
        fec_venc: new Date('2026-02-15T14:00:00'),
        moneda: 'PEN',
        tipo_op: '0101',
        subtotal: 2542.37,
        igv: 457.63,
        isc: 0,
        total: 3000.00,
        estado: true,
        hash_cpe: 'HASH-CPE-2026-0011-1736958000000',
        xml_cpe: '<?xml version="1.0"?>...',
        cdr_cpe: 'CDR-ACEPTADO',
        responsable: 'CAJERO01',
        cliente_nombre: 'Distribuidora Norte EIRL',
        cliente_doc: '20987654321',
        detalles: [
          {
            id_det_com: 16,
            id_comprobante: 'CPE-2026-0011',
            id_producto: '19',
            cod_prod: 'RAF-LAV15',
            descripcion: 'Lavavajillas 15 Servicios RAF',
            cantidad: 1,
            valor_unit: 1355.08,
            pre_uni: 1599.00,
            igv: 243.92,
            tipo_afe_igv: '10'
          },
          {
            id_det_com: 17,
            id_comprobante: 'CPE-2026-0011',
            id_producto: '6',
            cod_prod: 'RAF-COF800',
            descripcion: 'Cafetera Automática 800W RAF',
            cantidad: 2,
            valor_unit: 321.19,
            pre_uni: 379.00,
            igv: 57.81,
            tipo_afe_igv: '10'
          },
          {
            id_det_com: 18,
            id_comprobante: 'CPE-2026-0011',
            id_producto: '20',
            cod_prod: 'RAF-CAMP4H',
            descripcion: 'Campana Extractora 4 Hornillas RAF',
            cantidad: 1,
            valor_unit: 389.83,
            pre_uni: 459.00,
            igv: 69.17,
            tipo_afe_igv: '10'
          }
        ]
      },
      // BOLETA 8 - ANULADA
      {
        id_comprobante: 'CPE-2026-0012',
        id_cliente: 'CLI-003',
        tipo_comprobante: '03',
        serie: 'B001',
        numero: 8,
        fec_emision: new Date('2026-01-15T16:30:00'),
        fec_venc: null,
        moneda: 'PEN',
        tipo_op: '0101',
        subtotal: 253.39,
        igv: 45.61,
        isc: 0,
        total: 299.00,
        estado: false, // ANULADA
        hash_cpe: 'HASH-CPE-2026-0012-1736967000000',
        xml_cpe: '<?xml version="1.0"?>...',
        cdr_cpe: 'CDR-RECHAZADO',
        responsable: 'ADMIN',
        cliente_nombre: 'María López Sánchez',
        cliente_doc: '87654321',
        detalles: [
          {
            id_det_com: 19,
            id_comprobante: 'CPE-2026-0012',
            id_producto: '4',
            cod_prod: 'RAF-MW900',
            descripcion: 'Microondas Inverter 900W RAF',
            cantidad: 1,
            valor_unit: 253.39,
            pre_uni: 299.00,
            igv: 45.61,
            tipo_afe_igv: '10'
          }
        ]
      },
      // BOLETA 9 - HOY
      {
        id_comprobante: 'CPE-2026-0013',
        id_cliente: 'CLI-005',
        tipo_comprobante: '03',
        serie: 'B001',
        numero: 9,
        fec_emision: new Date('2026-01-16T09:00:00'),
        fec_venc: null,
        moneda: 'PEN',
        tipo_op: '0101',
        subtotal: 593.22,
        igv: 106.78,
        isc: 0,
        total: 700.00,
        estado: true,
        hash_cpe: 'HASH-CPE-2026-0013-1737026400000',
        xml_cpe: '<?xml version="1.0"?>...',
        cdr_cpe: 'CDR-ACEPTADO',
        responsable: 'ADMIN',
        cliente_nombre: 'Carlos Ramírez Torres',
        cliente_doc: '45678912',
        detalles: [
          {
            id_det_com: 20,
            id_comprobante: 'CPE-2026-0013',
            id_producto: '17',
            cod_prod: 'RAF-TER150',
            descripcion: 'Termo Eléctrico 1.5L RAF',
            cantidad: 3,
            valor_unit: 83.90,
            pre_uni: 99.00,
            igv: 15.10,
            tipo_afe_igv: '10'
          },
          {
            id_det_com: 21,
            id_comprobante: 'CPE-2026-0013',
            id_producto: '18',
            cod_prod: 'RAF-EXTR90',
            descripcion: 'Extractor de Aire 90cm RAF',
            cantidad: 1,
            valor_unit: 295.76,
            pre_uni: 349.00,
            igv: 53.24,
            tipo_afe_igv: '10'
          },
          {
            id_det_com: 22,
            id_comprobante: 'CPE-2026-0013',
            id_producto: '34',
            cod_prod: 'RAF-SAND900',
            descripcion: 'Sandwichera Antiadherente 900W RAF',
            cantidad: 2,
            valor_unit: 100.85,
            pre_uni: 119.00,
            igv: 18.15,
            tipo_afe_igv: '10'
          }
        ]
      },
      // FACTURA 5 - HOY
      {
        id_comprobante: 'CPE-2026-0014',
        id_cliente: 'CLI-002',
        tipo_comprobante: '01',
        serie: 'F001',
        numero: 5,
        fec_emision: new Date('2026-01-16T11:30:00'),
        fec_venc: new Date('2026-02-16T11:30:00'),
        moneda: 'PEN',
        tipo_op: '0101',
        subtotal: 4237.29,
        igv: 762.71,
        isc: 0,
        total: 5000.00,
        estado: true,
        hash_cpe: 'HASH-CPE-2026-0014-1737035400000',
        xml_cpe: '<?xml version="1.0"?>...',
        cdr_cpe: 'CDR-ACEPTADO',
        responsable: 'CAJERO01',
        cliente_nombre: 'Empresa Ejemplo SAC',
        cliente_doc: '20123456789',
        detalles: [
          {
            id_det_com: 23,
            id_comprobante: 'CPE-2026-0014',
            id_producto: '1',
            cod_prod: 'RAF-TV55',
            descripcion: 'Smart TV LED 55" 4K RAF',
            cantidad: 2,
            valor_unit: 1354.24,
            pre_uni: 1599.00,
            igv: 243.76,
            tipo_afe_igv: '10'
          },
          {
            id_det_com: 24,
            id_comprobante: 'CPE-2026-0014',
            id_producto: '2',
            cod_prod: 'RAF-LG32',
            descripcion: 'Lavarropas Automático 10kg RAF',
            cantidad: 2,
            valor_unit: 761.86,
            pre_uni: 899.00,
            igv: 137.14,
            tipo_afe_igv: '10'
          }
        ]
      },
      // BOLETA 10 - HOY
      {
        id_comprobante: 'CPE-2026-0015',
        id_cliente: 'CLI-001',
        tipo_comprobante: '03',
        serie: 'B001',
        numero: 10,
        fec_emision: new Date('2026-01-16T14:00:00'),
        fec_venc: null,
        moneda: 'PEN',
        tipo_op: '0101',
        subtotal: 151.69,
        igv: 27.31,
        isc: 0,
        total: 179.00,
        estado: true,
        hash_cpe: 'HASH-CPE-2026-0015-1737044400000',
        xml_cpe: '<?xml version="1.0"?>...',
        cdr_cpe: 'CDR-ACEPTADO',
        responsable: 'ADMIN',
        cliente_nombre: 'Juan Pérez García',
        cliente_doc: '12345678',
        detalles: [
          {
            id_det_com: 25,
            id_comprobante: 'CPE-2026-0015',
            id_producto: '35',
            cod_prod: 'RAF-CAL1000',
            descripcion: 'Calefactor Cerámico 1000W RAF',
            cantidad: 1,
            valor_unit: 151.69,
            pre_uni: 179.00,
            igv: 27.31,
            tipo_afe_igv: '10'
          }
        ]
      }
    ];

    this.comprobantesSubject.next(datosIniciales);
  }

  // ====================================
  // CRUD DE COMPROBANTES
  // ====================================

  // ✅ OBTENER TODOS LOS COMPROBANTES
  getComprobantes(): ComprobanteVenta[] {
    return this.comprobantesSubject.value;
  }

  // ✅ OBTENER COMPROBANTE POR ID
  getComprobantePorId(id: string): ComprobanteVenta | undefined {
    return this.comprobantesSubject.value.find(c => c.id_comprobante === id);
  }

  // ✅ CREAR NUEVO COMPROBANTE
  crearComprobante(comprobante: Omit<ComprobanteVenta, 'id_comprobante' | 'hash_cpe' | 'xml_cpe' | 'cdr_cpe' | 'numero'>): ComprobanteVenta {
    const comprobantes = this.comprobantesSubject.value;
    
    // Obtener último número de la serie
    const ultimoNumero = this.getUltimoNumero(comprobante.serie);
    const nuevoNumero = ultimoNumero + 1;
    
    const idComprobante = `CPE-${new Date().getFullYear()}-${String(comprobantes.length + 1).padStart(4, '0')}`;
    
    const nuevoComprobante: ComprobanteVenta = {
      ...comprobante,
      id_comprobante: idComprobante,
      numero: nuevoNumero,
      hash_cpe: this.generarHash(idComprobante, comprobante.serie, nuevoNumero),
      xml_cpe: '<?xml version="1.0"?>...',
      cdr_cpe: 'CDR-ACEPTADO'
    };

    this.comprobantesSubject.next([...comprobantes, nuevoComprobante]);
    console.log(`✅ Comprobante creado: ${nuevoComprobante.serie}-${nuevoComprobante.numero}`);
    
    return nuevoComprobante;
  }

  // ✅ ACTUALIZAR COMPROBANTE
  actualizarComprobante(id: string, cambios: Partial<ComprobanteVenta>): boolean {
    const comprobantes = [...this.comprobantesSubject.value];
    const index = comprobantes.findIndex(c => c.id_comprobante === id);
    
    if (index !== -1) {
      comprobantes[index] = { ...comprobantes[index], ...cambios };
      this.comprobantesSubject.next(comprobantes);
      return true;
    }
    return false;
  }

  // ✅ ANULAR COMPROBANTE
  anularComprobante(id: string): boolean {
    const comprobante = this.getComprobantePorId(id);
    
    if (comprobante && comprobante.estado) {
      this.actualizarComprobante(id, { estado: false });
      console.log(`❌ Comprobante anulado: ${comprobante.serie}-${comprobante.numero}`);
      return true;
    }
    return false;
  }

  // ====================================
  // FILTROS Y BÚSQUEDAS
  // ====================================

  // ✅ FILTRAR POR TIPO DE COMPROBANTE
  getComprobantesPorTipo(tipo: '01' | '03'): ComprobanteVenta[] {
    return this.comprobantesSubject.value.filter(c => c.tipo_comprobante === tipo);
  }

  // ✅ FILTRAR POR FECHA
  getComprobantesPorFecha(fechaDesde: Date, fechaHasta: Date): ComprobanteVenta[] {
    return this.comprobantesSubject.value.filter(c => 
      c.fec_emision >= fechaDesde && c.fec_emision <= fechaHasta
    );
  }

  // ✅ FILTRAR POR ESTADO
  getComprobantesPorEstado(estado: boolean): ComprobanteVenta[] {
    return this.comprobantesSubject.value.filter(c => c.estado === estado);
  }

  // ✅ FILTRAR POR CLIENTE
  getComprobantesPorCliente(idCliente: string): ComprobanteVenta[] {
    return this.comprobantesSubject.value.filter(c => c.id_cliente === idCliente);
  }

  // ✅ FILTRAR POR RESPONSABLE
  getComprobantesPorResponsable(responsable: string): ComprobanteVenta[] {
    return this.comprobantesSubject.value.filter(c => c.responsable === responsable);
  }

  // ✅ BUSCAR POR SERIE-NÚMERO
  buscarPorSerieNumero(serie: string, numero: number): ComprobanteVenta | undefined {
    return this.comprobantesSubject.value.find(c => 
      c.serie === serie && c.numero === numero
    );
  }

  // ✅ FILTROS AVANZADOS
  filtrarComprobantes(filtros: FiltrosVenta): ComprobanteVenta[] {
    let comprobantes = this.comprobantesSubject.value;

    if (filtros.fechaDesde && filtros.fechaHasta) {
      comprobantes = comprobantes.filter(c => 
        c.fec_emision >= filtros.fechaDesde! && c.fec_emision <= filtros.fechaHasta!
      );
    }

    if (filtros.tipoComprobante) {
      comprobantes = comprobantes.filter(c => c.tipo_comprobante === filtros.tipoComprobante);
    }

    if (filtros.estado !== undefined) {
      comprobantes = comprobantes.filter(c => c.estado === filtros.estado);
    }

    if (filtros.cliente) {
      comprobantes = comprobantes.filter(c => c.id_cliente === filtros.cliente);
    }

    if (filtros.responsable) {
      comprobantes = comprobantes.filter(c => c.responsable === filtros.responsable);
    }

    return comprobantes;
  }

  // ====================================
  // CÁLCULOS Y ESTADÍSTICAS
  // ====================================

  // ✅ CALCULAR TOTAL DE VENTAS
  getTotalVentas(filtros?: FiltrosVenta): number {
    const comprobantes = filtros ? this.filtrarComprobantes(filtros) : this.getComprobantesPorEstado(true);
    return comprobantes.reduce((total, c) => total + c.total, 0);
  }

  // ✅ CALCULAR SUBTOTAL DE VENTAS
  getSubtotalVentas(filtros?: FiltrosVenta): number {
    const comprobantes = filtros ? this.filtrarComprobantes(filtros) : this.getComprobantesPorEstado(true);
    return comprobantes.reduce((total, c) => total + c.subtotal, 0);
  }

  // ✅ CALCULAR IGV DE VENTAS
  getIGVVentas(filtros?: FiltrosVenta): number {
    const comprobantes = filtros ? this.filtrarComprobantes(filtros) : this.getComprobantesPorEstado(true);
    return comprobantes.reduce((total, c) => total + c.igv, 0);
  }

  // ✅ CONTAR COMPROBANTES
  getCountComprobantes(filtros?: FiltrosVenta): number {
    return filtros ? this.filtrarComprobantes(filtros).length : this.comprobantesSubject.value.length;
  }

  // ✅ OBTENER VENTAS HOY
  getVentasHoy(): ComprobanteVenta[] {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const mañana = new Date(hoy);
    mañana.setDate(mañana.getDate() + 1);
    
    return this.getComprobantesPorFecha(hoy, mañana);
  }

  // ✅ OBTENER TOTAL VENTAS HOY
  getTotalVentasHoy(): number {
    return this.getVentasHoy().reduce((total, c) => c.estado ? total + c.total : total, 0);
  }

  // ✅ OBTENER VENTAS DEL MES
  getVentasMes(mes: number, año: number): ComprobanteVenta[] {
    return this.comprobantesSubject.value.filter(c => {
      const fecha = new Date(c.fec_emision);
      return fecha.getMonth() === mes && fecha.getFullYear() === año;
    });
  }

  // ✅ OBTENER RESUMEN POR TIPO
  getResumenPorTipo(): { [tipo: string]: { cantidad: number; total: number } } {
    const facturas = this.getComprobantesPorTipo('01').filter(c => c.estado);
    const boletas = this.getComprobantesPorTipo('03').filter(c => c.estado);

    return {
      'FACTURAS': {
        cantidad: facturas.length,
        total: facturas.reduce((sum, c) => sum + c.total, 0)
      },
      'BOLETAS': {
        cantidad: boletas.length,
        total: boletas.reduce((sum, c) => sum + c.total, 0)
      }
    };
  }

  // ====================================
  // UTILIDADES Y HELPERS
  // ====================================

  // ✅ GENERAR SERIE SEGÚN TIPO
  generarSerie(tipo: '01' | '03', numero: number = 1): string {
    return tipo === '01' ? `F${String(numero).padStart(3, '0')}` : `B${String(numero).padStart(3, '0')}`;
  }

  // ✅ OBTENER ÚLTIMO NÚMERO DE COMPROBANTE
  getUltimoNumero(serie: string): number {
    const comprobantes = this.comprobantesSubject.value.filter(c => c.serie === serie);
    return comprobantes.length > 0 ? Math.max(...comprobantes.map(c => c.numero)) : 0;
  }

  // ✅ GENERAR HASH SIMPLE
  private generarHash(id: string, serie: string, numero: number): string {
    const timestamp = Date.now();
    return `HASH-${id}-${timestamp}`;
  }

  // ✅ CALCULAR IGV (18%)
  calcularIGV(subtotal: number): number {
    return Number((subtotal * 0.18).toFixed(2));
  }

  // ✅ CALCULAR SUBTOTAL SIN IGV
  calcularSubtotal(total: number): number {
    return Number((total / 1.18).toFixed(2));
  }

  // ====================================
  // GESTIÓN DE WIZARD
  // ====================================

  // ✅ GUARDAR COMPROBANTE ACTUAL (para wizard)
  setComprobanteActual(comprobante: Partial<ComprobanteVenta>): void {
    this.comprobanteActualSubject.next(comprobante);
  }

  // ✅ OBTENER COMPROBANTE ACTUAL
  getComprobanteActual(): Partial<ComprobanteVenta> | null {
    return this.comprobanteActualSubject.value;
  }

  // ✅ LIMPIAR COMPROBANTE ACTUAL
  limpiarComprobanteActual(): void {
    this.comprobanteActualSubject.next(null);
  }

  // ✅ GUARDAR ESTADO WIZARD
  setVentaWizard(wizard: Partial<VentaWizard>): void {
    this.ventaWizardSubject.next(wizard);
  }

  // ✅ OBTENER ESTADO WIZARD
  getVentaWizard(): Partial<VentaWizard> | null {
    return this.ventaWizardSubject.value;
  }

  // ✅ LIMPIAR WIZARD
  limpiarVentaWizard(): void {
    this.ventaWizardSubject.next(null);
  }

  // ====================================
  // VALIDACIONES
  // ====================================

  // ✅ VALIDAR COMPROBANTE
  validarComprobante(comprobante: Partial<ComprobanteVenta>): { valido: boolean; errores: string[] } {
    const errores: string[] = [];

    if (!comprobante.id_cliente) errores.push('Cliente requerido');
    if (!comprobante.tipo_comprobante) errores.push('Tipo de comprobante requerido');
    if (!comprobante.detalles || comprobante.detalles.length === 0) errores.push('Debe agregar productos');
    if (!comprobante.total || comprobante.total <= 0) errores.push('Total inválido');

    return { valido: errores.length === 0, errores };
  }

  // ✅ PUEDE ANULAR (validar si puede anularse)
  puedeAnular(id: string): boolean {
    const comprobante = this.getComprobantePorId(id);
    if (!comprobante) return false;
    
    // Solo se puede anular si está activo y es del día
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaEmision = new Date(comprobante.fec_emision);
    fechaEmision.setHours(0, 0, 0, 0);
    
    return comprobante.estado && fechaEmision.getTime() === hoy.getTime();
  }
}
