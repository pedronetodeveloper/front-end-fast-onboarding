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
import { UsuarioService } from '../../core/services/api/usuario.service';
import { ConfirmationService, MessageService } from 'primeng/api';

// Interfaces
import { Usuario, CreateUsuarioRequest, UpdateUsuarioRequest, CreateUsuarioPlataformaRequest, UpdateUsuarioPlataformaRequest, UsuarioPlataforma } from '../../shared/interface/usuario.interface';

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
  templateUrl: './usuario-plataforma.component.html',
  styleUrl: './usuario-plataforma.component.scss',
  animations: [pageEnterAnimation]
})
export class UsuarioPlataformComponent implements OnInit {
 private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  // Data
  usuarios: UsuarioPlataforma[] = [
    { nome: 'João Silva', email: 'joao.silva@email.com', empresa: 'Tivit', idiomaPreferencia: 'pt' },
    { nome: 'Maria Souza', email: 'maria.souza@email.com', empresa: 'DevApi', idiomaPreferencia: 'en' },
    { nome: 'Carlos Pereira', email: 'carlos.pereira@email.com', empresa: 'StoneAge', idiomaPreferencia: 'es' }
  ];
  filteredUsuarios: UsuarioPlataforma[] = [...this.usuarios];
  selectedUsuario: UsuarioPlataforma | null = null;
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
  usuarioForm: CreateUsuarioPlataformaRequest | UpdateUsuarioPlataformaRequest = {
    empresa: '',
    nome: '',
    email: '',
    idiomaPreferencia: 'pt'
  };

  // Dropdown options
  idiomaOptions = [
    { label: 'Português', value: 'pt' },
    { label: 'English', value: 'en' },
    { label: 'Español', value: 'es' }
  ];

  empresaOptions = [
    { label: 'Tivit', value: 'pt' },
    { label: 'DevApi', value: 'pt' },
    { label: 'StoneAge', value: 'pt' }
  ];

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
      empresa: '',
      nome: '',
      email: '',
      idiomaPreferencia: 'pt'
    };
    this.isEditing = false;
    this.displayDialog = true;
  }

  /**
   * Abrir dialog para editar usuário
   */
  editarUsuario(usuario: UsuarioPlataforma): void {
    this.usuarioForm = {
      empresa: usuario.empresa || '',
      nome: usuario.nome || '',
      email: usuario.email || '',
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
      empresa: '',
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
      (usuario.empresa?.toLowerCase().includes(searchTermLower))
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

}
