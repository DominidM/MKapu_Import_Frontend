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

  readonly loading = this.sedeService.loading;
  readonly error = this.sedeService.error;

  readonly searchTerm = signal<string>('');

  readonly sedes = computed(() => this.sedeService.sedes());
  readonly inactiveSedes = computed(() => this.sedes().filter(s => s.activo === false));

  readonly filteredSedes = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const base = this.inactiveSedes();

    if (!term) return base;

    return base.filter(s =>
      [s.codigo, s.nombre, s.ciudad].some(f => f.toLowerCase().includes(term))
    );
  });

  readonly sedeSuggestions = computed(() => this.filteredSedes());

  ngOnInit(): void {
    this.sedeService.loadSedes('Administrador').subscribe();
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

  confirmDelete(sede: Headquarter): void {
  }
}