// ventas/pages/reclamos-garantia/reclamos-listado/reclamos-listado.ts
import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Card }        from 'primeng/card';
import { Button }      from 'primeng/button';
import { TableModule } from 'primeng/table';
import { Tag }         from 'primeng/tag';
import { InputText }   from 'primeng/inputtext';
import { Select }      from 'primeng/select';
import { Tooltip }     from 'primeng/tooltip';
import { Toast }       from 'primeng/toast';
import { MessageService } from 'primeng/api';

import {
  ClaimService,
  ClaimResponseDto,
  ClaimStatus,
} from '../../../../core/services/claim.service';

@Component({
  selector: 'app-reclamos-listado',
  standalone: true,
  imports: [CommonModule, FormsModule, Card, Button, TableModule, Tag, InputText, Select, Tooltip, Toast],
  providers: [MessageService],
  templateUrl: './reclamos-listado.html',
  styleUrl: './reclamos-listado.css',
})
export class ReclamosListado implements OnInit {

  tituloKicker    = 'VENTAS - RECLAMOS Y GARANTÍAS';
  subtituloKicker = 'GESTIÓN DE RECLAMOS';
  iconoCabecera   = 'pi pi-shield';

  private router          = inject(Router);
  readonly claimService   = inject(ClaimService);
  private messageService  = inject(MessageService);

  // ── Filtros locales ──────────────────────────────────────────────
  filtroEstado: ClaimStatus | null = null;
  filtroBusqueda = '';

  estadosOptions = [
    { label: 'Todos',      value: null                   },
    { label: 'Registrado', value: ClaimStatus.REGISTRADO },
    { label: 'En Proceso', value: ClaimStatus.EN_PROCESO },
    { label: 'Resuelto',   value: ClaimStatus.RESUELTO   },
    { label: 'Rechazado',  value: ClaimStatus.RECHAZADO  },
  ];

  // ── Computed filtrado ────────────────────────────────────────────
  get reclamosFiltrados(): ClaimResponseDto[] {
    const q   = this.filtroBusqueda.toLowerCase().trim();
    const est = this.filtroEstado;

    return this.claimService.claims().filter(c => {
      const matchQ   = !q   || String(c.receiptId).includes(q) ||
                               c.reason.toLowerCase().includes(q) ||
                               c.description.toLowerCase().includes(q);
      const matchEst = !est || c.status === est;
      return matchQ && matchEst;
    });
  }

  // ── Init ─────────────────────────────────────────────────────────
  async ngOnInit(): Promise<void> {
    // Carga todos los reclamos — ajusta si tienes endpoint GET /claims
    // Por ahora cargamos vacío; se llena cuando el usuario filtra por comprobante
    // Si tu backend tiene GET /claims (lista general), agrégalo aquí:
    // await this.claimService.getAll();
  }

  // ── Acciones ─────────────────────────────────────────────────────
  nuevoReclamo(): void {
    const base = this.getBase();
    this.router.navigate([`${base}/crear`]);
  }

  verDetalle(id: number): void {
    this.router.navigate([`${this.getBase()}/detalle`, id]);
  }

  editarReclamo(id: number): void {
    this.router.navigate([`${this.getBase()}/editar`, id]);
  }

  limpiarFiltros(): void {
    this.filtroEstado   = null;
    this.filtroBusqueda = '';
  }

  // ── Helpers ───────────────────────────────────────────────────────
  private getBase(): string {
    return this.router.url.startsWith('/admin')
      ? '/admin/reclamos-listado'
      : '/ventas/reclamos-listado';
  }

  getStatusLabel(status: ClaimStatus)    { return this.claimService.getStatusLabel(status); }
  getStatusSeverity(status: ClaimStatus) { return this.claimService.getStatusSeverity(status); }
  formatDate(iso: string)                { return this.claimService.formatDate(iso); }
  diasDesde(iso: string)                 { return this.claimService.calcularDiasDesdeRegistro(iso); }
}