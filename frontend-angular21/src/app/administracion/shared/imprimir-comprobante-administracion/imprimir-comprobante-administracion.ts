import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';

import { SedeService, Sede } from '../../../core/services/sede.service';
import { ComprobanteStorage } from '../../../core/utils/storage.helper';
import { PDFHelper, ComprobantePDF, ComprobanteItemPDF } from '../../../core/utils/pdf.helper';

@Component({
  selector: 'app-imprimir-comprobante-administracion',
  templateUrl: './imprimir-comprobante-administracion.html',
  styleUrls: ['./imprimir-comprobante-administracion.css'],
  standalone: true,
  imports: [CommonModule, ButtonModule]
})
export class ImprimirComprobanteAdministracion implements OnInit {
  comprobante: any | null = null;
  sede: Sede | null = null;
  cargando: boolean = true;
  rutaRetorno: string = '/administracion/historial-ventas-administracion';

  constructor(
    private router: Router,
    private sedeService: SedeService
  ) {
    this.cargarComprobanteDelStorage();
  }

  ngOnInit(): void {
    if (!this.comprobante) {
      this.cargando = false;
      return;
    }
    this.cargarSede();
  }

  private cargarComprobanteDelStorage(): void {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state;
    
    if (state && state['comprobante']) {
      this.comprobante = state['comprobante'];
      this.rutaRetorno = state['rutaRetorno'] || '/administracion/historial-ventas-administracion';
      ComprobanteStorage.guardar(this.comprobante, this.rutaRetorno);
    } else {
      this.comprobante = ComprobanteStorage.obtenerComprobante();
      this.rutaRetorno = ComprobanteStorage.obtenerRutaRetorno();
      
      if (!this.comprobante) {
        this.cargando = false;
        return;
      }
    }

    // Normalizar items/detalles
    if (!this.comprobante.items && this.comprobante.detalles) {
      this.comprobante.items = this.comprobante.detalles;
    }
    
    if (!this.comprobante.items) {
      this.comprobante.items = [];
    }
  }

  private cargarSede(): void {
    const idSede = this.comprobante?.id_sede || this.comprobante?.idsede;
    
    if (idSede) {
      this.sedeService.getSedeById(idSede).subscribe({
        next: (sede: Sede) => {
          this.sede = sede;
          this.cargando = false;
        },
        error: () => this.cargarSedeActual()
      });
    } else {
      this.cargarSedeActual();
    }
  }

  private cargarSedeActual(): void {
    this.sedeService.getSedeActual().subscribe({
      next: (sede: Sede) => {
        this.sede = sede;
        this.cargando = false;
      },
      error: (err: any) => {
        console.error('Error al cargar sede:', err);
        this.cargando = false;
      }
    });
  }

  // 🔥 MÉTODOS PARA EL TEMPLATE
  getNombreProducto(item: any): string {
    return item.producto_nombre || item.descripcion || item.nombre || 'Producto';
  }

  getPrecioUnitario(item: any): number {
    const precio = item.precio_unitario || item.preciounitario || item.pre_uni || item.valor_unit;
    if (!precio && item.subtotal && item.cantidad) {
      return item.subtotal / item.cantidad;
    }
    return precio || 0;
  }

  getSubtotalItem(item: any): number {
    let subtotal = item.subtotal || item.total;
    if (!subtotal) {
      const precioUnit = this.getPrecioUnitario(item);
      subtotal = precioUnit * item.cantidad;
    }
    return subtotal || 0;
  }

  trackByIndex(index: number): number {
    return index;
  }

  // GETTERS
  get tipoComprobante(): string {
    if (!this.comprobante) return '';
    return this.comprobante.tipo_comprobante === '03' || this.comprobante.tipocomprobante === '03' 
      ? 'BOLETA DE VENTA' 
      : 'FACTURA ELECTRÓNICA';
  }

  get numeroFormateado(): string {
    if (!this.comprobante) return '';
    const numero = this.comprobante.numero || this.comprobante.num;
    return numero.toString().padStart(8, '0');
  }

