import { Component, OnInit, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

// PrimeNG imports
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputSwitchModule } from 'primeng/inputswitch';
import { DropdownModule } from 'primeng/dropdown';

// Services
import { ThemeService } from '../../core/services/theme.service';
import { TranslationService } from '../../core/services/translation.service';

// Components and pipes
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

// Animations
import { pageEnterAnimation } from '../../shared/animations';
import { MessageService } from 'primeng/api';
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
    DropdownModule,
    TranslatePipe
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  animations: [pageEnterAnimation]
})
export class HomeComponent implements OnInit {
  private messageService = inject(MessageService);
  private themeService = inject(ThemeService);
  private translationService = inject(TranslationService);
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

  showContactDialog = false;
  contato = {
    nome: '',
    email: '',
    empresa: '',
    plano: '',
    mensagem: ''
  };

  planos = [
    {
      nome: 'plans.start.name',
      perfil: 'plans.start.profile',
      contratacoesMes: 'até 10',
      documentosMes: 'até 100',
      preco: 'R$ 249,00',
      excedenteDoc: 'R$ 0,50',
      popular: false,
      features: [
        'plans.features.basicProcessing',
        'plans.features.emailSupport',
        'plans.features.simpleDashboard',
        'plans.features.upTo2Users'
      ]
    },
    {
      nome: 'plans.essencial.name',
      perfil: 'plans.essencial.profile',
      contratacoesMes: 'até 30',
      documentosMes: 'até 400',
      preco: 'R$ 599,00',
      excedenteDoc: 'R$ 0,40',
      popular: true,
      features: [
        'plans.features.advancedProcessing',
        'plans.features.prioritySupport',
        'plans.features.completeDashboard',
        'plans.features.upTo5Users',
        'plans.features.basicReports'
      ]
    },
    {
      nome: 'plans.pro.name',
      perfil: 'plans.pro.profile',
      contratacoesMes: 'até 100',
      documentosMes: 'até 1.500',
      preco: 'R$ 1.290,00',
      excedenteDoc: 'R$ 0,30',
      popular: false,
      features: [
        'plans.features.advancedAI',
        'plans.features.phoneSupport',
        'plans.features.customDashboard',
        'plans.features.unlimitedUsers',
        'plans.features.advancedReports',
        'plans.features.apiIntegrations'
      ]
    },
    {
      nome: 'plans.enterprise.name',
      perfil: 'plans.enterprise.profile',
      contratacoesMes: 'ilimitado',
      documentosMes: 'até 5.000',
      preco: 'R$ 2.990,00',
      excedenteDoc: 'R$ 0,20',
      popular: false,
      features: [
        'plans.features.customSolution',
        'plans.features.support24x7',
        'plans.features.enterpriseDashboard',
        'plans.features.unlimitedUsers',
        'plans.features.customReports',
        'plans.features.slaGuaranteed'
      ]
    }
  ];

  enviarContato() {
    this.messageService.add({
      severity: 'success',
      summary: 'Contato enviado',
      detail: 'Sua mensagem foi enviada com sucesso! Em breve entraremos em contato.'
    });
    
    // Reset do formulário
    this.resetForm();
  }

  resetForm() {
    this.contato = { nome: '', email: '', empresa: '', plano: '', mensagem: '' };
  }

  selecionarPlano(plano: any) {
    // Pré-selecionar o plano no formulário de contato
    this.contato.plano = plano.nome;
    
    this.messageService.add({
      severity: 'info',
      summary: 'Plano selecionado',
      detail: `Você selecionou o plano ${this.translationService.translate(plano.nome)}. Role para baixo para entrar em contato.`
    });
    
    // Rolar para a seção de contato
    setTimeout(() => {
      const contactSection = document.querySelector('.contact-section');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  }

  get planosOptions() {
    return this.planos.map(plano => ({
      label: `${this.translationService.translate(plano.nome)} - ${plano.preco}`,
      value: plano.nome
    }));
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