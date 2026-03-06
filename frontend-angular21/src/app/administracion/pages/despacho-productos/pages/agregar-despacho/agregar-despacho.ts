import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DialogModule } from 'primeng/dialog';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

interface ProductoRAF {
  nombre: string;
  sku: string;
  almacen: string;
  solicitada: number;
  disponible: number;
}

interface TipoEntrega {
  label: string;
  value: string;
}

@Component({
  selector: 'app-agregar-despacho',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    CardModule,
    ButtonModule,
    TableModule,
    DatePickerModule,
    InputTextModule,
    SelectModule,
    DialogModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './agregar-despacho.html',
  styleUrls: ['./agregar-despacho.css']
})
export class AgregarDespacho implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService
  ) {}

  despachoId!: number;
  tipoEntregaSeleccionado: string | null = null;

  tiposEntrega: TipoEntrega[] = [
    { label: 'Recojo en Tienda', value: 'RECOJO_TIENDA' },
    { label: 'Delivery', value: 'DELIVERY' },
    { label: 'Envío a Provincia', value: 'ENVIO_PROVINCIA' },
    { label: 'Courier Externo', value: 'COURIER' }
  ];

  direccion: string = '';
  fechaSalida: Date | null = null;

  productos = signal<ProductoRAF[]>([
    {
      nombre: 'Refrigeradora RAF 300L',
      sku: 'RAF-REF-300',
      almacen: 'Almacén Central (Lima)',
      solicitada: 1,
      disponible: 15
    },
    {
      nombre: 'Lavadora RAF 12Kg',
      sku: 'RAF-LAV-12K',
      almacen: 'Almacén Sur (Arequipa)',
      solicitada: 1,
      disponible: 5
    },
    {
      nombre: 'Televisor RAF 55" Smart',
      sku: 'RAF-TV-55',
      almacen: 'Almacén Callao',
      solicitada: 2,
      disponible: 3
    }
  ]);

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');

    if (!idParam) {
      console.error('No se encontró ID en la ruta');
      return;
    }

    this.despachoId = Number(idParam);
  }

  calcularSubtotal(): number {
    return this.productos().reduce((acc, p) => acc + p.solicitada, 0);
  }

  calcularAlertas(): number {
    return this.productos()
      .filter(p => p.disponible < p.solicitada)
      .length;
  }

  confirmarDespacho(): void {

    if (!this.tipoEntregaSeleccionado) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Campo obligatorio',
        detail: 'Debe seleccionar un tipo de entrega',
        life: 3000
      });
      return;
    }

    if (
      ['DELIVERY', 'ENVIO_PROVINCIA', 'COURIER']
        .includes(this.tipoEntregaSeleccionado)
        && !this.direccion
    ) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Campo obligatorio',
        detail: 'Debe ingresar dirección',
        life: 3000
      });
      return;
    }

    const dataConfirmacion = {
      despachoId: this.despachoId,
      tipoEntrega: this.tipoEntregaSeleccionado,
      direccion: this.direccion,
      fechaSalida: this.fechaSalida
        ? this.fechaSalida.toISOString()
        : null,
      productos: this.productos(),
      subtotal: this.calcularSubtotal(),
      alertas: this.calcularAlertas(),
      fechaRegistro: new Date().toISOString()
    };

    sessionStorage.setItem(
      'despachoConfirmacion',
      JSON.stringify(dataConfirmacion)
    );

    this.messageService.add({
      severity: 'success',
      summary: 'Despacho registrado',
      detail: 'El despacho fue registrado correctamente',
      life: 2000
    });

    setTimeout(() => {
      this.router.navigateByUrl(
        `/admin/despacho-productos/confirmar-despacho/${this.despachoId}`
      );
    }, 800);
  }
}