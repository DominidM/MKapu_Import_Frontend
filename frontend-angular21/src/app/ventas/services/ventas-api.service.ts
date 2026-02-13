import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../enviroments/enviroment';
import { 
  ClienteBusquedaResponse,
  ClienteErrorResponse,
  RegistroVentaRequest, 
  RegistroVentaResponse,
  ItemVenta,
  OPERATION_TYPE_VENTA_INTERNA,
  CURRENCY_PEN,
  IGV_RATE
} from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class VentasApiService {
  private readonly API_URL = `${environment.apiUrl}/sales`;

  constructor(private http: HttpClient) {}

  buscarClientePorDocumento(numeroDocumento: string): Observable<ClienteBusquedaResponse> {
    return this.http.get<ClienteBusquedaResponse>(
      `${this.API_URL}/customers/document/${numeroDocumento}`
    ).pipe(
      catchError(this.handleErrorCliente)
    );
  }

  registrarVenta(venta: RegistroVentaRequest): Observable<RegistroVentaResponse> {
    return this.http.post<RegistroVentaResponse>(
      `${this.API_URL}/receipts`, 
      venta
    ).pipe(
      catchError(this.handleErrorVenta)
    );
  }

  construirRequestVenta(params: {
    customerId: string;
    receiptTypeId: number;
    subtotal: number;
    igv: number;
    total: number;
    responsibleId: string;
    branchId: number;
    paymentMethodId: number;
    operationNumber: string | null;
    items: ItemVenta[];
    dueDate?: string | null;
  }): RegistroVentaRequest {
    const fechaVencimiento = params.dueDate || new Date().toISOString();

    return {
      customerId: params.customerId,
      saleTypeId: 1,
      receiptTypeId: params.receiptTypeId,
      dueDate: fechaVencimiento,
      operationType: OPERATION_TYPE_VENTA_INTERNA,
      subtotal: params.subtotal,
      igv: params.igv,
      isc: 0.00,
      total: params.total,
      currencyCode: CURRENCY_PEN,
      responsibleId: params.responsibleId,
      branchId: params.branchId,
      paymentMethodId: params.paymentMethodId,
      operationNumber: params.operationNumber,
      items: params.items
    };
  }

  calcularSubtotal(items: ItemVenta[]): number {
    const totalBruto = items.reduce((sum, item) => sum + item.total, 0);
    return totalBruto / (1 + IGV_RATE);
  }

  calcularIGV(subtotal: number): number {
    return subtotal * IGV_RATE;
  }

  calcularTotal(subtotal: number, igv: number): number {
    return subtotal + igv;
  }

  construirItemVenta(params: {
    productId: string;
    quantity: number;
    unitPrice: number;
    description: string;
  }): ItemVenta {
    const total = params.quantity * params.unitPrice;
    return {
      productId: params.productId,
      quantity: params.quantity,
      unitPrice: params.unitPrice,
      description: params.description,
      total: total,
      igv: 0.00
    };
  }

  private handleErrorCliente(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ocurrió un error desconocido';

    if (error.status === 404) {
      const errorBody = error.error as ClienteErrorResponse;
      errorMessage = errorBody.message || 'Cliente no encontrado';
    } else if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = error.error?.message || `Error ${error.status}: ${error.statusText}`;
    }

    console.error('Error búsqueda cliente:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  private handleErrorVenta(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ocurrió un error al procesar la venta';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = error.error?.message || `Error ${error.status}: ${error.statusText}`;
    }

    console.error('Error registro venta:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
