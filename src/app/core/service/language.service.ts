import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export type AppLanguageCode = 'es' | 'en' | 'de';

export interface AppLanguageOption {
  code: AppLanguageCode;
  label: string;
  flag: string;
  aliases?: string[];
}

const LANGUAGE_STORAGE_KEY = 'lang';
const DEFAULT_LANGUAGE: AppLanguageCode = 'es';
const SUPPORTED_LANGUAGES: AppLanguageOption[] = [
  {
    code: 'es',
    label: 'Español',
    flag: 'assets/images/flags/chilean.jpg',
    aliases: ['cl', 'es-cl', 'es_cl'],
  },
  {
    code: 'en',
    label: 'English',
    flag: 'assets/images/flags/us.jpg',
  },
  {
    code: 'de',
    label: 'Deutsch',
    flag: 'assets/images/flags/germany.jpg',
  },
];

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  readonly languages: AppLanguageCode[] = SUPPORTED_LANGUAGES.map((language) => language.code);
  readonly languageOptions = SUPPORTED_LANGUAGES;

  constructor(public translate: TranslateService) {
    this.translate.addLangs(this.languages);
    this.translate.setDefaultLang(DEFAULT_LANGUAGE);
    this.useLanguage(this.resolveInitialLanguage());
  }

  setLanguage(lang: string): void {
    this.useLanguage(this.normalizeLanguageCode(lang));
  }

  getCurrentLanguage(): AppLanguageCode {
    return this.normalizeLanguageCode(
      this.translate.currentLang || this.translate.getDefaultLang() || DEFAULT_LANGUAGE,
    );
  }

  getLanguageOption(lang: string | null | undefined): AppLanguageOption {
    const resolvedCode = this.normalizeLanguageCode(lang);
    return (
      this.languageOptions.find((option) => option.code === resolvedCode)
      ?? this.languageOptions[0]
    );
  }

  private resolveInitialLanguage(): AppLanguageCode {
    const storedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (storedLanguage) {
      return this.normalizeLanguageCode(storedLanguage);
    }

    const browserCandidates = [
      this.translate.getBrowserCultureLang(),
      this.translate.getBrowserLang(),
    ];

    for (const candidate of browserCandidates) {
      if ((candidate ?? '').trim()) {
        return this.normalizeLanguageCode(candidate);
      }
    }

    return DEFAULT_LANGUAGE;
  }

  private useLanguage(lang: AppLanguageCode): void {
    this.translate.use(lang);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  }

  private normalizeLanguageCode(lang: string | null | undefined): AppLanguageCode {
    const normalizedLanguage = (lang ?? '').trim().toLowerCase().replace('_', '-');
    const normalizedLanguageBase = normalizedLanguage.split('-')[0];

    for (const option of this.languageOptions) {
      if (
        option.code === normalizedLanguage
        || option.code === normalizedLanguageBase
        || option.aliases?.includes(normalizedLanguage)
      ) {
        return option.code;
      }
    }

    return DEFAULT_LANGUAGE;
  }
}
