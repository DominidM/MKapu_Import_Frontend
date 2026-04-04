import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Card } from 'primeng/card';
import { Button } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { Toast } from 'primeng/toast';
import { Tooltip } from 'primeng/tooltip';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';

type TipoComprobante = 'Boleta' | 'Factura' | 'Nota de Crédito';
type EstadoComprobante = 'EMITIDO' | 'ANULADO' | 'PENDIENTE' | 'RECHAZADO';
type Moneda = 'PEN' | 'USD';

interface Comprobante {
  idComprobante: number;
  serie: string;
  numero: number;
  tipoComprobante: TipoComprobante;
  fechaEmision: Date;
  fechaVencimiento: Date;
  clienteNombre: string;
  clienteDocumento: string;
  moneda: Moneda;
  baseImponible: number;
  igv: number;
  total: number;
  estado: EstadoComprobante;
  responsable: string;
  observacion?: string;
}

function generarMockDetalle(): Comprobante[] {
  const tipos: TipoComprobante[]         = ['Boleta', 'Boleta', 'Factura', 'Factura', 'Nota de Crédito'];
  const estados: EstadoComprobante[]     = ['EMITIDO', 'EMITIDO', 'EMITIDO', 'ANULADO', 'PENDIENTE', 'RECHAZADO'];
  const monedas: Moneda[]                = ['PEN', 'PEN', 'PEN', 'USD'];
  const series: Record<TipoComprobante, string> = {
    Boleta: 'B001', Factura: 'F001', 'Nota de Crédito': 'NC01',
  };
  const clientes = [
    { nombre: 'IMPORTACIONES SANTA ROSA S.A.C.', doc: '20512345678' },
    { nombre: 'DISTRIBUIDORA EL SOL E.I.R.L.',   doc: '20498765432' },
    { nombre: 'FERRETERÍA LOS ANDES S.R.L.',      doc: '20387654321' },
    { nombre: 'Juan Carlos Mendoza Torres',        doc: '43256789'   },
    { nombre: 'María Elena Quispe Huanca',         doc: '47891234'   },
    { nombre: 'CONSTRUCTORA PERUANA S.A.',         doc: '20123456789' },
    { nombre: 'FARMACIA VIDA SANA E.I.R.L.',       doc: '20654321987' },
    { nombre: 'Carlos Alberto Ramos Díaz',         doc: '46123456'   },
    { nombre: 'TEXTILES NORTE S.A.C.',             doc: '20789012345' },
    { nombre: 'INVERSIONES PACÍFICO S.R.L.',       doc: '20345678901' },
    { nombre: 'Ana Sofía Villanueva Prado',        doc: '48765432'   },
    { nombre: 'SERVICIOS GENERALES LIMA S.A.C.',   doc: '20901234567' },
  ];
  const responsables = [
    'Luis García Rivera',
    'Carmen López Vega',
    'Roberto Silva Castillo',
    'Patricia Morales Ruiz',
    'Miguel Ángel Torres',
  ];

  const s = (i: number, max: number) => i % max;

  return Array.from({ length: 45 }, (_, i) => {
    const tipo    = tipos[s(i * 3, tipos.length)];
    const moneda  = monedas[s(i * 7, monedas.length)];
    const base    = parseFloat((((i + 1) * 137.5) % 4800 + 200).toFixed(2));
    const igv     = parseFloat((base * 0.18).toFixed(2));
    const total   = parseFloat((base + igv).toFixed(2));
    const cliente = clientes[s(i * 5, clientes.length)];
    const diasAtras = (i * 2) % 90 + 1;
    const emision   = new Date(Date.now() - diasAtras * 86_400_000);
    const venc      = new Date(emision.getTime() + ((i % 45) + 15) * 86_400_000);

    return {
      idComprobante:    i + 1,
      serie:            series[tipo],
      numero:           1000 + i + 1,
      tipoComprobante:  tipo,
      fechaEmision:     emision,
      fechaVencimiento: venc,
      clienteNombre:    cliente.nombre,
      clienteDocumento: cliente.doc,
      moneda,
      baseImponible:    base,
      igv,
      total,
      estado:           estados[s(i * 11, estados.length)],
      responsable:      responsables[s(i * 4, responsables.length)],
      observacion:      i % 3 === 0 ? 'Pago a 30 días según acuerdo comercial.' : undefined,
    };
  });
}

