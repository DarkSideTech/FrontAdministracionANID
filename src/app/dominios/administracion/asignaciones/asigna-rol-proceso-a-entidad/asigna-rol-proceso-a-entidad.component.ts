import { Component, DestroyRef, ViewChild, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatatableComponent, NgxDatatableModule } from '@swimlane/ngx-datatable';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, forkJoin, of, switchMap } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';

import { AccountAuthService } from '@core/auth/account-auth.service';
import { AuthStore } from '@core/auth/auth-store.service';
import { EnumRolesBase } from '@core/enumerations/enum-roles';
import { formatApiError } from '@core/service/api-error.util';
import { ASIGNA_ROL_PROCESO_A_ENTIDAD_PAGE_CONFIG } from '@core/service/controllers/asigna-rol-proceso-a-entidad/asigna-rol-proceso-a-entidad.config';
import {
  AsignaRolProcesoEntidadItem,
  AsignaRolProcesoOrganizacionItem,
  AsignaRolProcesoPoliticaItem,
  AsignaRolProcesoProcesoItem,
  AsignaRolProcesoRolItem,
  PoliticaAsignadaKeyParts,
} from '@core/service/controllers/asigna-rol-proceso-a-entidad/asigna-rol-proceso-a-entidad.models';
import { AsignaRolProcesoAEntidadService } from '@core/service/controllers/asigna-rol-proceso-a-entidad/asigna-rol-proceso-a-entidad.service';
import { GOV_CL_ICON_REGISTRY } from '@core/ui/gob-cl-icons';

const KEY_SEPARATOR = '|';

@Component({
  selector: 'app-asigna-rol-proceso-a-entidad',
  templateUrl: './asigna-rol-proceso-a-entidad.component.html',
  styleUrl: './asigna-rol-proceso-a-entidad.component.scss',
  imports: [
    RouterLink,
    NgxDatatableModule,
  ],
})
export class AsignaRolProcesoAEntidadComponent {
  @ViewChild('entidadesTable', { static: false }) entidadesTable?: DatatableComponent;

  private readonly asignacionService = inject(AsignaRolProcesoAEntidadService);
  private readonly accountAuthService = inject(AccountAuthService);
  private readonly authStore = inject(AuthStore);
  private readonly toastr = inject(ToastrService);
  private readonly destroyRef = inject(DestroyRef);
  private entityLoadRequestId = 0;
  private policyLoadRequestId = 0;

  readonly config = ASIGNA_ROL_PROCESO_A_ENTIDAD_PAGE_CONFIG;
  readonly texts = this.config.texts;
  readonly icons = GOV_CL_ICON_REGISTRY;

  readonly loadingOrganizations = signal(false);
  readonly loadingCatalogs = signal(false);
  readonly loadingEntities = signal(false);
  readonly loadingPolicies = signal(false);
  readonly savingAssignment = signal(false);
  readonly pageError = signal('');
  readonly entityPageError = signal('');
  readonly policyPageError = signal('');
  readonly organizationRows = signal<AsignaRolProcesoOrganizacionItem[]>([]);
  readonly selectedOrganizationId = signal('');
  readonly entityRows = signal<AsignaRolProcesoEntidadItem[]>([]);
  readonly entitySearchTerm = signal('');
  readonly selectedEntity = signal<AsignaRolProcesoEntidadItem | null>(null);
  readonly roleRows = signal<AsignaRolProcesoRolItem[]>([]);
  readonly processRows = signal<AsignaRolProcesoProcesoItem[]>([]);
  readonly roleSearchTerm = signal('');
  readonly processSearchTerm = signal('');
  readonly selectedRoleIds = signal<Set<string>>(new Set<string>());
  readonly selectedProcessIds = signal<Set<string>>(new Set<string>());
  readonly originalPolicyKeys = signal<Set<string>>(new Set<string>());
  readonly currentPolicyKeys = signal<Set<string>>(new Set<string>());
  readonly assignedPolicyRows = signal<AsignaRolProcesoPoliticaItem[]>([]);
  readonly entityPageLimit = signal(this.config.defaultPageLimit);
  readonly pageSizeOptions = this.config.pageSizeOptions;
  readonly scrollBarHorizontal = window.innerWidth < 1200;

