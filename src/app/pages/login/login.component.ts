import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

// MSAL imports
import { MsalService } from '@azure/msal-angular';

// PrimeNG imports
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

// Services
import { AuthService } from '../../core/services/auth.service';

// Components and pipes
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

// Animations
import { pageEnterAnimation } from '../../shared/animations';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    DividerModule,
    MessageModule,
    ProgressSpinnerModule,
    TranslatePipe,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  animations: [pageEnterAnimation]
})
export class LoginComponent implements OnInit {
  private msalService = inject(MsalService);
  private router = inject(Router);
  private authService = inject(AuthService);
  
  isLoggingIn = false;
  errorMessage = '';
  isMsalInitialized = false;
  private loginAttempts = 0;
  private maxLoginAttempts = 3;
  
  // Informações do localStorage
  lastLoginInfo: any = null;
  hasValidSession = false;

  ngOnInit(): void {
    console.log('LoginComponent initialized');
    
    // Carregar informações do localStorage
    this.loadStoredLoginInfo();
    
    this.initializeMsal();
    
    // Verificar e limpar estados inconsistentes periodicamente
    this.setupPeriodicCleanup();
  }

  private loadStoredLoginInfo(): void {
    this.lastLoginInfo = this.authService.getLoginInfo();
    this.hasValidSession = this.authService.hasValidSavedSession();
    
    console.log('Stored login info:', this.lastLoginInfo);
    console.log('Has valid session:', this.hasValidSession);
    
    if (this.lastLoginInfo) {
      console.log('Last login was at:', this.lastLoginInfo.lastLogin);
      console.log('User info:', this.lastLoginInfo.userInfo);
    }
  }

  private async initializeMsal(): Promise<void> {
    try {
      console.log('Initializing MSAL...');
      
      // Garantir que o MSAL está inicializado
      await this.msalService.instance.initialize();
      
      this.isMsalInitialized = true;
      console.log('MSAL initialized successfully');
      
      // Verificar se já está logado após inicialização
      this.checkIfAlreadyLoggedIn();
    } catch (error) {
      console.error('Error initializing MSAL:', error);
      this.errorMessage = 'Erro ao inicializar o sistema de autenticação. Recarregue a página.';
    }
  }

  private checkIfAlreadyLoggedIn(): void {
    if (!this.isMsalInitialized) {
      console.log('MSAL not initialized yet, skipping login check');
      return;
    }

    try {
      const accounts = this.msalService.instance.getAllAccounts();
      
      if (accounts.length > 0) {
        console.log('User already logged in, redirecting to home');
        this.router.navigate(['/home']);
      }
    } catch (error) {
      console.error('Error checking login status:', error);
    }
  }

  async login(): Promise<void> {
    if (this.isLoggingIn) {
      console.log('Login already in progress, ignoring click');
      return; // Evitar múltiplos cliques
    }

    if (!this.isMsalInitialized) {
      this.errorMessage = 'Sistema de autenticação ainda está carregando. Aguarde um momento.';
      return;
    }

    // Verificar se excedeu tentativas máximas
    if (this.loginAttempts >= this.maxLoginAttempts) {
      this.errorMessage = 'Muitas tentativas de login. Recarregue a página para tentar novamente.';
      return;
    }

    this.loginAttempts++;
    this.isLoggingIn = true;
    this.errorMessage = '';

    try {
      // Verificar se usuário já está logado
      const accounts = this.msalService.instance.getAllAccounts();
      if (accounts.length > 0) {
        console.log('User already logged in, redirecting...');
        this.router.navigate(['/home']);
        this.isLoggingIn = false;
        return;
      }

      // Verificar se há uma interação em progresso
      const interactionStatus = this.msalService.instance.getActiveAccount();
      if (interactionStatus) {
        console.log('Found active account, redirecting...');
        this.router.navigate(['/home']);
        this.isLoggingIn = false;
        return;
      }

      // Tentar limpar qualquer estado de interação em progresso
      await this.clearInteractionInProgressSafely();
      
      // Aguardar um pouco para garantir que o estado foi limpo
      await new Promise(resolve => setTimeout(resolve, 200));

      // Realizar o login
      await this.performLogin();
      
    } catch (error) {
      console.error('Error in login process:', error);
      this.isLoggingIn = false;
      this.handleLoginError(error);
    }
  }

