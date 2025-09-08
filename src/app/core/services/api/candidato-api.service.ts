import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Candidato } from '../../../shared/interface/candidatos.interface';

@Injectable({
  providedIn: 'root'
})
export class CandidatoApiService {
  private http = inject(HttpClient);
  private apiUrl = 'https://3x8fg540pj.execute-api.us-east-1.amazonaws.com/candidatos';

  /**
   * Listar todos os candidatos
   */
  listarCandidatos(): Observable<Candidato[]> {
    return this.http.get<Candidato[]>(this.apiUrl);
  }

  /**
   * Cadastrar novo candidato
   */
  cadastrarCandidato(candidato: Partial<Candidato>): Observable<any> {
    return this.http.post(this.apiUrl, candidato);
  }

  /**
   * Atualizar candidato existente
   */
  atualizarCandidato(candidato: Partial<Candidato>): Observable<any> {
    return this.http.put(this.apiUrl, candidato);
  }
}
