import { Component, EventEmitter, inject, Input, model, output, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { Drawer, DrawerModule } from 'primeng/drawer';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';

@Component({
  selector: 'app-nueva-remision',
  imports: [
    DrawerModule,
    ButtonModule,
    ReactiveFormsModule,
    InputTextModule,
    DatePickerModule,
    SelectModule,
    TextareaModule,
  ],
  templateUrl: './nueva-remision.html',
  styleUrl: './nueva-remision.css',
})
export class NuevaRemision {
  abierto = model<boolean>(false);
  onHide = output<void>();
  remisionForm!: FormGroup;
  private fb = inject(FormBuilder);
  motivosTraslado = [
    { label: 'Venta', value: '01' },
    { label: 'Traslado provincia', value: '04' },
    { label: 'Devolución', value: '06' }
  ];
  ngOnInit() {
    this.remisionForm = this.fb.group({
      numeroGuia: ['', Validators.required],
      fechaEmision: [new Date(), Validators.required],
      puntoPartida: ['Av. Principal 123 - Almacén Central', Validators.required],
      puntoLlegada: ['', Validators.required],
      clienteDestino: ['', Validators.required],
      motivo: [null, Validators.required],
      transportista: this.fb.group({
        nombre: ['', Validators.required],
        placa: ['', Validators.required],
        licencia: ['']
      }),
      observaciones: ['']
    });
  }
  cerrar() {
    this.abierto.set(false);
    this.onHide.emit();
  }

  guardarRemision() {
    if (this.remisionForm.valid) {
      this.cerrar();
    } else {
      this.remisionForm.markAllAsTouched();
    }
  }
}
