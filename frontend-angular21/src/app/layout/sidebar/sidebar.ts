import { Component, OnInit } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';
import { MenuModule } from 'primeng/menu';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { Router, RouterModule } from '@angular/router';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-sidebar',
  imports: [ButtonModule, AvatarModule, DrawerModule, BadgeModule, MenuModule, RouterModule, ToastModule, ConfirmDialog ],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
  providers: [ConfirmationService, MessageService]
})
export class Sidebar implements OnInit{

   constructor(private confirmationService: ConfirmationService, private messageService: MessageService, private router: Router) {}


  visible = true;

  showReports = false;
  showFavorites = true; // si quieres que favorites esté abierto por defecto
  showApplication = false;

    items: MenuItem[] | undefined;

    ngOnInit() {
    }


    confirm2(event: Event) {
        this.confirmationService.confirm({
            target: event.target as EventTarget,
            message: 'Estas seguro de que deseas cerrar sesion?',
            header: 'Alerta',
            icon: 'pi pi-info-circle',
            rejectLabel: 'Cancelar',
            rejectButtonProps: {
                label: 'Cancelar',
                severity: 'secondary',
                outlined: true,
            },
            acceptButtonProps: {
                label: 'Aceptar',
                severity: 'danger',
            },

            accept: () => {
                this.messageService.add({ severity: 'success', summary: 'Confirmacion', detail: 'Cierre de sesion exitoso' });
                 setTimeout(() => {
                this.router.navigate(['/login']);  // Cambia '/home' por la ruta de tu página principal
                }, 1000);
            },
            reject: () => {
                this.messageService.add({ severity: 'error', summary: 'Cancelando', detail: 'Cancelando cierre de sesion' });
            },
        });
    }

}
