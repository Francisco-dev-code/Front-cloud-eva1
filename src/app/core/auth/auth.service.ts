import { Injectable, inject } from '@angular/core';
import {
  AccountInfo,
  AuthenticationResult,
  InteractionRequiredAuthError,
  PromptValue
} from '@azure/msal-browser';
import { MsalService } from '@azure/msal-angular';
import { environment } from '../../../environments/environment';

const CLAVE_RETURN_URL = 'auth.returnUrl';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly msal = inject(MsalService);

  get isEnabled(): boolean {
    return environment.entra.enabled;
  }

  get account(): AccountInfo | null {
    if (!this.isEnabled) {
      return null;
    }

    return (
      this.msal.instance.getActiveAccount() ??
      this.msal.instance.getAllAccounts()[0] ??
      null
    );
  }

  get isAuthenticated(): boolean {
    if (!this.isEnabled) {
      return false;
    }

    return this.account !== null;
  }

  /** Inicia sesión con Microsoft Entra ID (contraseña + Microsoft Authenticator si el tenant lo exige). */
  login(returnUrl = '/inicio'): void {
    this.iniciarRedirect(returnUrl, false);
  }

  /** Crea una cuenta nueva (auto-registro) y luego inicia sesión. */
  registrarse(returnUrl = '/inicio'): void {
    this.iniciarRedirect(returnUrl, true);
  }

  /** Devuelve (una sola vez) la ruta a la que había que volver tras autenticarse. */
  consumirReturnUrl(): string | null {
    const url = sessionStorage.getItem(CLAVE_RETURN_URL);
    sessionStorage.removeItem(CLAVE_RETURN_URL);
    return this.esRutaInterna(url) ? url : null;
  }

  /** Solo se aceptan rutas internas ("/libros"), nunca URLs externas. */
  esRutaInterna(url: string | null | undefined): url is string {
    return !!url && url.startsWith('/') && !url.startsWith('//');
  }

  private iniciarRedirect(returnUrl: string, crearCuenta: boolean): void {
    if (!this.isEnabled) {
      console.warn(
        'Microsoft Entra ID está deshabilitado. Configura environment.entra antes del login real.'
      );
      return;
    }

    if (this.esRutaInterna(returnUrl)) {
      sessionStorage.setItem(CLAVE_RETURN_URL, returnUrl);
    }

    void this.msal.loginRedirect({
      scopes: environment.entra.apiScope ? [environment.entra.apiScope] : [],
      ...(crearCuenta && environment.entra.selfSignUp
        ? { prompt: PromptValue.CREATE }
        : {})
    });
  }

  logout(): void {
    if (!this.isEnabled) {
      console.warn(
        'Microsoft Entra ID está deshabilitado. No hay una sesión real para cerrar.'
      );
      return;
    }

    this.msal.logoutRedirect({
      postLogoutRedirectUri: environment.entra.redirectUri
    });
  }

  acquireToken(): Promise<AuthenticationResult> {
    const account = this.account;

    if (!this.isEnabled || !account) {
      return Promise.reject(
        new Error('No existe una sesión autenticada con Microsoft Entra ID.')
      );
    }

    return this.msal.instance
      .acquireTokenSilent({
        account,
        scopes: [environment.entra.apiScope]
      })
      .catch((error: unknown): Promise<AuthenticationResult> => {
        if (error instanceof InteractionRequiredAuthError) {
          void this.msal.instance.acquireTokenRedirect({
            scopes: [environment.entra.apiScope],
            account
          });

          return Promise.reject(
            new Error('Se requiere interacción. Redirigiendo a Microsoft Entra ID.')
          );
        }

        return Promise.reject(error);
      });
  }
}