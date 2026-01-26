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
  descuento?: number;
  tipo_venta?: string;
  atendido_por?: string;
  motivo?: string;
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
      format: [80, 297],
    });

    let y = 8;
    const pageWidth = doc.internal.pageSize.getWidth();
    const centerX = pageWidth / 2;
    const leftMargin = 5;
    const rightMargin = 75;

    doc.setTextColor(0, 0, 0);
    doc.setDrawColor(0, 0, 0);

    y += 5;


    const dibujarTextoGrueso = (
      texto: string,
      x: number,
      yPos: number,
      fontSize: number,
      alineacion: 'center' | 'right' | 'left' = 'center',
    ) => {
      doc.setFontSize(fontSize);
      doc.setFont('helvetica', 'bold');
      doc.text(texto, x, yPos, { align: alineacion });
      doc.text(texto, x + 0.3, yPos, { align: alineacion });
      doc.text(texto, x, yPos + 0.1, { align: alineacion });
      doc.text(texto, x + 0.3, yPos + 0.1, { align: alineacion });
    };

    const palabras = sede.razon_social.split(' ');
    dibujarTextoGrueso(palabras[0].toUpperCase(), centerX, y, 26, 'center');
    y += 5;

    if (palabras[1]) {
      const segundaPalabra =
        palabras[1].charAt(0).toUpperCase() + palabras[1].slice(1).toLowerCase();
      dibujarTextoGrueso(segundaPalabra, centerX - 8, y, 13, 'center'); // Movi 8mm a la izquierda
    }
    y += 5;


    this.dibujarLineaPunteada(doc, leftMargin, y, rightMargin, y, 1.5);
    y += 7;

    const tipoText =
      comprobante.tipo_comprobante === '03' ? 'NOTA DE VENTA' : 'FACTURA ELECTRÓNICA';
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(tipoText, centerX, y, { align: 'center' });
    y += 5;

    this.dibujarLineaPunteada(doc, leftMargin, y, rightMargin, y, 1.5);
    y += 6;

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(sede.ruc, centerX, y, { align: 'center' });
    y += 3;

    const razonSocialCompleta = `${sede.razon_social.toUpperCase()} S.A.C.`;
    doc.setFont('helvetica', 'bold');
    doc.text(razonSocialCompleta, centerX, y, { align: 'center' });
    y += 3;

    doc.setFont('helvetica', 'normal');
    const direccionCompleta = `${sede.direccion}, ${sede.distrito} - ${sede.provincia}`;
    doc.text(direccionCompleta, centerX, y, { align: 'center' });
    y += 3;

    doc.text(`Celular: ${sede.telefono}`, centerX, y, { align: 'center' });
    y += 4;

    this.dibujarLineaPunteada(doc, leftMargin, y, rightMargin, y, 1.5);
    y += 5;

    const fecha = new Date(comprobante.fecha);
    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const anio = fecha.getFullYear();
    const horas = fecha.getHours().toString().padStart(2, '0');
    const minutos = fecha.getMinutes().toString().padStart(2, '0');
    const fechaHora = `${dia}/${mes}/${anio} ${horas}:${minutos}`;

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text(fechaHora, centerX, y, { align: 'center' });
    y += 3;

    const numeroFormateado = comprobante.numero.toString().padStart(8, '0');
    const serieNumero = `${comprobante.serie}-${numeroFormateado}`;
    doc.setFont('helvetica', 'bold');
    doc.text(serieNumero, centerX, y, { align: 'center' });
    y += 3;

    this.dibujarLineaPunteada(doc, leftMargin, y, rightMargin, y, 1.5);
    y += 5;

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text(comprobante.cliente_nombre.toUpperCase(), centerX, y, { align: 'center' });
    y += 3;

    doc.text(comprobante.cliente_doc, centerX, y, { align: 'center' });
    y += 3;

    this.dibujarLineaPunteada(doc, leftMargin, y, rightMargin, y, 1.5);
    y += 5;

    const tipoVenta = comprobante.tipo_venta || 'RECOJO EN TIENDA';
    doc.setFont('helvetica', 'bold');
    doc.text(tipoVenta, centerX, y, { align: 'center' });
    y += 3;

    this.dibujarLineaPunteada(doc, leftMargin, y, rightMargin, y, 1.5);
    y += 5;

    // 19. PRODUCTOS SIN BORDES CON LÍNEAS DE IGUALES

    // Línea superior (=====)
    this.dibujarLineasIguales(doc, leftMargin, y, rightMargin);
    y += 4.5;

    // Encabezados
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Descripción', leftMargin + 2, y);
    doc.text('Cant', leftMargin + 42, y, { align: 'center' });
    doc.text('P.Und', leftMargin + 52, y, { align: 'center' });
    doc.text('P.Total', rightMargin - 2, y, { align: 'right' });
    y += 3.5;

    // Línea separadora (=====)
    this.dibujarLineasIguales(doc, leftMargin, y, rightMargin);
    y += 6;

    // Productos SIN BORDES
    doc.setFont('helvetica', 'normal');
    comprobante.items.forEach((item) => {
      doc.setFontSize(6.5);
      const descripcion = item.descripcion.substring(0, 28);
      doc.text(descripcion, leftMargin + 2, y);
      doc.text(item.cantidad.toString(), leftMargin + 42, y, { align: 'center' });
      doc.text(item.precio_unitario.toFixed(2), leftMargin + 52, y, { align: 'center' });
      doc.text(item.subtotal.toFixed(2), rightMargin - 2, y, { align: 'right' });
      y += 3.5;
    });

    this.dibujarLineaPunteada(doc, leftMargin, y, rightMargin, y, 1.5);
    y += 5;

    if (comprobante.descuento && comprobante.descuento > 0) {
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.text('Descuento Gral.:', leftMargin + 2, y);
      doc.setFont('helvetica', 'bold');
      doc.text(`S/ ${comprobante.descuento.toFixed(2)}`, rightMargin - 2, y, { align: 'right' });
      y += 4;

      this.dibujarLineaPunteada(doc, leftMargin, y, rightMargin, y, 1.5);
      y += 5;
    }

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Total', leftMargin + 2, y);
    doc.text(`S/ ${comprobante.total.toFixed(2)}`, rightMargin - 2, y, { align: 'right' });
    y += 4;

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text('Pago', leftMargin + 2, y);
    doc.text(`S/ ${comprobante.total.toFixed(2)}`, rightMargin - 2, y, { align: 'right' });
    y += 5;

    this.dibujarLineaPunteada(doc, leftMargin, y, rightMargin, y, 1.5);
    y += 5;

    if (comprobante.motivo) {
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.text(comprobante.motivo.toUpperCase(), centerX, y, { align: 'center' });
      y += 5;

      this.dibujarLineaPunteada(doc, leftMargin, y, rightMargin, y, 1.5);
      y += 5;
    }

    if (comprobante.atendido_por) {
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.text('Atendido por:', centerX, y, { align: 'center' });
      y += 3;
      doc.setFont('helvetica', 'bold');
      doc.text(comprobante.atendido_por.toUpperCase(), centerX, y, { align: 'center' });
      y += 5;

      this.dibujarLineaPunteada(doc, leftMargin, y, rightMargin, y, 1.5);
      y += 5;
    }

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('**GRACIAS POR SU COMPRA**', centerX, y, { align: 'center' });
    y += 4;

    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);

    const mensajeGarantia =
      'Toda falla de fábrica tiene una garantía hasta 2 meses después de su compra (solo venta por unidad), debe acercarse a nuestro establecimiento para presentar su solicitud de garantía.';

    const lineasGarantia = doc.splitTextToSize(mensajeGarantia, rightMargin - leftMargin - 4);
    lineasGarantia.forEach((linea: string) => {
      doc.text(linea, centerX, y, { align: 'center' });
      y += 3;
    });

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
    espaciado: number = 1,
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

  private static dibujarLineasIguales(doc: jsPDF, x1: number, y1: number, x2: number): void {
    const espacioLetra = 1.25;
    let x = x1;
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.3);
    doc.setFont('helvetica', 'normal'); // Cambié a 'normal' para que no sea negrita
    doc.setFontSize(5);
    doc.setTextColor(100, 100, 100); // Gris suave para que se vea más suave

    while (x < x2) {
      doc.text('=', x, y1 + 0.5);
      x += espacioLetra;
    }
  }
}
