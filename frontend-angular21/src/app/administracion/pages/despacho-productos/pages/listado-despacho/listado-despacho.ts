import { Component, computed, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Subject, Subscription, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';

import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { SelectModule } from 'primeng/select';
import { DialogModule } from 'primeng/dialog';
import { DatePickerModule } from 'primeng/datepicker';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ConfirmationService, MessageService } from 'primeng/api';

import { DispatchService } from '../../../../services/dispatch.service';
import { Dispatch, DispatchStatus } from '../../../../interfaces/dispatch.interfaces';
import { UsuarioService } from '../../../../services/usuario.service';
import { UsuarioInterfaceResponse } from '../../../../interfaces/usuario.interface';
import { AuthService } from '../../../../../auth/services/auth.service';
import { SedeService } from '../../../../services/sede.service';
import { VentasAdminService } from '../../../../services/ventas.service';

import {
  getLunesSemanaActualPeru,
  getDomingoSemanaActualPeru,
} from '../../../../../shared/utils/date-peru.utils';

import { SedeAdmin } from '../../../../interfaces/ventas.interface';
import { UserRole } from '../../../../../core/constants/roles.constants';
import { SharedTableContainerComponent } from '../../../../../shared/components/table.componente/shared-table-container.component';

// ── Interfaces locales ──────────────────────────────────────────
interface ProductoMapItem { nombre: string; codigo: string; }

interface ReceiptDetalle {
  id_comprobante:   number;
  numero_completo:  string;
  serie:            string;
  numero:           number;
  tipo_comprobante: string;
  fec_emision:      string;
  subtotal:         number;
  igv:              number;
  total:            number;
  descuento?:       number;
  metodo_pago:      string;
  cliente: { nombre: string; documento: string; tipo_documento?: string; telefono: string; direccion: string; };
  responsable: { nombre: string; sede: number; nombreSede: string; };
  productos: any[];
  promocion?: any;
}

interface FiltroDespacho {
  sedeSeleccionada: number | null;
  busqueda: string;
  estado: string | null;
}

@Component({
  selector: 'app-listado-despacho',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule,
    CardModule, TableModule, ButtonModule, InputTextModule,
    TagModule, SelectModule, ToastModule, ConfirmDialog,
    TooltipModule, DialogModule, DatePickerModule, AutoCompleteModule,
    SharedTableContainerComponent,
  ],
  templateUrl: './listado-despacho.html',
  styleUrl: './listado-despacho.css',
  providers: [ConfirmationService, MessageService],
})
export class ListadoDespacho implements OnInit, OnDestroy {

  readonly dispatchService         = inject(DispatchService);
  private readonly usuarioService      = inject(UsuarioService);
  private readonly messageService      = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly authService         = inject(AuthService);
  private readonly router              = inject(Router);
  private readonly sedeService         = inject(SedeService);
  private readonly ventasService       = inject(VentasAdminService);
  private readonly sanitizer           = inject(DomSanitizer);

  private subscriptions = new Subscription();
  private busquedaSubject = new Subject<string>();

