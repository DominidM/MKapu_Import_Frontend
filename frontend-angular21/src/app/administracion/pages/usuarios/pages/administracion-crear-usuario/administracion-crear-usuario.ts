import { Component, ChangeDetectorRef, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { PasswordModule } from 'primeng/password';
import { UsuarioService } from '../../../../services/usuario.service';
import { UsuarioInterfaceResponse } from '../../../../interfaces/usuario.interface';
import { AuthService } from '../../../../../auth/services/auth.service';
import { UserRole } from '../../../../../core/constants/roles.constants';
import { SedeService } from '../../../../services/sede.service';
import { RoleService } from '../../../../services/role.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { MessageModule } from 'primeng/message';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { SharedTableContainerComponent } from '../../../../../shared/components/table.componente/shared-table-container.component';

interface SelectOption {
  label: string;
  value: any;
}

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
    SelectModule,
    PasswordModule,
    RouterModule,
    ToastModule,
    MessageModule,
    ConfirmDialogModule,
    DialogModule,
    TooltipModule,
    SharedTableContainerComponent,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './administracion-crear-usuario.html',
  styleUrls: ['./administracion-crear-usuario.css'],
})
export class AdministracionCrearUsuario implements OnInit {
  private allUsers: UsuarioInterfaceResponse[] = [];
  cargandoUsuarios = false;
  errorUsuarios    = '';
  filtroDni        = '';
  filtroEstado: boolean | null = true;
  filtroSede: number | null    = null;
  filtroRol: string | null     = null;

  // ── Auth ──────────────────────────────────────────────────────────
  esAdmin        = false;
  sedeNombre     = 'Mi sede';
  sedePropiaId: number | null = null;

  // ── Permisos individuales ─────────────────────────────────────────
  puedeCrearUsuario    = false; 
  puedeEditarUsuario   = false; 
  puedeSeguimiento     = false; 
  puedeVerDetalle      = false; 

  // ── Credenciales — solo ADMIN puede cambiarlas ────────────────────
  get puedeCambiarCredenciales(): boolean { return this.esAdmin; }

  paginaActual = signal<number>(1);
  limitePagina = signal<number>(5);

  estados: SelectOption[] = [
    { label: 'Todos',    value: null  },
    { label: 'Activo',   value: true  },
    { label: 'Inactivo', value: false },
  ];

  Sede: SelectOption[] = [];
  Rol:  SelectOption[] = [];

  dialogVisible       = false;
  usuarioSeleccionado = signal<UsuarioInterfaceResponse | null>(null);

  showCredModal     = false;
  credLoading       = false;
  credUsuarioId     = 0;
  credUsuarioNombre = '';
  credNomUsu        = '';
  credPassword      = '';
  credConfirm       = '';

  get usuariosFiltrados(): UsuarioInterfaceResponse[] {
    let result = [...this.allUsers];
    if (this.filtroDni.trim())
      result = result.filter((u) => (u.dni || '').includes(this.filtroDni.trim()));
    if (this.filtroSede !== null)
      result = result.filter((u) => u.id_sede === this.filtroSede);
    if (this.filtroRol !== null) {
      result = result.filter((u) => {
        const rol = (u.rolNombre || u.rol_nombre || u.rol || u.role || '').toUpperCase();
        return rol === this.filtroRol;
      });
    }
    return result;
  }

  get usuariosPaginados(): UsuarioInterfaceResponse[] {
    const inicio = (this.paginaActual() - 1) * this.limitePagina();
    return this.usuariosFiltrados.slice(inicio, inicio + this.limitePagina());
  }

  get totalusers():   number { return this.usuariosFiltrados.length; }
  get totalPaginas(): number { return Math.ceil(this.usuariosFiltrados.length / this.limitePagina()); }

  onPageChange(page: number):   void { this.paginaActual.set(page); }
  onLimitChange(limit: number): void { this.limitePagina.set(limit); this.paginaActual.set(1); }

