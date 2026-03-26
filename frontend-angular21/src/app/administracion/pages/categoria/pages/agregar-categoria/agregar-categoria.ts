import { CommonModule } from '@angular/common';
import { Component, ViewChild, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { Message } from 'primeng/message';
import { Observable, Subject } from 'rxjs';
import { CanComponentDeactivate } from '../../../../../core/guards/pending-changes.guard';
import { CategoriaService } from '../../../../services/categoria.service';

@Component({
  selector: 'app-agregar-categoria',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ButtonModule,
    CardModule,
    DividerModule,
    InputTextModule,
    ConfirmDialogModule,
    ToastModule,
    Message,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './agregar-categoria.html',
  styleUrl: './agregar-categoria.css',
})
export class AgregarCategoria implements CanComponentDeactivate {
  @ViewChild('categoriaForm') categoriaForm?: NgForm;

  private allowNavigate = false;
  submitted = false;

  private readonly categoriaService = inject(CategoriaService);
  readonly loading = this.categoriaService.loading;
  readonly error = this.categoriaService.error;

  categoria = {
    nombre: '',
    descripcion: '',
  };

  constructor(
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private router: Router
  ) {}

  /**
   * Limpia espacios invisibles múltiples mientras se escribe y pasa a mayúsculas.
   */
  onInputChange(field: 'nombre' | 'descripcion'): void {
    let value = this.categoria[field] || '';
    
    // Reemplaza múltiples espacios consecutivos por uno solo y lo pasa a Mayúsculas
    value = value.replace(/\s+/g, ' ').toUpperCase();
    
    this.categoria[field] = value;
  }

  /**
   * Bloquea caracteres especiales de teclado (Solo letras, números y espacios).
   */
  onlyLettersAndNumbers(event: KeyboardEvent): boolean {
    const regex = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]$/;
    const allowedKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'];

    if (allowedKeys.includes(event.key)) {
      return true;
    }

    return regex.test(event.key);
  }

  saveCategoria(form: NgForm): void {
    this.submitted = true;

    if (form.invalid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Campos incompletos',
        detail: 'Completa los campos obligatorios para registrar la categoría.',
      });
      return;
    }

    // El .trim() final elimina espacios vacíos que hayan quedado en los extremos.
    const payload = {
      nombre: this.categoria.nombre.trim(),
      descripcion: this.categoria.descripcion.trim(),
    };

    this.categoriaService.createCategoria(payload, 'Administrador').subscribe({
      next: (created) => {
        this.allowNavigate = true;
        this.messageService.add({
          severity: 'success',
          summary: 'Categoría registrada',
          detail: `Se registró la categoría ${created.nombre}.`,
        });
        setTimeout(() => this.router.navigate(['/admin/categoria']), 1500);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo registrar la categoría.',
        });
      },
    });
  }

  confirmCancel(): void {
    if (!this.categoriaForm?.dirty) {
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
    if (this.allowNavigate || !this.categoriaForm?.dirty) return true;
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
      detail: 'Se canceló el registro de la categoría.',
    });
    setTimeout(() => this.router.navigate(['/admin/categoria']), 1500);
  }
}