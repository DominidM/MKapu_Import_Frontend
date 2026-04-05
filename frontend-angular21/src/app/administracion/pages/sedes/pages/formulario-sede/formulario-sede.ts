import { CommonModule } from '@angular/common';
import {
  Component,
  Directive,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
  inject,
  signal,
  computed,
} from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { Message } from 'primeng/message';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Observable, Subject } from 'rxjs';
import { CanComponentDeactivate } from '../../../../../core/guards/pending-changes.guard';
import { SedeService } from '../../../../services/sede.service';
import { DEPARTAMENTOS_PROVINCIAS } from '../../../../shared/data/departamentos-provincias';

// ── Directiva ────────────────────────────────────────────────────────────────

@Directive({ selector: '[appNoNumbers]', standalone: true })
export class NoNumbersDirective {
  constructor(private el: ElementRef) {}

  @HostListener('keypress', ['$event'])
  onKeyPress(event: KeyboardEvent): boolean {
    const allowed = ['Backspace', 'Tab', 'Delete', 'ArrowLeft', 'ArrowRight'];
    if (allowed.includes(event.key)) return true;
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]$/.test(event.key)) {
      event.preventDefault();
      return false;
    }
    return true;
  }

  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent): boolean {
    const text = event.clipboardData?.getData('text') || '';
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(text)) {
      event.preventDefault();
      return false;
    }
    return true;
  }
}

// ── Modelo interno ───────────────────────────────────────────────────────────

interface SedeForm {
  codigo: string;
  nombre: string;
  departamento: string;
  provincia: string;
  ciudad: string;
  telefono: string;
  direccion: string;
}

// ── Componente ───────────────────────────────────────────────────────────────

@Component({
  selector: 'app-formulario-sede',
  standalone: true,
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
    Message,
    NoNumbersDirective,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './formulario-sede.html',
  styleUrl: './formulario-sede.css',
})
export class FormularioSede implements OnInit, CanComponentDeactivate {
  @ViewChild('sedeForm') sedeForm?: NgForm;

  // ── Servicios ──────────────────────────────────────────────────────────────
  private readonly sedeService = inject(SedeService);
  private readonly route = inject(ActivatedRoute);

  constructor(
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private router: Router,
  ) {}

  // ── Estado de modo ─────────────────────────────────────────────────────────
  sedeId: number | null = null;
  readonly isEditMode = signal(false);
  readonly submitted = signal(false);
  private allowNavigate = false;

  readonly title = computed(() => (this.isEditMode() ? 'EDITAR SEDE' : 'REGISTRAR SEDE'));
  readonly submitLabel = computed(() => (this.isEditMode() ? 'Guardar cambios' : 'Registrar Sede'));
  readonly submitIcon = computed(() => (this.isEditMode() ? 'pi pi-save' : 'pi pi-plus'));

  // ── Señales del servicio ───────────────────────────────────────────────────
  readonly loading = this.sedeService.loading;
  readonly error = this.sedeService.error;

  // ── Modelo del formulario ──────────────────────────────────────────────────
  sede: SedeForm = {
    codigo: '',
    nombre: '',
    departamento: '',
    provincia: '',
    ciudad: '',
    telefono: '',
    direccion: '',
  };

  // ── Autocomplete data ──────────────────────────────────────────────────────
  readonly departamentos = Object.keys(DEPARTAMENTOS_PROVINCIAS);
  filteredDepartamentos: string[] = [];

  provincias: string[] = [];
  filteredProvincias: string[] = [];

  distritos: string[] = [];
  filteredDistritos: string[] = [];

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  ngOnInit(): void {
    const idStr =
      this.route.snapshot.paramMap.get('id') ?? this.route.snapshot.queryParamMap.get('id');

    if (idStr) {
      this.sedeId = parseInt(idStr, 10);
      this.isEditMode.set(true);
      this.loadSede();
    }
  }

