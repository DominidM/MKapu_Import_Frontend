import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ComprobantesService {

  generarSerieBoleta(numero: number = 1): string {
    return `B${String(numero).padStart(3, '0')}`;
  }

  generarSerieFactura(numero: number = 1): string {
    return `F${String(numero).padStart(3, '0')}`;
  }

  generarSerie(tipo: '01' | '03', numero: number = 1): string {
    return tipo === '01' ? this.generarSerieFactura(numero) : this.generarSerieBoleta(numero);
  }

  calcularIGV(subtotal: number): number {
    return Number((subtotal * 0.18).toFixed(2));
  }

  calcularSubtotal(totalConIGV: number): number {
    return Number((totalConIGV / 1.18).toFixed(2));
  }

  calcularTotalConIGV(subtotal: number): number {
    return Number((subtotal * 1.18).toFixed(2));
  }

  calcularValorUnitario(precioConIGV: number): number {
    return Number((precioConIGV / 1.18).toFixed(2));
  }

  calcularPrecioUnitario(valorSinIGV: number): number {
    return Number((valorSinIGV * 1.18).toFixed(2));
  }

  calcularIGVItem(valorUnitario: number, cantidad: number): number {
    const subtotal = valorUnitario * cantidad;
    return this.calcularIGV(subtotal);
  }

  calcularSubtotalItem(valorUnitario: number, cantidad: number): number {
    return Number((valorUnitario * cantidad).toFixed(2));
  }

  calcularTotalItem(valorUnitario: number, cantidad: number): number {
    const subtotal = this.calcularSubtotalItem(valorUnitario, cantidad);
    const igv = this.calcularIGV(subtotal);
    return Number((subtotal + igv).toFixed(2));
  }

  generarHashCPE(idComprobante: string, serie: string, numero: number): string {
    const timestamp = Date.now();
    return `${idComprobante}-${serie}-${numero}-${timestamp}`.split('').reduce((hash, char) => {
      return ((hash << 5) - hash) + char.charCodeAt(0);
    }, 0).toString(16).toUpperCase();
  }

  formatearNumeroComprobante(numero: number): string {
    return String(numero).padStart(8, '0');
  }

  formatearComprobante(serie: string, numero: number): string {
    return `${serie}-${this.formatearNumeroComprobante(numero)}`;
  }

  getTipoAfectacionIGV(gravado: boolean = true): string {
    return gravado ? '10' : '20';
  }

  getDescripcionTipoAfectacion(codigo: string): string {
    const tipos: { [key: string]: string } = {
      '10': 'Gravado - Operación Onerosa',
      '20': 'Exonerado - Operación Onerosa',
      '30': 'Inafecto - Operación Onerosa',
      '40': 'Exportación'
    };
    return tipos[codigo] || 'Desconocido';
  }

  getTipoOperacion(): string {
    return '0101';
  }

  getCodigoMoneda(moneda: 'PEN' | 'USD' = 'PEN'): string {
    return moneda;
  }

  getSimboloMoneda(moneda: 'PEN' | 'USD' = 'PEN'): string {
    return moneda === 'PEN' ? 'S/.' : '$';
  }

  validarTipoComprobante(tipo: string): boolean {
    return ['01', '03', '07', '08'].includes(tipo);
  }

  getNombreTipoComprobante(tipo: string): string {
    const tipos: { [key: string]: string } = {
      '01': 'Factura Electrónica',
      '03': 'Boleta de Venta Electrónica',
      '07': 'Nota de Crédito Electrónica',
      '08': 'Nota de Débito Electrónica'
    };
    return tipos[tipo] || 'Comprobante Desconocido';
  }

  calcularFechaVencimiento(fechaEmision: Date, dias: number = 30): Date {
    const fecha = new Date(fechaEmision);
    fecha.setDate(fecha.getDate() + dias);
    return fecha;
  }

  generarXMLCPE(comprobante: any): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2">
  <ID>${comprobante.serie}-${comprobante.numero}</ID>
  <IssueDate>${new Date().toISOString().split('T')[0]}</IssueDate>
</Invoice>`;
  }

  generarCDR(comprobante: any): string {
    return `CDR-${comprobante.id_comprobante}-ACEPTADO`;
  }

  validarEstadoSUNAT(hash: string): Promise<'ACEPTADO' | 'RECHAZADO' | 'PENDIENTE'> {
    return new Promise((resolve) => {
      setTimeout(() => resolve('ACEPTADO'), 1000);
    });
  }

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

  redondear(valor: number): number {
    return Number(valor.toFixed(2));
  }

  formatearMonto(monto: number, moneda: 'PEN' | 'USD' = 'PEN'): string {
    return `${this.getSimboloMoneda(moneda)} ${monto.toFixed(2)}`;
  }

  numeroALetras(numero: number): string {
    const entero = Math.floor(numero);
    const decimales = Math.round((numero - entero) * 100);
    return `${entero} CON ${String(decimales).padStart(2, '0')}/100 SOLES`;
  }

  getTiposComprobanteOptions() {
    return [
      { label: 'Todos', value: null },
      { label: 'Boleta', value: '03' },
      { label: 'Factura', value: '01' },
    ];
  }

  getTiposComprobanteOptionsParaGenerar() {
    return [
      { label: 'Boleta', value: '03', icon: 'pi pi-file' },
      { label: 'Factura', value: '01', icon: 'pi pi-file-edit' },
    ];
  }

  getEstadosComprobanteOptions() {
    return [
      { label: 'Todos', value: null },
      { label: 'Emitido', value: 'EMITIDO' },
      { label: 'Cancelado', value: 'CANCELADO' },
      { label: 'Reembolsado', value: 'REEMBOLSADO' },
    ];
  }

  getTipoComprobanteLabel(tipo: '01' | '03'): string {
    return tipo === '03' ? 'Boleta' : 'Factura';
  }

  getNumeroFormateado(serie: string, numero: number): string {
    return `${serie}-${numero.toString().padStart(8, '0')}`;
  }

  getSeverityEstado(estado: string): 'success' | 'danger' | 'warn' | 'info' {
    switch (estado) {
      case 'EMITIDO':
        return 'success';
      case 'CANCELADO':
        return 'danger';
      case 'REEMBOLSADO':
        return 'warn';
      default:
        return 'info';
    }
  }

  getEstadoComprobante(comprobante: any): string {
    if (!comprobante.estado) return 'CANCELADO';
    if (comprobante.hash_cpe) return 'EMITIDO';
    return 'EMITIDO';
  }

  getSeverityTipoComprobante(tipo: '01' | '03'): 'primary' | 'secondary' {
    return tipo === '01' ? 'primary' : 'secondary';
  }
}
