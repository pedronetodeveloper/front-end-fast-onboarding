import { Injectable, Renderer2, RendererFactory2, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

export interface ThemeOption {
  name: string;
  displayName: string;
  isDark: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private renderer: Renderer2;
  private colorScheme: string = '';
  
  // Available themes
  public themes: ThemeOption[] = [
    { name: 'lara-light-blue', displayName: 'Light Mode', isDark: false },
    { name: 'lara-dark-blue', displayName: 'Dark Mode', isDark: true },
    { name: 'bootstrap4-light-blue', displayName: 'Bootstrap Light', isDark: false },
    { name: 'bootstrap4-dark-blue', displayName: 'Bootstrap Dark', isDark: true },
    { name: 'md-light-indigo', displayName: 'Material Light', isDark: false },
    { name: 'md-dark-indigo', displayName: 'Material Dark', isDark: true }
  ];

  // Current theme observable
  private currentThemeSubject = new BehaviorSubject<ThemeOption>(this.themes[0]);
  public currentTheme$ = this.currentThemeSubject.asObservable();

  // Dark mode state
  private isDarkModeSubject = new BehaviorSubject<boolean>(false);
  public isDarkMode$ = this.isDarkModeSubject.asObservable();

  constructor(
    private rendererFactory: RendererFactory2,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.renderer = this.rendererFactory.createRenderer(null, null);
    this.initializeTheme();
  }

  private initializeTheme(): void {
    // Remove any existing PrimeNG theme links
    const existingThemeLinks = this.document.querySelectorAll('link[data-theme]');
    existingThemeLinks.forEach(link => link.remove());

    // Check for saved theme in localStorage
    const savedTheme = localStorage.getItem('app-theme');
    const savedDarkMode = localStorage.getItem('app-dark-mode') === 'true';
    
    // Check system preference if no saved theme
    if (!savedTheme) {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.toggleDarkMode(prefersDark);
    } else {
      const theme = this.themes.find(t => t.name === savedTheme) || this.themes[0];
      this.switchTheme(theme);
      this.isDarkModeSubject.next(savedDarkMode);
    }

    // Listen for system theme changes
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('app-theme')) {
          this.toggleDarkMode(e.matches);
        }
      });
    }
  }

  public switchTheme(theme: ThemeOption): void {
    // Update observables
    this.currentThemeSubject.next(theme);
    this.isDarkModeSubject.next(theme.isDark);

    // Update body class (CSS variables are handled by styles.scss)
    this.updateBodyClass(theme.isDark);

    // Save to localStorage
    localStorage.setItem('app-theme', theme.name);
    localStorage.setItem('app-dark-mode', theme.isDark.toString());
  }

  public toggleDarkMode(forceDark?: boolean): void {
    const currentTheme = this.currentThemeSubject.value;
    const shouldBeDark = forceDark !== undefined ? forceDark : !currentTheme.isDark;
    
    // Find corresponding light/dark theme
    const newTheme = shouldBeDark 
      ? this.themes.find(t => t.isDark && t.name.includes('lara')) || this.themes[1]
      : this.themes.find(t => !t.isDark && t.name.includes('lara')) || this.themes[0];
    
    this.switchTheme(newTheme);
  }

  private updateBodyClass(isDark: boolean): void {
    if (isDark) {
      this.renderer.addClass(this.document.body, 'dark-theme');
      this.renderer.removeClass(this.document.body, 'light-theme');
    } else {
      this.renderer.addClass(this.document.body, 'light-theme');
      this.renderer.removeClass(this.document.body, 'dark-theme');
    }
  }

  public getCurrentTheme(): ThemeOption {
    return this.currentThemeSubject.value;
  }

  public isDarkMode(): boolean {
    return this.isDarkModeSubject.value;
  }
}
