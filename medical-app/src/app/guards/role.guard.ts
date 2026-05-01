import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  const expectedRoles = route.data['roles'] as Array<string>;
  const currentUser = authService.getCurrentUser();

  if (currentUser && currentUser.roles && currentUser.roles.some(r => expectedRoles.includes(r))) {
    return true;
  }

  // Si pas les droits, rediriger vers login (ou une page unauthorized)
  return router.parseUrl('/auth/login');
};
