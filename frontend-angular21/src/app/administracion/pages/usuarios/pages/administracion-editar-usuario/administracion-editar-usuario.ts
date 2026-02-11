import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { SelectModule } from 'primeng/select';
import { MessageService } from 'primeng/api';

import { ActivatedRoute, Router } from '@angular/router';
import { UsuarioService } from '../../../../services/usuario.service';
import { UsuarioInterfaceResponse, UsuarioStatusUpdateRequest, UsuarioUpdateRequest } from '../../../../interfaces/usuario.interface';

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
    SelectModule
  ],
  providers: [MessageService],
  templateUrl: './administracion-editar-usuario.html',
  styleUrls: ['./administracion-editar-usuario.css'],
})
export class AdministracionEditarUsuario implements OnInit {
  testUpdateForm: {
    id: number | null;
    usu_nom: string;
    celular: string;
    direccion: string;
    activo: boolean;
  } = {
    id: null,
    usu_nom: '',
    celular: '',
    direccion: '',
    activo: true
  };

  constructor(
    private usuarioService: UsuarioService,
    private messageService: MessageService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : null;

    if (!id || Number.isNaN(id)) {
      return;
    }

    this.testUpdateForm.id = id;
    this.usuarioService.getUsuarioById(id).subscribe({
      next: (usuario: UsuarioInterfaceResponse) => {
        this.testUpdateForm.usu_nom = usuario.usu_nom || '';
        this.testUpdateForm.celular = usuario.celular ? String(usuario.celular) : '';
        this.testUpdateForm.direccion = usuario.direccion || '';
        this.testUpdateForm.activo = !!usuario.activo;
      },
      error: (err) => {
        console.error('Error al cargar usuario', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cargar el usuario',
          life: 2000
        });
      }
    });
  }

  actualizarDatosUsuario(): void {
    if (!this.testUpdateForm.id) {
      this.messageService.add({
        severity: 'warn',
        summary: 'ID requerido',
        detail: 'Ingrese el ID del usuario',
        life: 2000
      });
      return;
    }

    const payload: UsuarioUpdateRequest = {
      usu_nom: this.testUpdateForm.usu_nom,
      celular: this.testUpdateForm.celular,
      direccion: this.testUpdateForm.direccion
    };

    this.usuarioService.updateUsuario(this.testUpdateForm.id, payload).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Actualizado',
          detail: 'Datos del usuario actualizados',
          life: 2000
        });
      },
      error: (err) => {
        console.error('Error al actualizar usuario', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo actualizar el usuario',
          life: 2000
        });
      }
    });
  }

  actualizarEstadoUsuario(): void {
    if (!this.testUpdateForm.id) {
      this.messageService.add({
        severity: 'warn',
        summary: 'ID requerido',
        detail: 'Ingrese el ID del usuario',
        life: 2000
      });
      return;
    }

    const payload: UsuarioStatusUpdateRequest = {
      activo: this.testUpdateForm.activo
    };

    this.usuarioService.updateUsuarioStatus(this.testUpdateForm.id, payload).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Estado actualizado',
          detail: 'Estado del usuario actualizado',
          life: 2000
        });
      },
      error: (err) => {
        console.error('Error al actualizar estado', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo actualizar el estado',
          life: 2000
        });
      }
    });
  }

  actualizarUsuarioCompleto(): void {
    if (!this.testUpdateForm.id) {
      this.messageService.add({
        severity: 'warn',
        summary: 'ID requerido',
        detail: 'No se encontró el ID del usuario',
        life: 2000
      });
      return;
    }

    const payloadDatos: UsuarioUpdateRequest = {
      usu_nom: this.testUpdateForm.usu_nom,
      celular: this.testUpdateForm.celular,
      direccion: this.testUpdateForm.direccion
    };

    const payloadEstado: UsuarioStatusUpdateRequest = {
      activo: this.testUpdateForm.activo
    };

    this.usuarioService.updateUsuario(this.testUpdateForm.id, payloadDatos).subscribe({
      next: () => {
        this.usuarioService.updateUsuarioStatus(this.testUpdateForm.id!, payloadEstado).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Actualizado',
              detail: 'Usuario actualizado correctamente',
              life: 2000
            });
            setTimeout(() => {
              this.router.navigate(['/admin/usuarios']);
            }, 1200);
          },
          error: (err) => {
            console.error('Error al actualizar estado', err);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Se actualizó los datos, pero falló el estado',
              life: 2000
            });
          }
        });
      },
      error: (err) => {
        console.error('Error al actualizar usuario', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo actualizar el usuario',
          life: 2000
        });
      }
    });
  }
}
