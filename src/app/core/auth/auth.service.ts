import { Injectable, inject } from '@angular/core';
import {
  AccountInfo,
  AuthenticationResult,
  InteractionRequiredAuthError
} from '@azure/msal-browser';
import { MsalService } from '@azure/msal-angular';
import { environment } from '../../../environments/environment';

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

  login(): void {
    if (!this.isEnabled) {
      console.warn(
        'Microsoft Entra ID está deshabilitado. Configura environment.entra antes del login real.'
      );
      return;
    }

    this.msal.loginRedirect({
      scopes: environment.entra.apiScope
        ? [environment.entra.apiScope]
        : []
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