  private loadSede(): void {
    if (!this.sedeId) return;

    this.sedeService.getSedeById(this.sedeId).subscribe({
      next: (data) => {
        this.sede = {
          codigo: data.codigo,
          nombre: data.nombre,
          departamento: data.departamento,
          provincia: '',
          ciudad: data.ciudad,
          telefono: data.telefono ?? '',
          direccion: data.direccion,
        };

        this.resolveProvinciaFromCiudad();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cargar la sede.',
        });
      },
    });
  }

  private resolveProvinciaFromCiudad(): void {
    const provinciasData = DEPARTAMENTOS_PROVINCIAS[this.sede.departamento] || [];
    const encontrada = provinciasData.find((p) => p.distritos.includes(this.sede.ciudad));

    if (encontrada) {
      this.sede.provincia = encontrada.nombre;
      this.provincias = provinciasData.map((p) => p.nombre);
      this.distritos = encontrada.distritos;
    }
  }

  // ── Helpers de input ───────────────────────────────────────────────────────

  toUpperCase(field: 'codigo' | 'nombre' | 'direccion'): void {
    this.sede[field] = this.sede[field].toUpperCase();
  }

  onlyNumbers(event: KeyboardEvent): boolean {
    const allowed = ['Backspace', 'Tab', 'Delete', 'ArrowLeft', 'ArrowRight'];
    if (allowed.includes(event.key)) return true;
    if (!/^[0-9]$/.test(event.key)) {
      event.preventDefault();
      return false;
    }
    return true;
  }

  // ── Autocomplete ───────────────────────────────────────────────────────────

  filterDepartamentos(event: { query: string }): void {
    const q = event.query.toLowerCase();
    this.filteredDepartamentos = this.departamentos.filter((d) => d.toLowerCase().includes(q));
  }

  filterProvincias(event: { query: string }): void {
    const q = event.query.toLowerCase();
    this.filteredProvincias = this.provincias.filter((p) => p.toLowerCase().includes(q));
  }

  filterDistritos(event: { query: string }): void {
    const q = event.query.toLowerCase();
    this.filteredDistritos = this.distritos.filter((d) => d.toLowerCase().includes(q));
  }

  onDepartamentoSelect(): void {
    const provinciasData = DEPARTAMENTOS_PROVINCIAS[this.sede.departamento] || [];
    this.provincias = provinciasData.map((p) => p.nombre);
    this.sede.provincia = '';
    this.sede.ciudad = '';
    this.distritos = [];
    this.filteredProvincias = [];
    this.filteredDistritos = [];
  }

  onProvinciaSelect(): void {
    const provinciasData = DEPARTAMENTOS_PROVINCIAS[this.sede.departamento] || [];
    const seleccionada = provinciasData.find((p) => p.nombre === this.sede.provincia);
    this.distritos = seleccionada?.distritos || [];
    this.sede.ciudad = '';
    this.filteredDistritos = [];
  }

  // ── Validaciones de selección ──────────────────────────────────────────────

  private validarCamposUbicacion(): boolean {
    if (!this.departamentos.includes(this.sede.departamento)) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Departamento inválido',
        detail: 'Seleccione un departamento de la lista.',
      });
      return false;
    }

    if (!this.provincias.includes(this.sede.provincia)) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Provincia inválida',
        detail: 'Seleccione una provincia de la lista.',
      });
      return false;
    }

    if (!this.distritos.includes(this.sede.ciudad)) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Distrito inválido',
        detail: 'Seleccione un distrito de la lista.',
      });
      return false;
    }

    return true;
  }

  private validarTelefono(): string | null {
    const tel = String(this.sede.telefono ?? '').trim();

    if (tel.length !== 9 || !/^\d{9}$/.test(tel)) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Teléfono inválido',
        detail: 'El teléfono debe tener exactamente 9 dígitos numéricos.',
      });
      return null;
    }

    return tel;
  }

  private buildPayload(telefonoStr: string) {
    return {
      codigo: this.sede.codigo.trim().toUpperCase(),
      nombre: this.sede.nombre.trim().toUpperCase(),
      ciudad: this.sede.ciudad.trim(),
      departamento: this.sede.departamento.trim(),
      direccion: this.sede.direccion.trim().toUpperCase(),
      telefono: telefonoStr,
    };
  }

  // ── Submit ─────────────────────────────────────────────────────────────────

  onSubmit(form: NgForm): void {
    this.submitted.set(true);

    if (form.invalid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Campos incompletos',
        detail: 'Completa los campos obligatorios.',
      });
      return;
    }

    if (!this.validarCamposUbicacion()) return;

    const telefonoStr = this.validarTelefono();
    if (!telefonoStr) return;

    const payload = this.buildPayload(telefonoStr);

    this.isEditMode() ? this.update(payload) : this.create(payload);
  }

  private create(payload: ReturnType<typeof this.buildPayload>): void {
    this.sedeService.createSede(payload, 'Administrador').subscribe({
      next: (created) => {
        this.allowNavigate = true;
        this.messageService.add({
          severity: 'success',
          summary: 'Sede registrada',
          detail: `Se registró la sede ${created.nombre} (${created.codigo}).`,
        });
        this.router.navigate(['/admin/sedes']);
      },
      error: (err: unknown) => {
        const normalized = this.normalizeMessage(this.extractServerMessage(err));
        const isDuplicate = this.isDuplicateCodeError(normalized);

        this.messageService.add({
          severity: isDuplicate ? 'warn' : 'error',
          summary: isDuplicate ? 'Código duplicado' : 'Error',
          detail: isDuplicate
            ? 'Ya existe una sede con ese código.'
            : 'No se pudo registrar la sede.',
          styleClass: isDuplicate ? 'duplicate-entity-toast' : undefined,
        });
      },
    });
  }

  private update(payload: ReturnType<typeof this.buildPayload>): void {
    if (!this.sedeId) return;

    this.sedeService.updateSede(this.sedeId, payload, 'Administrador').subscribe({
      next: () => {
        this.allowNavigate = true;
        this.messageService.add({
          severity: 'success',
          summary: 'Sede actualizada',
          detail: 'La sede se actualizó correctamente.',
        });
        setTimeout(() => this.router.navigate(['/admin/sedes']), 1500);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo actualizar la sede.',
        });
      },
    });
  }

  // ── Cancelar / Guard ───────────────────────────────────────────────────────

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
      detail: this.isEditMode()
        ? 'Se canceló la edición de la sede.'
        : 'Se canceló el registro de la sede.',
    });

    setTimeout(() => this.router.navigate(['/admin/sedes']), 1500);
  }

  // ── Helpers de error ───────────────────────────────────────────────────────

  private extractServerMessage(error: unknown): string {
    if (!error || typeof error !== 'object') return '';

    const candidate = error as {
      message?: unknown;
      error?: { message?: unknown; error?: unknown } | string;
    };

    if (typeof candidate.error === 'string') return candidate.error;

    if (candidate.error && typeof candidate.error === 'object') {
      const nested = candidate.error.message;
      if (Array.isArray(nested)) return nested.filter(Boolean).join(' | ');
      if (typeof nested === 'string') return nested;
      if (typeof candidate.error.error === 'string') return candidate.error.error;
    }

    if (typeof candidate.message === 'string') return candidate.message;

    return '';
  }

  private normalizeMessage(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }

  private isDuplicateCodeError(msg: string): boolean {
    const isDuplicate =
      msg.includes('ya existe') ||
      msg.includes('duplicate') ||
      msg.includes('already exists') ||
      msg.includes('duplicado');

    const isCode = msg.includes('codigo') || msg.includes('code') || msg.includes('sede.codigo');

    return isDuplicate && isCode;
  }
}
