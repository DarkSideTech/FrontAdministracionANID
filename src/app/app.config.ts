import { HttpClient, provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { APP_INITIALIZER, ApplicationConfig, importProvidersFrom, provideBrowserGlobalErrorListeners } from '@angular/core';
import { APP_ROUTE } from './app.routes';
import { provideRouter } from '@angular/router';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { DirectionService, LanguageService } from '@core';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { FeatherModule } from 'angular-feather';
import { allIcons } from 'angular-feather/icons';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { provideToastr } from 'ngx-toastr';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { catchError, firstValueFrom, of } from 'rxjs';
import { authInterceptor } from '@core/auth/auth.interceptor';
import { AccountAuthService } from '@core/auth/account-auth.service';

export function createTranslateLoader(http: HttpClient): TranslateHttpLoader {
    return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

function initializeAuthentication(accountAuthService: AccountAuthService) {
    return () => firstValueFrom(
        accountAuthService.initialize().pipe(
            catchError(() => of(void 0))
        )
    );
}

export const appConfig: ApplicationConfig = {
    providers: [
        provideHttpClient(
            withFetch(),
            withInterceptors([authInterceptor])
        ),
        provideRouter(APP_ROUTE),
        provideBrowserGlobalErrorListeners(),
        provideAnimationsAsync(),
        provideToastr(),
        {
            provide: APP_INITIALIZER,
            multi: true,
            useFactory: initializeAuthentication,
            deps: [AccountAuthService],
        },
        { provide: LocationStrategy, useClass: HashLocationStrategy },
        DirectionService, LanguageService,
        importProvidersFrom(
            TranslateModule.forRoot({
                defaultLanguage: 'es',
                loader: {
                    provide: TranslateLoader,
                    useFactory: createTranslateLoader,
                    deps: [HttpClient],
                },
            })
        ),
        importProvidersFrom(FeatherModule.pick(allIcons)),
        provideCharts(withDefaultRegisterables())
    ],
};
