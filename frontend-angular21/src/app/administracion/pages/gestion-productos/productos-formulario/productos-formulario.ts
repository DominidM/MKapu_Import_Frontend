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
export class ProductosFormulario implements OnInit {
  productoForm: FormGroup;
  
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
   
  }

  
}
