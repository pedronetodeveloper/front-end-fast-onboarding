import { Component } from '@angular/core';
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
  arquivos: any = {};
  loading = false;

  constructor(private messageService: MessageService) {}

  abrirDialog() {
    this.displayDialog = true;
  }

  onFileChange(event: any, tipo: string) {
    this.arquivos[tipo] = event.target.files[0];
  }

  enviar() {
    this.loading = true;
    setTimeout(() => {
      if (Object.keys(this.arquivos).length === 5) {
        this.messageService.add({severity:'success', summary:'Sucesso', detail:'Documentos enviados com sucesso!'});
        this.displayDialog = false;
        this.arquivos = {};
      } else {
        this.messageService.add({severity:'error', summary:'Erro', detail:'Envie todos os documentos!'});
      }
      this.loading = false;
    }, 1200);
  }
}
