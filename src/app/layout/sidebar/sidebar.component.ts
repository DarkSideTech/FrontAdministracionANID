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
  DOCUMENT,
  effect,
  inject,
  Injector,
} from '@angular/core';
import { RouteInfo } from './sidebar.metadata';
import { TranslateModule } from '@ngx-translate/core';
import { FeatherModule } from 'angular-feather';
import { SidebarMenuService } from './sidebar-menu.service';
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
  private readonly injector = inject(Injector);
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
    private sidebarMenuService: SidebarMenuService,
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
    effect(() => {
      this.sidebarItems = this.sidebarMenuService.getMenuItems();
    }, { injector: this.injector });

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
