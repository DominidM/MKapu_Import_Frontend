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

 constructor(private themeService: ThemeService, private messageService: MessageService, private router: Router) {}

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  prueba(): void{
    if(this.usuario == "admin" && this.password == "admin"){
      this.messageService.add({ 
        severity: 'success', 
        summary: 'Login Correcto', 
        detail: 'Bienvenido al sistema' 
      });
      setTimeout(() => {
      this.router.navigate(['/inicio']);  // Cambia '/home' por la ruta de tu página principal
      }, 1000);

    }else{
      this.messageService.add({ 
        severity: 'error', 
        summary: 'Credenciales incorrectas', 
        detail: 'Ingrese sus credenciales correctamente por favor' 
      });
    }
  }

}
