import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize, switchMap } from 'rxjs';

import { AccountAuthService } from '@core/auth/account-auth.service';
import { formatApiError } from '@core/service/api-error.util';

@Component({
    selector: 'app-forgot',
    templateUrl: './forgot.component.html',
    styleUrls: ['./forgot.component.sass'],
    imports: [CommonModule, ReactiveFormsModule, RouterLink]
})
export class ForgotComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly accountAuthService = inject(AccountAuthService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly forgotForm = this.formBuilder.nonNullable.group({
    correoElectronico: ['', [Validators.required, Validators.email, Validators.minLength(5)]],
  });

  submitted = false;
  loading = false;
  error = '';

  onSubmit(): void {
    this.submitted = true;
    this.error = '';

    if (this.loading) {
      return;
    }

    if (this.forgotForm.invalid) {
      this.forgotForm.markAllAsTouched();
      this.error = 'Ingresa un correo electronico valido.';
      return;
    }

    const correoElectronico = this.forgotForm.getRawValue().correoElectronico.trim();
    this.loading = true;

    this.accountAuthService
      .ensureCsrfToken()
      .pipe(
        switchMap(() => this.accountAuthService.solicitaRecuperacionClave({ correoElectronico })),
        finalize(() => (this.loading = false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => {
          void this.router.navigate(['/authentication/reset'], {
            queryParams: { email: correoElectronico },
            state: { passwordRecoveryDispatch: response },
          });
        },
        error: (error: unknown) => {
          this.error = formatApiError(error);
        },
      });
  }

  isInvalid(controlName: 'correoElectronico'): boolean {
    const control = this.forgotForm.get(controlName);
    return Boolean(control && (this.submitted || control.touched || control.dirty) && control.invalid);
  }

  errorFor(controlName: 'correoElectronico'): string {
    const control = this.forgotForm.get(controlName);
    if (!control || !this.isInvalid(controlName)) {
      return '';
    }

    if (control.errors?.['required']) {
      return 'Este campo es obligatorio.';
    }

    if (control.errors?.['email']) {
      return 'Ingresa un correo electronico valido.';
    }

    if (control.errors?.['minlength']) {
      return `Debe contener al menos ${control.errors['minlength'].requiredLength} caracteres.`;
    }

    return 'El valor ingresado no es valido.';
  }
}
