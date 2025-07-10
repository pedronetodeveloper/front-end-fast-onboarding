import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Curso, CreateCursoRequest, UpdateCursoRequest } from '../../../shared/interface/curso.interface';

@Injectable({
  providedIn: 'root'
})
export class CursoService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.api.url}/cursos`;

  /**
   * Listar todos os cursos
   */
  listarCursos(): Observable<Curso[]> {
    return this.http.get<Curso[]>(this.apiUrl);
  }

  /**
   * Buscar curso por ID
   */
  buscarCurso(id: string): Observable<Curso> {
    return this.http.get<Curso>(`${this.apiUrl}/${id}`);
  }

  /**
   * Criar novo curso
   */
  criarCurso(curso: CreateCursoRequest): Observable<Curso> {
    return this.http.post<Curso>(this.apiUrl, curso);
  }

  /**
   * Atualizar curso existente
   */
  atualizarCurso(id: string, curso: UpdateCursoRequest): Observable<Curso> {
    return this.http.put<Curso>(`${this.apiUrl}/${id}`, curso);
  }

  /**
   * Deletar curso
   */
  deletarCurso(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Listar cursos por usuário
   */
  listarCursosPorUsuario(usuarioId: string): Observable<Curso[]> {
    return this.http.get<Curso[]>(`${this.apiUrl}/usuario/${usuarioId}`);
  }

  /**
   * Marcar curso como iniciado
   */
  iniciarCurso(id: string): Observable<Curso> {
    return this.http.patch<Curso>(`${this.apiUrl}/${id}/iniciar`, {});
  }

  /**
   * Atualizar progresso do curso
   */
  atualizarProgresso(id: string, progresso: { nivelAtual?: number; unidadeAtual?: number; unidadesFeitas?: number }): Observable<Curso> {
    return this.http.patch<Curso>(`${this.apiUrl}/${id}/progresso`, progresso);
  }
}
