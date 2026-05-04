import { Component, DestroyRef, ViewChild, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatatableComponent, NgxDatatableModule } from '@swimlane/ngx-datatable';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { concatMap, finalize, forkJoin, from, of, switchMap, toArray } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';

import { AccountAuthService } from '@core/auth/account-auth.service';
import { AuthStore } from '@core/auth/auth-store.service';
import { EnumRolesBase } from '@core/enumerations/enum-roles';
import { formatApiError } from '@core/service/api-error.util';
import { USUARIO_A_UNIDAD_ORGANIZACIONAL_PAGE_CONFIG } from '@core/service/controllers/usuario-a-unidad-organizacional/usuario-a-unidad-organizacional.config';
import {
  UsuarioUnidadOrganizacionItem,
  UsuarioUnidadOrganizacionalItem,
  UsuarioUnidadUsuarioItem,
} from '@core/service/controllers/usuario-a-unidad-organizacional/usuario-a-unidad-organizacional.models';
import { UsuarioAUnidadOrganizacionalService } from '@core/service/controllers/usuario-a-unidad-organizacional/usuario-a-unidad-organizacional.service';
import { GOV_CL_ICON_REGISTRY } from '@core/ui/gob-cl-icons';

@Component({
  selector: 'app-usuario-a-unidad-organizacional',
  templateUrl: './usuario-a-unidad-organizacional.component.html',
  styleUrl: './usuario-a-unidad-organizacional.component.scss',
  imports: [
    RouterLink,
    NgxDatatableModule,
  ],
})
export class UsuarioAUnidadOrganizacionalComponent {
  @ViewChild('usuariosTable', { static: false }) usuariosTable?: DatatableComponent;
  @ViewChild('unidadesTable', { static: false }) unidadesTable?: DatatableComponent;

  private readonly asignacionService = inject(UsuarioAUnidadOrganizacionalService);
  private readonly accountAuthService = inject(AccountAuthService);
  private readonly authStore = inject(AuthStore);
  private readonly toastr = inject(ToastrService);
  private readonly destroyRef = inject(DestroyRef);
  private usuarioLoadRequestId = 0;
  private assignmentLoadRequestId = 0;

  readonly config = USUARIO_A_UNIDAD_ORGANIZACIONAL_PAGE_CONFIG;
  readonly texts = this.config.texts;
  readonly icons = GOV_CL_ICON_REGISTRY;

  readonly loadingUsers = signal(false);
  readonly loadingUnits = signal(false);
  readonly savingAssignment = signal(false);
  readonly userPageError = signal('');
  readonly unitPageError = signal('');
  readonly userSearchTerm = signal('');
  readonly unitSearchTerm = signal('');
  readonly userRows = signal<UsuarioUnidadUsuarioItem[]>([]);
  readonly organizationRows = signal<UsuarioUnidadOrganizacionItem[]>([]);
  readonly selectedOrganizationId = signal('');
  readonly unitRows = signal<UsuarioUnidadOrganizacionalItem[]>([]);
  readonly selectedUser = signal<UsuarioUnidadUsuarioItem | null>(null);
  readonly selectedUnitIds = signal<Set<string>>(new Set<string>());
  readonly originalUnitIds = signal<Set<string>>(new Set<string>());
  readonly entityIdByUnitId = signal<Map<string, string>>(new Map<string, string>());
  readonly userPageLimit = signal(this.config.defaultPageLimit);
  readonly userCurrentPage = signal(1);
  readonly userTotalCount = signal(0);
  readonly unitPageLimit = signal(this.config.defaultPageLimit);
  readonly pageSizeOptions = this.config.pageSizeOptions;
  readonly scrollBarHorizontal = window.innerWidth < 1200;

