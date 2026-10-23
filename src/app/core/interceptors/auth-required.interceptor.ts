import {
  HttpErrorResponse,
  HttpInterceptorFn
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { environment } from '../../../environments/environment';

/**
 * La navegación por el sitio es libre, pero cualquier solicitud a {apiUrl}/api/*
 * exige sesión. Si no hay sesión, la solicitud NO sale y se envía al usuario a /registro.
 */
export const authRequiredInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isEnabled || auth.isAuthenticated) {
    return next(request);
  }

  const apiBase = environment.apiUrl.replace(/\/+$/, '');
  if (!request.url.startsWith(`${apiBase}/api/`)) {
    return next(request);
  }

  if (!router.url.startsWith('/registro')) {
    void router.navigate(['/registro'], {
      queryParams: { returnUrl: router.url }
    });
  }

  return throwError(
    () =>
      new HttpErrorResponse({
        status: 401,
        statusText: 'Unauthorized',
        url: request.url,
        error: 'Debes registrarte o iniciar sesión para realizar solicitudes.'
      })
  );
};
