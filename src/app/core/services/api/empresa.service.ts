import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Empresa {
  id?: number;
  nome: string;
  cnpj: string;
  planos: string;
  email_responsavel: string;
  telefone_responsavel: string;
}

@Injectable({
  providedIn: 'root'
})
export class EmpresaService {
  private http = inject(HttpClient);
  private apiUrl = 'https://41zz2bizyl.execute-api.us-east-1.amazonaws.com/empresas';

  /**
   * Listar todas as empresas
   */
  listarEmpresas(): Observable<Empresa[]> {
    return this.http.get<Empresa[]>(this.apiUrl);
  }

  /**
   * Buscar empresa por ID
   */
  buscarEmpresa(id: string): Observable<Empresa> {
    return this.http.get<Empresa>(`${this.apiUrl}/${id}`);
  }

  /**
   * Criar nova empresa
   */
  criarEmpresa(empresa: Empresa): Observable<Empresa> {
    return this.http.post<Empresa>(this.apiUrl, empresa);
  }

  /**
   * Atualizar empresa existente
   */
  atualizarEmpresa(id: string, empresa: Empresa): Observable<Empresa> {
    return this.http.put<Empresa>(`${this.apiUrl}`, empresa);
  }

  /**
   * Deletar empresa
   */
  deletarEmpresa(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}`, { body: { id } });
  }
}
