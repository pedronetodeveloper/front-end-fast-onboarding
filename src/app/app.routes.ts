import { Routes } from '@angular/router';
import { authGuard, noAuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent),
    canActivate: [noAuthGuard] // Impede acesso se já autenticado
  },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent),
    canActivate: [authGuard] // Apenas authGuard customizado
  },
  {
    path: 'usuario',
    loadComponent: () => import('./pages/usuario/usuario.component').then(m => m.UsuarioComponent),
    canActivate: [authGuard]
  },
  {
    path: 'curso',
    loadComponent: () => import('./pages/curso/curso.component').then(m => m.CursoComponent),
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: '/login' // Redirecionar para login ao invés de home
  }
];
