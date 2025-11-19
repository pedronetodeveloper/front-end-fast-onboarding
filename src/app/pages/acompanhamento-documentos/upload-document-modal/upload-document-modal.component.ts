  
import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

interface DocumentType {
  name: string;
  code: string;
}

@Component({
  selector: 'app-upload-document-modal',
  standalone: true,
  imports: [CommonModule, DialogModule, ButtonModule, DropdownModule, FormsModule, TranslatePipe],
  templateUrl: './upload-document-modal.component.html',
  styleUrls: ['./upload-document-modal.component.scss']
})
export class UploadDocumentModalComponent implements OnInit {
  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() documentUploaded = new EventEmitter<{ file: File, documentType: string }>();
  @Input() isUploadBlockedFn?: (fileName?: string) => boolean;
  
  selectedFile: File | null = null;
  selectedDocumentType: DocumentType | null = null;
  documentTypes: DocumentType[] = [];
    isLoading: boolean = false;
    elapsedSeconds: number = 0;
    private timer: any;
    carouselMessages: string[] = [
      'Processando seu documento... Por favor, aguarde.',
      'Estamos validando a qualidade do arquivo.',
      'Verificando se o documento está legível.',
      'Quase lá!.',
      'Finalizando a validação...',
      'Obrigado pela sua paciência.'
    ];
    currentCarouselIndex: number = 0;

  ngOnInit(): void {
    this.documentTypes = [
      { name: 'RG', code: 'RG' },
      { name: 'CPF', code: 'CPF' },
      { name: 'Comprovante de Residência', code: 'Comprovante de Residencia' },
      { name: 'Titulo de Eleitor', code: 'Titulo de eleitor' },
      { name: 'Carteira de Trabalho', code: 'Carteira de trabalho' }
    ];
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
  }

  onUpload(): void {
    if (this.selectedFile && this.selectedDocumentType) {
      this.isLoading = true;
      this.elapsedSeconds = 0;
      this.currentCarouselIndex = 0;
      this.startTimer();
      // Emite o evento para o componente pai, que irá processar o upload e fechar o modal após o retorno
      this.documentUploaded.emit({
        file: this.selectedFile,
        documentType: this.selectedDocumentType.code
      });
      // O modal só será fechado pelo pai após o upload
    } else {
      alert('Por favor, selecione um arquivo e o tipo de documento.');
    }
  }

  // Método para ser chamado pelo pai quando o upload terminar
  finishLoadingAndClose(): void {
    this.isLoading = false;
    this.stopTimer();
    this.hideDialog();
  }

  startTimer(): void {
    this.stopTimer();
    this.timer = setInterval(() => {
      this.elapsedSeconds++;
      // Troca mensagem a cada 3 segundos
      this.currentCarouselIndex = Math.floor(this.elapsedSeconds / 3) % this.carouselMessages.length;
      if (this.elapsedSeconds === 18) {
        this.handleTimeout();
      }
    }, 1000);
  }

  // Chama o refresh externo e fecha o modal ao atingir 9 segundos
  handleTimeout(): void {
    // Busca componente pai (AcompanhamentoDocumentosComponent) e chama listarDocumentosApi
    if ((window as any).acompanhamentoDocumentosComponentRef && typeof (window as any).acompanhamentoDocumentosComponentRef.listarDocumentosApi === 'function') {
      (window as any).acompanhamentoDocumentosComponentRef.listarDocumentosApi();
    }
    this.finishLoadingAndClose();
  }

  stopTimer(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  hideDialog(): void {
    this.visible = false;
    this.visibleChange.emit(this.visible);
    this.resetForm();
    this.isLoading = false;
    this.stopTimer();
    this.elapsedSeconds = 0;
    this.currentCarouselIndex = 0;
  }

  resetForm(): void {
    this.selectedFile = null;
    this.selectedDocumentType = null;
    // Reset file input se necessário
  }
}
