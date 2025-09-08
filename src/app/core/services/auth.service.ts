import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface AuthUser {
  name: string;
  email: string;
  role: 'admin' | 'rh' | 'candidato';
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasValidSession());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  private router = inject(Router);
  private http = inject(HttpClient);

  constructor() {
    console.log('AuthService: Inicializando...');
  }

  /**
   * Login com email e senha
   */
  /**
   * Login mocado para 3 perfis: admin, rh, candidato
   * admin: admin@admin.com / admin123@
   * rh: rh@empresa.com / rh123@
   * candidato: candidato@teste.com / candidato123@
   */
  login(email: string, senha: string): Observable<AuthUser> {
    const url = 'https://yyzvaldhm1.execute-api.us-east-1.amazonaws.com/login';
    const body = { email, password: senha };
    return new Observable<AuthUser>(observer => {
      this.http.post<any>(url, body).subscribe({
        next: (response) => {
          // response: { token, user: { id, email, role } }
          const user: AuthUser = {
            name: response.user.email, // ou pode ser response.user.id se quiser mostrar o id
            email: response.user.email,
            role: response.user.role,
            token: response.token
          };
          localStorage.setItem('user', JSON.stringify(user));
          localStorage.setItem('token', response.token);
          this.isAuthenticatedSubject.next(true);
          observer.next(user);
          observer.complete();
        },
        error: (err) => {
          this.isAuthenticatedSubject.next(false);
          observer.error('Usuário ou senha inválidos.');
        }
      });
    });
  }

  /**
   * Logout do usuário
   */
  logout(): void {
    localStorage.removeItem('user');
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/home']);
  }

  /**
   * Obter informações do usuário autenticado
   */
  getUser(): AuthUser | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  /**
   * Obter o papel (role) do usuário
   */
  getRole(): string | null {
    return this.getUser()?.role || null;
  }

  /**
   * Verificar se o usuário tem um dos papéis especificados
   */
  hasRole(roles: string[]): boolean {
    const role = this.getRole();
    return role ? roles.includes(role) : false;
  }

  /**
   * Verificar se o usuário está autenticado
   */
  isAuthenticated(): boolean {
    return !!this.getUser();
  }

  /**
   * Verificar se há uma sessão válida salva
   */
  hasValidSession(): boolean {
    // Simples: se tem user/token no localStorage
    return !!this.getUser();
  }
}
