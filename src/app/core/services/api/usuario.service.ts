import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Usuario {
  id?: number | string;
  nome: string;
  email: string;
  role: string;
  empresa: string;
}

export interface SendPass{
  token: string;
  senha: string;
  ur: string;
}

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private http = inject(HttpClient);
  private apiUrl = 'https://kvf1h1xdki.execute-api.us-east-1.amazonaws.com/usuarios';

  /**
   * Listar todos os usuários
   */
  listarUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.apiUrl);
  }

  /**
   * Buscar usuário por ID
   */
  buscarUsuario(id: string): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/${id}`);
  }

  /**
   * Criar novo usuário
   */
  criarUsuario(usuario: Usuario): Observable<Usuario> {
    return this.http.post<Usuario>(this.apiUrl, usuario);
  }

  /**
   * Atualizar usuário existente
   */
  atualizarUsuario(usuario: Partial<Usuario>): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.apiUrl}`, usuario);
  }

  /**
   * Deletar usuário
   */
  deletarUsuario(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}`, { body: { id } });
  }

  /**
   * Criar novo usuário
   */
  criarSenha(sendPass: SendPass): Observable<SendPass> {
    // 1. Constrói a URL com o 'ur' como parte do caminho.
    const url = `${this.apiUrl}/${sendPass.ur}/senha`;
    
    // 2. Remove o 'ur' do objeto para enviar no corpo da requisição.
    const { ur, ...body } = sendPass;

    // 3. Envia a requisição POST para a URL construída com o novo corpo.
    return this.http.post<SendPass>(url, sendPass);
  }
}
