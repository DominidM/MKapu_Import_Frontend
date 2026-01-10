import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { CardModule } from 'primeng/card';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Button } from 'primeng/button';

import { ProductosService, Producto } from '../../../../core/services/productos.service';

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
    ToastModule
  ],
  templateUrl: './productos-formulario.html',
  styleUrls: ['./productos-formulario.css'],
  providers: [ConfirmationService, MessageService]
})
export class ProductosFormulario implements OnInit, OnDestroy {
  productoForm: FormGroup;
  isEditMode = false;
  productoId: number | null = null;
  productoOriginal: Producto | null = null;
  returnUrl: string = '/admin/gestion-productos'; 

  sedes: { label: string; value: string }[] = [];
  familias: { label: string; value: string }[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private productosService: ProductosService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {
    this.productoForm = this.fb.group({
      codigo: ['', Validators.required],
      nombre: ['', Validators.required],
      sede: ['', Validators.required],
      familia: ['', Validators.required],
      precioUnidad: [0, [Validators.required, Validators.min(0)]],
      precioCaja: [0, [Validators.required, Validators.min(0)]],
      precioMayorista: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit() {
    this.cargarSedes();
    this.cargarFamilias();

    this.route.queryParams.subscribe(params => {
      if (params['returnUrl']) {
        this.returnUrl = params['returnUrl'];
      }
    });

    this.route.params.subscribe(params => {
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
    this.sedes = sedesData.map(sede => ({
      label: this.formatearNombreSede(sede),
      value: sede
    }));
  }

  cargarFamilias() {
    const familiasData = this.productosService.getFamilias();
    this.familias = familiasData.map(familia => ({
      label: familia,
      value: familia
    }));
  }

  formatearNombreSede(sede: string): string {
    return sede
      .split(' ')
      .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase())
      .join(' ');
  }

  cargarProducto(id: number) {
    const producto = this.productosService.getProductoPorId(id);
    
    if (producto) {
      this.productoOriginal = { ...producto };
      
      this.productoForm.patchValue({
        codigo: producto.codigo,
        nombre: producto.nombre,
        sede: producto.sede,
        familia: producto.familia,
        precioUnidad: producto.precioUnidad,
        precioCaja: producto.precioCaja,
        precioMayorista: producto.precioMayorista
      });

      setTimeout(() => {
        this.productoForm.markAsPristine();
        this.productoForm.markAsUntouched();
      }, 0);
      
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Producto no encontrado',
        life: 3000
      });
      this.volverSinConfirmar();
    }
  }

  hayaCambios(): boolean {
    if (!this.isEditMode || !this.productoOriginal) {
      const formData = this.productoForm.value;
      return (
        (formData.codigo && formData.codigo.trim() !== '') ||
        (formData.nombre && formData.nombre.trim() !== '') ||
        formData.sede !== '' ||
        formData.familia !== '' ||
        formData.precioUnidad > 0 ||
        formData.precioCaja > 0 ||
        formData.precioMayorista > 0
      );
    }

    const formData = this.productoForm.value;
    
    return (
      String(formData.codigo || '').trim() !== String(this.productoOriginal.codigo || '').trim() ||
      String(formData.nombre || '').trim() !== String(this.productoOriginal.nombre || '').trim() ||
      String(formData.sede || '') !== String(this.productoOriginal.sede || '') ||
      String(formData.familia || '') !== String(this.productoOriginal.familia || '') ||
      Number(formData.precioUnidad || 0) !== Number(this.productoOriginal.precioUnidad || 0) ||
      Number(formData.precioCaja || 0) !== Number(this.productoOriginal.precioCaja || 0) ||
      Number(formData.precioMayorista || 0) !== Number(this.productoOriginal.precioMayorista || 0)
    );
  }

  guardar() {
    if (!this.productoForm.valid) {
      Object.keys(this.productoForm.controls).forEach(key => {
        this.productoForm.get(key)?.markAsTouched();
      });
      this.messageService.add({
        severity: 'warn',
        summary: 'Formulario Incompleto',
        detail: 'Por favor complete todos los campos requeridos',
        life: 3000
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
          nombre: formData.nombre,
          sede: formData.sede,
          familia: formData.familia,
          precioUnidad: formData.precioUnidad,
          precioCaja: formData.precioCaja,
          precioMayorista: formData.precioMayorista
        };

        const exito = this.productosService.actualizarProducto(this.productoId!, productoActualizado);
        
        if (exito) {
          this.messageService.add({
            severity: 'success',
            summary: 'Producto Actualizado',
            detail: `"${formData.nombre}" actualizado correctamente`,
            life: 3000
          });
          setTimeout(() => this.volverSinConfirmar(), 1500);
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al actualizar el producto',
            life: 3000
          });
        }
      },
      reject: () => {
        this.messageService.add({
          severity: 'info',
          summary: 'Cancelado',
          detail: 'Actualización cancelada',
          life: 2000
        });
      }
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
          nombre: formData.nombre,
          sede: formData.sede,
          familia: formData.familia,
          precioUnidad: formData.precioUnidad,
          precioCaja: formData.precioCaja,
          precioMayorista: formData.precioMayorista,
          estado: 'Activo'
        };

        try {
          this.productosService.crearProducto(nuevoProducto);
          this.messageService.add({
            severity: 'success',
            summary: 'Producto Creado',
            detail: `"${nuevoProducto.nombre}" creado correctamente`,
            life: 3000
          });
          setTimeout(() => this.volverSinConfirmar(), 1500);
        } catch (error) {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al crear el producto',
            life: 3000
          });
        }
      },
      reject: () => {
        this.messageService.add({
          severity: 'info',
          summary: 'Cancelado',
          detail: 'Creación cancelada',
          life: 2000
        });
      }
    });
  }

  volver() {
    if (!this.hayaCambios()) {
      this.router.navigateByUrl(this.returnUrl);
      return;
    }

    const mensaje = this.isEditMode && this.productoOriginal
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
          life: 2000
        });
        setTimeout(() => this.router.navigateByUrl(this.returnUrl), 500);
      }
    });
  }


  volverSinConfirmar() {
    this.router.navigateByUrl(this.returnUrl);
  }
}
