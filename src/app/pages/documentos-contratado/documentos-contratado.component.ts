import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-documentos-contratado',
  imports: [ButtonModule, DialogModule, ToastModule],
  providers: [MessageService],
  templateUrl: './documentos-contratado.component.html',
  styleUrl: './documentos-contratado.component.scss'
})
export class DocumentosContratadoComponent {
  statusDialog = false;

  constructor(private messageService: MessageService) {}

  abrirDialog() {
    this.statusDialog = true;
    this.messageService.add({severity:'info', summary:'Status', detail:'Todos os documentos obrigatórios foram enviados!'});
  }
}
