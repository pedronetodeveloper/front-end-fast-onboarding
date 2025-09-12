import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG imports
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';

// Services
import { ConfirmationService, MessageService } from 'primeng/api';
import { LocalStorageService } from '../../core/services/local-storage.service';
import { AuthService } from '../../core/services/auth.service';
import { CandidatoService } from '../../core/services/api/candidato.service';
import { DocumentosService, Documento } from '../../core/services/api/documentos.service';

// Interface para documentos vindos da API (estrutura real)
interface DocumentoComUI {
  id?: number | string;
  nome_documento: string;
  tipo_documento: string;
  status: string;
  downloading?: boolean;
}

// Pipes
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

// Animations
import { pageEnterAnimation } from '../../shared/animations';

// Icon field
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

export interface CandidatoApi {
  id?: number | undefined;
  nome: string;
  email: string;
  situacao: string;
  estado: string;
  cpf?: string;
  vaga: string;
  telefone?: string | null;
  sexo: string;
  empresa?: string;
}

@Component({
  selector: 'app-usuario',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    DropdownModule,
    ConfirmDialogModule,
    ToastModule,
    ToolbarModule,
    CardModule,
    TagModule,
    SkeletonModule,
    TranslatePipe,
    IconFieldModule,
    InputIconModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './candidatos.component.html',
  styleUrl: './candidatos.component.scss',
  animations: [pageEnterAnimation]
})

export class CandidatosComponent implements OnInit {
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  private candidatoService = inject(CandidatoService);
  private documentosService = inject(DocumentosService);
  private authService = inject(AuthService);

  // Data
  candidatos: CandidatoApi[] = [];
  filteredCandidatos: CandidatoApi[] = [];
  selectedCandidato: CandidatoApi | null = null;
  showDocumentosDialog = false;
  candidatoSelecionado: CandidatoApi | null = null;
  documentosSelecionados: DocumentoComUI[] = [];
  loading = false;

  // Search and filter
  searchTerm = '';
  sortField = '';
  sortOrder = 1;

  // Dialog states
  displayDialog = false;
  displayDialogInfo = false;
  isEditing = false;

  // Form data
  candidatoForm: CandidatoApi = {
    nome: '',
    email: '',
    situacao: '',
    estado: '',
    vaga: '',
    telefone: '',
    sexo: '',
    empresa: ''
  };

  ngOnInit(): void {
    this.carregarCandidatos();
  }

  abrirModal():void{
    this.displayDialogInfo = true;
  }

  /**
   * Carregar lista de candidatos
   */
  carregarCandidatos(): void {
    this.loading = true;
    this.candidatoService.listarCandidatos().subscribe({
      next: (candidatos) => {
        this.candidatos = candidatos;
        this.filteredCandidatos = [...candidatos];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar candidatos.' });
      }
    });
  }

  /**
   * Abrir dialog para criar novo candidato
   */
  novoCandidato(): void {
    this.candidatoForm = {
      nome: '',
      email: '',
      situacao: '',
      estado: '',
      vaga: '',
      telefone: '',
      sexo: '',
      empresa: ''
    };
    this.isEditing = false;
    this.abrirDialogCandidato();
  }

  /**
   * Abrir dialog para editar candidato
   */
  editarCandidato(candidato: CandidatoApi): void {
    this.candidatoForm = {
      nome: candidato.nome || '',
      email: candidato.email || '',
      situacao: candidato.situacao || '',
      estado: candidato.estado || '',
      vaga: candidato.vaga || '',
      telefone: candidato.telefone || '',
      sexo: candidato.sexo || '',
      empresa: candidato.empresa || ''
    };
    this.selectedCandidato = candidato;
    this.isEditing = true;
    this.abrirDialogCandidato();
  }

  abrirDialogCandidato(): void {
    this.displayDialog = true;
  }

