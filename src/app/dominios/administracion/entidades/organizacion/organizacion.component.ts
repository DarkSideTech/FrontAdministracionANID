import { Component, DestroyRef, TemplateRef, ViewChild, computed, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DatatableComponent, NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, concatMap, finalize, from, map, of, toArray } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';

import { AuthStore } from '@core/auth/auth-store.service';
import { EnumRolesBase } from '@core/enumerations/enum-roles';
import { formatApiError } from '@core/service/api-error.util';
import { ORGANIZACION_CRUD_PAGE_CONFIG } from '@core/service/controllers/organizacion/organizacion-crud.config';
import { OrganizacionCrudFormValue, OrganizacionCrudItem } from '@core/service/controllers/organizacion/organizacion-crud.models';
import { OrganizacionCrudService } from '@core/service/controllers/organizacion/organizacion-crud.service';
import { GOV_CL_ICON_REGISTRY } from '@core/ui/gob-cl-icons';

type OrganizacionDialogMode = 'create' | 'edit';

@Component({
  selector: 'app-administracion-organizacion',
  templateUrl: './organizacion.component.html',
  styleUrl: './organizacion.component.scss',
  imports: [
    RouterLink,
    ReactiveFormsModule,
    NgxDatatableModule,
  ],
})
export class OrganizacionComponent {
  @ViewChild(DatatableComponent, { static: false }) table!: DatatableComponent;