  getMapEmbedUrl(direccion: string): SafeResourceUrl {
    const q = encodeURIComponent((direccion ?? '') + ', Lima, Perú');
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://maps.google.com/maps?q=${q}&output=embed&hl=es&z=16`
    );
  }

  encodeAddress(direccion: string): string {
    return encodeURIComponent((direccion ?? '') + ', Lima, Perú');
  }

  tituloKicker    = 'ADMINISTRADOR - DESPACHO - PRODUCTOS';
  subtituloKicker = 'LISTADO DE DESPACHO';
  iconoCabecera   = 'pi pi-truck';

  // ── Autenticación ──────────────────────────────────────────────────
  readonly esAdmin: boolean;
  readonly sedeNombreVentas: string;
  readonly sedePropiaId: number | null;

  // ── Filtros ────────────────────────────────────────────────────────
  filtros = signal<FiltroDespacho>({
    sedeSeleccionada: null,
    busqueda: '',
    estado: 'GENERADO',
  });

  searchTerm   = signal<string>('');
  fechaDesde   = signal<Date | null>(getLunesSemanaActualPeru());
  fechaHasta   = signal<Date | null>(getDomingoSemanaActualPeru());
  usuarios     = signal<UsuarioInterfaceResponse[]>([]);

  // ── Sedes ──────────────────────────────────────────────────────────
  sedes = signal<SedeAdmin[]>([]);
  readonly sedesOptions = computed(() =>
    [{ label: 'Todas las sedes', value: null }, ...this.sedes().map((s) => ({ label: s.nombre, value: s.id_sede }))]
  );

  // ── Modal ──────────────────────────────────────────────────────────
  modalVisible         = signal(false);
  despachoSeleccionado = signal<Dispatch | null>(null);
  loadingDetalle       = signal(false);

  cambioEstadoVisible = signal(false);
  despachoParaCambio  = signal<Dispatch | null>(null);

  productosMap         = signal<Record<string, ProductoMapItem>>({});
  productosCodigoMap   = signal<Record<number, string>>({});
  clienteInfo          = signal<{ nombre: string; documento: string; tipo_documento?: string; telefono: string; direccion?: string; } | null>(null);
  sedeNombreModal      = signal<string>('—');
  loadingVenta         = signal(false);
  receiptDetalleActual = signal<ReceiptDetalle | null>(null);

  sugerenciasBusqueda  = signal<string[]>([]);
  todasLasSugerencias  = signal<string[]>([]);

  estadoOptions = [
    { label: 'Todos',          value: null         },
    { label: 'Generado',       value: 'GENERADO'      },
    { label: 'En preparación', value: 'EN_PREPARACION'},
    { label: 'En tránsito',    value: 'EN_TRANSITO'   },
    { label: 'Entregado',      value: 'ENTREGADO'     },
    { label: 'Cancelado',      value: 'CANCELADO'     },
  ];

  dispatches      = this.dispatchService.dispatches;
  loading         = this.dispatchService.loading;
  error           = this.dispatchService.error;
  totalItems      = this.dispatchService.totalItems;
  totalPages      = this.dispatchService.totalPages;
  paginaActual    = signal(1);
  limitePorPagina = signal(5);

  constructor() {
    const user = this.authService.getCurrentUser();
    this.esAdmin          = this.authService.getRoleId() === UserRole.ADMIN;
    this.sedeNombreVentas = user?.sedeNombre ?? 'Mi sede';
    this.sedePropiaId     = user?.idSede ?? null;
  }

  ngOnInit(): void {
    let sedeInicial: number | null = null;
    
    if (!this.esAdmin) {
      // Si NO es admin, usa siempre su sedePropiaId
      sedeInicial = this.sedePropiaId;
    } else {
      // Si es admin, intenta cargar desde localStorage, sino null
      sedeInicial = this.obtenerSedeDelStorage();
    }
    
    this.filtros.update(f => ({
      ...f,
      sedeSeleccionada: sedeInicial,
    }));

    this.cargarUsuarios();
    this.configurarBusqueda();

    if (this.esAdmin) {
      this.cargarSedes();
    } else {
      this.cargarDespachos();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.busquedaSubject.complete();
  }

  private obtenerSedeDelStorage(): number | null {
    try {
      const sedeJson = localStorage.getItem('sedeSeleccionada');
      if (sedeJson) {
        const sede = JSON.parse(sedeJson);
        return sede?.id_sede ?? null;
      }
    } catch (e) {
      console.warn('Error al leer sede del localStorage:', e);
    }
    return null;
  }

  private guardarSedeEnStorage(sedeId: number | null): void {
    try {
      if (sedeId) {
        const sede = this.sedes().find(s => s.id_sede === sedeId);
        if (sede) {
          localStorage.setItem('sedeSeleccionada', JSON.stringify(sede));
        }
      } else {
        localStorage.removeItem('sedeSeleccionada');
      }
    } catch (e) {
      console.warn('Error al guardar sede en localStorage:', e);
    }
  }

  private configurarBusqueda(): void {
    const sub = this.busquedaSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((query) => {
        if (query.length < 2) return [];
        return this.dispatchService.loadDispatches('Administrador', {
          page: 1,
          limit: 10,
          search: query,
          id_sede: this.filtros().sedeSeleccionada ?? undefined,
        });
      }),
    ).subscribe({
      next: (res: any) => {
        const data = res?.data ?? res?.dispatches ?? [];
        const set = new Set<string>();
        
        data.forEach((d: any) => {
          const nombre = d.clienteNombre?.trim();
          const doc = d.clienteDoc?.trim();
          const comprobante = d.comprobante?.trim();
          
          if (nombre && doc) set.add(`${nombre} - ${doc}`);
          else if (nombre) set.add(nombre);
          else if (doc) set.add(doc);
          if (comprobante) set.add(comprobante);
        });
        
        this.sugerenciasBusqueda.set(Array.from(set).slice(0, 15));
      },
      error: () => this.sugerenciasBusqueda.set([]),
    });
    this.subscriptions.add(sub);
  }

  buscarSugerencias(event: any): void {
    const query = (event.query ?? '').trim();
    if (query.length < 2) {
      this.sugerenciasBusqueda.set(this.todasLasSugerencias().slice(0, 10));
      return;
    }
    this.busquedaSubject.next(query);
  }

  onSeleccionarSugerencia(event: any): void {
    const valor = event.value ?? '';
    this.searchTerm.set(valor.split(' - ')[0].trim());
    this.aplicarFiltros();
  }

  onBusquedaLimpiada(): void {
    this.searchTerm.set('');
    this.aplicarFiltros();
  }

  onBusquedaKeyUp(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.aplicarFiltros();
    }
  }

  private cargarSedes(): void {
    const sub = this.sedeService.loadSedes('Administrador').subscribe({
      next: (res) => {
        const sedesActivas = (res.headquarters ?? []).filter(s => s.activo);
        this.sedes.set(sedesActivas);
        
        const sedeDelStorage = this.obtenerSedeDelStorage();
        if (sedeDelStorage) {
          this.filtros.update(f => ({ ...f, sedeSeleccionada: sedeDelStorage }));
        }
        
        this.cargarDespachos();
      },
      error: (err) => {
        console.error('Error cargando sedes:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar las sedes',
          life: 3000,
        });
      },
    });
    this.subscriptions.add(sub);
  }

  private cargarUsuarios(): void {
    const sub = this.usuarioService.getAllUsuarios().subscribe({
      next: (lista) => this.usuarios.set(lista ?? []),
      error: (err) => {
        console.error('Error cargando usuarios:', err);
        this.usuarios.set([]);
      },
    });
    this.subscriptions.add(sub);
  }

  cargarDespachos(resetPage = true): void {
    if (resetPage) this.paginaActual.set(1);
    
    if (!this.esAdmin) {
      this.filtros.update(f => ({ ...f, sedeSeleccionada: this.sedePropiaId }));
    }

    const f = this.filtros();
    const desde = this.fechaDesde();
    const hasta = this.fechaHasta();

    const sub = this.dispatchService.loadDispatches('Administrador', {
      page:       this.paginaActual(),
      limit:      this.limitePorPagina(),
      fechaDesde: desde ? desde.toISOString().split('T')[0] : undefined,
      fechaHasta: hasta ? hasta.toISOString().split('T')[0] : undefined,
      id_sede:    f.sedeSeleccionada ?? undefined,
      estado:     f.estado ? f.estado : undefined,
      search:     f.busqueda.trim() || undefined,
    }).subscribe({
      error: () => this.messageService.add({
        severity: 'error', summary: 'Error',
        detail: 'No se pudieron cargar los despachos.', life: 4000,
      }),
    });
    this.subscriptions.add(sub);
  }

  cambiarSede(nuevaSede: number | null): void {
    this.filtros.update(f => ({ ...f, sedeSeleccionada: nuevaSede }));
    this.guardarSedeEnStorage(nuevaSede);
    this.aplicarFiltros();
  }

  cambiarEstado(nuevoEstado: string | null): void {
    this.filtros.update(f => ({ ...f, estado: nuevoEstado }));
    this.aplicarFiltros();
  }

  onLimitChange(nuevoLimite: number): void {
    this.limitePorPagina.set(nuevoLimite);
    this.paginaActual.set(1);
    this.cargarDespachos();
  }

  exportarExcel(): void {
    if (this.filasFiltradas().length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Sin datos',
        detail: 'No hay registros para exportar',
        life: 3000,
      });
      return;
    }
    
    const datosExcel = this.filasFiltradas().map((d) => ({
      'N° Despacho': d.id_despacho,
      'Comprobante': this.getNumeroComprobante(d),
      'Cliente': this.getClienteNombre(d),
      'Documento': this.getClienteDoc(d),
      'Sede': this.getSede(d),
      'Dirección': d.direccion_entrega ?? '—',
      'Estado': this.getEstadoLabel(d.estado),
      'Fecha Creación': new Date(d.fecha_creacion).toLocaleString('es-PE'),
    }));
    
    // Aquí iría tu lógica de exportación a Excel
    console.log('Exportar datos:', datosExcel);
    this.messageService.add({
      severity: 'success',
      summary: 'Exportación exitosa',
      detail: `Se exportaron ${datosExcel.length} despachos`,
      life: 3000,
    });
  }

  limpiarFiltros(): void {
    let sedeParaLimpiar: number | null = null;
    
    if (this.esAdmin) {
      sedeParaLimpiar = this.obtenerSedeDelStorage();
    } else {
      sedeParaLimpiar = this.sedePropiaId;
    }
    
    this.filtros.set({
      sedeSeleccionada: sedeParaLimpiar,
      busqueda: '',
      estado: null,
    });
    this.searchTerm.set('');
    this.fechaDesde.set(getLunesSemanaActualPeru());
    this.fechaHasta.set(getDomingoSemanaActualPeru());
    this.cargarDespachos(true);
    this.messageService.add({
      severity: 'info',
      summary: 'Filtros limpiados',
      detail: 'Se restablecieron los filtros',
      life: 2000,
    });
  }

  cambiarPagina(nuevaPagina: number): void {
    if (nuevaPagina < 1 || nuevaPagina > this.totalPages()) return;
    this.paginaActual.set(nuevaPagina);
    this.cargarDespachos(false);
  }

  // ── Filtros ───────────────────────────────────────────────────────
  aplicarFiltros(): void {
    this.paginaActual.set(1);
    this.cargarDespachos(true);
  }

  // ── Helpers tabla ─────────────────────────────────────────────────
  getNumeroComprobante(d: any): string {
    const ventaRef = d.id_venta_ref ?? d.idVentaRef ?? d.id_venta ?? '?';
    return d.comprobante ?? d.numeroComprobante ?? `Venta #${ventaRef}`;
  }

  getClienteNombre(d: any): string { return d.clienteNombre ?? d.cliente_nombre ?? '—'; }
  getClienteDoc(d: any):    string { return d.clienteDoc    ?? d.cliente_doc    ?? '';  }
  getSede(d: any):           string { return d.sedeNombre   ?? d.sede_nombre    ?? '—'; }

  // ── Computeds ──────────────────────────────────────────────────────
  readonly totalProductosModal = computed(() =>
    this.despachoSeleccionado()?.detalles?.reduce((acc, d) => acc + (d.cantidad_solicitada ?? 0), 0) ?? 0
  );

  readonly numeroVentaModal = computed(() => {
    const d = this.despachoSeleccionado();
    if (!d) return '—';
    return (d as any).comprobante ?? `#${d.id_venta_ref}`;
  });

  readonly despachador = computed(() => this.obtenerNombreUsuario('ALMACENERO'));
  readonly asesor      = computed(() => this.obtenerNombreUsuario('VENTAS'));

  readonly totalGenerados     = computed(() => this.filasFiltradas().filter(d => d.estado === 'GENERADO').length);
  readonly totalEnPreparacion = computed(() => this.filasFiltradas().filter(d => d.estado === 'EN_PREPARACION').length);
  readonly totalEnTransito    = computed(() => this.filasFiltradas().filter(d => d.estado === 'EN_TRANSITO').length);
  readonly totalEntregados    = computed(() => this.filasFiltradas().filter(d => d.estado === 'ENTREGADO').length);
  readonly totalCancelados    = computed(() => this.filasFiltradas().filter(d => d.estado === 'CANCELADO').length);
  readonly totalPendientes    = computed(() => this.totalGenerados() + this.totalEnPreparacion());
  readonly totalEnviados      = computed(() => this.totalEnTransito());
  readonly totalFiltrados     = computed(() => this.filasFiltradas().length);

  readonly filasFiltradas = computed(() => {
    let data = this.dispatches();

    if (this.filtros().estado)
      data = data.filter(d => d.estado === this.filtros().estado);

    const term = this.searchTerm()?.trim().toLowerCase();
    if (term) {
      data = data.filter(d =>
        String(d.id_despacho ?? '').includes(term) ||
        String(d.id_venta_ref ?? '').includes(term) ||
        (d.direccion_entrega ?? '').toLowerCase().includes(term) ||
        this.getClienteNombre(d).toLowerCase().includes(term) ||
        this.getClienteDoc(d).includes(term) ||
        this.getNumeroComprobante(d).toLowerCase().includes(term)
      );
    }
    return data.sort((a, b) => (b.id_despacho ?? 0) - (a.id_despacho ?? 0));
  });

  private cargarSugerenciasBusqueda(): void {
    const set = new Set<string>();
    this.dispatches().forEach((d) => {
      const nombre = d.clienteNombre?.trim();
      const doc = d.clienteDoc?.trim();
      const comprobante = d.comprobante?.trim();
      
      if (nombre && doc) set.add(`${nombre} - ${doc}`);
      else if (nombre) set.add(nombre);
      else if (doc) set.add(doc);
      if (comprobante) set.add(comprobante);
    });
    this.todasLasSugerencias.set(Array.from(set).sort());
  }

  getProductoNombre(id_producto: number): string {
    return this.productosMap()[String(id_producto)]?.nombre ?? `Producto #${id_producto}`;
  }

  getProductoCodigo(id_producto: number): string {
    return this.productosCodigoMap()[id_producto]
      ?? this.productosMap()[String(id_producto)]?.codigo
      ?? '—';
  }

  verDetalle(despacho: any): void {
    this.loadingDetalle.set(true);
    this.despachoSeleccionado.set(despacho);
    this.modalVisible.set(true);

    this.clienteInfo.set(despacho.clienteNombre ? {
      nombre:    despacho.clienteNombre    ?? '—',
      documento: despacho.clienteDoc       ?? '—',
      telefono:  despacho.clienteTelefono  ?? '—',
      direccion: despacho.clienteDireccion ?? '—',
    } : null);
    this.sedeNombreModal.set(despacho.sedeNombre ?? '—');

    const map: Record<string, ProductoMapItem> = {};
    (despacho.productosDetalle ?? []).forEach((p: any) => {
      map[String(p.id_prod_ref)] = { 
        nombre: p.descripcion ?? `#${p.id_prod_ref}`, 
        codigo: p.cod_prod ?? '—' 
      };
    });
    this.productosMap.set(map);

    this.receiptDetalleActual.set({
      id_comprobante:   despacho.id_venta_ref,
      numero_completo:  despacho.comprobante     ?? '',
      serie: '', 
      numero: 0,
      tipo_comprobante: despacho.tipoComprobante  ?? '',
      fec_emision:      despacho.fechaEmision      ?? '',
      subtotal:         despacho.subtotal           ?? 0,
      igv:              despacho.igv                ?? 0,
      total:            despacho.total              ?? 0,
      descuento:        despacho.descuento           ?? 0,
      metodo_pago:      despacho.metodoPago          ?? '—',
      cliente: {
        nombre:    despacho.clienteNombre    ?? '—',
        documento: despacho.clienteDoc       ?? '—',
        telefono:  despacho.clienteTelefono  ?? '—',
        direccion: despacho.clienteDireccion ?? '—',
      },
      responsable: {
        nombre:     despacho.responsableNombre ?? '—',
        sede:       0,
        nombreSede: despacho.sedeNombre        ?? '—',
      },
      productos: (despacho.productosDetalle ?? []).map((p: any) => ({
        id_prod_ref: p.id_prod_ref, 
        cod_prod: p.cod_prod,
        descripcion: p.descripcion, 
        cantidad: p.cantidad,
        pre_uni: p.precio_unit, 
        total: p.total,
      })),
    });

    const sub = this.dispatchService.getDispatchById(despacho.id_despacho).subscribe({
      next:  (d) => { 
        this.despachoSeleccionado.set({ ...despacho, ...d }); 
        this.loadingDetalle.set(false);
        this.cargarSugerenciasBusqueda();
      },
      error: (err) => { 
        console.error('Error cargando detalle:', err);
        this.loadingDetalle.set(false); 
      },
    });
    this.subscriptions.add(sub);
  }

  cerrarModal(): void {
    this.modalVisible.set(false);
    this.despachoSeleccionado.set(null);
    this.clienteInfo.set(null);
    this.productosMap.set({});
  }

  confirmarSalida(): void {
    const d = this.despachoSeleccionado();
    if (!d) return;

    const guardarYNavegar = (despacho: Dispatch) => this.navegarAConfirmacion(despacho, 'EN_TRANSITO');

    const iniciarTransito = (despacho: Dispatch) =>
      this.dispatchService.iniciarTransito(despacho.id_despacho, { fecha_salida: new Date() })
        .subscribe({ 
          next: (u) => guardarYNavegar(u), 
          error: () => guardarYNavegar(despacho) 
        });

    const marcarYTransitar = (despacho: Dispatch) => {
      const pendientes = (despacho.detalles ?? []).filter(det => det.estado === 'PENDIENTE');
      if (!pendientes.length) { 
        iniciarTransito(despacho); 
        return; 
      }
      
      let ok = 0;
      pendientes.forEach(det => {
        const sub = this.dispatchService.marcarDetallePreparado(
          det.id_detalle_despacho!,
          { cantidad_despachada: det.cantidad_solicitada }
        ).subscribe({
          next:  () => { 
            ok++; 
            if (ok === pendientes.length) iniciarTransito(despacho); 
          },
          error: ()  => iniciarTransito(despacho),
        });
        this.subscriptions.add(sub);
      });
    };

    if (d.estado === 'GENERADO') {
      const sub = this.dispatchService.iniciarPreparacion(d.id_despacho).subscribe({ 
        next: (u) => marcarYTransitar(u), 
        error: () => marcarYTransitar(d) 
      });
      this.subscriptions.add(sub);
    } else if (d.estado === 'EN_PREPARACION') {
      marcarYTransitar(d);
    } else {
      guardarYNavegar(d);
    }
  }

  abrirCambioEstado(despacho: Dispatch): void {
    const noEditables: string[] = ['GENERADO', 'ENTREGADO', 'CANCELADO'];
    if (noEditables.includes(despacho.estado)) {
      const msgs: Record<string, string> = {
        GENERADO:  'Debes confirmar la salida primero desde el modal de detalle.',
        ENTREGADO: `El despacho #${despacho.id_despacho} ya fue entregado y no puede modificarse.`,
        CANCELADO: `El despacho #${despacho.id_despacho} está cancelado y no puede modificarse.`,
      };
      this.messageService.add({ 
        severity: 'info', 
        summary: 'No permitido', 
        detail: msgs[despacho.estado] ?? 'No se puede cambiar el estado', 
        life: 3500 
      });
      return;
    }
    this.despachoParaCambio.set(despacho);
    this.cambioEstadoVisible.set(true);
  }

  aplicarCambioEstado(nuevoEstado: 'ENTREGADO' | 'CANCELADO'): void {
    const d = this.despachoParaCambio();
    if (!d) return;

    const onSuccess = () => {
      this.cambioEstadoVisible.set(false);
      this.despachoParaCambio.set(null);
      this.messageService.add({
        severity: 'success',
        summary:  nuevoEstado === 'ENTREGADO' ? '¡Entregado!' : 'Cancelado',
        detail:   `Despacho #${d.id_despacho} marcado como ${nuevoEstado === 'ENTREGADO' ? 'entregado' : 'cancelado'}.`,
        life: 3000,
      });
      this.dispatchService.loadDispatches('Administrador').subscribe();
    };

    const onError = (err?: any) => {
      console.error('Error en cambio de estado:', err);
      this.messageService.add({
        severity: 'error', 
        summary: 'Error', 
        detail: 'No se pudo cambiar el estado.', 
        life: 3000,
      });
    };

    if (nuevoEstado === 'CANCELADO') {
      const sub = this.dispatchService.cancelarDespacho(d.id_despacho).subscribe({ 
        next: onSuccess, 
        error: onError 
      });
      this.subscriptions.add(sub);
      return;
    }

    const sub = this.dispatchService.confirmarEntrega(d.id_despacho, { fecha_entrega: new Date() })
      .subscribe({ 
        next: onSuccess, 
        error: onError 
      });
    this.subscriptions.add(sub);
  }

  imprimirCopia(): void {
    const d = this.despachoSeleccionado();
    if (!d) return;

    const cache = d as any;
    const dirLower = (d.direccion_entrega ?? '').toLowerCase();
    const tipoEntrega: 'tienda' | 'delivery' =
      dirLower.includes('tienda') || dirLower.includes('recojo') ? 'tienda' : 'delivery';

    const fecha = new Date().toLocaleString('es-PE', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    const html = this.generarHTML({
      numeroComprobante: cache?.comprobante ?? `#${d.id_venta_ref}`,
      tipoComprobante: cache?.tipoComprobante ?? 'Comprobante',
      fecha,
      clienteNombre: this.clienteInfo()?.nombre ?? '—',
      clienteDoc: this.clienteInfo()?.documento ?? '—',
      clienteTelefono: this.clienteInfo()?.telefono ?? '—',
      tipoEntrega,
      direccion: d.direccion_entrega ?? '—',
      total: this.receiptDetalleActual()?.total ?? 0,
      productos: (d.detalles ?? []).map(det => ({
        nombre: this.getProductoNombre(det.id_producto),
        codigo: this.getProductoCodigo(det.id_producto),
        cantidad: det.cantidad_solicitada,
      })),
    });

    const win = window.open('', '_blank', 'width=430,height=800');
    if (!win) {
      this.messageService.add({ 
        severity: 'warn', 
        summary: 'Aviso', 
        detail: 'Activa las ventanas emergentes para imprimir.' 
      });
      return;
    }
    win.document.open();
    win.document.write(html);
    win.document.close();
  }

  private generarHTML(data: any): string {
    const totalStr = (data.total ?? 0).toFixed(2);
    const tipoEntregaLabel = data.tipoEntrega === 'delivery' ? 'DELIVERY' : 'TIENDA';

    const filasProd = (data.productos ?? []).map((p: any) => {
      return `<tr>
        <td class="td-desc">${p.nombre}<span class="sku">${p.codigo}</span></td>
        <td class="td-cant">${p.cantidad}</td>
        <td class="td-tot">S/ ${totalStr}</td>
      </tr>`;
    }).join('');

    const css = `
      *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
      body{font-family:'Courier New',Courier,monospace;font-size:11px;line-height:1.6;color:#000;background:#fff;width:72mm;margin:0 auto;padding:4mm 3mm 8mm}
      .c{text-align:center}.r{text-align:right}.bold{font-weight:700}
      hr.dash{border:none;border-top:1px dashed #000;margin:4px 0}
      .copia-mark{text-align:center;font-size:11px;font-weight:900;letter-spacing:3px;border:1.5px solid #000;padding:3px 4px;margin:4px 0}
      table.prods{width:100%;border-collapse:collapse;font-size:10px;margin:2px 0}
      table.prods thead th{border-top:2px solid #000;border-bottom:2px solid #000;padding:2px 1px;font-size:9.5px;font-weight:700}
      table.prods tbody td{padding:2.5px 1px;vertical-align:top}
      table.prods tbody tr:last-child td{border-bottom:2px solid #000}
      .td-desc{width:50%}.td-cant{width:25%;text-align:center}.td-tot{width:25%;text-align:right;font-weight:700}
      .sku{display:block;font-size:8.5px;color:#555;font-style:italic}
      .footer{text-align:center;font-size:9.5px;line-height:1.55;margin-top:6px}
      @media print{html,body{width:72mm}@page{size:80mm auto;margin:0}}
    `;

    return `<!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>COPIA ${data.numeroComprobante}</title>
        <style>${css}</style>
      </head>
      <body>
        <p class="c bold" style="font-size:26px;letter-spacing:-1px;line-height:1">mkapu</p>
        <p class="c" style="font-size:9px;letter-spacing:5px;text-transform:uppercase">import</p>
        <hr class="dash">
        <p class="copia-mark">*** COPIA ***</p>
        <p class="c bold" style="font-size:12px">${data.tipoComprobante}</p>
        <hr class="dash">
        <p class="c bold">${data.clienteNombre}</p>
        <p class="c">${data.clienteDoc}</p>
        <p class="c" style="font-size:9px">${data.clienteTelefono}</p>
        <hr class="dash">
        <p class="c bold">${tipoEntregaLabel}</p>
        <p class="c" style="font-size:10px">${data.direccion}</p>
        <hr class="dash">
        <table class="prods">
          <thead><tr><th class="td-desc">Producto</th><th class="td-cant">Cant</th><th class="td-tot">Total</th></tr></thead>
          <tbody>${filasProd}</tbody>
        </table>
        <hr class="dash">
        <p class="r bold" style="font-size:13px">S/ ${totalStr}</p>
        <div class="footer">
          <p class="bold">**GRACIAS POR SU COMPRA**</p>
        </div>
        <script>window.onload=function(){setTimeout(function(){window.print();},300);}</script>
      </body>
      </html>`;
  }

  private navegarAConfirmacion(despacho: Dispatch, estadoForzado: string, esCopia = false): void {
    const cliente    = this.clienteInfo();
    const sedeNombre = this.sedeNombreModal();
    const cache      = despacho as any;
    const prodMap    = { ...this.productosMap() };
    const prodCodMap = { ...this.productosCodigoMap() };
    const receipt    = this.receiptDetalleActual();

    const dirLower    = (despacho.direccion_entrega ?? '').toLowerCase();
    const tipoEntrega: 'tienda' | 'delivery' =
      dirLower.includes('tienda') || dirLower.includes('recojo') ? 'tienda' : 'delivery';

    const numComp = cache?.comprobante ?? '';
    let tipoComprobante = 'Comprobante';
    if      (numComp.startsWith('F')) tipoComprobante = 'Factura Electrónica';
    else if (numComp.startsWith('B')) tipoComprobante = 'Boleta Electrónica';
    else if (numComp.startsWith('N')) tipoComprobante = 'Nota de Venta';

    const data = {
      id_despacho:       despacho.id_despacho,
      numeroComprobante: numComp || `#${despacho.id_venta_ref}`,
      tipoComprobante,
      fechaEmision:      receipt?.fec_emision ?? String(despacho.fecha_creacion),
      clienteNombre:     cliente?.nombre        ?? cache?.clienteNombre ?? '—',
      clienteDoc:        cliente?.documento      ?? cache?.clienteDoc    ?? '—',
      clienteTipoDoc:    cliente?.tipo_documento ?? '—',
      clienteTelefono:   cliente?.telefono       ?? '—',
      clienteDireccion:  cliente?.direccion      ?? '—',
      sedeNombre:        sedeNombre              ?? cache?.sedeNombre    ?? '—',
      responsableNombre: receipt?.responsable?.nombre ?? '—',
      direccionEntrega:  despacho.direccion_entrega,
      tipoEntrega,
      observacion:       despacho.observacion ?? null,
      estado:            estadoForzado,
      subtotal:          Number(receipt?.subtotal  ?? 0),
      igv:               Number(receipt?.igv       ?? 0),
      descuento:         Number(receipt?.descuento ?? 0),
      total:             Number(receipt?.total     ?? 0),
      metodoPago:        receipt?.metodo_pago ?? '—',
      esCopia,
      productos: (despacho.detalles ?? []).map(det => {
        const pr = (receipt?.productos ?? []).find(
          (p: any) => String(p.id_prod_ref ?? p.productId) === String(det.id_producto)
        );
        return {
          id_producto:         det.id_producto,
          nombre:              prodMap[String(det.id_producto)]?.nombre ?? pr?.descripcion ?? `Producto #${det.id_producto}`,
          codigo:              prodCodMap[det.id_producto] ?? prodMap[String(det.id_producto)]?.codigo ?? pr?.cod_prod ?? '—',
          cantidad_solicitada: det.cantidad_solicitada,
          cantidad_despachada: det.cantidad_despachada,
          precio_unit:         Number(pr?.pre_uni ?? pr?.precio_unit ?? 0),
          total_item:          Number(pr?.total ?? 0),
          estado:              det.estado,
        };
      }),
    };

    sessionStorage.setItem('confirmar_despacho_data', JSON.stringify(data));
    this.router.navigateByUrl('/admin/despacho-productos/confirmar-despacho').then(() => {
      this.modalVisible.set(false);
      this.dispatchService.loadDispatches('Administrador').subscribe();
    });
  }

  cancelar(despacho: Dispatch): void {
    this.confirmationService.confirm({
      header: 'Confirmar cancelación',
      message: `¿Cancelar el despacho <strong>#${despacho.id_despacho}</strong>?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, cancelar', 
      rejectLabel: 'Volver',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        const sub = this.dispatchService.cancelarDespacho(despacho.id_despacho).subscribe({
          next:  () => {
            this.messageService.add({ 
              severity: 'success', 
              summary: 'Cancelado', 
              detail: `Despacho #${despacho.id_despacho} cancelado.`, 
              life: 3000 
            });
            this.dispatchService.loadDispatches('Administrador').subscribe();
          },
          error: (err) => {
            console.error('Error cancelando:', err);
            this.messageService.add({ 
              severity: 'error', 
              summary: 'Error', 
              detail: 'No se pudo cancelar el despacho.', 
              life: 4000 
            });
          },
        });
        this.subscriptions.add(sub);
      },
    });
  }

  encodeURIComponent = encodeURIComponent;
  minVal = (a: number, b: number) => Math.min(a, b);

  getEstadoSeverity(estado: DispatchStatus): 'success' | 'warn' | 'danger' | 'secondary' | 'info' {
    const severities: Record<DispatchStatus, 'success' | 'warn' | 'danger' | 'secondary' | 'info'> = {
      GENERADO:       'secondary',
      EN_PREPARACION: 'info',
      EN_TRANSITO:    'warn',
      ENTREGADO:      'success',
      CANCELADO:      'danger',
    };
    return severities[estado] ?? 'secondary';
  }

  getEstadoLabel(estado: DispatchStatus): string {
    const labels: Record<DispatchStatus, string> = {
      GENERADO:       'Generado',
      EN_PREPARACION: 'En preparación',
      EN_TRANSITO:    'En tránsito',
      ENTREGADO:      'Entregado',
      CANCELADO:      'Cancelado',
    };
    return labels[estado] ?? estado;
  }

  getDetalleEstadoClass(estado: string): string {
    const classes: Record<string, string> = {
      'PREPARADO':  'dm-det-preparado',
      'DESPACHADO': 'dm-det-despachado',
      'FALTANTE':   'dm-det-faltante',
      'PENDIENTE':  'dm-det-pendiente',
    };
    return classes[estado] ?? 'dm-det-pendiente';
  }

  getEstadoLabelFromFilter(estado: string | null): string {
    if (!estado) return '—';
    const labels: Record<string, string> = {
      'GENERADO':       'Generado',
      'EN_PREPARACION': 'En preparación',
      'EN_TRANSITO':    'En tránsito',
      'ENTREGADO':      'Entregado',
      'CANCELADO':      'Cancelado',
    };
    return labels[estado] ?? estado;
  }

  private obtenerNombreUsuario(rolNombre: string): string {
    const usuarios = this.usuarios();
    if (!usuarios || usuarios.length === 0) return 'Sin asignar';
    
    const u = usuarios.find(
      u => (u.rolNombre ?? u.rol_nombre ?? u.rol ?? '').toUpperCase() === rolNombre.toUpperCase()
        && u.activo
    );
    
    if (!u) return 'Sin asignar';
    
    const nombres = [u.usu_nom, u.ape_pat, u.ape_mat]
      .filter(v => v && String(v).trim().length > 0)
      .map(v => String(v).trim())
      .join(' ');
    
    return nombres.length > 0 ? nombres : 'Sin asignar';
  }
}