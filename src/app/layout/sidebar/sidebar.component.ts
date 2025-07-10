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
    { labelKey: 'nav.home', icon: 'pi pi-home', route: '/home', requiresAuth: true },
    { labelKey: 'nav.usuarios', icon: 'pi pi-users', route: '/usuario', requiresAuth: true },
    { labelKey: 'nav.cursos', icon: 'pi pi-book', route: '/curso', requiresAuth: true },
    { labelKey: 'nav.listaAcessos', icon: 'pi pi-list', route: '/lista-acessos', requiresAuth: true },
    { labelKey: 'nav.documentos', icon: 'pi pi-folder', route: '/documentos-contratado', requiresAuth: true },
    { labelKey: 'nav.upload', icon: 'pi pi-upload', route: '/upload-documentos', requiresAuth: true }
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
    // Libera todos os menus para desenvolvimento sem autenticação
    this.menuItems = this.allMenuItems;
    this.isLoggedIn = true;
    this.displayName = 'Dev';
    /*
    // Código original comentado para facilitar frontend sem backend
    const user = this.authService.getUser();
    this.isLoggedIn = !!user;
    this.displayName = user?.name || '';
    if (!user) {
      this.menuItems = [];
      return;
    }
    if (user.role === 'desenvolvedor') {
      this.menuItems = this.allMenuItems;
    } else if (user.role === 'rh') {
      this.menuItems = this.allMenuItems.filter(item =>
        ['/home', '/usuario', '/lista-acessos', '/documentos-contratado'].includes(item.route)
      );
    } else if (user.role === 'candidato') {
      this.menuItems = this.allMenuItems.filter(item =>
        ['/home', '/documentos-contratado', '/upload-documentos'].includes(item.route)
      );
    } else {
      this.menuItems = [];
    }
    */
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
