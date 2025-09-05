import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './core/guards/auth.guard'; // Added import

export const routes: Routes = [
  {
    path: 'empresas',
    loadComponent: () => import('./pages/empresa/empresa.component').then(m => m.EmpresaComponent)
  },
  {
    path: '',
   redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'candidatos',
    loadComponent: () => import('./pages/candidatos/candidatos.component').then(m => m.UsuarioComponent)
  },
  {
    path: 'controle-acessos',
    loadComponent: () => import('./pages/usuario-plataforma/usuario-plataforma.component').then(m => m.UsuarioPlataformComponent)
  },
  {
    path: 'observabilidade',
    loadComponent: () => import('./pages/observability/observability.component').then(m => m.ObservabilityComponent),
  },
  {
    path: 'acompanhamento-documentos',
    loadComponent: () => import('./pages/acompanhamento-documentos/acompanhamento-documentos.component').then(m => m.AcompanhamentoDocumentosComponent)
  },
  {
    path: 'sobre-nos',
    loadComponent: () => import('./pages/sobrenos/sobre.component').then(m => m.SobreComponent)
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];