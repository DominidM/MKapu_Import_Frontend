import { Component, OnInit, inject, ChangeDetectorRef, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { InputNumberModule } from 'primeng/inputnumber';
import { Select } from 'primeng/select';
import { TagModule } from 'primeng/tag';

import {
  WastageService,
  CreateWastageDto,
  WastageDetail,
  WastageTypeDto,
} from '../../../../services/wastage.service';
import { ProductoService } from '../../../../services/producto.service';
import { AuthService } from '../../../../../auth/services/auth.service';
import { SedeService } from '../../../../services/sede.service';

interface Producto {
  id_producto: number;
  id_categoria: number;
  categoriaNombre: string;
  codigo: string;
  anexo: string;
  descripcion: string;
  pre_unit: number;
  estado: boolean;
  stock?: number;
  id_almacen?: number | null;
}

@Component({
  selector: 'app-mermas-registro',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    TextareaModule,
    ToastModule,
    InputNumberModule,
    Select,
    TagModule,
  ],
  templateUrl: './mermas-registro.html',
  styleUrl: './mermas-registro.css',
  providers: [MessageService],
})
export class MermasRegistro implements OnInit {
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);
  private readonly wastageService = inject(WastageService);
  private readonly productoService = inject(ProductoService);
  private readonly authService = inject(AuthService);
  private readonly sedeService = inject(SedeService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly route = inject(ActivatedRoute);

  readonly loading = this.wastageService.loading;
  readonly error = this.wastageService.error;

  // ── Tipos de merma desde la API ───────────────────────────────────────────
  readonly motivosMerma = computed(() =>
    this.wastageService.tiposMerma().map((t: WastageTypeDto) => ({
      label: t.tipo,
      value: t.id_tipo,
      descripcion: t.motivo_merma,
    })),
  );

  // ── Autocomplete ──────────────────────────────────────────────────────────
  queryBusqueda = signal('');
  productosSugeridos = signal<any[]>([]);
  panelVisible = signal(false);
  buscandoProductos = signal(false);
  private searchTimeout: any = null;

  // ── Estado (Migrado a Signals) ────────────────────────────────────────────
  productoSeleccionado = signal<Producto | null>(null);
  productoNoEncontrado = signal(false);
  
  cantidad = signal(1);
  motivo = signal<number | null>(null);
  observaciones = signal('');
  responsableNombre = signal('Cargando...');

  id_usuario_ref = signal(0);
  id_sede_ref = signal(0);
  id_sede_code = signal<string | null>(null);

  // ── Captura del Router State (Debe estar en el constructor) ───────────────
  constructor() {
    const navegacion = this.router.getCurrentNavigation();
    if (navegacion?.extras.state && navegacion.extras.state['dataProducto']) {
      const p = navegacion.extras.state['dataProducto'];

      // Mapeamos los datos recibidos (ProductoStock) a la interfaz Producto local
      this.productoSeleccionado.set({
        id_producto: p.id_producto,
        id_categoria: p.id_categoria ?? 0,
        categoriaNombre: p.familia ?? p.categoriaNombre ?? '',
        codigo: p.codigo,
        anexo: p.nombre ?? p.anexo ?? '',
        descripcion: p.nombre ?? p.descripcion ?? '',
        pre_unit: p.precio_unitario ?? p.pre_unit ?? 0,
        estado: true,
        stock: p.stock ?? 0,
        id_almacen: null // Lo resolvemos en ngOnInit tras obtener la sede
      });

      this.queryBusqueda.set(`${p.codigo} — ${p.nombre}`);
    }
  }

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.cargarDatosUsuario();
    this.cargarTiposMerma();
    this.sedeService.loadSedes().subscribe();

    // Si recibimos un producto por URL, resolvemos su ID de almacén
    const prodActual = this.productoSeleccionado();
    if (prodActual && !prodActual.id_almacen) {
      this.resolverAlmacen(prodActual);
    }
  }

  // ── Carga tipos desde el endpoint ─────────────────────────────────────────
  private cargarTiposMerma(): void {
    this.wastageService.loadTiposMerma().subscribe({
      error: () =>
        this.messageService.add({
          severity: 'warn',
          summary: 'Aviso',
          detail: 'No se pudieron cargar los tipos de merma.',
          life: 3000,
        }),
    });
  }

  private cargarDatosUsuario(): void {
    const usuario: any = this.authService.getCurrentUser();

    if (!usuario) {
      this.messageService.add({
        severity: 'error',
        summary: 'Sesión no válida',
        detail: 'No se pudo obtener la información del usuario.',
        life: 5000,
      });
      setTimeout(() => this.authService.logout(), 2000);
      return;
    }

    this.id_usuario_ref.set(Number(usuario.userId ?? usuario.id_usuario ?? 0) || 0);

    const sedeFromToken =
      usuario.id_sede ?? usuario.idSede ?? usuario.id_sede_ref ?? usuario.id_sede_code ?? null;
    
    if (sedeFromToken != null) {
      const sedeNum = Number(sedeFromToken);
      if (!Number.isNaN(sedeNum) && sedeNum > 0) {
        this.id_sede_ref.set(sedeNum);
        this.id_sede_code.set(null);
      } else {
        this.id_sede_ref.set(0);
        this.id_sede_code.set(String(sedeFromToken));
      }
    }

    const nombres = String(usuario.nombres ?? usuario.nombre ?? usuario.username ?? '').trim();
    const ape_pat = String(usuario.ape_pat ?? usuario.apellidos ?? '').trim();
    const ape_mat = String(usuario.ape_mat ?? '').trim();
    
    this.responsableNombre.set(
      [nombres, ape_pat, ape_mat].filter(Boolean).join(' ').trim() ||
      String(usuario.usuario ?? usuario.username ?? 'Usuario')
    );
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  getNombreSede(): string {
    const id = this.id_sede_ref();
    if (!id) return 'Sin sede';
    const sede = this.sedeService.sedes().find((s) => s.id_sede === id);
    return sede ? sede.nombre : `Sede #${id}`;
  }

  private resolverAlmacen(p: Producto): void {
    const sede = this.id_sede_ref() > 0 ? this.id_sede_ref() : 0;
    if (sede === 0) return;

    this.productoService.getProductoByCodigoConStock(p.codigo, sede).subscribe({
      next: (resp: any) => {
        const idAlmacen = resp?.stock?.id_almacen ?? resp?.id_almacen ?? null;
        this.productoSeleccionado.update(prod => 
          prod ? { ...prod, id_almacen: idAlmacen ? Number(idAlmacen) : null } : null
        );
        this.cdr.detectChanges();
      }
    });
  }

  // ── Autocomplete ──────────────────────────────────────────────────────────
  onQueryChange(value: string): void {
    this.queryBusqueda.set(value);
    this.productosSugeridos.set([]);
    this.panelVisible.set(false);
    if (this.searchTimeout) clearTimeout(this.searchTimeout);

    if (this.productoSeleccionado()) {
      this.productoSeleccionado.set(null);
      this.cantidad.set(1);
    }

    if (!value || value.trim().length < 3) return;

    const sede = this.id_sede_ref() > 0 ? this.id_sede_ref() : 0;
    if (!sede) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Sede no definida',
        detail: 'No se pudo determinar la sede del usuario.',
        life: 3000,
      });
      return;
    }

    this.buscandoProductos.set(true);
    this.searchTimeout = setTimeout(() => {
      this.productoService.getProductosAutocompleteConPrecio(value.trim(), sede).subscribe({
        next: (res: any) => {
          const items = (res?.data ?? res ?? []).map((p: any) => ({
            id: p.id_producto,
            codigo: p.codigo,
            nombre: p.nombre,
            stock: Number(p.stock ?? 0),
            pre_unit: Number(p.precio_unitario ?? 0),
            id_almacen: p.id_almacen ?? null,
            categoria: p.familia ?? p.categoriaNombre ?? '',
            categoriaId: p.id_categoria ?? null,
          }));
          this.productosSugeridos.set(items);
          this.panelVisible.set(items.length > 0);
          this.buscandoProductos.set(false);
        },
        error: () => {
          this.productosSugeridos.set([]);
          this.buscandoProductos.set(false);
        },
      });
    }, 300);
  }

  seleccionarProducto(p: any): void {
    if (p.stock <= 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Sin stock',
        detail: `${p.nombre} no tiene stock disponible en esta sede.`,
        life: 3000,
      });
      return;
    }

    this.productoSeleccionado.set({
      id_producto: p.id,
      id_categoria: p.categoriaId ?? 0,
      categoriaNombre: p.categoria ?? '',
      codigo: p.codigo,
      anexo: p.nombre,
      descripcion: p.nombre,
      pre_unit: p.pre_unit,
      estado: true,
      stock: p.stock,
      id_almacen: null, 
    });
    
    this.cantidad.set(1);
    this.productoNoEncontrado.set(false);
    this.queryBusqueda.set(`${p.codigo} — ${p.nombre}`);
    this.panelVisible.set(false);
    this.productosSugeridos.set([]);
    this.cdr.detectChanges();

    this.resolverAlmacen(this.productoSeleccionado()!);
    
    this.messageService.add({
      severity: 'success',
      summary: 'Producto seleccionado',
      detail: `${p.codigo} — ${p.nombre}`,
      life: 2000,
    });
  }

  cerrarPanelConDelay(): void {
    setTimeout(() => this.panelVisible.set(false), 200);
  }

  limpiarBusqueda(): void {
    this.queryBusqueda.set('');
    this.productoSeleccionado.set(null);
    this.productoNoEncontrado.set(false);
    this.productosSugeridos.set([]);
    this.panelVisible.set(false);
    this.cantidad.set(1);
  }

  // ── Validación ────────────────────────────────────────────────────────────
  validarFormulario(): boolean {
    const prod = this.productoSeleccionado();

    if (!this.id_usuario_ref()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error de sesión',
        detail: 'No se pudo identificar al usuario.',
        life: 3000,
      });
      return false;
    }
    if (!prod) {
      this.messageService.add({
        severity: 'error',
        summary: 'Producto requerido',
        detail: 'Debe buscar y seleccionar un producto.',
        life: 3000,
      });
      return false;
    }
    if (!prod.id_almacen) {
      this.messageService.add({
        severity: 'error',
        summary: 'Almacén no identificado',
        detail: 'No se pudo determinar el almacén del producto.',
        life: 3000,
      });
      return false;
    }
    if (!this.cantidad() || this.cantidad() <= 0) {
      this.messageService.add({
        severity: 'error',
        summary: 'Cantidad inválida',
        detail: 'La cantidad debe ser mayor a 0.',
        life: 3000,
      });
      return false;
    }
    if (this.cantidad() > (prod.stock ?? 0)) {
      this.messageService.add({
        severity: 'error',
        summary: 'Stock insuficiente',
        detail: `Stock disponible: ${prod.stock} unidades.`,
        life: 3000,
      });
      return false;
    }
    if (!this.motivo()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Tipo de merma requerido',
        detail: 'Debe seleccionar un tipo de merma.',
        life: 3000,
      });
      return false;
    }
    return true;
  }

  // ── Registro ──────────────────────────────────────────────────────────────
  registrar(): void {
    if (!this.validarFormulario()) return;

    const sedeCandidate = this.id_sede_ref() > 0 ? this.id_sede_ref() : (this.id_sede_code() ?? 0);
    const idSedeNumber = Number(sedeCandidate);

    if (Number.isNaN(idSedeNumber) || idSedeNumber === 0) {
      this.messageService.add({
        severity: 'error',
        summary: 'Sede inválida',
        detail: 'No se pudo determinar una sede válida.',
        life: 3000,
      });
      return;
    }

    const prod = this.productoSeleccionado()!;

    const detalle: WastageDetail = {
      id_producto: prod.id_producto,
      cod_prod: prod.codigo,
      desc_prod: prod.anexo,
      cantidad: this.cantidad(),
      pre_unit: prod.pre_unit,
      id_tipo_merma: this.motivo()!,
      observacion: this.observaciones() || undefined,
    };

    const dto: CreateWastageDto = {
      id_usuario_ref: this.id_usuario_ref(),
      id_sede_ref: idSedeNumber,
      id_almacen_ref: Number(prod.id_almacen),
      motivo: this.getMotivoLabel(),
      id_tipo_merma: this.motivo()!,
      detalles: [detalle],
    };

    this.wastageService.createWastage(dto).subscribe({
      next: (res) => {
        this.messageService.add({
          severity: 'success',
          summary: '✓ Merma registrada',
          detail: `Merma #${res.id_merma} registrada exitosamente.`,
          life: 3000,
        });
        setTimeout(() => this.router.navigate(['/admin/mermas']), 1500);
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error al registrar',
          detail: err?.error?.message ?? 'No se pudo registrar la merma.',
          life: 5000,
        });
      },
    });
  }

  cancelar(): void {
    this.router.navigate(['/admin/mermas']);
  }

  limpiarFormulario(): void {
    this.limpiarBusqueda();
    this.motivo.set(null);
    this.observaciones.set('');
    this.messageService.add({
      severity: 'info',
      summary: 'Formulario limpiado',
      detail: 'Puede iniciar un nuevo registro.',
      life: 2000,
    });
  }

  getMotivoLabel(): string {
    const currMotivo = this.motivo();
    if (!currMotivo) return '';
    return this.motivosMerma().find((m) => m.value === currMotivo)?.label ?? '';
  }
}
