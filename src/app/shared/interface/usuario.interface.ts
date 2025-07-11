export interface Usuario {
  id?: string;
  matricula?: string;
  nome?: string;
  email?: string;
  idiomaPreferencia?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface UsuarioPlataforma {
  id?: string;
  empresa?: string;
  nome?: string;
  email?: string;
  idiomaPreferencia?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface CreateUsuarioRequest {
  matricula?: string;
  nome: string;
  email: string;
  idiomaPreferencia?: string;
}

export interface UpdateUsuarioRequest {
  matricula?: string;
  nome?: string;
  email?: string;
  idiomaPreferencia?: string;
}

export interface CreateUsuarioPlataformaRequest {
  empresa?: string;
  nome: string;
  email: string;
  idiomaPreferencia?: string;
}

export interface UpdateUsuarioPlataformaRequest {
  empresa?: string;
  nome: string;
  email: string;
  idiomaPreferencia?: string;
}

// Import Curso interface to avoid circular dependency
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
}
