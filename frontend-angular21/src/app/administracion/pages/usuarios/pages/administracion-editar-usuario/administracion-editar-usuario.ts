import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { MessageModule } from 'primeng/message';
import { DividerModule } from 'primeng/divider';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { SelectModule } from 'primeng/select';
import { MessageService } from 'primeng/api';
import { RoleService } from '../../../../services/role.service';
import { UsuarioService } from '../../../../services/usuario.service';
import { SedeService } from '../../../../services/sede.service';
import {
  UsuarioInterfaceResponse,
  UsuarioStatusUpdateRequest,
  UsuarioUpdateRequest,
} from '../../../../interfaces/usuario.interface';

@Component({
  selector: 'app-administracion-editar-usuario',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    ToastModule,
    SelectModule,
    MessageModule,
    DividerModule,
  ],
  providers: [MessageService],
  templateUrl: './administracion-editar-usuario.html',
  styleUrls: ['./administracion-editar-usuario.css'],
})
export class AdministracionEditarUsuario implements OnInit {
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  form = signal<any>({
    id: null,
    usu_nom: '',
    ape_pat: '',
    ape_mat: '',
    celular: '',
    email: '',
    direccion: '',
    fec_nac: '',
    id_sede: null,
    sedeNombre: '',
    rolNombre: '',
    activo: true,
  });

  sedesOptions = signal<{ label: string; value: any }[]>([]);
  rolesOptions = signal<{ label: string; value: any }[]>([]);

  constructor(
    private usuarioService: UsuarioService,
    private sedeService: SedeService,
    private roleService: RoleService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.sedeService.getSedes().subscribe({
      next: (res: any) => {
        this.sedesOptions.set(
          (res.headquarters || []).map((s: any) => ({ label: s.nombre, value: s.id_sede })),
        );
      },
      error: () => {
        this.error.set('No se pudo cargar la lista de sedes');
        this.msg('error', 'No se pudo cargar la lista de sedes');
      },
    });

    this.roleService.loadRoles().subscribe({
      next: () => {
        this.rolesOptions.set(
          this.roleService.roles().map((r: any) => ({ label: r.nombre, value: r.nombre })),
        );
      },
      error: () => this.msg('error', 'No se pudo cargar los roles'),
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : null;
    if (!id || Number.isNaN(id)) return;

    this.loading.set(true);
    this.form.update((f) => ({ ...f, id }));

    this.usuarioService.getUsuarioById(id).subscribe({
      next: (usuario: UsuarioInterfaceResponse) => {
        this.form.set({
          ...this.form(),
          ...usuario,
          id: usuario.id_usuario ?? id,
          rolNombre: usuario.rolNombre || (usuario as any).roleName || '',
        });
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('No se pudo cargar el usuario');
        this.msg('error', 'No se pudo cargar el usuario');
      },
    });
  }

  setFormField(field: string, value: any): void {
    this.form.update((f) => ({ ...f, [field]: value }));
  }

  toUpperCase(field: string): void {
    const value = this.form()[field];
    if (typeof value === 'string') {
      this.form.update((f) => ({ ...f, [field]: value.toUpperCase() }));
    }
  }

  allowOnlyLetters(event: KeyboardEvent): void {
    if (event.key.length !== 1) return;
    if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]$/.test(event.key)) event.preventDefault();
  }

  allowOnlyDigits(event: KeyboardEvent): void {
    if (event.key.length !== 1) return;
    if (!/^\d$/.test(event.key)) event.preventDefault();
  }

  onCelularEdit(event: Event): void {
    const input = event.target as HTMLInputElement;
    const digits = input.value.replace(/\D/g, '').slice(0, 9);
    input.value = digits;
    this.setFormField('celular', digits);
  }

  onDireccionInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const limpio = input.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s\.\,\-\#\/]/g, '');
    if (input.value !== limpio) {
      input.value = limpio;
      this.setFormField('direccion', limpio);
    }
  }

  trimValue(value: string): string {
    return typeof value === 'string' ? value.trim() : value;
  }

  actualizarUsuarioCompleto(): void {
    const value = this.form();
    if (!value.id) {
      this.msg('warn', 'No se encontró el ID del usuario');
      return;
    }

    const payloadDatos: UsuarioUpdateRequest = {
      usu_nom: value.usu_nom,
      ape_pat: value.ape_pat,
      ape_mat: value.ape_mat,
      celular: value.celular,
      email: value.email,
      direccion: value.direccion,
      fec_nac: value.fec_nac,
      id_sede: value.id_sede,
      rolNombre: value.rolNombre,
    };

    const payloadEstado: UsuarioStatusUpdateRequest = { activo: value.activo };

    this.loading.set(true);

    this.usuarioService.updateUsuario(value.id, payloadDatos).subscribe({
      next: () => {
        this.usuarioService.updateUsuarioStatus(value.id, payloadEstado).subscribe({
          next: () => {
            this.loading.set(false);
            this.msg('success', 'Usuario actualizado correctamente');
            setTimeout(() => this.router.navigate(['/admin/usuarios']), 1200);
          },
          error: () => {
            this.loading.set(false);
            this.msg('error', 'Se actualizaron los datos pero falló el estado');
          },
        });
      },
      error: () => {
        this.loading.set(false);
        this.msg('error', 'No se pudo actualizar el usuario');
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/admin/usuarios']);
  }

  private msg(severity: string, detail: string): void {
    this.messageService.add({
      severity,
      summary: severity === 'success' ? 'Listo' : 'Aviso',
      detail,
      life: 2200,
    });
  }
}