  readonly canAccessPage = computed(() =>
    this.authStore.hasRole(EnumRolesBase.Administrador) ||
    this.authStore.hasRole(EnumRolesBase.AdministradorEntidad) ||
    this.authStore.hasRole(EnumRolesBase.AdministradorUnidad),
  );
  readonly selectedEntityRows = computed(() => {
    const selected = this.selectedEntity();
    return selected ? [selected] : [];
  });
  readonly filteredEntityRows = computed(() => {
    const term = this.entitySearchTerm().trim().toLowerCase();
    if (!term) {
      return this.entityRows();
    }

    return this.entityRows().filter((item) =>
      [
        item.nombreUsuario,
        item.correoElectronico,
        item.codigoUnidadOrganizacional,
        item.nombreUnidadOrganizacional,
        item.tipoDeEntidad,
        item.principal ? this.texts.status.active : this.texts.status.inactive,
      ].some((field) => field.toLowerCase().includes(term)),
    );
  });
  readonly filteredRoleRows = computed(() => {
    const term = this.roleSearchTerm().trim().toLowerCase();
    if (!term) {
      return this.roleRows();
    }

    return this.roleRows().filter((item) => item.nombreNormalizado.toLowerCase().includes(term));
  });
  readonly filteredProcessRows = computed(() => {
    const term = this.processSearchTerm().trim().toLowerCase();
    if (!term) {
      return this.processRows();
    }

    return this.processRows().filter((item) =>
      [item.codigo, item.nombre].some((field) => field.toLowerCase().includes(term)),
    );
  });
  readonly canUseAssignmentLists = computed(() =>
    Boolean(this.selectedEntity()) &&
    !this.loadingPolicies() &&
    !this.loadingCatalogs(),
  );
  readonly hasPendingChanges = computed(() => !setsAreEqual(this.originalPolicyKeys(), this.currentPolicyKeys()));
  readonly canSave = computed(() =>
    Boolean(this.selectedEntity()) &&
    this.currentPolicyKeys().size > 0 &&
    this.hasPendingChanges() &&
    !this.savingAssignment(),
  );

  constructor() {
    this.loadInitialData();
  }