  constructor(
    private router:              Router,
    private usuarioService:      UsuarioService,
    private authService:         AuthService,
    private sedeService:         SedeService,
    private cdr:                 ChangeDetectorRef,
    private confirmationService: ConfirmationService,
    private messageService:      MessageService,
    private roleService:         RoleService,
  ) {}

  ngOnInit(): void {
    this.cargandoUsuarios = true;
    const currentUser = this.authService.getCurrentUser();

    this.esAdmin      = this.authService.getRoleId() === UserRole.ADMIN;
    this.sedePropiaId = currentUser?.idSede ?? null;
    this.sedeNombre   = currentUser?.sedeNombre ?? 'Mi sede';

    // ── Resolver permisos desde el usuario logeado ────────────────
    this.puedeCrearUsuario  = this.authService.hasPermiso('CREAR_USUARIOS');
    this.puedeEditarUsuario = this.authService.hasPermiso('EDITAR_USUARIOS');
    this.puedeSeguimiento   = this.authService.hasPermiso('SEGUIMIENTO_EMPLEADO');
    this.puedeVerDetalle    = this.authService.hasPermiso('VER_USUARIOS');

    const sedeGuardada = localStorage.getItem('filtroSedeUsuarios');
    this.filtroSede = sedeGuardada 
      ? Number(sedeGuardada) 
      : (this.esAdmin ? this.sedePropiaId : this.sedePropiaId);

    forkJoin({
      sedes:    this.sedeService.getSedes(),
      usuarios: this.usuarioService.getUsuariosPorEstado(true),
      roles:    this.roleService.loadRoles(),
    }).subscribe({
      next: ({ sedes, usuarios, roles }) => {
        const sedePropia = sedes.headquarters.find(s => s.id_sede === this.sedePropiaId);
        const otrosSedes = sedes.headquarters.filter(s => s.id_sede !== this.sedePropiaId);

        this.Sede = [
          { label: 'Todas', value: null },
          ...(sedePropia ? [{ label: `${sedePropia.nombre}`, value: sedePropia.id_sede }] : []),
          ...otrosSedes.map((s) => ({ label: s.nombre, value: s.id_sede })),
        ];

        this.Rol = [
          { label: 'Todos', value: null },
          ...roles
            .filter((r) => r.activo)
            .map((r) => ({ label: r.nombre.toUpperCase(), value: r.nombre.toUpperCase() })),
        ];
        this.allUsers         = usuarios.users;
        this.cargandoUsuarios = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargandoUsuarios = false;
        this.errorUsuarios    = 'Error al cargar datos';
      },
    });
  }

  onEstadoChange(): void {
    this.cargandoUsuarios = true;
    this.paginaActual.set(1);
    const request$ =
      this.filtroEstado === null
        ? this.usuarioService.getUsuarios()
        : this.usuarioService.getUsuariosPorEstado(this.filtroEstado);

    request$.subscribe({
      next: (resp) => {
        this.allUsers         = resp.users;
        this.cargandoUsuarios = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargandoUsuarios = false;
        this.errorUsuarios    = 'Error al filtrar usuarios';
      },
    });
  }

  onSedeChange(): void {
    if (!this.esAdmin) { this.filtroSede = this.sedePropiaId; return; }
    this.paginaActual.set(1);
  }

  onRolChange():    void { this.paginaActual.set(1); }
  aplicarFiltros(): void { this.paginaActual.set(1); }

  limpiarFiltro(): void {
    this.filtroDni    = '';
    this.filtroEstado = null;
    this.filtroRol    = null;
    this.filtroSede   = this.esAdmin ? null : this.sedePropiaId;
    this.paginaActual.set(1);
    this.onEstadoChange();
  }

  nuevoUsuario(): void { this.router.navigate(['/admin/usuarios/crear-usuario']); }

