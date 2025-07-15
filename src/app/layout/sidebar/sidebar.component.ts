import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { SidebarModule } from 'primeng/sidebar';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { TooltipModule } from 'primeng/tooltip';
import { BadgeModule } from 'primeng/badge';
import { ThemeService } from '../../core/services/theme.service';
import { SidebarService } from '../../core/services/sidebar.service';
import { TranslationService } from '../../core/services/translation.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { AuthService } from '../../core/services/auth.service';

export interface SidebarMenuItem {
  labelKey: string;
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
  sidebarVisible = false;
  hoverExpanded = false;
  isMobile = false;
  isLoggedIn = false;
  displayName = '';
  private readonly destroy$ = new Subject<void>();
  private router = inject(Router);
  private themeService = inject(ThemeService);
  private sidebarService = inject(SidebarService);
  private translationService = inject(TranslationService);
  private authService = inject(AuthService);

  // Menu base
  private allMenuItems: SidebarMenuItem[] = [
    { labelKey: 'nav.upload', icon: 'pi pi-upload', route: '/upload-documentos', requiresAuth: true },
    { labelKey: 'nav.acompanhamento', icon: 'pi pi-file', route: '/acompanhamento-documentos', requiresAuth: true },
    { labelKey: 'nav.usuarios', icon: 'pi pi-users', route: '/candidatos', requiresAuth: true },
    { labelKey: 'nav.observability', icon: 'pi pi-chart-bar', route: '/observabilidade', requiresAuth: true },
    { labelKey: 'nav.empresas', icon: 'pi pi-building', route: '/empresas', requiresAuth: true },
    { labelKey: 'nav.users-plataform', icon: 'pi pi-users', route: '/controle-acessos', requiresAuth: true },
  ];

  menuItems: SidebarMenuItem[] = [];

  ngOnInit(): void {
    this.checkScreenSize();
    this.setupResizeListener();
    this.setupSidebarStateListener();
    this.updateMenuByRole();
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
      this.sidebarVisible = false;
    }
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

  private setupSidebarStateListener(): void {
    this.sidebarService.sidebarState$
      .subscribe(state => {
        this.sidebarVisible = state.visible;
        this.hoverExpanded = state.hoverExpanded;
        this.isMobile = state.isMobile;
      });
  }

  private updateMenuByRole(): void {
    const user = this.authService.getUser();
    this.isLoggedIn = !!user;
    this.displayName = user?.name || '';
    if (!user) {
      this.menuItems = [];
      return;
    }
    if (user.role === 'admin') {
      // Admin vê controle de empresas e usuários da plataforma
      this.menuItems = this.allMenuItems.filter(item =>
        ['/controle-acessos', '/empresas'].includes(item.route)
      );
    } else if (user.role === 'rh') {
      // RH vê candidatos e observabilidade
      this.menuItems = this.allMenuItems.filter(item =>
        ['/candidatos', '/observabilidade'].includes(item.route)
      );
    } else if (user.role === 'candidato') {
      // Candidato vê upload e acompanhamento de documentos
      this.menuItems = this.allMenuItems.filter(item =>
        ['/upload-documentos', '/acompanhamento-documentos'].includes(item.route)
      );
    } else {
      this.menuItems = [];
    }
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
    // Libera navegação para todas as rotas, mesmo sem autenticação
    if (this.isMobile) {
      this.sidebarVisible = false;
    }
    this.router.navigate([item.route]);
  }

  isActive(route: string): boolean {
    return this.router.url === route || this.router.url.startsWith(route + '/');
  }
}
