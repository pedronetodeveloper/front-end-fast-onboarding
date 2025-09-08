
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CandidatoApi {
  id?: number;
  nome: string;
  email: string;
  situacao: string;
  estado: string;
  cpf?: string;
  vaga: string;
  telefone?: string | null;
  sexo: string;
  empresa?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CandidatoService {
  private http = inject(HttpClient);
  private candidatoApiUrl = 'https://3x8fg540pj.execute-api.us-east-1.amazonaws.com/candidatos';

  /**
   * Salvar novo candidato (POST)
   */
  salvarCandidato(candidato: CandidatoApi): Observable<CandidatoApi> {
    return this.http.post<CandidatoApi>(this.candidatoApiUrl, candidato);
  }

  deletarCandidato(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.candidatoApiUrl}`, { body: id });
  }

  /**
   * Editar candidato (PUT)
   */
  editarCandidato(candidato: CandidatoApi): Observable<CandidatoApi> {
    return this.http.put<CandidatoApi>(this.candidatoApiUrl, candidato);
  }

  listarCandidatos(empresa?: string): Observable<CandidatoApi[]> {
    if (!empresa) {
      const user = localStorage.getItem('user');
      empresa = user ? (JSON.parse(user).empresa as string | undefined) : undefined;
    }
    let params = new HttpParams();
    if (empresa) {
      params = params.set('empresa', empresa);
    }
    return this.http.get<CandidatoApi[]>(this.candidatoApiUrl, { params });
  }
}
