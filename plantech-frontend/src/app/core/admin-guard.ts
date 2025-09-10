import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth';
import { jwtDecode } from 'jwt-decode';

interface AuthToken {
  sub: string;
  roles: string;
  iat: number;
  exp: number;
}

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  const token = authService.getToken();
  if (token) {
    try {
      const decodedToken: AuthToken = jwtDecode(token);
      if (decodedToken.roles.includes('ROLE_ADMIN')) {
        return true;
      }
    } catch (error) {
      console.error('Erro ao decodificar token:', error);
      router.navigate(['/home']);
      return false;
    }
  }

  alert('Acesso negado. Esta área é apenas para administradores.');
  router.navigate(['/home']);
  return false;
};