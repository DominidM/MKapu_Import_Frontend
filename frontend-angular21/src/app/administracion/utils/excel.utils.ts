import * as XLSX from 'xlsx';

export class ExcelUtils {
  /**
   * Exporta datos a Excel con formato y estilos
   * @param data Array de objetos con los datos a exportar
   * @param nombreArchivo Nombre del archivo (sin extensión)
   * @param nombreHoja Nombre de la hoja de Excel
   */
  static exportarAExcel(
    data: any[],
    nombreArchivo: string,
    nombreHoja: string = 'Datos'
  ): void {
    if (data.length === 0) {
      console.warn('No hay datos para exportar');
      return;
    }

    // Crear worksheet y workbook
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, nombreHoja);

    // Ajustar anchos de columna automáticamente
    const colWidths = this.calcularAnchoColumnas(data);
    worksheet['!cols'] = colWidths;

    // Descargar el archivo
    XLSX.writeFile(workbook, `${nombreArchivo}.xlsx`);
  }

  /**
   * Calcula el ancho óptimo de las columnas
   */
  private static calcularAnchoColumnas(data: any[]): Array<{ wch: number }> {
    if (data.length === 0) return [];

    const keys = Object.keys(data[0]);
    return keys.map((key) => {
      const maxLength = Math.max(
        key.length,
        ...data.map((row) => String(row[key] || '').length)
      );
      return { wch: Math.min(maxLength + 2, 50) };
    });
  }

  /**
   * Genera nombre de archivo con fecha actual
   */
  static generarNombreConFecha(prefijo: string): string {
    const fecha = new Date().toISOString().split('T')[0];
    return `${prefijo}_${fecha}`;
  }
}
