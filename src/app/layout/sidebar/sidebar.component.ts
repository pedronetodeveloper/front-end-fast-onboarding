import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Subject, filter, takeUntil } from 'rxjs';

// MSAL imports
import { MsalService, MsalBroadcastService } from '@azure/msal-angular';
import { InteractionStatus } from '@azure/msal-browser';

// PrimeNG imports
import { SidebarModule } from 'primeng/sidebar';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { TooltipModule } from 'primeng/tooltip';
import { BadgeModule } from 'primeng/badge';

// Services
import { ThemeService } from '../../core/services/theme.service';
import { SidebarService } from '../../core/services/sidebar.service';
import { TranslationService } from '../../core/services/translation.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

// Components and pipes

export interface SidebarMenuItem {
  labelKey: string; // Changed to use translation key
  icon: string;
  route: string;
  badge?: string;
  badgeClass?: string;
  description?: string;
  requiresAuth?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    SidebarModule,
    ButtonModule,
    MenuModule,
    TooltipModule,
    BadgeModule,
    TranslatePipe
  ],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit, OnDestroy {
  sidebarVisible = false; // Inicialmente colapsada no desktop
  hoverExpanded = false; // Nova propriedade para hover
  isMobile = false;
  isLoggedIn = false;
  displayName = '';
  
  private readonly destroy$ = new Subject<void>();
  private msalService = inject(MsalService);
  private msalBroadcastService = inject(MsalBroadcastService);
  private router = inject(Router);
  private themeService = inject(ThemeService);
  private sidebarService = inject(SidebarService);
  private translationService = inject(TranslationService);

  menuItems: SidebarMenuItem[] = [
    {
      labelKey: 'nav.home',
      icon: 'pi pi-home',
      route: '/home',
      requiresAuth: true
    },
    {
      labelKey: 'nav.usuarios',
      icon: 'pi pi-users',
      route: '/usuario',
      requiresAuth: true
    },
    {
      labelKey: 'nav.cursos',
      icon: 'pi pi-book',
      route: '/curso',
      requiresAuth: true
    }
  ];

  ngOnInit(): void {
    this.checkScreenSize();
    this.setupResizeListener();
    this.setupAuthListener();
    this.setupSidebarStateListener();
    this.setLoginDisplay();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    window.removeEventListener('resize', this.onResize.bind(this));
  }

  private checkScreenSize(): void {
    this.isMobile = window.innerWidth < 768;
    if (this.isMobile) {
      this.sidebarVisible = false;
      this.hoverExpanded = false;
    } else {
      // No desktop, sidebar sempre colapsada por padrão
      this.sidebarVisible = false;
    }
    
    // Atualizar o serviço com o estado atual
    this.sidebarService.updateSidebarState({
      visible: this.sidebarVisible,
      hoverExpanded: this.hoverExpanded,
      isMobile: this.isMobile
    });
  }

  private setupResizeListener(): void {
    window.addEventListener('resize', this.onResize.bind(this));
  }

  private onResize(): void {
    const wasMobile = this.isMobile;
    this.isMobile = window.innerWidth < 768;
    
    // Se mudou de mobile para desktop, manter sidebar colapsada
    if (wasMobile && !this.isMobile) {
      this.sidebarVisible = false;
      this.hoverExpanded = false;
    }
    // Se mudou de desktop para mobile, recolher sidebar e hover
    else if (!wasMobile && this.isMobile) {
      this.sidebarVisible = false;
      this.hoverExpanded = false;
    }
  }

  onMouseEnter(): void {
    if (!this.isMobile && !this.sidebarVisible) {
      this.hoverExpanded = true;
      this.sidebarService.updateSidebarState({ 
        hoverExpanded: true 
      });
    }
  }

  onMouseLeave(): void {
    if (!this.isMobile) {
      this.hoverExpanded = false;
      this.sidebarService.updateSidebarState({ 
        hoverExpanded: false 
      });
    }
  }

  private setupAuthListener(): void {
    this.msalBroadcastService.inProgress$
      .pipe(
        filter((status: InteractionStatus) => status === InteractionStatus.None),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.setLoginDisplay();
      });
  }

  private setLoginDisplay(): void {
    const accounts = this.msalService.instance.getAllAccounts();
    this.isLoggedIn = accounts.length > 0;
    
    if (this.isLoggedIn && accounts[0]) {
      this.displayName = accounts[0].name || accounts[0].username || 'Usuário';
    }
  }

  private setupSidebarStateListener(): void {
    // Escutar mudanças no estado da sidebar vindas do SidebarService
    this.sidebarService.sidebarState$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.sidebarVisible = state.visible;
        this.hoverExpanded = state.hoverExpanded;
        this.isMobile = state.isMobile;
      });
  }

  toggleSidebar(): void {
    this.sidebarVisible = !this.sidebarVisible;
  }

  closeSidebar(): void {
    if (this.isMobile) {
      this.sidebarVisible = false;
    }
  }

  onMenuClick(item: SidebarMenuItem): void {
    // Verificar se requer autenticação
    if (item.requiresAuth && !this.isLoggedIn) {
      this.router.navigate(['/login']);
      return;
    }

    // Fechar sidebar no mobile após clique
    if (this.isMobile) {
      this.sidebarVisible = false;
    }

    // Navegar para a rota
    this.router.navigate([item.route]);
  }

  isActive(route: string): boolean {
    return this.router.url === route || this.router.url.startsWith(route + '/');
  }
}