  private readonly organizacionService = inject(OrganizacionCrudService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly modalService = inject(NgbModal);
  private readonly toastr = inject(ToastrService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly authStore = inject(AuthStore);

  readonly config = ORGANIZACION_CRUD_PAGE_CONFIG;
  readonly icons = GOV_CL_ICON_REGISTRY;
  readonly texts = this.config.texts;
  readonly organizacionActionVisibility = this.config.actionVisibility;

  readonly loadingOrganizacionPage = signal(false);
  readonly savingOrganizacionForm = signal(false);
  readonly processingOrganizacionId = signal<string | null>(null);
  readonly organizacionPageError = signal('');
  readonly organizacionDialogError = signal('');
  readonly organizacionSearchTerm = signal('');
  readonly organizacionDialogMode = signal<OrganizacionDialogMode>('create');
  readonly organizacionRows = signal<OrganizacionCrudItem[]>([]);
  readonly selectedOrganizacionRows = signal<OrganizacionCrudItem[]>([]);
  readonly organizacionPageLimit = signal(this.config.defaultPageLimit);
  readonly organizacionPageSizeOptions = this.config.pageSizeOptions;
  readonly organizacionFormInitialValue = signal<OrganizacionCrudFormValue>({ ...this.config.initialFormValue });

  readonly filteredOrganizacionRows = computed(() => {
    const term = this.organizacionSearchTerm().trim().toLowerCase();

    if (!term) {
      return this.organizacionRows();
    }

    return this.organizacionRows().filter((item) =>
      [
        item.codigo,
        item.nombre,
        item.descripcion,
        item.activo ? this.texts.status.active : this.texts.status.inactive,
      ].some((field) => field.toLowerCase().includes(term)),
    );
  });

  readonly selectedOrganizacionCount = computed(() => this.selectedOrganizacionRows().length);
  readonly hasSelectedOrganizacionRows = computed(() => this.selectedOrganizacionCount() > 0);
  readonly hasOrganizacionSearchTerm = computed(() => this.organizacionSearchTerm().trim().length > 0);
  readonly isOrganizacionCreateMode = computed(() => this.organizacionDialogMode() === 'create');
  readonly canViewOrganizacionTraceability = computed(() =>
    this.authStore.hasOrganizationSession() && this.authStore.hasRole(EnumRolesBase.Administrador),
  );
  readonly areAllOrganizacionRowsSelected = computed(() => {
    const rows = this.filteredOrganizacionRows();
    return rows.length > 0 && rows.every((row) => this.selectedOrganizacionRows().some((selected) => selected.id === row.id));
  });
  readonly scrollBarHorizontal = window.innerWidth < 1200;

  readonly organizacionForm = this.formBuilder.group({
    id: [''],
    idOrganizacion: [''],
    codigo: ['', [Validators.required]],
    nombre: ['', [Validators.required]],
    descripcion: [''],
  });

  constructor() {
    this.loadOrganizacionPage();
  }

  loadOrganizacionPage(): void {
    this.loadingOrganizacionPage.set(true);
    this.organizacionPageError.set('');

    this.organizacionService.buscarOrganizacionLista()
      .pipe(
        finalize(() => this.loadingOrganizacionPage.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (items) => {
          this.organizacionRows.set(items);
          this.selectedOrganizacionRows.set([]);
        },
        error: (error: unknown) => {
          this.organizacionPageError.set(formatApiError(error) || this.texts.feedback.loadError);
        },
      });
  }

  onOrganizacionSearchChange(value: string): void {
    this.organizacionSearchTerm.set(value);
    if (this.table) {
      this.table.offset = 0;
    }
  }

  clearOrganizacionSearch(): void {
    this.organizacionSearchTerm.set('');
    if (this.table) {
      this.table.offset = 0;
    }
  }

  onOrganizacionToggleSelection(row: OrganizacionCrudItem, checked: boolean): void {
    const selectedMap = new Map(this.selectedOrganizacionRows().map((item) => [item.id, item] as const));

    if (checked) {
      selectedMap.set(row.id, row);
    } else {
      selectedMap.delete(row.id);
    }

    this.selectedOrganizacionRows.set(Array.from(selectedMap.values()));
  }

  onOrganizacionToggleAllSelection(checked: boolean): void {
    this.selectedOrganizacionRows.set(checked ? [...this.filteredOrganizacionRows()] : []);
  }

  isOrganizacionRowSelected(row: OrganizacionCrudItem): boolean {
    return this.selectedOrganizacionRows().some((item) => item.id === row.id);
  }

  toggleOrganizacionDetail(row: OrganizacionCrudItem): void {
    this.table.rowDetail.toggleExpandRow(row);
  }

  onOrganizacionDetailToggle(_event: unknown): void {}

  onOrganizacionPageChange(event: { page: number }): void {
    this.table.offset = event.page - 1;
  }

  changeOrganizacionPageLimit(value: string): void {
    this.organizacionPageLimit.set(Number(value));
    if (this.table) {
      this.table.offset = 0;
    }
  }

  openCreateOrganizacionDialog(content: TemplateRef<unknown>): void {
    const initialValue = { ...this.config.initialFormValue };
    this.organizacionDialogMode.set('create');
    this.organizacionDialogError.set('');
    this.organizacionFormInitialValue.set(initialValue);
    this.organizacionForm.reset(initialValue);
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', size: 'lg' });
  }

  openEditOrganizacionDialog(item: OrganizacionCrudItem, content: TemplateRef<unknown>): void {
    const initialValue = {
      id: item.id,
      idOrganizacion: item.idOrganizacion,
      codigo: item.codigo,
      nombre: item.nombre,
      descripcion: item.descripcion,
    };

    this.organizacionDialogMode.set('edit');
    this.organizacionDialogError.set('');
    this.organizacionFormInitialValue.set(initialValue);
    this.organizacionForm.reset(initialValue);
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', size: 'lg' });
  }

  resetOrganizacionForm(): void {
    this.organizacionForm.reset(this.organizacionFormInitialValue());
  }

  saveOrganizacionForm(modal: { close: () => void }): void {
    if (this.organizacionForm.invalid) {
      this.organizacionForm.markAllAsTouched();
      return;
    }

    this.savingOrganizacionForm.set(true);
    this.organizacionDialogError.set('');

    const formValue = this.getOrganizacionFormValue();
    const request$ = this.isOrganizacionCreateMode()
      ? this.organizacionService.crearOrganizacion({
          idOrganizacion: formValue.idOrganizacion,
          codigo: formValue.codigo,
          nombre: formValue.nombre,
          descripcion: formValue.descripcion,
        })
      : this.organizacionService.modificarOrganizacion({
          id: formValue.id,
          idOrganizacion: formValue.idOrganizacion,
          nombre: formValue.nombre,
          descripcion: formValue.descripcion,
        });

    request$
      .pipe(
        finalize(() => this.savingOrganizacionForm.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          modal.close();
          this.loadOrganizacionPage();
          this.toastr.success(
            this.isOrganizacionCreateMode()
              ? this.texts.feedback.createSuccess
              : this.texts.feedback.updateSuccess,
          );
        },
        error: (error: unknown) => {
          this.organizacionDialogError.set(formatApiError(error));
        },
      });
  }

  confirmDeleteOrganizacion(item: OrganizacionCrudItem): void {
    void Swal.fire({
      title: `<p class="swal2-title-custom">${this.texts.confirm.deleteTitle}</p>`,
      html: `<p class="swal2-subtitle">${this.texts.confirm.deleteText}</p>`,
      showCancelButton: true,
      showCloseButton: true,
      confirmButtonText: this.texts.confirm.accept,
      cancelButtonText: this.texts.confirm.cancel,
      customClass: {
        popup: 'swal2-custom-popup',
        confirmButton: 'btn-confirm-border',
        cancelButton: 'btn-cancel',
      },
      buttonsStyling: false,
    }).then((result) => {
      if (!result.isConfirmed) {
        return;
      }

      this.processingOrganizacionId.set(item.id);
      this.organizacionService.eliminarOrganizacion({ id: item.id })
        .pipe(
          finalize(() => this.processingOrganizacionId.set(null)),
          takeUntilDestroyed(this.destroyRef),
        )
        .subscribe({
          next: () => {
            this.loadOrganizacionPage();
            this.toastr.success(this.texts.feedback.deleteSuccess);
          },
          error: (error: unknown) => {
            this.toastr.error(formatApiError(error));
          },
        });
    });
  }

  confirmDeleteSelectedOrganizacionRows(): void {
    const selectedRows = this.selectedOrganizacionRows();
    if (!selectedRows.length) {
      return;
    }

    void Swal.fire({
      title: `<p class="swal2-title-custom">${this.texts.confirm.deleteSelectedTitle}</p>`,
      html: `<p class="swal2-subtitle">${this.texts.confirm.deleteSelectedText}</p>`,
      showCancelButton: true,
      showCloseButton: true,
      confirmButtonText: this.texts.confirm.accept,
      cancelButtonText: this.texts.confirm.cancel,
      customClass: {
        popup: 'swal2-custom-popup',
        confirmButton: 'btn-confirm-border',
        cancelButton: 'btn-cancel',
      },
      buttonsStyling: false,
    }).then((result) => {
      if (!result.isConfirmed) {
        return;
      }

      this.processingOrganizacionId.set('bulk');
      from(selectedRows.map((row) => row.id))
        .pipe(
          concatMap((id) =>
            this.organizacionService.eliminarOrganizacion({ id }).pipe(
              map(() => ({ success: true as const })),
              catchError((error: unknown) => of({ success: false as const, error })),
            ),
          ),
          toArray(),
          finalize(() => this.processingOrganizacionId.set(null)),
          takeUntilDestroyed(this.destroyRef),
        )
        .subscribe((results) => {
          const failures = results.filter((item) => !item.success);
          this.selectedOrganizacionRows.set([]);
          this.loadOrganizacionPage();

          if (failures.length) {
            const firstFailure = failures[0] as { success: false; error: unknown };
            this.toastr.error(formatApiError(firstFailure.error), this.texts.feedback.partialDeleteError);
            return;
          }

          this.toastr.success(this.texts.feedback.deleteSelectedSuccess);
        });
    });
  }

  toggleOrganizacionStatus(item: OrganizacionCrudItem): void {
    this.processingOrganizacionId.set(item.id);
    const request$ = item.activo
      ? this.organizacionService.desactivarOrganizacion({ id: item.id })
      : this.organizacionService.activarOrganizacion({ id: item.id });

    request$
      .pipe(
        finalize(() => this.processingOrganizacionId.set(null)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.updateOrganizacionRowState(item.id, !item.activo);
          this.toastr.success(
            item.activo ? this.texts.feedback.deactivateSuccess : this.texts.feedback.activateSuccess,
          );
        },
        error: (error: unknown) => {
          this.toastr.error(formatApiError(error));
        },
      });
  }

