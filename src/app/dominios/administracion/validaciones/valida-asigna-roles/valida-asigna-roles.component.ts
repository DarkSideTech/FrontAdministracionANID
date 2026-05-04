import { Component, DestroyRef, ViewChild, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatatableComponent, NgxDatatableModule } from '@swimlane/ngx-datatable';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, finalize, forkJoin, map, of, switchMap } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';

import { AccountAuthService } from '@core/auth/account-auth.service';
import { AuthStore } from '@core/auth/auth-store.service';
import { EnumRolesBase } from '@core/enumerations/enum-roles';
import { formatApiError } from '@core/service/api-error.util';
import { VALIDA_ASIGNA_ROLES_PAGE_CONFIG } from '@core/service/controllers/valida-asigna-roles/valida-asigna-roles.config';
import { ValidaAsignaRolesItem } from '@core/service/controllers/valida-asigna-roles/valida-asigna-roles.models';
import { ValidaAsignaRolesService } from '@core/service/controllers/valida-asigna-roles/valida-asigna-roles.service';
import { GOV_CL_ICON_REGISTRY } from '@core/ui/gob-cl-icons';

type ValidationAttempt =
  | { ok: true; assignment: ValidaAsignaRolesItem }
  | { ok: false; assignment: ValidaAsignaRolesItem; message: string };

@Component({
  selector: 'app-valida-asigna-roles',
  templateUrl: './valida-asigna-roles.component.html',
  styleUrl: './valida-asigna-roles.component.scss',
  imports: [
    RouterLink,
    NgxDatatableModule,
  ],
})
export class ValidaAsignaRolesComponent {
  @ViewChild('asignacionesTable', { static: false }) asignacionesTable?: DatatableComponent;

  private readonly validaAsignaRolesService = inject(ValidaAsignaRolesService);
  private readonly accountAuthService = inject(AccountAuthService);
  private readonly authStore = inject(AuthStore);
  private readonly toastr = inject(ToastrService);
  private readonly destroyRef = inject(DestroyRef);
  private loadRequestId = 0;

  readonly config = VALIDA_ASIGNA_ROLES_PAGE_CONFIG;
  readonly texts = this.config.texts;
  readonly icons = GOV_CL_ICON_REGISTRY;
  readonly pageSizeOptions = this.config.pageSizeOptions;
  readonly scrollBarHorizontal = window.innerWidth < 1200;

  readonly loading = signal(false);
  readonly validating = signal(false);
  readonly pageError = signal('');
  readonly rows = signal<ValidaAsignaRolesItem[]>([]);
  readonly selectedIds = signal<Set<string>>(new Set<string>());
  readonly searchTerm = signal('');
  readonly pageNumber = signal(1);
  readonly pageLimit = signal(this.config.defaultPageLimit);
  readonly total = signal(0);

  readonly canAccessPage = computed(() => this.authStore.hasRole(EnumRolesBase.ValidaAsignacionRoles));
  readonly selectedRows = computed(() => {
    const selected = this.selectedIds();
    return this.rows().filter((row) => selected.has(row.idPoliticaAsignada));
  });
  readonly canValidate = computed(() =>
    this.canAccessPage() &&
    this.selectedIds().size > 0 &&
    !this.loading() &&
    !this.validating(),
  );
  readonly allVisibleRowsSelected = computed(() =>
    this.rows().length > 0 &&
    this.rows().every((row) => this.selectedIds().has(row.idPoliticaAsignada)),
  );

  constructor() {
    this.loadAssignments();
  }

