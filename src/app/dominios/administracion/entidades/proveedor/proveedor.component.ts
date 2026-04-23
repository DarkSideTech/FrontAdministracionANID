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
import { PROVEEDOR_CRUD_PAGE_CONFIG } from '@core/service/controllers/proveedor/proveedor-crud.config';
import { ProveedorCrudFormValue, ProveedorCrudItem } from '@core/service/controllers/proveedor/proveedor-crud.models';
import { ProveedorCrudService } from '@core/service/controllers/proveedor/proveedor-crud.service';
import { GOV_CL_ICON_REGISTRY } from '@core/ui/gob-cl-icons';

type ProveedorDialogMode = 'create' | 'edit';

@Component({
  selector: 'app-administracion-proveedor',
  templateUrl: './proveedor.component.html',
  styleUrl: './proveedor.component.scss',
  imports: [
    RouterLink,
    ReactiveFormsModule,
    NgxDatatableModule,
  ],
})
export class ProveedorComponent {
  @ViewChild(DatatableComponent, { static: false }) table!: DatatableComponent;

  private readonly proveedorService = inject(ProveedorCrudService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly modalService = inject(NgbModal);
  private readonly toastr = inject(ToastrService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly authStore = inject(AuthStore);

  // Base reusable points for future CRUDs: config/texts, API service, form fields and row actions.
  readonly config = PROVEEDOR_CRUD_PAGE_CONFIG;
  readonly icons = GOV_CL_ICON_REGISTRY;
  readonly texts = this.config.texts;
  readonly proveedorActionVisibility = this.config.actionVisibility;

  readonly loadingProveedorPage = signal(false);
  readonly savingProveedorForm = signal(false);
  readonly processingProveedorId = signal<string | null>(null);
  readonly proveedorPageError = signal('');
  readonly proveedorDialogError = signal('');
  readonly proveedorSearchTerm = signal('');
  readonly proveedorDialogMode = signal<ProveedorDialogMode>('create');
  readonly proveedorRows = signal<ProveedorCrudItem[]>([]);
  readonly selectedProveedorRows = signal<ProveedorCrudItem[]>([]);
  readonly proveedorPageLimit = signal(this.config.defaultPageLimit);
  readonly proveedorPageSizeOptions = this.config.pageSizeOptions;
  readonly proveedorFormInitialValue = signal<ProveedorCrudFormValue>({ ...this.config.initialFormValue });

  readonly filteredProveedorRows = computed(() => {
    const term = this.proveedorSearchTerm().trim().toLowerCase();

    if (!term) {
      return this.proveedorRows();
    }

    return this.proveedorRows().filter((item) =>
      [
        item.codigo,
        item.nombre,
        item.descripcion,
        item.activo ? this.texts.status.active : this.texts.status.inactive,
      ].some((field) => field.toLowerCase().includes(term)),
    );
  });

  readonly selectedProveedorCount = computed(() => this.selectedProveedorRows().length);
  readonly hasSelectedProveedorRows = computed(() => this.selectedProveedorCount() > 0);
  readonly hasProveedorSearchTerm = computed(() => this.proveedorSearchTerm().trim().length > 0);
  readonly isProveedorCreateMode = computed(() => this.proveedorDialogMode() === 'create');
  readonly canViewProveedorTraceability = computed(() =>
    this.authStore.hasOrganizationSession() && this.authStore.hasRole(EnumRolesBase.Administrador),
  );
  readonly areAllProveedorRowsSelected = computed(() => {
    const rows = this.filteredProveedorRows();
    return rows.length > 0 && rows.every((row) => this.selectedProveedorRows().some((selected) => selected.id === row.id));
  });
  readonly scrollBarHorizontal = window.innerWidth < 1200;

  readonly proveedorForm = this.formBuilder.group({
    id: [''],
    codigo: ['', [Validators.required]],
    nombre: ['', [Validators.required]],
    descripcion: [''],
    apiDeAutenticacion: [''],
  });

  constructor() {
    this.loadProveedorPage();
  }

  loadProveedorPage(): void {
    this.loadingProveedorPage.set(true);
    this.proveedorPageError.set('');

    this.proveedorService.buscarProveedorLista()
      .pipe(
        finalize(() => this.loadingProveedorPage.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (items) => {
          this.proveedorRows.set(items);
          this.selectedProveedorRows.set([]);
        },
        error: (error: unknown) => {
          this.proveedorPageError.set(formatApiError(error) || this.texts.feedback.loadError);
        },
      });
  }

  onProveedorSearchChange(value: string): void {
    this.proveedorSearchTerm.set(value);
    if (this.table) {
      this.table.offset = 0;
    }
  }

  clearProveedorSearch(): void {
    this.proveedorSearchTerm.set('');
    if (this.table) {
      this.table.offset = 0;
    }
  }

  onProveedorToggleSelection(row: ProveedorCrudItem, checked: boolean): void {
    const selectedMap = new Map(this.selectedProveedorRows().map((item) => [item.id, item] as const));

    if (checked) {
      selectedMap.set(row.id, row);
    } else {
      selectedMap.delete(row.id);
    }

    this.selectedProveedorRows.set(Array.from(selectedMap.values()));
  }

  onProveedorToggleAllSelection(checked: boolean): void {
    this.selectedProveedorRows.set(checked ? [...this.filteredProveedorRows()] : []);
  }

  isProveedorRowSelected(row: ProveedorCrudItem): boolean {
    return this.selectedProveedorRows().some((item) => item.id === row.id);
  }

  toggleProveedorDetail(row: ProveedorCrudItem): void {
    this.table.rowDetail.toggleExpandRow(row);
  }

  onProveedorDetailToggle(_event: unknown): void {}

  onProveedorPageChange(event: { page: number }): void {
    this.table.offset = event.page - 1;
  }

  changeProveedorPageLimit(value: string): void {
    this.proveedorPageLimit.set(Number(value));
    if (this.table) {
      this.table.offset = 0;
    }
  }

  openCreateProveedorDialog(content: TemplateRef<unknown>): void {
    const initialValue = { ...this.config.initialFormValue };
    this.proveedorDialogMode.set('create');
    this.proveedorDialogError.set('');
    this.proveedorFormInitialValue.set(initialValue);
    this.proveedorForm.reset(initialValue);
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', size: 'lg' });
  }

  openEditProveedorDialog(item: ProveedorCrudItem, content: TemplateRef<unknown>): void {
    const initialValue = {
      id: item.id,
      codigo: item.codigo,
      nombre: item.nombre,
      descripcion: item.descripcion,
      apiDeAutenticacion: item.apiDeAutenticacion,
    };

    this.proveedorDialogMode.set('edit');
    this.proveedorDialogError.set('');
    this.proveedorFormInitialValue.set(initialValue);
    this.proveedorForm.reset(initialValue);
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', size: 'lg' });
  }

  resetProveedorForm(): void {
    this.proveedorForm.reset(this.proveedorFormInitialValue());
  }

  saveProveedorForm(modal: { close: () => void }): void {
    if (this.proveedorForm.invalid) {
      this.proveedorForm.markAllAsTouched();
      return;
    }

    this.savingProveedorForm.set(true);
    this.proveedorDialogError.set('');

    const formValue = this.getProveedorFormValue();
    const request$ = this.isProveedorCreateMode()
      ? this.proveedorService.crearProveedor({
          codigo: formValue.codigo,
          nombre: formValue.nombre,
          descripcion: formValue.descripcion,
          apiDeAutenticacion: formValue.apiDeAutenticacion,
        })
      : this.proveedorService.modificarProveedor({
          id: formValue.id,
          nombre: formValue.nombre,
          descripcion: formValue.descripcion,
          apiDeAutenticacion: formValue.apiDeAutenticacion,
        });

    request$
      .pipe(
        finalize(() => this.savingProveedorForm.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          modal.close();
          this.loadProveedorPage();
          this.toastr.success(
            this.isProveedorCreateMode()
              ? this.texts.feedback.createSuccess
              : this.texts.feedback.updateSuccess,
          );
        },
        error: (error: unknown) => {
          this.proveedorDialogError.set(formatApiError(error));
        },
      });
  }

  confirmDeleteProveedor(item: ProveedorCrudItem): void {
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

      this.processingProveedorId.set(item.id);
      this.proveedorService.eliminarProveedor({ id: item.id })
        .pipe(
          finalize(() => this.processingProveedorId.set(null)),
          takeUntilDestroyed(this.destroyRef),
        )
        .subscribe({
          next: () => {
            this.loadProveedorPage();
            this.toastr.success(this.texts.feedback.deleteSuccess);
          },
          error: (error: unknown) => {
            this.toastr.error(formatApiError(error));
          },
        });
    });
  }

  confirmDeleteSelectedProveedorRows(): void {
    const selectedRows = this.selectedProveedorRows();
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

      this.processingProveedorId.set('bulk');
      from(selectedRows.map((row) => row.id))
        .pipe(
          concatMap((id) =>
            this.proveedorService.eliminarProveedor({ id }).pipe(
              map(() => ({ success: true as const })),
              catchError((error: unknown) => of({ success: false as const, error })),
            ),
          ),
          toArray(),
          finalize(() => this.processingProveedorId.set(null)),
          takeUntilDestroyed(this.destroyRef),
        )
        .subscribe((results) => {
          const failures = results.filter((item) => !item.success);
          this.selectedProveedorRows.set([]);
          this.loadProveedorPage();

          if (failures.length) {
            const firstFailure = failures[0] as { success: false; error: unknown };
            this.toastr.error(formatApiError(firstFailure.error), this.texts.feedback.partialDeleteError);
            return;
          }

          this.toastr.success(this.texts.feedback.deleteSelectedSuccess);
        });
    });
  }

  toggleProveedorStatus(item: ProveedorCrudItem): void {
    this.processingProveedorId.set(item.id);
    const request$ = item.activo
      ? this.proveedorService.desactivarProveedor({ id: item.id })
      : this.proveedorService.activarProveedor({ id: item.id });

    request$
      .pipe(
        finalize(() => this.processingProveedorId.set(null)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.updateProveedorRowState(item.id, !item.activo);
          this.toastr.success(
            item.activo ? this.texts.feedback.deactivateSuccess : this.texts.feedback.activateSuccess,
          );
        },
        error: (error: unknown) => {
          this.toastr.error(formatApiError(error));
        },
      });
  }

  isProveedorFormControlInvalid(controlName: keyof ProveedorCrudFormValue): boolean {
    const control = this.proveedorForm.controls[controlName];
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  getProveedorFormControlError(controlName: keyof ProveedorCrudFormValue): string {
    const control = this.proveedorForm.controls[controlName];
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

  isProveedorRowBusy(item: ProveedorCrudItem): boolean {
    return this.processingProveedorId() === item.id || this.processingProveedorId() === 'bulk';
  }

  getProveedorStatusLabel(item: ProveedorCrudItem): string {
    return item.activo ? this.texts.status.active : this.texts.status.inactive;
  }

  openProveedorTraceability(item: ProveedorCrudItem): void {
    void this.router.navigate(['/paneles/trazabilidad'], {
      queryParams: {
        entity: 'Proveedor',
        aggregateId: item.id,
        source: this.texts.breadcrumbCurrent,
        sourceUrl: '/dominios/administracion/entidades/proveedor',
      },
    });
  }

  private getProveedorFormValue(): ProveedorCrudFormValue {
    const rawValue = this.proveedorForm.getRawValue();
    return {
      id: rawValue.id?.trim() ?? '',
      codigo: rawValue.codigo?.trim() ?? '',
      nombre: rawValue.nombre?.trim() ?? '',
      descripcion: rawValue.descripcion?.trim() ?? '',
      apiDeAutenticacion: rawValue.apiDeAutenticacion?.trim() ?? '',
    };
  }

  private updateProveedorRowState(id: string, activo: boolean): void {
    this.proveedorRows.update((rows) =>
      rows.map((row) => row.id === id ? { ...row, activo } : row),
    );

    this.selectedProveedorRows.update((rows) =>
      rows.map((row) => row.id === id ? { ...row, activo } : row),
    );
  }
}
