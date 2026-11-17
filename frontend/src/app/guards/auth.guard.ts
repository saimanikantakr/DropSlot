import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/delivery.model';

export const authGuard: CanActivateFn = (route, state): boolean | UrlTree => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated) {
    return router.createUrlTree(['/login']);
  }

  const expectedRoles = route.data?.['roles'] as UserRole[] | undefined;
  if (expectedRoles && expectedRoles.length > 0) {
    const userRole = authService.userRole;
    if (!userRole || !expectedRoles.includes(userRole)) {
      if (userRole === 'admin') return router.createUrlTree(['/admin']);
      if (userRole === 'partner') return router.createUrlTree(['/partner']);
      if (userRole === 'customer') return router.createUrlTree(['/customer']);
      return router.createUrlTree(['/login']);
    }
  }

  return true;
};
