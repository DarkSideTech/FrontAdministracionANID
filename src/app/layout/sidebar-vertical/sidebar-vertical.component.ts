import { Router, NavigationEnd, RouterLink } from '@angular/router';
import { NgClass } from '@angular/common';
import { Component, Inject, ElementRef, OnInit, Renderer2, HostListener, OnDestroy, DOCUMENT, effect, inject, Injector } from '@angular/core';
import { RouteInfo } from '../sidebar/sidebar.metadata';
import { TranslateModule } from '@ngx-translate/core';
import { FeatherModule } from 'angular-feather';
import { SafeHtmlPipe } from '../sidebar/pipes/safe-html.pipe';
import { SidebarMenuService } from '../sidebar/sidebar-menu.service';

@Component({
    selector: 'app-sidebar-vertical',
    imports: [
        RouterLink,
        NgClass,
        FeatherModule,
        TranslateModule,
        SafeHtmlPipe
    ],
    templateUrl: './sidebar-vertical.component.html'
})
export class SidebarVerticalComponent implements OnInit, OnDestroy {
  private readonly injector = inject(Injector);
  public sidebarItems!: RouteInfo[];
  public innerHeight?: number;
  public bodyTag!: HTMLElement;
  listMaxHeight?: string;
  listMaxWidth?: string;
  headerHeight = 60;
  routerObj;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private renderer: Renderer2,
    public elementRef: ElementRef,
    private sidebarMenuService: SidebarMenuService,
    private router: Router
  ) {
    this.routerObj = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
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
      this.closeAllSidebarItems(this.sidebarItems);
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

  callToggleMenu(event: Event, item: any) {
    if (item.submenu && item.submenu.length > 0) {
      event.preventDefault();
      item.active = !item.active;

      const siblings = this.getSiblings(item);
      siblings.forEach(sib => sib.active = false);
    }
  }

  getSiblings(item: any) {
    const parent = this.findParent(this.sidebarItems, item);
    if (!parent) return this.sidebarItems.filter(i => i !== item);
    return parent.submenu.filter((i: any) => i !== item);
  }

  findParent(items: any[], child: any): any | null {
    for (const item of items) {
      if (item.submenu && item.submenu.includes(child)) {
        return item;
      } else if (item.submenu && item.submenu.length > 0) {
        const found = this.findParent(item.submenu, child);
        if (found) return found;
      }
    }
    return null;
  }

  ngOnInit() {
    effect(() => {
      this.sidebarItems = this.sidebarMenuService.getMenuItems();
      this.sidebarItems.forEach(item => this.setItemClosed(item));
    }, { injector: this.injector });

    this.initLeftSidebar();
    this.bodyTag = this.document.body;
  }

  setItemClosed(item: any) {
    item.active = false;
    if (item.submenu && item.submenu.length > 0) {
      item.submenu.forEach(sub => this.setItemClosed(sub));
    }
  }

  ngOnDestroy() {
    this.routerObj.unsubscribe();
  }

  initLeftSidebar() {
    this.setMenuHeight();
    this.checkStatuForResize(true);
  }

  setMenuHeight() {
    this.innerHeight = window.innerHeight;
    const height = this.innerHeight - this.headerHeight;
    this.listMaxHeight = height + '';
    this.listMaxWidth = '500px';
  }

  checkStatuForResize(firstTime: boolean) {
    if (window.innerWidth < 1025) {
      this.renderer.addClass(this.document.body, 'sidebar-gone');
    } else {
      this.renderer.removeClass(this.document.body, 'sidebar-gone');
    }
  }

  sidebbarClose() {
    if (window.innerWidth < 1025) {
      this.renderer.addClass(this.document.body, 'sidebar-gone');
    }
  }
}
