import { Component, OnInit, inject } from '@angular/core';
import { AuthService, AuthUser } from '../../core/services/auth.service';

interface DocumentoCandidato {
  nome: string;
  status: 'Pendente' | 'Aprovado' | 'Rejeitado';
}

import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-acompanhamento-documentos',
  templateUrl: './acompanhamento-documentos.component.html',
  styleUrls: ['./acompanhamento-documentos.component.scss'],
  standalone: true,
  imports: [TranslatePipe]
})
export class AcompanhamentoDocumentosComponent implements OnInit {
  user: AuthUser | null = null;
  userDocuments: DocumentoCandidato[] = [];
  private authService = inject(AuthService);

  ngOnInit(): void {
    this.user = this.authService.getUser();
    // Mock: documentos do candidato logado
    if (this.user?.role === 'candidato') {
      this.userDocuments = [
        { nome: 'RG', status: 'Aprovado' },
        { nome: 'CPF', status: 'Aprovado' },
        { nome: 'Comprovante de Endereço', status: 'Pendente' },
        { nome: 'Diploma', status: 'Rejeitado' }
      ];
    }
  }
}
