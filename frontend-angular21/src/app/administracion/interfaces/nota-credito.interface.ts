export interface NotaCredito {
  id: number;
  correlativo: string;
  fechaEmision: string;
  comprobanteModificado: string;
  motivo: string;
  total: number;
  estado: string;
  cliente: string;
}

export interface CrearNotaCreditoDto {
  ventaId: number;
  tipoNotaCreditoId: number;
  motivo: string;
  detalles: DetalleNotaCreditoDto[];
}

export interface DetalleNotaCreditoDto {
  productoId: number;
  cantidad: number;
  precioUnitario: number;
}