  verDetalle(usuario: UsuarioInterfaceResponse): void {
    this.usuarioSeleccionado.set(usuario);
    this.dialogVisible = true;
  }

  confirmToggleStatus(usuario: UsuarioInterfaceResponse): void {
    const nextStatus = !usuario.activo;
    const verb       = nextStatus ? 'activar' : 'desactivar';
    this.confirmationService.confirm({
      header:      'Confirmación',
      message:     `¿Deseas ${verb} el usuario ${usuario.usu_nom} (${usuario.dni})?`,
      icon:        'pi pi-exclamation-triangle',
      acceptLabel: nextStatus ? 'Activar' : 'Desactivar',
      rejectLabel: 'Cancelar',
      acceptButtonProps: { severity: (nextStatus ? 'success' : 'danger') as any },
      rejectButtonProps: { severity: 'secondary', outlined: true },
      accept: () => {
        this.usuarioService.updateUsuarioStatus(usuario.id_usuario, { activo: nextStatus }).subscribe({
          next: () => {
            usuario.activo = nextStatus;
            this.messageService.add({
              severity: 'success',
              summary:  nextStatus ? 'Usuario activado' : 'Usuario desactivado',
              detail:   nextStatus
                ? `Se activó el usuario ${usuario.usu_nom}.`
                : `Se desactivó el usuario ${usuario.usu_nom}.`,
            });
            this.onEstadoChange();
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error', summary: 'Error',
              detail: err?.error?.message ?? 'No se pudo cambiar el estado del usuario.',
            });
          },
        });
      },
    });
  }

  openCredModal(usuario: UsuarioInterfaceResponse): void {
    this.credUsuarioId     = usuario.id_usuario;
    this.credUsuarioNombre = `${usuario.usu_nom} ${usuario.ape_pat} ${usuario.ape_mat}`.trim();
    this.credNomUsu        = '';
    this.credPassword      = '';
    this.credConfirm       = '';
    this.credLoading       = true;
    this.showCredModal     = true;

    this.usuarioService.getAccountByUserId(usuario.id_usuario).subscribe({
      next:  (res) => { this.credNomUsu = res.nom_usu; this.credLoading = false; },
      error: ()    => { this.credLoading = false; },
    });
  }

  closeCredModal(): void {
    this.showCredModal = false;
    this.credNomUsu    = '';
    this.credPassword  = '';
    this.credConfirm   = '';
  }

  saveCredentials(): void {
    const nom_usu          = this.credNomUsu.trim();
    const nueva_contraseña = this.credPassword.trim();
    const confirmar        = this.credConfirm.trim();

    if (!nom_usu && !nueva_contraseña) {
      this.messageService.add({
        severity: 'warn', summary: 'Atención',
        detail: 'Debes completar al menos el nombre de usuario o la contraseña.', life: 4000,
      });
      return;
    }

    if (nueva_contraseña && nueva_contraseña !== confirmar) {
      this.messageService.add({
        severity: 'error', summary: 'Error',
        detail: 'Las contraseñas no coinciden.', life: 4000,
      });
      return;
    }

    const body: { nom_usu?: string; nueva_contraseña?: string } = {};
    if (nom_usu)          body.nom_usu          = nom_usu;
    if (nueva_contraseña) body.nueva_contraseña  = nueva_contraseña;

    this.credLoading = true;
    this.usuarioService.changeCredentials(this.credUsuarioId, body).subscribe({
      next: () => {
        this.credLoading = false;
        this.closeCredModal();
        this.messageService.add({
          severity: 'success', summary: 'Credenciales actualizadas',
          detail: `Las credenciales de ${this.credUsuarioNombre} fueron actualizadas.`, life: 3500,
        });
      },
      error: (err) => {
        this.credLoading = false;
        this.messageService.add({
          severity: 'error', summary: 'Error',
          detail: err?.error?.message ?? 'No se pudieron actualizar las credenciales.', life: 4000,
        });
      },
    });
  }
}