import { Component, OnInit, OnDestroy, inject, ViewChild } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router, RouterModule, NavigationEnd } from "@angular/router";
import { Subject, filter, takeUntil } from "rxjs";


// PrimeNG imports
import { ButtonModule } from "primeng/button";
import { AvatarModule } from "primeng/avatar";
import { TooltipModule } from "primeng/tooltip";
import { MenuModule } from "primeng/menu";
import { MenuItem } from "primeng/api";
import { Menu } from "primeng/menu";

// Services
import { SidebarService } from "../../core/services/sidebar.service";
import { AuthService } from "../../core/services/auth.service";
import { ThemeService } from "../../core/services/theme.service";
import { TranslationService } from "../../core/services/translation.service";

// Components and pipes
import { ThemeToggleComponent } from "../../shared/components/theme-toggle/theme-toggle.component";
import { LanguageSelectorComponent } from "../../shared/components/language-selector/language-selector.component";
import { TranslatePipe } from "../../shared/pipes/translate.pipe";

@Component({
  selector: "app-navbar",
  standalone: true,
    imports: [
    CommonModule,
    ButtonModule,
    AvatarModule,
    TooltipModule,
    MenuModule,
    ThemeToggleComponent,
    LanguageSelectorComponent,
    TranslatePipe,
    RouterModule,
  ],
  templateUrl: "./navbar.component.html",
  styleUrls: ["./navbar.component.scss"],
})
export class NavbarComponent implements OnInit, OnDestroy {
  isSidebarVisible = false;
  @ViewChild("userMenu") userMenu!: Menu;

  isLoggedIn = false;
  displayName = "";
  userInitials = "";
  isMobile = false;
  userMenuItems: MenuItem[] = [];
  isMenuOpen = false;
  isLanguageSubmenuOpen = false;
  isSobreNosPage = false;
  isAdmin = false;
  companyName = "";

  // Mapa das flags dos idiomas
  languageFlags: { [key: string]: string } = {
    pt: "assets/images/flags/br.svg",
    en: "assets/images/flags/us.svg",
    es: "assets/images/flags/es.svg",
  };

  private readonly destroy$ = new Subject<void>();
  private router = inject(Router);
  private sidebarService = inject(SidebarService);
  private authService = inject(AuthService);
  public themeService = inject(ThemeService);
  private translationService = inject(TranslationService);

  ngOnInit(): void {
    this.setLoginDisplay();
    this.authService.isAuthenticated$.pipe(takeUntil(this.destroy$)).subscribe(isAuth => {
      this.setLoginDisplay();
      this.updateSidebarState();
    });
    this.updateSidebarState();
    // this.setupAuthListener(); // MSAL removido
    this.initializeUserMenu();
    this.setupLanguageListener();
    this.setupClickOutsideListener();
    this.checkMobile();
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe((event: any) => {
      this.isSobreNosPage = event.urlAfterRedirects === '/sobre-nos';
    });
    window.addEventListener("resize", () => this.checkMobile());
  }

  private updateSidebarState(): void {
    // Sidebar só visível se usuário autenticado
    const user = this.authService.getUser();
    this.isSidebarVisible = !!user;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    window.removeEventListener("resize", () => this.checkMobile());
  }

  private checkMobile(): void {
    this.isMobile = window.innerWidth < 768;
  }

  toggleSidebar(): void {
    console.log("Toggle sidebar called"); // Debug log
    const currentState = this.sidebarService.getSidebarState();
    console.log("Current state:", currentState); // Debug log
    this.sidebarService.updateSidebarState({
      visible: !currentState.visible,
    });
  }

  private setLoginDisplay(): void {
    // Mock login: detecta pelo AuthService
    const user = this.authService.getUser();
    this.isLoggedIn = !!user;
    if (user) {
      this.displayName = user.name || user.email || "Usuário";
      const nameParts = this.displayName.split(" ");
      this.userInitials =
        nameParts.length > 1
          ? (nameParts[0][0] + nameParts[1][0]).toUpperCase()
          : nameParts[0].substring(0, 2).toUpperCase();
      
      // Definir se o usuário é admin e o nome da empresa
      this.isAdmin = user.role === 'admin';
      this.companyName = user.empresa || '';
    } else {
      this.displayName = "";
      this.userInitials = "";
      this.isAdmin = false;
      this.companyName = "";
    }
  }

  login(): void {
    this.router.navigate(["/login"]);
  }

  logout(): void {
    console.log("Navbar: Starting logout...");
    this.authService.logout();
  }

  // MSAL listener removido

  private initializeUserMenu(): void {
    this.userMenuItems = [
      {
        label: this.translationService.translate("nav.settings.section"),
        items: [
          {
            label: this.translationService.translate("nav.language"),
            icon: "pi pi-globe",
            items: [
              {
                label: "Português",
                command: () => this.changeLanguage("pt"),
              },
              {
                label: "English",
                command: () => this.changeLanguage("en"),
              },
            ],
          },
          {
            label: this.themeService.isDarkMode()
              ? this.translationService.translate("nav.theme.light")
              : this.translationService.translate("nav.theme.dark"),
            icon: this.themeService.isDarkMode() ? "pi pi-sun" : "pi pi-moon",
            command: () => this.toggleTheme(),
          },
        ],
      },
      {
        separator: true,
      },
      {
        label: this.translationService.translate("nav.logout"),
        icon: "pi pi-sign-out",
        command: () => this.logout(),
      },
    ];
  }

  toggleUserMenu(event: Event): void {
    event.stopPropagation();
    this.isMenuOpen = !this.isMenuOpen;
    this.isLanguageSubmenuOpen = false; // Fechar submenu quando abrir/fechar menu principal
  }

  toggleLanguageSubmenu(): void {
    this.isLanguageSubmenuOpen = !this.isLanguageSubmenuOpen;
  }

  public changeLanguage(lang: string): void {
    this.translationService.setLanguage(lang);
    this.initializeUserMenu(); // Atualizar menu com novo idioma
    this.closeMenu();
    window.location.reload();
  }

  public toggleTheme(): void {
    this.themeService.toggleDarkMode();
    this.initializeUserMenu(); // Atualizar menu com novo ícone de tema
    this.closeMenu();
  }

  private closeMenu(): void {
    this.isMenuOpen = false;
    this.isLanguageSubmenuOpen = false;
  }

  private setupClickOutsideListener(): void {
    document.addEventListener("click", () => {
      if (this.isMenuOpen) {
        this.closeMenu();
      }
    });
  }

  private setupLanguageListener(): void {
    this.translationService.currentLanguage$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.initializeUserMenu(); // Atualizar menu quando idioma mudar
      });
  }
}
