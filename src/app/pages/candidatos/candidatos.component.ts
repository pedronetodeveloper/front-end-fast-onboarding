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
import { AuthService } from '../../core/services/auth.service'; // Add this import

// Interfaces
import { Usuario, CreateUsuarioRequest, UpdateUsuarioRequest } from '../../shared/interface/usuario.interface';

// Pipes
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

// Animations
import { pageEnterAnimation } from '../../shared/animations';

// Icon field
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

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
export class UsuarioComponent implements OnInit {
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  private localStorageService = inject(LocalStorageService);
  private authService = inject(AuthService); // Inject AuthService

  // Data
  usuarios: Usuario[] = [];
  filteredUsuarios: Usuario[] = [];
  selectedUsuario: Usuario | null = null;
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
  usuarioForm: CreateUsuarioRequest | UpdateUsuarioRequest = {
    nome: '',
    email: '',
    matricula: '',
    idiomaPreferencia: 'pt'
  };

  // Dropdown options
  idiomaOptions = [
    { label: 'Português', value: 'pt' },
    { label: 'English', value: 'en' },
    { label: 'Español', value: 'es' }
  ];

  // Adiciona mock de documentos por usuário
  // documentosPorUsuario removido, agora usa campo documentos do candidato
  showDocumentosDialog = false;
  documentosSelecionados: { nome: string; tipo: string; status: 'valido' | 'invalido' | 'pendente' }[] = [];
    candidatoSelecionado: Usuario | null = null;

  get isCurrentUserHR(): boolean {
    // Assuming authService.getCurrentUserRole() returns the role of the logged-in user
    return this.authService.getRole() === 'rh';
  }