const MOCK_DETALLE = generarMockDetalle();

@Component({
  selector: 'app-detalle-comprobante',
  standalone: true,
  imports: [CommonModule, Card, Button, Tag, Toast, Tooltip, ConfirmDialog],
  providers: [MessageService, ConfirmationService],
  templateUrl: './detalle-comprobante.html',
  styleUrl: './detalle-comprobante.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetalleComprobante implements OnInit {
  private readonly route               = inject(ActivatedRoute);
  private readonly router              = inject(Router);
  private readonly messageService      = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly cdr                 = inject(ChangeDetectorRef);

  comprobante = signal<Comprobante | null>(null);
  loading     = signal(true);
  notFound    = signal(false);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    setTimeout(() => {
      const found = MOCK_DETALLE.find(c => c.idComprobante === id) ?? null;
      this.comprobante.set(found);
      this.notFound.set(!found);
      this.loading.set(false);
      this.cdr.markForCheck();
    }, 350);
  }

  volver(): void {
    this.router.navigate(['/admin/documento-contador']);
  }

  descargarPdf(): void {
    const c = this.comprobante();
    if (!c) return;
    this.messageService.add({
      severity: 'success',
      summary: 'PDF generado',
      detail: `Descargando ${c.serie}-${String(c.numero).padStart(8, '0')}.pdf`,
      life: 3000,
    });
  }

  generarNotaCredito(): void {
    const c = this.comprobante();
    if (!c) return;
    this.messageService.add({
      severity: 'info',
      summary: 'Nota de Crédito',
      detail: `Generando nota de crédito para ${c.serie}-${String(c.numero).padStart(8, '0')}`,
      life: 3000,
    });
  }

  confirmarAnulacion(): void {
    const c = this.comprobante();
    if (!c || c.estado !== 'EMITIDO') return;
    this.confirmationService.confirm({
      message: `¿Está seguro de anular el comprobante ${c.serie}-${String(c.numero).padStart(8, '0')}?`,
      header: 'Confirmar Anulación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, anular',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.comprobante.set({ ...c, estado: 'ANULADO' });
        this.messageService.add({
          severity: 'success',
          summary: 'Comprobante anulado',
          detail: `${c.serie}-${String(c.numero).padStart(8, '0')} fue anulado correctamente`,
          life: 3000,
        });
        this.cdr.markForCheck();
      },
    });
  }

  copiar(texto: string, campo: string): void {
    navigator.clipboard.writeText(texto).then(() => {
      this.messageService.add({
        severity: 'success',
        summary: 'Copiado',
        detail: `${campo} copiado al portapapeles`,
        life: 2000,
      });
    });
  }

  getSeverityTipo(tipo: TipoComprobante): 'info' | 'warn' | 'secondary' {
    switch (tipo) {
      case 'Boleta':          return 'info';
      case 'Factura':         return 'warn';
      case 'Nota de Crédito': return 'secondary';
    }
  }

  getSeverityEstado(estado: EstadoComprobante): 'success' | 'danger' | 'warn' | 'info' {
    switch (estado) {
      case 'EMITIDO':   return 'success';
      case 'ANULADO':   return 'danger';
      case 'RECHAZADO': return 'warn';
      default:          return 'info';
    }
  }

  getClaseVencimiento(fecha: Date): string {
    const diff = (fecha.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24);
    if (diff < 0)  return 'texto-vencido';
    if (diff <= 7) return 'texto-proximo';
    return 'texto-ok';
  }

  getLabelVencimiento(fecha: Date): string {
    const diff = Math.ceil((fecha.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (diff < 0)   return `Venció hace ${Math.abs(diff)} días`;
    if (diff === 0) return 'Vence hoy';
    if (diff <= 7)  return `Vence en ${diff} días`;
    return 'Al día';
  }

  esEmitido(): boolean {
    return this.comprobante()?.estado === 'EMITIDO';
  }

  getSimboloMoneda(): string {
    return this.comprobante()?.moneda === 'USD' ? '$' : 'S/.';
  }
}