import { Component, OnInit, inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { CommonModule, NgClass } from '@angular/common';
import { AuthService, AuthUser } from '../../core/services/auth.service';
import { LocalStorageService } from '../../core/services/local-storage.service';
import { Usuario } from '../../shared/interface/usuario.interface';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { HttpEventType } from '@angular/common/http';
import { DocumentService } from '../../core/services/document.service';
import { DocumentosService } from '../../core/services/api/documentos.service';
import { UploadDocumentModalComponent } from './upload-document-modal/upload-document-modal.component'; // Import the new modal component
import { ToastModule } from 'primeng/toast';
// PrimeNG Modules for the modal
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-acompanhamento-documentos',
  templateUrl: './acompanhamento-documentos.component.html',
  styleUrls: ['./acompanhamento-documentos.component.scss'],
  standalone: true,
  imports: [CommonModule, ToastModule, TranslatePipe, NgClass, UploadDocumentModalComponent, DialogModule, ButtonModule, DropdownModule, FormsModule],
  providers: [MessageService],
  animations: [
    trigger('slideInOut', [
      state('in', style({ transform: 'translateX(0)', opacity: 1 })),
      transition('void => *', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate('300ms ease-in-out')
      ]),
      transition('* => void', [
        animate('300ms ease-in-out', style({ transform: 'translateX(100%)', opacity: 0 }))
      ])
    ])
  ]
})
export class AcompanhamentoDocumentosComponent implements OnInit {
  user: AuthUser | null = null;
  documentos: any[] = [];
  uploadProgress: number = 0;
  uploadMessage: string = '';
  displayUploadModal: boolean = false; // Control modal visibility
  isLoading: boolean = true; // Loading state for skeleton
  showHelpWidget: boolean = false; // Control help widget visibility
  supportEmail: string = 'help-plataform@docflow.com.br'; // Support email

  private authService = inject(AuthService);
  private localStorageService = inject(LocalStorageService);
  private documentService = inject(DocumentService);
  private documentosService = inject(DocumentosService);
  private messageService = inject(MessageService);

  get isCurrentUserHR(): boolean {
    return this.authService.getRole() === 'rh';
  }

  ngOnInit(): void {
    this.user = this.authService.getUser();
    // Adiciona um pequeno delay para mostrar o skeleton
    setTimeout(() => {
      this.listarDocumentosApi();
    }, 500);
  }

  listarDocumentosApi(): void {
    this.isLoading = true; // Start loading
    const user = this.authService.getUser();
    const email = user?.email;
    if (!email) {
      console.error('Email do usuário não encontrado.');
      this.isLoading = false;
      return;
    }
    this.documentosService.listarDocumentos(email).subscribe({
      next: (docs) => {
        this.documentos = docs;
        console.log(this.documentos);
        this.isLoading = false; // Stop loading
      },
      error: (err) => {
        console.error('Erro ao listar documentos:', err);
        this.isLoading = false; // Stop loading even on error
      }
    });
  }

  // Removido atualizarDocumentos pois agora os documentos vêm da API

  getStatusCount(status: 'APROVADO' | 'REPROVADO' | 'analisando'): number {
    return this.documentos.filter(doc => doc.status === status).length;
  }

  isUploadBlocked(): boolean {
    // Bloqueia o upload se houver 5 ou mais documentos com status APROVADO ou analisando
    const approvedOrAnalyzing = this.documentos.filter(doc => 
      doc.status === 'APROVADO' || doc.status === 'analisando'
    ).length;
    
    return approvedOrAnalyzing >= 5;
  }

  onAttachDocuments(): void {
    // Só abre o modal se não estiver bloqueado
    if (!this.isUploadBlocked()) {
      this.displayUploadModal = true;
    }
  }

  onDocumentUploaded(event: { file: File, documentType: string }): void {
    const { file, documentType } = event;

    if (file && documentType && this.user?.email) {
      this.uploadMessage = `Enviando ${file.name} (${documentType})...`;
      this.uploadProgress = 0;

      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        const documentoPayload = {
          filename: file.name,
          document_type: documentType,
          email: this.user!.email,
          file_content: base64
        };
        this.documentosService.cadastrarDocumento(documentoPayload).subscribe({
          next: (response) => {
            this.uploadMessage = `Upload de ${file.name} realizado com sucesso!`;
            this.messageService.add({
              severity: 'success',
              summary: 'Upload realizado',
              detail: `O documento ${file.name} foi enviado com sucesso!`,
              life: 3500
            });
            // Recarrega os dados com um pequeno delay para mostrar o loading
            setTimeout(() => {
              this.listarDocumentosApi();
            }, 2000);
          },
          error: (err) => {
            this.uploadMessage = `Falha ao enviar ${file.name}.`;
            console.error('Erro no envio:', err);
          },
          complete: () => {
            setTimeout(() => {
              this.uploadProgress = 0;
              this.uploadMessage = '';
            }, 3000);
          }
        });
      };
      reader.readAsDataURL(file);
    }
  }

  toggleHelpWidget(): void {
    this.showHelpWidget = !this.showHelpWidget;
  }

  copyEmailToClipboard(): void {
    navigator.clipboard.writeText(this.supportEmail).then(() => {
      this.messageService.add({
        severity: 'success',
        summary: 'Email copiado',
        detail: 'O email de suporte foi copiado para a área de transferência!',
        life: 3000
      });
    }).catch(() => {
      this.messageService.add({
        severity: 'warn',
        summary: 'Aviso',
        detail: 'Não foi possível copiar automaticamente. Email: ' + this.supportEmail,
        life: 5000
      });
    });
  }
}
