import {
  Component,
  OnInit,
  signal,
  computed,
  inject,
  DestroyRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';

import { PromotionsService } from '../../../services/promotions.service';
import { CategoriaService } from '../../../services/categoria.service';
import { CategoriaResponse } from '../../../interfaces/categoria.interface';

const PROMOTION_CONCEPT_PATTERN = /^[\p{L}\p{N} ]+$/u;
const PROMOTION_CONCEPT_CHAR_PATTERN = /^[\p{L}\p{N} ]$/u;
const PROMOTION_CONCEPT_TOAST_DETAIL =
  'El campo concepto no acepta caracteres especiales ni invisibles';
const PROMOTION_CONCEPT_TOAST_COOLDOWN_MS = 1200;

interface PromotionPayload {
  concepto: string;
  tipo: string;
  valor: number;
  activo: boolean;
  reglas: Array<{
    idRegla?: number;
    tipoCondicion: string;
    valorCondicion: string;
  }>;
  descuentosAplicados: Array<{
    idDescuento?: number;
    monto: number;
  }>;
}

function promotionConceptValidator(
  control: AbstractControl,
): ValidationErrors | null {
  const rawValue = control.value;

  if (typeof rawValue !== 'string') {
    return rawValue == null || rawValue === '' ? { required: true } : null;
  }

  const normalizedValue = rawValue
    .normalize('NFC')
    .trim()
    .replace(/ {2,}/g, ' ');

  if (!normalizedValue) {
    return { required: true };
  }

  if (!PROMOTION_CONCEPT_PATTERN.test(normalizedValue)) {
    return { invalidConcept: true };
  }

  if (normalizedValue.length < 3) {
    return {
      minlength: {
        requiredLength: 3,
        actualLength: normalizedValue.length,
      },
    };
  }

  if (normalizedValue.length > 100) {
    return {
      maxlength: {
        requiredLength: 100,
        actualLength: normalizedValue.length,
      },
    };
  }

  return null;
}

@Component({
  selector: 'app-promociones-formulario',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    ToastModule,
    ConfirmDialogModule,
    TooltipModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './promociones-formulario.html',
  styleUrl: './promociones-formulario.css',
})
export class PromocionesFormulario implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private promotionsService = inject(PromotionsService);
  private categoriaService = inject(CategoriaService);
  private messageService = inject(MessageService);
  private destroyRef = inject(DestroyRef);
  private lastConceptWarningAt = 0;
  private initialPayloadSnapshot: string | null = null;

  isSubmitting = signal(false);
  esModoEdicion = signal(false);
  idPromocion = signal<number | null>(null);
  mostrarInputValor = signal(true);
  hasMeaningfulChanges = signal(false);

  tiposPromocion = [
    { label: 'Porcentaje (%)', value: 'PORCENTAJE' },
    { label: 'Monto Fijo (S/)', value: 'MONTO' },
  ];

  tiposCondicion = [
    { label: 'Mínimo de compra', value: 'MINIMO_COMPRA' },
    { label: 'Cliente nuevo', value: 'CLIENTE_NUEVO' },
    { label: 'Categoría', value: 'CATEGORIA' },
    { label: 'Código de producto', value: 'PRODUCTO' },
  ];

  categorias = signal<{ label: string; value: string }[]>([]);

  form: FormGroup = this.fb.group({
    concepto: ['', [Validators.required, promotionConceptValidator]],
    tipo: ['PORCENTAJE', [Validators.required]],
    valor: [null, [Validators.required, Validators.min(0.01), Validators.max(100)]],
    activo: [true],
    reglas: this.fb.array([]),
    descuentosAplicados: this.fb.array([]),
  });

  get reglas(): FormArray {
    return this.form.get('reglas') as FormArray;
  }

  get descuentos(): FormArray {
    return this.form.get('descuentosAplicados') as FormArray;
  }

  tituloPrincipal = computed(() =>
    this.esModoEdicion() ? 'Editar Promoción' : 'Crear Promoción',
  );

  iconoCabecera = computed(() =>
    this.esModoEdicion() ? 'pi pi-pencil' : 'pi pi-plus',
  );

  esModoMonto = signal(false);

  ngOnInit(): void {
    this.cargarCategorias();

    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.esModoEdicion.set(true);
      this.idPromocion.set(id);
      this.cargarPromocion(id);
    }

    this.form
      .get('tipo')
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((tipo) => {
        this.esModoMonto.set(tipo === 'MONTO');
        this.reconstruirControlValor(tipo);
        this.actualizarEstadoCambios();
      });

    this.form.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.actualizarEstadoCambios());
  }

  onConceptoBeforeInput(event: InputEvent): void {
    if (!event.data || event.inputType.startsWith('delete')) {
      return;
    }

    if (this.esTextoConceptoValido(event.data)) {
      return;
    }

    event.preventDefault();
    this.mostrarToastConceptoInvalido();
  }

  onConceptoKeydown(event: KeyboardEvent): void {
    if (event.ctrlKey || event.metaKey || event.altKey || event.key.length !== 1) {
      return;
    }

    if (this.esTextoConceptoValido(event.key)) {
      return;
    }

    event.preventDefault();
    this.mostrarToastConceptoInvalido();
  }

  onConceptoPaste(event: ClipboardEvent): void {
    const pastedText = event.clipboardData?.getData('text') ?? '';

    if (!pastedText || this.esTextoConceptoValido(pastedText)) {
      return;
    }

    event.preventDefault();
    this.mostrarToastConceptoInvalido();
  }

  onConceptoInput(): void {
    const control = this.form.get('concepto');
    if (!control) {
      return;
    }

    const currentValue = String(control.value ?? '');
    const sanitizedValue = this.limpiarConcepto(currentValue);

    if (currentValue === sanitizedValue) {
      return;
    }

    control.setValue(sanitizedValue, { emitEvent: false });
    this.actualizarEstadoCambios();
    this.mostrarToastConceptoInvalido();
  }

  private reconstruirControlValor(
    tipo: string,
    valorInicial: number | null = null,
  ): void {
    const validators =
      tipo === 'MONTO'
        ? [Validators.required, Validators.min(0.01)]
        : [Validators.required, Validators.min(0.01), Validators.max(100)];

    this.mostrarInputValor.set(false);
    this.form.setControl('valor', this.fb.control(valorInicial, validators));
    setTimeout(() => this.mostrarInputValor.set(true), 0);
  }

  private cargarCategorias(): void {
    this.categoriaService.getCategorias().subscribe({
      next: (res: CategoriaResponse) => {
        this.categorias.set(
          (res.categories ?? []).map((categoria) => ({
            label: categoria.nombre,
            value: String(categoria.id_categoria),
          })),
        );
      },
      error: () => {},
    });
  }

  private cargarPromocion(id: number): void {
    this.promotionsService.getPromotionById(id).subscribe({
      next: (promo) => {
        this.esModoMonto.set(promo.tipo === 'MONTO');
        this.reconstruirControlValor(promo.tipo, promo.valor);
        this.form.patchValue(
          {
            concepto: promo.concepto,
            tipo: promo.tipo,
            valor: promo.valor,
            activo: promo.activo,
          },
          { emitEvent: false },
        );

        this.reglas.clear();
        this.descuentos.clear();

        promo.reglas.forEach((regla) =>
          this.agregarRegla(
            regla.tipoCondicion,
            regla.valorCondicion,
            regla.idRegla,
          ),
        );

        promo.descuentosAplicados.forEach((descuento) =>
          this.agregarDescuento(descuento.monto, descuento.idDescuento),
        );

        this.sincronizarEstadoEdicion(this.construirPayload());
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cargar la promoción',
        });
        this.cancelar();
      },
    });
  }

  agregarRegla(
    tipoCondicion = '',
    valorCondicion: unknown = '',
    idRegla?: number,
  ): void {
    this.reglas.push(
      this.fb.group({
        idRegla: [idRegla ?? null],
        tipoCondicion: [tipoCondicion],
        valorCondicion: [valorCondicion],
      }),
    );
    this.actualizarEstadoCambios();
  }

  eliminarRegla(i: number): void {
    this.reglas.removeAt(i);
    this.actualizarEstadoCambios();
  }

  tipoRegla(i: number): string {
    return this.reglas.at(i).get('tipoCondicion')?.value ?? '';
  }

  onTipoCondicionChange(i: number): void {
    this.reglas.at(i).patchValue({ valorCondicion: '' });
    this.actualizarEstadoCambios();
  }

  agregarDescuento(monto: number | null = null, idDescuento?: number): void {
    this.descuentos.push(
      this.fb.group({
        idDescuento: [idDescuento ?? null],
        monto: [monto, [Validators.required, Validators.min(0.01)]],
      }),
    );
    this.actualizarEstadoCambios();
  }

  eliminarDescuento(i: number): void {
    this.descuentos.removeAt(i);
    this.actualizarEstadoCambios();
  }

  private validarReglas(): boolean {
    for (let i = 0; i < this.reglas.length; i++) {
      const regla = this.reglas.at(i);
      const tipo = regla.get('tipoCondicion')?.value;
      const valor = regla.get('valorCondicion')?.value;

      if (!tipo) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Regla incompleta',
          detail: `La regla #${i + 1} no tiene tipo de condición seleccionado`,
        });
        return false;
      }

      if (
        tipo !== 'CLIENTE_NUEVO' &&
        (valor === null || valor === '' || valor === undefined || valor === 0)
      ) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Regla incompleta',
          detail: `La regla #${i + 1} requiere un valor`,
        });
        return false;
      }
    }

    return true;
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (!this.validarReglas()) {
      return;
    }

    const payload = this.construirPayload();

    if (this.esModoEdicion() && !this.hasMeaningfulChanges()) {
      this.messageService.add({
        severity: 'info',
        summary: 'Sin cambios',
        detail: 'Realiza al menos un cambio antes de actualizar la promoción',
      });
      return;
    }

    this.isSubmitting.set(true);

    const request$ = this.esModoEdicion()
      ? this.promotionsService.updatePromotion(this.idPromocion()!, payload)
      : this.promotionsService.createPromotion(payload);

    request$.subscribe({
      next: () => {
        if (this.esModoEdicion()) {
          this.sincronizarEstadoEdicion(payload);
        }

        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: this.esModoEdicion()
            ? 'Promoción actualizada'
            : 'Promoción creada',
        });
        this.isSubmitting.set(false);
        setTimeout(() => this.cancelar(), 1000);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo guardar la promoción',
        });
        this.isSubmitting.set(false);
      },
    });
  }

  cancelar(): void {
    this.router.navigate(['/admin/promociones']);
  }

  private construirPayload(): PromotionPayload {
    const value = this.form.getRawValue();

    return {
      concepto: String(value.concepto ?? '').trim().replace(/ {2,}/g, ' '),
      tipo: value.tipo,
      valor: Number(value.valor),
      activo: Boolean(value.activo),
      reglas: (value.reglas ?? [])
        .filter((regla: any) => regla.tipoCondicion)
        .map((regla: any) => ({
          ...(regla.idRegla ? { idRegla: Number(regla.idRegla) } : {}),
          tipoCondicion: regla.tipoCondicion,
          valorCondicion:
            regla.tipoCondicion === 'CLIENTE_NUEVO'
              ? 'true'
              : String(regla.valorCondicion ?? ''),
        })),
      descuentosAplicados: (value.descuentosAplicados ?? [])
        .filter((descuento: any) => descuento.monto > 0)
        .map((descuento: any) => ({
          ...(descuento.idDescuento
            ? { idDescuento: descuento.idDescuento }
            : {}),
          monto: Number(descuento.monto),
        })),
    };
  }

  private sincronizarEstadoEdicion(payload: PromotionPayload): void {
    this.initialPayloadSnapshot = this.serializarPayload(payload);
    this.hasMeaningfulChanges.set(false);
    this.form.markAsPristine();
    this.form.markAsUntouched();
  }

  private actualizarEstadoCambios(): void {
    if (!this.esModoEdicion() || !this.initialPayloadSnapshot) {
      return;
    }

    const currentSnapshot = this.serializarPayload(this.construirPayload());
    this.hasMeaningfulChanges.set(currentSnapshot !== this.initialPayloadSnapshot);
  }

  private serializarPayload(payload: PromotionPayload): string {
    return JSON.stringify(payload);
  }

  private esTextoConceptoValido(texto: string): boolean {
    return Array.from(texto.normalize('NFC')).every((char) =>
      PROMOTION_CONCEPT_CHAR_PATTERN.test(char),
    );
  }

  private limpiarConcepto(texto: string): string {
    return Array.from(texto.normalize('NFC'))
      .filter((char) => PROMOTION_CONCEPT_CHAR_PATTERN.test(char))
      .join('');
  }

  private mostrarToastConceptoInvalido(): void {
    const now = Date.now();
    if (now - this.lastConceptWarningAt < PROMOTION_CONCEPT_TOAST_COOLDOWN_MS) {
      return;
    }

    this.lastConceptWarningAt = now;
    this.messageService.add({
      severity: 'warn',
      summary: 'Caracter no permitido',
      detail: PROMOTION_CONCEPT_TOAST_DETAIL,
    });
  }
}
