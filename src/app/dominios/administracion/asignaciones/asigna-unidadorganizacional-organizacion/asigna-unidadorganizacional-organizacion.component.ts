import { Component, DestroyRef, ViewChild, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatatableComponent, NgxDatatableModule } from '@swimlane/ngx-datatable';
import { finalize, forkJoin, switchMap } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';

import { AccountAuthService } from '@core/auth/account-auth.service';
import { AuthStore } from '@core/auth/auth-store.service';
import { EnumRolesBase } from '@core/enumerations/enum-roles';
import { formatApiError } from '@core/service/api-error.util';
import { ASIGNA_UNIDAD_ORGANIZACIONAL_ORGANIZACION_PAGE_CONFIG } from '@core/service/controllers/asigna-unidadorganizacional-organizacion/asigna-unidadorganizacional-organizacion.config';
import {
  AsignaUnidadOrganizacionOrganizacionItem,
  AsignaUnidadOrganizacionUnidadItem,
  SincronizarUnidadesOrganizacionResult,
} from '@core/service/controllers/asigna-unidadorganizacional-organizacion/asigna-unidadorganizacional-organizacion.models';
import { AsignaUnidadOrganizacionalOrganizacionService } from '@core/service/controllers/asigna-unidadorganizacional-organizacion/asigna-unidadorganizacional-organizacion.service';

@Component({
  selector: 'app-asigna-unidadorganizacional-organizacion',
  templateUrl: './asigna-unidadorganizacional-organizacion.component.html',
  styleUrl: './asigna-unidadorganizacional-organizacion.component.scss',
  imports: [
    RouterLink,
    NgxDatatableModule,
  ],
})
export class AsignaUnidadOrganizacionalOrganizacionComponent {
  @ViewChild('unidadesTable', { static: false }) unidadesTable?: DatatableComponent;

  private readonly asignacionService = inject(AsignaUnidadOrganizacionalOrganizacionService);
  private readonly accountAuthService = inject(AccountAuthService);
  private readonly authStore = inject(AuthStore);
  private readonly toastr = inject(ToastrService);
  private readonly destroyRef = inject(DestroyRef);
  private loadUnitsRequestId = 0;

  readonly config = ASIGNA_UNIDAD_ORGANIZACIONAL_ORGANIZACION_PAGE_CONFIG;
  readonly texts = this.config.texts;

  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly pageError = signal('');
  readonly searchTerm = signal('');
  readonly organizationRows = signal<AsignaUnidadOrganizacionOrganizacionItem[]>([]);
  readonly unitRows = signal<AsignaUnidadOrganizacionUnidadItem[]>([]);
  readonly selectedOrganizationId = signal('');
  readonly selectedUnitIds = signal<Set<string>>(new Set<string>());
  readonly originalAssignedUnitIds = signal<Set<string>>(new Set<string>());
  readonly pageLimit = signal(this.config.defaultPageLimit);
  readonly pageSizeOptions = this.config.pageSizeOptions;
  readonly scrollBarHorizontal = window.innerWidth < 1200;

