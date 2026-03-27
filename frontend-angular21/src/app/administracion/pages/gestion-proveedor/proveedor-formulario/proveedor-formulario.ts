import { Component, OnInit, OnDestroy, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

import { ProveedorService } from '../../../services/proveedor.service';
import {
  SupplierResponse,
  CreateSupplierRequest,
  UpdateSupplierRequest,
} from '../../../interfaces/supplier.interface';

const SOLO_LETRAS_NUMEROS = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s\.\,\-\&]+$/;
const SOLO_LETRAS_ESPACIOS = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
const SOLO_NUMEROS = /^\d+$/;
const EMAIL_PATTERN = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
const TELEFONO_PATTERN = /^\d{7,15}$/;
const DIRECCION_PATTERN = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s\.\,\-\#\/]+$/;

@Component({
  selector: 'app-proveedor-formulario',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    Button,
    InputTextModule,
    CardModule,
    ConfirmDialog,
    ToastModule,
    TooltipModule,
  ],
  templateUrl: './proveedor-formulario.html',
  styleUrls: ['./proveedor-formulario.css'],
  providers: [ConfirmationService, MessageService],
})
export class ProveedorFormulario implements OnInit, OnDestroy {
  proveedorForm: FormGroup;

  isEditMode = signal(false);
  proveedorId = signal<number | null>(null);
  proveedorOriginal = signal<SupplierResponse | null>(null);
  loading = signal(false);
  navegando = signal(false);
  buscandoRuc = signal(false);

  tituloFormulario = computed(() => (this.isEditMode() ? 'Editar Proveedor' : 'Nuevo Proveedor'));
  iconoFormulario = computed(() => (this.isEditMode() ? 'pi pi-pencil' : 'pi pi-plus-circle'));
  labelBotonGuardar = computed(() => (this.isEditMode() ? 'Actualizar' : 'Guardar'));
  iconoBotonGuardar = computed(() => (this.isEditMode() ? 'pi pi-refresh' : 'pi pi-check'));

  returnUrl = '/admin/proveedores';

