import { Component, DestroyRef, TemplateRef, ViewChild, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, finalize } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DatatableComponent, NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ToastrService } from 'ngx-toastr';

import { AccountAuthService } from '@core/auth/account-auth.service';
import { AuthStore } from '@core/auth/auth-store.service';
import { EnumRolesBase } from '@core/enumerations/enum-roles';
import { formatApiError } from '@core/service/api-error.util';
import { ROL_CRUD_PAGE_CONFIG } from '@core/service/controllers/rol/rol-crud.config';
import { RolCrudFormValue, RolCrudItem } from '@core/service/controllers/rol/rol-crud.models';
import { RolCrudService } from '@core/service/controllers/rol/rol-crud.service';
import { GOV_CL_ICON_REGISTRY } from '@core/ui/gob-cl-icons';

type RolBooleanField =
  | 'activo'
  | 'requiereValidacionDeAsignacion'
  | 'validaAsignacionDeRoles'
  | 'activaDetalleDeAutorizaciones';

@Component({
  selector: 'app-administracion-rol',
  templateUrl: './rol.component.html',
  styleUrl: './rol.component.scss',
  imports: [
    RouterLink,
    ReactiveFormsModule,
    NgxDatatableModule,
  ],
})
export class RolComponent {
  @ViewChild(DatatableComponent, { static: false }) table!: DatatableComponent;

