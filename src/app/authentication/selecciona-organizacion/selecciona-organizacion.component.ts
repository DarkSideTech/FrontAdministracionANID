import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgClass } from '@angular/common';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslateModule } from '@ngx-translate/core';
import { ToastrModule } from 'ngx-toastr';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import { AccountAuthService } from '@core/auth/account-auth.service';
import { AuthStore } from '@core/auth/auth-store.service';

@Component({
    selector: 'app-selecciona-organizacion',
    imports: [
        NgClass,
        NgxDatatableModule,
        FormsModule,
        ReactiveFormsModule,
        ToastrModule,
        TranslateModule,
    ],
    templateUrl: './selecciona-organizacion.component.html',
    styleUrl: './selecciona-organizacion.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SeleccionaOrganizacionComponent {
  private readonly accountAuthService = inject(AccountAuthService);
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(false);
  readonly errorMessage = signal('');
  readonly selectedOrganizationCode = signal<string | null>(null);
  readonly organizations = computed(() => this.authStore.organizations());

  selectOrganization(code: string | null | undefined): void {
    this.errorMessage.set('');
    this.selectedOrganizationCode.set(this.normalizeOrganizationCode(code));
  }

  confirmSelection(): void {
    const organizationCode = this.selectedOrganizationCode();
    if (!organizationCode) {
      this.errorMessage.set('Debes seleccionar una organizacion para continuar.');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    this.accountAuthService
      .loginOrganizacion(organizationCode)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (snapshot) => {
          void this.router.navigateByUrl(this.accountAuthService.resolveAuthenticatedUrl(snapshot));
        },
        error: () => {
          this.logoutAndReturn();
        },
      });
  }

  goBack(): void {
    this.logoutAndReturn();
  }

  private logoutAndReturn(): void {
    this.loading.set(false);
    this.errorMessage.set('');
    this.accountAuthService.logout().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }

  private normalizeOrganizationCode(code: string | null | undefined): string | null {
    const normalizedCode = (code ?? '').trim();
    return normalizedCode || null;
  }
}
