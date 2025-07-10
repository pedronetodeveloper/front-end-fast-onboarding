import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
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
    path: 'usuario',
    loadComponent: () => import('./pages/usuario/usuario.component').then(m => m.UsuarioComponent)
  },
  {
    path: 'lista-acessos',
    loadComponent: () => import('./pages/lista-acessos/lista-acessos.component').then(m => m.ListaAcessosComponent)
  },
  {
    path: 'documentos-contratado',
    loadComponent: () => import('./pages/documentos-contratado/documentos-contratado.component').then(m => m.DocumentosContratadoComponent)
  },
  {
    path: 'upload-documentos',
    loadComponent: () => import('./pages/upload-documentos/upload-documentos.component').then(m => m.UploadDocumentosComponent)
  },
  {
    path: 'curso',
    loadComponent: () => import('./pages/curso/curso.component').then(m => m.CursoComponent)
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];