  /**
   * Aprova um documento de um candidato.
   * @param candidato O candidato cujo documento será aprovado.
   * @param documento O documento a ser aprovado.
   */
  aprovarDocumento(candidato: Usuario, documento: { nome: string; tipo: string; status: 'valido' | 'invalido' | 'pendente' }): void {
    if (!candidato || !candidato.documentos) {
      return;
    }

    const documentoIndex = candidato.documentos.findIndex(d => d.nome === documento.nome && d.tipo === documento.tipo);

    if (documentoIndex > -1) {
      candidato.documentos[documentoIndex].status = 'valido';
      this.localStorageService.updateItem('candidatos', candidato as Usuario & { id: string });
      this.messageService.add({
        severity: 'success',
        summary: 'Sucesso',
        detail: `Documento '${documento.nome}' do candidato '${candidato.nome}' aprovado com sucesso.`
      });
      // Refresh the displayed documents in the dialog
      this.documentosSelecionados = [...candidato.documentos];
      this.carregarUsuarios(); // Refresh the main list as well
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: `Documento '${documento.nome}' não encontrado para o candidato '${candidato.nome}'.`
      });
    }
  }

  ngOnInit(): void {
    this.carregarUsuarios();
  }

  /**
   * Carregar lista de usuários
   */
  carregarUsuarios(): void {
    this.usuarios = this.localStorageService.getItem<Usuario>('candidatos');
    this.filteredUsuarios = [...this.usuarios];
    this.loading = false;
  }

  abrirModal():void{
    this.displayDialogInfo = true;
  }

  /**
   * Abrir dialog para criar novo usuário
   */
  novoUsuario(): void {
    this.usuarioForm = {
      nome: '',
      email: '',
      matricula: '',
      idiomaPreferencia: 'pt'
    };
    this.isEditing = false;
    this.displayDialog = true;
  }

  /**
   * Abrir dialog para editar usuário
   */
  editarUsuario(usuario: Usuario): void {
    this.usuarioForm = {
      nome: usuario.nome || '',
      email: usuario.email || '',
      matricula: usuario.matricula || '',
      idiomaPreferencia: usuario.idiomaPreferencia || 'pt'
    };
    this.selectedUsuario = usuario;
    this.isEditing = true;
    this.displayDialog = true;
  }

  /**
   * Salvar usuário (criar ou atualizar)
   */
  salvarUsuario(): void {
    if (!this.usuarioForm.nome || !this.usuarioForm.email) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Nome e email são obrigatórios'
      });
      return;
    }
    this.loading = true;
    if (this.isEditing && this.selectedUsuario) {
      // Atualizar usuário local
      const usuarioAtualizado = {
        ...this.selectedUsuario,
        ...this.usuarioForm,
        id: this.selectedUsuario.id || this.selectedUsuario.email || this.usuarioForm.email
      } as Usuario & { id: string };
      this.localStorageService.updateItem('candidatos', usuarioAtualizado);
      this.messageService.add({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Candidato atualizado com sucesso'
      });
      this.fecharDialog();
      this.carregarUsuarios();
      this.loading = false;
    } else {
      // Criar novo usuário local
      // Criar novo usuário local
      const novoUsuario = {
        ...this.usuarioForm,
        id: this.usuarioForm.email,
        senha: 'candidato123',
        role: 'candidato' // Assign default role
      } as Usuario & { id: string };
      this.localStorageService.addItem('candidatos', novoUsuario);
      this.messageService.add({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Candidato criado com sucesso'
      });
      this.fecharDialog();
      this.carregarUsuarios();
      this.loading = false;
    }
  }

  /**
   * Confirmar exclusão de usuário
   */
  confirmarExclusao(usuario: Usuario): void {
    this.confirmationService.confirm({
      message: `Tem certeza que deseja excluir o candidato "${usuario.nome}"?`,
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim',
      rejectLabel: 'Não',
      accept: () => {
        this.excluirUsuario(usuario);
      }
    });
  }

  /**
   * Excluir usuário
   */
  private excluirUsuario(usuario: Usuario): void {
    this.localStorageService.removeItem('candidatos', usuario.id || usuario.email);
    this.carregarUsuarios();
    this.messageService.add({
      severity: 'success',
      summary: 'Sucesso',
      detail: 'Candidato excluído com sucesso'
    });
  }

  /**
   * Fechar dialog
   */
  fecharDialog(): void {
    this.displayDialog = false;
    this.selectedUsuario = null;
    this.usuarioForm = {
      nome: '',
      email: '',
      matricula: '',
      idiomaPreferencia: 'pt'
    };
  }

  /**
   * Obter tag de idioma
   */
  getIdiomaTag(idioma: string): string {
    const opcao = this.idiomaOptions.find(opt => opt.value === idioma);
    return opcao?.label || idioma;
  }

  /**
   * Filtrar usuários com base no termo de busca
   */
  onSearch(): void {
    if (!this.searchTerm.trim()) {
      this.filteredUsuarios = [...this.usuarios];
      return;
    }

    const searchTermLower = this.searchTerm.toLowerCase().trim();
    this.filteredUsuarios = this.usuarios.filter(usuario => 
      (usuario.nome?.toLowerCase().includes(searchTermLower)) ||
      (usuario.email?.toLowerCase().includes(searchTermLower)) ||
      (usuario.matricula?.toLowerCase().includes(searchTermLower))
    );
  }

  /**
   * Limpar busca
   */
  clearSearch(): void {
    this.searchTerm = '';
    this.filteredUsuarios = [...this.usuarios];
  }

  /**
   * Ordenar dados da tabela
   */
  onSort(event: any): void {
    this.sortField = event.field;
    this.sortOrder = event.order;
  }

  /**
   * Abrir dialog de documentos do candidato
   */
  abrirDocumentos(usuario: Usuario) {
    this.candidatoSelecionado = usuario;
    this.documentosSelecionados = usuario.documentos || [];
    this.showDocumentosDialog = true;
  }

  /**
   * Fechar dialog de documentos
   */
  fecharDocumentosDialog() {
    this.showDocumentosDialog = false;
    this.documentosSelecionados = [];
    this.candidatoSelecionado = null;
  }
}
