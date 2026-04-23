const CLAVE_UNICA_STATE_KEY = 'aut2.claveunica.state';
const AUTH_PROVIDER_KEY = 'aut2.auth.provider';
const CLAVE_UNICA_PROVIDER = 'claveunica';

function hasSessionStorage(): boolean {
  return typeof window !== 'undefined' && typeof sessionStorage !== 'undefined';
}

export function rememberClaveUnicaState(state: string): void {
  if (!hasSessionStorage()) {
    return;
  }

  sessionStorage.setItem(CLAVE_UNICA_STATE_KEY, state);
}

export function consumeClaveUnicaState(): string | null {
  if (!hasSessionStorage()) {
    return null;
  }

  const state = sessionStorage.getItem(CLAVE_UNICA_STATE_KEY);
  sessionStorage.removeItem(CLAVE_UNICA_STATE_KEY);
  return state;
}

export function setClaveUnicaAuthProvider(): void {
  if (!hasSessionStorage()) {
    return;
  }

  sessionStorage.setItem(AUTH_PROVIDER_KEY, CLAVE_UNICA_PROVIDER);
}

export function clearAuthProvider(): void {
  if (!hasSessionStorage()) {
    return;
  }

  sessionStorage.removeItem(AUTH_PROVIDER_KEY);
}

export function usesClaveUnicaAuthProvider(): boolean {
  if (!hasSessionStorage()) {
    return false;
  }

  return sessionStorage.getItem(AUTH_PROVIDER_KEY) === CLAVE_UNICA_PROVIDER;
}
