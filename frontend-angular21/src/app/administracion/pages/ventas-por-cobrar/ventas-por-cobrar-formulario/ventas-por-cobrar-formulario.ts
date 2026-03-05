import { Component, OnInit, signal, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DatePickerModule } from 'primeng/datepicker';
import { TextareaModule } from 'primeng/textarea';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';

import {
  AccountReceivableService,
  CreateAccountReceivablePayload,
} from '../../../services/account-receivable.service';
import { VentaService } from '../../../../ventas/services/venta.service';
import { QuoteService } from '../../../services/quote.service';
import { Quote } from '../../../interfaces/quote.interface';
import { firstValueFrom } from 'rxjs';

interface PaymentType {
  id:          number;
  codSunat:    string;
  descripcion: string;
}

interface SunatCurrency {
  codigo:      string;
  descripcion: string;
}

@Component({
  selector: 'app-ventas-por-cobrar-formulario',
  standalone: true,
  providers: [MessageService],
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    ToastModule, ButtonModule, CardModule, SelectModule,
    InputTextModule, InputNumberModule, DatePickerModule,
    TextareaModule, TooltipModule, TagModule,
  ],
  templateUrl: './ventas-por-cobrar-formulario.html',
  styleUrl: './ventas-por-cobrar-formulario.css',
})
export class VentasPorCobrarFormulario implements OnInit {

  private fb             = inject(FormBuilder);
  private router         = inject(Router);
  private route          = inject(ActivatedRoute);
  private messageService = inject(MessageService);
  private ventaService   = inject(VentaService);
  private quoteService   = inject(QuoteService);
  readonly arService     = inject(AccountReceivableService);

  isSubmitting     = signal(false);
  loadingCatalogos = signal(false);
  loadingCotizacion = signal(false);

  // Cotización pre-cargada (para mostrar resumen)
  cotizacionOrigen = signal<Quote | null>(null);
  cotizacionId     = signal<number | null>(null);

  tiposPago = signal<PaymentType[]>([]);
  monedas   = signal<SunatCurrency[]>([]);

  readonly manana: Date = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d;
  })();

  form: FormGroup = this.fb.group({
    salesReceiptId: [null, [Validators.required, Validators.min(1)]],
    userRef:        ['',   Validators.required],
    totalAmount:    [null, [Validators.required, Validators.min(0.01)]],
    dueDate:        [null, Validators.required],
    paymentTypeId:  [null, Validators.required],
    currencyCode:   ['PEN', Validators.required],
    observation:    [''],
  });

  async ngOnInit() {
    // 1. Cargar catálogos
    this.loadingCatalogos.set(true);
    try {
      const [tiposPago, monedas] = await Promise.all([
        firstValueFrom(this.ventaService.getPaymentTypes()),
        firstValueFrom(this.ventaService.getCurrencies()),
      ]);
      this.tiposPago.set(tiposPago);
      this.monedas.set(monedas);
    } catch {
      this.messageService.add({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'No se pudieron cargar los catálogos.',
      });
    } finally {
      this.loadingCatalogos.set(false);
    }

    // 2. Leer query params y pre-cargar cotización
    const params = this.route.snapshot.queryParams;
    const cotizacionIdRaw = params['cotizacion'];
    const tipo            = params['tipo']; // 'credito' | 'contado'

    if (cotizacionIdRaw) {
      const id = Number(cotizacionIdRaw);
      this.cotizacionId.set(id);
      await this.preCargarCotizacion(id);
    }
  }

  private async preCargarCotizacion(id: number): Promise<void> {
    this.loadingCotizacion.set(true);
    try {
      const cotizacion = await firstValueFrom(this.quoteService.getQuoteById(id));
      this.cotizacionOrigen.set(cotizacion);

      // Pre-rellenar campos del form
      this.form.patchValue({
        userRef:      cotizacion.cliente?.valor_doc ?? cotizacion.cliente?.nombre_cliente ?? '',
        totalAmount:  cotizacion.total,
        currencyCode: 'PEN',
        observation:  `Venta por cobrar generada desde cotización #${cotizacion.id_cotizacion}`,
      });

      // salesReceiptId se deshabilita hasta que se cree el receipt al guardar
      this.form.get('salesReceiptId')?.disable();

    } catch {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo cargar la cotización. Verifique el ID.',
      });
    } finally {
      this.loadingCotizacion.set(false);
    }
  }

  async guardar() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    this.isSubmitting.set(true);
    const raw = this.form.getRawValue();

    try {
      // Paso 1: Crear SalesReceipt en estado PENDIENTE vinculado a la cotización
      // TODO: reemplazar con el payload real que espera tu endpoint POST /receipts
      // const receipt = await firstValueFrom(this.ventaService.createReceipt({
      //   id_cotizacion: this.cotizacionId(),
      //   estado: 'PENDIENTE',
      //   monto_total: raw.totalAmount,
      //   moneda: raw.currencyCode,
      //   ...
      // }));
      // const salesReceiptId = receipt.id;

      // Mientras el endpoint de receipt esté listo, usamos el campo manual si no viene de cotización
      const salesReceiptId: number = raw.salesReceiptId;

      // Paso 2: Crear AccountReceivable vinculada al receipt
      const payload: CreateAccountReceivablePayload = {
        salesReceiptId,
        userRef:       raw.userRef,
        totalAmount:   raw.totalAmount,
        dueDate:       this._formatDate(raw.dueDate),
        paymentTypeId: raw.paymentTypeId,
        currencyCode:  raw.currencyCode,
        observation:   raw.observation?.trim() || undefined,
      };

      const res = await this.arService.create(payload);

      if (res) {
        // Paso 3: Cambiar estado de la cotización a APROBADA
        if (this.cotizacionId()) {
          await firstValueFrom(
            this.quoteService.updateQuoteStatus(this.cotizacionId()!, 'APROBADA')
          );
        }

        this.messageService.add({
          severity: 'success',
          summary: '¡Venta por cobrar creada!',
          detail: `Cuenta #${res.id} registrada. La cotización fue marcada como APROBADA.`,
        });
        setTimeout(() => this.router.navigate(['/admin/ventas-por-cobrar']), 1600);
      } else {
        throw new Error(this.arService.error() ?? 'Error desconocido');
      }

    } catch (err: any) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error al guardar',
        detail: err?.message ?? 'No se pudo crear la venta por cobrar.',
      });
    } finally {
      this.isSubmitting.set(false);
    }
  }

  cancelar() { this.router.navigate(['/admin/ventas-por-cobrar']); }

  private _formatDate(date: Date | string): string {
    const d = date instanceof Date ? date : new Date(date);
    return d.toISOString().split('T')[0];
  }

  isInvalid(campo: string): boolean {
    const c = this.form.get(campo);
    return !!(c?.invalid && c?.touched);
  }
}