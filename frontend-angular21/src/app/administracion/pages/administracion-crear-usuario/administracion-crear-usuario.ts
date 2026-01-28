import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';

import { EmpleadosService, Empleado } from '../../../core/services/empleados.service';

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
export class AdministracionCrearUsuario implements OnInit {

  // 🔍 filtros
  filtroDni = '';
  filtroRol: string | null = null;
  filtroSede: string | null = null;
  filtroEstado: boolean | null = null;

  empleados: Empleado[] = [];

  roles = [
    { label: 'Administrador', value: 'ADMIN' },
    { label: 'Ventas', value: 'VENTAS' },
    { label: 'Almacenero', value: 'ALMACENERO' }
  ];

  estados = [
    { label: 'Activo', value: true },
    { label: 'Inactivo', value: false }
  ];

  sedes: { label: string; value: string }[] = [];

  constructor(
    private router: Router,
    private empleadosService: EmpleadosService
  ) {}

  ngOnInit(): void {
    this.empleados = this.empleadosService.getEmpleados();

    // 🔥 generar sedes únicas para el dropdown
    const sedesUnicas = [...new Set(this.empleados.map(e => e.nombre_sede))];
    this.sedes = sedesUnicas.map(s => ({
      label: s!,
      value: s!
    }));
  }

  get usuariosFiltrados(): Empleado[] {
    return this.empleados.filter(e => {
      const matchDni =
        !this.filtroDni ||
        e.dni.includes(this.filtroDni);

      const matchRol =
        !this.filtroRol ||
        e.cargo === this.filtroRol;

      const matchSede =
        !this.filtroSede ||
        e.nombre_sede === this.filtroSede;

      const matchEstado =
        this.filtroEstado === null ||
        e.estado === this.filtroEstado;

      return matchDni && matchRol && matchSede && matchEstado;
    });
  }

  limpiarFiltro(): void {
    this.filtroDni = '';
    this.filtroRol = null;
    this.filtroSede = null;
    this.filtroEstado = null;
  }

  nuevoUsuario(): void {
    this.router.navigate(['/admin/usuarios/crear-usuario']);
  }

  editarUsuario(id: string) {
    this.router.navigate([
      '/admin',
      'usuarios',
      'administracion',
      'editar-usuario',
      id
    ]);
  }
  
}
