import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-gerador-acesso',
  imports: [FormsModule, ButtonModule, InputTextModule, DialogModule, ToastModule],
  providers: [MessageService],
  templateUrl: './gerador-acesso.component.html',
  styleUrl: './gerador-acesso.component.scss'
})
export class GeradorAcessoComponent {
  nome = '';
  email = '';
  sucessoDialog = false;

  constructor(private messageService: MessageService) {}

  gerarAcesso() {
    if (this.nome && this.email) {
      this.sucessoDialog = true;
      this.messageService.add({severity:'success', summary:'Acesso gerado', detail:'Novo acesso criado!'});
      this.nome = '';
      this.email = '';
    } else {
      this.messageService.add({severity:'error', summary:'Erro', detail:'Preencha todos os campos!'});
    }
  }
}
