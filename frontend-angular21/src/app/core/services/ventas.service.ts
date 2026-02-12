import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface DetalleComprobante {
  id_det_com: number;
  id_comprobante: string;
  id_producto: string;
  cod_prod: string;
  descripcion: string;
  cantidad: number;
  valor_unit: number;
  pre_uni: number;
  igv: number;
  tipo_afe_igv: string;
}

export interface ComprobanteVenta {
  id: number;
  id_comprobante: string;
  id_cliente: string;
  tipo_comprobante: '01' | '03';
  serie: string;
  numero: number;
  fec_emision: Date;
  fec_venc: Date | null;
  moneda: 'PEN' | 'USD';
  tipo_pago: string;
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
  id_sede: string;
  id_empleado?: string;
  detalles: DetalleComprobante[];
  cliente_nombre?: string;
  cliente_doc?: string;
  codigo_promocion?: string;
  descuento_promocion?: number;
  descripcion_promocion?: string;
  id_promocion?: string;
}

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

export interface FiltrosVenta {
  fechaDesde?: Date;
  fechaHasta?: Date;
  tipoComprobante?: '01' | '03';
  estado?: boolean;
  cliente?: string;
  responsable?: string;
  empleado?: string;
}

@Injectable({
  providedIn: 'root',
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
      {
        id: 1,
        id_comprobante: 'CPE-2026-0001',
        id_cliente: 'CLI-001',
        tipo_comprobante: '03',
        serie: 'B001',
        numero: 1,
        fec_emision: new Date('2026-01-10T10:30:00'),
        fec_venc: null,
        moneda: 'PEN',
        tipo_pago: 'EFECTIVO',
        tipo_op: '0101',
        subtotal: 1354.24,
        igv: 243.76,
        isc: 0,
        total: 1598.0,
        estado: true,
        hash_cpe: 'HASH-CPE-2026-0001-1736516400000',
        xml_cpe: '<?xml version="1.0"?>',
        cdr_cpe: 'CDR-ACEPTADO',
        responsable: 'Juan Carlos Pérez García',
        id_sede: 'SEDE001',
        id_empleado: 'EMP-001',
        cliente_nombre: 'Juan Pérez García',
        cliente_doc: '12345678',
        detalles: [
          {
            id_det_com: 1,
            id_comprobante: 'CPE-2026-0001',
            id_producto: 'PROD-001',
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
      {
        id: 2,
        id_comprobante: 'CPE-2026-0002',
        id_cliente: 'CLI-002',
        tipo_comprobante: '01',
        serie: 'F001',
        numero: 1,
        fec_emision: new Date('2026-01-10T14:20:00'),
        fec_venc: new Date('2026-02-10T14:20:00'),
        moneda: 'PEN',
        tipo_pago: 'TARJETA',
        tipo_op: '0101',
        subtotal: 2033.90,
        igv: 366.10,
        isc: 0,
        total: 2400.0,
        estado: true,
        hash_cpe: 'HASH-CPE-2026-0002-1736530200000',
        xml_cpe: '<?xml version="1.0"?>',
        cdr_cpe: 'CDR-ACEPTADO',
        responsable: 'María Elena Rodríguez López',
        id_sede: 'SEDE002',
        id_empleado: 'EMP-006',
        cliente_nombre: 'Empresa Ejemplo SAC',
        cliente_doc: '20123456789',
        detalles: [
          {
            id_det_com: 2,
            id_comprobante: 'CPE-2026-0002',
            id_producto: 'PROD-003',
            cod_prod: 'RAF-RF45',
            descripcion: 'Refrigerador No Frost 12 pies RAF',
            cantidad: 2,
            valor_unit: 1016.95,
            pre_uni: 1200.00,
            igv: 366.10,
            tipo_afe_igv: '10'
          }
        ]
      },
      {
        id: 3,
        id_comprobante: 'CPE-2026-0003',
        id_cliente: 'CLI-003',
        tipo_comprobante: '03',
        serie: 'B001',
        numero: 2,
        fec_emision: new Date('2026-01-11T09:15:00'),
        fec_venc: null,
        moneda: 'PEN',
        tipo_pago: 'YAPE',
        tipo_op: '0101',
        subtotal: 761.86,
        igv: 137.14,
        isc: 0,
        total: 899.0,
        estado: true,
        hash_cpe: 'HASH-CPE-2026-0003-1736594100000',
        xml_cpe: '<?xml version="1.0"?>',
        cdr_cpe: 'CDR-ACEPTADO',
        responsable: 'Diana Carolina Quispe Mamani',
        id_sede: 'SEDE003',
        id_empleado: 'EMP-008',
        cliente_nombre: 'María López Sánchez',
        cliente_doc: '87654321',
        detalles: [
          {
            id_det_com: 3,
            id_comprobante: 'CPE-2026-0003',
            id_producto: 'PROD-002',
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
      {
        id: 4,
        id_comprobante: 'CPE-2026-0004',
        id_cliente: 'CLI-004',
        tipo_comprobante: '01',
        serie: 'F001',
        numero: 2,
        fec_emision: new Date('2026-01-11T16:45:00'),
        fec_venc: new Date('2026-02-11T16:45:00'),
        moneda: 'PEN',
        tipo_pago: 'PLIN',
        tipo_op: '0101',
        subtotal: 1525.42,
        igv: 274.58,
        isc: 0,
        total: 1800.0,
        estado: true,
        hash_cpe: 'HASH-CPE-2026-0004-1736621100000',
        xml_cpe: '<?xml version="1.0"?>',
        cdr_cpe: 'CDR-ACEPTADO',
        responsable: 'Luis Fernando Gutiérrez Ramos',
        id_sede: 'SEDE001',
        id_empleado: 'EMP-005',
        cliente_nombre: 'Inversiones Del Sur SAC',
        cliente_doc: '20987654321',
        detalles: [
          {
            id_det_com: 4,
            id_comprobante: 'CPE-2026-0004',
            id_producto: 'PROD-009',
            cod_prod: 'RAF-AIR12',
            descripcion: 'Aire Acondicionado 12000 BTU RAF',
            cantidad: 1,
            valor_unit: 1525.42,
            pre_uni: 1800.00,
            igv: 274.58,
            tipo_afe_igv: '10'
          }
        ]
      },
      {
        id: 5,
        id_comprobante: 'CPE-2026-0005',
        id_cliente: 'CLI-005',
        tipo_comprobante: '03',
        serie: 'B001',
        numero: 3,
        fec_emision: new Date('2026-01-12T11:00:00'),
        fec_venc: null,
        moneda: 'PEN',
        tipo_pago: 'EFECTIVO',
        tipo_op: '0101',
        subtotal: 423.73,
        igv: 76.27,
        isc: 0,
        total: 500.0,
        estado: true,
        hash_cpe: 'HASH-CPE-2026-0005-1736684400000',
        xml_cpe: '<?xml version="1.0"?>',
        cdr_cpe: 'CDR-ACEPTADO',
        responsable: 'Ana Patricia Morales Vega',
        id_sede: 'SEDE002',
        id_empleado: 'EMP-004',
        cliente_nombre: 'Carlos Ramírez Torres',
        cliente_doc: '23456789',
        detalles: [
          {
            id_det_com: 5,
            id_comprobante: 'CPE-2026-0005',
            id_producto: 'PROD-008',
            cod_prod: 'RAF-HOR1800',
            descripcion: 'Horno Eléctrico 1800W RAF',
            cantidad: 1,
            valor_unit: 423.73,
            pre_uni: 500.00,
            igv: 76.27,
            tipo_afe_igv: '10'
          }
        ]
      },
      {
        id: 6,
        id_comprobante: 'CPE-2026-0006',
        id_cliente: 'CLI-006',
        tipo_comprobante: '03',
        serie: 'B002',
        numero: 1,
        fec_emision: new Date('2026-01-12T13:30:00'),
        fec_venc: null,
        moneda: 'PEN',
        tipo_pago: 'TARJETA',
        tipo_op: '0101',
        subtotal: 1016.95,
        igv: 183.05,
        isc: 0,
        total: 1200.0,
        estado: false,
        hash_cpe: 'HASH-CPE-2026-0006-1736693400000',
        xml_cpe: '<?xml version="1.0"?>',
        cdr_cpe: 'CDR-ANULADO',
        responsable: 'Roberto Carlos Vega Mendoza',
        id_sede: 'SEDE003',
        id_empleado: 'EMP-011',
        cliente_nombre: 'Ana Flores Medina',
        cliente_doc: '34567890',
        detalles: [
          {
            id_det_com: 6,
            id_comprobante: 'CPE-2026-0006',
            id_producto: 'PROD-003',
            cod_prod: 'RAF-RF45',
            descripcion: 'Refrigerador No Frost 12 pies RAF',
            cantidad: 1,
            valor_unit: 1016.95,
            pre_uni: 1200.00,
            igv: 183.05,
            tipo_afe_igv: '10'
          }
        ]
      },
      {
        id: 7,
        id_comprobante: 'CPE-2026-0007',
        id_cliente: 'CLI-007',
        tipo_comprobante: '01',
        serie: 'F001',
        numero: 3,
        fec_emision: new Date('2026-01-13T08:20:00'),
        fec_venc: new Date('2026-02-13T08:20:00'),
        moneda: 'PEN',
        tipo_pago: 'YAPE',
        tipo_op: '0101',
        subtotal: 2711.86,
        igv: 488.14,
        isc: 0,
        total: 3200.0,
        estado: true,
        hash_cpe: 'HASH-CPE-2026-0007-1736761200000',
        xml_cpe: '<?xml version="1.0"?>',
        cdr_cpe: 'CDR-ACEPTADO',
        responsable: 'Juan Carlos Pérez García',
        id_sede: 'SEDE001',
        id_empleado: 'EMP-001',
        cliente_nombre: 'Constructora Lima SAC',
        cliente_doc: '20456789123',
        detalles: [
          {
            id_det_com: 7,
            id_comprobante: 'CPE-2026-0007',
            id_producto: 'PROD-001',
            cod_prod: 'RAF-TV55',
            descripcion: 'Smart TV LED 55" 4K RAF',
            cantidad: 2,
            valor_unit: 1355.93,
            pre_uni: 1600.00,
            igv: 488.14,
            tipo_afe_igv: '10'
          }
        ]
      },
      {
        id: 8,
        id_comprobante: 'CPE-2026-0008',
        id_cliente: 'CLI-008',
        tipo_comprobante: '03',
        serie: 'B001',
        numero: 4,
        fec_emision: new Date('2026-01-13T15:10:00'),
        fec_venc: null,
        moneda: 'PEN',
        tipo_pago: 'EFECTIVO',
        tipo_op: '0101',
        subtotal: 635.59,
        igv: 114.41,
        isc: 0,
        total: 750.0,
        estado: true,
        hash_cpe: 'HASH-CPE-2026-0008-1736786400000',
        xml_cpe: '<?xml version="1.0"?>',
        cdr_cpe: 'CDR-ACEPTADO',
        responsable: 'Rosa María Flores Pérez',
        id_sede: 'SEDE002',
        id_empleado: 'EMP-006',
        cliente_nombre: 'Pedro Castro Vega',
        cliente_doc: '45678901',
        detalles: [
          {
            id_det_com: 8,
            id_comprobante: 'CPE-2026-0008',
            id_producto: 'PROD-004',
            cod_prod: 'RAF-MW900',
            descripcion: 'Microondas Inverter 900W RAF',
            cantidad: 2,
            valor_unit: 253.39,
            pre_uni: 299.00,
            igv: 91.22,
            tipo_afe_igv: '10'
          },
          {
            id_det_com: 9,
            id_comprobante: 'CPE-2026-0008',
            id_producto: 'PROD-007',
            cod_prod: 'RAF-LIC500',
            descripcion: 'Licuadora Profesional 500W RAF',
            cantidad: 1,
            valor_unit: 128.81,
            pre_uni: 152.00,
            igv: 23.19,
            tipo_afe_igv: '10'
          }
        ]
      },
      {
        id: 9,
        id_comprobante: 'CPE-2026-0009',
        id_cliente: 'CLI-009',
        tipo_comprobante: '03',
        serie: 'B001',
        numero: 5,
        fec_emision: new Date('2026-01-14T10:30:00'),
        fec_venc: null,
        moneda: 'PEN',
        tipo_pago: 'PLIN',
        tipo_op: '0101',
        subtotal: 932.20,
        igv: 167.80,
        isc: 0,
        total: 1100.0,
        estado: true,
        hash_cpe: 'HASH-CPE-2026-0009-1736851800000',
        xml_cpe: '<?xml version="1.0"?>',
        cdr_cpe: 'CDR-ACEPTADO',
        responsable: 'Sofía Alejandra Torres Lima',
        id_sede: 'SEDE003',
        id_empleado: 'EMP-012',
        cliente_nombre: 'Luis Gonzales Ruiz',
        cliente_doc: '56789012',
        detalles: [
          {
            id_det_com: 10,
            id_comprobante: 'CPE-2026-0009',
            id_producto: 'PROD-005',
            cod_prod: 'RAF-WM15',
            descripcion: 'Lavadora Automática 15kg RAF',
            cantidad: 1,
            valor_unit: 932.20,
            pre_uni: 1100.00,
            igv: 167.80,
            tipo_afe_igv: '10'
          }
        ]
      },
      {
        id: 10,
        id_comprobante: 'CPE-2026-0010',
        id_cliente: 'CLI-010',
        tipo_comprobante: '01',
        serie: 'F001',
        numero: 4,
        fec_emision: new Date('2026-01-14T14:45:00'),
        fec_venc: new Date('2026-02-14T14:45:00'),
        moneda: 'PEN',
        tipo_pago: 'TARJETA',
        tipo_op: '0101',
        subtotal: 3050.85,
        igv: 549.15,
        isc: 0,
        total: 3600.0,
        estado: true,
        hash_cpe: 'HASH-CPE-2026-0010-1736867100000',
        xml_cpe: '<?xml version="1.0"?>',
        cdr_cpe: 'CDR-ACEPTADO',
        responsable: 'María Elena Rodríguez López',
        id_sede: 'SEDE001',
        id_empleado: 'EMP-002',
        cliente_nombre: 'Comercial Norte SAC',
        cliente_doc: '20567890123',
        detalles: [
          {
            id_det_com: 11,
            id_comprobante: 'CPE-2026-0010',
            id_producto: 'PROD-009',
            cod_prod: 'RAF-AIR12',
            descripcion: 'Aire Acondicionado 12000 BTU RAF',
            cantidad: 2,
            valor_unit: 1525.42,
            pre_uni: 1800.00,
            igv: 549.15,
            tipo_afe_igv: '10'
          }
        ]
      },
      {
        id: 11,
        id_comprobante: 'CPE-2026-0011',
        id_cliente: 'CLI-011',
        tipo_comprobante: '03',
        serie: 'B001',
        numero: 6,
        fec_emision: new Date('2026-01-15T09:00:00'),
        fec_venc: null,
        moneda: 'PEN',
        tipo_pago: 'EFECTIVO',
        tipo_op: '0101',
        subtotal: 550.85,
        igv: 99.15,
        isc: 0,
        total: 650.0,
        estado: true,
        hash_cpe: 'HASH-CPE-2026-0011-1736933400000',
        xml_cpe: '<?xml version="1.0"?>',
        cdr_cpe: 'CDR-ACEPTADO',
        responsable: 'Carmen Julia Ríos Castillo',
        id_sede: 'SEDE002',
        id_empleado: 'EMP-008',
        cliente_nombre: 'Rosa Martínez Luna',
        cliente_doc: '67890123',
        detalles: [
          {
            id_det_com: 12,
            id_comprobante: 'CPE-2026-0011',
            id_producto: 'PROD-006',
            cod_prod: 'RAF-VC1500',
            descripcion: 'Aspiradora Ciclónica 1500W RAF',
            cantidad: 1,
            valor_unit: 550.85,
            pre_uni: 650.00,
            igv: 99.15,
            tipo_afe_igv: '10'
          }
        ]
      },
      {
        id: 12,
        id_comprobante: 'CPE-2026-0012',
        id_cliente: 'CLI-012',
        tipo_comprobante: '03',
        serie: 'B002',
        numero: 2,
        fec_emision: new Date('2026-01-15T16:20:00'),
        fec_venc: null,
        moneda: 'PEN',
        tipo_pago: 'YAPE',
        tipo_op: '0101',
        subtotal: 1694.92,
        igv: 305.08,
        isc: 0,
        total: 2000.0,
        estado: true,
        hash_cpe: 'HASH-CPE-2026-0012-1736959200000',
        xml_cpe: '<?xml version="1.0"?>',
        cdr_cpe: 'CDR-ACEPTADO',
        responsable: 'Diana Carolina Quispe Mamani',
        id_sede: 'SEDE003',
        id_empleado: 'EMP-008',
        cliente_nombre: 'Miguel Díaz Campos',
        cliente_doc: '78901234',
        detalles: [
          {
            id_det_com: 13,
            id_comprobante: 'CPE-2026-0012',
            id_producto: 'PROD-001',
            cod_prod: 'RAF-TV55',
            descripcion: 'Smart TV LED 55" 4K RAF',
            cantidad: 1,
            valor_unit: 1354.24,
            pre_uni: 1599.00,
            igv: 243.76,
            tipo_afe_igv: '10'
          },
          {
            id_det_com: 14,
            id_comprobante: 'CPE-2026-0012',
            id_producto: 'PROD-008',
            cod_prod: 'RAF-HOR1800',
            descripcion: 'Horno Eléctrico 1800W RAF',
            cantidad: 1,
            valor_unit: 340.68,
            pre_uni: 401.00,
            igv: 61.32,
            tipo_afe_igv: '10'
          }
        ]
      }
    ];

    this.comprobantesSubject.next(datosIniciales);
  }

  getComprobantes(): ComprobanteVenta[] {
    return this.comprobantesSubject.value;
  }

  getComprobantePorIdNumerico(id: number): ComprobanteVenta | undefined {
    return this.comprobantesSubject.value.find((c) => c.id === id);
  }

  getComprobantePorId(id: string): ComprobanteVenta | undefined {
    return this.comprobantesSubject.value.find((c) => c.id_comprobante === id);
  }

  crearComprobante(comprobante: Omit<ComprobanteVenta, 'id' | 'id_comprobante' | 'hash_cpe' | 'xml_cpe' | 'cdr_cpe' | 'numero'>): ComprobanteVenta {
    const comprobantes = this.comprobantesSubject.value;
    const ultimoNumero = this.getUltimoNumero(comprobante.serie);
    const nuevoNumero = ultimoNumero + 1;
    const nuevoId = comprobantes.length > 0 ? Math.max(...comprobantes.map(c => c.id)) + 1 : 1;
    const idComprobante = `CPE-${new Date().getFullYear()}-${String(nuevoId).padStart(4, '0')}`;

    const nuevoComprobante: ComprobanteVenta = {
      ...comprobante,
      id: nuevoId,
      id_comprobante: idComprobante,
      numero: nuevoNumero,
      hash_cpe: this.generarHash(idComprobante, comprobante.serie, nuevoNumero),
      xml_cpe: '<?xml version="1.0"?>',
      cdr_cpe: 'CDR-ACEPTADO',
    };

    this.comprobantesSubject.next([...comprobantes, nuevoComprobante]);
    return nuevoComprobante;
  }

  actualizarComprobante(id: string, cambios: Partial<ComprobanteVenta>): boolean {
    const comprobantes = [...this.comprobantesSubject.value];
    const index = comprobantes.findIndex((c) => c.id_comprobante === id);

    if (index !== -1) {
      comprobantes[index] = { ...comprobantes[index], ...cambios };
      this.comprobantesSubject.next(comprobantes);
      return true;
    }
    return false;
  }

  anularComprobante(id: string): boolean {
    const comprobante = this.getComprobantePorId(id);
    if (comprobante && comprobante.estado) {
      this.actualizarComprobante(id, { estado: false, cdr_cpe: 'CDR-ANULADO' });
      return true;
    }
    return false;
  }

  getComprobantesPorTipo(tipo: '01' | '03'): ComprobanteVenta[] {
    return this.comprobantesSubject.value.filter((c) => c.tipo_comprobante === tipo);
  }

  getComprobantesPorFecha(fechaDesde: Date, fechaHasta: Date): ComprobanteVenta[] {
    return this.comprobantesSubject.value.filter((c) => c.fec_emision >= fechaDesde && c.fec_emision <= fechaHasta);
  }

  getComprobantesPorEstado(estado: boolean): ComprobanteVenta[] {
    return this.comprobantesSubject.value.filter((c) => c.estado === estado);
  }

  getComprobantesPorCliente(idCliente: string): ComprobanteVenta[] {
    return this.comprobantesSubject.value.filter((c) => c.id_cliente === idCliente);
  }

  getComprobantesPorResponsable(responsable: string): ComprobanteVenta[] {
    return this.comprobantesSubject.value.filter((c) => c.responsable === responsable);
  }

  getComprobantesPorEmpleado(idEmpleado: string): ComprobanteVenta[] {
    return this.comprobantesSubject.value.filter((c) => c.id_empleado === idEmpleado);
  }

  getComprobantesPorSede(idSede: string): ComprobanteVenta[] {
    return this.comprobantesSubject.value.filter((c) => c.id_sede === idSede);
  }

  buscarPorSerieNumero(serie: string, numero: number): ComprobanteVenta | undefined {
    return this.comprobantesSubject.value.find((c) => c.serie === serie && c.numero === numero);
  }

  filtrarComprobantes(filtros: FiltrosVenta): ComprobanteVenta[] {
    let comprobantes = this.comprobantesSubject.value;

    if (filtros.fechaDesde && filtros.fechaHasta) {
      comprobantes = comprobantes.filter((c) => c.fec_emision >= filtros.fechaDesde! && c.fec_emision <= filtros.fechaHasta!);
    }

    if (filtros.tipoComprobante) {
      comprobantes = comprobantes.filter((c) => c.tipo_comprobante === filtros.tipoComprobante);
    }

    if (filtros.estado !== undefined) {
      comprobantes = comprobantes.filter((c) => c.estado === filtros.estado);
    }

    if (filtros.cliente) {
      comprobantes = comprobantes.filter((c) => c.id_cliente === filtros.cliente);
    }

    if (filtros.responsable) {
      comprobantes = comprobantes.filter((c) => c.responsable === filtros.responsable);
    }

    if (filtros.empleado) {
      comprobantes = comprobantes.filter((c) => c.id_empleado === filtros.empleado);
    }

    return comprobantes;
  }

  getTotalVentas(filtros?: FiltrosVenta): number {
    const comprobantes = filtros ? this.filtrarComprobantes(filtros) : this.getComprobantesPorEstado(true);
    return comprobantes.reduce((total, c) => total + c.total, 0);
  }

  getSubtotalVentas(filtros?: FiltrosVenta): number {
    const comprobantes = filtros ? this.filtrarComprobantes(filtros) : this.getComprobantesPorEstado(true);
    return comprobantes.reduce((total, c) => total + c.subtotal, 0);
  }

  getIGVVentas(filtros?: FiltrosVenta): number {
    const comprobantes = filtros ? this.filtrarComprobantes(filtros) : this.getComprobantesPorEstado(true);
    return comprobantes.reduce((total, c) => total + c.igv, 0);
  }

  getCountComprobantes(filtros?: FiltrosVenta): number {
    return filtros ? this.filtrarComprobantes(filtros).length : this.comprobantesSubject.value.length;
  }

  getVentasHoy(): ComprobanteVenta[] {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const mañana = new Date(hoy);
    mañana.setDate(mañana.getDate() + 1);
    return this.getComprobantesPorFecha(hoy, mañana);
  }

  getTotalVentasHoy(): number {
    return this.getVentasHoy().reduce((total, c) => (c.estado ? total + c.total : total), 0);
  }

  getVentasMes(mes: number, año: number): ComprobanteVenta[] {
    return this.comprobantesSubject.value.filter((c) => {
      const fecha = new Date(c.fec_emision);
      return fecha.getMonth() === mes && fecha.getFullYear() === año;
    });
  }

  getResumenPorTipo(): { [tipo: string]: { cantidad: number; total: number } } {
    const facturas = this.getComprobantesPorTipo('01').filter((c) => c.estado);
    const boletas = this.getComprobantesPorTipo('03').filter((c) => c.estado);

    return {
      FACTURAS: { cantidad: facturas.length, total: facturas.reduce((sum, c) => sum + c.total, 0) },
      BOLETAS: { cantidad: boletas.length, total: boletas.reduce((sum, c) => sum + c.total, 0) },
    };
  }

  generarSerie(tipo: '01' | '03', numero: number = 1): string {
    return tipo === '01' ? `F${String(numero).padStart(3, '0')}` : `B${String(numero).padStart(3, '0')}`;
  }

  getUltimoNumero(serie: string): number {
    const comprobantes = this.comprobantesSubject.value.filter((c) => c.serie === serie);
    return comprobantes.length > 0 ? Math.max(...comprobantes.map((c) => c.numero)) : 0;
  }

  private generarHash(id: string, serie: string, numero: number): string {
    const timestamp = Date.now();
    return `HASH-${id}-${timestamp}`;
  }

  calcularIGV(subtotal: number): number {
    return Number((subtotal * 0.18).toFixed(2));
  }

  calcularSubtotal(total: number): number {
    return Number((total / 1.18).toFixed(2));
  }

  setComprobanteActual(comprobante: Partial<ComprobanteVenta>): void {
    this.comprobanteActualSubject.next(comprobante);
  }

  getComprobanteActual(): Partial<ComprobanteVenta> | null {
    return this.comprobanteActualSubject.value;
  }

  limpiarComprobanteActual(): void {
    this.comprobanteActualSubject.next(null);
  }

  setVentaWizard(wizard: Partial<VentaWizard>): void {
    this.ventaWizardSubject.next(wizard);
  }

  getVentaWizard(): Partial<VentaWizard> | null {
    return this.ventaWizardSubject.value;
  }

  limpiarVentaWizard(): void {
    this.ventaWizardSubject.next(null);
  }

  validarComprobante(comprobante: Partial<ComprobanteVenta>): { valido: boolean; errores: string[] } {
    const errores: string[] = [];

    if (!comprobante.id_cliente) errores.push('Cliente requerido');
    if (!comprobante.tipo_comprobante) errores.push('Tipo de comprobante requerido');
    if (!comprobante.detalles || comprobante.detalles.length === 0) errores.push('Debe agregar productos');
    if (!comprobante.total || comprobante.total <= 0) errores.push('Total inválido');

    return { valido: errores.length === 0, errores };
  }

  puedeAnular(id: string): boolean {
    const comprobante = this.getComprobantePorId(id);
    if (!comprobante) return false;

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaEmision = new Date(comprobante.fec_emision);
    fechaEmision.setHours(0, 0, 0, 0);

    return comprobante.estado && fechaEmision.getTime() === hoy.getTime();
  }

  getEstadisticasPorEmpleado(idEmpleado: string) {
    const ventas = this.getComprobantesPorEmpleado(idEmpleado).filter(c => c.estado);
    
    return {
      totalVentas: ventas.length,
      totalMonto: ventas.reduce((sum, c) => sum + c.total, 0),
      promedio: ventas.length > 0 ? ventas.reduce((sum, c) => sum + c.total, 0) / ventas.length : 0,
      boletas: ventas.filter(c => c.tipo_comprobante === '03').length,
      facturas: ventas.filter(c => c.tipo_comprobante === '01').length,
    };
  }

  getEstadisticasPorSede(idSede: string) {
    const ventas = this.getComprobantesPorSede(idSede).filter(c => c.estado);
    
    return {
      totalVentas: ventas.length,
      totalMonto: ventas.reduce((sum, c) => sum + c.total, 0),
      promedio: ventas.length > 0 ? ventas.reduce((sum, c) => sum + c.total, 0) / ventas.length : 0,
      boletas: ventas.filter(c => c.tipo_comprobante === '03').length,
      facturas: ventas.filter(c => c.tipo_comprobante === '01').length,
    };
  }
}
