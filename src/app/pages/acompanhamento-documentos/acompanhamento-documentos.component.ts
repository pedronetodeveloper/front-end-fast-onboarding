import { Component, OnInit, inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { CommonModule, NgClass } from '@angular/common';
import { AuthService, AuthUser } from '../../core/services/auth.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
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
  uploadModalLoading: boolean = false;
  loadingElapsedSeconds: number = 0;
  loadingCurrentCarouselIndex: number = 0;
  loadingCarouselMessages: string[] = [
    'Validando documento... Aguarde.',
    'Analisando qualidade da imagem...',
    'Verificando restrições de envio...',
    'Quase lá! Finalizando validação.'
  ];
  private loadingTimer: any = null;
  private loadingCarouselTimer: any = null;
  user: AuthUser | null = null;
  documentos: any[] = [];
  uploadProgress: number = 0;
  uploadMessage: string = '';
  displayUploadModal: boolean = false; // Control modal visibility
  isLoading: boolean = true; // Loading state for skeleton
  showHelpWidget: boolean = false; // Control help widget visibility
  supportEmail: string = 'help-plataform@docflow.com.br'; // Support email

  private authService = inject(AuthService);
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
    // Registra referência global para o modal acessar
    (window as any).acompanhamentoDocumentosComponentRef = this;
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


  /**
   * Bloqueia o upload se:
   * - houver 5 documentos (aprovados ou bloqueados por tentativas)
   * - ou se já houver 5 documentos na lista e o arquivo selecionado não tiver nome igual a nenhum da lista
   * @param fileName (opcional) nome do arquivo a ser enviado
   */
  isUploadBlocked(fileName?: string): boolean {
    // Documentos aprovados
    const approved = this.documentos.filter(doc => doc.status === 'APROVADO').length;
    // Documentos bloqueados por tentativas
    const bloqueados = this.documentos.filter(doc => doc.tentativas === 3).length;
    const total = this.documentos.length;

    // Se já tem 5 documentos (aprovados ou bloqueados), bloqueia tudo
    if ((approved + bloqueados) >= 5) {
      return true;
    }

    // Se já tem 5 documentos na lista, só permite reenvio de nomes já existentes (case-insensitive, trim, extensão)
    if (total >= 5 && fileName) {
      const normalize = (s: string) => s?.trim().toLowerCase();
      const doc = this.documentos.find(
        doc => normalize(doc.nome_documento) === normalize(fileName)
      );
      if (!doc || doc.tentativas === 3) {
        return true;
      }
    }
    return false;
  }

  onAttachDocuments(): void {
    // Só abre o modal se não estiver bloqueado (sem arquivo selecionado ainda)
    if (!this.isUploadBlocked()) {
      this.displayUploadModal = true;
    }
  }

  onDocumentUploaded(event: { file: File, documentType: string }): void {
    // Fecha o modal de upload imediatamente
    this.displayUploadModal = false;
    // Bloqueia envio de PDF com nome diferente se já houver 5 documentos
    if (this.isUploadBlocked(event.file.name)) {
      const modalRef = (window as any).uploadDocumentModalRef;
      this.messageService.add({
        severity: 'error',
        summary: 'Limite de documentos atingido',
        detail: 'Você já atingiu o limite de 5 documentos. Só é possível reenviar arquivos já existentes.',
        life: 6000
      });
      if (modalRef && typeof modalRef.finishLoadingAndClose === 'function') {
        modalRef.finishLoadingAndClose();
      }
      this.stopLoadingModal();
      return;
    }

    // Validação: não permitir documento com tipo já existente mas nome diferente
    const normalize = (s: string) => s?.trim().toLowerCase();
    const docMesmoTipoNomeDiferente = this.documentos.find(doc =>
      normalize(doc.tipo_documento) === normalize(event.documentType) &&
      normalize(doc.nome_documento) !== normalize(event.file.name)
    );
    if (docMesmoTipoNomeDiferente) {
      const modalRef = (window as any).uploadDocumentModalRef;
      this.messageService.add({
        severity: 'error',
        summary: 'Tipo de documento já enviado',
        detail: `Já existe um documento do tipo "${event.documentType}" com outro nome. Para reenviar, utilize o mesmo nome do arquivo anterior.`,
        life: 6000
      });
      if (modalRef && typeof modalRef.finishLoadingAndClose === 'function') {
        modalRef.finishLoadingAndClose();
      }
      this.stopLoadingModal();
      return;
    }
    const { file, documentType } = event;
    // Busca referência do modal
    const modalRef = (window as any).uploadDocumentModalRef;

    // Validação: bloqueia se já existe documento com mesmo nome (case-insensitive, trim) e tentativas == 3
    const documentoBloqueado = this.documentos.find(doc => normalize(doc.nome_documento) === normalize(file.name) && doc.tentativas === 3);
    if (documentoBloqueado) {
      this.messageService.add({
        severity: 'error',
        summary: 'Limite de tentativas atingido',
        detail: `O documento "${file.name}" já atingiu o limite de 3 tentativas e não pode ser reenviado.`,
        life: 6000
      });
      if (modalRef && typeof modalRef.finishLoadingAndClose === 'function') {
        modalRef.finishLoadingAndClose();
      }
      this.stopLoadingModal();
      return;
    }
    // Só inicia o loading se passou por todas as validações
    this.startLoadingModal(file.name);
    // Validação de tipo de arquivo suportado
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg'];
    if (!allowedTypes.includes(file.type)) {
      this.messageService.add({
        severity: 'error',
        summary: 'Tipo de arquivo não suportado',
        detail: 'Envie apenas PDF, PNG ou JPEG.',
        life: 5000
      });
      // Fecha o loading do modal se possível
      if (modalRef && typeof modalRef.finishLoadingAndClose === 'function') {
        modalRef.finishLoadingAndClose();
      }
      this.stopLoadingModal();
      return;
    }

    // Validação de tamanho máximo (10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      this.messageService.add({
        severity: 'error',
        summary: 'Arquivo muito grande',
        detail: 'O arquivo deve ter no máximo 10MB.',
        life: 5000
      });
      if (modalRef && typeof modalRef.finishLoadingAndClose === 'function') {
        modalRef.finishLoadingAndClose();
      }
      this.stopLoadingModal();
      return;
    }

    if (file && documentType && this.user?.email) {
      this.uploadMessage = `Enviando ${file.name} (${documentType})...`;
      this.uploadProgress = 0;

      const reader = new FileReader();
      reader.onload = () => {
        let base64 = '';
        const result = reader.result as string;
        // Garante que é base64 puro
        if (result.startsWith('data:')) {
          base64 = result.substring(result.indexOf(',') + 1);
        } else {
          base64 = result;
        }
        // Validação extra: base64 só pode conter caracteres válidos
        const base64Regex = /^[A-Za-z0-9+/=]+$/;
        if (!base64Regex.test(base64)) {
          this.messageService.add({
            severity: 'error',
            summary: 'Arquivo inválido',
            detail: 'O arquivo não pôde ser convertido corretamente. Tente outro arquivo.',
            life: 5000
          });
          if (modalRef && typeof modalRef.finishLoadingAndClose === 'function') {
            modalRef.finishLoadingAndClose();
          }
          this.stopLoadingModal();
          return;
        }
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
          },
          error: (err) => {
            this.uploadMessage = `Falha ao enviar ${file.name}.`;
            console.error('Erro no envio:', err);
          },
          complete: () => {
            // Não fecha o loading aqui! O loading será fechado apenas após 15s pelo timer do modal.
            this.uploadProgress = 0;
            this.uploadMessage = '';
            // O loading será fechado pelo timer
          }
        });
      };
      reader.readAsDataURL(file);
    }
  }

  // Novo controle de loading integrado ao endpoint de status
  private statusPollingTimer: any = null;
  private statusPollingTimeout: any = null;
  private lastUploadedFileName: string | null = null;
  private lastUploadedStatus: string | null = null;

  startLoadingModal(fileName?: string): void {
    this.uploadModalLoading = true;
    this.loadingElapsedSeconds = 0;
    this.loadingCurrentCarouselIndex = 0;
    this.lastUploadedFileName = fileName || null;
    this.lastUploadedStatus = null;
    if (this.loadingTimer) clearInterval(this.loadingTimer);
    if (this.loadingCarouselTimer) clearInterval(this.loadingCarouselTimer);
    if (this.statusPollingTimer) clearInterval(this.statusPollingTimer);
    if (this.statusPollingTimeout) clearTimeout(this.statusPollingTimeout);

    // Timer visual do loading
    this.loadingTimer = setInterval(() => {
      this.loadingElapsedSeconds++;
    }, 1000);
    this.loadingCarouselTimer = setInterval(() => {
      this.loadingCurrentCarouselIndex = (this.loadingCurrentCarouselIndex + 1) % this.loadingCarouselMessages.length;
    }, 4000);

    // Inicia polling do status se houver nome do arquivo
    if (fileName) {
      let statusResolved = false;
      this.statusPollingTimer = setInterval(() => {
        this.documentosService.consultarStatusDocumento(fileName).subscribe({
          next: (response) => {
            const status = response.status;
            this.lastUploadedStatus = status;
            if (status === 'APROVADO' || status === 'REPROVADO') {
              statusResolved = true;
              this.stopLoadingModal();
              this.listarDocumentosApi();
              if (status === 'REPROVADO') {
                this.messageService.add({
                  severity: 'error',
                  summary: 'Documento reprovado',
                  detail: `O documento "${fileName}" foi reprovado após análise.`,
                  life: 10000
                });
              }
            }
          },
          error: (err) => {
            // Se não encontrar, ignora e continua polling
          }
        });
      }, 3000); // Consulta a cada 3 segundos

      // Timeout de 18 segundos para encerrar polling se não houver resposta
      this.statusPollingTimeout = setTimeout(() => {
        if (!statusResolved) {
          this.stopLoadingModal();
          this.messageService.add({
            severity: 'error',
            summary: 'Envio não concluído',
            detail: `O envio do arquivo "${fileName}" não foi concluído. Tente reenviar o documento.`,
            life: 7000
          });
        }
      }, 30000);
    }
  }

  stopLoadingModal(): void {
    this.uploadModalLoading = false;
    this.loadingElapsedSeconds = 0;
    this.loadingCurrentCarouselIndex = 0;
    if (this.loadingTimer) clearInterval(this.loadingTimer);
    if (this.loadingCarouselTimer) clearInterval(this.loadingCarouselTimer);
    if (this.statusPollingTimer) clearInterval(this.statusPollingTimer);
    if (this.statusPollingTimeout) clearTimeout(this.statusPollingTimeout);
    this.loadingTimer = null;
    this.loadingCarouselTimer = null;
    this.statusPollingTimer = null;
    this.statusPollingTimeout = null;
    this.lastUploadedFileName = null;
    this.lastUploadedStatus = null;
  }

  // Adiciona referência global ao modal para controle do loading
  ngAfterViewInit(): void {
    const modal = document.querySelector('app-upload-document-modal');
    if (modal && (modal as any).componentInstance) {
      (window as any).uploadDocumentModalRef = (modal as any).componentInstance;
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