  loadInitialData(): void {
    this.pageError.set('');
    this.entityPageError.set('');
    this.policyPageError.set('');
    this.clearSelectionState();

    if (!this.canAccessPage()) {
      this.pageError.set(this.texts.feedback.noPermission);
      return;
    }

    this.loadingOrganizations.set(true);
    this.loadingCatalogs.set(true);

    this.accountAuthService.ensureCsrfToken()
      .pipe(
        switchMap(() => forkJoin({
          organizations: this.asignacionService.buscarOrganizaciones(),
          roles: this.asignacionService.buscarRoles(),
          processes: this.asignacionService.buscarProcesos(),
        })),
        finalize(() => {
          this.loadingOrganizations.set(false);
          this.loadingCatalogs.set(false);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: ({ organizations, roles, processes }) => {
          this.organizationRows.set(organizations);
          this.roleRows.set(roles);
          this.processRows.set(processes);
          this.selectedOrganizationId.set(this.resolveInitialOrganizationId(organizations));

          if (this.selectedOrganizationId()) {
            this.loadEntitiesForSelectedOrganization();
          }
        },
        error: (error: unknown) => {
          this.organizationRows.set([]);
          this.roleRows.set([]);
          this.processRows.set([]);
          this.pageError.set(formatApiError(error) || this.texts.feedback.loadCatalogsError);
        },
      });
  }

  onOrganizationChange(idOrganizacion: string): void {
    this.selectedOrganizationId.set(idOrganizacion);
    this.entitySearchTerm.set('');
    this.clearSelectionState();
    this.loadEntitiesForSelectedOrganization();
  }

  onEntitySearchChange(value: string): void {
    this.entitySearchTerm.set(value);
    if (this.entidadesTable) {
      this.entidadesTable.offset = 0;
    }
  }

  clearEntitySearch(): void {
    this.entitySearchTerm.set('');
    if (this.entidadesTable) {
      this.entidadesTable.offset = 0;
    }
  }

  onRoleSearchChange(value: string): void {
    this.roleSearchTerm.set(value);
  }

  clearRoleSearch(): void {
    this.roleSearchTerm.set('');
  }

  onProcessSearchChange(value: string): void {
    this.processSearchTerm.set(value);
  }

  clearProcessSearch(): void {
    this.processSearchTerm.set('');
  }

  selectEntity(row: AsignaRolProcesoEntidadItem, checked: boolean): void {
    if (!checked) {
      this.clearSelectionState();
      return;
    }

    if (this.selectedEntity()?.idEntidad === row.idEntidad) {
      return;
    }

    this.selectedEntity.set(row);
    this.loadPoliciesForEntity(row.idEntidad);
  }

  isEntitySelected(row: AsignaRolProcesoEntidadItem): boolean {
    return this.selectedEntity()?.idEntidad === row.idEntidad;
  }

  toggleRole(row: AsignaRolProcesoRolItem, checked: boolean): void {
    if (!this.canUseAssignmentLists()) {
      this.toastr.warning(this.texts.feedback.missingEntitySelection);
      return;
    }

    const roles = new Set(this.selectedRoleIds());
    const policies = new Set(this.currentPolicyKeys());

    if (checked) {
      roles.add(row.id);
      for (const idProceso of this.selectedProcessIds()) {
        policies.add(createPolicyKey(row.id, idProceso));
      }
    } else {
      roles.delete(row.id);
      for (const key of policies) {
        if (parsePolicyKey(key).idRol === row.id) {
          policies.delete(key);
        }
      }
    }

    this.selectedRoleIds.set(roles);
    this.currentPolicyKeys.set(policies);
  }

  toggleProcess(row: AsignaRolProcesoProcesoItem, checked: boolean): void {
    if (!this.canUseAssignmentLists()) {
      this.toastr.warning(this.texts.feedback.missingEntitySelection);
      return;
    }

    const processes = new Set(this.selectedProcessIds());
    const policies = new Set(this.currentPolicyKeys());

    if (checked) {
      processes.add(row.id);
      for (const idRol of this.selectedRoleIds()) {
        policies.add(createPolicyKey(idRol, row.id));
      }
    } else {
      processes.delete(row.id);
      for (const key of policies) {
        if (parsePolicyKey(key).idProceso === row.id) {
          policies.delete(key);
        }
      }
    }

    this.selectedProcessIds.set(processes);
    this.currentPolicyKeys.set(policies);
  }

  isRoleSelected(row: AsignaRolProcesoRolItem): boolean {
    return this.selectedRoleIds().has(row.id);
  }

  isProcessSelected(row: AsignaRolProcesoProcesoItem): boolean {
    return this.selectedProcessIds().has(row.id);
  }

  changeEntityPageLimit(value: string): void {
    this.entityPageLimit.set(Number(value));
    if (this.entidadesTable) {
      this.entidadesTable.offset = 0;
    }
  }

  clearScreen(): void {
    this.entitySearchTerm.set('');
    this.roleSearchTerm.set('');
    this.processSearchTerm.set('');
    this.clearSelectionState();
    this.loadEntitiesForSelectedOrganization();
  }

  saveAssignments(): void {
    const entity = this.selectedEntity();

    if (!entity) {
      this.toastr.warning(this.texts.feedback.missingEntitySelection);
      return;
    }

    if (this.currentPolicyKeys().size === 0) {
      this.toastr.warning(this.texts.feedback.missingPolicySelection);
      return;
    }

    const policiesToCreate = this.getPoliciesToCreate();
    const policiesToDelete = this.getPoliciesToDelete();

    if (policiesToCreate.length === 0 && policiesToDelete.length === 0) {
      this.toastr.info(this.texts.feedback.missingChanges);
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

      this.savingAssignment.set(true);
      this.accountAuthService.ensureCsrfToken()
        .pipe(
          switchMap(() => forkJoin({
            create: policiesToCreate.length
              ? this.asignacionService.sincronizarPoliticasAsignadas('CREAR', entity.idEntidad, policiesToCreate)
              : of(void 0),
            delete: policiesToDelete.length
              ? this.asignacionService.sincronizarPoliticasAsignadas('ELIMINAR', entity.idEntidad, policiesToDelete)
              : of(void 0),
          })),
          finalize(() => this.savingAssignment.set(false)),
          takeUntilDestroyed(this.destroyRef),
        )
        .subscribe({
          next: () => {
            this.toastr.success(this.texts.feedback.saveSuccess);
            this.loadPoliciesForEntity(entity.idEntidad);
          },
          error: (error: unknown) => {
            this.toastr.error(formatApiError(error) || this.texts.feedback.saveError);
            this.loadPoliciesForEntity(entity.idEntidad);
          },
        });
    });
  }

  getPrincipalLabel(value: boolean): string {
    return value ? this.texts.status.active : this.texts.status.inactive;
  }

  getProcessLabel(row: AsignaRolProcesoProcesoItem): string {
    return row.codigo ? `${row.codigo} - ${row.nombre}` : row.nombre;
  }

  get hasEntitySearchTerm(): boolean {
    return this.entitySearchTerm().trim().length > 0;
  }

  get hasRoleSearchTerm(): boolean {
    return this.roleSearchTerm().trim().length > 0;
  }

