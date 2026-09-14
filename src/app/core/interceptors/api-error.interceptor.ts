import {
  HttpErrorResponse,
  HttpInterceptorFn
} from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const apiErrorInterceptor: HttpInterceptorFn = (request, next) => {
  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      switch (error.status) {
        case 401:
          console.error(
            '401 Unauthorized: la sesión no existe, expiró o el token no es válido.'
          );
          break;

        case 403:
          console.error(
            '403 Forbidden: el usuario no tiene permisos suficientes.'
          );
          break;

        case 404:
          console.error(
            '404 Not Found: el recurso solicitado no existe.'
          );
          break;

        case 500:
          console.error(
            '500 Internal Server Error: ocurrió un error en el backend.'
          );
          break;

        default:
          console.error(
            `Error HTTP ${error.status}: ${error.message}`
          );
      }

      return throwError(() => error);
    })
  );
};