  readonly limites = {
    razon_social: { min: 3, max: 80 },
    ruc: { min: 11, max: 11 },
    contacto: { min: 2, max: 50 },
    email: { min: 5, max: 50 },
    telefono: { min: 7, max: 15 },
    dir_fiscal: { min: 5, max: 100 },
  };

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private proveedorService: ProveedorService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
  ) {
    this.proveedorForm = this.fb.group({
      razon_social: [
        '',
        [
          Validators.required,
          Validators.minLength(this.limites.razon_social.min),
          Validators.maxLength(this.limites.razon_social.max),
          Validators.pattern(SOLO_LETRAS_NUMEROS),
        ],
      ],
      ruc: [
        '',
        [
          Validators.required,
          Validators.minLength(this.limites.ruc.min),
          Validators.maxLength(this.limites.ruc.max),
          Validators.pattern(SOLO_NUMEROS),
        ],
      ],
      contacto: [
        '',
        [
          Validators.minLength(this.limites.contacto.min),
          Validators.maxLength(this.limites.contacto.max),
          Validators.pattern(SOLO_LETRAS_ESPACIOS),
        ],
      ],
      email: [
        '',
        [Validators.maxLength(this.limites.email.max), Validators.pattern(EMAIL_PATTERN)],
      ],
      telefono: ['', [Validators.pattern(TELEFONO_PATTERN)]],
      dir_fiscal: [
        '',
        [
          Validators.minLength(this.limites.dir_fiscal.min),
          Validators.maxLength(this.limites.dir_fiscal.max),
          Validators.pattern(DIRECCION_PATTERN),
        ],
      ],
    });

    effect(() => {
      if (this.isEditMode()) {
      }
    });
  }

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      if (params['returnUrl']) this.returnUrl = params['returnUrl'];
    });

    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.isEditMode.set(true);
        this.proveedorId.set(+params['id']);
        this.cargarProveedor(+params['id']);
      } else {
        this.isEditMode.set(false);
        this.proveedorId.set(null);
        this.proveedorOriginal.set(null);
      }
    });
  }

  ngOnDestroy() {
    this.confirmationService.close();
  }

  onInputSoloNumeros(event: Event, campo: string): void {
    const input = event.target as HTMLInputElement;
    const limpio = input.value.replace(/\D/g, '');
    if (input.value !== limpio) {
      input.value = limpio;
      this.proveedorForm.get(campo)?.setValue(limpio, { emitEvent: false });
    }
  }

  onInputSoloLetras(event: Event, campo: string): void {
    const input = event.target as HTMLInputElement;
    const limpio = input.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
    if (input.value !== limpio) {
      input.value = limpio;
      this.proveedorForm.get(campo)?.setValue(limpio, { emitEvent: false });
    }
  }

  onInputLetrasNumeros(event: Event, campo: string): void {
    const input = event.target as HTMLInputElement;
    const limpio = input.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s\.\,\-\&]/g, '');
    if (input.value !== limpio) {
      input.value = limpio;
      this.proveedorForm.get(campo)?.setValue(limpio, { emitEvent: false });
    }
  }

  onInputDireccion(event: Event, campo: string): void {
    const input = event.target as HTMLInputElement;
    const limpio = input.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s\.\,\-\#\/]/g, '');
    if (input.value !== limpio) {
      input.value = limpio;
      this.proveedorForm.get(campo)?.setValue(limpio, { emitEvent: false });
    }
  }

  buscarRuc(): void {
    const ruc = this.proveedorForm.get('ruc')?.value?.trim();
    if (!ruc || !/^\d{11}$/.test(ruc)) {
      this.messageService.add({
        severity: 'warn',
        summary: 'RUC inválido',
        detail: 'Ingresa un RUC de 11 dígitos antes de consultar.',
        life: 3000,
      });
      return;
    }

    this.buscandoRuc.set(true);
    this.proveedorService.consultarRuc(ruc).subscribe({
      next: (res) => {
        this.proveedorForm.patchValue({
          razon_social: res.razonSocial,
          dir_fiscal: res.direccion,
        });
        this.buscandoRuc.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'RUC encontrado',
          detail: `${res.razonSocial} — ${res.estado} / ${res.condicion}`,
          life: 4000,
        });
      },
      error: (err) => {
        this.buscandoRuc.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'RUC no encontrado',
          detail: err.message,
          life: 3000,
        });
      },
    });
  }

  cargarProveedor(id: number) {
    this.loading.set(true);
    this.proveedorService.getSupplierById(id).subscribe({
      next: (proveedor: SupplierResponse) => {
        this.proveedorOriginal.set(proveedor);
        this.proveedorForm.patchValue({
          razon_social: proveedor.razon_social,
          ruc: proveedor.ruc,
          contacto: proveedor.contacto || '',
          email: proveedor.email || '',
          telefono: proveedor.telefono || '',
          dir_fiscal: proveedor.dir_fiscal || '',
        });
        Promise.resolve().then(() => {
          this.proveedorForm.markAsPristine();
          this.proveedorForm.markAsUntouched();
          this.loading.set(false);
        });
      },
      error: (error: Error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.message || 'Proveedor no encontrado',
          life: 3000,
        });
        this.loading.set(false);
        this.volverSinConfirmar();
      },
    });
  }

  hayaCambios(): boolean {
    if (!this.isEditMode() || !this.proveedorOriginal()) {
      const f = this.proveedorForm.value;
      return (
        (f.razon_social && f.razon_social.trim() !== '') ||
        (f.ruc && f.ruc.trim() !== '') ||
        (f.contacto && f.contacto.trim() !== '') ||
        (f.email && f.email.trim() !== '') ||
        (f.telefono && f.telefono.trim() !== '') ||
        (f.dir_fiscal && f.dir_fiscal.trim() !== '')
      );
    }
    const f = this.proveedorForm.value;
    const o = this.proveedorOriginal()!;
    return (
      String(f.razon_social || '').trim() !== String(o.razon_social || '').trim() ||
      String(f.ruc || '').trim() !== String(o.ruc || '').trim() ||
      String(f.contacto || '').trim() !== String(o.contacto || '').trim() ||
      String(f.email || '').trim() !== String(o.email || '').trim() ||
      String(f.telefono || '').trim() !== String(o.telefono || '').trim() ||
      String(f.dir_fiscal || '').trim() !== String(o.dir_fiscal || '').trim()
    );
  }

  guardar() {
    if (!this.proveedorForm.valid) {
      Object.keys(this.proveedorForm.controls).forEach((key) =>
        this.proveedorForm.get(key)?.markAsTouched(),
      );
      this.messageService.add({
        severity: 'warn',
        summary: 'Formulario Incompleto',
        detail: 'Por favor complete todos los campos requeridos correctamente',
        life: 3000,
      });
      return;
    }
    const formData = this.proveedorForm.value;
    if (this.isEditMode() && this.proveedorId()) {
      this.confirmarActualizacion(formData);
    } else {
      this.confirmarCreacion(formData);
    }
  }

  private confirmarActualizacion(formData: any) {
    this.confirmationService.confirm({
      message: `¿Seguro que deseas actualizar el proveedor <strong>${formData.razon_social}</strong>?`,
      header: 'Confirmar Actualización',
      icon: 'pi pi-exclamation-triangle',
      rejectLabel: 'Cancelar',
      acceptLabel: 'Actualizar',
      acceptButtonProps: { severity: 'warning' },
      rejectButtonProps: { severity: 'secondary', outlined: true },
      accept: () => {
        this.loading.set(true);
        const updateData: UpdateSupplierRequest = {
          razon_social: formData.razon_social,
          ruc: formData.ruc,
          contacto: formData.contacto || undefined,
          email: formData.email || undefined,
          telefono: formData.telefono || undefined,
          dir_fiscal: formData.dir_fiscal || undefined,
        };
        this.proveedorService.updateSupplier(this.proveedorId()!, updateData).subscribe({
          next: (response: SupplierResponse) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Proveedor Actualizado',
              detail: `"${response.razon_social}" actualizado correctamente`,
              life: 2500,
            });
            this.loading.set(false);
            setTimeout(() => this.cargarProveedor(this.proveedorId()!), 500);
          },
          error: (error: Error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.message || 'Error al actualizar el proveedor',
              life: 3000,
            });
            this.loading.set(false);
          },
        });
      },
      reject: () => {
        this.messageService.add({
          severity: 'info',
          summary: 'Cancelado',
          detail: 'Actualización cancelada',
          life: 2000,
        });
      },
    });
  }

  private confirmarCreacion(formData: any) {
    this.confirmationService.confirm({
      message: `¿Seguro que deseas crear el proveedor <strong>${formData.razon_social}</strong>?`,
      header: 'Confirmar Creación',
      icon: 'pi pi-info-circle',
      rejectLabel: 'Cancelar',
      acceptLabel: 'Crear',
      acceptButtonProps: { severity: 'warning' },
      rejectButtonProps: { severity: 'secondary', outlined: true },
      accept: () => {
        this.loading.set(true);
        const newProveedor: CreateSupplierRequest = {
          razon_social: formData.razon_social,
          ruc: formData.ruc,
          contacto: formData.contacto || undefined,
          email: formData.email || undefined,
          telefono: formData.telefono || undefined,
          dir_fiscal: formData.dir_fiscal || undefined,
        };
        this.proveedorService.createSupplier(newProveedor).subscribe({
          next: (response: SupplierResponse) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Proveedor Creado',
              detail: `"${response.razon_social}" creado correctamente`,
              life: 2500,
            });
            this.loading.set(false);
            Promise.resolve().then(() => setTimeout(() => this.volverSinConfirmar(), 1000));
          },
          error: (error: Error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error.message || 'Error al crear el proveedor',
              life: 3000,
            });
            this.loading.set(false);
          },
        });
      },
      reject: () => {
        this.messageService.add({
          severity: 'info',
          summary: 'Cancelado',
          detail: 'Creación cancelada',
          life: 2000,
        });
      },
    });
  }

  volver() {
    if (!this.hayaCambios()) {
      this.volverSinConfirmar();
      return;
    }
    const mensaje =
      this.isEditMode() && this.proveedorOriginal()
        ? `¿Seguro que deseas cancelar la edición de <strong>${this.proveedorOriginal()!.razon_social}</strong>?<br>Se perderán los cambios realizados.`
        : '¿Seguro que deseas cancelar la creación del proveedor?<br>Se perderán los datos ingresados.';
    this.confirmationService.confirm({
      message: mensaje,
      header: this.isEditMode() ? 'Cancelar Edición' : 'Cancelar Creación',
      icon: 'pi pi-exclamation-triangle',
      rejectLabel: 'Quedarme',
      acceptLabel: 'Salir',
      acceptButtonProps: { severity: 'danger' },
      rejectButtonProps: { severity: 'secondary', outlined: true },
      accept: () => {
        this.messageService.add({
          severity: 'info',
          summary: this.isEditMode() ? 'Edición Cancelada' : 'Creación Cancelada',
          detail: this.isEditMode()
            ? `Edición de "${this.proveedorOriginal()?.razon_social}" cancelada`
            : 'Creación de proveedor cancelada',
          life: 2000,
        });
        Promise.resolve().then(() => setTimeout(() => this.volverSinConfirmar(), 500));
      },
    });
  }

  volverSinConfirmar() {
    if (this.navegando()) return;
    this.navegando.set(true);
    Promise.resolve().then(() => {
      this.router
        .navigate([this.returnUrl])
        .then(() => this.navegando.set(false))
        .catch(() => this.navegando.set(false));
    });
  }

  get rucInvalido(): boolean {
    const c = this.proveedorForm.get('ruc');
    return !!(c?.invalid && c?.touched);
  }

  get emailInvalido(): boolean {
    const c = this.proveedorForm.get('email');
    return !!(c?.invalid && c?.touched && c?.value);
  }

  get telefonoInvalido(): boolean {
    const c = this.proveedorForm.get('telefono');
    return !!(c?.invalid && c?.touched && c?.value);
  }

  get razonSocialInvalida(): boolean {
    const c = this.proveedorForm.get('razon_social');
    return !!(c?.invalid && c?.touched);
  }

  get contactoInvalido(): boolean {
    const c = this.proveedorForm.get('contacto');
    return !!(c?.invalid && c?.touched && c?.value);
  }

  get dirFiscalInvalida(): boolean {
    const c = this.proveedorForm.get('dir_fiscal');
    return !!(c?.invalid && c?.touched && c?.value);
  }

  getErrores(campo: string): string {
    const c = this.proveedorForm.get(campo);
    if (!c?.errors || !c?.touched) return '';
    if (c.errors['required']) return 'Este campo es requerido';
    if (c.errors['minlength']) return `Mínimo ${c.errors['minlength'].requiredLength} caracteres`;
    if (c.errors['maxlength']) return `Máximo ${c.errors['maxlength'].requiredLength} caracteres`;
    if (c.errors['pattern']) return 'Caracteres no permitidos';
    return '';
  }
}
