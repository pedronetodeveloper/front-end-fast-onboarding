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

  // Data
  usuarios: Usuario[] = [
    { nome: 'João Silva', email: 'joao.silva@email.com', matricula: '123456', idiomaPreferencia: 'pt' },
    { nome: 'Maria Souza', email: 'maria.souza@email.com', matricula: '654321', idiomaPreferencia: 'en' },
    { nome: 'Carlos Pereira', email: 'carlos.pereira@email.com', matricula: '789012', idiomaPreferencia: 'es' }
  ];
  filteredUsuarios: Usuario[] = [...this.usuarios];
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
  documentosPorUsuario: Record<string, { nome: string; status: 'enviado' | 'pendente' }[]> = {
    'joao.silva@email.com': [
      { nome: 'RG', status: 'enviado' },
      { nome: 'CPF', status: 'enviado' },
      { nome: 'Título de Eleitor', status: 'pendente' },
      { nome: 'Carteira de Trabalho', status: 'enviado' },
      { nome: 'Comprovante de Endereço', status: 'pendente' }
    ],
    'maria.souza@email.com': [
      { nome: 'RG', status: 'enviado' },
      { nome: 'CPF', status: 'enviado' },
      { nome: 'Título de Eleitor', status: 'enviado' },
      { nome: 'Carteira de Trabalho', status: 'enviado' },
      { nome: 'Comprovante de Endereço', status: 'enviado' }
    ],
    'carlos.pereira@email.com': [
      { nome: 'RG', status: 'pendente' },
      { nome: 'CPF', status: 'enviado' },
      { nome: 'Título de Eleitor', status: 'pendente' },
      { nome: 'Carteira de Trabalho', status: 'pendente' },
      { nome: 'Comprovante de Endereço', status: 'enviado' }
    ]
  };
  showDocumentosDialog = false;
  documentosSelecionados: { nome: string; status: 'enviado' | 'pendente' }[] = [];
  candidatoSelecionado: Usuario | null = null;

  ngOnInit(): void {
    // Não carrega da API, já está mockado
    this.filteredUsuarios = [...this.usuarios];
  }

  /**
   * Carregar lista de usuários
   */
  carregarUsuarios(): void {
    // Não faz nada, pois os usuários já estão mockados
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
      // Atualizar usuário mock
      const idx = this.usuarios.findIndex(u => u.email === this.selectedUsuario?.email);
      if (idx !== -1) {
        this.usuarios[idx] = { ...this.selectedUsuario, ...this.usuarioForm };
      }
      this.messageService.add({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Usuário atualizado com sucesso'
      });
      this.fecharDialog();
      this.loading = false;
    } else {
      // Criar novo usuário mock
      const novoUsuario = { ...this.usuarioForm };
      this.usuarios.push(novoUsuario as Usuario);
      this.messageService.add({
        severity: 'success',
        summary: 'Sucesso',
        detail: 'Usuário criado com sucesso'
      });
      this.fecharDialog();
      this.loading = false;
    }
    this.filteredUsuarios = [...this.usuarios];
  }

  /**
   * Confirmar exclusão de usuário
   */
  confirmarExclusao(usuario: Usuario): void {
    this.confirmationService.confirm({
      message: `Tem certeza que deseja excluir o usuário "${usuario.nome}"?`,
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
    this.usuarios = this.usuarios.filter(u => u.email !== usuario.email);
    this.filteredUsuarios = [...this.usuarios];
    this.messageService.add({
      severity: 'success',
      summary: 'Sucesso',
      detail: 'Usuário excluído com sucesso'
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
    this.documentosSelecionados = this.documentosPorUsuario[usuario.email || ''] || [];
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
