import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { AuthService, AuthUser } from '../../core/services/auth.service';
import { LocalStorageService } from '../../core/services/local-storage.service';
import { Usuario } from '../../shared/interface/usuario.interface';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { HttpEventType } from '@angular/common/http';
import { DocumentService } from '../../core/services/document.service';
import { UploadDocumentModalComponent } from './upload-document-modal/upload-document-modal.component'; // Import the new modal component

// PrimeNG Modules for the modal
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-acompanhamento-documentos',
  templateUrl: './acompanhamento-documentos.component.html',
  styleUrls: ['./acompanhamento-documentos.component.scss'],
  standalone: true,
  imports: [CommonModule, TranslatePipe, NgClass, UploadDocumentModalComponent, DialogModule, ButtonModule, DropdownModule, FormsModule]
})
export class AcompanhamentoDocumentosComponent implements OnInit {
  user: AuthUser | null = null;
  documentos: { nome: string; tipo: string; status: 'valido' | 'invalido' | 'pendente' }[] = [];
  uploadProgress: number = 0;
  uploadMessage: string = '';
  displayUploadModal: boolean = false; // Control modal visibility

  private authService = inject(AuthService);
  private localStorageService = inject(LocalStorageService);
  private documentService = inject(DocumentService);

  get isCurrentUserHR(): boolean {
    return this.authService.getRole() === 'rh';
  }

  ngOnInit(): void {
    this.user = this.authService.getUser();
    this.atualizarDocumentos();
  }

  atualizarDocumentos(): void {
    if (this.user?.role === 'candidato') {
      const candidatos = this.localStorageService.getItem<Usuario>('candidatos');
      const candidato = candidatos.find(u => u.email === this.user?.email);
      this.documentos = candidato?.documentos || [];
    }
  }

  getStatusCount(status: 'valido' | 'invalido' | 'pendente'): number {
    return this.documentos.filter(doc => doc.status === status).length;
  }

  onAttachDocuments(): void {
    this.displayUploadModal = true; // Open the modal
  }

  onDocumentUploaded(event: { file: File, documentType: string }): void {
    const { file, documentType } = event;

    if (file && documentType) {
      this.uploadMessage = `Uploading ${file.name} (${documentType})...`;
      this.uploadProgress = 0;

      this.documentService.uploadDocument(file).subscribe({
        next: (event) => {
          if (event.type === HttpEventType.UploadProgress) {
            this.uploadProgress = Math.round(100 * (event.loaded / event.total!));
          } else if (event.type === HttpEventType.Response) {
            this.uploadMessage = `Upload of ${file.name} successful!`;
            console.log('File uploaded successfully:', event.body);
            // Here you might want to update the documents list or show a success message
            this.atualizarDocumentos(); // Refresh documents after upload
          }
        },
        error: (err) => {
          this.uploadMessage = `Upload of ${file.name} failed.`;
          console.error('Upload error:', err);
          // Handle error, show error message to user
        },
        complete: () => {
          // Optional: clear progress bar after a delay
          setTimeout(() => {
            this.uploadProgress = 0;
            this.uploadMessage = '';
          }, 3000);
        }
      });
    }
  }
}