  private async performLogin(): Promise<void> {
    const loginRequest = {
      scopes: ['User.Read', 'openid', 'profile'],
      prompt: 'select_account'
    };

    try {
      // Verificar se o MSAL está realmente pronto para uma nova interação
      await this.ensureMsalReadyState();
      
      const result = await this.msalService.loginPopup(loginRequest).toPromise();
      console.log('Login successful:', result);
      this.isLoggingIn = false;
      this.loginAttempts = 0; // Reset ao sucesso
      
      // Salvar informações adicionais de login no localStorage
      this.authService.saveLoginInfo({
        loginMethod: 'popup',
        browser: navigator.userAgent,
        loginTimestamp: new Date().toISOString(),
        sessionStarted: true
      });
      
      // Atualizar informações locais
      this.loadStoredLoginInfo();
      
      // Redirecionar para home após sucesso
      this.router.navigate(['/home']);
    } catch (error) {
      console.error('Login failed:', error);
      this.isLoggingIn = false;
      this.handleLoginError(error);
    }
  }

  private async ensureMsalReadyState(): Promise<void> {
    try {
      // Verificar se há alguma interação em progresso através de múltiplos métodos
      const accounts = this.msalService.instance.getAllAccounts();
      
      // Se já tem contas, usuário pode estar logado
      if (accounts.length > 0) {
        console.log('User might already be logged in');
        throw new Error('User already authenticated');
      }
      
      // Verificar estado interno do MSAL de forma mais robusta
      const browserStorage = this.msalService.instance.getConfiguration().cache?.cacheLocation || 'sessionStorage';
      const storage = browserStorage === 'sessionStorage' ? sessionStorage : localStorage;
      
      // Procurar indicadores de interação em progresso
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key && key.includes('msal') && (
          key.includes('interaction') || 
          key.includes('temp') ||
          key.includes('request') ||
          key.includes('popup')
        )) {
          const value = storage.getItem(key);
          if (value && value.includes('in_progress')) {
            console.log(`Found stuck interaction state: ${key}`);
            throw new Error('interaction_in_progress_detected');
          }
        }
      }
      
