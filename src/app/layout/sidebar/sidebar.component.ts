import { Router, NavigationEnd, RouterLink, RouterLinkActive } from '@angular/router';
import { NgClass } from '@angular/common';
import {
  Component,
  Inject,
  ElementRef,
  OnInit,
  Renderer2,
  HostListener,
  OnDestroy,
  DOCUMENT
} from '@angular/core';
import { ROUTES } from './sidebar-items';
import { RouteInfo } from './sidebar.metadata';
import { TranslateModule } from '@ngx-translate/core';
import { FeatherModule } from 'angular-feather';
import { AuthService } from '@core';
@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.sass'],
    imports: [
        RouterLink,
        RouterLinkActive,
        NgClass,
        FeatherModule,
        TranslateModule,
    ]
})
export class SidebarComponent implements OnInit, OnDestroy {
  public sidebarItems!: RouteInfo[];
  public innerHeight?: number;
  public bodyTag!: HTMLElement;
  listMaxHeight?: string;
  listMaxWidth?: string;
  userFullName?: string;
  userImg?: string;
  userType?: string;
  headerHeight = 60;
  currentRoute?: string;
  routerObj;

  listRoles = [
    { text: 'Admin' },
    { text: 'Postulante' },
    { text: 'Ministro De Fe' },
  ];

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private renderer: Renderer2,
    public elementRef: ElementRef,
    private authService: AuthService,
    private router: Router
  ) {
    this.routerObj = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // close sidebar on mobile screen after menu select
        this.renderer.removeClass(this.document.body, 'overlay-open');
        this.sidebbarClose();
      }
    });
  }
  @HostListener('window:resize')
  windowResizecall() {
    if (window.innerWidth < 1025) {
      this.renderer.removeClass(this.document.body, 'side-closed');
    }
    this.setMenuHeight();
    this.checkStatuForResize(false);
  }
  @HostListener('document:mousedown', ['$event'])
