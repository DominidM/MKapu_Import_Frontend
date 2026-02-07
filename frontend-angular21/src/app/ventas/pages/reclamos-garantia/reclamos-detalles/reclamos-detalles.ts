import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { Card } from 'primeng/card';
import { Button } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { Divider } from 'primeng/divider';
import { Toast } from 'primeng/toast';

import { ReclamosService, Reclamo, EstadoReclamo } from '../../../../core/services/reclamo.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-reclamos-detalles',
  standalone: true,
  imports: [CommonModule, Card, Button, Tag, Toast],
  providers: [MessageService],
  templateUrl: './reclamos-detalles.html',
  styleUrl: './reclamos-detalles.css',
})
export class ReclamosDetalles implements OnInit, OnDestroy {
  tituloKicker = 'VENTAS - RECLAMOS Y GARANTÍAS';
  subtituloKicker = 'DETALLE DEL RECLAMO';
  iconoCabecera = 'pi pi-file';

  private subscriptions = new Subscription();

  idReclamo = 0;
  reclamo: Reclamo | null = null;

  cargando = false;

  garantiaVigente = false;
  diasRestantes = 0;

  Math = Math;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private reclamosService: ReclamosService,
    private messageService: MessageService,
  ) {}

  ngOnInit(): void {
    this.cargarReclamo();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  cargarReclamo(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'ID de reclamo no especificado',
        life: 3000,
      });
      this.volver();
      return;
    }

    this.idReclamo = parseInt(id, 10);
    this.cargando = true;

    const sub = this.reclamosService.getReclamoPorId(this.idReclamo).subscribe({
      next: (reclamo) => {
        this.cargando = false;

        if (!reclamo) {
          this.messageService.add({
            severity: 'error',
            summary: 'No encontrado',
            detail: 'El reclamo no existe',
            life: 3000,
          });
          this.volver();
          return;
        }

        this.reclamo = reclamo;
        this.validarGarantia();

        this.messageService.add({
          severity: 'success',
          summary: 'Reclamo cargado',
          detail: `Reclamo #${reclamo.id_reclamo}`,
          life: 2000,
        });
      },
      error: (error) => {
        console.error('Error al cargar reclamo:', error);
        this.cargando = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cargar el reclamo',
          life: 3000,
        });
        this.volver();
      },
    });

    this.subscriptions.add(sub);
  }

  validarGarantia(): void {
    if (!this.reclamo) return;

    this.garantiaVigente = this.reclamosService.validarGarantia(this.reclamo.fecha_compra);
    this.diasRestantes = this.reclamosService.calcularDiasRestantes(this.reclamo.fecha_compra);
  }

  getEstadoSeverity(estado: EstadoReclamo): 'success' | 'info' | 'warn' | 'danger' {
    switch (estado) {
      case EstadoReclamo.RESUELTO:
        return 'success';
      case EstadoReclamo.EN_PROCESO:
        return 'info';
      case EstadoReclamo.PENDIENTE:
        return 'warn';
      case EstadoReclamo.RECHAZADO:
        return 'danger';
      default:
        return 'info';
    }
  }

  getEstadoIcon(estado: EstadoReclamo): string {
    switch (estado) {
      case EstadoReclamo.RESUELTO:
        return 'pi pi-check-circle';
      case EstadoReclamo.EN_PROCESO:
        return 'pi pi-spin pi-cog';
      case EstadoReclamo.PENDIENTE:
        return 'pi pi-clock';
      case EstadoReclamo.RECHAZADO:
        return 'pi pi-times-circle';
      default:
        return 'pi pi-info-circle';
    }
  }

  volver(): void {
    this.router.navigate(['/ventas/reclamos-listado']);
  }

  irAEditar(): void {
    if (!this.reclamo) return;
    this.router.navigate(['/ventas/reclamos/editar', this.reclamo.id_reclamo]);
  }

  formatearFecha(fecha: Date): string {
    return new Date(fecha).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
