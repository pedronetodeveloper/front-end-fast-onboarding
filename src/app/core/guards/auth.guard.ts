import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { map, take } from 'rxjs';

// Services
import { AuthService } from '../services/auth.service';

/**
 * Guard to protect routes that require authentication
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log(`AuthGuard: Checking access to ${state.url}`);
  
  return authService.isAuthenticated$.pipe(
    take(1),
    map(isAuthenticated => {
      console.log(`AuthGuard: User authenticated: ${isAuthenticated}`);
      
      if (isAuthenticated) {
        console.log(`AuthGuard: Access granted to ${state.url}`);
        return true;
      } else {
        console.log(`AuthGuard: Access denied to ${state.url}, redirecting to login`);
        // Redirect to login page if not authenticated
        router.navigate(['/login']);
        return false;
      }
    })
  );
};

/**
 * Guard to prevent authenticated users from accessing login page
 */
export const noAuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log(`NoAuthGuard: Checking access to ${state.url}`);
  
  return authService.isAuthenticated$.pipe(
    take(1),
    map(isAuthenticated => {
      console.log(`NoAuthGuard: User authenticated: ${isAuthenticated}`);
      
      if (!isAuthenticated) {
        console.log(`NoAuthGuard: Access granted to ${state.url} (user not authenticated)`);
        return true;
      } else {
        console.log(`NoAuthGuard: Access denied to ${state.url}, user already authenticated, redirecting to home`);
        // Redirect to home if already authenticated
        router.navigate(['/home']);
        return false;
      }
    })
  );
};
