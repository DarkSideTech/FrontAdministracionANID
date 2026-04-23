import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { take } from 'rxjs/operators';

import { AccountAuthService } from '@core/auth/account-auth.service';
import { clearAuthProvider, usesClaveUnicaAuthProvider } from '@core/auth/clave-unica-session';
import { environment } from 'environments/environment';

@Component({
  selector: 'app-logout',
  imports: [],
  templateUrl: './logout.component.html',
  styleUrl: './logout.component.scss',
})
export class LogoutComponent {
  private readonly accountAuthService = inject(AccountAuthService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    const closeClaveUnicaSession = usesClaveUnicaAuthProvider();
    clearAuthProvider();

    this.accountAuthService.logout(false).pipe(take(1)).subscribe({
      next: () => this.finishLogout(closeClaveUnicaSession),
      error: () => this.finishLogout(closeClaveUnicaSession),
    });
  }

  private finishLogout(closeClaveUnicaSession: boolean): void {
    if (closeClaveUnicaSession) {
      const redirect = encodeURIComponent(environment.uriLogoutClaveUnica);
      window.location.href = `${environment.claveUnicaLogoutUrl}?redirect=${redirect}`;
      return;
    }

    void this.router.navigateByUrl('/authentication/signin');
  }
}
