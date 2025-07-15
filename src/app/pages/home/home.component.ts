import { Component, OnInit, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

// PrimeNG imports
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputSwitchModule } from 'primeng/inputswitch';

// Services
import { ThemeService } from '../../core/services/theme.service';

// Components and pipes
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

// Animations
import { pageEnterAnimation } from '../../shared/animations';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    InputSwitchModule,
    TranslatePipe
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  animations: [pageEnterAnimation]
})
export class HomeComponent implements OnInit {
  isAtBottom = false;

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    const windowHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    const docHeight = Math.max(
      document.body.scrollHeight, document.documentElement.scrollHeight,
      document.body.offsetHeight, document.documentElement.offsetHeight,
      document.body.clientHeight, document.documentElement.clientHeight
    );
    // Consider at bottom if within 10px of the bottom
    this.isAtBottom = (scrollTop + windowHeight) >= (docHeight - 10);
  }

  toggleScroll() {
    if (this.isAtBottom) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
  }
  private themeService = inject(ThemeService);

  showContactDialog = false;
  contato = {
    nome: '',
    email: '',
    empresa: '',
    mensagem: ''
  };

  enviarContato() {
    // Aqui você pode implementar o envio para API ou serviço de email
    // Exemplo: console.log(this.contato);
    alert('Mensagem enviada com sucesso!');
    this.showContactDialog = false;
    this.contato = { nome: '', email: '', empresa: '', mensagem: '' };
  }
  
  isDarkMode = false;

  ngOnInit(): void {
    // Subscribe to theme changes
    this.themeService.isDarkMode$.subscribe(isDark => {
      this.isDarkMode = isDark;
    });
  }

  /**
   * Change the theme color palette
   */
  changeTheme(colorTheme: string): void {
  const root = document.documentElement;
  const darkRoot = document.body.classList.contains('dark-theme') ? document.body : null;

  const setVars = (el: HTMLElement) => {
    switch (colorTheme) {
      case 'red':
        el.style.setProperty('--primary-color', '#E60012');
        el.style.setProperty('--primary-color-dark', '#C4000F');
        el.style.setProperty('--primary-color-light', '#FF1A2B');
        break;
      case 'blue':
        el.style.setProperty('--primary-color', '#2196F3');
        el.style.setProperty('--primary-color-dark', '#1976D2');
        el.style.setProperty('--primary-color-light', '#42A5F5');
        break;
      case 'green':
        el.style.setProperty('--primary-color', '#4CAF50');
        el.style.setProperty('--primary-color-dark', '#388E3C');
        el.style.setProperty('--primary-color-light', '#66BB6A');
        break;
      case 'purple':
        el.style.setProperty('--primary-color', '#9C27B0');
        el.style.setProperty('--primary-color-dark', '#7B1FA2');
        el.style.setProperty('--primary-color-light', '#BA68C8');
        break;
    }
  };

  setVars(root);
  if (darkRoot) setVars(darkRoot);

  // Update alpha variants for both
  this.updateAlphaVariants();
  if (darkRoot) this.updateAlphaVariants(darkRoot);

  this.updateActiveColorButton(colorTheme);
}

  /**
   * Toggle dark mode
   */
  toggleDarkMode(): void {
    this.themeService.toggleDarkMode(this.isDarkMode);
  }

  /**
   * Update alpha color variants when primary color changes
   */
  private updateAlphaVariants(el: HTMLElement = document.documentElement): void {
    const primaryColor = getComputedStyle(el).getPropertyValue('--primary-color').trim();
    // Convert hex to rgb
    const hex = primaryColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    // Set alpha variants
    el.style.setProperty('--primary-alpha-5', `rgba(${r}, ${g}, ${b}, 0.05)`);
    el.style.setProperty('--primary-alpha-10', `rgba(${r}, ${g}, ${b}, 0.1)`);
    el.style.setProperty('--primary-alpha-15', `rgba(${r}, ${g}, ${b}, 0.15)`);
    el.style.setProperty('--primary-alpha-20', `rgba(${r}, ${g}, ${b}, 0.2)`);
    el.style.setProperty('--primary-alpha-25', `rgba(${r}, ${g}, ${b}, 0.25)`);
    el.style.setProperty('--primary-alpha-30', `rgba(${r}, ${g}, ${b}, 0.3)`);
    el.style.setProperty('--primary-alpha-35', `rgba(${r}, ${g}, ${b}, 0.35)`);
    el.style.setProperty('--primary-alpha-40', `rgba(${r}, ${g}, ${b}, 0.4)`);
    el.style.setProperty('--hover-bg', `rgba(${r}, ${g}, ${b}, 0.04)`);
  }

  /**
   * Update active color button visual state
   */
  private updateActiveColorButton(activeColor: string): void {
    // Remove active class from all color buttons
    document.querySelectorAll('.color-btn').forEach(btn => {
      btn.classList.remove('active');
    });

    // Add active class to selected color button
    const activeBtn = document.querySelector(`.color-btn.${activeColor}`);
    if (activeBtn) {
      activeBtn.classList.add('active');
    }
  }


}


/**
 * Redireciona para a documentação oficial de Angular, PrimeNG ou PrimeFlex
 */
// redirectToDoc(lib: 'angular' | 'primeng' | 'primeflex'): void {
//   let url = '';
//   switch (lib) {
//     case 'angular':
//       url = 'https://v19.angular.dev/overview';
//       break;
//     case 'primeng':
//       url = 'https://primeng.org/';
//       break;
//     case 'primeflex':
//       url = 'https://www.primefaces.org/primeflex/';
//       break;
//   }
//   window.open(url, '_blank');
// }