
import { Component, Inject, DOCUMENT } from '@angular/core';
import { Event, Router, NavigationStart, NavigationEnd, RouterModule } from '@angular/router';

import { PageLoaderComponent } from './layout/page-loader/page-loader.component';
import { DominiosModule } from './dominios/dominios.module';

@Component({
    selector: 'app-root',
    imports: [
    RouterModule,
    PageLoaderComponent,
    DominiosModule
],
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
  private readonly supportedMenuTypes = new Set(['horizontal', 'vertical', 'floating']);

  currentUrl!: string;

  // rutas donde NO se debe aplicar menú
  noMenuRoutes = [
    '/authentication/signin',
    '/authentication/signup',
    '/authentication/confirm-email',
    '/authentication/forgot',
    '/authentication/reset'
  ];

  constructor(
    public _router: Router,
    @Inject(DOCUMENT) private document: Document
  ) {

    this._router.events.subscribe((routerEvent: Event) => {

      if (routerEvent instanceof NavigationStart) {

        const url = routerEvent.url.split('?')[0]; // limpio query params
        this.currentUrl = url.substring(url.lastIndexOf('/') + 1);

        // ---- LIMPIAR MENÚ EN RUTAS SIN MENÚ ----
        if (this.noMenuRoutes.includes(url)) {

          // eliminar TODAS las clases del menú
          this.document.body.classList.remove(
            'menu-horizontal-active',
            'menu-vertical-active',
            'menu-floating-active'
          );
        }

        // ---- RESTAURAR MENÚ EN OTRAS RUTAS ----
        else {
          const savedMenu = localStorage.getItem('selectedMenuType');

          if (savedMenu && this.supportedMenuTypes.has(savedMenu)) {
            this.document.body.classList.add(`menu-${savedMenu}-active`);
          }
        }
      }

      if (routerEvent instanceof NavigationEnd) {
        /* vacío */
      }

      window.scrollTo(0, 0);
    });
  }
}
