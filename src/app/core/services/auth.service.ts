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
    return new Observable<AuthUser>(observer => {
      let user: AuthUser | null = null;
      const emailNorm = (email || '').trim().toLowerCase();
      const senhaNorm = (senha || '').trim();
      if (emailNorm === 'admin@admin.com' && senhaNorm === 'admin123@') {
        user = {
          name: 'Administrador',
          email: 'admin@admin.com',
          role: 'admin',
          token: 'mocked-token-admin'
        };
      } else if (emailNorm === 'rh@empresa.com' && senhaNorm === 'rh123@') {
        user = {
          name: 'Recursos Humanos',
          email: 'rh@empresa.com',
          role: 'rh',
          token: 'mocked-token-rh'
        };
      } else if (emailNorm === 'candidato@teste.com' && senhaNorm === 'candidato123@') {
        user = {
          name: 'Candidato Teste',
          email: 'candidato@teste.com',
          role: 'candidato',
          token: 'mocked-token-candidato'
        };
      } else {
        // Verifica candidatos cadastrados no localStorage
        const candidatos = JSON.parse(localStorage.getItem('candidatos') || '[]');
        const candidato = candidatos.find((u: any) => u.email === emailNorm && u.senha === senhaNorm);
        if (candidato) {
          user = {
            name: candidato.nome,
            email: candidato.email,
            role: 'candidato',
            token: 'mocked-token-candidato'
          };
        }
      }
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
        this.isAuthenticatedSubject.next(true);
        observer.next(user);
        observer.complete();
      } else {
        this.isAuthenticatedSubject.next(false);
        observer.error('Usuário ou senha inválidos.');
      }
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
