import { Component, inject, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RadioButtonModule } from 'primeng/radiobutton';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { DividerModule } from 'primeng/divider';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

import { UsuarioService } from '../../services/usuario.service';
import { UsuarioInterfaceResponse } from '../../interfaces/usuario.interface';

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
    DividerModule,
    TableModule,
    TagModule
  ],
  templateUrl: './administracion.html',
  styleUrls: ['./administracion.css'],
})
export class Administracion implements AfterViewInit {
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

  usuarios: UsuarioInterfaceResponse[] = [];
  cargandoUsuarios = false;

  private usuarioService = inject(UsuarioService);

  ngAfterViewInit() {
    setTimeout(() => {
      this.listarUsuarios();
    }, 0);
  }

  listarUsuarios() {
    this.cargandoUsuarios = true;

    this.usuarioService.getUsuarios().subscribe({
      next: (data) => {
        console.log('Usuarios obtenidos:', data);
        this.usuarios = data.users;
        this.cargandoUsuarios = false;
      },
      error: (err) => {
        console.error('Error al obtener usuarios:', err);
        this.cargandoUsuarios = false;
      }
    });
  }

  guardarUsuario() {
    console.log('Rol:', this.rolSeleccionado);
    console.log('Usuario:', this.usuario);
    
    setTimeout(() => {
      this.listarUsuarios();
    }, 0);
  }

  getRolSeverity(rol: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    if (!rol) return 'info';
    
    const rolUpper = rol.toUpperCase();
    
    if (rolUpper === 'ADMINISTRADOR' || rolUpper === 'ADMIN') {
      return 'success';
    }
    if (rolUpper === 'CAJERO' || rolUpper === 'VENTAS' || rolUpper === 'VENDEDOR') {
      return 'info';
    }
    if (rolUpper === 'ALMACEN' || rolUpper === 'ALMACENERO') {
      return 'warn';
    }
    
    return 'info';
  }

  getEstadoSeverity(activo: boolean): 'success' | 'danger' {
    return activo ? 'success' : 'danger';
  }
}
