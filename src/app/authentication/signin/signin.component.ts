import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import {
  FormsModule,
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import {
  NgbNav,
  NgbNavContent,
  NgbNavItem,
  NgbNavLink,
  NgbNavOutlet,
} from '@ng-bootstrap/ng-bootstrap';
import { FeatherModule } from 'angular-feather';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { nanoid } from 'nanoid';

import { environment } from 'environments/environment';
import { AccountAuthService } from '@core/auth/account-auth.service';
import { clearAuthProvider, rememberClaveUnicaState } from '@core/auth/clave-unica-session';
import { formatApiError } from '@core/service/api-error.util';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    FeatherModule,
    NgbNav,
    NgbNavItem,
    NgbNavLink,
    NgbNavContent,
    NgbNavOutlet,
  ],
})
export class SigninComponent implements OnInit {
  private readonly accountAuthService = inject(AccountAuthService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(false);
  readonly errorMessage = signal('');
  readonly successMessage = signal('');

  clientId = environment.clientIdClaveUnica;
  redirectUri = environment.redirecUriClaveUnica;
  claveUnicaUrl = environment.claveUnicaUrl;

  form!: UntypedFormGroup;
  submitted = false;
  error: string | null = null;
  active: 'claveunica' | 'extranjero' = 'claveunica';

  constructor(private readonly formBuilder: UntypedFormBuilder) {}

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      email: ['test@security.com', [Validators.required, Validators.email]],
      password: ['Changeme123#', Validators.required],
      remember: [false],
    });

    const navigationState = history.state as { passwordChangeMessage?: string } | undefined;
    this.successMessage.set(navigationState?.passwordChangeMessage?.trim() ?? '');
  }

  get f() {
    return this.form.controls;
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    this.accountAuthService
      .login(this.form.getRawValue())
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          clearAuthProvider();
          void this.router.navigateByUrl(this.accountAuthService.resolvePostLoginUrl());
        },
        error: (error: unknown) => {
          this.errorMessage.set(formatApiError(error));
        },
      });
  }

  goClaveUnica(): void {
    const encodedUrl = encodeURIComponent(this.redirectUri);
    const state = nanoid();
    const params = `client_id=${this.clientId}&response_type=code&scope=openid run name&redirect_uri=${encodedUrl}&state=${state}`;

    rememberClaveUnicaState(state);
    window.location.href = this.claveUnicaUrl + params;
  }

  selectTab(tab: 'claveunica' | 'extranjero') {
    this.active = tab;
    this.error = null;
  }
}
