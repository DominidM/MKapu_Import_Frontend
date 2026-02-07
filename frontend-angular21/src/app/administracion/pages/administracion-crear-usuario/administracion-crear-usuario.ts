import { Component, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { UsuarioService } from '../../services/usuario.service';
import { UsuarioInterfaceResponse } from '../../interfaces/usuario.interface';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'app-administracion-crear-usuario',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    TagModule,
    CardModule,
    InputTextModule,
    SelectModule
  ],
  templateUrl: './administracion-crear-usuario.html',
  styleUrls: ['./administracion-crear-usuario.css']
})
export class AdministracionCrearUsuario implements AfterViewInit {

  users: UsuarioInterfaceResponse[] = [];
  totalusers: number = 0;  // ← Cambiar de null a 0
  filtroDni = '';

  usuarios = [
    {
      dni: '72654321',
      nombre: 'Juan Pérez',
      rol: 'Administrador',
      sede: 'Sede Central',
      estado: 'Activo'
    },
    {
      dni: '74859632',
      nombre: 'María Rodríguez',
      rol: 'Cajero',
      sede: 'Tienda Norte',
      estado: 'Activo'
    },
    {
      dni: '70123456',
      nombre: 'Carlos Gómez',
      rol: 'Jefe de Almacén',
      sede: 'Almacén Principal',
      estado: 'Inactivo'
    },
    {
      dni: '70123856',
      nombre: 'Atun',
      rol: 'Jefe de Almacén',
      sede: 'Almacén Principal',
      estado: 'Inactivo'
    }
  ];

  constructor(
    private router: Router,
    private usuarioService: UsuarioService,
    private cdr: ChangeDetectorRef
  ) {}

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.getUsuarios();
    });
  }

  get usuariosFiltrados() {
    if (!this.filtroDni) {
      return this.usuarios;
    }

    return this.usuarios.filter(u =>
      u.dni.includes(this.filtroDni)
    );
  }

  /*
  limpiarFiltro(): void {
    this.filtroDni = '';
    this.filtroRol = null;
    this.filtroSede = null;
    this.filtroEstado = null;
  }
  */
 
  nuevoUsuario(): void {
    this.router.navigate(['/admin/usuarios/crear-usuario']);
  }

  getUsuarios() {
    this.usuarioService.getUsuarios().subscribe({
      next: (resp) => {
        setTimeout(() => {
          this.users = resp.users;
          this.totalusers = resp.total;
          console.log('usuarios: ', resp);
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        console.error('Error al obtener usuarios', err);
      } 
    });
  }
}
