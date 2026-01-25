import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { UsuarioService } from '../../services/usuario.service';
import { UsuarioInterfaceResponse, UsuarioResponse } from '../../interfaces/usuario.interface';

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
    InputTextModule
  ],
  templateUrl: './administracion-crear-usuario.html',
  styleUrls: ['./administracion-crear-usuario.css']
})
export class AdministracionCrearUsuario implements OnInit{

  users: UsuarioInterfaceResponse[] = [];
  totalusers: number | null = null;
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
    private usuarioService: UsuarioService
  ) {}

  ngOnInit(): void {
      console.log("crear usuarios");
      this.getUsuarios();      
  }

  get usuariosFiltrados() {
    if (!this.filtroDni) {
      return this.usuarios;
    }

    return this.usuarios.filter(u =>
      u.dni.includes(this.filtroDni)
    );
  }

  limpiarFiltro() {
    this.filtroDni = '';
  }

  nuevoUsuario() {
    this.router.navigate(['/admin/usuarios/crear-usuario']);
  }

  getUsuarios(){
    this.usuarioService.getUsuarios().subscribe({
      next: (resp) => {
        this.users = resp.users;
        this.totalusers = resp.total; 
        console.log('usuarios: ', resp)
      },
      error: (err) => {
        console.error('Error al obtener usuarios', err);
      } 
    })
  }

}