  readonly isAdminAnid = computed(() => this.authStore.hasRole(EnumRolesBase.Administrador));
  readonly selectedUserRows = computed(() => {
    const selected = this.selectedUser();
    return selected ? [selected] : [];
  });
  readonly selectedUnitRows = computed(() => {
    const selectedIds = this.selectedUnitIds();
    return this.unitRows().filter((item) => selectedIds.has(item.id));
  });
  readonly filteredUnitRows = computed(() => {
    const term = this.unitSearchTerm().trim().toLowerCase();
    if (!term) {
      return this.unitRows();
    }

    return this.unitRows().filter((item) =>
      [
        item.codigo,
        item.nombre,
        item.descripcion,
        item.activo ? this.texts.status.active : this.texts.status.inactive,
      ].some((field) => field.toLowerCase().includes(term)),
    );
  });
  readonly hasPendingChanges = computed(() => this.getUnitsToCreate().length > 0 || this.getEntitiesToDelete().length > 0);
  readonly canSave = computed(() => Boolean(this.selectedUser()) && this.hasPendingChanges() && !this.savingAssignment());
  readonly canUseUnitsGrid = computed(() =>
    Boolean(this.selectedUser())
    && !this.loadingUnits()
    && (!this.isAdminAnid() || Boolean(this.selectedOrganizationId())),
  );

  constructor() {
    this.loadInitialData();
  }

  loadInitialData(): void {
    this.unitPageError.set('');
    this.loadingUnits.set(true);

    if (this.isAdminAnid()) {
      forkJoin({
        csrf: this.accountAuthService.ensureCsrfToken(),
        organizations: this.asignacionService.buscarOrganizaciones(),
      })
        .pipe(
          switchMap(({ organizations }) => {
            this.organizationRows.set(organizations);
            const selectedOrganizationId = this.resolveInitialOrganizationId(organizations);
            this.selectedOrganizationId.set(selectedOrganizationId);

            if (!selectedOrganizationId) {
              return of([]);
            }

            return this.asignacionService.buscarUnidadesPorOrganizacion(selectedOrganizationId);
          }),
          finalize(() => this.loadingUnits.set(false)),
          takeUntilDestroyed(this.destroyRef),
        )
        .subscribe({
          next: (units) => {
            this.unitRows.set(units);
            this.clearUnitSelectionState();
            this.loadUsersPage();
          },
          error: (error: unknown) => {
            this.organizationRows.set([]);
            this.unitRows.set([]);
            this.clearUnitSelectionState();
            this.unitPageError.set(formatApiError(error) || this.texts.feedback.loadOrganizationsError);
            this.loadUsersPage();
          },
        });
      return;
    }

    this.organizationRows.set([]);
    this.selectedOrganizationId.set('');

    forkJoin({
      csrf: this.accountAuthService.ensureCsrfToken(),
      units: this.asignacionService.buscarUnidadesDelContexto(),
    })
      .pipe(
        finalize(() => this.loadingUnits.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: ({ units }) => {
          this.unitRows.set(units);
          this.clearUnitSelectionState();
          this.loadUsersPage();
        },
        error: (error: unknown) => {
          this.unitRows.set([]);
          this.clearUnitSelectionState();
          this.unitPageError.set(formatApiError(error) || this.texts.feedback.loadUnitsError);
          this.loadUsersPage();
        },
      });
  }

  onOrganizationChange(idOrganizacion: string): void {
    this.selectedOrganizationId.set(idOrganizacion);
    this.unitSearchTerm.set('');
    this.clearSelectedUser();
    this.loadUnitsForSelectedOrganization();
  }

