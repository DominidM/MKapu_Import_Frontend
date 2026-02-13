import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageModule } from 'primeng/message';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';

import { ConfirmationService, MessageService } from 'primeng/api';

import { SedeService } from '../../../../services/sede.service';
import { Headquarter } from '../../../../interfaces/sedes.interface';

type ViewMode = 'activas' | 'inactivas';

@Component({
  selector: 'app-sedes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,

    CardModule,
    ButtonModule,
    AutoCompleteModule,
    TableModule,
    TagModule,
    ToastModule,
    ConfirmDialogModule,
    MessageModule,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './sedes.html',
  styleUrl: './sedes.css',
})
export class Sedes implements OnInit {
  private readonly sedeService = inject(SedeService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  readonly loading = this.sedeService.loading;
  readonly error = this.sedeService.error;

  // Toggle 
  readonly viewMode = signal<ViewMode>('inactivas');

  readonly searchTerm = signal<string>('');
  readonly sedes = computed(() => this.sedeService.sedes());

  readonly activeSedes = computed(() => this.sedes().filter((s) => s.activo === true));
  readonly inactiveSedes = computed(() => this.sedes().filter((s) => s.activo === false));

  readonly visibleSedes = computed(() =>
    this.viewMode() === 'activas' ? this.activeSedes() : this.inactiveSedes()
  );

  readonly filteredSedes = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const base = this.visibleSedes();

    if (!term) return base;

    return base.filter((s) =>
      [s.codigo, s.nombre, s.ciudad].some((f) =>
        String(f ?? '').toLowerCase().includes(term)
      )
    );
  });

  readonly sedeSuggestions = computed(() => this.filteredSedes());

  ngOnInit(): void {
    this.sedeService.loadSedes('Administrador').subscribe();
  }

  setViewMode(mode: ViewMode): void {
    this.viewMode.set(mode);
    this.clearSearch();
  }

  onSearch(event: { query: string }): void {
    this.searchTerm.set(event.query);
  }

  onSearchChange(term: unknown): void {
    if (typeof term === 'string') {
      this.searchTerm.set(term);
      return;
    }
    if (term && typeof term === 'object' && 'nombre' in (term as any)) {
      this.searchTerm.set(String((term as any).nombre ?? ''));
      return;
    }
    this.searchTerm.set('');
  }

  onSelectSede(event: any): void {
    const value = event?.value?.nombre ?? '';
    this.searchTerm.set(String(value));
  }

  clearSearch(): void {
    this.searchTerm.set('');
  }

  // Acción dinámica según modo:
  // - en INACTIVAS => Activar (status=true)
  // - en ACTIVAS   => Desactivar (status=false)
  confirmToggleStatus(sede: Headquarter): void {
    const activating = this.viewMode() === 'inactivas';
    const nextStatus = activating ? true : false;

    const verb = activating ? 'activar' : 'desactivar';
    const acceptLabel = activating ? 'Activar' : 'Desactivar';
    const acceptSeverity = activating ? 'success' : 'danger';

    this.confirmationService.confirm({
      header: 'Confirmación',
      message: `¿Deseas ${verb} la sede ${sede.nombre} (${sede.codigo})?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel,
      rejectLabel: 'Cancelar',
      acceptButtonProps: { severity: acceptSeverity as any },
      rejectButtonProps: { severity: 'secondary', outlined: true },
      accept: () => {
        this.sedeService
          .updateSedeStatus(sede.id_sede, nextStatus, 'Administrador')
          .subscribe({
            next: () => {
              this.messageService.add({
                severity: 'success',
                summary: activating ? 'Sede activada' : 'Sede desactivada',
                detail: activating
                  ? `Se activó la sede ${sede.nombre}.`
                  : `Se desactivó la sede ${sede.nombre}.`,
              });
            },
            error: (err) => {
              console.error(err);
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail:
                  err?.error?.message ??
                  'No se pudo cambiar el estado de la sede.',
              });
            },
          });
      },
    });
  }
}