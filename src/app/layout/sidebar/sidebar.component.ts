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
    { labelKey: 'nav.home', icon: 'pi pi-home', route: '/home', requiresAuth: false }, // Added home route
    { labelKey: 'nav.acompanhamento', icon: 'pi pi-file', route: '/acompanhamento-documentos', requiresAuth: true },
    { labelKey: 'nav.usuarios', icon: 'pi pi-users', route: '/candidatos', requiresAuth: true }, // Cadastro de Candidato
    { labelKey: 'nav.observability', icon: 'pi pi-chart-bar', route: '/observabilidade', requiresAuth: false }, // New Observability item - requiresAuth changed to false
    { labelKey: 'nav.empresas', icon: 'pi pi-building', route: '/empresas', requiresAuth: true }, // Cadastro de Empresa
    { labelKey: 'nav.users-plataform', icon: 'pi pi-users', route: '/controle-acessos', requiresAuth: true }, // Cadastro de Usuários
  ];

  menuItems: SidebarMenuItem[] = [];

  ngOnInit(): void {
    this.checkScreenSize();
    this.setupResizeListener();
    this.setupSidebarStateListener();
    this.updateMenuByRole();
    // Atualiza menu quando status de autenticação muda
    this.authService.isAuthenticated$.subscribe(() => {
      this.updateMenuByRole();
    });
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
    } else { // Added else block to handle desktop case
      this.sidebarVisible = false; // Ensure sidebar is collapsed on desktop initially
    }
    // The logic for handling wasMobile is in onResize, which is called by the event listener.
    // This method only sets the initial state.
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

    // Make a deep copy to avoid modifying the original array
    let menuItems = JSON.parse(JSON.stringify(this.allMenuItems));

    if (user && user.role === 'rh') {
      const homeItem = menuItems.find((item: SidebarMenuItem) => item.route === '/home');
      if (homeItem) {
        homeItem.route = '/sobre-nos';
      }
    }

    // Start with public routes
    const publicRoutes = menuItems.filter((item: SidebarMenuItem) => !item.requiresAuth);

    if (!user) {
      this.menuItems = publicRoutes;
      return;
    }

    let roleBasedRoutes: SidebarMenuItem[] = [];
    if (user.role === 'admin') {
      // Admin can see company and user registration (sem observabilidade)
      roleBasedRoutes = menuItems.filter((item: SidebarMenuItem) =>
        ['/empresas', '/controle-acessos'].includes(item.route)
      );
    } else if (user.role === 'rh') {
      // HR can see document tracking, candidate registration and observability
      roleBasedRoutes = menuItems.filter((item: SidebarMenuItem) =>
        ['/acompanhamento-documentos', '/candidatos', '/observabilidade'].includes(item.route)
      );
    } else if (user.role === 'candidato') {
      // Candidato só pode ver acompanhamento de documentos
      roleBasedRoutes = menuItems.filter((item: SidebarMenuItem) =>
        item.route === '/acompanhamento-documentos'
      );
    }

    // Se logado, mostra apenas rotas do papel; se não, só públicas
    if (user) {
      this.menuItems = roleBasedRoutes;
    } else {
      this.menuItems = publicRoutes;
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
