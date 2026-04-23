import { Injectable } from '@angular/core';

import { ActiveProcess } from '@core/auth/auth.models';
import { MenuNavigationMode } from '../../layout/sidebar/sidebar.metadata';

export interface ProcessMenuTarget {
  path: string;
  href?: string;
  target?: '_blank' | '_self';
  rel?: string;
  navigationMode: MenuNavigationMode;
}

type ProcessDisplayMode = 'NO_DESPLEGAR' | 'IFRAME' | 'VENTANA' | 'REDIRECCION';

@Injectable({ providedIn: 'root' })
export class ProcessNavigationService {
  buildMenuTarget(process: ActiveProcess): ProcessMenuTarget {
    const navigationMode = this.toNavigationMode(process.ComoDesplegarUrlDeProceso);

    if (navigationMode === 'iframe') {
      return {
        path: this.getIframeRoute(process.Codigo ?? ''),
        navigationMode,
      };
    }

    const href = this.resolveProcessUrl(process);
    if (!href) {
      return {
        path: '',
        navigationMode: 'none',
      };
    }

    if (navigationMode === 'window') {
      return {
        path: '',
        href,
        target: '_blank',
        rel: 'noopener noreferrer',
        navigationMode,
      };
    }

    if (navigationMode === 'redirect') {
      return {
        path: '',
        href,
        target: '_self',
        navigationMode,
      };
    }

    return {
      path: '',
      navigationMode: 'none',
    };
  }

  getIframeRoute(processCode: string): string {
    const code = encodeURIComponent((processCode ?? '').trim());
    return code ? `/procesos/${code}` : '';
  }

  resolveProcessUrl(process: ActiveProcess | null | undefined): string {
    const rawUrl = this.normalizeExternalUrl(process?.Url);
    if (!rawUrl) {
      return '';
    }

    return this.applyToken(rawUrl, process?.Token);
  }

  isIframeProcess(process: ActiveProcess | null | undefined): boolean {
    return this.normalizeDisplayMode(process?.ComoDesplegarUrlDeProceso) === 'IFRAME';
  }

  normalizeDisplayMode(mode: string | null | undefined): ProcessDisplayMode {
    const normalizedMode = (mode ?? '').trim().toUpperCase();

    switch (normalizedMode) {
      case 'IFRAME':
      case 'VENTANA':
      case 'REDIRECCION':
      case 'NO_DESPLEGAR':
        return normalizedMode;
      default:
        return 'NO_DESPLEGAR';
    }
  }

  private toNavigationMode(mode: string | null | undefined): MenuNavigationMode {
    switch (this.normalizeDisplayMode(mode)) {
      case 'IFRAME':
        return 'iframe';
      case 'VENTANA':
        return 'window';
      case 'REDIRECCION':
        return 'redirect';
      default:
        return 'none';
    }
  }

  private normalizeExternalUrl(url: string | null | undefined): string {
    const value = (url ?? '').trim();
    if (!value) {
      return '';
    }

    if (/^[a-z][a-z\d+\-.]*:\/\//i.test(value)) {
      return value;
    }

    if (value.startsWith('//')) {
      return `https:${value}`;
    }

    if (/^(localhost|\d{1,3}(?:\.\d{1,3}){3})(:\d+)?(\/.*)?$/i.test(value)) {
      return `http://${value}`;
    }

    if (/^[a-z0-9.-]+(:\d+)?(\/.*)?$/i.test(value)) {
      return `https://${value}`;
    }

    return value;
  }

  private applyToken(url: string, token: string | null | undefined): string {
    const normalizedToken = (token ?? '').trim();
    if (!normalizedToken) {
      return url;
    }

    if (url.includes('{token}')) {
      return url.replaceAll('{token}', encodeURIComponent(normalizedToken));
    }

    const [baseUrl, fragment] = url.split('#', 2);
    const separator = baseUrl.includes('?') ? '&' : '?';
    const nextUrl = `${baseUrl}${separator}token=${encodeURIComponent(normalizedToken)}`;

    return fragment ? `${nextUrl}#${fragment}` : nextUrl;
  }
}
