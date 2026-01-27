import { Component, inject } from '@angular/core';
import { ThemeService } from '../../../core/services/theme.service';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IftaLabelModule } from 'primeng/iftalabel';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { Auth } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CardModule, ButtonModule,PasswordModule, FormsModule, IftaLabelModule, InputTextModule, ToastModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
  providers: [MessageService]
})
export class Login {

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private auth = inject(Auth)

  loginForm: FormGroup = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]]
  });

 constructor(private themeService: ThemeService, private messageService: MessageService) {}

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }


  onSubmit(): void{
    if(this.loginForm.valid){
      console.log("este es el form: ", this.loginForm.value)
      this.auth.loginUser(this.loginForm.value).subscribe({
        next: (data) => {
          console.log('Login exitoso:', data);
          this.router.navigate(['/admin/dashboard']);
        },
        error: (err) => {
          console.error('Error al logearse:', err);
          alert('Credenciales incorrectas');
        }
      })
    }
  }

}
