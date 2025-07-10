import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG imports
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ProgressBarModule } from 'primeng/progressbar';
import { SkeletonModule } from 'primeng/skeleton';

// Services
import { CursoService } from '../../core/services/api/curso.service';
import { UsuarioService } from '../../core/services/api/usuario.service';
import { ConfirmationService, MessageService } from 'primeng/api';

// Interfaces
import { Curso, CreateCursoRequest, UpdateCursoRequest } from '../../shared/interface/curso.interface';
import { Usuario } from '../../shared/interface/usuario.interface';

// Pipes
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

// Animations
import { pageEnterAnimation } from '../../shared/animations';

// Icon field
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

@Component({
  selector: 'app-curso',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    InputNumberModule,
    DropdownModule,
    CheckboxModule,
    ConfirmDialogModule,
    ToastModule,
    ToolbarModule,
    CardModule,
    TagModule,
    ProgressBarModule,
    SkeletonModule,
    TranslatePipe,
    IconFieldModule,
    InputIconModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './curso.component.html',
  styleUrl: './curso.component.scss',
  animations: [pageEnterAnimation]
})
export class CursoComponent implements OnInit {
  private cursoService = inject(CursoService);
  private usuarioService = inject(UsuarioService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  // Data
  cursos: Curso[] = [];
  filteredCursos: Curso[] = [];
  usuarios: Usuario[] = [];
  selectedCurso: Curso | null = null;
  loading = false;

  // Search and filter
  searchTerm = '';
  sortField = '';
  sortOrder = 1;

  // Dialog states
  displayDialog = false;
  isEditing = false;

  // Form data
  cursoForm: CreateCursoRequest | UpdateCursoRequest = {
    iniciado: false,
    nivelInicial: 1,
    nivelAtual: 1,
    unidadeAtual: 1,
    unidadesFeitas: 0,
    usuarioId: ''
  };

  ngOnInit(): void {
    this.carregarCursos();
    this.carregarUsuarios();
  }

  /**
   * Carregar lista de cursos
   */
  carregarCursos(): void {
    this.loading = true;
    this.cursoService.listarCursos().subscribe({
      next: (cursos) => {
        this.cursos = cursos;
        this.filteredCursos = [...cursos];
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar cursos:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao carregar lista de cursos'
        });
        this.loading = false;
      }
    });
  }

  /**
   * Carregar lista de usuários para o dropdown
   */
  carregarUsuarios(): void {
    this.usuarioService.listarUsuarios().subscribe({
      next: (usuarios) => {
        this.usuarios = usuarios;
      },
      error: (error) => {
        console.error('Erro ao carregar usuários:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao carregar lista de usuários'
        });
      }
    });
  }

  /**
   * Abrir dialog para criar novo curso
   */
  novoCurso(): void {
    this.cursoForm = {
      iniciado: false,
      nivelInicial: 1,
      nivelAtual: 1,
      unidadeAtual: 1,
      unidadesFeitas: 0,
      usuarioId: ''
    };
    this.isEditing = false;
    this.displayDialog = true;
  }

  /**
   * Abrir dialog para editar curso
   */
  editarCurso(curso: Curso): void {
    this.cursoForm = {
      iniciado: curso.iniciado || false,
      nivelInicial: curso.nivelInicial || 1,
      nivelAtual: curso.nivelAtual || 1,
      unidadeAtual: curso.unidadeAtual || 1,
      unidadesFeitas: curso.unidadesFeitas || 0,
      usuarioId: curso.usuario?.id || ''
    };
    this.selectedCurso = curso;
    this.isEditing = true;
    this.displayDialog = true;
  }

  /**
   * Salvar curso (criar ou atualizar)
   */
  salvarCurso(): void {
    if (!this.cursoForm.usuarioId) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Selecione um usuário para o curso'
      });
      return;
    }

    this.loading = true;

    if (this.isEditing && this.selectedCurso?.id) {
      // Atualizar curso existente
      this.cursoService.atualizarCurso(this.selectedCurso.id, this.cursoForm as UpdateCursoRequest).subscribe({
        next: (curso) => {
          const index = this.cursos.findIndex(c => c.id === curso.id);
          if (index !== -1) {
            this.cursos[index] = curso;
          }
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Curso atualizado com sucesso'
          });
          this.fecharDialog();
          this.loading = false;
        },
        error: (error) => {
          console.error('Erro ao atualizar curso:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao atualizar curso'
          });
          this.loading = false;
        }
      });
    } else {
      // Criar novo curso
      this.cursoService.criarCurso(this.cursoForm as CreateCursoRequest).subscribe({
        next: (curso) => {
          this.cursos.push(curso);
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Curso criado com sucesso'
          });
          this.fecharDialog();
          this.loading = false;
        },
        error: (error) => {
          console.error('Erro ao criar curso:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao criar curso'
          });
          this.loading = false;
        }
      });
    }
  }

  /**
   * Confirmar exclusão de curso
   */
  confirmarExclusao(curso: Curso): void {
    const nomeUsuario = curso.usuario?.nome || 'Usuário desconhecido';
    this.confirmationService.confirm({
      message: `Tem certeza que deseja excluir o curso do usuário "${nomeUsuario}"?`,
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim',
      rejectLabel: 'Não',
      accept: () => {
        this.excluirCurso(curso);
      }
    });
  }

  /**
   * Excluir curso
   */
  private excluirCurso(curso: Curso): void {
    if (!curso.id) return;

    this.loading = true;
    this.cursoService.deletarCurso(curso.id).subscribe({
      next: () => {
        this.cursos = this.cursos.filter(c => c.id !== curso.id);
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Curso excluído com sucesso'
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao excluir curso:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao excluir curso'
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
    this.selectedCurso = null;
    this.cursoForm = {
      iniciado: false,
      nivelInicial: 1,
      nivelAtual: 1,
      unidadeAtual: 1,
      unidadesFeitas: 0,
      usuarioId: ''
    };
  }

  /**
   * Calcular progresso do curso
   */
  calcularProgresso(curso: Curso): number {
    if (!curso.unidadesFeitas || !curso.unidadeAtual) return 0;
    return Math.round((curso.unidadesFeitas / curso.unidadeAtual) * 100);
  }

  /**
   * Obter severidade da tag de status
   */
  getStatusSeverity(iniciado: boolean): string {
    return iniciado ? 'success' : 'warning';
  }

  /**
   * Obter texto do status
   */
  getStatusText(iniciado: boolean): string {
    return iniciado ? 'Iniciado' : 'Não iniciado';
  }

  /**
   * Obter nome do usuário para exibição
   */
  getNomeUsuario(usuarioId: string): string {
    const usuario = this.usuarios.find(u => u.id === usuarioId);
    return usuario?.nome || 'Usuário não encontrado';
  }

  /**
   * Filtrar cursos com base no termo de busca
   */
  onSearch(): void {
    if (!this.searchTerm.trim()) {
      this.filteredCursos = [...this.cursos];
      return;
    }

    const searchTermLower = this.searchTerm.toLowerCase().trim();
    this.filteredCursos = this.cursos.filter(curso => 
      (curso.usuario?.nome?.toLowerCase().includes(searchTermLower)) ||
      (curso.usuario?.email?.toLowerCase().includes(searchTermLower)) ||
      (curso.nivelAtual?.toString().includes(searchTermLower)) ||
      (curso.nivelInicial?.toString().includes(searchTermLower))
    );
  }

  /**
   * Limpar busca
   */
  clearSearch(): void {
    this.searchTerm = '';
    this.filteredCursos = [...this.cursos];
  }

  /**
   * Ordenar dados da tabela
   */
  onSort(event: any): void {
    this.sortField = event.field;
    this.sortOrder = event.order;
  }
}