  readonly isAdminAnid = computed(() => this.authStore.hasRole(EnumRolesBase.Administrador));
  readonly selectedOrganization = computed(() =>
    this.organizationRows().find((item) => item.id === this.selectedOrganizationId()) ?? null,
  );
  readonly filteredUnitRows = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) {
      return this.unitRows();
    }

    return this.unitRows().filter((item) =>
      [
        item.codigoUnidadOrganizacional,
        item.nombreUnidadOrganizacional,
        item.descripcionUnidadOrganizacional,
        item.codigoOrganizacionActual,
        item.nombreOrganizacionActual,
        item.activo ? this.texts.status.active : this.texts.status.inactive,
      ].some((field) => field.toLowerCase().includes(term)),
    );
  });
  readonly assignedRows = computed(() => {
    const selectedIds = this.selectedUnitIds();
    return this.unitRows().filter((item) => selectedIds.has(item.idUnidadOrganizacional));
  });
  readonly unitsToAssign = computed(() => {
    const selectedIds = this.selectedUnitIds();
    const originalIds = this.originalAssignedUnitIds();
    return this.unitRows().filter((item) =>
      selectedIds.has(item.idUnidadOrganizacional)
      && !originalIds.has(item.idUnidadOrganizacional),
    );
  });
  readonly canSave = computed(() =>
    this.isAdminAnid()
    && Boolean(this.selectedOrganizationId())
    && this.unitsToAssign().length > 0
    && !this.saving()
    && !this.loading(),
  );

  constructor() {
    this.loadInitialData();
  }

  loadInitialData(): void {
    this.loading.set(true);
    this.pageError.set('');

    forkJoin({
      csrf: this.accountAuthService.ensureCsrfToken(),
      organizations: this.asignacionService.buscarOrganizaciones(),
    })
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: ({ organizations }) => {
          this.organizationRows.set(organizations);
          this.selectedOrganizationId.set(this.resolveInitialOrganizationId(organizations));
          this.loadUnits();
        },
        error: (error: unknown) => {
          this.organizationRows.set([]);
          this.selectedOrganizationId.set('');
          this.unitRows.set([]);
          this.clearUnitSelection();
          this.pageError.set(formatApiError(error) || this.texts.feedback.loadOrganizationsError);
        },
      });
  }

  loadUnits(): void {
    const idOrganizacion = this.selectedOrganizationId();
    const requestId = ++this.loadUnitsRequestId;

    if (!idOrganizacion) {
      this.unitRows.set([]);
      this.clearUnitSelection();
      this.pageError.set(this.texts.feedback.missingOrganization);
      return;
    }

    this.loading.set(true);
    this.pageError.set('');

    this.asignacionService.buscarUnidades(idOrganizacion)
      .pipe(
        finalize(() => {
          if (requestId === this.loadUnitsRequestId) {
            this.loading.set(false);
          }
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (units) => {
          if (requestId !== this.loadUnitsRequestId) {
            return;
          }

          this.unitRows.set(units);
          const assignedIds = new Set(
            units
              .filter((item) => item.asignadaAOrganizacion)
              .map((item) => item.idUnidadOrganizacional),
          );
          this.originalAssignedUnitIds.set(new Set(assignedIds));
          this.selectedUnitIds.set(new Set(assignedIds));
          this.resetTablePage();
        },
        error: (error: unknown) => {
          if (requestId !== this.loadUnitsRequestId) {
            return;
          }

          this.unitRows.set([]);
          this.clearUnitSelection();
          this.pageError.set(formatApiError(error) || this.texts.feedback.loadUnitsError);
        },
      });
  }

  onOrganizationChange(idOrganizacion: string): void {
    this.selectedOrganizationId.set(idOrganizacion);
    this.searchTerm.set('');
    this.loadUnits();
  }

  onSearchChange(value: string): void {
    this.searchTerm.set(value);
    this.resetTablePage();
  }

  clearSearch(): void {
    this.searchTerm.set('');
    this.resetTablePage();
  }

  reload(): void {
    this.loadUnits();
  }

  changePageLimit(value: string): void {
    this.pageLimit.set(Number(value));
    this.resetTablePage();
  }

  onPageChange(event: { page: number }): void {
    if (this.unidadesTable) {
      this.unidadesTable.offset = event.page - 1;
    }
  }

  selectUnit(row: AsignaUnidadOrganizacionUnidadItem, checked: boolean): void {
    const selectedOrganizationId = this.selectedOrganizationId();
    if (!selectedOrganizationId) {
      this.toastr.warning(this.texts.feedback.missingOrganization);
      return;
    }

    if (!checked && row.asignadaAOrganizacion) {
      this.toastr.warning(this.texts.feedback.unsupportedUnassign);
      this.selectedUnitIds.set(new Set(this.selectedUnitIds()).add(row.idUnidadOrganizacional));
      return;
    }

    const nextSelection = new Set(this.selectedUnitIds());
    if (checked) {
      nextSelection.add(row.idUnidadOrganizacional);
    } else {
      nextSelection.delete(row.idUnidadOrganizacional);
    }

    this.selectedUnitIds.set(nextSelection);
  }

  isUnitSelected(row: AsignaUnidadOrganizacionUnidadItem): boolean {
    return this.selectedUnitIds().has(row.idUnidadOrganizacional);
  }

  isUnitSelectionDisabled(row: AsignaUnidadOrganizacionUnidadItem): boolean {
    return this.loading()
      || this.saving()
      || !this.isAdminAnid()
      || !this.selectedOrganizationId()
      || row.asignadaAOrganizacion;
  }

  saveAssignments(): void {
    const idOrganizacion = this.selectedOrganizationId();
    const unitsToAssign = this.unitsToAssign();

    if (!idOrganizacion) {
      this.toastr.warning(this.texts.feedback.missingOrganization);
      return;
    }

    if (unitsToAssign.length === 0) {
      this.toastr.info(this.texts.feedback.missingChanges);
      return;
    }

    void Swal.fire({
      title: this.texts.confirm.title,
      html: this.buildConfirmHtml(unitsToAssign),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: this.texts.confirm.accept,
      cancelButtonText: this.texts.confirm.cancel,
    }).then((confirmation) => {
      if (!confirmation.isConfirmed) {
        return;
      }

      this.saving.set(true);
      this.accountAuthService.ensureCsrfToken()
        .pipe(
          switchMap(() => this.asignacionService.sincronizar(
            idOrganizacion,
            unitsToAssign.map((item) => item.idUnidadOrganizacional),
            [],
          )),
          finalize(() => this.saving.set(false)),
          takeUntilDestroyed(this.destroyRef),
        )
        .subscribe({
          next: (result) => {
            this.showSuccess(result);
            this.loadUnits();
          },
          error: (error: unknown) => {
            this.toastr.error(formatApiError(error) || this.texts.feedback.saveError);
            this.loadUnits();
          },
        });
    });
  }

  getStatusLabel(active: boolean): string {
    return active ? this.texts.status.active : this.texts.status.inactive;
  }

  getBooleanLabel(value: boolean): string {
    return value ? this.texts.status.yes : this.texts.status.no;
  }

  getOrganizationLabel(row: AsignaUnidadOrganizacionUnidadItem): string {
    return [row.codigoOrganizacionActual, row.nombreOrganizacionActual].filter(Boolean).join(' - ');
  }

  get hasSearchTerm(): boolean {
    return this.searchTerm().trim().length > 0;
  }

  private resolveInitialOrganizationId(organizations: AsignaUnidadOrganizacionOrganizacionItem[]): string {
    const selectedOrganizationCode = this.authStore.selectedOrganizationCode()?.trim().toUpperCase();
    const sessionOrganization = organizations.find((item) => item.codigo.trim().toUpperCase() === selectedOrganizationCode);
    return sessionOrganization?.id ?? organizations[0]?.id ?? '';
  }

  private clearUnitSelection(): void {
    this.selectedUnitIds.set(new Set<string>());
    this.originalAssignedUnitIds.set(new Set<string>());
  }

  private resetTablePage(): void {
    if (this.unidadesTable) {
      this.unidadesTable.offset = 0;
    }
  }

  private buildConfirmHtml(unitsToAssign: AsignaUnidadOrganizacionUnidadItem[]): string {
    const organization = this.selectedOrganization();
    const organizationLabel = organization ? `${organization.codigo} - ${organization.nombre}` : '';
    const unitList = unitsToAssign
      .slice(0, 8)
      .map((item) =>
        `<li><strong>${escapeHtml(item.codigoUnidadOrganizacional)}</strong> ${escapeHtml(item.nombreUnidadOrganizacional)} desde ${escapeHtml(this.getOrganizationLabel(item))}</li>`,
      )
      .join('');
    const extra = unitsToAssign.length > 8 ? `<li>... y ${unitsToAssign.length - 8} unidades adicionales.</li>` : '';

    return `
      <div class="text-start">
        <p>Las unidades seleccionadas se moveran a <strong>${escapeHtml(organizationLabel)}</strong>.</p>
        <p>Esta accion desasignara la unidad desde su organizacion actual, eliminara las entidades asociadas a esa unidad y tambien eliminara sus politicas asignadas.</p>
        <p>Si existe alguna EntidadBase o PoliticaAsignadaBase asociada, el backend rechazara la operacion completa.</p>
        <ul>${unitList}${extra}</ul>
      </div>
    `;
  }

  private showSuccess(result: SincronizarUnidadesOrganizacionResult): void {
    const details = [
      `${result.reasignadas} reasignadas`,
      `${result.entidadesEliminadas} entidades eliminadas`,
      `${result.politicasAsignadasEliminadas} politicas eliminadas`,
    ].join(', ');
    this.toastr.success(`${this.texts.feedback.saveSuccess} (${details}).`);
  }
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
