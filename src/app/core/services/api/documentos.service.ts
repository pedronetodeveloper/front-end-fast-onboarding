import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Documento {
    id?: number | string;
    filename: string;
    document_type: string;
    email: string;
    file_content?: string;
    status: string;
}

@Injectable({
  providedIn: 'root'
})
export class DocumentosService {
  private http = inject(HttpClient);
  private apiUrl = 'https://3x8fg540pj.execute-api.us-east-1.amazonaws.com/candidatos';
  /**
   * Listar todos os documentos
   */
  listarDocumentos(email?: string): Observable<Documento[]> {
    if (!email) {
      const user = localStorage.getItem('user');
      email = user ? (JSON.parse(user).email as string | undefined) : undefined;
    }
    let params = new HttpParams();
    if (email) {
      params = params.set('email', email);
    }
    return this.http.get<Documento[]>(`${this.apiUrl}/documentos`, { params });
  }

  listarDocumentosRh(email?: string): Observable<Documento[]> {
    let params = new HttpParams();
    if (email) {
      params = params.set('email', email);
    }
    return this.http.get<Documento[]>(`${this.apiUrl}/documentos`, { params });
  }


  /**
   * Buscar documento por ID
   */
  buscarDocumento(id: string): Observable<Documento> {
    return this.http.get<Documento>(`${this.apiUrl}/${id}`);
  }

  /**
   * Deletar documento
   */
  deletarDocumento(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}`, { body: { id } });
  }

  /**
   * Cadastrar documento individualmente
   */
  cadastrarDocumento(documento: {
    filename: string;
    document_type: string;
    email: string;
    file_content: string;
  }): Observable<any> {
    // Endpoint correto para envio de documento
    const uploadUrl = 'https://6cn7ey72ak.execute-api.us-east-1.amazonaws.com/upload-doc-plataforma';
    return this.http.post<any>(uploadUrl, documento);
  }

  /**
   * Download de documento
   */
  downloadDocumento(filename: string): Observable<{
    download_url: string;
    filename: string;
    expires_in: number;
  }> {
    const downloadUrl = 'https://6cn7ey72ak.execute-api.us-east-1.amazonaws.com/download-doc-plataforma';
    const params = new HttpParams().set('filename', filename);
    
    return this.http.get<{
      download_url: string;
      filename: string;
      expires_in: number;
    }>(downloadUrl, { params });
  }

  /**
   * Aprovar documento
   */
  aprovarDocumento(nomeDocumento: string, emailCandidato: string): Observable<{
    message: string;
    nome_documento: string;
    email_candidato: string;
    status_anterior: string;
    status_atual: string;
    data_aprovacao: string;
  }> {
    const aprovarUrl = `${this.apiUrl}/documentos/aprovar`;
    const payload = {
      nome_documento: nomeDocumento,
      email_candidato: emailCandidato
    };
    
    return this.http.put<{
      message: string;
      nome_documento: string;
      email_candidato: string;
      status_anterior: string;
      status_atual: string;
      data_aprovacao: string;
    }>(aprovarUrl, payload);
  }





}