      console.log('MSAL state appears clean for new interaction');
    } catch (error: any) {
      if (error?.message === 'User already authenticated') {
        this.router.navigate(['/home']);
        return;
      }
      if (error?.message === 'interaction_in_progress_detected') {
        await this.clearInteractionInProgressSafely();
        // Aguardar um pouco após limpeza
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      throw error;
    }
  }

  private handleLoginError(error: any): void {
    console.error('Handling login error:', error);
    
    // Exibir mensagem de erro amigável
    if (error?.errorCode === 'user_cancelled') {
      this.errorMessage = 'Login cancelado pelo usuário.';
    } else if (error?.errorCode === 'popup_window_error') {
      this.errorMessage = 'Erro ao abrir janela de login. Verifique se popups estão habilitados.';
    } else if (error?.errorCode === 'uninitialized_public_client_application') {
      this.errorMessage = 'Sistema de autenticação não inicializado. Recarregue a página.';
    } else if (error?.errorCode === 'interaction_in_progress') {
      this.errorMessage = 'Uma autenticação já está em andamento. Aguarde alguns segundos.';
      // Tentar limpar o estado e permitir nova tentativa
      setTimeout(async () => {
        await this.clearInteractionInProgressSafely();
        this.errorMessage = 'Você pode tentar fazer login novamente agora.';
      }, 3000);
    } else if (error?.message?.includes('initialize')) {
      this.errorMessage = 'Sistema de autenticação não está pronto. Aguarde e tente novamente.';
    } else if (error?.message?.includes('interaction')) {
      this.errorMessage = 'Conflito de autenticação detectado. Aguarde alguns segundos e tente novamente.';
      // Auto-retry após limpar estado
      setTimeout(async () => {
        await this.clearInteractionInProgressSafely();
        this.errorMessage = '';
      }, 2000);
    } else {
      this.errorMessage = 'Erro ao fazer login. Tente novamente ou entre em contato com o suporte.';
    }
  }

  reloadPage(): void {
    // Resetar tentativas ao recarregar
    this.loginAttempts = 0;
    window.location.reload();
  }

  private setupPeriodicCleanup(): void {
    // Verificar e limpar estados problemáticos a cada 30 segundos
    setInterval(() => {
      if (!this.isLoggingIn && this.isMsalInitialized) {
        this.detectAndCleanStuckStates();
      }
    }, 30000);
  }

  private detectAndCleanStuckStates(): void {
    try {
      const browserStorage = this.msalService.instance.getConfiguration().cache?.cacheLocation || 'sessionStorage';
      const storage = browserStorage === 'sessionStorage' ? sessionStorage : localStorage;
      
      // Procurar por chaves que indicam estados problemáticos
      let hasStuckStates = false;
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key && (
          key.includes('msal.interaction') ||
          key.includes('msal.temp') ||
          key.includes('interaction_in_progress')
        )) {
          console.log(`Detected stuck state: ${key}`);
          hasStuckStates = true;
          break;
        }
      }
      
      if (hasStuckStates) {
        console.log('Cleaning stuck MSAL states...');
        this.clearInteractionInProgress();
      }
    } catch (error) {
      console.warn('Error detecting stuck states:', error);
    }
  }

  private async clearInteractionInProgressSafely(): Promise<void> {
    try {
      console.log('Clearing interaction in progress state...');
      
      // Primeiro, tentar usar a API oficial do MSAL se disponível
      if (this.msalService.instance && typeof this.msalService.instance.clearCache === 'function') {
        await this.msalService.instance.clearCache();
      }
      
      // Limpar estados de sessão específicos do MSAL
      const browserStorage = this.msalService.instance.getConfiguration().cache?.cacheLocation;
      
      if (browserStorage === 'sessionStorage') {
        // Remover chaves específicas de interação em progresso
        const keysToRemove: string[] = [];
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          if (key && (
            key.includes('interaction') || 
            key.includes('temp') ||
            key.includes('msal.interaction') ||
            key.includes('msal.request') ||
            key.includes('popup')
          )) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => {
          console.log(`Removing session key: ${key}`);
          sessionStorage.removeItem(key);
        });
      } else if (browserStorage === 'localStorage') {
        // Similar para localStorage
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (
            key.includes('interaction') || 
            key.includes('temp') ||
            key.includes('msal.interaction') ||
            key.includes('msal.request') ||
            key.includes('popup')
          )) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => {
          console.log(`Removing local key: ${key}`);
          localStorage.removeItem(key);
        });
      }
      
      console.log('Successfully cleared interaction state');
      
    } catch (error) {
      console.warn('Error clearing interaction state:', error);
      // Fallback: apenas registrar erro mas não falhar
    }
  }

  private clearInteractionInProgress(): void {
    this.clearInteractionInProgressSafely().catch(error => {
      console.warn('Error in clearInteractionInProgress:', error);
    });
  }

  retryLogin(): void {
    console.log('Retrying login...');
    this.errorMessage = '';
    this.isLoggingIn = false;
    
    // Aguardar um pouco antes de tentar novamente
    setTimeout(() => {
      this.login();
    }, 500);
  }

  async forceCleanAndRetry(): Promise<void> {
    console.log('Force cleaning and retrying login...');
    this.errorMessage = '';
    this.isLoggingIn = false;
    this.loginAttempts = 0; // Resetar tentativas
    
    try {
      // Limpeza forçada mais agressiva
      await this.clearInteractionInProgressSafely();
      
      // Limpar também cache do MSAL se possível
      if (this.msalService.instance && typeof this.msalService.instance.clearCache === 'function') {
        await this.msalService.instance.clearCache();
      }
      
      // Aguardar mais tempo para garantir limpeza completa
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      this.errorMessage = 'Estado limpo. Tentando login novamente...';
      
      setTimeout(() => {
        this.login();
      }, 1000);
    } catch (error) {
      console.error('Error in force clean:', error);
      this.errorMessage = 'Erro ao limpar estado. Tente recarregar a página.';
    }
  }

  quickLogin(): void {
    if (!this.hasValidSession) {
      this.errorMessage = 'Sessão não é mais válida. Faça login novamente.';
      return;
    }
    
    console.log('Quick login attempted');
    // Se há sessão válida, verificar se o usuário ainda está autenticado
    if (this.authService.isAuthenticated()) {
      console.log('User still authenticated, redirecting to home');
      this.router.navigate(['/home']);
    } else {
      console.log('Session expired, requiring new login');
      this.errorMessage = 'Sessão expirou. Nova autenticação necessária.';
      this.hasValidSession = false;
    }
  }

  formatLastLogin(loginTime: string): string {
    if (!loginTime) return 'Desconhecido';
    
    const loginDate = new Date(loginTime);
    const now = new Date();
    const diffMs = now.getTime() - loginDate.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffMinutes < 60) {
      return `${diffMinutes} minuto${diffMinutes !== 1 ? 's' : ''} atrás`;
    } else if (diffHours < 24) {
      return `${diffHours} hora${diffHours !== 1 ? 's' : ''} atrás`;
    } else {
      return loginDate.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }

  /**
   * Handle logo loading error and show fallback
   */
  onLogoError(event: any): void {
    console.warn('Logo failed to load, showing fallback');
    const target = event.target as HTMLImageElement;
    target.style.display = 'none';
    
    // Create fallback logo element
    const fallback = document.createElement('div');
    fallback.className = 'logo-placeholder';
    fallback.innerHTML = '<i class="pi pi-building" style="font-size: 2rem;"></i>';
    
    // Replace the failed image with fallback
    if (target.parentNode) {
      target.parentNode.appendChild(fallback);
    }
  }
}