  isOrganizacionFormControlInvalid(controlName: keyof OrganizacionCrudFormValue): boolean {
    const control = this.organizacionForm.controls[controlName];
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  getOrganizacionFormControlError(controlName: keyof OrganizacionCrudFormValue): string {
    const control = this.organizacionForm.controls[controlName];
    if (!control?.errors) {
      return '';
    }

    if (control.errors['required']) {
      return controlName === 'codigo'
        ? this.texts.validation.codigoRequired
        : this.texts.validation.nombreRequired;
    }

    return '';
  }

  isOrganizacionRowBusy(item: OrganizacionCrudItem): boolean {
    return this.processingOrganizacionId() === item.id || this.processingOrganizacionId() === 'bulk';
  }

  getOrganizacionStatusLabel(item: OrganizacionCrudItem): string {
    return item.activo ? this.texts.status.active : this.texts.status.inactive;
  }

  openOrganizacionTraceability(item: OrganizacionCrudItem): void {
    void this.router.navigate(['/paneles/trazabilidad'], {
      queryParams: {
        entity: 'Organizacion',
        aggregateId: item.id,
        source: this.texts.breadcrumbCurrent,
        sourceUrl: '/dominios/administracion/entidades/organizacion',
      },
    });
  }

  private getOrganizacionFormValue(): OrganizacionCrudFormValue {
    const rawValue = this.organizacionForm.getRawValue();
    return {
      id: rawValue.id?.trim() ?? '',
      idOrganizacion: rawValue.idOrganizacion?.trim() ?? '',
      codigo: rawValue.codigo?.trim() ?? '',
      nombre: rawValue.nombre?.trim() ?? '',
      descripcion: rawValue.descripcion?.trim() ?? '',
    };
  }

  private updateOrganizacionRowState(id: string, activo: boolean): void {
    this.organizacionRows.update((rows) =>
      rows.map((row) => row.id === id ? { ...row, activo } : row),
    );

    this.selectedOrganizacionRows.update((rows) =>
      rows.map((row) => row.id === id ? { ...row, activo } : row),
    );
  }
}
