import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-support-modal',
  standalone: true,
  imports: [CommonModule, DialogModule, ButtonModule],
  template: `
    <p-dialog
      [(visible)]="visible"
      [modal]="true"
      [draggable]="false"
      [style]="{ width: '500px' }"
      [contentStyle]="{ padding: '0' }"
      header="Soporte Técnico"
      (onHide)="closeModal()">

      <div class="support-content p-4">
        <div class="flex flex-column gap-3">
          <div class="support-header">
            <i class="pi pi-info-circle text-primary" style="font-size: 2rem;"></i>
            <h3>¿Necesitas ayuda?</h3>
            <p class="text-500">
              Contáctanos a través de WhatsApp para soporte técnico
            </p>
          </div>

          <div class="support-info support-info-blue p-3 border-round">
            <p class="font-bold">📱 Número de WhatsApp:</p>
            <p class="text-lg font-medium">{{ whatsappNumber }}</p>
          </div>

          <div class="support-info support-info-yellow p-3 border-round">
            <p class="font-bold">⏰ Horario de Atención:</p>
            <p class="text-sm">Lunes a Viernes de 9:00 a 18:00 (UTC-5)</p>
          </div>

          <div class="support-info support-info-green p-3 border-round">
            <p class="font-bold">❓ Preguntas Frecuentes:</p>
            <ul class="list-none p-0 mt-2 text-sm">
              <li>✓ ¿Cómo cambiar mi contraseña?</li>
              <li>✓ ¿Cómo reportar un error?</li>
              <li>✓ ¿Cómo acceder a mis datos?</li>
            </ul>
          </div>
        </div>
      </div>

      <ng-template pTemplate="footer">
        <p-button
          [label]="'Abrir WhatsApp'"
          icon="pi pi-phone"
          (click)="openWhatsApp()">
        </p-button>
        <p-button
          label="Cerrar"
          icon="pi pi-times"
          severity="secondary"
          [outlined]="true"
          (click)="closeModal()">
        </p-button>
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    :host ::ng-deep {
      .support-content {
        .support-header {
          text-align: center;
          margin-bottom: 1rem;

          h3 {
            margin: 0.5rem 0 0 0;
            font-size: 1.25rem;
            color: var(--text-color);
          }

          p {
            margin: 0.5rem 0 0 0;
            color: var(--text-color-secondary);
          }
        }

        .support-info {
          p {
            margin: 0;
            color: var(--text-color);

            &.font-bold {
              margin-bottom: 0.5rem;
              font-weight: 600;
            }

            &.text-lg {
              color: var(--text-color);
            }
          }

          ul {
            list-style: none;

            li {
              color: var(--text-color);
            }
          }

          /* Modo claro */
          &.support-info-blue {
            background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%);
            border-left: 4px solid var(--blue-500);
          }

          &.support-info-yellow {
            background: linear-gradient(135deg, rgba(234, 179, 8, 0.1) 0%, rgba(234, 179, 8, 0.05) 100%);
            border-left: 4px solid var(--yellow-500);
          }

          &.support-info-green {
            background: linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(34, 197, 94, 0.05) 100%);
            border-left: 4px solid var(--green-500);
          }
        }

        /* Modo oscuro */
        @media (prefers-color-scheme: dark) {
          .support-info {
            &.support-info-blue {
              background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0.08) 100%);
              border-left: 4px solid var(--blue-400);
            }

            &.support-info-yellow {
              background: linear-gradient(135deg, rgba(234, 179, 8, 0.15) 0%, rgba(234, 179, 8, 0.08) 100%);
              border-left: 4px solid var(--yellow-400);
            }

            &.support-info-green {
              background: linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(34, 197, 94, 0.08) 100%);
              border-left: 4px solid var(--green-400);
            }
          }
        }

        /* Alto contraste */
        @media (prefers-contrast: more) {
          .support-info {
            &.support-info-blue {
              background: var(--blue-50);
              border: 2px solid var(--blue-600);
              border-left: 4px solid var(--blue-600);
            }

            &.support-info-yellow {
              background: var(--yellow-50);
              border: 2px solid var(--yellow-600);
              border-left: 4px solid var(--yellow-600);
            }

            &.support-info-green {
              background: var(--green-50);
              border: 2px solid var(--green-600);
              border-left: 4px solid var(--green-600);
            }
          }
        }
      }
    }
  `],
})
export class SupportModalComponent {
  visible = signal(false);
  whatsappNumber = '+51987654321'; // Cambia con tu número

  openModal() {
    this.visible.set(true);
  }

  closeModal() {
    this.visible.set(false);
  }

  openWhatsApp() {
    const message = encodeURIComponent(
      'Hola, necesito soporte técnico con el sistema.'
    );
    const url = `https://wa.me/${this.whatsappNumber.replace(/\D/g, '')}?text=${message}`;
    window.open(url, '_blank');
  }
}