import { CommonModule } from '@angular/common';
import { Component, ViewChild, inject, Directive, HostListener, ElementRef } from '@angular/core';
import { FormsModule, NgForm, AbstractControl } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { MessageModule } from 'primeng/message';
import { Observable, Subject } from 'rxjs';
import { CanComponentDeactivate } from '../../../../../core/guards/pending-changes.guard';
import { AlmacenService } from '../../../../services/almacen.service';
import { DEPARTAMENTOS_PROVINCIAS } from '../../../../shared/data/departamentos-provincias';
import { HttpErrorResponse } from '@angular/common/http';

// Directiva para bloquear números en autocomplete
@Directive({
  selector: '[appNoNumbers]',
  standalone: true
})
export class NoNumbersDirective {
  constructor(private el: ElementRef) {}

  @HostListener('keypress', ['$event'])
  onKeyPress(event: KeyboardEvent): boolean {
    const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]$/;
    const allowedKeys = ['Backspace', 'Tab', 'Delete', 'ArrowLeft', 'ArrowRight'];
    if (allowedKeys.includes(event.key)) return true;
    if (!regex.test(event.key)) {
      event.preventDefault();
      return false;
    }
    return true;
  }

  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent): boolean {
    const pastedText = event.clipboardData?.getData('text') || '';
    const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/;
    if (!regex.test(pastedText)) {
      event.preventDefault();
      return false;
    }
    return true;
  }
}

interface Provincia {
  nombre: string;
  distritos: string[];
}

@Component({
  selector: 'app-agregar-almacen',
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ButtonModule,
    CardModule,
    DividerModule,
    InputTextModule,
    InputNumberModule,
    ConfirmDialogModule,
    ToastModule,
    AutoCompleteModule,
    MessageModule,
    NoNumbersDirective,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './agregar-almacen.html',
  styleUrls: ['./agregar-almacen.css'],
})
export class AlmacenCrear implements CanComponentDeactivate {
  @ViewChild('sedeForm') sedeForm?: NgForm;

  private allowNavigate = false;
  submitted = false;

  sede = {
    codigo: '',
    nombre: '',
    departamento: '',
    provincia: '',
    ciudad: '',
    telefono: null as number | null,
    direccion: '',
  };

  departamentos = Object.keys(DEPARTAMENTOS_PROVINCIAS);
  filteredDepartamentos: string[] = [];

  provincias: string[] = [];
  filteredProvincias: string[] = [];

  distritos: string[] = [];
  filteredDistritos: string[] = [];

  // Inyecta el servicio correcto
  private readonly almacenService = inject(AlmacenService);

  readonly loading = this.almacenService.loading;
  readonly error = this.almacenService.error;

  constructor(
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private router: Router
  ) {}

  toUpperCase(field: 'codigo' | 'nombre' | 'direccion'): void {
    this.sede[field] = this.sede[field].toUpperCase();
  }

  onCodigoModelChange(value: string): void {
    const normalized = (value ?? '').trim().toUpperCase();
    this.sede.codigo = normalized;

    this.messageService.clear();

    const codigoCtrl = this.sedeForm?.controls['codigo'] as AbstractControl | undefined;
    if (!codigoCtrl) return;

    const errors = codigoCtrl.errors;
    if (!errors) return;

    const newErrors: Record<string, any> = {};
    for (const key of Object.keys(errors)) {
      if (key === 'server') continue;
      if (key === 'required' && normalized) continue;
      newErrors[key] = (errors as any)[key];
    }

    if (Object.keys(newErrors).length === 0) {
      codigoCtrl.setErrors(null);
    } else {
      codigoCtrl.setErrors(newErrors);
    }
  }

