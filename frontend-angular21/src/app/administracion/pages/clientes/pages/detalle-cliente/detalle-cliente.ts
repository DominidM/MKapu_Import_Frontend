import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ClienteService, Customer } from '../../../../services/cliente.service';


@Component({
  selector: 'app-detalle-cliente',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CardModule,
    ButtonModule,
    TagModule,
    MessageModule,
    ToastModule,
    ProgressSpinnerModule,
  ],
  templateUrl: './detalle-cliente.html',
  styleUrl: './detalle-cliente.css',
})
export class DetalleCliente implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly clienteService = inject(ClienteService);

  readonly loading = signal<boolean>(false);
  readonly error = signal<string | undefined>(undefined);
  readonly cliente = signal<Customer | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.error.set('Cliente no encontrado.');
      return;
    }

    this.loading.set(true);
    this.clienteService.getCustomerById(id).subscribe({
      next: (c) => {
        this.cliente.set(c);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar la información del cliente.');
        this.loading.set(false);
      },
    });
  }

  getDocTypeLabel(code: string): string {
    const map: Record<string, string> = {
      '00': 'OTROS',
      '01': 'DNI',
      '04': 'C.E.',
      '06': 'RUC',
      '07': 'PASAPORTE',
    };
    return map[code] ?? 'DOC';
  }

  isCompany(code?: string, razonsocial?: string | null): boolean {
    if (razonsocial && String(razonsocial).trim().length > 0) return true;
    return code === '06';
  }

  getDisplayName(c: Customer | null): string {
    if (!c) return '';
    if (c.razonsocial?.trim()) return c.razonsocial.trim();
    return [c.name, c.apellidos].filter(Boolean).join(' ').trim() || c.documentValue || '—';
  }

  getCustomerTypeLabel(c: Customer | null): string {
    if (!c) return '';
    return this.isCompany(c.documentTypeSunatCode, c.razonsocial) ? 'JURÍDICA' : 'NATURAL';
  }

  getPhoneDisplay(c: Customer | null): string {
    return c?.phone?.trim() ? c.phone : 'No registrado';
  }

  getEmailDisplay(c: Customer | null): string {
    return c?.email?.trim() ? c.email : 'No registrado';
  }

  getAddressDisplay(c: Customer | null): string {
    return c?.address?.trim() ? c.address : 'No registrada';
  }
}