  private readonly rolService = inject(RolCrudService);
  private readonly accountAuthService = inject(AccountAuthService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly modalService = inject(NgbModal);
  private readonly toastr = inject(ToastrService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly authStore = inject(AuthStore);
  private rolLoadRequestId = 0;

  readonly config = ROL_CRUD_PAGE_CONFIG;
  readonly icons = GOV_CL_ICON_REGISTRY;
  readonly texts = this.config.texts;
  readonly rolActionVisibility = this.config.actionVisibility;

  readonly loadingRolPage = signal(false);
  readonly savingRolForm = signal(false);
  readonly processingRolId = signal<string | null>(null);
  readonly rolPageError = signal('');
  readonly rolDialogError = signal('');
  readonly rolSearchTerm = signal('');
  readonly rolRows = signal<RolCrudItem[]>([]);
  readonly selectedRolRows = signal<RolCrudItem[]>([]);
  readonly rolPageLimit = signal(this.config.defaultPageLimit);
  readonly rolCurrentPage = signal(1);
  readonly rolTotalCount = signal(0);
  readonly rolPageSizeOptions = this.config.pageSizeOptions;
  readonly rolFormInitialValue = signal<RolCrudFormValue>({ ...this.config.initialFormValue });

  readonly selectedRolCount = computed(() => this.selectedRolRows().length);
  readonly hasRolSearchTerm = computed(() => this.rolSearchTerm().trim().length > 0);
  readonly canViewRolTraceability = computed(() =>
    this.authStore.hasOrganizationSession() && this.authStore.hasRole(EnumRolesBase.Administrador),
  );
  readonly areAllRolRowsSelected = computed(() => {
    const rows = this.rolRows();
    return rows.length > 0 && rows.every((row) => this.selectedRolRows().some((selected) => selected.id === row.id));
  });
  readonly scrollBarHorizontal = window.innerWidth < 1500;

  readonly rolForm = this.formBuilder.group({
    idRol: [''],
    nombreNormalizado: [{ value: '', disabled: true }],
    descripcion: ['', [Validators.maxLength(1000)]],
    validaEnrrolamiento: [false],
    validaAsignacionDeRoles: [false],
  });

  constructor() {
    this.loadRolInitialData();
  }

  loadRolInitialData(): void {
    this.loadingRolPage.set(true);
    this.rolPageError.set('');

    this.accountAuthService.ensureCsrfToken()
      .pipe(
        finalize(() => this.loadingRolPage.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => this.loadRolPage(),
        error: (error: unknown) => {
          this.rolPageError.set(formatApiError(error) || this.texts.feedback.loadError);
        },
      });
  }

  loadRolPage(): void {
    const requestId = ++this.rolLoadRequestId;
    this.loadingRolPage.set(true);
    this.rolPageError.set('');

    this.rolService.buscarRolesPaginados({
      numeroDePagina: this.rolCurrentPage(),
      cantidadPorPagina: this.rolPageLimit(),
      busqueda: this.rolSearchTerm().trim(),
    })
      .pipe(
        finalize(() => {
          if (requestId === this.rolLoadRequestId) {
            this.loadingRolPage.set(false);
          }
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (page) => {
          if (requestId !== this.rolLoadRequestId) {
            return;
          }

          this.rolRows.set(page.items);
          this.rolTotalCount.set(page.total);
          this.rolCurrentPage.set(page.numeroDePagina);
          this.selectedRolRows.set([]);
        },
        error: (error: unknown) => {
          if (requestId !== this.rolLoadRequestId) {
            return;
          }

          this.rolRows.set([]);
          this.rolTotalCount.set(0);
          this.selectedRolRows.set([]);
          this.rolPageError.set(formatApiError(error) || this.texts.feedback.loadError);
        },
      });
  }

  onRolSearchChange(value: string): void {
    this.rolSearchTerm.set(value);
    this.rolCurrentPage.set(1);
    this.loadRolPage();
  }

  clearRolSearch(): void {
    this.rolSearchTerm.set('');
    this.rolCurrentPage.set(1);
    this.loadRolPage();
  }

  onRolToggleSelection(row: RolCrudItem, checked: boolean): void {
    const selectedMap = new Map(this.selectedRolRows().map((item) => [item.id, item] as const));

    if (checked) {
      selectedMap.set(row.id, row);
    } else {
      selectedMap.delete(row.id);
    }

    this.selectedRolRows.set(Array.from(selectedMap.values()));
  }

  onRolToggleAllSelection(checked: boolean): void {
    this.selectedRolRows.set(checked ? [...this.rolRows()] : []);
  }

  isRolRowSelected(row: RolCrudItem): boolean {
    return this.selectedRolRows().some((item) => item.id === row.id);
  }

  toggleRolDetail(row: RolCrudItem): void {
    this.table.rowDetail.toggleExpandRow(row);
  }

  onRolDetailToggle(_event: unknown): void {}

  onRolPageChange(event: { page: number }): void {
    this.rolCurrentPage.set(event.page);
    this.loadRolPage();
  }

  changeRolPageLimit(value: string): void {
    this.rolPageLimit.set(Number(value));
    this.rolCurrentPage.set(1);
    this.loadRolPage();
  }

  openEditRolDialog(item: RolCrudItem, content: TemplateRef<unknown>): void {
    const initialValue: RolCrudFormValue = {
      idRol: item.id,
      nombreNormalizado: item.nombreNormalizado,
      descripcion: item.descripcion,
      validaEnrrolamiento: item.validaEnrrolamiento,
      validaAsignacionDeRoles: item.validaAsignacionDeRoles,
    };

    this.rolDialogError.set('');
    this.rolFormInitialValue.set(initialValue);
    this.rolForm.reset(initialValue);
    this.rolForm.controls.nombreNormalizado.disable({ emitEvent: false });
    this.modalService.open(content, { ariaLabelledBy: 'modal-rol-title', size: 'lg' });
  }

  resetRolForm(): void {
    this.rolForm.reset(this.rolFormInitialValue());
    this.rolForm.controls.nombreNormalizado.disable({ emitEvent: false });
  }

  saveRolForm(modal: { close: () => void }): void {
    if (this.rolForm.invalid) {
      this.rolForm.markAllAsTouched();
      return;
    }

    const formValue = this.getRolFormValue();
    this.savingRolForm.set(true);
    this.rolDialogError.set('');

    this.rolService.modificarRol({
      idRol: formValue.idRol,
      descripcion: formValue.descripcion,
      validaEnrrolamiento: formValue.validaEnrrolamiento,
      validaAsignacionDeRoles: formValue.validaAsignacionDeRoles,
    })
      .pipe(
        finalize(() => this.savingRolForm.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          modal.close();
          this.loadRolPage();
          this.toastr.success(this.texts.feedback.updateSuccess);
        },
        error: (error: unknown) => {
          this.rolDialogError.set(formatApiError(error));
        },
      });
  }

  toggleRolStatus(item: RolCrudItem): void {
    const request$ = item.activo
      ? this.rolService.desactivarRol({ idRol: item.id })
      : this.rolService.activarRol({ idRol: item.id });

    this.runRolAction(
      item,
      'activo',
      !item.activo,
      request$,
      item.activo ? this.texts.feedback.deactivateSuccess : this.texts.feedback.activateSuccess,
    );
  }

  toggleRolAssignmentValidation(item: RolCrudItem): void {
    const request$ = item.requiereValidacionDeAsignacion
      ? this.rolService.noRequiereValidacionAlSerAsignado({ idRol: item.id })
      : this.rolService.requiereValidacionAlSerAsignado({ idRol: item.id });

    this.runRolAction(
      item,
      'requiereValidacionDeAsignacion',
      !item.requiereValidacionDeAsignacion,
      request$,
      item.requiereValidacionDeAsignacion
        ? this.texts.feedback.noRequireAssignmentValidationSuccess
        : this.texts.feedback.requireAssignmentValidationSuccess,
    );
  }

  toggleRolRoleAssignmentValidation(item: RolCrudItem): void {
    const request$ = item.validaAsignacionDeRoles
      ? this.rolService.desactivaValidacionDeAsignacionDeRoles({ idRol: item.id })
      : this.rolService.activaValidacionDeAsignacionDeRoles({ idRol: item.id });

    this.runRolAction(
      item,
      'validaAsignacionDeRoles',
      !item.validaAsignacionDeRoles,
      request$,
      item.validaAsignacionDeRoles
        ? this.texts.feedback.deactivateRoleAssignmentValidationSuccess
        : this.texts.feedback.activateRoleAssignmentValidationSuccess,
    );
  }

  toggleRolAuthorizationDetail(item: RolCrudItem): void {
    const request$ = item.activaDetalleDeAutorizaciones
      ? this.rolService.desactivaDetalleDeAutorizaciones({ idRol: item.id })
      : this.rolService.activaDetalleDeAutorizaciones({ idRol: item.id });

    this.runRolAction(
      item,
      'activaDetalleDeAutorizaciones',
      !item.activaDetalleDeAutorizaciones,
      request$,
      item.activaDetalleDeAutorizaciones
        ? this.texts.feedback.deactivateAuthorizationDetailSuccess
        : this.texts.feedback.activateAuthorizationDetailSuccess,
    );
  }

  isRolFormControlInvalid(controlName: keyof RolCrudFormValue): boolean {
    const control = this.rolForm.controls[controlName];
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  isRolRowBusy(item: RolCrudItem): boolean {
    return this.processingRolId() === item.id;
  }

  getBooleanLabel(value: boolean): string {
    return value ? this.texts.status.yes : this.texts.status.no;
  }

  getRolStatusLabel(item: RolCrudItem): string {
    return item.activo ? this.texts.status.active : this.texts.status.inactive;
  }

  openRolTraceability(item: RolCrudItem): void {
    void this.router.navigate(['/paneles/trazabilidad'], {
      queryParams: {
        entity: 'Rol',
        aggregateId: item.id,
        source: this.texts.breadcrumbCurrent,
        sourceUrl: '/dominios/administracion/entidades/rol',
      },
    });
  }

  private runRolAction(
    item: RolCrudItem,
    field: RolBooleanField,
    newValue: boolean,
    request$: Observable<void>,
    successMessage: string,
  ): void {
    this.processingRolId.set(item.id);

    request$
      .pipe(
        finalize(() => this.processingRolId.set(null)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.updateRolRowState(item.id, field, newValue);
          this.toastr.success(successMessage);
        },
        error: (error: unknown) => {
          this.toastr.error(formatApiError(error));
        },
      });
  }

  private updateRolRowState(id: string, field: RolBooleanField, value: boolean): void {
    this.rolRows.update((rows) =>
      rows.map((row) => row.id === id ? { ...row, [field]: value } : row),
    );

    this.selectedRolRows.update((rows) =>
      rows.map((row) => row.id === id ? { ...row, [field]: value } : row),
    );
  }

  private getRolFormValue(): RolCrudFormValue {
    const rawValue = this.rolForm.getRawValue();
    return {
      idRol: rawValue.idRol?.trim() ?? '',
      nombreNormalizado: rawValue.nombreNormalizado?.trim() ?? '',
      descripcion: rawValue.descripcion?.trim() ?? '',
      validaEnrrolamiento: rawValue.validaEnrrolamiento === true,
      validaAsignacionDeRoles: rawValue.validaAsignacionDeRoles === true,
    };
  }
}
