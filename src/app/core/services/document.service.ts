import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private http = inject(HttpClient);
  private apiUrl = '/api/upload-document'; // Replace with your actual API endpoint

  uploadDocument(file: File) {
    const formData = new FormData();
    formData.append('document', file, file.name);

    return this.http.post(this.apiUrl, formData, {
      reportProgress: true,
      observe: 'events'
    });
  }
}
