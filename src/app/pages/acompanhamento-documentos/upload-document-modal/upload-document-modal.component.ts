import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

interface DocumentType {
  name: string;
  code: string;
}

@Component({
  selector: 'app-upload-document-modal',
  standalone: true,
  imports: [CommonModule, DialogModule, ButtonModule, DropdownModule, FormsModule, TranslatePipe],
  templateUrl: './upload-document-modal.component.html',
  styleUrls: ['./upload-document-modal.component.scss']
})
export class UploadDocumentModalComponent implements OnInit {
  @Input() visible: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() documentUploaded = new EventEmitter<{ file: File, documentType: string }>();

  selectedFile: File | null = null;
  selectedDocumentType: DocumentType | null = null;
  documentTypes: DocumentType[] = [];

  ngOnInit(): void {
    this.documentTypes = [
      { name: 'RG', code: 'RG' },
      { name: 'CPF', code: 'CPF' },
      { name: 'Comprovante de Residência', code: 'COMP_RESIDENCIA' },
      { name: 'Comprovante de Renda', code: 'COMP_RENDA' },
      { name: 'Outros', code: 'OUTROS' }
    ];
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
  }

  onUpload(): void {
    if (this.selectedFile && this.selectedDocumentType) {
      this.documentUploaded.emit({
        file: this.selectedFile,
        documentType: this.selectedDocumentType.code
      });
      this.hideDialog();
    } else {
      // Optionally show a message to the user if fields are not filled
      alert('Por favor, selecione um arquivo e o tipo de documento.');
    }
  }

  hideDialog(): void {
    this.visible = false;
    this.visibleChange.emit(this.visible);
    this.resetForm();
  }

  resetForm(): void {
    this.selectedFile = null;
    this.selectedDocumentType = null;
    // Reset file input if possible (might require @ViewChild on the input itself)
  }
}
