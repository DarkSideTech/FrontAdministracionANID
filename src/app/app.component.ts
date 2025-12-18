import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { Event, Router, NavigationStart, NavigationEnd, RouterModule } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { PageLoaderComponent } from './layout/page-loader/page-loader.component';
import { DominiosModule } from './dominios/dominios.module';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    PageLoaderComponent,
    DominiosModule
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {

  currentUrl!: string;

  // rutas donde NO se debe aplicar menú
  noMenuRoutes = [
    '/authentication/signin',
    '/authentication/signup',
    '/authentication/forgot-password'
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

          // opcional: guardar que no hay menú activo
          localStorage.setItem('selectedMenuType', 'none');
        }

        // ---- RESTAURAR MENÚ EN OTRAS RUTAS ----
        else {
          const savedMenu = localStorage.getItem('selectedMenuType');

          // evitar restaurar "none"
          if (savedMenu && savedMenu !== 'none') {
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
