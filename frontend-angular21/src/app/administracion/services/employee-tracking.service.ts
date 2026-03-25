import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { environment } from '../../../enviroments/enviroment';

export interface EmployeeTrackingFilters {
  dateFrom?: string;
  dateTo?: string;
}

interface UserWithAccountResponse {
  usuario: {
    id_usuario: number;
    usu_nom: string;
    ape_pat: string;
    ape_mat: string;
    dni: string;
    activo: boolean;
    sedeNombre?: string;
    rolNombre?: string;
  };
  cuenta_usuario: {
    rolNombre?: string;
  } | null;
}

interface EmployeeSalesPageResponse {
  ventas: EmployeeSaleResponse[];
  totalVentas: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface EmployeeQuotesPageResponse {
  cotizaciones: EmployeeQuoteResponse[];
  totalCotizaciones: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface EmployeeCommissionsPageResponse {
  comisiones: EmployeeCommissionResponse[];
  totalComisiones: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface EmployeeSaleResponse {
  nroComprobante: string;
  cliente: string;
  fecha: string;
  total: number;
  estado: string;
}

interface EmployeeQuoteResponse {
  codigo: string;
  cliente: string;
  fecha: string;
  total: number;
  estado: string;
}

interface EmployeeCommissionResponse {
  idComision: number;
  comprobante: string;
  sede: string;
  monto: number;
  porcentaje: number;
  fecha: string;
  estado: string;
}

export interface EmployeeTrackedSale {
  nroComprobante: string;
  cliente: string;
  fecha: Date;
  total: number;
  estado: string;
}

export interface EmployeeTrackedQuote {
  codigo: string;
  cliente: string;
  fecha: Date;
  total: number;
  estado: string;
}

export interface EmployeeTrackedCommission {
  idComision: number;
  comprobante: string;
  sede: string;
  monto: number;
  porcentaje: number;
  fecha: Date;
  estado: string;
}

export interface EmployeeTrackingEmployee {
  nombre: string;
  apellidos: string;
  dni: string;
  rol: string;
  sede: string;
  activo: boolean;
}

export interface EmployeeMonthlyTrend {
  label: string;
  salesTotal: number;
  commissionsTotal: number;
}

export interface EmployeeTrackingData {
  employee: EmployeeTrackingEmployee;
  sales: EmployeeTrackedSale[];
  quotes: EmployeeTrackedQuote[];
  commissions: EmployeeTrackedCommission[];
  totalSales: number;
  totalQuotes: number;
  approvedQuotes: number;
  totalCommissions: number;
  salesAmount: number;
  commissionsAmount: number;
  monthlyTrend: EmployeeMonthlyTrend[];
}

@Injectable({ providedIn: 'root' })
export class EmployeeTrackingService {
  private readonly http = inject(HttpClient);
  private readonly usersUrl = `${environment.apiUrl}/admin/users`;
  private readonly aggregationLimit = 100;

  getEmployeeTracking(
    userId: number,
    filters: EmployeeTrackingFilters,
  ): Observable<EmployeeTrackingData> {
    return forkJoin({
      user: this.getUserWithAccount(userId),
      firstSalesPage: this.getUserSales(userId, filters, 1),
      firstQuotesPage: this.getUserQuotes(userId, filters, 1),
      firstCommissionsPage: this.getUserCommissions(userId, filters, 1),
    }).pipe(
      switchMap(
        ({ user, firstSalesPage, firstQuotesPage, firstCommissionsPage }) =>
          forkJoin({
            remainingSalesPages: this.getRemainingPages(
              firstSalesPage.totalPages,
              (page) => this.getUserSales(userId, filters, page),
            ),
            remainingQuotesPages: this.getRemainingPages(
              firstQuotesPage.totalPages,
              (page) => this.getUserQuotes(userId, filters, page),
            ),
            remainingCommissionsPages: this.getRemainingPages(
              firstCommissionsPage.totalPages,
              (page) => this.getUserCommissions(userId, filters, page),
            ),
          }).pipe(
            map(
              ({
                remainingSalesPages,
                remainingQuotesPages,
                remainingCommissionsPages,
              }) =>
                this.buildTrackingData(
                  user,
                  [firstSalesPage, ...remainingSalesPages],
                  [firstQuotesPage, ...remainingQuotesPages],
                  [firstCommissionsPage, ...remainingCommissionsPages],
                ),
            ),
          ),
      ),
    );
  }

  private getUserWithAccount(
    userId: number,
  ): Observable<UserWithAccountResponse> {
    return this.http.get<UserWithAccountResponse>(
      `${this.usersUrl}/${userId}/full`,
    );
  }

  private getUserSales(
    userId: number,
    filters: EmployeeTrackingFilters,
    page: number,
  ): Observable<EmployeeSalesPageResponse> {
    return this.http.get<EmployeeSalesPageResponse>(
      `${this.usersUrl}/${userId}/sales`,
      {
        params: this.buildTrackingParams(filters, page),
      },
    );
  }

  private getUserQuotes(
    userId: number,
    filters: EmployeeTrackingFilters,
    page: number,
  ): Observable<EmployeeQuotesPageResponse> {
    return this.http.get<EmployeeQuotesPageResponse>(
      `${this.usersUrl}/${userId}/quotes`,
      {
        params: this.buildTrackingParams(filters, page),
      },
    );
  }

  private getUserCommissions(
    userId: number,
    filters: EmployeeTrackingFilters,
    page: number,
  ): Observable<EmployeeCommissionsPageResponse> {
    return this.http.get<EmployeeCommissionsPageResponse>(
      `${this.usersUrl}/${userId}/commissions`,
      {
        params: this.buildTrackingParams(filters, page),
      },
    );
  }

  private buildTrackingParams(
    filters: EmployeeTrackingFilters,
    page: number,
  ): HttpParams {
    let params = new HttpParams()
      .set('page', String(page))
      .set('limit', String(this.aggregationLimit));

    if (filters.dateFrom) {
      params = params.set('dateFrom', filters.dateFrom);
    }

    if (filters.dateTo) {
      params = params.set('dateTo', filters.dateTo);
    }

    return params;
  }

  private getRemainingPages<T>(
    totalPages: number,
    fetchPage: (page: number) => Observable<T>,
  ): Observable<T[]> {
    if (totalPages <= 1) {
      return of([]);
    }

    const requests = Array.from({ length: totalPages - 1 }, (_, index) =>
      fetchPage(index + 2),
    );

    return forkJoin(requests);
  }

  private buildTrackingData(
    userResponse: UserWithAccountResponse,
    salesPages: EmployeeSalesPageResponse[],
    quotePages: EmployeeQuotesPageResponse[],
    commissionPages: EmployeeCommissionsPageResponse[],
  ): EmployeeTrackingData {
    const sales = salesPages.flatMap((page) => page.ventas).map((sale) => this.mapSale(sale));
    const quotes = quotePages.flatMap((page) => page.cotizaciones).map((quote) => this.mapQuote(quote));
    const commissions = commissionPages
      .flatMap((page) => page.comisiones)
      .map((commission) => this.mapCommission(commission));

    const salesAmount = sales.reduce((sum, sale) => sum + sale.total, 0);
    const commissionsAmount = commissions.reduce((sum, commission) => sum + commission.monto, 0);
    const approvedQuotes = quotes.filter(
      (quote) => quote.estado.toUpperCase() === 'APROBADA',
    ).length;

    return {
      employee: this.mapEmployee(userResponse),
      sales,
      quotes,
      commissions,
      totalSales: salesPages[0]?.totalVentas ?? 0,
      totalQuotes: quotePages[0]?.totalCotizaciones ?? 0,
      approvedQuotes,
      totalCommissions: commissionPages[0]?.totalComisiones ?? 0,
      salesAmount,
      commissionsAmount,
      monthlyTrend: this.buildMonthlyTrend(sales, commissions),
    };
  }

  private mapEmployee(
    response: UserWithAccountResponse,
  ): EmployeeTrackingEmployee {
    const { usuario, cuenta_usuario } = response;

    return {
      nombre: usuario.usu_nom ?? '',
      apellidos: `${usuario.ape_pat ?? ''} ${usuario.ape_mat ?? ''}`.trim(),
      dni: usuario.dni ?? '-',
      rol: cuenta_usuario?.rolNombre ?? usuario.rolNombre ?? 'SIN ROL',
      sede: usuario.sedeNombre ?? 'SIN SEDE',
      activo: Boolean(usuario.activo),
    };
  }

  private mapSale(sale: EmployeeSaleResponse): EmployeeTrackedSale {
    return {
      nroComprobante: sale.nroComprobante,
      cliente: sale.cliente,
      fecha: new Date(sale.fecha),
      total: Number(sale.total ?? 0),
      estado: sale.estado,
    };
  }

  private mapQuote(quote: EmployeeQuoteResponse): EmployeeTrackedQuote {
    return {
      codigo: quote.codigo,
      cliente: quote.cliente,
      fecha: new Date(quote.fecha),
      total: Number(quote.total ?? 0),
      estado: quote.estado,
    };
  }

  private mapCommission(
    commission: EmployeeCommissionResponse,
  ): EmployeeTrackedCommission {
    return {
      idComision: Number(commission.idComision),
      comprobante: commission.comprobante,
      sede: commission.sede,
      monto: Number(commission.monto ?? 0),
      porcentaje: Number(commission.porcentaje ?? 0),
      fecha: new Date(commission.fecha),
      estado: commission.estado,
    };
  }

  private buildMonthlyTrend(
    sales: EmployeeTrackedSale[],
    commissions: EmployeeTrackedCommission[],
  ): EmployeeMonthlyTrend[] {
    const buckets = new Map<
      string,
      { date: Date; salesTotal: number; commissionsTotal: number }
    >();

    for (const sale of sales) {
      const bucketDate = new Date(sale.fecha.getFullYear(), sale.fecha.getMonth(), 1);
      const key = this.buildMonthKey(bucketDate);
      const current = buckets.get(key) ?? {
        date: bucketDate,
        salesTotal: 0,
        commissionsTotal: 0,
      };
      current.salesTotal += sale.total;
      buckets.set(key, current);
    }

    for (const commission of commissions) {
      const bucketDate = new Date(
        commission.fecha.getFullYear(),
        commission.fecha.getMonth(),
        1,
      );
      const key = this.buildMonthKey(bucketDate);
      const current = buckets.get(key) ?? {
        date: bucketDate,
        salesTotal: 0,
        commissionsTotal: 0,
      };
      current.commissionsTotal += commission.monto;
      buckets.set(key, current);
    }

    return [...buckets.entries()]
      .sort((a, b) => a[1].date.getTime() - b[1].date.getTime())
      .map(([, value]) => ({
        label: this.formatMonthLabel(value.date),
        salesTotal: value.salesTotal,
        commissionsTotal: value.commissionsTotal,
      }));
  }

  private buildMonthKey(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }

  private formatMonthLabel(date: Date): string {
    const label = date
      .toLocaleDateString('es-PE', { month: 'short', year: '2-digit' })
      .replace('.', '');

    return label.charAt(0).toUpperCase() + label.slice(1);
  }
}
