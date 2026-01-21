import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SedeService, Sede } from '../../core/services/sede.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ButtonModule } from 'primeng/button';

interface ComprobanteItem {
  id_det_com?: number;
  id_comprobante?: string;
  id_producto?: string;
  cod_prod?: string;
  descripcion?: string;
  producto_nombre?: string;
  cantidad: number;
  valor_unit?: number;
  pre_uni?: number;
  precio_unitario?: number;
  subtotal?: number;
  total?: number;
  igv?: number;
  tipo_afe_igv?: string;
}

interface Comprobante {
  id_comprobante?: string;
  tipo_comprobante: '01' | '03';
  serie: string;
  numero: number;
  cliente_nombre?: string;
  razon_social?: string;
  id_cliente?: string;
  cliente_doc?: string;
  num_doc?: string;
  fec_emision: Date;
  items?: ComprobanteItem[];
  detalles?: ComprobanteItem[];
  subtotal: number;
  igv: number;
  total: number;
  tipo_pago?: string;
  med_pago?: string;
}

@Component({
  selector: 'app-imprimir-comprobante',
  templateUrl: './imprimir-comprobante.html',
  styleUrls: ['./imprimir-comprobante.css'],
  standalone: true,
  imports: [CommonModule, ButtonModule]
})
export class ImprimirComprobante implements OnInit {
  comprobante: Comprobante | null = null;
  sede: Sede | null = null;
  cargando: boolean = true;
  rutaRetorno: string = '/ventas/historial-ventas';

