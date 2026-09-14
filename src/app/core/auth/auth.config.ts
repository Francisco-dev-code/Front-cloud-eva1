import {
  BrowserCacheLocation,
  InteractionType,
  IPublicClientApplication,
  PublicClientApplication
} from '@azure/msal-browser';
import {
  MsalGuardConfiguration,
  MsalInterceptorConfiguration
} from '@azure/msal-angular';
import { environment } from '../../../environments/environment';

export function msalInstanceFactory(): IPublicClientApplication {
  return new PublicClientApplication({
    auth: {
      clientId: environment.entra.clientId || 'PENDING_CLIENT_ID',
      authority: environment.entra.tenantId
        ? `https://login.microsoftonline.com/${environment.entra.tenantId}`
        : 'https://login.microsoftonline.com/common',
      redirectUri: environment.entra.redirectUri,
      postLogoutRedirectUri: environment.entra.redirectUri
    },
    cache: {
      cacheLocation: BrowserCacheLocation.LocalStorage
    }
  });
}

export function msalGuardConfigFactory(): MsalGuardConfiguration {
  return {
    interactionType: InteractionType.Redirect,
    authRequest: {
      scopes: environment.entra.apiScope
        ? [environment.entra.apiScope]
        : []
    }
  };
}

export function msalInterceptorConfigFactory(): MsalInterceptorConfiguration {
  const protectedResourceMap = new Map<string, string[]>();

  if (environment.entra.enabled && environment.entra.apiScope) {
    protectedResourceMap.set(`${environment.apiUrl}/*`, [
      environment.entra.apiScope
    ]);
  }

  return {
    interactionType: InteractionType.Redirect,
    protectedResourceMap
  };
}