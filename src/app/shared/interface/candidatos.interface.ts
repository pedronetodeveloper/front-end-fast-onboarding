export interface Candidato {
  id?: number | string;
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  sexo: string;
  estado: string;
  vaga: string;
  empresa?: string;
  situacao?: string;
  documentos?: Array<{
    nome: string;
    tipo: string;
    status: 'valido' | 'invalido' | 'pendente';
  }>;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCandidatoRequest {
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  sexo: string;
  estado: string;
  vaga: string;
  empresa?: string;
  situacao?: string;
}

export interface UpdateCandidatoRequest {
  nome?: string;
  cpf?: string;
  email?: string;
  telefone?: string;
  sexo?: string;
  estado?: string;
  vaga?: string;
  empresa?: string;
  situacao?: string;
}