  private readonly STORAGE_KEY = 'comprobante_imprimir';
  private readonly RUTA_KEY = 'comprobante_ruta_retorno';

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
      this.rutaRetorno = state['rutaRetorno'] || '/ventas/historial-ventas';
      this.guardarComprobanteEnStorage();
      sessionStorage.setItem(this.RUTA_KEY, this.rutaRetorno);
    } else {
      const storedData = sessionStorage.getItem(this.STORAGE_KEY);
      const storedRuta = sessionStorage.getItem(this.RUTA_KEY);
      
      if (storedData) {
        try {
          this.comprobante = JSON.parse(storedData);
          this.rutaRetorno = storedRuta || '/ventas/historial-ventas';
        } catch (error) {
          console.error('Error al parsear comprobante del storage:', error);
          this.cargando = false;
          return;
        }
      } else {
        this.cargando = false;
        return;
      }
    }

    if (!this.comprobante!.items && this.comprobante!.detalles) {
      this.comprobante!.items = this.comprobante!.detalles;
    }
    
    if (!this.comprobante!.items) {
      this.comprobante!.items = [];
    }
  }

  private guardarComprobanteEnStorage(): void {
    if (this.comprobante) {
      try {
        sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.comprobante));
      } catch (error) {
        console.error('Error al guardar comprobante en storage:', error);
      }
    }
  }

  private cargarSede(): void {
    const idSede = (this.comprobante as any)?.id_sede;
    
    if (idSede) {
      this.sedeService.getSedeById(idSede).subscribe({
        next: (sede: Sede) => {
          this.sede = sede;
          this.cargando = false;
        },
        error: (err: any) => {
          console.error('Error al cargar sede:', err);
          this.cargando = false;
        }
      });
    } else {
      this.sedeService.getSedeActual().subscribe({
        next: (sede: Sede) => {
          this.sede = sede;
          this.cargando = false;
        },
        error: (err: any) => {
          console.error('Error al cargar sede actual:', err);
          this.cargando = false;
        }
      });
    }
  }

  get tipoComprobante(): string {
    if (!this.comprobante) return '';
    return this.comprobante.tipo_comprobante === '03' ? 'BOLETA DE VENTA' : 'FACTURA ELECTRÓNICA';
  }

  get numeroFormateado(): string {
    if (!this.comprobante) return '';
    return this.comprobante.numero.toString().padStart(8, '0');
  }

  get serieNumero(): string {
    if (!this.comprobante) return '';
    return `${this.comprobante.serie}-${this.numeroFormateado}`;
  }

  get formaPago(): string {
    if (!this.comprobante) return 'EFECTIVO';
    const tipoPago = this.comprobante.tipo_pago || this.comprobante.med_pago || '01';
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
    return this.comprobante.cliente_nombre || this.comprobante.razon_social || 'Cliente General';
  }

  get documentoCliente(): string {
    if (!this.comprobante) return '-';
    return this.comprobante.cliente_doc || this.comprobante.num_doc || '-';
  }

  get fechaFormateada(): string {
    if (!this.comprobante) return '';
    const fecha = new Date(this.comprobante.fec_emision);
    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const anio = fecha.getFullYear();
    const horas = fecha.getHours().toString().padStart(2, '0');
    const minutos = fecha.getMinutes().toString().padStart(2, '0');
    return `${dia}/${mes}/${anio} ${horas}:${minutos}`;
  }

  getNombreProducto(item: ComprobanteItem): string {
    return item.producto_nombre || item.descripcion || 'Producto';
  }

  getPrecioUnitario(item: ComprobanteItem): number {
    const precio = item.precio_unitario || item.pre_uni || item.valor_unit;
    if (!precio && item.subtotal && item.cantidad) {
      return item.subtotal / item.cantidad;
    }
    return precio || 0;
  }

  getSubtotalItem(item: ComprobanteItem): number {
    let subtotal = item.subtotal || item.total;
    if (!subtotal) {
      const precioUnit = this.getPrecioUnitario(item);
      subtotal = precioUnit * item.cantidad;
    }
    return subtotal || 0;
  }

  private generarDocumentoPDF(): jsPDF | null {
    if (!this.comprobante || !this.sede) {
      console.error('Faltan datos para generar PDF');
      return null;
    }

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [80, 297]
    });

    let y = 8;
    const pageWidth = doc.internal.pageSize.getWidth();
    const centerX = pageWidth / 2;
    const leftMargin = 5;
    const rightMargin = 75;

    doc.setTextColor(0, 0, 0);
    doc.setDrawColor(0, 0, 0);

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(this.sede.nombre.toUpperCase(), centerX, y, { align: 'center' });
    y += 5.5;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(82, 82, 82);
    doc.text(this.sede.razon_social, centerX, y, { align: 'center' });
    y += 3.5;

    doc.setFontSize(7.5);
    doc.text(`RUC: ${this.sede.ruc}`, centerX, y, { align: 'center' });
    y += 6;

    this.dibujarLineaPunteada(doc, leftMargin, y, rightMargin, y, 1.5);
    y += 6;

    doc.setFillColor(245, 245, 245);
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.rect(leftMargin + 2, y - 2, rightMargin - leftMargin - 4, 10, 'FD');

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(this.tipoComprobante, centerX, y + 2, { align: 'center' });

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(this.serieNumero, centerX, y + 7, { align: 'center' });

    y += 12;

    this.dibujarLineaPunteada(doc, leftMargin, y, rightMargin, y, 1.5);
    y += 6;

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(82, 82, 82);
    
    doc.text('RUC:', leftMargin + 2, y);
    doc.setTextColor(38, 38, 38);
    doc.text(this.sede.ruc, leftMargin + 17, y);
    y += 3.5;

    doc.setTextColor(82, 82, 82);
    doc.text('Dirección:', leftMargin + 2, y);
    doc.setTextColor(38, 38, 38);
    const direccion = this.sede.direccion.length > 35 
      ? this.sede.direccion.substring(0, 35) + '...' 
      : this.sede.direccion;
    doc.text(direccion, leftMargin + 17, y);
    y += 3.5;

    doc.setTextColor(82, 82, 82);
    doc.text('Teléfono:', leftMargin + 2, y);
    doc.setTextColor(38, 38, 38);
    doc.text(this.sede.telefono, leftMargin + 17, y);
    y += 4;

    this.dibujarLineaPunteada(doc, leftMargin, y, rightMargin, y, 1);
    y += 4.5;

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');

    doc.setTextColor(82, 82, 82);
    doc.text('Cliente:', leftMargin + 2, y);
    doc.setTextColor(0, 0, 0);
    const nombreCliente = this.nombreCliente.length > 30 
      ? this.nombreCliente.substring(0, 30) + '...' 
      : this.nombreCliente;
    doc.text(nombreCliente, leftMargin + 17, y);
    y += 3.5;

    doc.setTextColor(82, 82, 82);
    doc.text('Documento:', leftMargin + 2, y);
    doc.setTextColor(0, 0, 0);
    doc.text(this.documentoCliente, leftMargin + 17, y);
    y += 3.5;

    doc.setTextColor(82, 82, 82);
    doc.text('Fecha:', leftMargin + 2, y);
    doc.setTextColor(0, 0, 0);
    doc.text(this.fechaFormateada, leftMargin + 17, y);
    y += 6;

    this.dibujarLineaPunteada(doc, leftMargin, y, rightMargin, y, 1);
    y += 6;

    const productos = (this.comprobante.items || []).map(item => [
      this.getNombreProducto(item).substring(0, 25),
      item.cantidad.toString(),
      this.getPrecioUnitario(item).toFixed(2),
      this.getSubtotalItem(item).toFixed(2)
    ]);

    autoTable(doc, {
      startY: y,
      head: [['DESC', 'CANT', 'P.U.', 'TOTAL']],
      body: productos,
      theme: 'plain',
      styles: {
        fontSize: 7,
        cellPadding: 2,
        lineColor: [200, 200, 200],
        lineWidth: 0.15,
        textColor: [0, 0, 0],
        halign: 'left',
        overflow: 'linebreak'
      },
      headStyles: {
        fontStyle: 'bold',
        fillColor: [235, 235, 235],
        textColor: [38, 38, 38],
        halign: 'left',
        fontSize: 7,
        lineColor: [180, 180, 180],
        lineWidth: 0.2,
        cellPadding: 2.5
      },
      columnStyles: {
        0: { cellWidth: 30, halign: 'left' },
        1: { cellWidth: 13, halign: 'center' },
        2: { cellWidth: 13, halign: 'right' },
        3: { cellWidth: 14, halign: 'right', fontStyle: 'bold' }
      },
      margin: { left: leftMargin, right: 5 },
      tableWidth: 70
    });

    y = (doc as any).lastAutoTable.finalY + 3;

    this.dibujarLineaPunteada(doc, leftMargin, y, rightMargin, y, 1);
    y += 6;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');

    doc.setTextColor(82, 82, 82);
    doc.text('SUBTOTAL:', leftMargin + 2, y);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text(`S/. ${this.comprobante.subtotal.toFixed(2)}`, rightMargin - 2, y, { align: 'right' });
    y += 4;

    if (this.comprobante.igv > 0) {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(82, 82, 82);
      doc.text('IGV (18%):', leftMargin + 2, y);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.text(`S/. ${this.comprobante.igv.toFixed(2)}`, rightMargin - 2, y, { align: 'right' });
      y += 4;
    }

    y += 3;

    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.25);
    doc.line(leftMargin + 2, y, rightMargin - 2, y);
    y += 6;

    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('TOTAL:', leftMargin + 2, y);
    doc.text(`S/. ${this.comprobante.total.toFixed(2)}`, rightMargin - 2, y, { align: 'right' });
    y += 3.5;

    doc.setLineWidth(0.25);
    doc.line(leftMargin + 2, y, rightMargin - 2, y);
    y += 6;

    doc.setFillColor(245, 245, 245);
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.rect(leftMargin + 2, y - 3, rightMargin - leftMargin - 4, 6.5, 'FD');

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(38, 38, 38);
    doc.text('PAGO:', leftMargin + 4, y + 1);
    doc.text(this.formaPago, rightMargin - 4, y + 1, { align: 'right' });

    y += 8;

    this.dibujarLineaPunteada(doc, leftMargin, y, rightMargin, y, 1);
    y += 5;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('¡Gracias por su compra!', centerX, y, { align: 'center' });
    y += 3.5;

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(115, 115, 115);
    doc.text('Conserve su comprobante', centerX, y, { align: 'center' });

    return doc;
  }

  generarPDF(): void {
    const doc = this.generarDocumentoPDF();
    
    if (!doc) {
      console.error('No se pudo generar el documento PDF');
      return;
    }
    
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, '_blank');
    
    setTimeout(() => {
      URL.revokeObjectURL(pdfUrl);
    }, 100);
  }

  descargarPDF(): void {
    const doc = this.generarDocumentoPDF();
    
    if (!doc) {
      console.error('No se pudo generar el documento PDF');
      return;
    }
    
    const nombreArchivo = `${this.serieNumero}.pdf`;
    doc.save(nombreArchivo);
  }

  private dibujarLineaPunteada(
    doc: jsPDF,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    espaciado: number = 1
  ): void {
    const longitudPunto = 1;
    let x = x1;

    doc.setDrawColor(163, 163, 163);
    doc.setLineWidth(0.08);
    
    while (x < x2) {
      const finPunto = Math.min(x + longitudPunto, x2);
      doc.line(x, y1, finPunto, y1);
      x += longitudPunto + espaciado;
    }
  }

  volver(): void {
    sessionStorage.removeItem(this.STORAGE_KEY);
    sessionStorage.removeItem(this.RUTA_KEY);
    this.router.navigate([this.rutaRetorno]);
  }
}
