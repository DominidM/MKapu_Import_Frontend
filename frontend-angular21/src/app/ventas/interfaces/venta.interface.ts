// src/app/ventas/interfaces/venta.interface.ts

export interface ClienteBusquedaResponse {
  customerId: string;
  documentTypeId: number;
  documentTypeDescription: string;
  documentTypeSunatCode: string;
  documentValue: string;
  name: string;
  address: string;
  email: string;
  phone: string;
  status: boolean;
  displayName: string;
  invoiceType: 'BOLETA' | 'FACTURA';
}

export interface ClienteErrorResponse {
  message: string;
  error: string;
  statusCode: number;
}

export interface MetodoPago {
  id: number;
  code: string;
  description: string;
}

export interface TipoComprobante {
  id: number;
  description: string;
  observation: string;
}

export interface ItemVenta {
  productId: string;
  quantity: number;
  unitPrice: number;
  description: string;
  total: number;
  igv?: number;
}

export interface RegistroVentaRequest {
  customerId: string;
  saleTypeId: number;
  receiptTypeId: number;
  dueDate: string | null;
  operationType: string;
  subtotal: number;
  igv: number;
  isc: number;
  total: number;
  currencyCode: string;
  responsibleId: string;
  branchId: number;
  paymentMethodId: number;
  operationNumber: string | null;
  items: ItemVenta[];
}

export interface RegistroVentaResponse {
  success: boolean;
  message: string;
  data: {
    receiptId: string;
    receiptNumber: string;
    serie: string;
    total: number;
    createdAt: string;
  };
}

export const METODOS_PAGO: MetodoPago[] = [
  { id: 1, code: '008', description: 'EFECTIVO' },
  { id: 2, code: '005', description: 'TARJETA DE DÉBITO' },
  { id: 3, code: '006', description: 'TARJETA DE CRÉDITO' },
  { id: 4, code: '003', description: 'TRANSFERENCIA DE FONDOS (yape/plin)' },
  { id: 5, code: '001', description: 'DEPÓSITO EN CUENTA' }
];

export const TIPOS_COMPROBANTE: TipoComprobante[] = [
  { id: 1, description: 'Factura', observation: 'Requiere RUC en el cliente' },
  { id: 2, description: 'Boleta', observation: 'Serie B001 por defecto' }
];

export const OPERATION_TYPE_VENTA_INTERNA = '0101';
export const CURRENCY_PEN = 'PEN';
export const IGV_RATE = 0.18;
