import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService, AuthUser } from '../../core/services/auth.service';
import { LocalStorageService } from '../../core/services/local-storage.service';
import { Usuario } from '../../shared/interface/usuario.interface';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-acompanhamento-documentos',
  templateUrl: './acompanhamento-documentos.component.html',
  styleUrls: ['./acompanhamento-documentos.component.scss'],
  standalone: true,
  imports: [CommonModule, TranslatePipe]
})
export class AcompanhamentoDocumentosComponent implements OnInit {
  user: AuthUser | null = null;
  documentos: { nome: string; tipo: string; status: 'valido' | 'invalido' | 'pendente' }[] = [];
  private authService = inject(AuthService);
  private localStorageService = inject(LocalStorageService);

  ngOnInit(): void {
    this.user = this.authService.getUser();
    this.atualizarDocumentos();
  }

  atualizarDocumentos(): void {
    if (this.user?.role === 'candidato') {
      const candidatos = this.localStorageService.getItem<Usuario>('candidatos');
      const candidato = candidatos.find(u => u.email === this.user?.email);
      this.documentos = candidato?.documentos || [];
    }
  }
}
