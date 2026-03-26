import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';

import { Card } from 'primeng/card';
import { Button } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { Skeleton } from 'primeng/skeleton';
import { Tooltip } from 'primeng/tooltip';
import { Divider } from 'primeng/divider';

type TipoOperacion = 'VENTA_DELIVERY' | 'COMPRA_RECOJO';
type EstadoDelivery = 'PENDIENTE' | 'EN_CAMINO' | 'ENTREGADO' | 'CANCELADO';

interface ProductoDetalle {
  codigo: string;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  total: number;
  categoria: string;
}

interface DeliveryDetalle {
  id: string;
  tipo: TipoOperacion;
  comprobante: string;
  cliente: string;
  clienteDoc: string;
  clienteTelefono: string;
  clienteEmail: string;
  origen: string;
  destino: string;
  monto: number;
  responsableNombre: string;
  responsableCargo: string;
  responsableTelefono: string;
  estado: EstadoDelivery;
  fecha: string;
  hora: string;
  observaciones: string;
  productos: ProductoDetalle[];
}

@Component({
  selector: 'app-delivery-detalles',
  standalone: true,
  imports: [CommonModule, RouterModule, Card, Button, Tag, TableModule, Skeleton, Tooltip, Divider],
  templateUrl: './delivery-detalles.html',
  styleUrl: './delivery-detalles.css',
})
export class DeliveryDetalles implements OnInit, OnDestroy {
  tituloKicker = 'ADMINISTRADOR - DELIVERY - DETALLE';
  subtituloKicker = 'DETALLE DE DELIVERY';
  iconoCabecera = 'pi pi-map-marker';

  loading = true;
  detalle: DeliveryDetalle | null = null;

  private routeSub: Subscription | null = null;

  private readonly dataBase: DeliveryDetalle[] = [
    {
      id: 'DLV-001',
      tipo: 'VENTA_DELIVERY',
      comprobante: 'B001-00008060',
      cliente: 'Juan Pérez Rojas',
      clienteDoc: 'DNI: 45123456',
      clienteTelefono: '987-654-321',
      clienteEmail: 'juan.perez@email.com',
      origen: 'Almacén Central - San Isidro',
      destino: 'Av. Larco 450, Miraflores, Lima',
      monto: 320.5,
      responsableNombre: 'Carlos Mendoza',
      responsableCargo: 'REPARTIDOR',
      responsableTelefono: '999-001-001',
      estado: 'EN_CAMINO',
      fecha: '2026-03-25',
      hora: '09:45',
      observaciones: 'Entregar en horario de tarde, preguntar por recepción.',
      productos: [
        {
          codigo: 'P-001',
          descripcion: 'Zapatillas Running Pro X',
          cantidad: 1,
          precioUnitario: 220.0,
          total: 220.0,
          categoria: 'Calzado',
        },
        {
          codigo: 'P-045',
          descripcion: 'Medias deportivas pack x3',
          cantidad: 2,
          precioUnitario: 50.25,
          total: 100.5,
          categoria: 'Accesorios',
        },
      ],
    },
    {
      id: 'DLV-003',
      tipo: 'COMPRA_RECOJO',
      comprobante: 'OC-00000125',
      cliente: 'Proveedor XYZ SAC',
      clienteDoc: 'RUC: 20456789012',
      clienteTelefono: '01-345-6789',
      clienteEmail: 'ventas@xyzproveed.com',
      origen: 'Depósito Proveedor - Ate Vitarte',
      destino: 'Almacén Central - San Isidro',
      monto: 4200.0,
      responsableNombre: 'Pedro Huanca',
      responsableCargo: 'RECOGEDOR',
      responsableTelefono: '999-001-006',
      estado: 'PENDIENTE',
      fecha: '2026-03-25',
      hora: '10:30',
      observaciones: 'Recoger antes de las 12pm. Llevar guía de remisión.',
      productos: [
        {
          codigo: 'MP-010',
          descripcion: 'Tela importada algodón 100% (rollo)',
          cantidad: 10,
          precioUnitario: 180.0,
          total: 1800.0,
          categoria: 'Materia Prima',
        },
        {
          codigo: 'MP-022',
          descripcion: 'Botones nácar premium (caja x500)',
          cantidad: 20,
          precioUnitario: 120.0,
          total: 2400.0,
          categoria: 'Insumos',
        },
      ],
    },
    {
      id: 'DLV-006',
      tipo: 'VENTA_DELIVERY',
      comprobante: 'B001-00008065',
      cliente: 'Roberto Lima',
      clienteDoc: 'DNI: 30987654',
      clienteTelefono: '976-543-210',
      clienteEmail: 'roberto.lima@gmail.com',
      origen: 'Almacén Central - San Isidro',
      destino: 'Urb. Los Pinos 210, Surco',
      monto: 560.0,
      responsableNombre: 'Carlos Mendoza',
      responsableCargo: 'REPARTIDOR',
      responsableTelefono: '999-001-001',
      estado: 'ENTREGADO',
      fecha: '2026-03-24',
      hora: '15:30',
      observaciones: '',
      productos: [
        {
          codigo: 'P-012',
          descripcion: 'Polo casual oversize negro',
          cantidad: 3,
          precioUnitario: 89.0,
          total: 267.0,
          categoria: 'Ropa',
        },
        {
          codigo: 'P-033',
          descripcion: 'Jean slim fit azul',
          cantidad: 2,
          precioUnitario: 146.5,
          total: 293.0,
          categoria: 'Ropa',
        },
      ],
    },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
  ) {}

  ngOnInit(): void {
    this.routeSub = this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.cargarDetalle(id);
      } else {
        this.volver();
      }
    });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }

  private cargarDetalle(id: string): void {
    this.loading = true;
    this.detalle = null;
    setTimeout(() => {
      this.detalle = this.dataBase.find((d) => d.id === id) || null;
      if (!this.detalle) this.volver();
      this.loading = false;
    }, 400);
  }

  volver(): void {
    this.location.back();
  }

  irListado(): void {
    this.router.navigate(['/admin/listado-delivery']);
  }

  irFormulario(): void {
    this.router.navigate(['/admin/formulario-delivery']);
  }
  getTipoLabel(tipo: TipoOperacion): string {
    return tipo === 'VENTA_DELIVERY' ? 'Venta / Delivery' : 'Compra / Recojo';
  }

  getTipoSeverity(tipo: TipoOperacion): 'info' | 'warn' {
    return tipo === 'VENTA_DELIVERY' ? 'info' : 'warn';
  }

  getEstadoSeverity(estado: EstadoDelivery): 'success' | 'info' | 'warn' | 'danger' {
    switch (estado) {
      case 'ENTREGADO':
        return 'success';
      case 'EN_CAMINO':
        return 'info';
      case 'PENDIENTE':
        return 'warn';
      case 'CANCELADO':
        return 'danger';
    }
  }

  calcularTotal(): number {
    return this.detalle?.productos.reduce((acc, p) => acc + p.total, 0) ?? 0;
  }
}
