import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';

interface TransferenciaDetalle {
  codigo: string;
  producto: string;
  origen: string;
  destino: string;
  cantidad: number;
  responsable: string;
  estado: string;
  fechaEnvio: string;
  fechaLlegada: string;
  observacion?: string;
}

@Component({
  selector: 'app-detalle-transferencia',
  standalone: true,
  imports: [CommonModule, RouterModule, CardModule, ButtonModule, TagModule, DividerModule],
  templateUrl: './detalle-transferencia.html',
  styleUrl: './detalle-transferencia.css',
})
export class DetalleTransferencia implements OnInit {
  transferencia: TransferenciaDetalle | null = null;
  codigo = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      this.codigo = params.get('codigo') ?? '';
      this.cargarDetalle();
    });
  }

  cargarDetalle(): void {
    const data = localStorage.getItem('transferencias');
    const transferencias: TransferenciaDetalle[] = data ? JSON.parse(data) : [];

    this.transferencia = transferencias.find((t) => t.codigo === this.codigo) ?? null;

    if (!this.transferencia && transferencias.length > 0) {
      this.transferencia = transferencias[0];
    }
  }

  volver(): void {
    this.router.navigate(['/admin/transferencia']);
  }

  getEstadoSeverity(estado: string): 'success' | 'warn' | 'info' | 'secondary' | 'danger' {
    switch (estado.toLowerCase()) {
      case 'completada':
        return 'success';
      case 'pendiente':
        return 'warn';
      case 'en transito':
        return 'info';
      case 'incidencia':
        return 'danger';
      default:
        return 'secondary';
    }
  }

}
