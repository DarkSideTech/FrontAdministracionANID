import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { take } from 'rxjs/operators';

import { AccountAuthService } from '@core/auth/account-auth.service';
import {
  createClaveUnicaLogoutUrl,
  getClaveUnicaConfiguration,
  isClaveUnicaConfigured,
} from '@core/auth/clave-unica.config';
import { clearAuthProvider, usesClaveUnicaAuthProvider } from '@core/auth/clave-unica-session';

@Component({
  selector: 'app-logout',
  imports: [],
  templateUrl: './logout.component.html',
  styleUrl: './logout.component.scss',
})
export class LogoutComponent implements OnInit {
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
    const claveUnicaConfiguration = getClaveUnicaConfiguration();
    if (closeClaveUnicaSession && isClaveUnicaConfigured(claveUnicaConfiguration)) {
      window.location.assign(createClaveUnicaLogoutUrl(claveUnicaConfiguration));
      return;
    }

    void this.router.navigateByUrl('/authentication/signin');
  }
}
