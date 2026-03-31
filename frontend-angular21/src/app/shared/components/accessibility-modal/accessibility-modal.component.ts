import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { AccessibilityService, AccessibilitySettings } from '../../../administracion/services/accessibility.service';

@Component({
  selector: 'app-accessibility-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    SelectModule,
    CheckboxModule,
  ],
  template: `
    <p-dialog
      [(visible)]="visible"
      [modal]="true"
      [draggable]="false"
      [style]="{ width: '600px' }"
      [contentStyle]="{ padding: '0' }"
      header="Opciones de Accesibilidad"
      (onHide)="closeModal()">

      <div class="accessibility-content p-4">
        <!-- Tamaño de fuente -->
        <div class="accessibility-section mb-4">
          <label class="font-bold mb-2 block">Tamaño de Fuente</label>
          <p-select
            [(ngModel)]="currentSettings.fontSize"
            (onChange)="onFontSizeChange($event)"
            [options]="fontSizeOptions"
            optionLabel="label"
            optionValue="value"
            styleClass="w-full">
          </p-select>
          <small class="text-500 mt-2 block">
            Ajusta el tamaño de las letras según tu preferencia
          </small>
        </div>

        <!-- Alto contraste -->
        <div class="accessibility-section mb-4">
          <div class="flex align-items-center gap-2">
            <p-checkbox
              [(ngModel)]="currentSettings.highContrast"
              [binary]="true"
              (onChange)="onHighContrastChange($event)">
            </p-checkbox>
            <div>
              <label class="font-bold mb-2 block">Alto Contraste</label>
              <small class="text-500">Aumenta el contraste de colores</small>
            </div>
          </div>
        </div>

        <!-- Modo lectura -->
        <div class="accessibility-section mb-4">
          <div class="flex align-items-center gap-2">
            <p-checkbox
              [(ngModel)]="currentSettings.readingMode"
              [binary]="true"
              (onChange)="onReadingModeChange($event)">
            </p-checkbox>
            <div>
              <label class="font-bold mb-2 block">Modo Lectura</label>
              <small class="text-500">Simplifica la interfaz para lectura</small>
            </div>
          </div>
        </div>

        <!-- Navegación por teclado -->
        <div class="accessibility-section">
          <div class="flex align-items-center gap-2">
            <p-checkbox
              [(ngModel)]="currentSettings.keyboardNavigation"
              [binary]="true"
              (onChange)="onKeyboardNavigationChange($event)">
            </p-checkbox>
            <div>
              <label class="font-bold mb-2 block">Navegación por Teclado</label>
              <small class="text-500">Mejora la navegación con teclado</small>
            </div>
          </div>
        </div>
      </div>

      <ng-template pTemplate="footer">
        <p-button
          label="Restablecer predeterminados"
          icon="pi pi-refresh"
          severity="secondary"
          [outlined]="true"
          (click)="resetSettings()">
        </p-button>
        <p-button
          label="Cerrar"
          icon="pi pi-times"
          (click)="closeModal()">
        </p-button>
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    :host ::ng-deep {
      .accessibility-content {
        .accessibility-section {
          padding: 1rem;
          border-bottom: 1px solid var(--surface-border);
          border-radius: 4px;
          background: var(--surface-50);
        }
      }
    }
  `],
})
export class AccessibilityModalComponent {
  private accessibilitySvc = inject(AccessibilityService);

  visible = signal(false);
  currentSettings: AccessibilitySettings = {
    fontSize: 'normal',
    highContrast: false,
    readingMode: false,
    keyboardNavigation: true,
  };

  fontSizeOptions = [
    { label: 'Normal', value: 'normal' },
    { label: 'Medio', value: 'medium' },
    { label: 'Grande', value: 'large' },
    { label: 'Muy Grande', value: 'xlarge' },
  ];

  constructor() {
    const settings = this.accessibilitySvc.getSettings();
    this.currentSettings = { ...settings };
  }

  openModal() {
    const settings = this.accessibilitySvc.getSettings();
    this.currentSettings = { ...settings };
    this.visible.set(true);
  }

  closeModal() {
    this.visible.set(false);
  }

  onFontSizeChange(event: any) {
    this.accessibilitySvc.updateSettings({
      fontSize: event.value,
    });
  }

  onHighContrastChange(event: any) {
    this.accessibilitySvc.updateSettings({
      highContrast: event.checked,
    });
    this.currentSettings.highContrast = event.checked;
  }

  onReadingModeChange(event: any) {
    this.accessibilitySvc.updateSettings({
      readingMode: event.checked,
    });
    this.currentSettings.readingMode = event.checked;
  }

  onKeyboardNavigationChange(event: any) {
    this.accessibilitySvc.updateSettings({
      keyboardNavigation: event.checked,
    });
    this.currentSettings.keyboardNavigation = event.checked;
  }

  resetSettings() {
    this.accessibilitySvc.resetSettings();
    const settings = this.accessibilitySvc.getSettings();
    this.currentSettings = { ...settings };
  }
}