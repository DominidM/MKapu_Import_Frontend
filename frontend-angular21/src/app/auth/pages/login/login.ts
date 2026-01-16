import { Component } from '@angular/core';
import { ThemeService } from '../../../core/services/theme.service';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { FormsModule } from '@angular/forms';
import { IftaLabelModule } from 'primeng/iftalabel';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CardModule, ButtonModule,PasswordModule, FormsModule, IftaLabelModule, InputTextModule, ToastModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
  providers: [MessageService]
})
export class Login {

  password: string = "";
  usuario: string = "";

 constructor(private themeService: ThemeService, private messageService: MessageService, private router: Router, private authService: AuthService) {}

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  prueba(): void{

    const success = this.authService.login(this.usuario, this.password);

    if(success)
    {
      const role = this.authService.getRole();

      this.messageService.add({
        severity: 'success',
        summary: 'Login Correcto',
        detail: 'Bienvenido al sistema'
      });

      setTimeout(() => {
        if (role === 'admin') this.router.navigate(['/admin/dashboard']);
        if (role === 'almacen') this.router.navigate(['/almacen/dashboard']);
        if (role === 'ventas') this.router.navigate(['/ventas/dashboard']);
      }, 1000);
    }
    else
    {
      this.messageService.add({
        severity: 'error',
        summary: 'Login Incorrecto',
        detail: 'Usuario o contraseña incorrecta'
      });
    }
  }
}
