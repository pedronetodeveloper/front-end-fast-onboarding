import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { ConfirmationService, MessageService } from 'primeng/api';
import { EmpresaService, Empresa } from '../../core/services/api/empresa.service';
import { InputTextModule } from 'primeng/inputtext';

// Interface importada do serviço

@Component({
  selector: 'app-empresa',
  templateUrl: './empresa.component.html',
  styleUrls: ['./empresa.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ToolbarModule,
    ButtonModule,
    TableModule,
    TagModule,
    DialogModule,
    DropdownModule,
    InputTextModule,
    ToastModule,
    ConfirmDialogModule,
    IconFieldModule,
    InputIconModule,
    TranslatePipe
  ],
  providers: [ConfirmationService]
})
export class EmpresaComponent {
  private messageService = inject(MessageService);
  private empresaService = inject(EmpresaService);
  empresas: Empresa[] = [];
  filteredEmpresas: Empresa[] = [];
  loading = false;
  sortField = 'nome';
  sortOrder = 1;
  displayDialog = false;
  displayDialogInfo = false;
  isEditing = false;
  empresaForm: Empresa = { nome: '', cnpj: '', planos: '', email_responsavel: '', telefone_responsavel: '' };
  planoOptions = [
    { label: 'Start', value: 'Start' },
    { label: 'Essencial', value: 'Essencial' },
    { label: 'Pro', value: 'Pro' },
    { label: 'Enterprise', value: 'Enterprise' }
  ];

  ngOnInit() {
    this.carregarEmpresas();
  }

  carregarEmpresas() {
    this.loading = true;
    this.empresaService.listarEmpresas().subscribe({
      next: (empresas) => {
        this.empresas = empresas;
        this.filteredEmpresas = [...empresas];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao carregar empresas.' });
      }
    });
  }

  novaEmpresa() {
    this.isEditing = false;
    this.empresaForm = { nome: '', cnpj: '', planos: '', email_responsavel: '', telefone_responsavel: '' };
    this.displayDialog = true;
  }

  editarEmpresa(empresa: Empresa) {
    this.isEditing = true;
    this.empresaForm = { ...empresa };
    this.displayDialog = true;
  }

  salvarEmpresa() {
    if (this.isEditing && this.empresaForm.id) {
      this.empresaService.atualizarEmpresa(String(this.empresaForm.id), this.empresaForm).subscribe({
        next: (empresa) => {
          this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Empresa editada com sucesso!' });
          this.carregarEmpresas();
          this.displayDialog = false;
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao editar empresa.' });
        }
      });
    } else {
      this.empresaService.criarEmpresa(this.empresaForm as Empresa).subscribe({
        next: (empresa) => {
          this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Empresa cadastrada com sucesso!' });
          this.carregarEmpresas();
          this.displayDialog = false;
        },
        error: () => {
          this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao cadastrar empresa.' });
        }
      });
    }
  }

  onPlanoChange() {
    // Nenhuma lógica extra necessária, apenas atualiza o campo planos
  }

  confirmarExclusao(empresa: Empresa) {
    if (!empresa.id) return;
    this.empresaService.deletarEmpresa(String(empresa.id)).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Empresa excluída com sucesso!' });
        this.carregarEmpresas();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao excluir empresa.' });
      }
    });
  }


  fecharDialog() {
    this.displayDialog = false;
  }

  abrirModal() {
    this.displayDialogInfo = true;
  }

  onSort(event: any) {
    // Implementação mockada
  }
}
