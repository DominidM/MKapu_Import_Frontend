import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot } from '@angular/router';
import { UserRole } from '../constants/roles.constants';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state) => {
  const router = inject(Router);
  
  const userStr = localStorage.getItem('user');
  
  if (!userStr) {
    router.navigate(['/login']);
    return false;
  }
  
  try {
    const user = JSON.parse(userStr);
    const allowedRoles = route.data['allowedRoles'] as UserRole[];
    
    if (!allowedRoles || allowedRoles.length === 0) {
      return true;
    }
    
    if (allowedRoles.includes(user.roleId)) {
      return true;
    }
    
    router.navigate(['/login']);
    return false;
    
  } catch (error) {
    console.error('Error al parsear usuario:', error);
    router.navigate(['/login']);
    return false;
  }
};
