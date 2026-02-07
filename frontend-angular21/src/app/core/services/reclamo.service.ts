// core/services/reclamo.service.ts
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export enum EstadoReclamo {
  PENDIENTE = 'PENDIENTE',
  EN_PROCESO = 'EN_PROCESO',
  RESUELTO = 'RESUELTO',
  RECHAZADO = 'RECHAZADO'
}

export interface Reclamo {
  id_reclamo: number;
  id_sede: string;
  serie_comprobante: string;
  numero_comprobante: number;
  fecha_compra: Date;
  fecha_registro: Date;
  fecha_resolucion?: Date;
  cliente_dni: string;
  cliente_nombre: string;
  cliente_telefono: string;
  cliente_email: string;
  cod_producto: string;
  descripcion_producto: string;
  motivo: string;
  descripcion_problema: string;
  estado: EstadoReclamo;
  solucion?: string;
  responsable?: string;
  observaciones?: string;
}

export interface CambioEstado {
  fecha: Date;
  estadoAnterior: EstadoReclamo;
  estadoNuevo: EstadoReclamo;
  usuario: string;
  observacion: string;
}

export interface EstadisticasReclamos {
  total: number;
  pendientes: number;
  en_proceso: number;
  resueltos: number;
  rechazados: number;
  porcentaje_resueltos: number;
  tiempo_promedio_resolucion: number;
}

export interface EstadoOption {
  label: string;
  value: EstadoReclamo;
  icon: string;
  severity: 'success' | 'info' | 'warn' | 'danger';
}

@Injectable({
  providedIn: 'root'
})
export class ReclamosService {
  private reclamos: Reclamo[] = [
    {
      id_reclamo: 1,
      id_sede: 'SEDE001',
      serie_comprobante: 'B001',
      numero_comprobante: 1523,
      fecha_compra: new Date('2026-01-15'),
      fecha_registro: new Date('2026-01-20'),
      cliente_dni: '71234567',
      cliente_nombre: 'Carlos Mendoza Ríos',
      cliente_telefono: '987654321',
      cliente_email: 'carlos.mendoza@email.com',
      cod_producto: 'PROD-001',
      descripcion_producto: 'Licuadora Industrial 2000W',
      motivo: 'Producto defectuoso',
      descripcion_problema: 'La licuadora deja de funcionar después de 5 minutos de uso',
      estado: EstadoReclamo.PENDIENTE,
      observaciones: 'Cliente solicita cambio inmediato'
    },
    {
      id_reclamo: 2,
      id_sede: 'SEDE001',
      serie_comprobante: 'F001',
      numero_comprobante: 892,
      fecha_compra: new Date('2026-01-10'),
      fecha_registro: new Date('2026-01-18'),
      fecha_resolucion: new Date('2026-01-25'),
      cliente_dni: '20512345678',
      cliente_nombre: 'Inversiones del Sur SAC',
      cliente_telefono: '945678123',
      cliente_email: 'ventas@inversionesdelsur.com',
      cod_producto: 'PROD-045',
      descripcion_producto: 'Refrigeradora Comercial 450L',
      motivo: 'No enfría correctamente',
      descripcion_problema: 'El equipo no mantiene la temperatura adecuada',
      estado: EstadoReclamo.RESUELTO,
      solucion: 'Se realizó cambio de compresor bajo garantía',
      responsable: 'José Pérez',
      observaciones: 'Cliente satisfecho con la solución'
    }
  ];

  private historialCambios: Map<number, CambioEstado[]> = new Map();

  constructor() {}

  getReclamos(): Observable<Reclamo[]> {
    return of(this.reclamos);
  }

  getReclamoPorId(id: number): Observable<Reclamo | undefined> {
    return of(this.reclamos.find(r => r.id_reclamo === id));
  }

  crearReclamo(reclamo: Omit<Reclamo, 'id_reclamo'>): Observable<Reclamo> {
    const nuevoId = Math.max(...this.reclamos.map(r => r.id_reclamo)) + 1;
    const nuevoReclamo: Reclamo = {
      ...reclamo,
      id_reclamo: nuevoId
    };
    this.reclamos.push(nuevoReclamo);
    return of(nuevoReclamo);
  }

  actualizarReclamo(id: number, datos: Partial<Reclamo>): Observable<Reclamo | undefined> {
    const index = this.reclamos.findIndex(r => r.id_reclamo === id);
    if (index !== -1) {
      this.reclamos[index] = { ...this.reclamos[index], ...datos };
      return of(this.reclamos[index]);
    }
    return of(undefined);
  }