onGlobalClick(event: Event): void {
  if (!this.elementRef.nativeElement.contains(event.target)) {
    // Cierra overlay
    this.renderer.removeClass(this.document.body, 'overlay-open');
    this.sidebbarClose();

    // 🔹 Cierra todos los menús activos
    const activeItems = this.elementRef.nativeElement.querySelectorAll('li.active');
    activeItems.forEach((item: HTMLElement) => {
      this.renderer.removeClass(item, 'active');
    });
  }
}
  callToggleMenu(event: Event, length: number) {
  if (length > 0) {
    const parentElement = (event.target as HTMLElement).closest('li');

    if (parentElement) {
      // 🔹 Cerrar todos los demás items activos
      const allItems = parentElement.parentElement?.querySelectorAll('li.active');
      allItems?.forEach((item) => {
        if (item !== parentElement) {
          this.renderer.removeClass(item, 'active');
        }
      });

      // 🔹 Alternar el estado solo en el seleccionado
      if (parentElement.classList.contains('active')) {
        this.renderer.removeClass(parentElement, 'active');
      } else {
        this.renderer.addClass(parentElement, 'active');
      }
    }
  }
}
  ngOnInit() {
    if (this.authService.currentUserValue) {
      this.sidebarItems = ROUTES.filter((sidebarItem) => sidebarItem);

      for (const item of this.sidebarItems) {
        switch (item.title) {
          case 'Administración': {
            item.active = true;
            break;
          }
          case 'Postulación': {
            if (this.authService.currentUserValue.UserName === 'usuario1@anid.cl'
              || this.authService.currentUserValue.UserName === 'usuario4@anid.cl'
              || this.authService.currentUserValue.UserName === 'usuario5@anid.cl'
              || this.authService.currentUserValue.UserName === 'usuario6@anid.cl'
            ) {
              item.active = true;
            } else {
              item.active = false;
            }
            break;
          }
          case 'Selección Formalización': {
            if (this.authService.currentUserValue.UserName === 'usuario1@anid.cl'
              || this.authService.currentUserValue.UserName === 'usuario4@anid.cl'
            ) {
              item.active = true;
            } else {
              item.active = false;
            }
            break;
          }
          case 'Seguimiento Financiero': {
            if (this.authService.currentUserValue.UserName === 'usuario1@anid.cl'
              || this.authService.currentUserValue.UserName === 'usuario5@anid.cl'
            ) {
              item.active = true;
            } else {
              item.active = false;
            }
            break;
          }
          case 'Seguimiento Técnico': {
            if (this.authService.currentUserValue.UserName === 'usuario1@anid.cl'
              || this.authService.currentUserValue.UserName === 'usuario5@anid.cl'
              || this.authService.currentUserValue.UserName === 'usuario6@anid.cl'
            ) {
              item.active = true;
            } else {
              item.active = false;
            }
            break;
          }
          case 'Productividad Científica': {
            if (this.authService.currentUserValue.UserName === 'usuario1@anid.cl'
              || this.authService.currentUserValue.UserName === 'usuario6@anid.cl'
            ) {
              item.active = true;
            } else {
              item.active = false;
            }
            break;
          }
          case 'Expediente': {
            if (this.authService.currentUserValue.UserName === 'usuario1@anid.cl'
              || this.authService.currentUserValue.UserName === 'usuario4@anid.cl'
            ) {
              item.active = true;
            } else {
              item.active = false;
            }
            break;
          }
        }

        if (item.submenu && item.submenu.length > 0) {
          for (const item1 of item.submenu) {
            switch (item1.title) {
              case 'Mi Perfil': {
                item1.active = true;
                break;
              }
              case 'Paneles': {
                if (this.authService.currentUserValue.UserName === 'usuario1@anid.cl'
                  || this.authService.currentUserValue.UserName === 'usuario2@anid.cl'
                  || this.authService.currentUserValue.UserName === 'usuario3@anid.cl'
                  || this.authService.currentUserValue.UserName === 'usuario4@anid.cl'
                  || this.authService.currentUserValue.UserName === 'usuario5@anid.cl'
                  || this.authService.currentUserValue.UserName === 'usuario6@anid.cl'
                ) {
                  item1.active = true;
                } else {
                  item1.active = false;
                }
                break;
              }
              case 'Validaciones': {
                if (this.authService.currentUserValue.UserName === 'usuario1@anid.cl'
                  || this.authService.currentUserValue.UserName === 'usuario2@anid.cl'
                ) {
                  item1.active = true;
                } else {
                  item1.active = false;
                }
                break;
              }
              case 'Asignaciones': {
                if (this.authService.currentUserValue.UserName === 'usuario1@anid.cl'
                  || this.authService.currentUserValue.UserName === 'usuario2@anid.cl'
                  || this.authService.currentUserValue.UserName === 'usuario3@anid.cl'
                ) {
                  item1.active = true;
                } else {
                  item1.active = false;
                }
                break;
              }
              case 'Entidades': {
                if (this.authService.currentUserValue.UserName === 'usuario1@anid.cl'
                  || this.authService.currentUserValue.UserName === 'usuario2@anid.cl'
                ) {
                  item1.active = true;
                } else {
                  item1.active = false;
                }
                break;
              }
              case 'Autenticación': {
                if (this.authService.currentUserValue.UserName === 'usuario1@anid.cl'
                  || this.authService.currentUserValue.UserName === 'usuario2@anid.cl'
                  || this.authService.currentUserValue.UserName === 'usuario3@anid.cl'
                ) {
                  item1.active = true;
                } else {
                  item1.active = false;
                }
                break;
              }
              case 'Convocatoria': {
                if (this.authService.currentUserValue.UserName === 'usuario1@anid.cl'
                  || this.authService.currentUserValue.UserName === 'usuario4@anid.cl'
                ) {
                  item1.active = true;
                } else {
                  item1.active = false;
                }
                break;
              }
              case 'Postular': {
                if (this.authService.currentUserValue.UserName === 'usuario1@anid.cl'
                  || this.authService.currentUserValue.UserName === 'usuario5@anid.cl'
                ) {
                  item1.active = true;
                } else {
                  item1.active = false;
                }
                break;
              }
              case 'Patrocinio Institucional': {
                if (this.authService.currentUserValue.UserName === 'usuario1@anid.cl'
                  || this.authService.currentUserValue.UserName === 'usuario6@anid.cl'
                ) {
                  item1.active = true;
                } else {
                  item1.active = false;
                }
                break;
              }
              case 'Cartas de Recomendación': {
                if (this.authService.currentUserValue.UserName === 'usuario1@anid.cl'
                  || this.authService.currentUserValue.UserName === 'usuario4@anid.cl'
                ) {
                  item1.active = true;
                } else {
                  item1.active = false;
                }
                break;
              }
              case 'Admisibilidad': {
                if (this.authService.currentUserValue.UserName === 'usuario1@anid.cl'
                  || this.authService.currentUserValue.UserName === 'usuario4@anid.cl'
                ) {
                  item1.active = true;
                } else {
                  item1.active = false;
                }
                break;
              }
              case 'Evaluación': {
                if (this.authService.currentUserValue.UserName === 'usuario1@anid.cl'
                  || this.authService.currentUserValue.UserName === 'usuario4@anid.cl'
                ) {
                  item1.active = true;
                } else {
                  item1.active = false;
                }
                break;
              }
              case 'Fallo': {
                if (this.authService.currentUserValue.UserName === 'usuario1@anid.cl'
                  || this.authService.currentUserValue.UserName === 'usuario4@anid.cl'
                ) {
                  item1.active = true;
                } else {
                  item1.active = false;
                }
                break;
              }
              case 'Firma Convenio': {
                if (this.authService.currentUserValue.UserName === 'usuario1@anid.cl'
                  || this.authService.currentUserValue.UserName === 'usuario4@anid.cl'
                ) {
                  item1.active = true;
                } else {
                  item1.active = false;
                }
                break;
              }
              case 'Mis Proyectos / Presupuesto': {
                if (this.authService.currentUserValue.UserName === 'usuario1@anid.cl'
                  || this.authService.currentUserValue.UserName === 'usuario5@anid.cl'
                ) {
                  item1.active = true;
                } else {
                  item1.active = false;
                }
                break;
              }
              case 'Rendiciones': {
                if (this.authService.currentUserValue.UserName === 'usuario1@anid.cl'
                  || this.authService.currentUserValue.UserName === 'usuario5@anid.cl'
                ) {
                  item1.active = true;
                } else {
                  item1.active = false;
                }
                break;
              }
              case 'Mis Proyectos / Informes': {
                if (this.authService.currentUserValue.UserName === 'usuario1@anid.cl'
                  || this.authService.currentUserValue.UserName === 'usuario5@anid.cl'
                  || this.authService.currentUserValue.UserName === 'usuario6@anid.cl'
                ) {
                  item1.active = true;
                } else {
                  item1.active = false;
                }
                break;
              }
              case 'Portal del Investigador': {
                if (this.authService.currentUserValue.UserName === 'usuario1@anid.cl'
                  || this.authService.currentUserValue.UserName === 'usuario6@anid.cl'
                ) {
                  item1.active = true;
                } else {
                  item1.active = false;
                }
                break;
              }
              case 'Repositorio ANID': {
                if (this.authService.currentUserValue.UserName === 'usuario1@anid.cl'
                  || this.authService.currentUserValue.UserName === 'usuario6@anid.cl'
                ) {
                  item1.active = true;
                } else {
                  item1.active = false;
                }
                break;
              }
              case 'Datos Abiertos': {
                if (this.authService.currentUserValue.UserName === 'usuario1@anid.cl'
                  || this.authService.currentUserValue.UserName === 'usuario6@anid.cl'
                ) {
                  item1.active = true;
                } else {
                  item1.active = false;
                }
                break;
              }
              case 'Expediente Electrónico': {
                if (this.authService.currentUserValue.UserName === 'usuario1@anid.cl'
                  || this.authService.currentUserValue.UserName === 'usuario4@anid.cl'
                ) {
                  item1.active = true;
                } else {
                  item1.active = false;
                }
                break;
              }
            }

            if (item1.submenu && item1.submenu.length > 0) {
              for (const item2 of item1.submenu) {
                switch (item2.title) {
                  case 'Estadísticas Usuarios': {
                    if (this.authService.currentUserValue.UserName === 'usuario1@anid.cl'
                      || this.authService.currentUserValue.UserName === 'usuario2@anid.cl'
                      || this.authService.currentUserValue.UserName === 'usuario3@anid.cl'
                    ) {
                      item2.active = true;
                    } else {
                      item2.active = false;
                    }
                    break;
                  }
                  case 'Valida Enrrolamiento': {
                    if (this.authService.currentUserValue.UserName === 'usuario1@anid.cl') {
                      item2.active = true;
                    } else {
                      item2.active = false;
                    }
                    break;
                  }
                  case 'Valida Asignación Rol a Perfil-Entidad': {
                    if (this.authService.currentUserValue.UserName === 'usuario1@anid.cl'
                      || this.authService.currentUserValue.UserName === 'usuario2@anid.cl'
                      || this.authService.currentUserValue.UserName === 'usuario3@anid.cl'
                    ) {
                      item2.active = true;
                    } else {
                      item2.active = false;
                    }
                    break;
                  }
                  case 'Crea Perfil Usuario': {
                    if (this.authService.currentUserValue.UserName === 'usuario1@anid.cl'
                      || this.authService.currentUserValue.UserName === 'usuario2@anid.cl'
                      || this.authService.currentUserValue.UserName === 'usuario3@anid.cl'
                    ) {
                      item2.active = true;
                    } else {
                      item2.active = false;
                    }
                    break;
                  }
                  case 'Asigna Roles a Perfiles': {
                    if (this.authService.currentUserValue.UserName === 'usuario1@anid.cl'
                      || this.authService.currentUserValue.UserName === 'usuario2@anid.cl'
                      || this.authService.currentUserValue.UserName === 'usuario3@anid.cl'
                    ) {
                      item2.active = true;
                    } else {
                      item2.active = false;
                    }
                    break;
                  }
                  case 'Asigna Dependencia Entidades': {
                    if (this.authService.currentUserValue.UserName === 'usuario1@anid.cl') {
                      item2.active = true;
                    } else {
                      item2.active = false;
                    }
                    break;
                  }
                  case 'Usuario': {
                    if (this.authService.currentUserValue.UserName === 'usuario1@anid.cl') {
                      item2.active = true;
                    } else {
                      item2.active = false;
                    }
                    break;
                  }
                  case 'Proveedor': {
                    if (this.authService.currentUserValue.UserName === 'usuario1@anid.cl') {
                      item2.active = true;
                    } else {
                      item2.active = false;
                    }
                    break;
                  }
                  case 'Entidad': {
                    if (this.authService.currentUserValue.UserName === 'usuario1@anid.cl') {
                      item2.active = true;
                    } else {
                      item2.active = false;
                    }
                    break;
                  }
                  case 'Rol': {
                    if (this.authService.currentUserValue.UserName === 'usuario1@anid.cl') {
                      item2.active = true;
                    } else {
                      item2.active = false;
                    }
                    break;
                  }
                }
              }
            }
          }
        }
      }
    }

    this.initLeftSidebar();
    this.bodyTag = this.document.body;
  }
  ngOnDestroy() {
    this.routerObj.unsubscribe();
  }
  initLeftSidebar() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const _this = this;
    // Set menu height
    _this.setMenuHeight();
    _this.checkStatuForResize(true);
  }
  setMenuHeight() {
    this.innerHeight = window.innerHeight;
    const height = this.innerHeight - this.headerHeight;
    this.listMaxHeight = height + '';
    this.listMaxWidth = '500px';
  }
  isOpen() {
    return this.bodyTag.classList.contains('overlay-open');
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  checkStatuForResize(firstTime: boolean) {
    if (window.innerWidth < 1025) {
      this.renderer.addClass(this.document.body, 'sidebar-gone');
    } else {
      this.renderer.removeClass(this.document.body, 'sidebar-gone');
    }
  }
  mouseHover() {
    const body = this.elementRef.nativeElement.closest('body');
    if (body.classList.contains('submenu-closed')) {
      this.renderer.addClass(this.document.body, 'side-closed-hover');
      this.renderer.removeClass(this.document.body, 'submenu-closed');
    }
  }
  mouseOut() {
    const body = this.elementRef.nativeElement.closest('body');
    if (body.classList.contains('side-closed-hover')) {
      this.renderer.removeClass(this.document.body, 'side-closed-hover');
      this.renderer.addClass(this.document.body, 'submenu-closed');
    }
  }

  sidebbarClose() {
    if (window.innerWidth < 1025) {
      this.renderer.addClass(this.document.body, 'sidebar-gone');
    }
  }
}
