
import { Component,inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MessageModule } from 'primeng/message';
import { ButtonModule } from 'primeng/button';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { UsuarioService } from '../../core/services/api/usuario.service';

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
  private usuarioService = inject(UsuarioService);
  senha: string = '';
  confirmarSenha: string = '';
  isSaving: boolean = false;
  errorMessage: string = '';
  token: string = '';
  ur: string = '';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'] || '';
      this.ur = params['ur'] || '';
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
    if (!this.ur) {
      this.errorMessage = 'Ur inválido ou ausente.';
      return;
    }
    const sendPassData = {
    token: this.token,
    senha: this.senha,
    ur: this.ur
    };
    
    this.isSaving = true;
    this.usuarioService.criarSenha(sendPassData).subscribe({
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
