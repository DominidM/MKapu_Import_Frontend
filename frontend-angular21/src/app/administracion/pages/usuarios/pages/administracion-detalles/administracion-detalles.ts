import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { UsuarioService } from '../../../../services/usuario.service';
import { UsuarioInterfaceResponse } from '../../../../interfaces/usuario.interface';

@Component({
  selector: 'app-administracion-detalles',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CardModule,
    ButtonModule,
    TagModule,
    ToastModule,
  ],
  providers: [MessageService],
  templateUrl: './administracion-detalles.html',
  styleUrls: ['./administracion-detalles.css'],
})
export class AdministracionDetalles implements OnInit {
  usuario = signal<UsuarioInterfaceResponse | null>(null);
  cargando = signal<boolean>(true);
  error = signal<string>('');
  usuarioId = signal<number>(0);

  tituloPagina = computed(() => {
    const u = this.usuario();
    if (!u) return 'DETALLE DE USUARIO';
    return `${u.usu_nom} ${u.ape_pat} ${u.ape_mat}`.trim() || 'DETALLE DE USUARIO';
  });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private usuarioService: UsuarioService,
    private messageService: MessageService,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe({
      next: (params) => {
        const id = Number(params.get('id') || 0);
        this.usuarioId.set(id);

        if (!id) {
          this.error.set('No se encontró el identificador del usuario.');
          this.cargando.set(false);
          return;
        }

        this.cargarUsuario(id);
      },
    });
  }

  cargarUsuario(id: number): void {
    this.cargando.set(true);
    this.error.set('');
    this.usuario.set(null);

    this.usuarioService.getUsuarioById(id).subscribe({
      next: (res: UsuarioInterfaceResponse) => {
        this.usuario.set(res);
        this.cargando.set(false);
      },
      error: (err: any) => {
        this.error.set(err?.error?.message ?? 'No se pudo cargar la información del usuario.');
        this.cargando.set(false);

        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err?.error?.message ?? 'No se pudo cargar la información del usuario.',
          life: 3500,
        });
      },
    });
  }

  volverAlListado(): void {
    this.router.navigate(['/admin/usuarios']);
  }

  irAEditar(): void {
    const u = this.usuario();
    if (!u) return;
    this.router.navigate(['/admin/usuarios/editar-usuario', u.id_usuario]);
  }
}
