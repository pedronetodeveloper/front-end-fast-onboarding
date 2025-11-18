import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { InputMaskModule } from 'primeng/inputmask';
import { emailValidator } from '../../shared/validators/email.validator';
import { telefoneValidator } from '../../shared/validators/telefone.validator';
import { cpfCnpjValidator } from '../../shared/validators/cnpj.validator';
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
    InputMaskModule,
    ToastModule,
    ConfirmDialogModule,
    IconFieldModule,
    InputIconModule,
    TranslatePipe,
    ReactiveFormsModule
  ],
  providers: [ConfirmationService]
})
export class EmpresaComponent {
  private messageService = inject(MessageService);
  private empresaService = inject(EmpresaService);
  empresas: Empresa[] = [];
  empresaFormGroup!: FormGroup;
  filteredEmpresas: Empresa[] = [];
  loading = false;
  sortField = 'nome';
  sortOrder = 1;
  displayDialog = false;
  displayDialogInfo = false;
  isEditing = false;
  searchTerm: string = '';
    filtrarEmpresas() {
      const term = this.searchTerm.trim().toLowerCase();
      if (!term) {
        this.filteredEmpresas = [...this.empresas];
        return;
      }
      this.filteredEmpresas = this.empresas.filter(emp =>
        emp.nome.toLowerCase().includes(term) ||
        emp.cnpj.toLowerCase().includes(term) ||
        (emp.planos && emp.planos.toLowerCase().includes(term)) ||
        (emp.email_responsavel && emp.email_responsavel.toLowerCase().includes(term)) ||
        (emp.telefone_responsavel && emp.telefone_responsavel.toLowerCase().includes(term))
      );
    }
  empresaForm: Empresa = { nome: '', cnpj: '', planos: '', email_responsavel: '', telefone_responsavel: '' };
  planoOptions = [
    { label: 'Start', value: 'Start' },
    { label: 'Essencial', value: 'Essencial' },
    { label: 'Pro', value: 'Pro' },
    { label: 'Enterprise', value: 'Enterprise' }
  ];

  constructor(private fb: FormBuilder, private confirmationService: ConfirmationService) {
    this.initializeValidators();
  }

  ngOnInit() {
    this.carregarEmpresas();
  }

  initializeValidators() {
    this.empresaFormGroup = this.fb.group({
      id: [null],
      nome: ['', Validators.required],
      cnpj: ['', [Validators.required, cpfCnpjValidator]],
      planos: ['', Validators.required],
      email_responsavel: ['', [Validators.required, emailValidator]],
      telefone_responsavel: ['', [Validators.required, telefoneValidator]]
    });
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
    this.empresaFormGroup.reset();
    this.displayDialog = true;
  }

  editarEmpresa(empresa: Empresa) {
    this.isEditing = true;
    this.empresaFormGroup.patchValue({
      id: empresa.id,
      nome: empresa.nome,
      cnpj: empresa.cnpj,
      planos: empresa.planos,
      email_responsavel: empresa.email_responsavel,
      telefone_responsavel: empresa.telefone_responsavel
    });
    this.displayDialog = true;
  }

  salvarEmpresa() {
    if (this.empresaFormGroup.invalid) {
      this.empresaFormGroup.markAllAsTouched();
      return;
    }
    const empresaData = this.empresaFormGroup.value;
    console.log(empresaData);
    if (this.isEditing && empresaData.id) {
      console.log(empresaData.id,"Edit");
      this.empresaService.atualizarEmpresa(empresaData).subscribe({
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
      this.empresaService.criarEmpresa(empresaData as Empresa).subscribe({
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

  confirmarExclusaoDialog(empresa: Empresa) {
    if (!empresa.id) return;
    this.confirmationService.confirm({
      message: 'Tem certeza que deseja excluir esta empresa?',
      header: 'Confirmação',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim',
      rejectLabel: 'Não',
      accept: () => {
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
