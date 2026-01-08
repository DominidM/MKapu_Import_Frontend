import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RadioButtonModule } from 'primeng/radiobutton';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { DividerModule } from 'primeng/divider';



@Component({
  selector: 'app-administracion',
  imports: [CommonModule, FormsModule, CardModule, ButtonModule, 
    InputTextModule, PasswordModule, 
    RadioButtonModule, BreadcrumbModule, DividerModule],
  templateUrl: './administracion.html',
  styleUrl: './administracion.css',
})
export class Administracion {
  breadcrumbItems = [ 
    { label: 'Inicio' },
    { label: 'Administrador' },
    { label: 'Crear Nuevo Usuario' }
  ];

  roles = [
    {
      label: 'Administrador',
      value: 'ADMIN',
      icon: 'pi pi-shield',
      description: 'Acceso total al sistema y configuración.'
    },
    {
      label: 'Cajero',
      value: 'CAJERO',
      icon: 'pi pi-money-bill',
      description: 'Ventas, caja y facturación.'
    },
    {
      label: 'Jefe de Almacén',
      value: 'ALMACEN',
      icon: 'pi pi-warehouse',
      description: 'Inventario y control de stock.'
    }
  ];

  rolSeleccionado: string | null = null;

  sedes = [
    { label: 'Sede Central', value: 1 },
    { label: 'Proximas sedes...', value: 2 },
    { label: 'Proximas sedes...', value: 3 }
  ];

  usuario = {
    nombre: '',
    sede: null,
    correo: '',
    username: '',
    password: '',
    confirmPassword: ''
  };

  guardarUsuario() {
    console.log('Rol:', this.rolSeleccionado);
    console.log('Usuario:', this.usuario);
  }
}
