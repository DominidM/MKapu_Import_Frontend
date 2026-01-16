// src/app/ventas/core/services/comprobantes.service.ts

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ComprobantesService {

  // ✅ GENERAR SERIE BOLETA
  generarSerieBoleta(numero: number = 1): string {
    return `B${String(numero).padStart(3, '0')}`;
  }

  // ✅ GENERAR SERIE FACTURA
  generarSerieFactura(numero: number = 1): string {
    return `F${String(numero).padStart(3, '0')}`;
  }

  // ✅ GENERAR SERIE SEGÚN TIPO
  generarSerie(tipo: '01' | '03', numero: number = 1): string {
    return tipo === '01' ? this.generarSerieFactura(numero) : this.generarSerieBoleta(numero);
  }

  // ✅ CALCULAR IGV (18%)
  calcularIGV(subtotal: number): number {
    return Number((subtotal * 0.18).toFixed(2));
  }

  // ✅ CALCULAR SUBTOTAL SIN IGV (desde total con IGV)
  calcularSubtotal(totalConIGV: number): number {
    return Number((totalConIGV / 1.18).toFixed(2));
  }

  // ✅ CALCULAR TOTAL CON IGV (desde subtotal)
  calcularTotalConIGV(subtotal: number): number {
    return Number((subtotal * 1.18).toFixed(2));
  }

  // ✅ CALCULAR VALOR UNITARIO (sin IGV)
  calcularValorUnitario(precioConIGV: number): number {
    return Number((precioConIGV / 1.18).toFixed(2));
  }

  // ✅ CALCULAR PRECIO UNITARIO (con IGV)
  calcularPrecioUnitario(valorSinIGV: number): number {
    return Number((valorSinIGV * 1.18).toFixed(2));
  }

  // ✅ CALCULAR IGV DE UN ITEM
  calcularIGVItem(valorUnitario: number, cantidad: number): number {
    const subtotal = valorUnitario * cantidad;
    return this.calcularIGV(subtotal);
  }

  // ✅ CALCULAR SUBTOTAL DE ITEM
  calcularSubtotalItem(valorUnitario: number, cantidad: number): number {
    return Number((valorUnitario * cantidad).toFixed(2));
  }

  // ✅ CALCULAR TOTAL DE ITEM (subtotal + IGV)
  calcularTotalItem(valorUnitario: number, cantidad: number): number {
    const subtotal = this.calcularSubtotalItem(valorUnitario, cantidad);
    const igv = this.calcularIGV(subtotal);
    return Number((subtotal + igv).toFixed(2));
  }

  // ✅ GENERAR HASH CPE (simulado - en producción conectar con SUNAT)
  generarHashCPE(idComprobante: string, serie: string, numero: number): string {
    const timestamp = Date.now();
    return `${idComprobante}-${serie}-${numero}-${timestamp}`.split('').reduce((hash, char) => {
      return ((hash << 5) - hash) + char.charCodeAt(0);
    }, 0).toString(16).toUpperCase();
  }

  // ✅ GENERAR NÚMERO DE COMPROBANTE FORMATEADO
  formatearNumeroComprobante(numero: number): string {
    return String(numero).padStart(8, '0');
  }

  // ✅ FORMATEAR COMPROBANTE COMPLETO (SERIE-NUMERO)
  formatearComprobante(serie: string, numero: number): string {
    return `${serie}-${this.formatearNumeroComprobante(numero)}`;
  }

  // ✅ OBTENER CÓDIGO TIPO AFECTACIÓN IGV
  getTipoAfectacionIGV(gravado: boolean = true): string {
    // Códigos según catálogo SUNAT 07
    return gravado ? '10' : '20';  // 10 = Gravado, 20 = Exonerado
  }

  // ✅ OBTENER DESCRIPCIÓN TIPO AFECTACIÓN
  getDescripcionTipoAfectacion(codigo: string): string {
    const tipos: { [key: string]: string } = {
      '10': 'Gravado - Operación Onerosa',
      '20': 'Exonerado - Operación Onerosa',
      '30': 'Inafecto - Operación Onerosa',
      '40': 'Exportación'
    };
    return tipos[codigo] || 'Desconocido';
  }

  // ✅ OBTENER CÓDIGO TIPO OPERACIÓN
  getTipoOperacion(): string {
    return '0101';  // Venta Interna
  }

  // ✅ OBTENER DESCRIPCIÓN TIPO OPERACIÓN
  getDescripcionTipoOperacion(codigo: string): string {
    const tipos: { [key: string]: string } = {
      '0101': 'Venta Interna',
      '0102': 'Exportación',
      '0103': 'No Domiciliado',
      '0104': 'Venta Interna - Anticipos',
      '0200': 'Venta Itinerante'
    };
    return tipos[codigo] || 'Desconocido';
  }

  // ✅ OBTENER CÓDIGO MONEDA
  getCodigoMoneda(moneda: 'PEN' | 'USD' = 'PEN'): string {
    return moneda;
  }

  // ✅ OBTENER SÍMBOLO MONEDA
  getSimboloMoneda(moneda: 'PEN' | 'USD' = 'PEN'): string {
    return moneda === 'PEN' ? 'S/.' : '$';
  }

  // ✅ VALIDAR TIPO COMPROBANTE
  validarTipoComprobante(tipo: string): boolean {
    return ['01', '03', '07', '08'].includes(tipo);
    // 01 = Factura, 03 = Boleta, 07 = Nota de Crédito, 08 = Nota de Débito
  }

  // ✅ OBTENER NOMBRE TIPO COMPROBANTE
  getNombreTipoComprobante(tipo: string): string {
    const tipos: { [key: string]: string } = {
      '01': 'Factura Electrónica',
      '03': 'Boleta de Venta Electrónica',
      '07': 'Nota de Crédito Electrónica',
      '08': 'Nota de Débito Electrónica'
    };
    return tipos[tipo] || 'Comprobante Desconocido';
  }

  // ✅ CALCULAR FECHA DE VENCIMIENTO (30 días para facturas)
  calcularFechaVencimiento(fechaEmision: Date, dias: number = 30): Date {
    const fecha = new Date(fechaEmision);
    fecha.setDate(fecha.getDate() + dias);
    return fecha;
  }

  // ✅ IMPRIMIR COMPROBANTE (simulado)
  imprimirComprobante(id: string, tipo: '01' | '03'): void {
    const tipoNombre = this.getNombreTipoComprobante(tipo);
    console.log(`🖨️ Imprimiendo ${tipoNombre}: ${id}`);
    
    // Aquí iría la integración con sistema de impresión
    // Por ejemplo: window.print() o enviar a API de impresora térmica
  }

  // ✅ GENERAR XML CPE (simulado - en producción usar librería UBL)
  generarXMLCPE(comprobante: any): string {
    // Simulación básica de XML
    return `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2">
  <ID>${comprobante.serie}-${comprobante.numero}</ID>
  <IssueDate>${new Date().toISOString().split('T')[0]}</IssueDate>
</Invoice>`;
  }

  // ✅ GENERAR CDR (Constancia de Recepción - simulado)
  generarCDR(comprobante: any): string {
    // Simulación - en producción viene de SUNAT
    return `CDR-${comprobante.id_comprobante}-ACEPTADO`;
  }

  // ✅ VALIDAR ESTADO COMPROBANTE SUNAT (simulado)
  validarEstadoSUNAT(hash: string): Promise<'ACEPTADO' | 'RECHAZADO' | 'PENDIENTE'> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve('ACEPTADO'); // Simulación
      }, 1000);
    });
  }

  // ✅ ENVIAR A SUNAT (simulado)
  enviarASUNAT(comprobante: any): Promise<{ success: boolean; mensaje: string; cdr: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          mensaje: 'Comprobante aceptado por SUNAT',
          cdr: this.generarCDR(comprobante)
        });
      }, 2000);
    });
  }

  // ✅ DESCARGAR PDF (simulado)
  descargarPDF(idComprobante: string, serie: string, numero: number): void {
    console.log(`📄 Descargando PDF: ${this.formatearComprobante(serie, numero)}`);
    // Aquí iría la generación de PDF con jsPDF o similar
  }

  // ✅ ENVIAR POR EMAIL (simulado)
  enviarPorEmail(idComprobante: string, email: string): Promise<boolean> {
    console.log(`📧 Enviando comprobante ${idComprobante} a ${email}`);
    return Promise.resolve(true);
  }

  // ✅ REDONDEAR A 2 DECIMALES
  redondear(valor: number): number {
    return Number(valor.toFixed(2));
  }

  // ✅ FORMATEAR MONTO CON MONEDA
  formatearMonto(monto: number, moneda: 'PEN' | 'USD' = 'PEN'): string {
    return `${this.getSimboloMoneda(moneda)} ${monto.toFixed(2)}`;
  }

  // ✅ CALCULAR REDONDEO (ajuste por redondeo de céntimos)
  calcularRedondeo(total: number): number {
    const centimos = total % 1;
    if (centimos <= 0.02) return -centimos;
    if (centimos >= 0.98) return 1 - centimos;
    return 0;
  }

  // ✅ CONVERTIR NÚMERO A LETRAS (básico - para monto en letras)
  numeroALetras(numero: number): string {
    // Implementación básica - en producción usar librería completa
    const unidades = ['', 'UNO', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];
    const entero = Math.floor(numero);
    const decimales = Math.round((numero - entero) * 100);
    
    if (entero === 0) return `CERO CON ${String(decimales).padStart(2, '0')}/100 SOLES`;
    if (entero < 10) return `${unidades[entero]} CON ${String(decimales).padStart(2, '0')}/100 SOLES`;
    
    return `${entero} CON ${String(decimales).padStart(2, '0')}/100 SOLES`;
  }
}
