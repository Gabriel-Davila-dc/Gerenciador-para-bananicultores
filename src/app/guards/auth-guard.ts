import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '../services/user-service';

// bloqueia rotas que exigem login de verdade, em vez de só avisar via snackbar
export const authGuard: CanActivateFn = async () => {
  const userService = inject(UserService);
  const router = inject(Router);

  const token = localStorage.getItem('token');
  if (!token) {
    return router.parseUrl('/login');
  }

  const valido = await userService.getUser();
  return valido ? true : router.parseUrl('/login');
};
