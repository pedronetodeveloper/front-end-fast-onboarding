import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService, ThemeOption } from '../../../core/services/theme.service';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule, ButtonModule, MenuModule],
  template: `
    <div class="theme-toggle-container">
      <!-- Simple Dark/Light Toggle -->
      <button 
        *ngIf="!showAdvanced"
        class="theme-toggle-btn"
        (click)="toggleDarkMode()"
        [title]="isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
        type="button">
        <i [class]="isDarkMode ? 'pi pi-sun' : 'pi pi-moon'"></i>
      </button>

      <!-- Advanced Theme Menu -->
      <div *ngIf="showAdvanced" class="advanced-theme-toggle">
        <p-button
          [icon]="currentTheme.isDark ? 'pi pi-moon' : 'pi pi-sun'"
          [text]="true"
          [rounded]="true"
          (click)="menu.toggle($event)"
          [title]="'Current theme: ' + currentTheme.displayName">
        </p-button>
        
        <p-menu 
          #menu 
          [model]="themeMenuItems" 
          [popup]="true"
          appendTo="body">
        </p-menu>
      </div>
    </div>
  `,
  styleUrls: ['./theme-toggle.component.scss']
})
export class ThemeToggleComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private themeService = inject(ThemeService);

  showAdvanced: boolean = false;
  isDarkMode: boolean = false;
  currentTheme: ThemeOption = this.themeService.getCurrentTheme();
  themeMenuItems: MenuItem[] = [];

  ngOnInit(): void {
    // Subscribe to theme changes
    this.themeService.isDarkMode$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isDark => {
        this.isDarkMode = isDark;
      });

    this.themeService.currentTheme$
      .pipe(takeUntil(this.destroy$))
      .subscribe(theme => {
        this.currentTheme = theme;
      });

    // Initialize menu items
    this.initializeMenuItems();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleDarkMode(): void {
    this.themeService.toggleDarkMode();
  }

  private initializeMenuItems(): void {
    this.themeMenuItems = [
      {
        label: 'Quick Toggle',
        items: [
          {
            label: this.isDarkMode ? 'Light Mode' : 'Dark Mode',
            icon: this.isDarkMode ? 'pi pi-sun' : 'pi pi-moon',
            command: () => this.toggleDarkMode()
          }
        ]
      },
      {
        separator: true
      },
      {
        label: 'Light Themes',
        items: this.themeService.themes
          .filter(theme => !theme.isDark)
          .map(theme => ({
            label: theme.displayName,
            icon: this.currentTheme.name === theme.name ? 'pi pi-check' : '',
            command: () => this.themeService.switchTheme(theme)
          }))
      },
      {
        label: 'Dark Themes',
        items: this.themeService.themes
          .filter(theme => theme.isDark)
          .map(theme => ({
            label: theme.displayName,
            icon: this.currentTheme.name === theme.name ? 'pi pi-check' : '',
            command: () => this.themeService.switchTheme(theme)
          }))
      }
    ];
  }

  enableAdvancedMode(): void {
    this.showAdvanced = true;
  }

  disableAdvancedMode(): void {
    this.showAdvanced = false;
  }
}
