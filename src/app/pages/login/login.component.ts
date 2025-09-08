import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { AuthService } from '../../core/services/auth.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { pageEnterAnimation } from '../../shared/animations';
import { PasswordModule } from 'primeng/password';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    DividerModule,
    MessageModule,
    ProgressSpinnerModule,
    PasswordModule,
    TranslatePipe,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  animations: [pageEnterAnimation]
})
export class LoginComponent implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);

  email = '';
  senha = '';
  isLoggingIn = false;
  errorMessage = '';

  ngOnInit(): void {}

  login(): void {
    if (!this.email || !this.senha) {
      this.errorMessage = 'Preencha email e senha.';
      setTimeout(() => { this.errorMessage = ''; }, 2000);
      return;
    }
    this.isLoggingIn = true;
    this.errorMessage = '';
    this.authService.login(this.email, this.senha).subscribe({
      next: (user) => {
        // Redireciona conforme o papel
        if (user.role === 'admin') {
          this.router.navigate(['/controle-acessos']);
        } else if (user.role === 'rh') {
          this.router.navigate(['/candidatos']);
        } else if (user.role === 'candidato') {
          this.router.navigate(['/acompanhamento-documentos']);
        } else {
          this.router.navigate(['/']);
        }
        this.isLoggingIn = false;
      },
      error: (err) => {
        this.errorMessage = 'Usuário ou senha inválidos.';
        setTimeout(() => { this.errorMessage = ''; }, 2000);
        this.isLoggingIn = false;
      }
    });
  }
}