import { Usuario } from './usuario.interface';

export interface Curso {
  id?: string;
  iniciado?: boolean;
  nivelInicial?: number;
  nivelAtual?: number;
  unidadeAtual?: number;
  unidadesFeitas?: number;
  usuario?: Usuario;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface CreateCursoRequest {
  iniciado?: boolean;
  nivelInicial?: number;
  nivelAtual?: number;
  unidadeAtual?: number;
  unidadesFeitas?: number;
  usuarioId: string;
}

export interface UpdateCursoRequest {
  iniciado?: boolean;
  nivelInicial?: number;
  nivelAtual?: number;
  unidadeAtual?: number;
  unidadesFeitas?: number;
  usuarioId?: string;
}
