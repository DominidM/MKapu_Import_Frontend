export class ComprobanteStorage {
  private static readonly STORAGE_KEY = 'comprobante_imprimir';
  private static readonly RUTA_KEY = 'comprobante_ruta_retorno';

  static guardar(comprobante: any, rutaRetorno: string): void {
    try {
      sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(comprobante));
      sessionStorage.setItem(this.RUTA_KEY, rutaRetorno);
    } catch (error) {
      console.error('Error al guardar comprobante:', error);
    }
  }

  static obtenerComprobante(): any | null {
    const storedData = sessionStorage.getItem(this.STORAGE_KEY);
    if (storedData) {
      try {
        return JSON.parse(storedData);
      } catch (error) {
        console.error('Error al parsear comprobante:', error);
        return null;
      }
    }
    return null;
  }

  static obtenerRutaRetorno(): string {
    return sessionStorage.getItem(this.RUTA_KEY) || '/ventas/historial-ventas';
  }

  static limpiar(): void {
    sessionStorage.removeItem(this.STORAGE_KEY);
    sessionStorage.removeItem(this.RUTA_KEY);
  }
}
