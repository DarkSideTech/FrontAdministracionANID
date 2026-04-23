import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs/operators';

import { AuthStore } from '@core/auth/auth-store.service';
import { ProcessNavigationService } from '@core/processes/process-navigation.service';

@Component({
  selector: 'app-proceso-iframe',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './proceso-iframe.component.html',
  styleUrls: ['./proceso-iframe.component.sass'],
})
export class ProcesoIframeComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly authStore = inject(AuthStore);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly processNavigationService = inject(ProcessNavigationService);

  private readonly processCode = toSignal(
    this.route.paramMap.pipe(
      map((params) => decodeURIComponent(params.get('code') ?? '').trim()),
    ),
    { initialValue: '' },
  );

  readonly activeProcess = computed(() => this.authStore.findActiveProcess(this.processCode()));
  readonly title = computed(() => this.activeProcess()?.Codigo?.trim() || 'Proceso');
  readonly tooltip = computed(() => this.activeProcess()?.NombreProceso?.trim() || '');
  readonly iframeUrl = computed<SafeResourceUrl | null>(() => {
    const process = this.activeProcess();
    if (!process || !this.processNavigationService.isIframeProcess(process)) {
      return null;
    }

    const resolvedUrl = this.processNavigationService.resolveProcessUrl(process);
    if (!resolvedUrl) {
      return null;
    }

    return this.sanitizer.bypassSecurityTrustResourceUrl(resolvedUrl);
  });
  readonly errorMessage = computed(() => {
    if (!this.activeProcess()) {
      return 'El proceso solicitado no esta disponible para la sesion actual.';
    }

    if (!this.processNavigationService.isIframeProcess(this.activeProcess())) {
      return 'El proceso solicitado no se encuentra configurado para desplegarse como iframe.';
    }

    return 'El proceso no tiene una URL valida para desplegar.';
  });
}
