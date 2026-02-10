import { Component, inject, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RadioButtonModule } from 'primeng/radiobutton';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { DividerModule } from 'primeng/divider';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { UsuarioService } from '../../../../services/usuario.service';
import { UsuarioInterfaceResponse, UsuarioRequest } from '../../../../interfaces/usuario.interface';
import { ROLE_NAMES, UserRole } from '../../../../../core/constants/roles.constants';

@Component({
  selector: 'app-administracion',
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    RadioButtonModule,
    BreadcrumbModule,
    DividerModule,
    TableModule,
    TagModule,
    DatePickerModule,
    SelectModule,
    InputNumberModule,
    AutoCompleteModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './administracion.html',
  styleUrls: ['./administracion.css'],
})
export class Administracion implements AfterViewInit {
  activeWizard: 'usuario' | 'cuenta' = 'usuario';

  stepsUsuario = [
    'Datos personales',
    'Contacto y sede',
    'Confirmacion'
  ];

  stepsCuenta = [
    'Seleccionar usuario',
    'Credenciales',
    'Rol',
    'Confirmacion'
  ];

  activeStepUsuario = 0;
  activeStepCuenta = 0;

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
  rolCuentaSeleccionado: string | null = null;

  sedes: { label: string; value: number }[] = [
    { label: 'Sede Principal', value: 1 }
  ];

