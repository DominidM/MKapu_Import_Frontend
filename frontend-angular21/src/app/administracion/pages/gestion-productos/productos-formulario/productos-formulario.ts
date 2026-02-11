import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';

import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { CardModule } from 'primeng/card';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';

import { ProductosService, Producto } from '../../../../core/services/productos.service';

interface StockSede {
  sede: string;
  stock: number;
}

@Component({
  selector: 'app-productos-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    Button,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    CardModule,
    ConfirmDialog,
    ToastModule,
    TooltipModule,
    TagModule,
  ],
  templateUrl: './productos-formulario.html',
  styleUrls: ['./productos-formulario.css'],
  providers: [ConfirmationService, MessageService],
})
export class ProductosFormulario implements OnInit, OnDestroy {
  productoForm: FormGroup;
  isEditMode = false;
  productoId: number | null = null;
  productoOriginal: Producto | null = null;
  returnUrl: string = '/admin/gestion-productos';
  navegando = false;

  sedes: { label: string; value: string }[] = [];
  familias: { label: string; value: string }[] = [];
  unidadesMedida: { label: string; value: string }[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private productosService: ProductosService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef,
  ) {
    this.productoForm = this.fb.group({
      codigo: ['', Validators.required],
      anexo: [''],
      nombre: ['', Validators.required],
      descripcion: [''],
      familia: ['', Validators.required],
      precioCompra: [0, [Validators.required, Validators.min(0)]],
      precioVenta: [0, [Validators.required, Validators.min(0)]],
      precioUnidad: [0, [Validators.required, Validators.min(0)]],
      precioCaja: [0, [Validators.required, Validators.min(0)]],
      precioMayorista: [0, [Validators.required, Validators.min(0)]],
      unidadMedida: ['UND', Validators.required],
      stockPorSede: this.fb.array([], Validators.required),
    });
  }

  get stockPorSede(): FormArray {
    return this.productoForm.get('stockPorSede') as FormArray;
  }

