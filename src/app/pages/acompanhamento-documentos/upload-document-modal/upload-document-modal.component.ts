  
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
  @Input() documentos: any[] = [];
  @Input() isUploadBlockedFn?: (fileName?: string) => boolean;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() documentUploaded = new EventEmitter<{ file: File, documentType: string }>();

  selectedFile: File | null = null;
  fileInputRef?: HTMLInputElement;
  selectedDocumentType: DocumentType | null = null;
  documentTypes: DocumentType[] = [];
  private _visible: boolean = false;

  constructor() {}

  isTentativasLimitReached(): boolean {
    if (!this.selectedFile) return false;
    const normalize = (s: string) => s?.trim().toLowerCase();
    return this.documentos?.some(doc =>
      normalize(doc.nome_documento) === normalize(this.selectedFile!.name) && doc.tentativas === 3
    );
  }

  @Input()
  get visible(): boolean {
    return this._visible;
  }
  set visible(val: boolean) {
    this._visible = val;
    if (val === true) {
      // Reset ao abrir o modal
      this.selectedFile = null;
      this.selectedDocumentType = null;
    }
  }

  ngOnInit(): void {
    this.documentTypes = [
      { name: 'RG', code: 'RG' },
      { name: 'CPF', code: 'CPF' },
      { name: 'Comprovante de Residência', code: 'Comprovante de Residencia' },
      { name: 'Titulo de Eleitor', code: 'Titulo de eleitor' },
      { name: 'Carteira de Trabalho', code: 'Carteira de trabalho' }
    ];
  }

  ngOnChanges(): void {}

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
    this.fileInputRef = event.target as HTMLInputElement;
  }

  onUpload(): void {
    if (this.selectedFile && this.selectedDocumentType) {
      this.documentUploaded.emit({
        file: this.selectedFile,
        documentType: this.selectedDocumentType.code
      });
      // Reset file input after upload
      if (this.fileInputRef) {
        this.fileInputRef.value = '';
      }
      this.selectedFile = null;
    } else {
      alert('Por favor, selecione um arquivo e o tipo de documento.');
    }
  }

  hideDialog(): void {
    this.visible = false;
    this.visibleChange.emit(this.visible);
    this.selectedFile = null;
    this.selectedDocumentType = null;
    // Reset file input when closing dialog
    if (this.fileInputRef) {
      this.fileInputRef.value = '';
    }
  }
}
