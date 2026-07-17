import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router, RouterModule } from '@angular/router';
import { switchMap, take } from 'rxjs';

import { AccountAuthService } from '@core/auth/account-auth.service';
import {
  clearAuthProvider,
  consumeClaveUnicaState,
  setClaveUnicaAuthProvider,
} from '@core/auth/clave-unica-session';
import { LoginClaveUnicaInterface } from '@core/models/login-clave-unica.interface';
import { formatApiError } from '@core/service/api-error.util';

@Component({
  selector: 'app-callback-clave-unica',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './callback-clave-unica.component.html',
  styleUrl: './callback-clave-unica.component.scss',
})
export class CallbackClaveUnicaComponent implements OnInit {
  private readonly activateRoute = inject(ActivatedRoute);
  private readonly accountAuthService = inject(AccountAuthService);
  private readonly router = inject(Router);

  private code = '';
  private state = '';

  ngOnInit(): void {
    this.activateRoute.queryParams.pipe(take(1)).subscribe((params: Params) => {
      if (!params['code'] || !params['state']) {
        void this.router.navigateByUrl('/authentication/signin');
        return;
      }

      this.code = params['code'];
      this.state = params['state'];
      this.loginClaveUnica();
    });
  }

  private loginClaveUnica(): void {
    const expectedState = consumeClaveUnicaState();
    if (!expectedState || expectedState !== this.state) {
      clearAuthProvider();
      void this.router.navigateByUrl('/authentication/signin');
      return;
    }

    const payload: LoginClaveUnicaInterface = { code: this.code };
    this.accountAuthService
      .ensureCsrfToken()
      .pipe(
        switchMap(() => this.accountAuthService.loginClaveUnica(payload)),
        take(1),
      )
      .subscribe({
        next: () => {
          setClaveUnicaAuthProvider();
          void this.router.navigateByUrl(this.accountAuthService.resolvePostLoginUrl());
        },
        error: (error: unknown) => {
          console.error(formatApiError(error));
          clearAuthProvider();
          void this.router.navigateByUrl('/authentication/signin');
        },
      });
  }
}
