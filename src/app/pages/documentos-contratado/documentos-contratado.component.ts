import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';

interface Documento {
  nome: string;
  status: 'enviado' | 'pendente';
}

interface UsuarioMock {
  nome: string;
  email: string;
  documentos: Documento[];
}

@Component({
  selector: 'app-documentos-contratado',
  standalone: true,
  imports: [CommonModule, ButtonModule, CardModule, TagModule],
  templateUrl: './documentos-contratado.component.html',
  styleUrls: ['./documentos-contratado.component.scss']
})
export class DocumentosContratadoComponent {
  usuarios: UsuarioMock[] = [
    {
      nome: 'João Silva',
      email: 'joao.silva@email.com',
      documentos: [
        { nome: 'RG', status: 'enviado' },
        { nome: 'CPF', status: 'enviado' },
        { nome: 'Título de Eleitor', status: 'pendente' },
        { nome: 'Carteira de Trabalho', status: 'enviado' },
        { nome: 'Comprovante de Endereço', status: 'pendente' }
      ]
    },
    {
      nome: 'Maria Souza',
      email: 'maria.souza@email.com',
      documentos: [
        { nome: 'RG', status: 'enviado' },
        { nome: 'CPF', status: 'enviado' },
        { nome: 'Título de Eleitor', status: 'enviado' },
        { nome: 'Carteira de Trabalho', status: 'enviado' },
        { nome: 'Comprovante de Endereço', status: 'enviado' }
      ]
    },
    {
      nome: 'Carlos Pereira',
      email: 'carlos.pereira@email.com',
      documentos: [
        { nome: 'RG', status: 'pendente' },
        { nome: 'CPF', status: 'enviado' },
        { nome: 'Título de Eleitor', status: 'pendente' },
        { nome: 'Carteira de Trabalho', status: 'pendente' },
        { nome: 'Comprovante de Endereço', status: 'enviado' }
      ]
    }
  ];

  usuarioSelecionado: UsuarioMock | null = null;

  selecionarUsuario(usuario: UsuarioMock) {
    this.usuarioSelecionado = usuario;
  }

  voltar() {
    this.usuarioSelecionado = null;
  }

  get documentos() {
    return this.usuarioSelecionado?.documentos || [];
  }
}
