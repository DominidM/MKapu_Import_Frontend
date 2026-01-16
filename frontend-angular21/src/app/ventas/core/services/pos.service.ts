// src/app/ventas/core/services/pos.service.ts

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

// ✅ INTERFACE SEGÚN TABLA `pago`
export interface Pago {
  id_pago: number;
  id_comprobante: string;
  fec_pago: Date;
  med_pago: 'EFECTIVO' | 'TARJETA' | 'YAPE' | 'PLIN' | 'TRANSFERENCIA';
  monto: number;
  banco?: string;
  num_operacion?: string;
  voucher?: string;
}

export interface MovimientoCaja {
  id_movimiento: number;
  id_caja: number;
  fec_mov: Date;
  tipo_mov: 'INGRESO' | 'EGRESO';
  concepto: string;
  monto: number;
  medio_pago: string;
  doc_ref?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PosService {
  private pagosSubject = new BehaviorSubject<Pago[]>([]);
  public pagos$ = this.pagosSubject.asObservable();

  private cajaAbierta = new BehaviorSubject<boolean>(false);
  public cajaAbierta$ = this.cajaAbierta.asObservable();

  private saldoCaja = new BehaviorSubject<number>(0);
  public saldoCaja$ = this.saldoCaja.asObservable();

  constructor() {
    this.inicializarDatos();
  }

  private inicializarDatos(): void {
    const datosIniciales: Pago[] = [
      {
        id_pago: 1,
        id_comprobante: 'CPE-2026-0001',
        fec_pago: new Date('2026-01-15T10:30:00'),
        med_pago: 'EFECTIVO',
        monto: 1598.00
      },
      {
        id_pago: 2,
        id_comprobante: 'CPE-2026-0002',
        fec_pago: new Date('2026-01-16T14:20:00'),
        med_pago: 'TARJETA',
        monto: 2400.00,
        banco: 'BCP',
        num_operacion: '123456789'
      }
    ];

    this.pagosSubject.next(datosIniciales);
  }

  // ====================================
  // GESTIÓN DE PAGOS
  // ====================================

  // ✅ REGISTRAR PAGO
  registrarPago(pago: Omit<Pago, 'id_pago'>): Pago {
    const pagos = this.pagosSubject.value;
    const nuevoId = Math.max(...pagos.map(p => p.id_pago), 0) + 1;
    
    const nuevoPago: Pago = {
      ...pago,
      id_pago: nuevoId,
      fec_pago: new Date()
    };

    this.pagosSubject.next([...pagos, nuevoPago]);
    console.log(`💳 Pago registrado: ${pago.med_pago} - S/. ${pago.monto}`);
    
    return nuevoPago;
  }

  // ✅ OBTENER PAGOS POR COMPROBANTE
  getPagosPorComprobante(idComprobante: string): Pago[] {
    return this.pagosSubject.value.filter(p => p.id_comprobante === idComprobante);
  }

  // ✅ OBTENER TODOS LOS PAGOS
  getPagos(): Pago[] {
    return this.pagosSubject.value;
  }

  // ✅ OBTENER PAGOS POR FECHA
  getPagosPorFecha(fecha: Date): Pago[] {
    return this.pagosSubject.value.filter(p => 
      p.fec_pago.toDateString() === fecha.toDateString()
    );
  }

  // ✅ OBTENER PAGOS POR MEDIO DE PAGO
  getPagosPorMedio(medio: string): Pago[] {
    return this.pagosSubject.value.filter(p => p.med_pago === medio);
  }

  // ====================================
  // CÁLCULOS DE PAGO
  // ====================================

  // ✅ CALCULAR VUELTO
  calcularVuelto(montoRecibido: number, total: number): number {
    return Number((montoRecibido - total).toFixed(2));
  }

  // ✅ VALIDAR MONTO SUFICIENTE
  validarMontoSuficiente(montoRecibido: number, total: number): boolean {
    return montoRecibido >= total;
  }

  // ✅ CALCULAR DESGLOSE DE BILLETES (para vuelto)
  calcularDesgloseBilletes(monto: number): { [denominacion: string]: number } {
    const denominaciones = [200, 100, 50, 20, 10, 5, 2, 1, 0.5, 0.2, 0.1, 0.05];
    const desglose: { [key: string]: number } = {};
    let restante = monto;

    denominaciones.forEach(denom => {
      const cantidad = Math.floor(restante / denom);
      if (cantidad > 0) {
        desglose[`S/. ${denom}`] = cantidad;
        restante = Number((restante - (cantidad * denom)).toFixed(2));
      }
    });

    return desglose;
  }

  // ====================================
  // VOUCHERS Y OPERACIONES
  // ====================================

  // ✅ GENERAR NÚMERO DE VOUCHER
  generarNumeroVoucher(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `VOU-${timestamp}-${random}`;
  }

  // ✅ GENERAR VOUCHER COMPLETO
  generarVoucher(pago: Pago): string {
    const voucher = this.generarNumeroVoucher();
    console.log(`📄 Voucher generado: ${voucher}`);
    console.log(`   Medio: ${pago.med_pago}`);
    console.log(`   Monto: S/. ${pago.monto}`);
    if (pago.banco) console.log(`   Banco: ${pago.banco}`);
    if (pago.num_operacion) console.log(`   Operación: ${pago.num_operacion}`);
    
    return voucher;
  }

  // ✅ VALIDAR NÚMERO DE OPERACIÓN (tarjeta/transferencia)
  validarNumeroOperacion(numero: string): boolean {
    return numero.length >= 6 && numero.length <= 20;
  }

  // ✅ VALIDAR NÚMERO DE TARJETA (básico - últimos 4 dígitos)
  validarNumeroTarjeta(numero: string): boolean {
    return /^\d{4}$/.test(numero);
  }

  // ====================================
  // MEDIOS DE PAGO DISPONIBLES
  // ====================================

  // ✅ OBTENER MEDIOS DE PAGO
  getMediosPago(): string[] {
    return ['EFECTIVO', 'TARJETA', 'YAPE', 'PLIN', 'TRANSFERENCIA'];
  }

  // ✅ OBTENER BANCOS DISPONIBLES
  getBancosDisponibles(): string[] {
    return [
      'BCP',
      'BBVA',
      'Interbank',
      'Scotiabank',
      'Banco de la Nación',
      'Banco Pichincha',
      'BANBIF',
      'Falabella',
      'Ripley'
    ];
  }

  // ✅ VALIDAR SI REQUIERE BANCO
  requiereBanco(medioPago: string): boolean {
    return ['TARJETA', 'TRANSFERENCIA'].includes(medioPago);
  }

  // ✅ VALIDAR SI REQUIERE NÚMERO DE OPERACIÓN
  requiereNumeroOperacion(medioPago: string): boolean {
    return ['TARJETA', 'YAPE', 'PLIN', 'TRANSFERENCIA'].includes(medioPago);
  }

  // ✅ OBTENER ICONO POR MEDIO DE PAGO
  getIconoMedioPago(medio: string): string {
    const iconos: { [key: string]: string } = {
      'EFECTIVO': 'pi pi-money-bill',
      'TARJETA': 'pi pi-credit-card',
      'YAPE': 'pi pi-mobile',
      'PLIN': 'pi pi-mobile',
      'TRANSFERENCIA': 'pi pi-arrow-right-arrow-left'
    };
    return iconos[medio] || 'pi pi-wallet';
  }

  // ====================================
  // GESTIÓN DE CAJA
  // ====================================

  // ✅ ABRIR CAJA
  abrirCaja(saldoInicial: number): void {
    this.cajaAbierta.next(true);
    this.saldoCaja.next(saldoInicial);
    console.log(`🔓 Caja abierta con saldo inicial: S/. ${saldoInicial}`);
  }

  // ✅ CERRAR CAJA
  cerrarCaja(): { saldoFinal: number; totalIngresos: number; totalEgresos: number } {
    const saldoFinal = this.saldoCaja.value;
    const totalIngresos = this.calcularTotalIngresos();
    const totalEgresos = this.calcularTotalEgresos();
    
    this.cajaAbierta.next(false);
    console.log(`🔒 Caja cerrada. Saldo final: S/. ${saldoFinal}`);
    
    return { saldoFinal, totalIngresos, totalEgresos };
  }

  // ✅ VERIFICAR SI CAJA ESTÁ ABIERTA
  isCajaAbierta(): boolean {
    return this.cajaAbierta.value;
  }

  // ✅ OBTENER SALDO ACTUAL
  getSaldoCaja(): number {
    return this.saldoCaja.value;
  }

  // ✅ REGISTRAR INGRESO EN CAJA
  registrarIngreso(monto: number, concepto: string): void {
    const saldoActual = this.saldoCaja.value;
    this.saldoCaja.next(saldoActual + monto);
    console.log(`💰 Ingreso registrado: S/. ${monto} - ${concepto}`);
  }

  // ✅ REGISTRAR EGRESO EN CAJA
  registrarEgreso(monto: number, concepto: string): void {
    const saldoActual = this.saldoCaja.value;
    if (saldoActual >= monto) {
      this.saldoCaja.next(saldoActual - monto);
      console.log(`💸 Egreso registrado: S/. ${monto} - ${concepto}`);
    } else {
      console.error('❌ Saldo insuficiente en caja');
    }
  }

  // ====================================
  // REPORTES Y ESTADÍSTICAS
  // ====================================

  // ✅ CALCULAR TOTAL DE INGRESOS
  calcularTotalIngresos(): number {
    return this.pagosSubject.value.reduce((total, pago) => total + pago.monto, 0);
  }

  // ✅ CALCULAR TOTAL DE EGRESOS (simulado - en producción vendría de movimientos_caja)
  calcularTotalEgresos(): number {
    // Simulación - en producción usar tabla movimientos_caja
    return 0;
  }

  // ✅ CALCULAR TOTAL POR MEDIO DE PAGO
  calcularTotalPorMedioPago(medio: string): number {
    return this.getPagosPorMedio(medio).reduce((total, pago) => total + pago.monto, 0);
  }

  // ✅ OBTENER RESUMEN DE PAGOS
  getResumenPagos(): { [medio: string]: { cantidad: number; total: number } } {
    const medios = this.getMediosPago();
    const resumen: { [key: string]: { cantidad: number; total: number } } = {};

    medios.forEach(medio => {
      const pagos = this.getPagosPorMedio(medio);
      resumen[medio] = {
        cantidad: pagos.length,
        total: this.calcularTotalPorMedioPago(medio)
      };
    });

    return resumen;
  }

  // ✅ OBTENER PAGOS DEL DÍA
  getPagosHoy(): Pago[] {
    return this.getPagosPorFecha(new Date());
  }

  // ✅ CALCULAR TOTAL PAGOS HOY
  getTotalPagosHoy(): number {
    return this.getPagosHoy().reduce((total, pago) => total + pago.monto, 0);
  }

  // ====================================
  // IMPRESIÓN Y TICKETS
  // ====================================

  // ✅ IMPRIMIR VOUCHER DE PAGO
  imprimirVoucher(pago: Pago): void {
    console.log('🖨️ ========== VOUCHER DE PAGO ==========');
    console.log(`Comprobante: ${pago.id_comprobante}`);
    console.log(`Medio de Pago: ${pago.med_pago}`);
    console.log(`Monto: S/. ${pago.monto.toFixed(2)}`);
    console.log(`Fecha: ${pago.fec_pago.toLocaleString()}`);
    if (pago.banco) console.log(`Banco: ${pago.banco}`);
    if (pago.num_operacion) console.log(`N° Operación: ${pago.num_operacion}`);
    if (pago.voucher) console.log(`Voucher: ${pago.voucher}`);
    console.log('========================================');
  }

  // ✅ IMPRIMIR TICKET DE VUELTO
  imprimirTicketVuelto(total: number, recibido: number, vuelto: number): void {
    console.log('🖨️ ========== TICKET ==========');
    console.log(`Total: S/. ${total.toFixed(2)}`);
    console.log(`Recibido: S/. ${recibido.toFixed(2)}`);
    console.log(`Vuelto: S/. ${vuelto.toFixed(2)}`);
    console.log('================================');
  }

  // ✅ GENERAR REPORTE DE CIERRE DE CAJA
  generarReporteCierreCaja(): string {
    const resumen = this.getResumenPagos();
    let reporte = '\n📊 ========== CIERRE DE CAJA ==========\n';
    reporte += `Fecha: ${new Date().toLocaleString()}\n\n`;
    
    Object.entries(resumen).forEach(([medio, data]) => {
      if (data.cantidad > 0) {
        reporte += `${medio}: ${data.cantidad} operaciones - S/. ${data.total.toFixed(2)}\n`;
      }
    });
    
    reporte += `\nTOTAL: S/. ${this.calcularTotalIngresos().toFixed(2)}\n`;
    reporte += '======================================\n';
    
    console.log(reporte);
    return reporte;
  }

  // ====================================
  // VALIDACIONES DE SEGURIDAD
  // ====================================

  // ✅ VALIDAR MONTO VÁLIDO
  validarMonto(monto: number): boolean {
    return monto > 0 && isFinite(monto);
  }

  // ✅ VALIDAR PAGO COMPLETO
  validarPago(pago: Partial<Pago>): { valido: boolean; errores: string[] } {
    const errores: string[] = [];

    if (!pago.med_pago) errores.push('Debe seleccionar un medio de pago');
    if (!pago.monto || !this.validarMonto(pago.monto)) errores.push('Monto inválido');
    if (this.requiereBanco(pago.med_pago!) && !pago.banco) errores.push('Debe seleccionar un banco');
    if (this.requiereNumeroOperacion(pago.med_pago!) && !pago.num_operacion) {
      errores.push('Debe ingresar número de operación');
    }

    return { valido: errores.length === 0, errores };
  }
}
