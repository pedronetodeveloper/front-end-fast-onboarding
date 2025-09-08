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
import { EmpresaService, Empresa } from '../../core/services/api/empresa.service';
import { ConfirmationService, MessageService } from 'primeng/api';

// Interfaces
import { CreateUsuarioRequest, UpdateUsuarioRequest, CreateUsuarioPlataformaRequest, UpdateUsuarioPlataformaRequest, UsuarioPlataforma } from '../../shared/interface/usuario.interface';

// Pipes
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

// Animations
import { pageEnterAnimation } from '../../shared/animations';

// Icon field
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

export interface Usuario {
  id?: number | string;
  nome: string;
  email: string;
  role: string;
  empresa: string;
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
  templateUrl: './usuario-plataforma.component.html',
  styleUrl: './usuario-plataforma.component.scss',
  // animations: [pageEnterAnimation]
})
export class UsuarioPlataformComponent implements OnInit {
  /**
   * Retorna o nome amigável do perfil
   */
  getRoleLabel(role: string): string {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'user': return 'Responsável';
      case 'candidate': return 'Candidato';
      case 'rh': return 'RH';
      default: return role;
    }
  }
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  private usuarioService = inject(UsuarioService);
  private empresaService = inject(EmpresaService);

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
  usuarioForm: Usuario= {
    empresa: '',
    nome: '',
    email: '',
    role:''
  };


  empresaOptions: { label: string; value: string }[] = [];

  candidatoSelecionado: Usuario | null = null;

  ngOnInit(): void {
    this.carregarUsuarios();
    this.carregarEmpresas();
  }

    carregarEmpresas(): void {
      this.empresaService.listarEmpresas().subscribe({
        next: (empresas) => {
          this.empresaOptions = empresas.map((e: Empresa) => ({ label: e.nome, value: e.nome }));
        },
        error: () => {
          this.empresaOptions = [];
          this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar empresas.' });
        }
      });
    }

  /**
   * Carregar lista de usuários
   */
  carregarUsuarios(): void {
  this.loading = true;
  this.usuarioService.listarUsuarios().subscribe({
    next: (usuarios) => {
      console.log('Usuários recebidos:', usuarios); // Adicione este log
      this.usuarios = usuarios;
      this.filteredUsuarios = [...usuarios];
      this.loading = false;
    },
    error: () => {
      this.loading = false;
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar usuários.' });
    }
  });
}


  abrirModal():void{
    this.displayDialogInfo = true;
  }

  abrirDialogUsuario(): void {
    this.carregarEmpresas(); // Atualiza empresas antes de abrir o dialog
    this.displayDialog = true;
  }

  /**
   * Abrir dialog para criar novo usuário
   */
  novoUsuario(): void {
    this.usuarioForm = {
      empresa: '',
      nome: '',
      email: '',
      role:''
    };
    this.isEditing = false;
    this.abrirDialogUsuario();
  }

  /**
   * Abrir dialog para editar usuário
   */
  editarUsuario(usuario: Usuario): void {
    this.usuarioForm = {
      empresa: usuario.empresa || '',
      nome: usuario.nome || '',
      email: usuario.email || '',
      role: usuario.role || ''
    };
    this.selectedUsuario = usuario;
    this.isEditing = true;
    this.abrirDialogUsuario();
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
      // Atualizar usuário via service
      const usuarioAtualizado = {
        ...this.selectedUsuario,
        ...this.usuarioForm,
        id: this.selectedUsuario.id
      } as Usuario & { id: string };
      this.usuarioService.atualizarUsuario(usuarioAtualizado).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Usuário atualizado com sucesso'
          });
          this.fecharDialog();
          this.carregarUsuarios();
          this.loading = false;
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao atualizar usuário.'
          });
          this.loading = false;
        }
      });
    } else {
      // Criar novo usuário via service
      const novoUsuario = {
        ...this.usuarioForm,
      }
      this.usuarioService.criarUsuario(novoUsuario).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Usuário criado com sucesso'
          });
          this.fecharDialog();
          this.carregarUsuarios();
          this.loading = false;
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao criar usuário.'
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
    if (!usuario.id) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'ID do usuário não encontrado.'
      });
      return;
    }
    this.loading = true;
    this.usuarioService.deletarUsuario(usuario.id).subscribe({
      next: () => {
        this.carregarUsuarios();
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Usuário excluído com sucesso'
        });
        this.loading = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao excluir usuário.'
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
      empresa: '',
      role: ''
    };
  }

  // ...existing code...

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