  registrarCambioEstado(
    idReclamo: number,
    estadoAnterior: EstadoReclamo,
    estadoNuevo: EstadoReclamo,
    usuario: string,
    observacion: string = ''
  ): void {
    const cambio: CambioEstado = {
      fecha: new Date(),
      estadoAnterior,
      estadoNuevo,
      usuario,
      observacion
    };

    if (!this.historialCambios.has(idReclamo)) {
      this.historialCambios.set(idReclamo, []);
    }

    this.historialCambios.get(idReclamo)?.push(cambio);
  }

  getHistorialCambios(idReclamo: number): CambioEstado[] {
    return this.historialCambios.get(idReclamo) || [];
  }

  getEstadosOptions(): EstadoOption[] {
    return [
      { 
        label: 'Pendiente', 
        value: EstadoReclamo.PENDIENTE, 
        icon: 'pi pi-clock', 
        severity: 'warn' 
      },
      {
        label: 'En Proceso',
        value: EstadoReclamo.EN_PROCESO,
        icon: 'pi pi-spin pi-cog',
        severity: 'info'
      },
      {
        label: 'Resuelto',
        value: EstadoReclamo.RESUELTO,
        icon: 'pi pi-check-circle',
        severity: 'success'
      },
      {
        label: 'Rechazado',
        value: EstadoReclamo.RECHAZADO,
        icon: 'pi pi-times-circle',
        severity: 'danger'
      }
    ];
  }

  getEstadisticas(): EstadisticasReclamos {
    const total = this.reclamos.length;
    const pendientes = this.reclamos.filter(r => r.estado === EstadoReclamo.PENDIENTE).length;
    const en_proceso = this.reclamos.filter(r => r.estado === EstadoReclamo.EN_PROCESO).length;
    const resueltos = this.reclamos.filter(r => r.estado === EstadoReclamo.RESUELTO).length;
    const rechazados = this.reclamos.filter(r => r.estado === EstadoReclamo.RECHAZADO).length;
    
    const porcentaje_resueltos = total > 0 ? (resueltos / total) * 100 : 0;
    
    const reclamosResueltos = this.reclamos.filter(r => r.estado === EstadoReclamo.RESUELTO && r.fecha_resolucion);
    const tiempo_promedio_resolucion = reclamosResueltos.length > 0
      ? reclamosResueltos.reduce((acc, r) => {
          const dias = Math.ceil((r.fecha_resolucion!.getTime() - r.fecha_registro.getTime()) / (1000 * 60 * 60 * 24));
          return acc + dias;
        }, 0) / reclamosResueltos.length
      : 0;

    return {
      total,
      pendientes,
      en_proceso,
      resueltos,
      rechazados,
      porcentaje_resueltos,
      tiempo_promedio_resolucion
    };
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

  getEstadoLabel(estado: EstadoReclamo): string {
    switch (estado) {
      case EstadoReclamo.PENDIENTE:
        return 'Pendiente';
      case EstadoReclamo.EN_PROCESO:
        return 'En Proceso';
      case EstadoReclamo.RESUELTO:
        return 'Resuelto';
      case EstadoReclamo.RECHAZADO:
        return 'Rechazado';
      default:
        return estado;
    }
  }

  calcularDiasTranscurridos(fecha: Date): number {
    const hoy = new Date();
    return Math.ceil((hoy.getTime() - new Date(fecha).getTime()) / (1000 * 60 * 60 * 24));
  }

  calcularDiasRestantes(fechaCompra: Date): number {
    const DIAS_GARANTIA = 60;
    const fechaLimite = new Date(fechaCompra);
    fechaLimite.setDate(fechaLimite.getDate() + DIAS_GARANTIA);
    const hoy = new Date();
    const diasRestantes = Math.ceil((fechaLimite.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
    return diasRestantes;
  }

  validarGarantia(fechaCompra: Date): boolean {
    return this.calcularDiasRestantes(fechaCompra) > 0;
  }

  formatearComprobante(serie: string, numero: number): string {
    return `${serie}-${numero.toString().padStart(8, '0')}`;
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

  construirObservaciones(
    observacionesActuales: string,
    nuevaObservacion: string,
    empleado: string,
    estadoAnterior?: EstadoReclamo,
    estadoNuevo?: EstadoReclamo
  ): string {
    let observacionesActualizadas = observacionesActuales || '';
    const timestamp = new Date().toLocaleString('es-PE');

    if (nuevaObservacion.trim()) {
      observacionesActualizadas += `\n\n[${timestamp} - ${empleado}]\n${nuevaObservacion.trim()}`;
    }

    if (estadoAnterior && estadoNuevo && estadoAnterior !== estadoNuevo) {
      observacionesActualizadas += `\n\n[${timestamp}] Estado cambiado de "${estadoAnterior}" a "${estadoNuevo}" por ${empleado}`;
    }

    return observacionesActualizadas;
  }
}
