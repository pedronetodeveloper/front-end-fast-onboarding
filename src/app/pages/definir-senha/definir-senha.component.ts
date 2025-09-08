
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MessageModule } from 'primeng/message';
import { ButtonModule } from 'primeng/button';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-definir-senha',
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    RouterModule,
    MessageModule,
    ButtonModule,
    TranslatePipe
  ],
  templateUrl: './definir-senha.component.html',
  styleUrl: './definir-senha.component.scss'
})
export class DefinirSenhaComponent {
  senha: string = '';
  confirmarSenha: string = '';
  isSaving: boolean = false;
  errorMessage: string = '';
  token: string = '';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'] || '';
    });
  }

  definirSenha() {
    this.errorMessage = '';
    if (!this.senha || !this.confirmarSenha) {
      this.errorMessage = 'Preencha todos os campos.';
      return;
    }
    if (this.senha !== this.confirmarSenha) {
      this.errorMessage = 'As senhas não coincidem.';
      return;
    }
    if (!this.token) {
      this.errorMessage = 'Token inválido ou ausente.';
      return;
    }
    this.isSaving = true;
    // Ajuste a URL da API conforme necessário
    this.http.post('/api/definir-senha', {
      token: this.token,
      senha: this.senha
    }).subscribe({
      next: () => {
        this.isSaving = false;
        // Redireciona para login ou mostra mensagem de sucesso
        this.router.navigate(['/login'], { queryParams: { senhaDefinida: true } });
      },
      error: (err) => {
        this.isSaving = false;
        this.errorMessage = err?.error?.message || 'Erro ao definir senha.';
      }
    });
  }
}
