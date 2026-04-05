import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { Divider } from 'primeng/divider';
import { MessageService } from 'primeng/api';
import { UsuarioService } from '../../../../services/usuario.service';

@Component({
  selector: 'app-administracion-password',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    MessageModule,
    ToastModule,
    Divider,
  ],
  providers: [MessageService],
  templateUrl: './administracion-password.html',
  styleUrls: ['./administracion-password.css'],
})
export class AdministracionPassword implements OnInit {
  usuarioId = 0;

  cargando = false;
  guardando = false;
  error = '';

  nombreCompleto = '';
  usernameActual = '';

  nomUsu = '';
  password = '';
  confirmPassword = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private usuarioService: UsuarioService,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe({
      next: (params) => {
        this.usuarioId = Number(params.get('id') || 0);

        if (!this.usuarioId) {
          this.error = 'No se encontró el identificador del usuario.';
          return;
        }

        this.cargarDatos();
      },
    });
  }

  cargarDatos(): void {
    this.ngZone.run(() => {
      this.cargando = true;
      this.error = '';
      this.cdr.markForCheck();
    });

    const usuario$ = this.usuarioService.getUsuarioById(this.usuarioId);
    const cuenta$ = this.usuarioService.getAccountByUserId(this.usuarioId);

    forkJoin({ usuario: usuario$, cuenta: cuenta$ }).subscribe({
      next: ({ usuario, cuenta }) => {
        this.ngZone.run(() => {
          this.nombreCompleto =
            `${usuario.usu_nom || ''} ${usuario.ape_pat || ''} ${usuario.ape_mat || ''}`.trim();

          this.usernameActual = cuenta?.nom_usu || '';
          this.nomUsu = cuenta?.nom_usu || '';

          this.cargando = false;
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        this.ngZone.run(() => {
          this.cargando = false;
          this.error = 'No se pudo cargar la información del usuario.';

          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: err?.error?.message ?? 'No se pudo cargar la información del usuario.',
            life: 3500,
          });

          this.cdr.detectChanges();
        });
      },
    });
  }

  get passwordsNoCoinciden(): boolean {
    return !!this.password && !!this.confirmPassword && this.password !== this.confirmPassword;
  }

  guardar(): void {
    const nom_usu = this.nomUsu.trim();
    const nueva_contraseña = this.password.trim();
    const confirmar = this.confirmPassword.trim();

    if (!nom_usu && !nueva_contraseña) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atención',
        detail: 'Debes ingresar al menos el nombre de usuario o una nueva contraseña.',
        life: 3500,
      });
      return;
    }

    if (nueva_contraseña && nueva_contraseña !== confirmar) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Las contraseñas no coinciden.',
        life: 3500,
      });
      return;
    }

    const body: { nom_usu?: string; nueva_contraseña?: string } = {};
    if (nom_usu) body.nom_usu = nom_usu;
    if (nueva_contraseña) body.nueva_contraseña = nueva_contraseña;

    this.ngZone.run(() => {
      this.guardando = true;
      this.cdr.markForCheck();
    });

    this.usuarioService.changeCredentials(this.usuarioId, body).subscribe({
      next: () => {
        this.ngZone.run(() => {
          this.guardando = false;
          this.usernameActual = nom_usu || this.usernameActual;
          this.password = '';
          this.confirmPassword = '';

          this.messageService.add({
            severity: 'success',
            summary: 'Credenciales actualizadas',
            detail: 'Las credenciales se guardaron correctamente.',
            life: 3000,
          });

          this.cdr.detectChanges();
        });
      },
      error: (err: any) => {
        this.ngZone.run(() => {
          this.guardando = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: err?.error?.message ?? 'No se pudieron actualizar las credenciales.',
            life: 4000,
          });

          this.cdr.detectChanges();
        });
      },
    });
  }

  volver(): void {
    this.router.navigate(['/admin/usuarios']);
  }

  limpiarPasswords(): void {
    this.password = '';
    this.confirmPassword = '';
  }
}