  get hasProcessSearchTerm(): boolean {
    return this.processSearchTerm().trim().length > 0;
  }

  private loadEntitiesForSelectedOrganization(): void {
    const idOrganizacion = this.selectedOrganizationId();
    if (!idOrganizacion) {
      this.entityRows.set([]);
      this.clearSelectionState();
      this.entityPageError.set(this.texts.feedback.missingOrganizationContext);
      return;
    }

    const requestId = ++this.entityLoadRequestId;
    this.entityPageError.set('');
    this.loadingEntities.set(true);

    this.asignacionService.buscarEntidadesPorOrganizacion(idOrganizacion)
      .pipe(
        finalize(() => {
          if (requestId === this.entityLoadRequestId) {
            this.loadingEntities.set(false);
          }
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (entities) => {
          if (requestId !== this.entityLoadRequestId) {
            return;
          }

          this.entityRows.set(entities);
          this.clearSelectionState();
        },
        error: (error: unknown) => {
          if (requestId !== this.entityLoadRequestId) {
            return;
          }

          this.entityRows.set([]);
          this.clearSelectionState();
          this.entityPageError.set(formatApiError(error) || this.texts.feedback.loadEntitiesError);
        },
      });
  }

  private loadPoliciesForEntity(idEntidad: string): void {
    const requestId = ++this.policyLoadRequestId;
    this.policyPageError.set('');
    this.loadingPolicies.set(true);
    this.clearPolicyState();

    this.asignacionService.buscarPoliticasAsignadas(idEntidad)
      .pipe(
        finalize(() => {
          if (requestId === this.policyLoadRequestId) {
            this.loadingPolicies.set(false);
          }
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (policies) => {
          if (requestId !== this.policyLoadRequestId || this.selectedEntity()?.idEntidad !== idEntidad) {
            return;
          }

          this.assignedPolicyRows.set(policies);
          const keys = new Set(policies.map((item) => createPolicyKey(item.idRol, item.idProceso)));
          this.originalPolicyKeys.set(new Set(keys));
          this.currentPolicyKeys.set(new Set(keys));
          this.selectedRoleIds.set(new Set(policies.map((item) => item.idRol)));
          this.selectedProcessIds.set(new Set(policies.map((item) => item.idProceso)));
        },
        error: (error: unknown) => {
          if (requestId !== this.policyLoadRequestId) {
            return;
          }

          this.clearPolicyState();
          this.policyPageError.set(formatApiError(error) || this.texts.feedback.loadPoliciesError);
        },
      });
  }

  private resolveInitialOrganizationId(organizations: AsignaRolProcesoOrganizacionItem[]): string {
    const selectedOrganizationCode = this.authStore.selectedOrganizationCode()?.trim().toUpperCase();
    const sessionOrganization = organizations.find((item) => item.codigo.trim().toUpperCase() === selectedOrganizationCode);
    return sessionOrganization?.id ?? organizations[0]?.id ?? '';
  }

  private clearSelectionState(): void {
    this.policyLoadRequestId++;
    this.selectedEntity.set(null);
    this.clearPolicyState();
  }

  private clearPolicyState(): void {
    this.selectedRoleIds.set(new Set<string>());
    this.selectedProcessIds.set(new Set<string>());
    this.originalPolicyKeys.set(new Set<string>());
    this.currentPolicyKeys.set(new Set<string>());
    this.assignedPolicyRows.set([]);
  }

  private getPoliciesToCreate(): PoliticaAsignadaKeyParts[] {
    const original = this.originalPolicyKeys();
    return Array.from(this.currentPolicyKeys())
      .filter((key) => !original.has(key))
      .map((key) => parsePolicyKey(key));
  }

  private getPoliciesToDelete(): PoliticaAsignadaKeyParts[] {
    const current = this.currentPolicyKeys();
    return Array.from(this.originalPolicyKeys())
      .filter((key) => !current.has(key))
      .map((key) => parsePolicyKey(key));
  }
}

function createPolicyKey(idRol: string, idProceso: string): string {
  return `${idRol}${KEY_SEPARATOR}${idProceso}`;
}

function parsePolicyKey(key: string): PoliticaAsignadaKeyParts {
  const [idRol = '', idProceso = ''] = key.split(KEY_SEPARATOR);
  return { idRol, idProceso };
}

function setsAreEqual(left: Set<string>, right: Set<string>): boolean {
  if (left.size !== right.size) {
    return false;
  }

  for (const value of left) {
    if (!right.has(value)) {
      return false;
    }
  }

  return true;
}
