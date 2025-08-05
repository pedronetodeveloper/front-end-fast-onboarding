import { Component, inject } from '@angular/core';
import { LocalStorageService } from '../../core/services/local-storage.service';
import { Usuario } from '../../shared/interface/usuario.interface';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-upload-documentos',
  imports: [DialogModule, ButtonModule, ToastModule, CardModule, TranslatePipe],
  providers: [MessageService],
  templateUrl: './upload-documentos.component.html',
  styleUrl: './upload-documentos.component.scss'
})
export class UploadDocumentosComponent {
  displayDialog = false;
  arquivos: Record<string, string> = {};
  loading = false;
  private messageService = inject(MessageService);
  private localStorageService = inject(LocalStorageService);
  usuarioLogado: Usuario | null = null;

  constructor() {
    // Busca o usuário logado a partir do objeto salvo em 'user' no localStorage
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (user && user.email) {
      const candidatos = this.localStorageService.getItem<Usuario>('candidatos');
      this.usuarioLogado = candidatos.find(u => u.email === user.email) || null;
    }
  }

  abrirDialog() {
    this.displayDialog = true;
  }

  onFileChange(event: any, tipo: string) {
    const file = event.target.files[0];
    if (file && file.name.endsWith('.pdf')) {
      this.arquivos[tipo] = file.name;
    } else {
      delete this.arquivos[tipo];
    }
  }

  enviar(event?: Event) {
    if (event) event.preventDefault();
    this.loading = true;
    setTimeout(() => {
      if (!this.usuarioLogado) {
        this.messageService.add({severity:'error', summary:'Erro', detail:'Usuário não identificado!'});
        this.loading = false;
        return;
      }
      // Permite enviar mesmo que nem todos os documentos estejam presentes
      const obrigatorios = ['rg', 'cpf', 'titulo', 'ctps', 'comprovante'];
      // Só inclui os documentos realmente enviados
      const documentos = obrigatorios.filter(tipo => this.arquivos[tipo]).map(tipo => ({
        nome: this.arquivos[tipo],
        tipo,
        status: (tipo === 'rg' || tipo === 'cpf') ? 'valido' : (tipo === 'titulo' ? 'invalido' : 'pendente') as 'valido' | 'invalido' | 'pendente'
      }));
      // Atualiza candidato no localStorage, garantindo que o campo id seja igual ao email
      const candidatos = this.localStorageService.getItem<Usuario>('candidatos');
      const idx = candidatos.findIndex(u => u.email === this.usuarioLogado!.email);
      if (idx > -1) {
        candidatos[idx] = {
          ...candidatos[idx],
          id: candidatos[idx].email, // garante id igual ao email
          documentos: documentos
        };
        this.localStorageService.setItem('candidatos', candidatos);
        // Atualiza também o user logado no localStorage (para refletir documentos no acompanhamento)
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user && user.email === candidatos[idx].email) {
          localStorage.setItem('user', JSON.stringify({ ...user, documentos: documentos }));
        }
        this.messageService.add({severity:'success', summary:'Sucesso', detail:'Documentos enviados com sucesso!'});
        this.displayDialog = false;
        this.arquivos = {};
        // Força atualização do acompanhamento de documentos se existir
        const win = window as any;
        if (win && win.ng && win.ng.getComponent) {
          const root = document.querySelector('app-acompanhamento-documentos');
          if (root) {
            const comp = win.ng.getComponent(root);
            if (comp && typeof comp.atualizarDocumentos === 'function') {
              comp.atualizarDocumentos();
            }
          }
        }
      } else {
        this.messageService.add({severity:'error', summary:'Erro', detail:'Usuário não encontrado!'});
      }
      this.loading = false;
    }, 1200);
  }
}
