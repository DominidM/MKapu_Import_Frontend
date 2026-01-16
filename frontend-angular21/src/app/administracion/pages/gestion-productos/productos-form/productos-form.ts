import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-productos-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    CardModule
  ],
  template: `
    <div class="p-4">
      <div class="flex justify-content-between align-items-center mb-4">
        <h2 class="m-0">{{ isEditMode ? 'Editar Producto' : 'Nuevo Producto' }}</h2>
        <button pButton label="Volver" icon="pi pi-arrow-left" severity="secondary" (click)="volver()"></button>
      </div>

      <p-card>
        <form [formGroup]="productoForm" (ngSubmit)="guardar()" class="formgrid grid">
          
          <div class="field col-12 md:col-6">
            <label for="codigo">Código *</label>
            <input pInputText id="codigo" formControlName="codigo" class="w-full" />
            <small class="text-red-500" *ngIf="productoForm.get('codigo')?.invalid && productoForm.get('codigo')?.touched">
              El código es requerido
            </small>
          </div>

          <div class="field col-12 md:col-6">
            <label for="nombre">Nombre *</label>
            <input pInputText id="nombre" formControlName="nombre" class="w-full" />
            <small class="text-red-500" *ngIf="productoForm.get('nombre')?.invalid && productoForm.get('nombre')?.touched">
              El nombre es requerido
            </small>
          </div>

          <div class="field col-12 md:col-6">
            <label for="sede">Sede *</label>
            <p-select 
              id="sede"
              formControlName="sede" 
              [options]="sedes" 
              placeholder="Seleccionar sede"
              class="w-full">
            </p-select>
          </div>

          <div class="field col-12 md:col-6">
            <label for="familia">Familia *</label>
            <p-select 
              id="familia"
              formControlName="familia" 
              [options]="familias" 
              placeholder="Seleccionar familia"
              class="w-full">
            </p-select>
          </div>

          <div class="field col-12 md:col-3">
            <label for="stock">Stock Inicial *</label>
            <p-inputNumber 
              id="stock"
              formControlName="stock" 
              class="w-full"
              [min]="0">
            </p-inputNumber>
          </div>

          <div class="field col-12 md:col-3">
            <label for="precioUnidad">Precio Unidad (S/) *</label>
            <p-inputNumber 
              id="precioUnidad"
              formControlName="precioUnidad" 
              mode="currency" 
              currency="PEN" 
              locale="es-PE"
              class="w-full"
              [min]="0">
            </p-inputNumber>
          </div>

          <div class="field col-12 md:col-3">
            <label for="precioCaja">Precio Caja (S/) *</label>
            <p-inputNumber 
              id="precioCaja"
              formControlName="precioCaja" 
              mode="currency" 
              currency="PEN" 
              locale="es-PE"
              class="w-full"
              [min]="0">
            </p-inputNumber>
          </div>

          <div class="field col-12 md:col-3">
            <label for="precioMayorista">Precio Mayorista (S/) *</label>
            <p-inputNumber 
              id="precioMayorista"
              formControlName="precioMayorista" 
              mode="currency" 
              currency="PEN" 
              locale="es-PE"
              class="w-full"
              [min]="0">
            </p-inputNumber>
          </div>

          <div class="field col-12 flex gap-2 justify-content-end">
            <button 
              pButton 
              type="button" 
              label="Cancelar" 
              severity="secondary" 
              icon="pi pi-times"
              (click)="volver()">
            </button>
            <button 
              pButton 
              type="submit" 
              label="Guardar" 
              icon="pi pi-check"
              [disabled]="!productoForm.valid">
            </button>
          </div>
          
        </form>
      </p-card>
    </div>
  `
})
export class ProductosForm implements OnInit {
  productoForm: FormGroup;
  isEditMode = false;
  productoId: number | null = null;

  sedes = ['Lima', 'Arequipa', 'Cusco', 'Trujillo', 'Chiclayo'];
  familias = ['Bebidas', 'Snacks', 'Abarrotes', 'Lácteos', 'Limpieza', 'Embutidos'];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.productoForm = this.fb.group({
      codigo: ['', Validators.required],
      nombre: ['', Validators.required],
      sede: ['', Validators.required],
      familia: ['', Validators.required],
      stock: [0, [Validators.required, Validators.min(0)]],
      precioUnidad: [0, [Validators.required, Validators.min(0)]],
      precioCaja: [0, [Validators.required, Validators.min(0)]],
      precioMayorista: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.productoId = +params['id'];
        this.cargarProducto(this.productoId);
      }
    });
  }

  cargarProducto(id: number) {
    
    const productoMock = {
      codigo: 'P001',
      nombre: 'Inca Kola 500ml',
      sede: 'Lima',
      familia: 'Bebidas',
      stock: 120,
      precioUnidad: 3.5,
      precioCaja: 40,
      precioMayorista: 3
    };
    
    this.productoForm.patchValue(productoMock);
  }

  guardar() {
    if (this.productoForm.valid) {
      const data = {
        ...this.productoForm.value,
        estado: 'Activo'
      };
      
      if (this.isEditMode) {
        console.log('Actualizando producto ID:', this.productoId, data);
        // this.productoService.update(this.productoId, data).subscribe(() => {
        //   this.router.navigate(['/admin/gestion-productos']);
        // })
      } else {
        console.log('Creando nuevo producto:', data);
        // this.productoService.create(data).subscribe(() => {
        //   this.router.navigate(['/admin/gestion-productos']);
        // })
      }
      
      this.volver();
    } 
    else 
    {

      Object.keys(this.productoForm.controls).forEach(key => {
        this.productoForm.get(key)?.markAsTouched();
      });
    }
  }

  volver() {
    this.router.navigate(['/admin/gestion-productos']);
  }
}
