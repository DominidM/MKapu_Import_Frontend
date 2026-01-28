import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RadioButtonModule } from 'primeng/radiobutton';
import { BreadcrumbModule } from 'primeng/breadcrumb';

import { EmpleadosService, Empleado } 
from '../../../core/services/empleados.service';

@Component({
  selector: 'app-administracion-usuario',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    RadioButtonModule,
    BreadcrumbModule
  ],
  templateUrl: './administracion-usuario.html',
  styleUrls: ['./administracion-usuario.css']
})
export class AdministracionUsuarioComponent {

  // ===============================
  // BREADCRUMB
  // ===============================
  breadcrumbItems = [
    { label: 'Inicio' },
    { label: 'Administrador' },
    { label: 'Crear Usuario' }
  ];

  // ===============================
  // ROLES
  // ===============================
  roles: {
    label: string;
    value: Empleado['cargo'];
    icon: string;
    description: string;
  }[] = [
    {
      label: 'Administrador',
      value: 'ADMIN',
      icon: 'pi pi-shield',
      description: 'Acceso total al sistema.'
    },
    {
      label: 'Cajero',
      value: 'VENTAS',
      icon: 'pi pi-money-bill',
      description: 'Ventas y facturación.'
    },
    {
      label: 'Jefe de Almacén',
      value: 'ALMACENERO',
      icon: 'pi pi-warehouse',
      description: 'Gestión de inventario.'
    }
  ];

  rolSeleccionado: Empleado['cargo'] | null = null;

  // ===============================
  // SEDES
  // ===============================
  sedes = [
    { label: 'LAS FLORES', value: 'SEDE001' },
    { label: 'LURÍN', value: 'SEDE002' },
    { label: 'VES', value: 'SEDE003' }
  ];

  // ===============================
  // MODELO DE FORMULARIO
  // ===============================
  usuarioForm = {
    nombres: '',
    apellidos: '',
    dni: '',
    email: '',
    telefono: '',
    id_sede: '',
    usuario: '',
    password: '',
    confirmPassword: ''
  };

  constructor(
    private empleadosService: EmpleadosService,
    private router: Router
  ) {}

  // ===============================
  // SOLO NÚMEROS (DNI / TELÉFONO)
  // ===============================
  soloNumeros(event: KeyboardEvent): void {
    const charCode = event.key.charCodeAt(0);
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }

  // ===============================
  // GUARDAR USUARIO
  // ===============================
  guardarUsuario(): void {

    if (!this.rolSeleccionado) {
      alert('Seleccione un rol');
      return;
    }

    if (this.usuarioForm.dni.length !== 8) {
      alert('El DNI debe tener 8 dígitos');
      return;
    }

    if (this.usuarioForm.password !== this.usuarioForm.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    const nuevoId = `EMP-${Date.now()}`;
    const nuevaSede = this.sedes.find(
      s => s.value === this.usuarioForm.id_sede
    );

    const nuevoEmpleado: Empleado = {
      id_empleado: nuevoId,
      nombres: this.usuarioForm.nombres,
      apellidos: this.usuarioForm.apellidos,
      dni: this.usuarioForm.dni,
      email: this.usuarioForm.email,
      telefono: this.usuarioForm.telefono,
      cargo: this.rolSeleccionado,
      id_sede: this.usuarioForm.id_sede,
      nombre_sede: nuevaSede?.label ?? '',
      usuario: this.usuarioForm.usuario,
      password: this.usuarioForm.password,
      estado: true,
      fecha_contratacion: new Date()
    };

    //this.empleadosService.getEmpleados().push(nuevoEmpleado);

    this.router.navigate([
      '/admin',
      'usuarios',
      'administracion'
    ]);
  }
}
