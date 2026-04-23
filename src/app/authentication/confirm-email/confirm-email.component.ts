import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { AccountAuthService } from '@core/auth/account-auth.service';
import {
  EmailConfirmationDispatchResultPayload,
  RegisterResultPayload,
} from '@core/auth/auth.models';
import { formatApiError } from '@core/service/api-error.util';

@Component({
  selector: 'app-confirm-email',
  templateUrl: './confirm-email.component.html',
  styleUrls: ['./confirm-email.component.sass'],
  imports: [ReactiveFormsModule, RouterLink],
})
export class ConfirmEmailComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly accountAuthService = inject(AccountAuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly confirmationForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    validationToken: ['', Validators.required],
  });

  confirming = false;
  resending = false;
  submittedValidation = false;
  submittedResend = false;
  successMessage = '';
  errorMessage = '';
  infoMessage = 'Tu usuario fue creado y se envio un correo electronico de validacion.';
  private lastAutoValidationToken = '';

  ngOnInit(): void {
    this.applyNavigationState();

    this.route.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const email = params.get('email')?.trim() ?? '';
        const validationToken = params.get('validationToken')?.trim() ?? '';

        if (email) {
          this.confirmationForm.patchValue({ email });
        }

        if (validationToken) {
          this.confirmationForm.patchValue({ validationToken });
          if (validationToken !== this.lastAutoValidationToken) {
            this.lastAutoValidationToken = validationToken;
            this.confirmEmail(true);
          }
        }
      });
  }

  onConfirmEmail(): void {
    this.confirmEmail(false);
  }

  onResendEmail(): void {
    this.submittedResend = true;
    this.errorMessage = '';
    this.successMessage = '';

    const emailControl = this.confirmationForm.get('email');
    emailControl?.markAsTouched();
    emailControl?.updateValueAndValidity();

    if (emailControl?.invalid || this.resending || this.confirming) {
      return;
    }

    this.resending = true;

    this.accountAuthService
      .ensureCsrfToken()
      .pipe(
        switchMap(() => this.accountAuthService.resendConfirmationEmail(this.emailValue)),
        finalize(() => (this.resending = false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => {
          this.applyResendResponse(response);
        },
        error: (error: unknown) => {
          this.errorMessage = formatApiError(error);
        },
      });
  }

  isInvalid(controlName: 'email' | 'validationToken'): boolean {
    const control = this.confirmationForm.get(controlName);
    if (!control) {
      return false;
    }

    const submitted = controlName === 'email' ? this.submittedResend : this.submittedValidation;
    return (submitted || control.touched || control.dirty) && control.invalid;
  }

  errorFor(controlName: 'email' | 'validationToken'): string {
    const control = this.confirmationForm.get(controlName);
    if (!control || !this.isInvalid(controlName)) {
      return '';
    }

    if (control.errors?.['required']) {
      return 'Este campo es obligatorio.';
    }

    if (control.errors?.['email']) {
      return 'Ingresa un correo electronico valido.';
    }

    return 'El valor ingresado no es valido.';
  }

  goToLogin(): void {
    void this.router.navigate(['/authentication/signin']);
  }

  private confirmEmail(autoTriggered: boolean): void {
    this.submittedValidation = true;
    this.errorMessage = '';
    this.successMessage = '';

    const validationTokenControl = this.confirmationForm.get('validationToken');
    validationTokenControl?.markAsTouched();
    validationTokenControl?.updateValueAndValidity();

    if (validationTokenControl?.invalid || this.confirming || this.resending) {
      return;
    }

    const payload = parseValidationToken(this.validationTokenValue);
    if (!payload) {
      this.errorMessage = 'El token de validacion no es valido. Pega el token recibido por correo o el link completo.';
      return;
    }

    this.confirming = true;

    this.accountAuthService
      .ensureCsrfToken()
      .pipe(
        switchMap(() => this.accountAuthService.confirmEmail(payload)),
        finalize(() => (this.confirming = false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => {
          this.successMessage = response.Message;
          if (!autoTriggered) {
            this.confirmationForm.patchValue({ validationToken: this.validationTokenValue.trim() });
          }
        },
        error: (error: unknown) => {
          this.errorMessage = formatApiError(error);
        },
      });
  }

  private applyNavigationState(): void {
    const navigationState = (history.state?.['registerResult'] ??
      history.state?.['emailDispatchResult']) as RegisterResultPayload | EmailConfirmationDispatchResultPayload | undefined;
    if (!navigationState) {
      return;
    }

    if (navigationState.Email) {
      this.confirmationForm.patchValue({ email: navigationState.Email });
    }

    if (navigationState.ValidationToken) {
      this.confirmationForm.patchValue({ validationToken: navigationState.ValidationToken });
    }

    if (navigationState.Message) {
      this.infoMessage = navigationState.Message;
    }
  }

  private applyResendResponse(response: EmailConfirmationDispatchResultPayload): void {
    this.successMessage = response.Message?.trim() || 'Se ha enviado un nuevo correo electronico de confirmacion.';

    if (response.Email) {
      this.confirmationForm.patchValue({ email: response.Email });
    }

    if (response.ValidationToken) {
      this.confirmationForm.patchValue({ validationToken: response.ValidationToken });
    }
  }

  private get emailValue(): string {
    return this.controlValue('email');
  }

  private get validationTokenValue(): string {
    return this.controlValue('validationToken');
  }

  private controlValue(controlName: 'email' | 'validationToken'): string {
    return (this.confirmationForm.get(controlName)?.value ?? '').toString().trim();
  }
}

function parseValidationToken(input: string): { userId: string; token: string } | null {
  const rawValue = input.trim();
  if (!rawValue) {
    return null;
  }

  const extractedPayload = extractValidationPayload(rawValue);
  if (!extractedPayload) {
    return null;
  }

  if (typeof extractedPayload !== 'string') {
    return extractedPayload;
  }

  try {
    const decodedJson = decodeBase64Url(extractedPayload);
    const parsed = JSON.parse(decodedJson) as { UserId?: string; userId?: string; Token?: string; token?: string };
    const userId = (parsed.UserId ?? parsed.userId ?? '').trim();
    const token = (parsed.Token ?? parsed.token ?? '').trim();

    return userId && token ? { userId, token } : null;
  } catch {
    return null;
  }
}

function extractValidationPayload(value: string): string | { userId: string; token: string } | null {
  const trimmed = value.trim();

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const url = new URL(trimmed);
      const validationToken =
        url.searchParams.get('validationToken')?.trim() ??
        url.searchParams.get('validationtoken')?.trim() ??
        '';

      if (validationToken) {
        if (/^https?:\/\//i.test(validationToken)) {
          return extractValidationPayload(validationToken);
        }

        return validationToken;
      }

      const userId = url.searchParams.get('userId')?.trim() ?? url.searchParams.get('userid')?.trim() ?? '';
      const token = url.searchParams.get('token')?.trim() ?? '';

      return userId && token ? { userId, token } : null;
    } catch {
      return null;
    }
  }

  return trimmed;
}

function decodeBase64Url(value: string): string {
  const normalizedValue = value.replace(/-/g, '+').replace(/_/g, '/');
  const paddingLength = (4 - (normalizedValue.length % 4)) % 4;
  const paddedValue = normalizedValue + '='.repeat(paddingLength);
  return atob(paddedValue);
}