  ngOnInit() {
    this.cargarSedes();
    this.cargarFamilias();
    this.cargarUnidadesMedida();

    this.route.queryParams.subscribe((params) => {
      if (params['returnUrl']) {
        this.returnUrl = params['returnUrl'];
      }
    });

    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.isEditMode = true;
        this.productoId = +params['id'];
        this.cargarProducto(this.productoId);
      } else {
        this.isEditMode = false;
        this.productoId = null;
        this.productoOriginal = null;
      }
    });
  }

  ngOnDestroy() {
    this.confirmationService.close();
  }

  cargarSedes() {
    const sedesData = this.productosService.getSedes();
    this.sedes = sedesData.map((sede) => ({
      label: this.formatearNombreSede(sede),
      value: sede,
    }));
  }

  cargarFamilias() {
    const familiasData = this.productosService.getFamilias();
    this.familias = familiasData.map((familia) => ({
      label: familia,
      value: familia,
    }));
  }

  cargarUnidadesMedida() {
    const unidadesData = this.productosService.getUnidadesMedida();
    this.unidadesMedida = unidadesData.map((unidad) => ({
      label: unidad,
      value: unidad,
    }));
  }

  formatearNombreSede(sede: string): string {
    return sede
      .split(' ')
      .map((palabra) => palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase())
      .join(' ');
  }

  crearStockSedeFormGroup(sede: string = '', stock: number = 0, ajuste: number = 0): FormGroup {
    return this.fb.group({
      sede: [sede, Validators.required],
      stockActual: [stock],
      ajuste: [ajuste, Validators.required],
    });
  }

  agregarStockSede() {
    if (this.stockPorSede.length >= this.sedes.length) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Límite alcanzado',
        detail: 'Ya has agregado todas las sedes disponibles',
        life: 3000,
      });
      return;
    }
    this.stockPorSede.push(this.crearStockSedeFormGroup());
  }

  eliminarStockSede(index: number) {
    const sedeEliminar = this.stockPorSede.at(index).value;

    this.confirmationService.confirm({
      message: `¿Eliminar el stock de la sede <strong>${this.formatearNombreSede(sedeEliminar.sede || 'Sin nombre')}</strong>?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      rejectLabel: 'Cancelar',
      acceptLabel: 'Eliminar',
      acceptButtonProps: { severity: 'danger' },
      rejectButtonProps: { severity: 'secondary', outlined: true },
      accept: () => {
        this.stockPorSede.removeAt(index);
        this.messageService.add({
          severity: 'success',
          summary: 'Stock Eliminado',
          detail: 'Stock de sede eliminado correctamente',
          life: 2000,
        });
      },
    });
  }

  getSedesDisponibles(currentValue?: string): { label: string; value: string }[] {
    const sedesSeleccionadas = this.stockPorSede.controls
      .map((control) => control.get('sede')?.value)
      .filter((sede) => sede && sede !== currentValue);

    return this.sedes.filter((sede) => !sedesSeleccionadas.includes(sede.value));
  }

  getStockActualSede(sede: string): number {
    if (!this.isEditMode || !this.productoOriginal) return 0;

    const variante = this.productoOriginal.variantes?.find((v) => v.sede === sede);
    return variante?.stock || 0;
  }

  calcularNuevoStockSede(sede: string, ajuste: number): number {
    const stockActual = this.getStockActualSede(sede);
    return stockActual + (ajuste || 0);
  }

  formatearDiferencia(ajuste: number): string {
    const valor = ajuste || 0;
    if (valor > 0) return `+${valor}`;
    if (valor < 0) return `${valor}`;
    return '0';
  }

  getSeverityDiferencia(ajuste: number): 'success' | 'danger' | 'secondary' {
    const valor = ajuste || 0;
    if (valor > 0) return 'success';
    if (valor < 0) return 'danger';
    return 'secondary';
  }

  calcularStockTotal(): number {
    if (!this.isEditMode) {
      return this.stockPorSede.controls.reduce((total, control) => {
        return total + (Number(control.get('ajuste')?.value) || 0);
      }, 0);
    }

    return this.stockPorSede.controls.reduce((total, control) => {
      const sede = control.get('sede')?.value;
      const ajuste = Number(control.get('ajuste')?.value) || 0;
      const stockActual = this.getStockActualSede(sede);
      return total + stockActual + ajuste;
    }, 0);
  }

  onSedeChange(index: number): void {
    const item = this.stockPorSede.at(index);
    item.get('ajuste')?.setValue(0, { emitEvent: false });
  }

  onStockChange(index: number): void {
    this.cdr.detectChanges();
  }

  cargarProducto(id: number) {
    const producto = this.productosService.getProductoPorId(id);

    if (producto) {
      this.productoOriginal = { ...producto };

      this.productoForm.patchValue({
        codigo: producto.codigo,
        anexo: producto.anexo || '',
        nombre: producto.nombre,
        descripcion: producto.descripcion || '',
        familia: producto.familia,
        precioCompra: producto.precioCompra,
        precioVenta: producto.precioVenta,
        precioUnidad: producto.precioUnidad,
        precioCaja: producto.precioCaja,
        precioMayorista: producto.precioMayorista,
        unidadMedida: producto.unidadMedida,
      });

      if (producto.variantes && producto.variantes.length > 0) {
        this.stockPorSede.clear();
        producto.variantes.forEach((variante) => {
          this.stockPorSede.push(this.crearStockSedeFormGroup(variante.sede, variante.stock, 0));
        });
      }

      Promise.resolve().then(() => {
        this.productoForm.markAsPristine();
        this.productoForm.markAsUntouched();
        this.cdr.detectChanges();
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Producto no encontrado',
        life: 3000,
      });
      this.volverSinConfirmar();
    }
  }

  hayaCambios(): boolean {
    if (!this.isEditMode || !this.productoOriginal) {
      const formData = this.productoForm.value;
      return (
        (formData.codigo && formData.codigo.trim() !== '') ||
        (formData.anexo && formData.anexo.trim() !== '') ||
        (formData.nombre && formData.nombre.trim() !== '') ||
        (formData.descripcion && formData.descripcion.trim() !== '') ||
        formData.familia !== '' ||
        formData.precioCompra > 0 ||
        formData.precioVenta > 0 ||
        formData.precioUnidad > 0 ||
        formData.precioCaja > 0 ||
        formData.precioMayorista > 0 ||
        formData.unidadMedida !== 'UND' ||
        this.stockPorSede.length > 0
      );
    }

    const formData = this.productoForm.value;

    const hayCambiosBasicos =
      String(formData.codigo || '').trim() !== String(this.productoOriginal.codigo || '').trim() ||
      String(formData.anexo || '').trim() !== String(this.productoOriginal.anexo || '').trim() ||
      String(formData.nombre || '').trim() !== String(this.productoOriginal.nombre || '').trim() ||
      String(formData.descripcion || '').trim() !==
        String(this.productoOriginal.descripcion || '').trim() ||
      String(formData.familia || '') !== String(this.productoOriginal.familia || '') ||
      Number(formData.precioCompra || 0) !== Number(this.productoOriginal.precioCompra || 0) ||
      Number(formData.precioVenta || 0) !== Number(this.productoOriginal.precioVenta || 0) ||
      Number(formData.precioUnidad || 0) !== Number(this.productoOriginal.precioUnidad || 0) ||
      Number(formData.precioCaja || 0) !== Number(this.productoOriginal.precioCaja || 0) ||
      Number(formData.precioMayorista || 0) !==
        Number(this.productoOriginal.precioMayorista || 0) ||
      String(formData.unidadMedida || '') !== String(this.productoOriginal.unidadMedida || '');

    const hayAjustesStock = formData.stockPorSede.some((item: any) => (item.ajuste || 0) !== 0);

    return hayCambiosBasicos || hayAjustesStock;
  }

  guardar() {
    if (!this.productoForm.valid) {
      Object.keys(this.productoForm.controls).forEach((key) => {
        this.productoForm.get(key)?.markAsTouched();
      });

      if (this.stockPorSede.length === 0) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Stock Requerido',
          detail: 'Debe agregar al menos una sede con stock',
          life: 3000,
        });
        return;
      }

      this.messageService.add({
        severity: 'warn',
        summary: 'Formulario Incompleto',
        detail: 'Por favor complete todos los campos requeridos',
        life: 3000,
      });
      return;
    }

    const formData = this.productoForm.value;

    if (this.isEditMode && this.productoId) {
      this.confirmarActualizacion(formData);
    } else {
      this.confirmarCreacion(formData);
    }
  }

  private confirmarActualizacion(formData: any) {
    this.confirmationService.confirm({
      message: `¿Seguro que deseas actualizar el producto <strong>${formData.nombre}</strong>?`,
      header: 'Confirmar Actualización',
      icon: 'pi pi-exclamation-triangle',
      rejectLabel: 'Cancelar',
      acceptLabel: 'Actualizar',
      acceptButtonProps: { severity: 'warning' },
      rejectButtonProps: { severity: 'secondary', outlined: true },
      accept: () => {
        const productoActualizado: Partial<Producto> = {
          codigo: formData.codigo,
          anexo: formData.anexo || undefined,
          nombre: formData.nombre,
          descripcion: formData.descripcion || undefined,
          familia: formData.familia,
          precioCompra: formData.precioCompra,
          precioVenta: formData.precioVenta,
          precioUnidad: formData.precioUnidad,
          precioCaja: formData.precioCaja,
          precioMayorista: formData.precioMayorista,
          unidadMedida: formData.unidadMedida,
          variantes: formData.stockPorSede.map((item: any) => ({
            sede: item.sede,
            stock: this.getStockActualSede(item.sede) + (item.ajuste || 0),
          })),
        };

        const exito = this.productosService.actualizarProducto(
          this.productoId!,
          productoActualizado,
        );

        if (exito) {
          this.messageService.add({
            severity: 'success',
            summary: 'Producto Actualizado',
            detail: `"${formData.nombre}" actualizado correctamente`,
            life: 2500,
          });

          setTimeout(() => {
            this.cargarProducto(this.productoId!);
          }, 500);
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al actualizar el producto',
            life: 3000,
          });
        }
      },
      reject: () => {
        this.messageService.add({
          severity: 'info',
          summary: 'Cancelado',
          detail: 'Actualización cancelada',
          life: 2000,
        });
      },
    });
  }

  private confirmarCreacion(formData: any) {
    this.confirmationService.confirm({
      message: `¿Seguro que deseas crear el producto <strong>${formData.nombre}</strong>?`,
      header: 'Confirmar Creación',
      icon: 'pi pi-info-circle',
      rejectLabel: 'Cancelar',
      acceptLabel: 'Crear',
      acceptButtonProps: { severity: 'warning' },
      rejectButtonProps: { severity: 'secondary', outlined: true },
      accept: () => {
        const nuevoProducto: Omit<Producto, 'id'> = {
          codigo: formData.codigo,
          anexo: formData.anexo || undefined,
          nombre: formData.nombre,
          descripcion: formData.descripcion || undefined,
          familia: formData.familia,
          precioCompra: formData.precioCompra,
          precioVenta: formData.precioVenta,
          precioUnidad: formData.precioUnidad,
          precioCaja: formData.precioCaja,
          precioMayorista: formData.precioMayorista,
          unidadMedida: formData.unidadMedida,
          estado: 'Activo',
          fechaCreacion: new Date(),
          fechaActualizacion: new Date(),
          variantes: formData.stockPorSede.map((item: any) => ({
            sede: item.sede,
            stock: item.ajuste || 0,
          })),
        };

        try {
          this.productosService.crearProducto(nuevoProducto);
          this.messageService.add({
            severity: 'success',
            summary: 'Producto Creado',
            detail: `"${nuevoProducto.nombre}" creado correctamente`,
            life: 2500,
          });
          Promise.resolve().then(() => {
            setTimeout(() => this.volverSinConfirmar(), 1000);
          });
        } catch (error) {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al crear el producto',
            life: 3000,
          });
        }
      },
      reject: () => {
        this.messageService.add({
          severity: 'info',
          summary: 'Cancelado',
          detail: 'Creación cancelada',
          life: 2000,
        });
      },
    });
  }

  volver() {
    if (!this.hayaCambios()) {
      this.volverSinConfirmar();
      return;
    }

    const mensaje =
      this.isEditMode && this.productoOriginal
        ? `¿Seguro que deseas cancelar la edición de <strong>${this.productoOriginal.nombre}</strong>?<br>Se perderán los cambios realizados.`
        : `¿Seguro que deseas cancelar la creación del producto?<br>Se perderán los datos ingresados.`;

    const header = this.isEditMode ? 'Cancelar Edición' : 'Cancelar Creación';

    this.confirmationService.confirm({
      message: mensaje,
      header: header,
      icon: 'pi pi-exclamation-triangle',
      rejectLabel: 'Quedarme',
      acceptLabel: 'Salir',
      acceptButtonProps: { severity: 'danger' },
      rejectButtonProps: { severity: 'secondary', outlined: true },
      accept: () => {
        this.messageService.add({
          severity: 'info',
          summary: this.isEditMode ? 'Edición Cancelada' : 'Creación Cancelada',
          detail: this.isEditMode
            ? `Edición de "${this.productoOriginal?.nombre}" cancelada`
            : 'Creación de producto cancelada',
          life: 2000,
        });
        Promise.resolve().then(() => {
          setTimeout(() => this.volverSinConfirmar(), 500);
        });
      },
    });
  }

  volverSinConfirmar() {
    if (this.navegando) return;

    this.navegando = true;

    Promise.resolve().then(() => {
      this.router
        .navigate([this.returnUrl])
        .then(() => {
          this.navegando = false;
        })
        .catch(() => {
          this.navegando = false;
        });
    });
  }
}
