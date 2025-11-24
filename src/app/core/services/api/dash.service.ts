import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Contratacoe {
  contratacoes?: number;
  empresa: string;
}

export interface TaxaAprovacao {
  taxa_aprovacao?: number;
  documentos_aprovados: string;
  total_documentos?: number;
  empresa: string;
}

@Injectable({
  providedIn: 'root'
})
export class DashService {
  private http = inject(HttpClient);
  private apiUrl = 'https://hvevmnr8fa.execute-api.us-east-1.amazonaws.com/observability';

  /**
   * buscarContratacoes
   */
  buscarContratacoes(empresa?: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/contratacoes?empresa=${empresa}`);
  }

  /**
   * buscarTaxaAprovacao
   */
  buscarTaxaAprovacao(empresa?: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/taxa-aprovacao?empresa=${empresa}`);
  }

  buscarDocumentosPorTipo(empresa?: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/documentos-por-tipo?empresa=${empresa}`);
  }

}
