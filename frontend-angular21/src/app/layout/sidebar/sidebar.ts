import { Component, OnInit } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Router, RouterModule } from '@angular/router';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { Auth } from '../../auth/services/auth.service';


@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [
      CommonModule,          // ✅ REQUIRED for ngClass, ngIf, ngFor
      ButtonModule,
      AvatarModule,
      DrawerModule,
      BadgeModule,
      RouterModule,
      ToastModule,
      ConfirmDialog
    ],
    templateUrl: './sidebar.html',
    styleUrl: './sidebar.css',
    providers: [ConfirmationService, MessageService]
  })
export class Sidebar implements OnInit {

  visible = true;

  // controla qué menú está abierto (solo uno)
  activeMenu: string | null = null;
  role: string | null = null;


  constructor(
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private router: Router,
    private authService: AuthService,
    private auth: Auth
  ) {}

  ngOnInit(): void {
    this.role = this.auth.getRole();
  }

  toggleMenu(menu: string) {
    this.activeMenu = this.activeMenu === menu ? null : menu;
  }

  getRole(){

  }

  confirm2(event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: '¿Estás seguro de que deseas cerrar sesión?',
      header: 'Alerta',
      icon: 'pi pi-info-circle',
      rejectLabel: 'Cancelar',
      acceptLabel: 'Aceptar',
      acceptButtonProps: {
        severity: 'danger'
      },
      rejectButtonProps: {
        severity: 'secondary',
        outlined: true
      },
      accept: () => {
        this.auth.logout();

        this.messageService.add({
          severity: 'success',
          summary: 'Confirmación',
          detail: 'Cierre de sesión exitoso'
        });

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1000);
      },
      reject: () => {
        this.messageService.add({
          severity: 'info',
          summary: 'Cancelado',
          detail: 'Cierre de sesión cancelado'
        });
      }
    });
  }
}