  onlyLetters(event: KeyboardEvent): boolean {
    const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]$/;
    return regex.test(event.key) || event.key === 'Backspace' || event.key === 'Tab';
  }

  onlyNumbers(event: KeyboardEvent): boolean {
    const regex = /^[0-9]$/;
    const allowedKeys = ['Backspace', 'Tab', 'Delete', 'ArrowLeft', 'ArrowRight'];
    if (allowedKeys.includes(event.key)) return true;
    if (!regex.test(event.key)) {
      event.preventDefault();
      return false;
    }
    return true;
  }

  filterDepartamentos(event: { query: string }): void {
    const q = (event.query ?? '').toLowerCase();
    this.filteredDepartamentos = this.departamentos.filter(dept => dept.toLowerCase().includes(q));
  }

  filterProvincias(event: { query: string }): void {
    const q = (event.query ?? '').toLowerCase();
    this.filteredProvincias = this.provincias.filter(prov => prov.toLowerCase().includes(q));
  }

  filterDistritos(event: { query: string }): void {
    const q = (event.query ?? '').toLowerCase();
    this.filteredDistritos = this.distritos.filter(dist => dist.toLowerCase().includes(q));
  }

  onDepartamentoSelect(): void {
    const dept = this.sede.departamento;
    const provinciasData: Provincia[] = DEPARTAMENTOS_PROVINCIAS[dept] || [];
    this.provincias = provinciasData.map(p => p.nombre);
    this.sede.provincia = '';
    this.sede.ciudad = '';
    this.distritos = [];
    this.filteredProvincias = [];
    this.filteredDistritos = [];
  }

  onProvinciaSelect(): void {
    const dept = this.sede.departamento;
    const prov = this.sede.provincia;
    const provinciasData: Provincia[] = DEPARTAMENTOS_PROVINCIAS[dept] || [];
    const provinciaSeleccionada = provinciasData.find(p => p.nombre === prov);
    this.distritos = provinciaSeleccionada?.distritos || [];
    this.sede.ciudad = '';
    this.filteredDistritos = [];
  }

  private extractServerMessage(err: any): string {
    try {
      if (!err) return 'Error desconocido';
      if ((err as any).friendlyMessage) return String((err as any).friendlyMessage);
      if (err.error) {
        if (typeof err.error === 'string') return err.error;
        if (err.error.message) {
          return Array.isArray(err.error.message) ? err.error.message.join(', ') : String(err.error.message);
        }
        if (err.error.error) return String(err.error.error);
        return JSON.stringify(err.error);
      }
      return err.message ?? 'Error del servidor';
    } catch {
      return 'Error procesando la respuesta del servidor';
    }
  }

  // ----- Helpers para limpiar errores del control Código -----
  onCodigoInput(): void {
    this.messageService.clear();

    const codigoCtrl = this.sedeForm?.controls['codigo'] as AbstractControl | undefined;
    if (!codigoCtrl) return;

    const value = (this.sede && this.sede.codigo) ? String(this.sede.codigo).trim() : '';

    const errors = codigoCtrl.errors;
    if (!errors) return;

    const newErrors: Record<string, any> = {};
    for (const key of Object.keys(errors)) {
      if (key === 'server') continue;
      if (key === 'required' && value) continue;
      newErrors[key] = (errors as any)[key];
    }

    if (Object.keys(newErrors).length === 0) {
      codigoCtrl.setErrors(null);
    } else {
      codigoCtrl.setErrors(newErrors);
    }
  }

  onCodigoBlur(): void {
    const value = (this.sede && this.sede.codigo) ? String(this.sede.codigo).trim() : '';
    if (value) {
      this.messageService.clear();
      const codigoCtrl = this.sedeForm?.controls['codigo'] as AbstractControl | undefined;
      if (!codigoCtrl) return;
      if (codigoCtrl.errors && codigoCtrl.errors['required']) {
        const otherErrors = Object.keys(codigoCtrl.errors).filter(k => k !== 'required');
        if (otherErrors.length === 0) {
          codigoCtrl.setErrors(null);
        } else {
          const newErrors: Record<string, any> = {};
          for (const k of otherErrors) newErrors[k] = (codigoCtrl.errors as any)[k];
          codigoCtrl.setErrors(newErrors);
        }
      }
    }
  }

  // Getter used by template to avoid complex expressions in the template
  getCodigoErrorText(): string {
    const codigoCtrl = this.sedeForm?.controls?.['codigo'] as AbstractControl | undefined;
    const serverErr = codigoCtrl?.errors?.['server'];
    if (serverErr) return String(serverErr);
    return 'El código es obligatorio.';
  }

  saveSede(form: NgForm): void {
    this.submitted = true;

    // evita doble envío si ya está cargando
    if (typeof this.loading === 'function' && this.loading()) return;

    if (form.invalid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Campos incompletos',
        detail: 'Completa los campos obligatorios para registrar el almacén.',
      });
      return;
    }

    if (!this.departamentos.includes(this.sede.departamento)) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Departamento inválido',
        detail: 'Seleccione un departamento de la lista.',
      });
      return;
    }

    if (!this.provincias.includes(this.sede.provincia)) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Provincia inválida',
        detail: 'Seleccione una provincia de la lista.',
      });
      return;
    }

    if (!this.distritos.includes(this.sede.ciudad)) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Distrito inválido',
        detail: 'Seleccione un distrito de la lista.',
      });
      return;
    }

    const telefonoStr = String(this.sede.telefono ?? '');
    if (telefonoStr.length !== 9) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Teléfono inválido',
        detail: 'El teléfono debe tener exactamente 9 dígitos.',
      });
      return;
    }

    const payload = {
      codigo: (this.sede.codigo ?? '').trim().toUpperCase(),
      nombre: (this.sede.nombre ?? '').trim().toUpperCase(),
      ciudad: (this.sede.ciudad ?? '').trim(),
      departamento: (this.sede.departamento ?? '').trim(),
      provincia: (this.sede.provincia ?? '').trim(),
      direccion: (this.sede.direccion ?? '').trim().toUpperCase(),
      telefono: telefonoStr,
    };

    // validación rápida en frontend
    if (!payload.codigo) {
      this.messageService.add({ severity: 'warn', summary: 'Código requerido', detail: 'El campo código es obligatorio.' });
      const codigoCtrl = this.sedeForm?.controls['codigo'] as AbstractControl | undefined;
      codigoCtrl?.setErrors({ required: true });
      codigoCtrl?.markAsTouched();
      return;
    }

    // una sola llamada al servicio
    this.almacenService.createAlmacen(payload, 'Administrador').subscribe({
      next: (created) => {
        this.allowNavigate = true;
        this.messageService.add({
          severity: 'success',
          summary: 'Almacén registrado',
          detail: `Se registró el almacén ${created.nombre} (${created.codigo}).`,
          life: 3000,
        });
        // dar tiempo para que el toast sea visible
        setTimeout(() => {
          this.router.navigate(['/admin/almacen']);
        }, 1200);
      },
      error: (err: HttpErrorResponse) => {
        console.error('[AlmacenCrear] create error', err);

        // extraer mensaje del servidor
        const serverMsg = this.extractServerMessage(err);

        // si el error de validación menciona "código", marcar el control correspondiente
        const lower = serverMsg.toLowerCase();
        const codigoCtrl = this.sedeForm?.controls['codigo'] as AbstractControl | undefined;
        if (lower.includes('códig') || lower.includes('codigo') || lower.includes('code')) {
          codigoCtrl?.setErrors({ server: serverMsg });
          codigoCtrl?.markAsTouched();
          try { (document.getElementById('codigo') as HTMLInputElement)?.focus(); } catch {}
        }

        // mostrar toast con mensaje del servidor
        this.messageService.add({
          severity: err.status === 400 ? 'warn' : 'error',
          summary: err.status === 400 ? 'Validación' : 'Error',
          detail: serverMsg,
        });
      },
    });
  }

  confirmCancel(): void {
    if (!this.sedeForm?.dirty) {
      this.navigateWithToast();
      return;
    }

    this.confirmDiscardChanges().subscribe((confirmed) => {
      if (confirmed) {
        this.allowNavigate = true;
        this.navigateWithToast();
      }
    });
  }

  canDeactivate(): boolean | Observable<boolean> {
    if (this.allowNavigate || !this.sedeForm?.dirty) return true;
    return this.confirmDiscardChanges();
  }

  private confirmDiscardChanges(): Observable<boolean> {
    const result = new Subject<boolean>();

    this.confirmationService.confirm({
      header: 'Cambios sin guardar',
      message: 'Tienes cambios sin guardar. ¿Deseas salir?',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Salir',
      rejectLabel: 'Continuar',
      acceptButtonProps: { severity: 'danger' },
      rejectButtonProps: { severity: 'secondary', outlined: true },
      accept: () => {
        this.allowNavigate = true;
        result.next(true);
        result.complete();
      },
      reject: () => {
        result.next(false);
        result.complete();
      },
    });

    return result.asObservable();
  }

  private navigateWithToast(): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Cancelado',
      detail: 'Se canceló el registro del almacén.',
    });

    setTimeout(() => {
      this.router.navigate(['/admin/almacen']);
    }, 1200);
  }
}