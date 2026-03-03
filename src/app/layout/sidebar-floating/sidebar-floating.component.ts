import {
  Component,
  Inject,
  ElementRef,
  Renderer2,
  HostListener,
  OnInit,
  OnDestroy,
  DOCUMENT
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterLink, RouterLinkActive } from '@angular/router';
import { ROUTES } from '../sidebar/sidebar-items';
import { RouteInfo } from '../sidebar/sidebar.metadata';
import { TranslateModule } from '@ngx-translate/core';
import { FeatherModule } from 'angular-feather';
import { AuthService } from '@core';
import { SafeHtmlPipe } from '../sidebar/pipes/safe-html.pipe';


@Component({
    selector: 'app-sidebar-floating',
    imports: [
        CommonModule,
        RouterLink,
        RouterLinkActive,
        FeatherModule,
        TranslateModule,
        SafeHtmlPipe
    ],
    templateUrl: './sidebar-floating.component.html'
})
export class SidebarFloatingComponent implements OnInit, OnDestroy {

  public sidebarItems!: RouteInfo[];
  public panelStack: any[][] = [];

  public innerHeight?: number;
  public bodyTag!: HTMLElement;

  listMaxHeight?: string;
  listMaxWidth?: string;

  headerHeight = 90;
  routerObj: any;

  panelPositions: number[] = [];

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private renderer: Renderer2,
    public elementRef: ElementRef,
    private authService: AuthService,
    public router: Router
  ) {
    this.routerObj = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.closeAll();
      }
    });
  }

  /* -------------------------------------------
     CIERRA AL CLICK FUERA
  ------------------------------------------- */

  @HostListener('document:mousedown', ['$event'])
  onGlobalClick(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.closeAll();
    }
  }

  @HostListener('window:resize')
  windowResizecall() {
    this.setMenuHeight();
    this.checkStatusForResize();
  }

  ngOnInit() {
    this.sidebarItems = ROUTES;
    this.sidebarItems.forEach(item => this.setItemClosed(item));
    this.initFloatingSidebar();
    this.bodyTag = this.document.body;
  }

  ngOnDestroy() {
    this.routerObj.unsubscribe();
  }

  /* -------------------------------------------
     BOTÓN PRINCIPAL
  ------------------------------------------- */

  openMenu() {
    if (this.panelStack.length > 0) {
      this.closeAll();
    } else {
      this.panelStack = [this.sidebarItems];
      this.panelPositions = [0];
    }
  }

  closeAll() {
    this.panelStack = [];
    this.panelPositions = [];
    this.closeAllSidebarItems(this.sidebarItems);
  }

  /* -------------------------------------------
     CLICK EN ITEM
  ------------------------------------------- */

  onItemClick(event: any, item: any, index: number) {

  const li = (event.target as HTMLElement).closest('li');

  this.panelStack[index].forEach(i => i.active = false);

  item.active = true;

  if (item.submenu && item.submenu.length > 0) {
    event.preventDefault();

    const rect = li.getBoundingClientRect();
    const offset = this.headerHeight + 85;
    const newTop = rect.top - offset;

    this.panelStack = this.panelStack.slice(0, index + 1);
    this.panelPositions = this.panelPositions.slice(0, index + 1);

    this.panelStack.push(item.submenu);
    this.panelPositions.push(newTop);
  }
  else {
    this.closeAll();
  }
}

  /* -------------------------------------------
     UTILIDADES
  ------------------------------------------- */

  setItemClosed(item: any) {
    item.active = false;
    if (item.submenu && item.submenu.length > 0) {
      item.submenu.forEach((sub: any) => this.setItemClosed(sub));
    }
  }

  closeAllSidebarItems(items: any[]) {
    items.forEach(item => {
      item.active = false;
      if (item.submenu && item.submenu.length > 0) {
        this.closeAllSidebarItems(item.submenu);
      }
    });
  }

  /* -------------------------------------------
     RESPONSIVE
  ------------------------------------------- */

  initFloatingSidebar() {
    this.setMenuHeight();
    this.checkStatusForResize();
  }

  setMenuHeight() {
    this.innerHeight = window.innerHeight;
    const height = this.innerHeight - this.headerHeight;
    this.listMaxHeight = height + '';
    this.listMaxWidth = '400px';
  }

  checkStatusForResize() {
    if (window.innerWidth < 1025) {
      this.renderer.addClass(this.document.body, 'sidebar-gone');
    } else {
      this.renderer.removeClass(this.document.body, 'sidebar-gone');
    }
  }

}
