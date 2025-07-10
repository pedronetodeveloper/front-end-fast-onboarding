import { Component } from '@angular/core';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';

@Component({
  selector: 'app-lista-acessos',
  imports: [TableModule, ButtonModule, DialogModule, ToastModule],
  providers: [MessageService],
  templateUrl: './lista-acessos.component.html',
  styleUrl: './lista-acessos.component.scss'
})
export class ListaAcessosComponent {
  acessos = [
    { nome: 'João Silva', email: 'joao@email.com', id: 1 },
    { nome: 'Maria Souza', email: 'maria@email.com', id: 2 }
  ];
  acessoDialog = false;
  acessoSelecionado: any = null;

  constructor(private router: Router, private messageService: MessageService) {}

  verDocumentos(acesso: any) {
    this.router.navigate(['/documentos-contratado', acesso.id]);
    this.messageService.add({severity:'info', summary:'Ação', detail:'Abrindo documentos de ' + acesso.nome});
  }

  abrirDialog(acesso: any) {
    this.acessoSelecionado = acesso;
    this.acessoDialog = true;
    this.messageService.add({severity:'info', summary:'Acesso', detail:'Acesso selecionado: ' + acesso.nome});
  }
}
