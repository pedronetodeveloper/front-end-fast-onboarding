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
import { LocalStorageService } from '../../core/services/local-storage.service';
import { InputTextModule } from 'primeng/inputtext';

interface Empresa {
  nome: string;
  plano: string;
  responsavel: string;
  cnpj: string;
  usuarios: number;
  limiteUsuarios: number;
}

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
  private localStorageService = inject(LocalStorageService);
  empresas: Empresa[] = [
    { nome: 'Empresa Exemplo', plano: 'Básico', responsavel: 'João Silva', cnpj: '12.345.678/0001-99', usuarios: 5, limiteUsuarios: 10 },
    { nome: 'Tech Solutions', plano: 'Premium', responsavel: 'Maria Souza', cnpj: '98.765.432/0001-11', usuarios: 25, limiteUsuarios: 25 },
    { nome: 'Startup XYZ', plano: 'Intermediário', responsavel: 'Carlos Lima', cnpj: '11.222.333/0001-44', usuarios: 12, limiteUsuarios: 15 }
  ];
  filteredEmpresas = this.empresas;
  loading = false;
  sortField = 'nome';
  sortOrder = 1;
  displayDialog = false;
  displayDialogInfo = false;
  isEditing = false;
  empresaForm: any = {};
  planoOptions = [
    { label: 'Básico (até 10 usuários)', value: 'Básico', limite: 10 },
    { label: 'Intermediário (até 15 usuários)', value: 'Intermediário', limite: 15 },
    { label: 'Premium (até 25 usuários)', value: 'Premium', limite: 25 }
  ];

  novaEmpresa() {
    this.isEditing = false;
    this.empresaForm = { nome: '', plano: '', responsavel: '', cnpj: '', usuarios: 0, limiteUsuarios: 0 };
    this.displayDialog = true;
  }

  editarEmpresa(empresa: Empresa) {
    this.isEditing = true;
    this.empresaForm = { ...empresa };
    this.displayDialog = true;
  }

  salvarEmpresa() {
    if (this.isEditing) {
      const idx = this.empresas.findIndex(e => e.nome === this.empresaForm.nome);
      if (idx > -1) this.empresas[idx] = { ...this.empresaForm };
      this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Empresa editada com sucesso!' });
    } else {
      this.empresas.push({ ...this.empresaForm });
      this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Empresa cadastrada com sucesso!' });
    }
    this.filteredEmpresas = [...this.empresas];
    this.localStorageService.setItem('empresas', this.empresas);
    this.displayDialog = false;
  }

  confirmarExclusao(empresa: Empresa) {
    this.empresas = this.empresas.filter(e => e !== empresa);
    this.filteredEmpresas = [...this.empresas];
    this.localStorageService.setItem('empresas', this.empresas);
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
