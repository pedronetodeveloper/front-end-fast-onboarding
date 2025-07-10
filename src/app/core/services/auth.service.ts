import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

// MSAL imports
import { MsalService, MsalBroadcastService } from '@azure/msal-angular';
import { AccountInfo, InteractionStatus, EventType, EventMessage } from '@azure/msal-browser';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private currentUserSubject = new BehaviorSubject<AccountInfo | null>(null);

  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  public currentUser$ = this.currentUserSubject.asObservable();

  private msalService = inject(MsalService);
  private msalBroadcastService = inject(MsalBroadcastService);
  private router = inject(Router);

  constructor() {
    console.log('AuthService: Initializing...');
    this.initializeAuthState();
    this.subscribeToMsalEvents();
  }

  /**
   * Initialize authentication state
   */
  private initializeAuthState(): void {
    console.log('AuthService: Initializing auth state...');
    
    // Verificar estado inicial imediatamente
    this.updateAuthState();
    
    // Check if user is already logged in
    this.msalBroadcastService.inProgress$
      .subscribe((status: InteractionStatus) => {
        console.log('AuthService: MSAL interaction status:', status);
        if (status === InteractionStatus.None) {
          this.updateAuthState();
        }
      });
  }

  /**
   * Subscribe to MSAL events
   */
  private subscribeToMsalEvents(): void {
    this.msalBroadcastService.msalSubject$
      .subscribe((result: EventMessage) => {
        switch (result.eventType) {
          case EventType.LOGIN_SUCCESS:
          case EventType.LOGOUT_SUCCESS:
          case EventType.ACQUIRE_TOKEN_SUCCESS:
            this.updateAuthState();
            break;
          default:
            break;
        }
      });
  }

  /**
   * Update authentication state
   */
  private updateAuthState(): void {
    const accounts = this.msalService.instance.getAllAccounts();
    const isAuthenticated = accounts.length > 0;
    
    console.log('AuthService: Updating auth state. Accounts found:', accounts.length, 'IsAuthenticated:', isAuthenticated);
    
    this.isAuthenticatedSubject.next(isAuthenticated);
    this.currentUserSubject.next(isAuthenticated ? accounts[0] : null);
    
    if (isAuthenticated && accounts[0]) {
      console.log('AuthService: Authenticated user:', accounts[0].name || accounts[0].username);
      
      // Salvar informações de login no localStorage
      this.saveLoginInfo();
    } else {
      // Se não autenticado, limpar informações salvas
      this.clearLoginInfo();
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const accounts = this.msalService.instance.getAllAccounts();
    const isAuth = accounts.length > 0;
    console.log('AuthService: isAuthenticated() called. Result:', isAuth, 'Accounts:', accounts.length);
    return isAuth;
  }

  /**
   * Get current user account
   */
  getCurrentUser(): AccountInfo | null {
    const accounts = this.msalService.instance.getAllAccounts();
    return accounts.length > 0 ? accounts[0] : null;
  }

  /**
   * Get user display name
   */
  getUserDisplayName(): string {
    const user = this.getCurrentUser();
    return user?.name || user?.username || 'Unknown User';
  }

  /**
   * Get user email
   */
  getUserEmail(): string {
    const user = this.getCurrentUser();
    return user?.username || '';
  }

  /**
   * Login with popup
   */
  loginPopup(): Observable<any> {
    return this.msalService.loginPopup({
      scopes: ['User.Read', 'openid', 'profile']
    });
  }

  /**
   * Login with redirect
   */
  loginRedirect(): void {
    this.msalService.loginRedirect({
      scopes: ['User.Read', 'openid', 'profile']
    });
  }

  /**
   * Logout with popup
   */
  logoutPopup(): Observable<any> {
    return new Observable(observer => {
      this.msalService.logoutPopup({
        mainWindowRedirectUri: "/login"
      }).subscribe({
        next: (response) => {
          console.log('AuthService: Logout successful');
          // Limpar informações salvas no localStorage
          this.clearLoginInfo();
          // Navegar para login após logout
          this.router.navigate(['/login']);
          observer.next(response);
          observer.complete();
        },
        error: (error) => {
          console.error('AuthService: Logout failed:', error);
          // Mesmo com erro, limpar informações locais
          this.clearLoginInfo();
          this.router.navigate(['/login']);
          observer.error(error);
        }
      });
    });
  }

  /**
   * Logout with redirect
   */
  logoutRedirect(): void {
    console.log('AuthService: Starting logout redirect');
    // Limpar informações salvas antes do redirect
    this.clearLoginInfo();
    this.msalService.logoutRedirect({
      postLogoutRedirectUri: window.location.origin + '/login'
    });
  }

  /**
   * Get access token silently
   */
  getAccessToken(scopes: string[] = ['User.Read']): Observable<string> {
    const account = this.getCurrentUser();
    
    if (!account) {
      throw new Error('No active account found');
    }

    return new Observable(observer => {
      this.msalService.acquireTokenSilent({
        scopes: scopes,
        account: account
      }).subscribe({
        next: (response) => {
          observer.next(response.accessToken);
          observer.complete();
        },
        error: (error) => {
          // If silent token acquisition fails, try popup
          this.msalService.acquireTokenPopup({
            scopes: scopes,
            account: account
          }).subscribe({
            next: (response) => {
              observer.next(response.accessToken);
              observer.complete();
            },
            error: (popupError) => {
              observer.error(popupError);
            }
          });
        }
      });
    });
  }

  /**
   * Check if user has specific role or permission
   * This would typically check claims in the token
   */
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    // In a real implementation, you would check the user's roles from the token claims
    // For now, this is a placeholder
    return user !== null;
  }

  /**
   * Navigate to login page
   */
  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  /**
   * Save additional login information to localStorage
   */
  saveLoginInfo(additionalInfo?: any): void {
    const user = this.getCurrentUser();
    if (user) {
      const loginInfo = {
        lastLogin: new Date().toISOString(),
        userInfo: {
          name: user.name,
          username: user.username,
          homeAccountId: user.homeAccountId,
          localAccountId: user.localAccountId,
          environment: user.environment,
          tenantId: user.tenantId
        },
        additionalInfo: additionalInfo || null
      };
      
      localStorage.setItem('userLoginInfo', JSON.stringify(loginInfo));
      console.log('AuthService: Login info saved to localStorage', loginInfo);
    }
  }

  /**
   * Get saved login information from localStorage
   */
  getLoginInfo(): any {
    try {
      const stored = localStorage.getItem('userLoginInfo');
      if (stored) {
        const loginInfo = JSON.parse(stored);
        console.log('AuthService: Retrieved login info from localStorage', loginInfo);
        return loginInfo;
      }
    } catch (error) {
      console.error('AuthService: Error retrieving login info from localStorage', error);
    }
    return null;
  }

  /**
   * Clear saved login information from localStorage
   */
  clearLoginInfo(): void {
    localStorage.removeItem('userLoginInfo');
    console.log('AuthService: Login info cleared from localStorage');
  }

  /**
   * Check if user has valid saved session
   */
  hasValidSavedSession(): boolean {
    const loginInfo = this.getLoginInfo();
    if (!loginInfo) return false;

    // Check if login was recent (e.g., within last 24 hours)
    const lastLogin = new Date(loginInfo.lastLogin);
    const now = new Date();
    const hoursDiff = (now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60);
    
    // Consider session valid if within 24 hours and MSAL still has accounts
    const isRecent = hoursDiff < 24;
    const hasAccounts = this.msalService.instance.getAllAccounts().length > 0;
    
    console.log('AuthService: Checking saved session validity', {
      hasLoginInfo: !!loginInfo,
      isRecent,
      hasAccounts,
      hoursSinceLogin: hoursDiff
    });
    
    return isRecent && hasAccounts;
  }

  /**
   * Update login info with additional data
   */
  updateLoginInfo(additionalData: any): void {
    const currentInfo = this.getLoginInfo();
    if (currentInfo) {
      currentInfo.additionalInfo = { 
        ...currentInfo.additionalInfo, 
        ...additionalData,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem('userLoginInfo', JSON.stringify(currentInfo));
      console.log('AuthService: Login info updated', currentInfo);
    }
  }
}
