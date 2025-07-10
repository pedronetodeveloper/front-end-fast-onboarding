import { Component, OnInit, OnDestroy, inject, ViewChild } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import { Subject, filter, takeUntil } from "rxjs";

// MSAL imports
import { MsalService, MsalBroadcastService } from "@azure/msal-angular";
import { InteractionStatus, PopupRequest } from "@azure/msal-browser";

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
  ],
  templateUrl: "./navbar.component.html",
  styleUrls: ["./navbar.component.scss"],
})
export class NavbarComponent implements OnInit, OnDestroy {
  @ViewChild("userMenu") userMenu!: Menu;

  isLoggedIn = false;
  displayName = "";
  userInitials = "";
  isMobile = false;
  userMenuItems: MenuItem[] = [];
  isMenuOpen = false;
  isLanguageSubmenuOpen = false;

  // Mapa das flags dos idiomas
  languageFlags: { [key: string]: string } = {
    pt: "assets/images/flags/br.svg",
    en: "assets/images/flags/us.svg",
    es: "assets/images/flags/es.svg",
  };

  private readonly destroy$ = new Subject<void>();
  private msalService = inject(MsalService);
  private msalBroadcastService = inject(MsalBroadcastService);
  private router = inject(Router);
  private sidebarService = inject(SidebarService);
  private authService = inject(AuthService);
  public themeService = inject(ThemeService);
  private translationService = inject(TranslationService);

  ngOnInit(): void {
    this.setLoginDisplay();
    this.setupAuthListener();
    this.initializeUserMenu();
    this.setupLanguageListener();
    this.setupClickOutsideListener();
    this.checkMobile();
    window.addEventListener("resize", () => this.checkMobile());
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
    const accounts = this.msalService.instance.getAllAccounts();
    this.isLoggedIn = accounts.length > 0;

    if (this.isLoggedIn && accounts[0]) {
      const account = accounts[0];
      this.displayName = account.name || account.username || "Usuário";

      // Get initials from display name
      const nameParts = this.displayName.split(" ");
      this.userInitials =
        nameParts.length > 1
          ? (nameParts[0][0] + nameParts[1][0]).toUpperCase()
          : nameParts[0].substring(0, 2).toUpperCase();
    }
  }

  login(): void {
    const loginRequest: PopupRequest = {
      scopes: ["openid", "profile", "User.Read"],
    };

    this.msalService.loginPopup(loginRequest).subscribe({
      next: (result) => {
        this.setLoginDisplay();
        this.router.navigate(["/home"]);
      },
      error: (error: any) => {
        console.error("Login failed:", error);
      },
    });
  }

  logout(): void {
    console.log("Navbar: Starting logout...");

    this.authService.logoutPopup().subscribe({
      next: () => {
        console.log("Navbar: Logout successful");
        // A navegação será feita automaticamente pelo AppComponent
        // que está escutando mudanças de estado de autenticação
      },
      error: (error: any) => {
        console.error("Navbar: Logout failed:", error);
        // Em caso de erro, tentar redirecionar manualmente
        this.router.navigate(["/login"]);
      },
    });
  }

  private setupAuthListener(): void {
    this.msalBroadcastService.inProgress$
      .pipe(
        filter(
          (status: InteractionStatus) => status === InteractionStatus.None
        ),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.setLoginDisplay();
      });
  }

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
