import { Component, inject, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';

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
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';

import { UsuarioService } from '../../../../services/usuario.service';
import { SedeService } from '../../../../services/sede.service';
import { Headquarter } from '../../../../interfaces/sedes.interface';
import { UsuarioInterfaceResponse, UsuarioRequest } from '../../../../interfaces/usuario.interface';
import { ROLE_NAMES } from '../../../../../core/constants/roles.constants';
import { RoleService } from '../../../../services/role.service';
import { AuthService } from '../../../../../auth/services/auth.service';

@Component({
  selector: 'app-administracion',
  standalone: true,
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
    ToastModule,
    ConfirmDialogModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './administracion-crear.html',
  styleUrls: ['./administracion-crear.css'],
})
export class AdministracionCrear implements AfterViewInit {

  roles: { label: string; value: number; icon: string; description: string; emoji: string }[] = [];
  rolCuentaSeleccionado: number | null = null;

  sedes: { label: string; value: number }[] = [];
  sedesRaw: Headquarter[] = [];

  generos: { label: string; value: 'M' | 'F' }[] = [
    { label: 'Masculino', value: 'M' },
    { label: 'Femenino', value: 'F' },
  ];

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
    id_sede: 0,
    sedeNombre: '',
    nombreCompleto: '',
  };

  dniInput: string = '';
  celularInput: number | null = null;
  buscandoDni = false;
  maxFechaNac: Date = this.calcularMaxFechaNac();

  cuentaForm = { username: '', password: '', confirmPassword: '' };
  enviando = false;

  readonly limites = {
    usu_nom: { max: 100 },
    ape_pat: { max: 50 },
    ape_mat: { max: 50 },
    dni: { max: 8 },
    email: { max: 150 },
    celular: { max: 9 },
    direccion: { max: 100 },
    username: { max: 50 },
    password: { max: 255 },
  };

  private usuarioService = inject(UsuarioService);
  private sedeService = inject(SedeService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private router = inject(Router);
  private roleService = inject(RoleService);
  private authService = inject(AuthService);

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.cargarSedes();
      this.cargarRoles();
    }, 0);
  }

  private calcularMaxFechaNac(): Date {
    const hoy = new Date();
    hoy.setFullYear(hoy.getFullYear() - 18);
    return hoy;
  }

  private cargarSedes(): void {
    this.sedeService.getSedes().subscribe({
      next: (response) => {
        const sedesResponse = Array.isArray(response) ? response : (response?.headquarters ?? []);
        this.sedesRaw = sedesResponse;
        this.sedes = this.sedesRaw.map((s) => ({ label: s.nombre, value: s.id_sede }));

        const currentUser = this.authService.getCurrentUser();
        const idSedeUsuario = currentUser?.idSede ?? null;
        const sedeMatch = idSedeUsuario ? this.sedes.find((s) => s.value === idSedeUsuario) : null;
        const sedePreseleccionada = sedeMatch ?? this.sedes[0] ?? null;

        if (sedePreseleccionada) {
          this.usuarioRequestForm.id_sede = sedePreseleccionada.value;
          this.usuarioRequestForm.sedeNombre = sedePreseleccionada.label;
        }
      },
      error: () => {
        this.sedes = [];
      },
    });
  }

  private cargarRoles(): void {
    this.roleService.loadRoles().subscribe({
      next: () => {
        this.roles = this.roleService.roles().map((rol) => ({
          label: rol.nombre,
          value: rol.id_rol,
          icon: this.getIconForRole(rol.nombre),
          emoji: this.getEmojiForRole(rol.nombre),
          description: rol.descripcion ?? '',
        }));
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los roles.',
        });
      },
    });
  }

  private getIconForRole(nombre: string): string {
    const n = nombre.toLowerCase();
    if (n.includes('admin')) return 'pi pi-shield';
    if (n.includes('venta') || n.includes('caja')) return 'pi pi-money-bill';
    if (n.includes('almacen') || n.includes('almacén')) return 'pi pi-warehouse';
    if (n.includes('rrhh') || n.includes('recursos')) return 'pi pi-users';
    if (n.includes('delivery')) return 'pi pi-truck';
    return 'pi pi-user';
  }

  private getEmojiForRole(nombre: string): string {
    const n = nombre.toLowerCase();
    if (n.includes('admin')) return '🛡️';
    if (n.includes('venta') || n.includes('caja')) return '💰';
    if (n.includes('almacen') || n.includes('almacén')) return '📦';
    if (n.includes('rrhh') || n.includes('recursos')) return '👥';
    if (n.includes('delivery')) return '🚚';
    if (n.includes('contab')) return '📊';
    return '👤';
  }

  buscarPorDni(): void {
    if (!this.dniInput || this.dniInput.length !== 8) {
      this.messageService.add({
        severity: 'warn',
        summary: 'DNI inválido',
        detail: 'Ingresa un DNI de 8 dígitos.',
      });
      return;
    }

    this.buscandoDni = true;
    this.usuarioService.consultarDocumentoIdentidad(this.dniInput).subscribe({
      next: (res) => {
        this.buscandoDni = false;
        if (!res.nombres && !res.apellidoPaterno) {
          this.messageService.add({
            severity: 'warn',
            summary: 'No encontrado',
            detail: 'No se encontró información para ese DNI.',
          });
          return;
        }
        this.usuarioRequestForm.usu_nom = res.nombres?.toUpperCase() ?? '';
        this.usuarioRequestForm.ape_pat = res.apellidoPaterno?.toUpperCase() ?? '';
        this.usuarioRequestForm.ape_mat = res.apellidoMaterno?.toUpperCase() ?? '';
        this.messageService.add({
          severity: 'success',
          summary: 'RENIEC',
          detail: `Datos cargados: ${res.nombreCompleto}`,
          life: 3000,
        });
      },
      error: () => {
        this.buscandoDni = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo consultar RENIEC.',
        });
      },
    });
  }

  confirmarCreacion(): void {
    if (!this.validarFormulario()) return;

    this.confirmationService.confirm({
      header: 'Confirmar creación de usuario',
      message: `
        ¿Los datos ingresados son correctos?<br><br>
        <strong>Nombre:</strong> ${this.buildNombreCompleto() || '-'}<br>
        <strong>DNI:</strong> ${this.dniInput || '-'}<br>
        <strong>Email:</strong> ${this.usuarioRequestForm.email || '-'}<br>
        <strong>Username:</strong> ${this.cuentaForm.username || '-'}<br>
        <strong>Rol:</strong> ${this.rolSeleccionadoNombre}<br>
        <strong>Sede:</strong> ${this.getSedeNombre() || '-'}
      `,
      icon: 'pi pi-user-plus',
      acceptLabel: 'Crear usuario',
      rejectLabel: 'Revisar datos',
      acceptButtonProps: { severity: 'warning' },
      rejectButtonProps: { severity: 'secondary', outlined: true },
      accept: () => this.enviarUsuarioRequestPrueba(),
    });
  }

  private validarFormulario(): boolean {
    const nom = this.usuarioRequestForm.usu_nom?.trim();
    const pat = this.usuarioRequestForm.ape_pat?.trim();
    const mat = this.usuarioRequestForm.ape_mat?.trim();
    const dir = this.usuarioRequestForm.direccion?.trim();

    if (!nom) {
      this.msg('warn', 'Ingresa el nombre del usuario.');
      return false;
    }
    if (nom.length > this.limites.usu_nom.max) {
      this.msg('warn', `Nombre: máximo ${this.limites.usu_nom.max} caracteres.`);
      return false;
    }
    if (!pat) {
      this.msg('warn', 'Ingresa el apellido paterno.');
      return false;
    }
    if (pat.length > this.limites.ape_pat.max) {
      this.msg('warn', `Apellido paterno: máximo ${this.limites.ape_pat.max} caracteres.`);
      return false;
    }
    if (mat && mat.length > this.limites.ape_mat.max) {
      this.msg('warn', `Apellido materno: máximo ${this.limites.ape_mat.max} caracteres.`);
      return false;
    }
    if (!this.dniInput || this.dniInput.length !== 8) {
      this.msg('warn', 'El DNI debe tener exactamente 8 dígitos.');
      return false;
    }
    if (this.usuarioRequestForm.email) {
      const emailOk = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(
        this.usuarioRequestForm.email,
      );
      if (!emailOk) {
        this.msg('warn', 'El email no tiene un formato válido.');
        return false;
      }
      if (this.usuarioRequestForm.email.length > this.limites.email.max) {
        this.msg('warn', `Email: máximo ${this.limites.email.max} caracteres.`);
        return false;
      }
    }
    if (this.celularInput !== null) {
      const cel = String(this.celularInput);
      if (cel.length > this.limites.celular.max) {
        this.msg('warn', 'El celular debe tener máximo 9 dígitos.');
        return false;
      }
    }
    if (!dir) {
      this.msg('warn', 'Ingresa la dirección.');
      return false;
    }
    if (dir.length > this.limites.direccion.max) {
      this.msg('warn', `Dirección: máximo ${this.limites.direccion.max} caracteres.`);
      return false;
    }
    if (this.usuarioRequestForm.fec_nac) {
      const fechaNac = new Date(this.usuarioRequestForm.fec_nac as any);
      if (fechaNac > this.maxFechaNac) {
        this.msg('warn', 'El usuario debe tener al menos 18 años.');
        return false;
      }
    }
    if (!this.usuarioRequestForm.id_sede) {
      this.msg('warn', 'Selecciona una sede.');
      return false;
    }
    if (!this.cuentaForm.username.trim()) {
      this.msg('warn', 'Ingresa el nombre de usuario.');
      return false;
    }
    if (this.cuentaForm.username.length > this.limites.username.max) {
      this.msg('warn', `Username: máximo ${this.limites.username.max} caracteres.`);
      return false;
    }
    if (!this.cuentaForm.password) {
      this.msg('warn', 'Ingresa la contraseña.');
      return false;
    }
    if (this.cuentaForm.password.length < 8) {
      this.msg('warn', 'La contraseña debe tener mínimo 8 caracteres.');
      return false;
    }
    if (this.cuentaForm.password !== this.cuentaForm.confirmPassword) {
      this.msg('warn', 'Las contraseñas no coinciden.');
      return false;
    }
    if (!this.rolCuentaSeleccionado) {
      this.msg('warn', 'Selecciona un rol.');
      return false;
    }
    return true;
  }

  private msg(severity: string, detail: string): void {
    this.messageService.add({ severity, summary: 'Validación', detail, life: 3500 });
  }

  enviarUsuarioRequestPrueba(): void {
    const sedeIdCapturada = this.usuarioRequestForm.id_sede;
    const sedeNombreCapturada = this.getSedeNombre();
    this.enviando = true;

    const payload: UsuarioRequest = {
      ...this.usuarioRequestForm,
      dni: this.dniInput ?? '',
      celular: this.celularInput === null ? 0 : this.celularInput,
      nombreCompleto: this.buildNombreCompleto(),
      fec_nac: this.formatFechaNac(this.usuarioRequestForm.fec_nac as unknown as string | Date),
      sedeNombre: sedeNombreCapturada,
      id_sede: sedeIdCapturada,
      activo: true,
    };

    this.usuarioService.postUsuarios(payload).subscribe({
      next: (usuarioCreado: any) => {
        const cuentaPayload = {
          userId: usuarioCreado.id_usuario,
          username: this.cuentaForm.username,
          password: this.cuentaForm.password,
          id_sede: sedeIdCapturada,
          roleId: this.rolCuentaSeleccionado!,
        };
        this.usuarioService.postCuentaUsuario(cuentaPayload).subscribe({
          next: () => {
            this.enviando = false;
            this.messageService.add({
              severity: 'success',
              summary: '¡Listo!',
              detail: 'Usuario y cuenta creados correctamente.',
              life: 2000,
            });
            setTimeout(() => this.router.navigate(['/admin/usuarios']), 2000);
          },
          error: () => {
            this.enviando = false;
            this.messageService.add({
              severity: 'warn',
              summary: 'Usuario creado',
              detail: 'El usuario fue creado pero hubo un error al crear la cuenta.',
            });
          },
        });
      },
      error: (err) => {
        this.enviando = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err?.error?.message ?? 'No se pudo crear el usuario.',
        });
      },
    });
  }

  buildNombreCompleto(): string {
    return [
      this.usuarioRequestForm.usu_nom?.trim(),
      this.usuarioRequestForm.ape_pat?.trim(),
      this.usuarioRequestForm.ape_mat?.trim(),
    ]
      .filter(Boolean)
      .join(' ');
  }

  getSedeNombre(): string {
    return this.sedes.find((s) => s.value === this.usuarioRequestForm.id_sede)?.label ?? '';
  }

  private formatFechaNac(value: string | Date): string {
    if (!value) return '';
    if (value instanceof Date) return value.toISOString().slice(0, 10);
    return value;
  }

  private resetFormulario(): void {
    const currentUser = this.authService.getCurrentUser();
    const idSedeUsuario = currentUser?.idSede ?? null;
    const sedeMatch = idSedeUsuario ? this.sedes.find((s) => s.value === idSedeUsuario) : null;
    const sedePreseleccionada = sedeMatch ?? this.sedes[0] ?? null;

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
      id_sede: sedePreseleccionada?.value ?? 0,
      sedeNombre: sedePreseleccionada?.label ?? '',
      nombreCompleto: '',
    };
    this.dniInput = '';
    this.celularInput = null;
    this.cuentaForm = { username: '', password: '', confirmPassword: '' };
    this.rolCuentaSeleccionado = null;
  }

  onDniKeyPress(event: KeyboardEvent): void {
    if (!/^\d$/.test(event.key)) event.preventDefault();
  }

  onDniInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const digits = input.value.replace(/\D/g, '').slice(0, 8);
    this.dniInput = digits;
    input.value = digits;
  }

  allowOnlyLetters(event: KeyboardEvent): void {
    if (event.key.length !== 1) return;
    if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]$/.test(event.key)) event.preventDefault();
  }

  sanitizeOnlyLetters(value: string): string {
    return value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, '').toUpperCase();
  }

  trimUsuarioField(
    key: keyof Pick<UsuarioRequest, 'usu_nom' | 'ape_pat' | 'ape_mat' | 'email' | 'direccion'>,
  ): void {
    const value = this.usuarioRequestForm[key];
    if (typeof value === 'string') this.usuarioRequestForm[key] = value.trim();
  }

  removeAllSpaces(value: string): string {
    return typeof value === 'string' ? value.replace(/\s+/g, '') : '';
  }

  onCelularChange(value: number | null): void {
    if (value === null || value === undefined) {
      this.celularInput = null;
      return;
    }
    const digits = String(value).replace(/\D/g, '');
    if (!digits) {
      this.celularInput = null;
      return;
    }
    this.celularInput = Number(digits.length > 9 ? digits.slice(0, 9) : digits);
  }

  onCelularKeyDown(event: KeyboardEvent): void {
    if (event.key.length !== 1 || !/\d/.test(event.key)) return;
    const input = event.target as HTMLInputElement | null;
    if (!input) return;
    const value = input.value?.replace(/\D/g, '') ?? '';
    const selStart = input.selectionStart ?? value.length;
    const selEnd = input.selectionEnd ?? value.length;
    if (selEnd <= selStart && value.length >= 9) event.preventDefault();
  }

  getEstadoSeverity(activo: boolean): 'success' | 'danger' {
    return activo ? 'success' : 'danger';
  }

  getRolDisplay(usuario: UsuarioInterfaceResponse): string {
    return (
      usuario.rolNombre ||
      usuario.rol_nombre ||
      usuario.rol ||
      usuario.role ||
      (typeof usuario.roleId === 'number'
        ? ROLE_NAMES[usuario.roleId as keyof typeof ROLE_NAMES]
        : '') ||
      'Sin rol'
    );
  }

  get rolSeleccionadoNombre(): string {
    if (!this.rolCuentaSeleccionado) return '-';
    return this.roles.find((r) => r.value === this.rolCuentaSeleccionado)?.label ?? '-';
  }
}
