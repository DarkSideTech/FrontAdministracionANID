import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable } from 'rxjs';

import { EnumerationApi } from '@core/service/controllers/enumeration.api';
import { EnumerationOption } from './enumeration.models';

export interface SignupCatalogs {
  tipoDeUsuario: EnumerationOption[];
  nacionalidades: EnumerationOption[];
  documentosDeIdentidad: EnumerationOption[];
  sexoDeclarativo: EnumerationOption[];
  sexoRegistral: EnumerationOption[];
}

@Injectable({ providedIn: 'root' })
export class EnumerationService {
  private readonly enumerationApi = inject(EnumerationApi);

  loadSignupCatalogs(): Observable<SignupCatalogs> {
    return this.loadUserProfileCatalogs(false);
  }

  loadProfileCatalogs(): Observable<SignupCatalogs> {
    return this.loadUserProfileCatalogs(true);
  }

  private loadUserProfileCatalogs(includeNational: boolean): Observable<SignupCatalogs> {
    return forkJoin({
      tipoDeUsuario: this.enumerationApi.buscarTodosLosValoresEnumTipoDeUsuario().pipe(
        map((values) =>
          this.toOptions(values)
            .filter((item) => includeNational || item.value !== 'NACIONAL')
            .sort((left, right) => this.compareTipoDeUsuario(left, right)),
        ),
      ),
      nacionalidades: this.enumerationApi.buscarTodosLosValoresEnumNacionalidad().pipe(
        map((values) => this.toOptions(values)),
      ),
      documentosDeIdentidad: this.enumerationApi.buscarTodosLosValoresEnumDocumentoDeIdentidad().pipe(
        map((values) => this.toOptions(values)),
      ),
      sexoDeclarativo: this.enumerationApi.buscarTodosLosValoresEnumSexoDeclarativo().pipe(
        map((values) => this.toOptions(values)),
      ),
      sexoRegistral: this.enumerationApi.buscarTodosLosValoresEnumSexoRegistral().pipe(
        map((values) => this.toOptions(values)),
      ),
    });
  }

  private toOptions(values: string[]): EnumerationOption[] {
    return values
      .map((value) => value?.trim())
      .filter((value): value is string => Boolean(value))
      .map((value) => ({
        value,
        label: formatEnumerationLabel(value),
      }));
  }

  private compareTipoDeUsuario(left: EnumerationOption, right: EnumerationOption): number {
    if (left.value === 'EXTRANJERO') {
      return -1;
    }

    if (right.value === 'EXTRANJERO') {
      return 1;
    }

    return left.label.localeCompare(right.label);
  }
}

function formatEnumerationLabel(value: string): string {
  const trimmedValue = value.trim();
  if (!trimmedValue) {
    return '';
  }

  const useSlashSeparator = /[a-záéíóúüñ]/i.test(trimmedValue) && /_[a-záéíóúüñ]/i.test(trimmedValue);
  const parts = trimmedValue.split('_').filter(Boolean);

  if (useSlashSeparator) {
    return parts
      .map((part) => formatMixedCaseSegment(part))
      .join('/');
  }

  return parts
    .map((part) => formatUpperSnakeSegment(part))
    .join(' ');
}

function formatMixedCaseSegment(value: string): string {
  if (value.length === 1) {
    return value.toLowerCase();
  }

  const normalizedValue = value.toLowerCase();
  return normalizedValue.replace(/^\p{L}/u, (match) => match.toUpperCase());
}

function formatUpperSnakeSegment(value: string): string {
  const normalizedValue = value.toLowerCase();
  return normalizedValue.replace(/\b\p{L}/gu, (match) => match.toUpperCase());
}