  /**
   * Salvar candidato (criar ou atualizar)
   */
  salvarCandidato(): void {
    if (!this.candidatoForm.nome || !this.candidatoForm.email) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Nome e email são obrigatórios'
      });
      return;
    }
    this.loading = true;
    if (this.isEditing && this.selectedCandidato) {
      // Atualizar candidato via service
      const candidatoAtualizado = {
        ...this.selectedCandidato,
        ...this.candidatoForm,
        id: this.selectedCandidato.id
      } as CandidatoApi & { id: number };
      this.candidatoService.editarCandidato(candidatoAtualizado).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Candidato atualizado com sucesso' });
          this.fecharDialog();
          this.carregarCandidatos();
          this.loading = false;
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao atualizar candidato.' });
          this.loading = false;
        }
      });
    } else {
      // Criar novo candidato via service
      const empresa = this.authService.getEmpresa();
      const novoCandidato = {
        ...this.candidatoForm,
        empresa: empresa || ''
      };
      this.candidatoService.salvarCandidato(novoCandidato).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Candidato criado com sucesso' });
          this.fecharDialog();
          this.carregarCandidatos();
          this.loading = false;
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao criar candidato.' });
          this.loading = false;
        }
      });
    }
  }

  /**
   * Confirmar exclusão de candidato
   */
  confirmarExclusao(candidato: CandidatoApi): void {
    this.confirmationService.confirm({
      message: `Tem certeza que deseja excluir o candidato "${candidato.nome}"?`,
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim',
      rejectLabel: 'Não',
      accept: () => {
        this.excluirCandidato(candidato);
      }
    });
  }

  /**
   * Excluir candidato
   */
  private excluirCandidato(candidato: CandidatoApi): void {
    if (!candidato.id) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'ID do candidato não encontrado.'
      });
      return;
    }
    this.loading = true;
    this.candidatoService.deletarCandidato(candidato.id).subscribe({
      next: () => {
        this.carregarCandidatos();
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Candidato excluído com sucesso'
        });
        this.loading = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao excluir candidato.'
        });
        this.loading = false;
      }
    });
  }

  /**
   * Fechar dialog
   */
  fecharDialog(): void {
    this.displayDialog = false;
    this.selectedCandidato = null;
    this.candidatoForm = {
      nome: '',
      email: '',
      situacao: '',
      estado: '',
      vaga: '',
      telefone: '',
      sexo: '',
      empresa: ''
    };
  }

  /**
   * Filtrar candidatos com base no termo de busca
   */
  onSearch(): void {
    if (!this.searchTerm.trim()) {
      this.filteredCandidatos = [...this.candidatos];
      return;
    }
    const searchTermLower = this.searchTerm.toLowerCase().trim();
    this.filteredCandidatos = this.candidatos.filter(candidato =>
      (candidato.nome?.toLowerCase().includes(searchTermLower)) ||
      (candidato.email?.toLowerCase().includes(searchTermLower)) ||
      (candidato.empresa?.toLowerCase().includes(searchTermLower))
    );
  }

  /**
   * Limpar busca
   */
  clearSearch(): void {
    this.searchTerm = '';
    this.filteredCandidatos = [...this.candidatos];
  }

  /**
   * Ordenar dados da tabela
   */
  onSort(event: any): void {
    this.sortField = event.field;
    this.sortOrder = event.order;
  }

  /**
   * Verifica se usuário atual é RH
   */
  get isCurrentUserHR(): boolean {
    return this.authService.getRole() === 'rh';
  }

  /**
   * Abrir modal de documentos do candidato
   */
  abrirDocumentosDialog(candidato: CandidatoApi): void {
    this.candidatoSelecionado = candidato;
    this.showDocumentosDialog = true;
    this.documentosSelecionados = [];
    if (candidato.email) {
      this.documentosService.listarDocumentosRh(candidato.email).subscribe({
        next: (docs) => {
          console.log('Documentos recebidos da API:', docs);
          // Faz cast dos dados vindos da API para a interface correta
          this.documentosSelecionados = docs as any[];
        },
        error: () => {
          this.documentosSelecionados = [];
          this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao buscar documentos.' });
        }
      });
    }
  }

  /**
   * Aprovar documento individualmente
   */
  aprovarDocumento(candidato: CandidatoApi, doc: DocumentoComUI): void {
    if (!doc.nome_documento || !candidato.email) {
      this.messageService.add({ 
        severity: 'error', 
        summary: 'Erro', 
        detail: 'Dados do documento ou candidato não encontrados.' 
      });
      return;
    }

    this.documentosService.aprovarDocumento(doc.nome_documento, candidato.email).subscribe({
      next: (response) => {
        // Atualiza o status local do documento
        doc.status = 'APROVADO';
        
        this.messageService.add({ 
          severity: 'success', 
          summary: 'Sucesso', 
          detail: `Documento "${doc.nome_documento}" aprovado com sucesso.` 
        });
        
        // Recarrega a lista de documentos para garantir sincronização
        if (candidato.email) {
          this.documentosService.listarDocumentosRh(candidato.email).subscribe({
            next: (docs) => {
              this.documentosSelecionados = docs as any[];
            }
          });
        }
      },
      error: (error) => {
        console.error('Erro ao aprovar documento:', error);
        this.messageService.add({ 
          severity: 'error', 
          summary: 'Erro', 
          detail: 'Erro ao aprovar documento. Tente novamente.' 
        });
      }
    });
  }

  /**
   * Download de documento
   */
  downloadDocumento(doc: DocumentoComUI): void {
    if (!doc.nome_documento) {
      this.messageService.add({ 
        severity: 'error', 
        summary: 'Erro', 
        detail: 'Nome do arquivo não encontrado.' 
      });
      return;
    }

    // Adiciona propriedade de loading no documento específico
    doc.downloading = true;

    this.documentosService.downloadDocumento(doc.nome_documento).subscribe({
      next: (response) => {
        // Abre a URL de download em uma nova aba
        window.open(response.download_url, '_blank');
        
        this.messageService.add({ 
          severity: 'success', 
          summary: 'Sucesso', 
          detail: `Download de "${doc.nome_documento}" iniciado.` 
        });
        
        doc.downloading = false;
      },
      error: (error) => {
        console.error('Erro no download:', error);
        this.messageService.add({ 
          severity: 'error', 
          summary: 'Erro', 
          detail: 'Erro ao baixar o documento.' 
        });
        
        doc.downloading = false;
      }
    });
  }
}