import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { TranslationService, Language } from '../../../core/services/translation.service';

@Component({
  selector: 'app-language-selector',
  standalone: true,
  imports: [CommonModule, FormsModule, DropdownModule],
  templateUrl: './language-selector.component.html',
  styleUrls: ['./language-selector.component.scss']
})
export class LanguageSelectorComponent {
  languages: Language[] = [];
  selectedLanguage: Language | null = null;

  constructor(private translationService: TranslationService) {
    this.languages = this.translationService.getAvailableLanguages();
    const currentLang = this.translationService.getCurrentLanguage();
    this.selectedLanguage = this.languages.find(lang => lang.code === currentLang) || this.languages[0];
  }

  onLanguageChange(language: Language): void {
    if (language) {
      this.translationService.setLanguage(language.code);
      this.selectedLanguage = language;
    }
  }
}