  get serieNumero(): string {
    if (!this.comprobante) return '';
    return `${this.comprobante.serie}-${this.numeroFormateado}`;
  }

  get formaPago(): string {
    if (!this.comprobante) return 'EFECTIVO';
    const tipoPago = this.comprobante.tipo_pago || this.comprobante.tipopago || this.comprobante.med_pago || '01';
    const formas: { [key: string]: string } = {
      '01': 'EFECTIVO',
      '02': 'TARJETA',
      '03': 'YAPE',
      '04': 'PLIN',
      '05': 'TRANSFERENCIA',
      'EFECTIVO': 'EFECTIVO',
      'TARJETA': 'TARJETA',
      'YAPE': 'YAPE',
      'PLIN': 'PLIN',
      'TRANSFERENCIA': 'TRANSFERENCIA'
    };
    return formas[tipoPago] || 'EFECTIVO';
  }

  get nombreCliente(): string {
    if (!this.comprobante) return 'Cliente General';
    return this.comprobante.cliente_nombre 
      || this.comprobante.clientenombre 
      || this.comprobante.razon_social 
      || this.comprobante.razonsocial 
      || 'Cliente General';
  }

  get documentoCliente(): string {
    if (!this.comprobante) return '-';
    return this.comprobante.cliente_doc 
      || this.comprobante.clientedoc 
      || this.comprobante.num_doc 
      || this.comprobante.numdoc 
      || '-';
  }

  get fechaFormateada(): string {
    if (!this.comprobante) return '';
    const fecha = new Date(this.comprobante.fec_emision || this.comprobante.fecemision);
    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const anio = fecha.getFullYear();
    const horas = fecha.getHours().toString().padStart(2, '0');
    const minutos = fecha.getMinutes().toString().padStart(2, '0');
    return `${dia}/${mes}/${anio} ${horas}:${minutos}`;
  }

  // CONVERTIR A FORMATO PDF
  private convertirAComprobantePDF(): ComprobantePDF {
    const items: ComprobanteItemPDF[] = (this.comprobante.items || []).map((item: any) => ({
      codigo: item.cod_prod || item.codprod || '',
      descripcion: this.getNombreProducto(item),
      cantidad: item.cantidad || 0,
      precio_unitario: this.getPrecioUnitario(item),
      subtotal: this.getSubtotalItem(item)
    }));

    return {
      tipo_comprobante: (this.comprobante.tipo_comprobante || this.comprobante.tipocomprobante) as '01' | '03',
      serie: this.comprobante.serie,
      numero: this.comprobante.numero,
      cliente_nombre: this.nombreCliente,
      cliente_doc: this.documentoCliente,
      fecha: new Date(this.comprobante.fec_emision || this.comprobante.fecemision),
      items: items,
      subtotal: this.comprobante.subtotal || 0,
      igv: this.comprobante.igv || 0,
      total: this.comprobante.total || 0,
      tipo_pago: this.comprobante.tipo_pago || this.comprobante.med_pago || '01'
    };
  }

  // ACCIONES
  generarPDF(): void {
    if (!this.comprobante || !this.sede) {
      console.error('Faltan datos para generar PDF');
      return;
    }

    const comprobantePDF = this.convertirAComprobantePDF();
    const doc = PDFHelper.generarTicketVenta(comprobantePDF, this.sede);
    
    if (doc) {
      PDFHelper.abrirPDFEnNuevaVentana(doc);
    }
  }

  descargarPDF(): void {
    if (!this.comprobante || !this.sede) {
      console.error('Faltan datos para generar PDF');
      return;
    }

    const comprobantePDF = this.convertirAComprobantePDF();
    const doc = PDFHelper.generarTicketVenta(comprobantePDF, this.sede);
    
    if (doc) {
      PDFHelper.descargarPDF(doc, `${this.serieNumero}.pdf`);
    }
  }

  volver(): void {
    ComprobanteStorage.limpiar();
    this.router.navigate([this.rutaRetorno]);
  }
}
