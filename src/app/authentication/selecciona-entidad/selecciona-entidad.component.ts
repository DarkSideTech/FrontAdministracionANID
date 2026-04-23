import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal, } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ToastrModule } from 'ngx-toastr';
import { TranslateModule } from '@ngx-translate/core';
import { AccountAuthService } from '@core/auth/account-auth.service';
import { AuthStore } from '@core/auth/auth-store.service';
import { formatApiError } from '@core/service/api-error.util';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'app-selecciona-entidad',
    imports: [
        NgxDatatableModule,
        FormsModule,
        ReactiveFormsModule,
        ToastrModule,
        TranslateModule,
    ],
    templateUrl: './selecciona-entidad.component.html',
    styleUrl: './selecciona-entidad.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SeleccionaEntidadComponent {
  private readonly accountAuthService = inject(AccountAuthService);
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly loadingCode = signal<string | null>(null);
  readonly errorMessage = signal('');
  readonly organizations = computed(() => this.authStore.organizations());

  selectOrganization(code: string | null | undefined): void {
    if (!code) {
      this.errorMessage.set('La organizacion seleccionada no tiene codigo.');
      return;
    }

    this.loadingCode.set(code);
    this.errorMessage.set('');

    this.accountAuthService
      .loginOrganizacion(code)
      .pipe(
        finalize(() => this.loadingCode.set(null)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (snapshot) => {
          void this.router.navigateByUrl(this.accountAuthService.resolveAuthenticatedUrl(snapshot));
        },
        error: (error: unknown) => {
          this.errorMessage.set(formatApiError(error));
        },
      });
  }

  restart(): void {
    this.accountAuthService.logout().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }
}
