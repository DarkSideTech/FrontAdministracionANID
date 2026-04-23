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
  DOCUMENT,
  inject,
  computed,
  DestroyRef
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { NgbDropdown, NgbDropdownToggle, NgbDropdownMenu } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { FeatherModule } from 'angular-feather';
import { ToastrService } from 'ngx-toastr';
import { InConfiguration, LanguageService, RightSidebarService } from '@core';
import { ConfigService } from '@config/config.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AccountAuthService } from '@core/auth/account-auth.service';
import { AuthStore } from '@core/auth/auth-store.service';
import { OrganizationalUnitEntityRoleOption } from '@core/auth/auth.models';
import { formatApiError } from '@core/service/api-error.util';
import { AppLanguageOption } from '@core/service/language.service';

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
  private static readonly invalidUnitRoleSelectionMessage =
    'La unidad Organizacion y Rol seleccionado no permite cambiar la configuracion, contactarse con el Administrador';

  @Output() menuTypeChanged = new EventEmitter<string>();

  private readonly accountAuthService = inject(AccountAuthService);
  private readonly authStore = inject(AuthStore);
  private readonly destroyRef = inject(DestroyRef);
  private readonly toastr = inject(ToastrService);

  readonly homeView = computed(() => ({
    profile: this.authStore.user(),
    accessTokenType: '',
    authorizedProcesses: [],
  }));
  readonly selectedUnitName = computed(
    () => this.authStore.selectedUnitName() || this.authStore.selectedOrganizationName() || 'Unidad organizacional',
  );
  readonly unitOptions = computed(() => this.authStore.organizationalUnits());
  readonly selectedUnitRoleLabel = computed(() => {
    const selectedOption = this.resolveSelectedUnitOption(
      this.unitOptions(),
      this.authStore.selectedEntityId(),
      this.authStore.selectedEntityRole()?.Id_Rol ?? null,
      this.authStore.selectedUnitCode(),
    );

    return selectedOption
      ? this.formatUnitRoleLabel(selectedOption)
      : this.authStore.selectedUnitCode() || 'Selecciona unidad';
  });



  public config!: InConfiguration;
  isNavbarCollapsed = true;
  flagvalue?: string;
  perfilvalue: string | string[] | undefined;
  entidadvalue: string | string[] | undefined;
  countryName = '';
  langStoreValue?: string;
  perfilStoreValue?: string;
  defaultFlag?: string;
  defaultPerfil?: string;
  defaultEntidad?: string;
  isOpenSidebar?: boolean;
  docElement?: HTMLElement;
  isFullScreen = false;
  isSwitchingUnitContext = false;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private renderer: Renderer2,
    public elementRef: ElementRef,
    private rightSidebarService: RightSidebarService,
    private configService: ConfigService,
    public languageService: LanguageService
  ) {}

  readonly listLang = this.languageService.languageOptions;

  setMenu(type: string) {
    const resolvedType = this.resolveMenuType(type);

    this.menuTypeChanged.emit(resolvedType);

    localStorage.setItem('selectedMenuType', resolvedType);

    this.renderer.removeClass(this.document.body, 'menu-none');
    this.renderer.removeClass(this.document.body, 'menu-horizontal-active');
    this.renderer.removeClass(this.document.body, 'menu-vertical-active');
    this.renderer.removeClass(this.document.body, 'menu-floating-active');

    if (resolvedType === 'horizontal') {
      this.renderer.addClass(this.document.body, 'menu-horizontal-active');
    }

    if (resolvedType === 'vertical') {
      this.renderer.addClass(this.document.body, 'menu-vertical-active');
    }

    if (resolvedType === 'floating') {
      this.renderer.addClass(this.document.body, 'menu-floating-active');
    }
  }

  ngOnInit() {
    this.config = this.configService.configData;
    this.docElement = document.documentElement;

    this.perfilStoreValue = 'Beneficiario Persona';
    this.applyLanguageSelection(this.languageService.getCurrentLanguage());
    this.defaultFlag = this.flagvalue;
    this.defaultPerfil = 'Beneficiario';
    this.defaultEntidad = 'Persona';

    // 🔥 CAMBIO APLICADO AQUÍ — Restaurar correctamente el menú guardado
    this.setMenu(localStorage.getItem('selectedMenuType'));
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

  setLanguage(item: AppLanguageOption) {
    this.applyLanguageSelection(item.code);
    this.languageService.setLanguage(item.code);
  }

  changeUnitContext(option: OrganizationalUnitEntityRoleOption): void {
    const idEntidad = option.Id_Entidad?.trim();
    const idRol = option.Id_Rol?.trim();

    if (!idEntidad || !idRol) {
      this.toastr.error(HeaderComponent.invalidUnitRoleSelectionMessage, '');
      return;
    }

    if (this.isSwitchingUnitContext || this.isCurrentUnitOption(option)) {
      return;
    }

    this.isSwitchingUnitContext = true;
    this.accountAuthService
      .cambioUnidadOrganizacionalEntidadRol(idEntidad, idRol)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.isSwitchingUnitContext = false;
        }),
      )
      .subscribe({
        error: (error) => {
          this.toastr.error(formatApiError(error), '');
        },
      });
  }

  isCurrentUnitOption(option: OrganizationalUnitEntityRoleOption): boolean {
    const selectedEntityId = this.authStore.selectedEntityId();
    const selectedRoleId = this.authStore.selectedEntityRole()?.Id_Rol ?? null;
    const selectedUnitCode = this.authStore.selectedUnitCode() ?? '';

    if (selectedEntityId && selectedRoleId) {
      return (
        option.Id_Entidad?.trim() === selectedEntityId.trim()
        && option.Id_Rol?.trim() === selectedRoleId.trim()
      );
    }

    return option.Codigo_UnidadOrganizacional?.trim() === selectedUnitCode.trim();
  }

  formatUnitRoleLabel(option: OrganizationalUnitEntityRoleOption): string {
    const code = option.Codigo_UnidadOrganizacional?.trim() ?? '';
    const role = option.Nombre_Rol?.trim() ?? '';

    if (code && role) {
      return `${code} - ${role}`;
    }

    return code || role || 'Sin contexto';
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
    this.accountAuthService.logout().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
 }

  private resolveMenuType(type: string | null | undefined): 'horizontal' | 'vertical' | 'floating' {
    switch ((type ?? '').trim()) {
      case 'horizontal':
        return 'horizontal';
      case 'floating':
        return 'floating';
      case 'vertical':
        return 'vertical';
      default:
        return 'vertical';
    }
  }

  private resolveSelectedUnitOption(
    options: OrganizationalUnitEntityRoleOption[],
    selectedEntityId: string | null,
    selectedRoleId: string | null,
    selectedUnitCode: string | null,
  ): OrganizationalUnitEntityRoleOption | null {
    return (
      options.find(
        (option) =>
          option.Id_Entidad?.trim() === (selectedEntityId ?? '').trim()
          && option.Id_Rol?.trim() === (selectedRoleId ?? '').trim(),
      )
      ?? options.find(
        (option) =>
          option.Codigo_UnidadOrganizacional?.trim() === (selectedUnitCode ?? '').trim(),
      )
      ?? null
    );
  }

  private applyLanguageSelection(lang: string): void {
    const selectedLanguage = this.languageService.getLanguageOption(lang);
    this.countryName = selectedLanguage.label;
    this.flagvalue = selectedLanguage.flag;
    this.langStoreValue = selectedLanguage.code;
  }
}
