import { NgClass } from '@angular/common';
import {
  Component,
  Inject,
  ElementRef,
  OnInit,
  Renderer2,
  AfterViewInit,
  Output,
  EventEmitter,
  DOCUMENT
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NgbDropdown, NgbDropdownToggle, NgbDropdownMenu } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { FeatherModule } from 'angular-feather';
import { AuthService, InConfiguration, LanguageService, RightSidebarService, User } from '@core';
import { ConfigService } from '@config/config.service';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.sass'],
    imports: [
        FeatherModule,
        FormsModule,
        NgbDropdown,
        NgbDropdownToggle,
        NgbDropdownMenu,
        NgClass,
        RouterLink,
        TranslateModule,
    ],
    providers: [RightSidebarService]
})
export class HeaderComponent implements OnInit, AfterViewInit {

  @Output() menuTypeChanged = new EventEmitter<string>();

  public config!: InConfiguration;
  isNavbarCollapsed = true;
  flagvalue: string | string[] | undefined;
  perfilvalue: string | string[] | undefined;
  entidadvalue: string | string[] | undefined;
  countryName: string | string[] = [];
  langStoreValue?: string;
  perfilStoreValue?: string;
  defaultFlag?: string;
  defaultPerfil?: string;
  defaultEntidad?: string;
  isOpenSidebar?: boolean;
  docElement?: HTMLElement;
  isFullScreen = false;
  userLogued: User;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private renderer: Renderer2,
    public elementRef: ElementRef,
    private rightSidebarService: RightSidebarService,
    private configService: ConfigService,
    private authService: AuthService,
    private router: Router,
    public languageService: LanguageService
  ) {}

  listLang = [
    { text: 'English', flag: 'assets/images/flags/us.jpg', lang: 'en' },
    { text: 'Español', flag: 'assets/images/flags/chilean.jpg', lang: 'cl' },
    { text: 'Deutsch', flag: 'assets/images/flags/germany.jpg', lang: 'de' },
  ];

  listPerfiles = [
    { perfil: 'Persona Natural', entidad: 'Persona' },
    { perfil: 'Universidad De Chile', entidad: 'UNIVERSIDAD_DE_CHILE' },
    { perfil: 'Centro De Investigacion USACH 1', entidad: 'CI_USACH_1' },
    { perfil: 'Departamento de Ciencias Sociales U-Catolica', entidad: 'DEPTO_SOCIALES_U_CATOLICA' },
  ];

  setMenu(type: string) {
    this.menuTypeChanged.emit(type);

    localStorage.setItem('selectedMenuType', type);

    this.renderer.removeClass(this.document.body, 'menu-none');
    this.renderer.removeClass(this.document.body, 'menu-horizontal-active');
    this.renderer.removeClass(this.document.body, 'menu-vertical-active');
    this.renderer.removeClass(this.document.body, 'menu-floating-active');

    if (type === 'horizontal') {
      this.renderer.addClass(this.document.body, 'menu-horizontal-active');
    }

    if (type === 'vertical') {
      this.renderer.addClass(this.document.body, 'menu-vertical-active');
    }

    if (type === 'floating') {
      this.renderer.addClass(this.document.body, 'menu-floating-active');
    }
  }

  ngOnInit() {
    this.config = this.configService.configData;
    this.docElement = document.documentElement;

    this.langStoreValue = localStorage.getItem('lang') as string;
    this.perfilStoreValue = 'Beneficiario Persona';
    const val = this.listLang.filter((x) => x.lang === this.langStoreValue);
    this.countryName = val.map((element) => element.text);

    if (this.authService.currentUserValue != null) {
      this.userLogued = this.authService.currentUserValue;
    }

    if (val.length === 0) {
      this.defaultFlag = 'assets/images/flags/chilean.jpg';
      this.defaultPerfil = 'Beneficiario';
      this.defaultEntidad = 'Persona';
    } else {
      this.flagvalue = val.map((element) => element.flag);
      this.defaultPerfil = 'Beneficiario';
      this.defaultEntidad = 'Persona';
    }

    // 🔥 CAMBIO APLICADO AQUÍ — Restaurar correctamente el menú guardado
    const savedMenu = localStorage.getItem('selectedMenuType');
    if (savedMenu) {
      this.setMenu(savedMenu);
    }
  }

  ngAfterViewInit() {
    if (localStorage.getItem('theme')) {
      this.renderer.removeClass(this.document.body, this.config.layout.variant);
      this.renderer.addClass(
        this.document.body,
        localStorage.getItem('theme') as string
      );
    } else {
      this.renderer.addClass(this.document.body, this.config.layout.variant);
    }

    if (localStorage.getItem('menuOption')) {
      this.renderer.addClass(
        this.document.body,
        localStorage.getItem('menuOption') as string
      );
    } else {
      this.renderer.addClass(
        this.document.body,
        this.config.layout.sidebar.backgroundColor + '-sidebar'
      );
    }

    if (localStorage.getItem('sidebar_status')) {
      if (localStorage.getItem('sidebar_status') === 'close') {
        this.renderer.addClass(this.document.body, 'side-closed');
        this.renderer.addClass(this.document.body, 'submenu-closed');
      } else {
        this.renderer.removeClass(this.document.body, 'side-closed');
        this.renderer.removeClass(this.document.body, 'submenu-closed');
      }
    } else {
      if (this.config.layout.sidebar.collapsed === true) {
        this.renderer.addClass(this.document.body, 'side-closed');
        this.renderer.addClass(this.document.body, 'submenu-closed');
      }
    }
  }

  callFullscreen() {
    if (!this.isFullScreen) {
      if (this.docElement?.requestFullscreen != null) {
        this.docElement?.requestFullscreen();
      }
    } else {
      document.exitFullscreen();
    }
    this.isFullScreen = !this.isFullScreen;
  }

  setLanguage(text: string, lang: string, flag: string) {
    this.countryName = text;
    this.flagvalue = flag;
    this.langStoreValue = lang;
    this.languageService.setLanguage(lang);
  }

  setPerfil(perfil: string, entidad: string) {
    this.perfilvalue = entidad;
  }

  mobileMenuSidebarOpen(event: Event, className: string) {
    if (window.innerWidth < 1025) {
      const hasClass = (event.target as HTMLInputElement).classList.contains(className);
      if (hasClass) {
        this.renderer.removeClass(this.document.body, className);
        this.renderer.addClass(this.document.body, 'sidebar-gone');
      } else {
        this.renderer.addClass(this.document.body, className);
        this.renderer.removeClass(this.document.body, 'sidebar-gone');
      }
    } else {
      const hasClass = this.document.body.classList.contains('side-closed');
      if (hasClass) {
        this.renderer.removeClass(this.document.body, 'side-closed');
        this.renderer.removeClass(this.document.body, 'submenu-closed');
      } else {
        this.renderer.addClass(this.document.body, 'side-closed');
        this.renderer.addClass(this.document.body, 'submenu-closed');
      }
    }
  }

  public toggleRightSidebar(): void {
    this.rightSidebarService.sidebarState.subscribe((isRunning) => {
      this.isOpenSidebar = isRunning;
    });

    this.rightSidebarService.setRightSidebar(
      (this.isOpenSidebar = !this.isOpenSidebar)
    );
  }

  logout() {
    this.authService.logout();
  }
}
