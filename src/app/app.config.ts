import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';

// MSAL imports
import { MsalModule, MsalService, MsalGuard, MsalInterceptor, MsalBroadcastService } from '@azure/msal-angular';
import { PublicClientApplication, InteractionType } from '@azure/msal-browser';

import { routes } from './app.routes';
import { msalConfig, loginRequest } from './config/auth.config';
import { environment } from '../environments/environment';

import Aura from '@primeng/themes/aura';
import { providePrimeNG } from 'primeng/config';

// Create MSAL instance
const msalInstance = new PublicClientApplication(msalConfig);

// Initialize MSAL instance
msalInstance.initialize().then(() => {
  console.log('MSAL instance initialized in app.config');
}).catch((error) => {
  console.error('Error initializing MSAL instance:', error);
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(withInterceptorsFromDi()),

    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: '.app-dark',
        },
      },
    }),
    
    // MSAL Configuration
    importProvidersFrom(
      MsalModule.forRoot(msalInstance, {
        interactionType: InteractionType.Redirect,
        authRequest: loginRequest,
        loginFailedRoute: '/login'
      }, {
        interactionType: InteractionType.Redirect,
        protectedResourceMap: new Map([
          ['https://graph.microsoft.com/v1.0/me', ['User.Read']],
          ['https://graph.microsoft.com/v1.0/users', ['User.Read.All']],
          [environment.api.url, [environment.api.scope]]
        ])
      })
    ),
    
    // MSAL Services
    MsalService,
    MsalGuard,
    MsalBroadcastService,
    
    // MSAL Interceptor
    {
      provide: HTTP_INTERCEPTORS,
      useClass: MsalInterceptor,
      multi: true
    }
  ]
};