  loadUsersPage(): void {
    const requestId = ++this.usuarioLoadRequestId;
    this.loadingUsers.set(true);
    this.userPageError.set('');

    this.asignacionService.buscarUsuarios({
      numeroDePagina: this.userCurrentPage(),
      cantidadPorPagina: this.userPageLimit(),
      busqueda: this.userSearchTerm().trim(),
    })
      .pipe(
        finalize(() => {
          if (requestId === this.usuarioLoadRequestId) {
            this.loadingUsers.set(false);
          }
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (page) => {
          if (requestId !== this.usuarioLoadRequestId) {
            return;
          }

          this.userRows.set(page.items);
          this.userTotalCount.set(page.total);
          this.userCurrentPage.set(page.numeroDePagina);
          this.clearSelectedUser();
        },
        error: (error: unknown) => {
          if (requestId !== this.usuarioLoadRequestId) {
            return;
          }

          this.userRows.set([]);
          this.userTotalCount.set(0);
          this.clearSelectedUser();
          this.userPageError.set(formatApiError(error) || this.texts.feedback.loadUsersError);
        },
      });
  }

  onUserSearchChange(value: string): void {
    this.userSearchTerm.set(value);
    this.userCurrentPage.set(1);
    this.loadUsersPage();
  }

  clearUserSearch(): void {
    this.userSearchTerm.set('');
    this.userCurrentPage.set(1);
    this.loadUsersPage();
  }

  onUnitSearchChange(value: string): void {
    this.unitSearchTerm.set(value);
    if (this.unidadesTable) {
      this.unidadesTable.offset = 0;
    }
  }

  clearUnitSearch(): void {
    this.unitSearchTerm.set('');
    if (this.unidadesTable) {
      this.unidadesTable.offset = 0;
    }
  }

  selectUser(row: UsuarioUnidadUsuarioItem, checked: boolean): void {
    if (!checked) {
      this.clearSelectedUser();
      return;
    }

    if (this.selectedUser()?.idUsuario === row.idUsuario) {
      return;
    }

    this.selectedUser.set(row);
    this.loadAssignmentsForUser(row);
  }

  selectUnit(row: UsuarioUnidadOrganizacionalItem, checked: boolean): void {
    if (!this.selectedUser()) {
      this.toastr.warning(this.texts.feedback.missingUserSelection);
      return;
    }

    const nextSelection = new Set(this.selectedUnitIds());
    if (checked) {
      nextSelection.add(row.id);
    } else {
      nextSelection.delete(row.id);
    }

    this.selectedUnitIds.set(nextSelection);
  }

  isUserSelected(row: UsuarioUnidadUsuarioItem): boolean {
    return this.selectedUser()?.idUsuario === row.idUsuario;
  }

  isUnitSelected(row: UsuarioUnidadOrganizacionalItem): boolean {
    return this.selectedUnitIds().has(row.id);
  }

  onUserPageChange(event: { page: number }): void {
    this.userCurrentPage.set(event.page);
    this.loadUsersPage();
  }

  onUnitPageChange(event: { page: number }): void {
    if (this.unidadesTable) {
      this.unidadesTable.offset = event.page - 1;
    }
  }

  changeUserPageLimit(value: string): void {
    this.userPageLimit.set(Number(value));
    this.userCurrentPage.set(1);
    this.loadUsersPage();
  }

  changeUnitPageLimit(value: string): void {
    this.unitPageLimit.set(Number(value));
    if (this.unidadesTable) {
      this.unidadesTable.offset = 0;
    }
  }

  clearScreen(): void {
    this.userSearchTerm.set('');
    this.unitSearchTerm.set('');
    this.userCurrentPage.set(1);
    this.clearSelectedUser();
    this.loadInitialData();
  }

  saveAssignments(): void {
    const user = this.selectedUser();

    if (!user) {
      this.toastr.warning(this.texts.feedback.missingUserSelection);
      return;
    }

    const unitsToCreate = this.getUnitsToCreate();
    const entitiesToDelete = this.getEntitiesToDelete();

    if (unitsToCreate.length === 0 && entitiesToDelete.length === 0) {
      this.toastr.info(this.texts.feedback.missingSelection);
      return;
    }

    void Swal.fire({
      title: this.texts.confirm.title,
      text: this.texts.confirm.text,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: this.texts.confirm.accept,
      cancelButtonText: this.texts.confirm.cancel,
    }).then((confirmation) => {
      if (!confirmation.isConfirmed) {
        return;
      }

      const operations = [
        ...unitsToCreate.map((unit) => () => this.asignacionService.crearEntidad({
          id_Usuario: user.idUsuario,
          id_UnidadOrganizacional: unit.id,
          tipoDeEntidad: 'PERSONA',
          correoElectronico: user.correoElectronico,
        })),
        ...entitiesToDelete.map((idEntidad) => () => this.asignacionService.eliminarEntidad({ idEntidad })),
      ];

      this.savingAssignment.set(true);
      this.accountAuthService.ensureCsrfToken()
        .pipe(
          switchMap(() => from(operations)),
          concatMap((operation) => operation()),
          toArray(),
          finalize(() => this.savingAssignment.set(false)),
          takeUntilDestroyed(this.destroyRef),
        )
        .subscribe({
          next: () => {
            this.toastr.success(this.texts.feedback.saveSuccess);
            this.clearScreen();
          },
          error: (error: unknown) => {
            this.toastr.error(formatApiError(error) || this.texts.feedback.saveError);
            this.clearScreen();
          },
        });
      });
  }

  getStatusLabel(active: boolean): string {
    return active ? this.texts.status.active : this.texts.status.inactive;
  }

  get hasUserSearchTerm(): boolean {
    return this.userSearchTerm().trim().length > 0;
  }

  get hasUnitSearchTerm(): boolean {
    return this.unitSearchTerm().trim().length > 0;
  }

  private loadAssignmentsForUser(user: UsuarioUnidadUsuarioItem): void {
    const idOrganizacion = this.isAdminAnid() ? this.selectedOrganizationId() : undefined;
    if (this.isAdminAnid() && !idOrganizacion) {
      this.unitPageError.set(this.texts.feedback.missingOrganizationContext);
      return;
    }

    const requestId = ++this.assignmentLoadRequestId;
    this.unitPageError.set('');
    this.loadingUnits.set(true);
    this.clearUnitSelectionState();

    this.asignacionService.buscarEntidadesUsuarioOrganizacion(user.idUsuario, idOrganizacion)
      .pipe(
        finalize(() => {
          if (requestId === this.assignmentLoadRequestId) {
            this.loadingUnits.set(false);
          }
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (assignments) => {
          if (requestId !== this.assignmentLoadRequestId || this.selectedUser()?.idUsuario !== user.idUsuario) {
            return;
          }

          const selectedIds = new Set(assignments.map((item) => item.idUnidadOrganizacional));
          const entityMap = new Map(assignments.map((item) => [item.idUnidadOrganizacional, item.idEntidad] as const));

          this.originalUnitIds.set(new Set(selectedIds));
          this.selectedUnitIds.set(new Set(selectedIds));
          this.entityIdByUnitId.set(entityMap);
        },
        error: (error: unknown) => {
          if (requestId !== this.assignmentLoadRequestId) {
            return;
          }

          this.clearUnitSelectionState();
          this.unitPageError.set(formatApiError(error) || this.texts.feedback.loadAssignmentsError);
        },
      });
  }

  private loadUnitsForSelectedOrganization(): void {
    const idOrganizacion = this.selectedOrganizationId();
    if (!idOrganizacion) {
      this.unitRows.set([]);
      this.clearUnitSelectionState();
      return;
    }

    this.unitPageError.set('');
    this.loadingUnits.set(true);

    this.asignacionService.buscarUnidadesPorOrganizacion(idOrganizacion)
      .pipe(
        finalize(() => this.loadingUnits.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (units) => {
          this.unitRows.set(units);
          this.clearUnitSelectionState();
        },
        error: (error: unknown) => {
          this.unitRows.set([]);
          this.clearUnitSelectionState();
          this.unitPageError.set(formatApiError(error) || this.texts.feedback.loadUnitsError);
        },
      });
  }

  private resolveInitialOrganizationId(organizations: UsuarioUnidadOrganizacionItem[]): string {
    const currentSelectedId = this.selectedOrganizationId();
    if (currentSelectedId && organizations.some((item) => item.id === currentSelectedId)) {
      return currentSelectedId;
    }

    const selectedOrganizationCode = this.authStore.selectedOrganizationCode()?.trim().toUpperCase();
    const sessionOrganization = organizations.find((item) => item.codigo.trim().toUpperCase() === selectedOrganizationCode);
    return sessionOrganization?.id ?? organizations[0]?.id ?? '';
  }

  private clearSelectedUser(): void {
    this.assignmentLoadRequestId++;
    this.selectedUser.set(null);
    this.clearUnitSelectionState();
  }

  private clearUnitSelectionState(): void {
    this.selectedUnitIds.set(new Set<string>());
    this.originalUnitIds.set(new Set<string>());
    this.entityIdByUnitId.set(new Map<string, string>());
  }

  private getUnitsToCreate(): UsuarioUnidadOrganizacionalItem[] {
    const selectedIds = this.selectedUnitIds();
    const originalIds = this.originalUnitIds();
    return this.unitRows().filter((unit) => selectedIds.has(unit.id) && !originalIds.has(unit.id));
  }

  private getEntitiesToDelete(): string[] {
    const selectedIds = this.selectedUnitIds();
    const entityMap = this.entityIdByUnitId();
    return Array.from(this.originalUnitIds())
      .filter((unitId) => !selectedIds.has(unitId))
      .map((unitId) => entityMap.get(unitId) ?? '')
      .filter(Boolean);
  }
}
