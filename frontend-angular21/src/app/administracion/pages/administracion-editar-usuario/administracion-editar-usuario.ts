import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { AutoCompleteModule } from 'primeng/autocomplete';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { EmpleadosService, Empleado } from '../../../core/services/empleados.service';

@Component({
  standalone: true,
  selector: 'app-administracion-editar-usuario',
  templateUrl: './administracion-editar-usuario.html',
  imports: [
    CommonModule,
    FormsModule,
    AutoCompleteModule,
    InputTextModule,
    ButtonModule,
    CardModule,
    ToastModule
  ],
  providers: [MessageService]
})
export class AdministracionEditarUsuarioComponent implements OnInit {

  usuarios: Empleado[] = [];  // lista de todos los usuarios
  usuario!: Empleado;         // usuario a editar

  cargos = [
    { label: 'Administrador', value: 'ADMIN' },
    { label: 'Ventas', value: 'VENTAS' },
    { label: 'Almacenero', value: 'ALMACENERO' }
  ];

  cargosFiltrados: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private empleadosService: EmpleadosService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.cargarUsuarios();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const empleado = this.usuarios.find(e => e.id_empleado === id);
      if (empleado) {
        // Clonamos para no modificar hasta guardar
        this.usuario = { ...empleado };
      }
    }
  }

  /* Cargar lista de usuarios */
  cargarUsuarios(): void {
    this.usuarios = this.empleadosService.getEmpleados();
  }

  /* AUTOCOMPLETE */
  filtrarCargos(event: any) {
    const query = event.query.toLowerCase();
    this.cargosFiltrados = this.cargos.filter(c =>
      c.label.toLowerCase().includes(query)
    );
  }

  /* GUARDAR CAMBIOS */
  guardarCambios(): void {
    const actualizado = this.empleadosService.actualizarEmpleado(this.usuario);

    if (actualizado) {
      this.messageService.add({
        severity: 'success',
        summary: 'Registro Exitoso',
        detail: 'Se realizó un cambio en el registro',
        life: 3000
      });

      setTimeout(() => {
        this.router.navigate(['/admin/usuarios']); // vuelve a la lista
      }, 800);
    }
  }

  /* CANCELAR */
  cancelar(): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Acción cancelada',
      detail: 'No se realizaron cambios',
      life: 2000
    });

    setTimeout(() => {
      this.router.navigate(['/admin/usuarios']);
    }, 500);
  }
}
