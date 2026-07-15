import {
  ClaveUnicaConfiguration,
  createClaveUnicaAuthorizationUrl,
  createClaveUnicaLogoutUrl,
  isClaveUnicaConfigured,
} from './clave-unica.config';

describe('ClaveUnicaConfiguration', () => {
  const configuration: ClaveUnicaConfiguration = {
    clientId: 'sandbox-client-id',
    redirectUri: 'https://mi.desa.anid.gob.cl/authentication/callback-clave-unica',
    logoutRedirectUri: 'https://mi.desa.anid.gob.cl/authentication/signin',
    authorizationUrl: 'https://accounts.claveunica.gob.cl/openid/authorize/',
    logoutUrl: 'https://accounts.claveunica.gob.cl/api/v1/accounts/app/logout',
  };

  it('builds an authorization code request with the required state and redirect URI', () => {
    const url = new URL(createClaveUnicaAuthorizationUrl(configuration, 'a'.repeat(32)));

    expect(url.origin).toBe('https://accounts.claveunica.gob.cl');
    expect(url.pathname).toBe('/openid/authorize/');
    expect(url.searchParams.get('client_id')).toBe(configuration.clientId);
    expect(url.searchParams.get('response_type')).toBe('code');
    expect(url.searchParams.get('scope')).toBe('openid run name');
    expect(url.searchParams.get('redirect_uri')).toBe(configuration.redirectUri);
    expect(url.searchParams.get('state')).toBe('a'.repeat(32));
  });

  it('builds the provider logout URL with the configured return location', () => {
    const url = new URL(createClaveUnicaLogoutUrl(configuration));

    expect(url.searchParams.get('redirect')).toBe(configuration.logoutRedirectUri);
  });

  it('requires HTTPS callback URLs before enabling ClaveUnica', () => {
    expect(isClaveUnicaConfigured(configuration)).toBeTrue();
    expect(isClaveUnicaConfigured({ ...configuration, redirectUri: 'http://localhost:4210/callback' })).toBeFalse();
  });
});
