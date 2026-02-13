export interface ClienteBusquedaResponse {
  customerId: string;
  name: string;
  documentValue: string;
  invoiceType: 'BOLETA' | 'FACTURA';
  status: boolean;
  documentTypeId?: number;
  documentTypeDescription?: string;
  documentTypeSunatCode?: string;
  address?: string;
  email?: string;
  phone?: string;
  displayName?: string;
}

export interface ClienteErrorResponse {
  message: string;
  error: string;
  statusCode: number;
}
