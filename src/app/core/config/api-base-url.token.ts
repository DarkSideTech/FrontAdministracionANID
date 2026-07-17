import { InjectionToken } from '@angular/core';

declare global {
  interface Window {
    __AUT2_CONFIG__?: {
      apiBaseUrl?: string;
      claveUnica?: {
        clientId?: string;
        redirectUri?: string;
        logoutRedirectUri?: string;
        authorizationUrl?: string;
        logoutUrl?: string;
      };
    };
  }
}

export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', {
  factory: () => window.__AUT2_CONFIG__?.apiBaseUrl?.trim() ?? '',
});
