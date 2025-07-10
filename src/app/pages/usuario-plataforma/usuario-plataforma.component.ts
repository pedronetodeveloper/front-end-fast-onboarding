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
  templateUrl: './usuario-plataforma.component.html',
  styleUrl: './usuario-plataforma.component.scss',
  animations: [pageEnterAnimation]
})
export class UsuarioComponent implements OnInit {
  private usuarioService = inject(UsuarioService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

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

  ngOnInit(): void {
    this.carregarUsuarios();
  }

  /**
   * Carregar lista de usuários
   */
  carregarUsuarios(): void {
    this.loading = true;
    this.usuarioService.listarUsuarios().subscribe({
      next: (usuarios) => {
        this.usuarios = usuarios;
        this.filteredUsuarios = [...usuarios];
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar usuários:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao carregar lista de usuários'
        });
        this.loading = false;
      }
    });
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

    if (this.isEditing && this.selectedUsuario?.id) {
      // Atualizar usuário existente
      this.usuarioService.atualizarUsuario(this.selectedUsuario.id, this.usuarioForm as UpdateUsuarioRequest).subscribe({
        next: (usuario) => {
          const index = this.usuarios.findIndex(u => u.id === usuario.id);
          if (index !== -1) {
            this.usuarios[index] = usuario;
          }
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Usuário atualizado com sucesso'
          });
          this.fecharDialog();
          this.loading = false;
        },
        error: (error) => {
          console.error('Erro ao atualizar usuário:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao atualizar usuário'
          });
          this.loading = false;
        }
      });
    } else {
      // Criar novo usuário
      this.usuarioService.criarUsuario(this.usuarioForm as CreateUsuarioRequest).subscribe({
        next: (usuario) => {
          this.usuarios.push(usuario);
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Usuário criado com sucesso'
          });
          this.fecharDialog();
          this.loading = false;
        },
        error: (error) => {
          console.error('Erro ao criar usuário:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao criar usuário'
          });
          this.loading = false;
        }
      });
    }
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
    if (!usuario.id) return;

    this.loading = true;
    this.usuarioService.deletarUsuario(usuario.id).subscribe({
      next: () => {
        this.usuarios = this.usuarios.filter(u => u.id !== usuario.id);
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Usuário excluído com sucesso'
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao excluir usuário:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao excluir usuário'
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
}