  generos: { label: string; value: 'M' | 'F' }[] = [
    { label: 'Masculino', value: 'M' },
    { label: 'Femenino', value: 'F' }
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

  usuarioRequestForm: UsuarioRequest = {
    usu_nom: '',
    ape_mat: '',
    ape_pat: '',
    dni: '',
    email: '',
    celular: 0,
    direccion: '',
    genero: '',
    fec_nac: '',
    activo: true,
    id_sede: 1,
    sedeNombre: 'Sede Principal',
    nombreCompleto: ''
  };

  usuarios: UsuarioInterfaceResponse[] = [];
  cargandoUsuarios = false;
  dniInput: number | null = null;
  celularInput: number | null = null;
  filtroUsuarioCuenta = '';
  usuarioCuentaSeleccionado: UsuarioInterfaceResponse | null = null;
  usuariosSugeridosCuenta: UsuarioInterfaceResponse[] = [];
  cuentaForm = {
    username: '',
    password: '',
    confirmPassword: ''
  };

  private usuarioService = inject(UsuarioService);
  private messageService = inject(MessageService);
  private router = inject(Router);

  ngAfterViewInit() {
    setTimeout(() => {
      this.listarUsuarios();
    }, 0);
  }

  prevStep(): void {
    if (this.activeWizard === 'usuario') {
      if (this.activeStepUsuario > 0) {
        this.activeStepUsuario -= 1;
      }
      return;
    }

    if (this.activeStepCuenta > 0) {
      this.activeStepCuenta -= 1;
    }
  }

  nextStep(): void {
    if (this.activeWizard === 'usuario') {
      if (this.activeStepUsuario < this.stepsUsuario.length - 1) {
        this.activeStepUsuario += 1;
      }
      return;
    }

    if (this.activeStepCuenta < this.stepsCuenta.length - 1) {
      this.activeStepCuenta += 1;
    }
  }

  get usuariosSinRolCuenta(): UsuarioInterfaceResponse[] {
    const filtro = this.filtroUsuarioCuenta.trim().toLowerCase();

    if (!filtro) {
      return this.usuarios;
    }

    return this.usuarios.filter((usuario) => {
      const nombreCompleto =
        usuario.nombreCompleto ||
        [usuario.usu_nom, usuario.ape_pat, usuario.ape_mat].filter(Boolean).join(' ');
      const dni = usuario.dni || '';

      return (
        nombreCompleto.toLowerCase().includes(filtro) ||
        dni.toLowerCase().includes(filtro)
      );
    });
  }

  filtrarUsuariosCuenta(event: { query: string }): void {
    const filtro = event.query.trim().toLowerCase();

    if (!filtro) {
      this.usuariosSugeridosCuenta = this.usuarios.map((usuario) => ({
        ...usuario,
        nombreCompleto: this.getNombreCompleto(usuario)
      }));
      return;
    }

    this.usuariosSugeridosCuenta = this.usuarios
      .map((usuario) => ({
        ...usuario,
        nombreCompleto: this.getNombreCompleto(usuario)
      }))
      .filter((usuario) => {
        const nombreCompleto = (usuario.nombreCompleto || '').toLowerCase();
        const dni = usuario.dni || '';
        return nombreCompleto.includes(filtro) || dni.toLowerCase().includes(filtro);
      });
  }

  getNombreCompleto(usuario: UsuarioInterfaceResponse): string {
    return (
      usuario.nombreCompleto ||
      [usuario.usu_nom, usuario.ape_pat, usuario.ape_mat].filter(Boolean).join(' ')
    );
  }

  seleccionarUsuarioCuenta(usuario: UsuarioInterfaceResponse): void {
    this.usuarioCuentaSeleccionado = {
      ...usuario,
      nombreCompleto: this.getNombreCompleto(usuario)
    };
    this.filtroUsuarioCuenta = this.getNombreCompleto(this.usuarioCuentaSeleccionado);
  }

  crearCuentaUsuario(): void {
    if (!this.usuarioCuentaSeleccionado) {
      alert('Seleccione un usuario');
      return;
    }

    if (!this.cuentaForm.username || !this.cuentaForm.password || !this.cuentaForm.confirmPassword) {
      alert('Complete las credenciales');
      return;
    }

    if (this.cuentaForm.password !== this.cuentaForm.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    if (!this.rolCuentaSeleccionado) {
      alert('Seleccione un rol');
      return;
    }

    const roleId =
      this.rolCuentaSeleccionado === 'ADMIN'
        ? UserRole.ADMIN
        : this.rolCuentaSeleccionado === 'VENTAS'
          ? UserRole.VENTAS
          : UserRole.ALMACEN;

    const payload = {
      userId: this.usuarioCuentaSeleccionado.id_usuario,
      username: this.cuentaForm.username,
      password: this.cuentaForm.password,
      roleId
    };

    console.log('POST /create-account payload:', JSON.stringify(payload));

    this.usuarioService.postCuentaUsuario(payload).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Cuenta creada',
          detail: 'La cuenta se registro correctamente.',
          life: 1500
        });
        setTimeout(() => {
          this.router.navigate(['/admin/usuarios']);
        }, 1500);
      },
      error: (err) => {
        console.error('Error al crear cuenta', {
          status: err?.status,
          message: err?.message,
          error: err?.error,
          url: err?.url
        });
        alert('Error al crear cuenta');
      }
    });
  }

  allowOnlyLetters(event: KeyboardEvent): void {
    const key = event.key;
    if (key.length !== 1) return;
    if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]$/.test(key)) {
      event.preventDefault();
    }
  }

  sanitizeOnlyLetters(value: string): string {
    return value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, '');
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

  enviarUsuarioRequestPrueba() {
    const payload: UsuarioRequest = {
      ...this.usuarioRequestForm,
      dni: this.dniInput === null ? '' : String(this.dniInput),
      celular: this.celularInput === null ? 0 : this.celularInput,
      nombreCompleto: this.buildNombreCompleto(),
      fec_nac: this.formatFechaNac(this.usuarioRequestForm.fec_nac as unknown as string | Date),
      sedeNombre: this.getSedeNombre(),
      activo: true
    };

    console.log('POST /admin/users payload:', JSON.stringify(payload));

    this.usuarioService.postUsuarios(payload).subscribe({
      next: (data) => {
        console.log('Usuario creado (prueba):', data);
        this.listarUsuarios();
        this.resetFormularioPrueba();
      },
      error: (err) => {
        console.error('Error al crear usuario (prueba):', err);
      }
    });
  }

  buildNombreCompleto(): string {
    const nombre = this.usuarioRequestForm.usu_nom?.trim();
    const apePat = this.usuarioRequestForm.ape_pat?.trim();
    const apeMat = this.usuarioRequestForm.ape_mat?.trim();

    return [nombre, apePat, apeMat].filter(Boolean).join(' ');
  }

  getSedeNombre(): string {
    const sede = this.sedes.find((item) => item.value === this.usuarioRequestForm.id_sede);
    return sede?.label ?? 'Sede Principal';
  }

  private formatFechaNac(value: string | Date): string {
    if (!value) return '';
    if (value instanceof Date) {
      return value.toISOString().slice(0, 10);
    }
    return value;
  }

  private resetFormularioPrueba(): void {
    this.usuarioRequestForm = {
      usu_nom: '',
      ape_mat: '',
      ape_pat: '',
      dni: '',
      email: '',
      celular: 0,
      direccion: '',
      genero: '',
      fec_nac: '',
      activo: true,
      id_sede: 1,
      sedeNombre: 'Sede Principal',
      nombreCompleto: ''
    };
    this.dniInput = null;
    this.celularInput = null;
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

  getRolDisplay(usuario: UsuarioInterfaceResponse): string {
    const rolTexto =
      usuario.rolNombre ||
      usuario.rol_nombre ||
      usuario.rol ||
      usuario.role ||
      (typeof usuario.roleId === 'number' ? ROLE_NAMES[usuario.roleId as keyof typeof ROLE_NAMES] : '');

    return rolTexto || 'Sin rol';
  }

  getEstadoSeverity(activo: boolean): 'success' | 'danger' {
    return activo ? 'success' : 'danger';
  }
}
