import { Injectable, inject } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../enviroments/enviroment';
import {
  ApproveTransferDto,
  ConfirmReceiptTransferDto,
  RequestTransferAggregatedDto,
  RejectTransferDto,
  TransferApiError,
  TransferByIdResponseDto,
  TransferConflictInfo,
  TransferListResponseDto,
  TransferResponseDto,
  TransferRole,
} from '../interfaces/transferencia.interface';
import { AuthService } from '../../auth/services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class TransferApiService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService, { optional: true });

  private readonly logisticsApi =
    environment.apiLogistics || environment.apiUrl || 'http://localhost:3005';
  private readonly transferBase = `${this.logisticsApi}/warehouse/transfer`;

  requestAggregated(
    dto: RequestTransferAggregatedDto,
    roleHeader: TransferRole,
    modeHeader: string = 'aggregated',
  ): Observable<TransferResponseDto> {
    return this.http
      .post<TransferResponseDto>(`${this.transferBase}/request`, dto, {
        headers: this.buildHeaders(roleHeader, modeHeader),
      })
      .pipe(catchError((error) => this.handleHttpError(error, 'No se pudo crear la transferencia')));
  }

  approve(
    id: number,
    dto: ApproveTransferDto,
    roleHeader: TransferRole,
  ): Observable<TransferResponseDto> {
    return this.http
      .patch<TransferResponseDto>(`${this.transferBase}/${id}/approve`, dto, {
        headers: this.buildHeaders(roleHeader),
      })
      .pipe(catchError((error) => this.handleHttpError(error, 'No se pudo aprobar la transferencia')));
  }

  confirmReceipt(
    id: number,
    dto: ConfirmReceiptTransferDto,
    roleHeader: TransferRole,
  ): Observable<TransferResponseDto> {
    return this.http
      .patch<TransferResponseDto>(`${this.transferBase}/${id}/confirm-receipt`, dto, {
        headers: this.buildHeaders(roleHeader),
      })
      .pipe(
        catchError((error) =>
          this.handleHttpError(error, 'No se pudo confirmar la recepción de la transferencia'),
        ),
      );
  }

  reject(
    id: number,
    dto: RejectTransferDto,
    roleHeader: TransferRole,
  ): Observable<TransferResponseDto> {
    return this.http
      .patch<TransferResponseDto>(`${this.transferBase}/${id}/reject`, dto, {
        headers: this.buildHeaders(roleHeader),
      })
      .pipe(
        catchError((error) => this.handleHttpError(error, 'No se pudo rechazar la transferencia')),
      );
  }

  listAll(): Observable<TransferListResponseDto[]> {
    return this.http
      .get<TransferListResponseDto[]>(this.transferBase, {
        headers: this.buildHeaders(),
      })
      .pipe(
        catchError((error) => this.handleHttpError(error, 'No se pudo listar transferencias')),
      );
  }

  listByHeadquarters(hqId: string): Observable<TransferResponseDto[]> {
    return this.http
      .get<TransferResponseDto[]>(`${this.transferBase}/headquarters/${hqId}`, {
        headers: this.buildHeaders(),
      })
      .pipe(
        catchError((error) =>
          this.handleHttpError(error, `No se pudo listar transferencias para sede ${hqId}`),
        ),
      );
  }

  getById(id: number): Observable<TransferByIdResponseDto> {
    return this.http
      .get<TransferByIdResponseDto>(`${this.transferBase}/${id}`, {
        headers: this.buildHeaders(),
      })
      .pipe(
        catchError((error) => this.handleHttpError(error, `No se pudo obtener transferencia #${id}`)),
      );
  }

  requestTransfer(dto: RequestTransferAggregatedDto): Observable<TransferResponseDto> {
    return this.requestAggregated(dto, 'JEFE DE ALMACEN');
  }

  approveTransfer(id: number, dto: ApproveTransferDto): Observable<TransferResponseDto> {
    return this.approve(id, dto, 'ADMINISTRADOR');
  }

  rejectTransfer(id: number, dto: RejectTransferDto): Observable<TransferResponseDto> {
    return this.reject(id, dto, 'ADMINISTRADOR');
  }

  listTransfers(): Observable<TransferListResponseDto[]> {
    return this.listAll();
  }

  listTransfersByHeadquarters(hqId: string): Observable<TransferResponseDto[]> {
    return this.listByHeadquarters(hqId);
  }

  getTransferById(id: number): Observable<TransferByIdResponseDto> {
    return this.getById(id);
  }

  private buildHeaders(role?: TransferRole, mode?: string): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    if (role) {
      headers = headers.set('x-role', role);
    }
    if (mode) {
      headers = headers.set('x-transfer-mode', mode);
    }

    const token = this.authService?.getToken?.() ?? localStorage.getItem('token');
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  private handleHttpError(
    error: HttpErrorResponse,
    contextMessage: string,
  ): Observable<never> {
    const backendMessage = this.getBackendMessage(error);
    const friendlyMessage = this.buildFriendlyMessage(error.status, backendMessage, contextMessage);
    const apiError: TransferApiError = {
      status: error.status || 0,
      message: friendlyMessage,
      backendMessage,
      conflict: error.status === 409 ? this.parseConflict(backendMessage) : undefined,
    };

    return throwError(() => apiError);
  }

  private getBackendMessage(error: HttpErrorResponse): string {
    const raw = error.error;

    if (typeof raw === 'string') {
      return raw;
    }

    if (raw && typeof raw === 'object') {
      const message = (raw as { message?: unknown }).message;

      if (Array.isArray(message)) {
        return message.filter(Boolean).join(' | ');
      }

      if (typeof message === 'string') {
        return message;
      }
    }

    return '';
  }

  private buildFriendlyMessage(status: number, backendMessage: string, contextMessage: string): string {
    if (status === 409) {
      return backendMessage || 'Insufficient stock for requested transfer quantity.';
    }

    if (backendMessage) {
      return `${contextMessage}. ${backendMessage}`;
    }

    switch (status) {
      case 0:
        return 'No hay conexión con el servidor de transferencias.';
      case 400:
        return `${contextMessage}. Revisa los datos enviados.`;
      case 401:
        return 'No autorizado. Inicia sesión nuevamente.';
      case 403:
        return 'No tienes permisos para esta acción.';
      case 404:
        return 'Transferencia no encontrada.';
      case 422:
        return `${contextMessage}. El servidor rechazó la operación.`;
      default:
        return `${contextMessage}. Ocurrió un error inesperado.`;
    }
  }

  private parseConflict(backendMessage: string): TransferConflictInfo | undefined {
    if (!backendMessage) {
      return undefined;
    }

    const match = backendMessage.match(
      /requested\s+(\d+),\s+available\s+(\d+)\s+for\s+productId\s+(\d+)\s+in\s+warehouse\s+(\d+)/i,
    );

    if (!match) {
      return undefined;
    }

    return {
      requested: Number(match[1]),
      available: Number(match[2]),
      productId: Number(match[3]),
      warehouseId: Number(match[4]),
    };
  }
}

@Injectable({
  providedIn: 'root',
})
export class TransferenciaService extends TransferApiService {}
