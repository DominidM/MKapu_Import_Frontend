import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Sede } from '../services/sede.service';

export interface ComprobanteItemPDF {
  codigo: string;
  descripcion: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

export interface ComprobantePDF {
  tipo_comprobante: '01' | '03';
  serie: string;
  numero: number;
  cliente_nombre: string;
  cliente_doc: string;
  fecha: Date;
  items: ComprobanteItemPDF[];
  subtotal: number;
  igv: number;
  total: number;
  tipo_pago: string;
}

export class PDFHelper {
  
  static generarTicketVenta(comprobante: ComprobantePDF, sede: Sede): jsPDF | null {
    if (!comprobante || !sede) {
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

    // 🏢 HEADER
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(sede.nombre.toUpperCase(), centerX, y, { align: 'center' });
    y += 5.5;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(82, 82, 82);
    doc.text(sede.razon_social, centerX, y, { align: 'center' });
    y += 3.5;

    doc.setFontSize(7.5);
    doc.text(`RUC: ${sede.ruc}`, centerX, y, { align: 'center' });
    y += 6;

    this.dibujarLineaPunteada(doc, leftMargin, y, rightMargin, y, 1.5);
    y += 6;

    // 🎫 TIPO DE COMPROBANTE
    const tipoText = comprobante.tipo_comprobante === '03' ? 'BOLETA DE VENTA' : 'FACTURA ELECTRÓNICA';
    const numeroFormateado = comprobante.numero.toString().padStart(8, '0');
    const serieNumero = `${comprobante.serie}-${numeroFormateado}`;

    doc.setFillColor(245, 245, 245);
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.rect(leftMargin + 2, y - 2, rightMargin - leftMargin - 4, 10, 'FD');

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(tipoText, centerX, y + 2, { align: 'center' });

    doc.setFontSize(12);
    doc.text(serieNumero, centerX, y + 7, { align: 'center' });
    y += 12;

    this.dibujarLineaPunteada(doc, leftMargin, y, rightMargin, y, 1.5);
    y += 6;

    // 📍 DATOS DE LA SEDE
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(82, 82, 82);
    
    doc.text('RUC:', leftMargin + 2, y);
    doc.setTextColor(38, 38, 38);
    doc.text(sede.ruc, leftMargin + 17, y);
    y += 3.5;

    doc.setTextColor(82, 82, 82);
    doc.text('Dirección:', leftMargin + 2, y);
    doc.setTextColor(38, 38, 38);
    const direccion = sede.direccion.length > 35 
      ? sede.direccion.substring(0, 35) + '...' 
      : sede.direccion;
    doc.text(direccion, leftMargin + 17, y);
    y += 3.5;

    doc.setTextColor(82, 82, 82);
    doc.text('Teléfono:', leftMargin + 2, y);
    doc.setTextColor(38, 38, 38);
    doc.text(sede.telefono, leftMargin + 17, y);
    y += 4;

    this.dibujarLineaPunteada(doc, leftMargin, y, rightMargin, y, 1);
    y += 4.5;

    // 👤 DATOS DEL CLIENTE
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');

    doc.setTextColor(82, 82, 82);
    doc.text('Cliente:', leftMargin + 2, y);
    doc.setTextColor(0, 0, 0);
    const nombreCliente = comprobante.cliente_nombre.length > 30 
      ? comprobante.cliente_nombre.substring(0, 30) + '...' 
      : comprobante.cliente_nombre;
    doc.text(nombreCliente, leftMargin + 17, y);
    y += 3.5;

    doc.setTextColor(82, 82, 82);
    doc.text('Documento:', leftMargin + 2, y);
    doc.setTextColor(0, 0, 0);
    doc.text(comprobante.cliente_doc, leftMargin + 17, y);
    y += 3.5;

    const fecha = new Date(comprobante.fecha);
    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const anio = fecha.getFullYear();
    const horas = fecha.getHours().toString().padStart(2, '0');
    const minutos = fecha.getMinutes().toString().padStart(2, '0');
    const fechaFormateada = `${dia}/${mes}/${anio} ${horas}:${minutos}`;

    doc.setTextColor(82, 82, 82);
    doc.text('Fecha:', leftMargin + 2, y);
    doc.setTextColor(0, 0, 0);
    doc.text(fechaFormateada, leftMargin + 17, y);
    y += 6;

    this.dibujarLineaPunteada(doc, leftMargin, y, rightMargin, y, 1);
    y += 6;

    // 🛒 PRODUCTOS
    const productos = comprobante.items.map(item => [
      item.descripcion.substring(0, 25),
      item.cantidad.toString(),
      item.precio_unitario.toFixed(2),
      item.subtotal.toFixed(2)
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

    // 💰 TOTALES
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');

    doc.setTextColor(82, 82, 82);
    doc.text('SUBTOTAL:', leftMargin + 2, y);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text(`S/. ${comprobante.subtotal.toFixed(2)}`, rightMargin - 2, y, { align: 'right' });
    y += 4;

    if (comprobante.igv > 0) {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(82, 82, 82);
      doc.text('IGV (18%):', leftMargin + 2, y);
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'bold');
      doc.text(`S/. ${comprobante.igv.toFixed(2)}`, rightMargin - 2, y, { align: 'right' });
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
    doc.text(`S/. ${comprobante.total.toFixed(2)}`, rightMargin - 2, y, { align: 'right' });
    y += 3.5;

    doc.setLineWidth(0.25);
    doc.line(leftMargin + 2, y, rightMargin - 2, y);
    y += 6;

    // 💳 FORMA DE PAGO
    const formasPago: { [key: string]: string } = {
      '01': 'EFECTIVO', '02': 'TARJETA', '03': 'YAPE', '04': 'PLIN', '05': 'TRANSFERENCIA',
      'EFECTIVO': 'EFECTIVO', 'TARJETA': 'TARJETA', 'YAPE': 'YAPE', 'PLIN': 'PLIN', 'TRANSFERENCIA': 'TRANSFERENCIA'
    };
    const formaPago = formasPago[comprobante.tipo_pago] || 'EFECTIVO';

    doc.setFillColor(245, 245, 245);
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.rect(leftMargin + 2, y - 3, rightMargin - leftMargin - 4, 6.5, 'FD');

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(38, 38, 38);
    doc.text('PAGO:', leftMargin + 4, y + 1);
    doc.text(formaPago, rightMargin - 4, y + 1, { align: 'right' });

    y += 8;

    this.dibujarLineaPunteada(doc, leftMargin, y, rightMargin, y, 1);
    y += 5;

    // 🎉 FOOTER
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

  static abrirPDFEnNuevaVentana(doc: jsPDF): void {
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, '_blank');
    setTimeout(() => URL.revokeObjectURL(pdfUrl), 100);
  }

  static descargarPDF(doc: jsPDF, nombreArchivo: string): void {
    doc.save(nombreArchivo);
  }

  private static dibujarLineaPunteada(
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
}
