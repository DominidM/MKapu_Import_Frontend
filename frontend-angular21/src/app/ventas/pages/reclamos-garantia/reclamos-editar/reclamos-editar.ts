import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { Card } from 'primeng/card';
import { Button } from 'primeng/button';
import { Textarea } from 'primeng/textarea';
import { Select } from 'primeng/select';
import { Toast } from 'primeng/toast';
import { Tag } from 'primeng/tag';
import { Divider } from 'primeng/divider';
import { ConfirmDialog } from 'primeng/confirmdialog';

import { 
  ReclamosService, 
  Reclamo, 
  EstadoReclamo,
  EstadoOption 
} from '../../../../core/services/reclamo.service';
import { EmpleadosService, Empleado } from '../../../../core/services/empleados.service';
import { MessageService, ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-reclamos-editar',
  standalone: true,
  imports: [CommonModule, FormsModule, Card, Button, Textarea, Select, Toast, Tag, Divider, ConfirmDialog],
  providers: [MessageService, ConfirmationService],
  templateUrl: './reclamos-editar.html',
  styleUrl: './reclamos-editar.css',
})
export class ReclamosEditar implements OnInit, OnDestroy {
  tituloKicker = 'VENTAS - RECLAMOS Y GARANTÍAS';
  subtituloKicker = 'EDITAR RECLAMO';
  iconoCabecera = 'pi pi-file-edit';

  Math = Math;

  private subscriptions = new Subscription();
  empleadoActual: Empleado | null = null;

  idReclamo: number = 0;
  reclamo: Reclamo | null = null;
  reclamoOriginal: Reclamo | null = null;

  estadosOptions: EstadoOption[] = [];
  estadoSeleccionado: EstadoReclamo = EstadoReclamo.PENDIENTE;
  observacionesNuevas: string = '';

  guardando: boolean = false;

