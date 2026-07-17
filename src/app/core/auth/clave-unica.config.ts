export interface ClaveUnicaConfiguration {
  clientId: string;
  redirectUri: string;
  logoutRedirectUri: string;
  authorizationUrl: string;
  logoutUrl: string;
}

const DEFAULT_CONFIGURATION: ClaveUnicaConfiguration = {
  clientId: '',
  redirectUri: '',
  logoutRedirectUri: '',
  authorizationUrl: 'https://accounts.claveunica.gob.cl/openid/authorize/',
  logoutUrl: 'https://accounts.claveunica.gob.cl/api/v1/accounts/app/logout',
};

export function getClaveUnicaConfiguration(): ClaveUnicaConfiguration {
  const configuredValues = typeof window === 'undefined'
    ? undefined
    : window.__AUT2_CONFIG__?.claveUnica;

  return {
    clientId: configuredValues?.clientId?.trim() ?? DEFAULT_CONFIGURATION.clientId,
    redirectUri: configuredValues?.redirectUri?.trim() ?? DEFAULT_CONFIGURATION.redirectUri,
    logoutRedirectUri: configuredValues?.logoutRedirectUri?.trim() ?? DEFAULT_CONFIGURATION.logoutRedirectUri,
    authorizationUrl: configuredValues?.authorizationUrl?.trim() ?? DEFAULT_CONFIGURATION.authorizationUrl,
    logoutUrl: configuredValues?.logoutUrl?.trim() ?? DEFAULT_CONFIGURATION.logoutUrl,
  };
}

export function isClaveUnicaConfigured(configuration: ClaveUnicaConfiguration): boolean {
  return Boolean(configuration.clientId)
    && isHttpsUrl(configuration.redirectUri)
    && isHttpsUrl(configuration.logoutRedirectUri)
    && isHttpsUrl(configuration.authorizationUrl)
    && isHttpsUrl(configuration.logoutUrl);
}

export function createClaveUnicaAuthorizationUrl(
  configuration: ClaveUnicaConfiguration,
  state: string,
): string {
  const url = new URL(configuration.authorizationUrl);
  url.searchParams.set('client_id', configuration.clientId);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', 'openid run name');
  url.searchParams.set('redirect_uri', configuration.redirectUri);
  url.searchParams.set('state', state);
  return url.toString();
}

export function createClaveUnicaLogoutUrl(configuration: ClaveUnicaConfiguration): string {
  const url = new URL(configuration.logoutUrl);
  url.searchParams.set('redirect', configuration.logoutRedirectUri);
  return url.toString();
}

function isHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}
