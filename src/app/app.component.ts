import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { Subject, filter, takeUntil } from 'rxjs';


// PrimeNG imports
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { PrimeNG } from 'primeng/config';

// Components
import { NavbarComponent } from './layout/navbar/navbar.component';
import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { FooterComponent } from './layout/footer/footer.component';

// Services
import { AuthService } from './core/services/auth.service';
import { TranslationService } from './core/services/translation.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    ToastModule,
    NavbarComponent,
    SidebarComponent,
    FooterComponent
  ],
  providers: [MessageService],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'DocFlow';
  showNavigation = false;
  isSidebarVisible = false;

  private readonly destroy$ = new Subject<void>();
  private router = inject(Router);
  private authService = inject(AuthService);
  private primeNGConfig = inject(PrimeNG);
  private translationService = inject(TranslationService);

  ngOnInit(): void {
    console.log('AppComponent initialized');
    console.log('Initial URL:', this.router.url);
    
    // Initialize theme system
    this.initializeTheme();
    
    // Initialize PrimeNG translations
    this.initializePrimeNGTranslations();
    
    // Listen to language changes and update PrimeNG translations
    this.translationService.currentLanguage$
      .pipe(takeUntil(this.destroy$))
      .subscribe((language) => {
        this.updatePrimeNGTranslations(language);
      });
    
    // Check initial route to set navigation visibility
    this.updateNavigationVisibility(this.router.url);
    
    // Listen to route changes to show/hide navigation
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event: NavigationEnd) => {
        console.log('Route changed to:', event.url);
        this.updateNavigationVisibility(event.url);
        
        // Verificar autenticação em rotas protegidas
        this.checkAuthenticationForRoute(event.url);
      });

    // Listen to authentication state changes
    this.authService.isAuthenticated$
      .pipe(takeUntil(this.destroy$))
      .subscribe((isAuthenticated: boolean) => {
        console.log('Auth state changed:', isAuthenticated);
        // DESABILITADO: Não redireciona mais para login ao perder autenticação
        // if (!isAuthenticated && !this.isLoginPage()) {
        //   console.log('User logged out, redirecting to login');
        //   this.router.navigate(['/login']);
        // }
        // Atualizar visibilidade da navegação baseado na rota atual
        this.updateNavigationVisibility(this.router.url);
      });

  }

  private checkAuthenticationForRoute(url: string): void {
    // DESABILITADO: Permite acesso a todas as rotas sem autenticação
    // const protectedRoutes = ['/home'];
    // const isProtectedRoute = protectedRoutes.some(route => url.startsWith(route));
    // if (isProtectedRoute && !this.authService.isAuthenticated()) {
    //   console.log('Access denied to protected route. Redirecting to login.');
    //   this.router.navigate(['/login']);
    // }
  }

  private checkAuthenticationForCurrentRoute(): void {
    this.checkAuthenticationForRoute(this.router.url);
  }

  private updateNavigationVisibility(url: string): void {
    // Oculta navegação em /login e /definir-senha
    const isLoginOrDefinirSenhaRoute =
      url === '/login' || url.startsWith('/login') ||
      url === '/definir-senha' || url.startsWith('/definir-senha');
    this.showNavigation = !isLoginOrDefinirSenhaRoute;

    // Sidebar só visível se usuário autenticado
    const user = this.authService.getUser();
    this.isSidebarVisible = !!user;
  }

  isLoginPage(): boolean {
    const currentUrl = this.router.url;
    return currentUrl === '/login' || currentUrl.startsWith('/login');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeTheme(): void {
    // The theme service will automatically initialize itself
    console.log('Theme service initialized');
  }

  private initializePrimeNGTranslations(): void {
    const currentLanguage = this.translationService.getCurrentLanguage();
    this.updatePrimeNGTranslations(currentLanguage);
  }

  private updatePrimeNGTranslations(language: string): void {
    const primeNGTranslations = this.translationService.getPrimeNGTranslations(language);
    this.primeNGConfig.setTranslation(primeNGTranslations);
    console.log(`PrimeNG translations updated for language: ${language}`);
  }
}