  garantiaVigente: boolean = false;
  diasRestantes: number = 0;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private reclamosService: ReclamosService,
    private empleadosService: EmpleadosService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
  ) {}

  ngOnInit(): void {
    this.estadosOptions = this.reclamosService.getEstadosOptions();
    this.cargarEmpleadoActual();
    this.cargarReclamo();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  cargarEmpleadoActual(): void {
    this.empleadoActual = this.empleadosService.getEmpleadoActual();

    if (!this.empleadoActual) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Sin autenticación',
        detail: 'No hay empleado logueado',
        life: 3000,
      });
    }
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
    const sub = this.reclamosService.getReclamoPorId(this.idReclamo).subscribe({
      next: (reclamo) => {
        if (reclamo) {
          this.reclamo = { ...reclamo };
          this.reclamoOriginal = { ...reclamo };
          this.estadoSeleccionado = reclamo.estado;
          this.validarGarantia();

          this.messageService.add({
            severity: 'success',
            summary: 'Reclamo cargado',
            detail: `Reclamo #${reclamo.id_reclamo}`,
            life: 2000,
          });
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'No encontrado',
            detail: 'Reclamo no existe',
            life: 3000,
          });
          this.volver();
        }
      },
      error: (error) => {
        console.error('Error al cargar reclamo:', error);
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

  onEstadoChange(): void {
    if (this.estadoSeleccionado !== this.reclamoOriginal?.estado) {
      this.messageService.add({
        severity: 'info',
        summary: 'Estado modificado',
        detail: 'Recuerde guardar los cambios',
        life: 2000,
      });
    }
  }

  hayCambios(): boolean {
    if (!this.reclamo || !this.reclamoOriginal) return false;

    return (
      this.estadoSeleccionado !== this.reclamoOriginal.estado ||
      this.observacionesNuevas.trim() !== ''
    );
  }

  confirmarGuardar(): void {
    if (!this.hayCambios()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Sin cambios',
        detail: 'No hay modificaciones para guardar',
        life: 3000,
      });
      return;
    }

    let mensaje = '¿Está seguro de guardar los cambios realizados al reclamo?';
    
    if (this.estadoSeleccionado !== this.reclamoOriginal?.estado) {
      mensaje += `\n\nCambio de estado: ${this.reclamoOriginal?.estado} → ${this.estadoSeleccionado}`;
    }

    this.confirmationService.confirm({
      header: 'Confirmar Cambios',
      message: mensaje,
      icon: 'pi pi-question-circle',
      acceptLabel: 'Confirmar',
      rejectLabel: 'Cancelar',
      acceptIcon: 'pi pi-check',
      rejectIcon: 'pi pi-times',
      accept: () => {
        this.guardarCambios();
      },
    });
  }

  guardarCambios(): void {
    if (!this.reclamo || !this.reclamoOriginal) return;

    this.guardando = true;

    const empleado = this.empleadoActual?.nombres || 'Sistema';

    const observacionesActualizadas = this.reclamosService.construirObservaciones(
      this.reclamo.observaciones || '',
      this.observacionesNuevas,
      empleado,
      this.reclamoOriginal.estado,
      this.estadoSeleccionado
    );

    const cambios: Partial<Reclamo> = {
      estado: this.estadoSeleccionado,
      observaciones: observacionesActualizadas,
    };

    if (this.estadoSeleccionado === EstadoReclamo.RESUELTO && !this.reclamo.fecha_resolucion) {
      cambios.fecha_resolucion = new Date();
    }

    setTimeout(() => {
      const sub = this.reclamosService.actualizarReclamo(this.idReclamo, cambios).subscribe({
        next: (actualizado) => {
          this.guardando = false;

          if (actualizado) {
            if (this.reclamoOriginal && this.estadoSeleccionado !== this.reclamoOriginal.estado) {
              this.reclamosService.registrarCambioEstado(
                this.idReclamo,
                this.reclamoOriginal.estado,
                this.estadoSeleccionado,
                empleado,
                this.observacionesNuevas
              );
            }

            this.messageService.add({
              severity: 'success',
              summary: 'Cambios guardados',
              detail: 'El reclamo se actualizó correctamente',
              life: 3000,
            });

            setTimeout(() => {
              this.cargarReclamo();
              this.observacionesNuevas = '';
            }, 500);
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'No se pudo actualizar el reclamo',
              life: 3000,
            });
          }
        },
        error: (error) => {
          console.error('Error al actualizar:', error);
          this.guardando = false;

          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo guardar los cambios',
            life: 3000,
          });
        },
      });

      this.subscriptions.add(sub);
    }, 1500);
  }

  cancelarEdicion(): void {
    if (this.hayCambios()) {
      this.confirmationService.confirm({
        header: 'Descartar Cambios',
        message: 'Hay cambios sin guardar. ¿Está seguro de descartar los cambios y volver al listado?',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Sí, descartar',
        rejectLabel: 'No, continuar editando',
        acceptIcon: 'pi pi-trash',
        rejectIcon: 'pi pi-arrow-left',
        acceptButtonStyleClass: 'p-button-danger',
        rejectButtonStyleClass: 'p-button-secondary p-button-outlined',
        accept: () => {
          this.volver();
        },
      });
    } else {
      this.volver();
    }
  }

  volver(): void {
    this.router.navigate(['/ventas/reclamos-listado']);
  }

  verDetalle(): void {
    if (this.idReclamo) {
      this.router.navigate(['/ventas/reclamos/detalle', this.idReclamo]);
    }
  }

  getEstadoSeverity(estado: EstadoReclamo): 'success' | 'info' | 'warn' | 'danger' {
    return this.reclamosService.getEstadoSeverity(estado);
  }

  getEstadoIcon(estado: EstadoReclamo): string {
    return this.reclamosService.getEstadoIcon(estado);
  }

  formatearFecha(fecha: Date): string {
    return this.reclamosService.formatearFecha(fecha);
  }
}