  loadAssignments(): void {
    this.pageError.set('');
    this.clearSelection();

    if (!this.canAccessPage()) {
      this.rows.set([]);
      this.total.set(0);
      this.pageError.set(this.texts.feedback.noPermission);
      return;
    }

    const requestId = ++this.loadRequestId;
    this.loading.set(true);

    this.accountAuthService.ensureCsrfToken()
      .pipe(
        switchMap(() => this.validaAsignaRolesService.buscarAsignacionesPendientes({
          NumeroDePagina: this.pageNumber(),
          CantidadPorPagina: this.pageLimit(),
          Busqueda: this.searchTerm().trim(),
        })),
        finalize(() => {
          if (requestId === this.loadRequestId) {
            this.loading.set(false);
          }
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (page) => {
          if (requestId !== this.loadRequestId) {
            return;
          }

          this.rows.set(page.items);
          this.total.set(page.total);
        },
        error: (error: unknown) => {
          if (requestId !== this.loadRequestId) {
            return;
          }

          this.rows.set([]);
          this.total.set(0);
          this.pageError.set(formatApiError(error) || this.texts.feedback.loadError);
        },
      });
  }

  onSearchChange(value: string): void {
    this.searchTerm.set(value);
    this.pageNumber.set(1);
    if (this.asignacionesTable) {
      this.asignacionesTable.offset = 0;
    }
    this.loadAssignments();
  }

  clearSearch(): void {
    if (!this.hasSearchTerm) {
      return;
    }

    this.searchTerm.set('');
    this.pageNumber.set(1);
    if (this.asignacionesTable) {
      this.asignacionesTable.offset = 0;
    }
    this.loadAssignments();
  }

  refresh(): void {
    this.loadAssignments();
  }

  onPage(event: { offset?: number }): void {
    this.pageNumber.set((event.offset ?? 0) + 1);
    this.loadAssignments();
  }

  changePageLimit(value: string): void {
    this.pageLimit.set(Number(value));
    this.pageNumber.set(1);
    if (this.asignacionesTable) {
      this.asignacionesTable.offset = 0;
    }
    this.loadAssignments();
  }

  toggleAssignment(row: ValidaAsignaRolesItem, checked: boolean): void {
    const selected = new Set(this.selectedIds());
    if (checked) {
      selected.add(row.idPoliticaAsignada);
    } else {
      selected.delete(row.idPoliticaAsignada);
    }
    this.selectedIds.set(selected);
  }

  toggleVisibleRows(checked: boolean): void {
    const selected = new Set<string>();
    if (checked) {
      for (const row of this.rows()) {
        selected.add(row.idPoliticaAsignada);
      }
    }
    this.selectedIds.set(selected);
  }

  isAssignmentSelected(row: ValidaAsignaRolesItem): boolean {
    return this.selectedIds().has(row.idPoliticaAsignada);
  }

  validateSelected(): void {
    if (!this.canAccessPage()) {
      this.toastr.error(this.texts.feedback.noPermission);
      return;
    }

    const assignmentsToValidate = this.selectedRows();
    if (!assignmentsToValidate.length) {
      this.toastr.warning(this.texts.feedback.missingSelection);
      return;
    }

    const validatorUserId = this.authStore.user()?.id ?? '';
    if (!validatorUserId) {
      this.toastr.error(this.texts.feedback.missingValidatorUser);
      return;
    }

    void Swal.fire({
      title: this.texts.confirm.title,
      text: `${this.texts.confirm.text} Total: ${assignmentsToValidate.length}.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: this.texts.confirm.accept,
      cancelButtonText: this.texts.confirm.cancel,
    }).then((confirmation) => {
      if (!confirmation.isConfirmed) {
        return;
      }

      this.validating.set(true);
      this.accountAuthService.ensureCsrfToken()
        .pipe(
          switchMap(() => forkJoin(assignmentsToValidate.map((assignment) =>
            this.validaAsignaRolesService.validaAsignacionDeRol({
              id_PoliticaAsignada: assignment.idPoliticaAsignada,
              id_Usuario_ValidaAsignacionRol: validatorUserId,
            }).pipe(
              map((): ValidationAttempt => ({ ok: true, assignment })),
              catchError((error: unknown) => of<ValidationAttempt>({
                ok: false,
                assignment,
                message: formatApiError(error) || this.texts.feedback.validateError,
              })),
            ),
          ))),
          finalize(() => this.validating.set(false)),
          takeUntilDestroyed(this.destroyRef),
        )
        .subscribe({
          next: (attempts) => this.handleValidationResult(attempts),
          error: (error: unknown) => {
            this.toastr.error(formatApiError(error) || this.texts.feedback.validateError);
          },
        });
    });
  }

  getUserLabel(row: ValidaAsignaRolesItem): string {
    return row.nombreUsuario || row.correoElectronico || row.idUsuario;
  }

  getOrganizationLabel(row: ValidaAsignaRolesItem): string {
    return row.codigoOrganizacion ? `${row.codigoOrganizacion} - ${row.nombreOrganizacion}` : row.nombreOrganizacion;
  }

  getUnitLabel(row: ValidaAsignaRolesItem): string {
    return row.codigoUnidadOrganizacional
      ? `${row.codigoUnidadOrganizacional} - ${row.nombreUnidadOrganizacional}`
      : row.nombreUnidadOrganizacional;
  }

  getProcessLabel(row: ValidaAsignaRolesItem): string {
    return row.codigoProceso ? `${row.codigoProceso} - ${row.nombreProceso}` : row.nombreProceso;
  }

  getDateLabel(value: string): string {
    if (!value) {
      return this.texts.status.noData;
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString('es-CL');
  }

  getBooleanLabel(value: boolean): string {
    return value ? this.texts.status.yes : this.texts.status.no;
  }

  get hasSearchTerm(): boolean {
    return this.searchTerm().trim().length > 0;
  }

  private handleValidationResult(attempts: ValidationAttempt[]): void {
    const successCount = attempts.filter((attempt) => attempt.ok).length;
    const failures = attempts.filter((attempt): attempt is Extract<ValidationAttempt, { ok: false }> => !attempt.ok);

    if (successCount > 0) {
      this.toastr.success(`${this.texts.feedback.validateSuccess} Total: ${successCount}.`);
    }

    if (failures.length > 0) {
      const failureSummary = failures
        .slice(0, 3)
        .map((attempt) => `${this.getUserLabel(attempt.assignment)} / ${attempt.assignment.nombreRol}: ${attempt.message}`)
        .join(' | ');
      this.toastr.warning(`${this.texts.feedback.validatePartial} ${failureSummary}`);
    }

    if (successCount > 0) {
      this.loadAssignments();
    }
  }

  private clearSelection(): void {
    this.selectedIds.set(new Set<string>());
  }
}
