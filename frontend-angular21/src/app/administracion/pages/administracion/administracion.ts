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
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    RadioButtonModule,
    BreadcrumbModule,
    DividerModule
  ],
  templateUrl: './administracion.html',
  styleUrls: ['./administracion.css'],
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
      label: 'Ventas',
      value: 'VENTAS',
      icon: 'pi pi-money-bill',
      description: 'Ventas, caja y facturación.'
    },
    {
      label: 'Almacen',
      value: 'ALMACEN',
      icon: 'pi pi-warehouse',
      description: 'Inventario y control de stock.'
    }
  ];

  rolSeleccionado: string | null = null;

  sedes: { label: string; value: number }[] = [
    { label: 'Sede Central', value: 1 },
    { label: 'Proximas sedes...', value: 2 },
    { label: 'Proximas sedes...', value: 3 }
  ];

  usuario = {
    dni: '',
    nombre: '',
    sede: null as number | null,
    correo: '',
    username: '',
    password: '',
    confirmPassword: ''
  };

  usuarios: Array<{
    dni: string;
    nombre: string;
    sede: number | null;
    correo: string;
    username: string;
    password: string;
    confirmPassword: string;
    rol: string;
  }> = [];

  // Función para obtener label de la sede
  getSedeLabel(sedeValue: number | null): string {
    if (sedeValue === null) return 'Sin asignar';
    const sede = this.sedes.find(s => s.value === sedeValue);
    return sede ? sede.label : 'Sin asignar';
  }

  guardarUsuario() {
    // Validaciones simples
    if (!this.rolSeleccionado) {
      alert('Seleccione un rol.');
      return;
    }

    if (!this.usuario.dni || !this.usuario.nombre || !this.usuario.username) {
      alert('Complete todos los campos obligatorios.');
      return;
    }

    if (this.usuario.password !== this.usuario.confirmPassword) {
      alert('Las contraseñas no coinciden.');
      return;
    }

    // Crear un nuevo objeto usuario
    const nuevoUsuario = {
      ...this.usuario,
      rol: this.rolSeleccionado
    };

    // Agregar a la lista
    this.usuarios.push(nuevoUsuario);

    // Limpiar formulario
    this.usuario = {
      dni: '',
      nombre: '',
      sede: null,
      correo: '',
      username: '',
      password: '',
      confirmPassword: ''
    };
    this.rolSeleccionado = null;

    alert('Usuario creado correctamente');
    console.log('Usuarios actuales:', this.usuarios);
  }
}
