import { Component, DestroyRef, TemplateRef, ViewChild, computed, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DatatableComponent, NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, concatMap, finalize, from, map, of, toArray } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { NgSelectModule } from '@ng-select/ng-select';
import Swal from 'sweetalert2';

import { AuthStore } from '@core/auth/auth-store.service';
import { EnumRolesBase } from '@core/enumerations/enum-roles';
import { formatApiError } from '@core/service/api-error.util';
import { OrganizacionApi } from '@core/service/controllers/organizacion.api';
import { UNIDAD_ORGANIZACIONAL_CRUD_PAGE_CONFIG } from '@core/service/controllers/unidadorganizacional/unidadorganizacional-crud.config';
import {
  UnidadOrganizacionalCrudFormValue,
  UnidadOrganizacionalCrudItem,
  UnidadOrganizacionalOrganizacionOption,
} from '@core/service/controllers/unidadorganizacional/unidadorganizacional-crud.models';
import { UnidadOrganizacionalCrudService } from '@core/service/controllers/unidadorganizacional/unidadorganizacional-crud.service';
import { OrganizacionViewModel } from '@core/service/openapi.models';
import { GOV_CL_ICON_REGISTRY } from '@core/ui/gob-cl-icons';

type UnidadOrganizacionalDialogMode = 'create' | 'edit';

@Component({
  selector: 'app-administracion-unidadorganizacional',
  templateUrl: './unidadorganizacional.component.html',
  styleUrl: './unidadorganizacional.component.scss',
  imports: [
    RouterLink,
    ReactiveFormsModule,
    NgxDatatableModule,
    NgSelectModule,
  ],
})
export class UnidadOrganizacionalComponent {
  @ViewChild(DatatableComponent, { static: false }) table!: DatatableComponent;

  private readonly unidadOrganizacionalService = inject(UnidadOrganizacionalCrudService);
  private readonly organizacionApi = inject(OrganizacionApi);
  private readonly formBuilder = inject(FormBuilder);
  private readonly modalService = inject(NgbModal);
  private readonly toastr = inject(ToastrService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly authStore = inject(AuthStore);

  readonly config = UNIDAD_ORGANIZACIONAL_CRUD_PAGE_CONFIG;
  readonly icons = GOV_CL_ICON_REGISTRY;
  readonly texts = this.config.texts;
  readonly unidadOrganizacionalActionVisibility = this.config.actionVisibility;

  readonly loadingUnidadOrganizacionalPage = signal(false);
  readonly loadingOrganizacionOptions = signal(false);
  readonly savingUnidadOrganizacionalForm = signal(false);
  readonly processingUnidadOrganizacionalId = signal<string | null>(null);
  readonly unidadOrganizacionalPageError = signal('');
  readonly unidadOrganizacionalDialogError = signal('');
  readonly unidadOrganizacionalSearchTerm = signal('');
  readonly unidadOrganizacionalDialogMode = signal<UnidadOrganizacionalDialogMode>('create');
  readonly unidadOrganizacionalRows = signal<UnidadOrganizacionalCrudItem[]>([]);
  readonly selectedUnidadOrganizacionalRows = signal<UnidadOrganizacionalCrudItem[]>([]);
  readonly organizacionOptions = signal<UnidadOrganizacionalOrganizacionOption[]>([]);
  readonly unidadOrganizacionalPageLimit = signal(this.config.defaultPageLimit);
  readonly unidadOrganizacionalPageSizeOptions = this.config.pageSizeOptions;
  readonly unidadOrganizacionalFormInitialValue = signal<UnidadOrganizacionalCrudFormValue>({ ...this.config.initialFormValue });

  readonly filteredUnidadOrganizacionalRows = computed(() => {
    const term = this.unidadOrganizacionalSearchTerm().trim().toLowerCase();

    if (!term) {
      return this.unidadOrganizacionalRows();
    }

    return this.unidadOrganizacionalRows().filter((item) =>
      [
        item.codigo,
        item.nombre,
        item.descripcion,
        item.activo ? this.texts.status.active : this.texts.status.inactive,
      ].some((field) => field.toLowerCase().includes(term)),
    );
  });

  readonly selectedUnidadOrganizacionalCount = computed(() => this.selectedUnidadOrganizacionalRows().length);
  readonly hasSelectedUnidadOrganizacionalRows = computed(() => this.selectedUnidadOrganizacionalCount() > 0);
  readonly hasUnidadOrganizacionalSearchTerm = computed(() => this.unidadOrganizacionalSearchTerm().trim().length > 0);
  readonly isUnidadOrganizacionalCreateMode = computed(() => this.unidadOrganizacionalDialogMode() === 'create');
  readonly canViewUnidadOrganizacionalTraceability = computed(() =>
    this.authStore.hasOrganizationSession() && this.authStore.hasRole(EnumRolesBase.Administrador),
  );
  readonly areAllUnidadOrganizacionalRowsSelected = computed(() => {
    const rows = this.filteredUnidadOrganizacionalRows();
    return rows.length > 0 && rows.every((row) => this.selectedUnidadOrganizacionalRows().some((selected) => selected.id === row.id));
  });
  readonly scrollBarHorizontal = window.innerWidth < 1200;

  readonly unidadOrganizacionalForm = this.formBuilder.group({
    id: [''],
    id_Organizacion: ['', [Validators.required]],
    codigo: ['', [Validators.required]],
    nombre: ['', [Validators.required]],
    descripcion: [''],
  });

  constructor() {
    this.loadUnidadOrganizacionalPage();
    this.loadOrganizacionOptions();
  }

  loadUnidadOrganizacionalPage(): void {
    this.loadingUnidadOrganizacionalPage.set(true);
    this.unidadOrganizacionalPageError.set('');

    this.unidadOrganizacionalService.buscarUnidadOrganizacionalLista()
      .pipe(
        finalize(() => this.loadingUnidadOrganizacionalPage.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (items) => {
          this.unidadOrganizacionalRows.set(items);
          this.selectedUnidadOrganizacionalRows.set([]);
        },
        error: (error: unknown) => {
          this.unidadOrganizacionalPageError.set(formatApiError(error) || this.texts.feedback.loadError);
        },
      });
  }

  loadOrganizacionOptions(): void {
    this.loadingOrganizacionOptions.set(true);

    this.organizacionApi.buscarTodos()
      .pipe(
        map((items) => this.normalizeOrganizacionOptions(items ?? [])),
        finalize(() => this.loadingOrganizacionOptions.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (items) => {
          this.organizacionOptions.set(items);
        },
        error: (error: unknown) => {
          this.toastr.error(formatApiError(error), this.texts.feedback.organizationOptionsLoadError);
        },
      });
  }

  onUnidadOrganizacionalSearchChange(value: string): void {
    this.unidadOrganizacionalSearchTerm.set(value);
    if (this.table) {
      this.table.offset = 0;
    }
  }

  clearUnidadOrganizacionalSearch(): void {
    this.unidadOrganizacionalSearchTerm.set('');
    if (this.table) {
      this.table.offset = 0;
    }
  }

  onUnidadOrganizacionalToggleSelection(row: UnidadOrganizacionalCrudItem, checked: boolean): void {
    const selectedMap = new Map(this.selectedUnidadOrganizacionalRows().map((item) => [item.id, item] as const));

    if (checked) {
      selectedMap.set(row.id, row);
    } else {
      selectedMap.delete(row.id);
    }

    this.selectedUnidadOrganizacionalRows.set(Array.from(selectedMap.values()));
  }

  onUnidadOrganizacionalToggleAllSelection(checked: boolean): void {
    this.selectedUnidadOrganizacionalRows.set(checked ? [...this.filteredUnidadOrganizacionalRows()] : []);
  }

  isUnidadOrganizacionalRowSelected(row: UnidadOrganizacionalCrudItem): boolean {
    return this.selectedUnidadOrganizacionalRows().some((item) => item.id === row.id);
  }

  toggleUnidadOrganizacionalDetail(row: UnidadOrganizacionalCrudItem): void {
    this.table.rowDetail.toggleExpandRow(row);
  }

  onUnidadOrganizacionalDetailToggle(_event: unknown): void {}

  onUnidadOrganizacionalPageChange(event: { page: number }): void {
    this.table.offset = event.page - 1;
  }

  changeUnidadOrganizacionalPageLimit(value: string): void {
    this.unidadOrganizacionalPageLimit.set(Number(value));
    if (this.table) {
      this.table.offset = 0;
    }
  }

  openCreateUnidadOrganizacionalDialog(content: TemplateRef<unknown>): void {
    const initialValue = { ...this.config.initialFormValue };
    this.unidadOrganizacionalDialogMode.set('create');
    this.unidadOrganizacionalDialogError.set('');
    this.unidadOrganizacionalFormInitialValue.set(initialValue);
    this.unidadOrganizacionalForm.reset(initialValue);
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', size: 'lg' });
  }

  openEditUnidadOrganizacionalDialog(item: UnidadOrganizacionalCrudItem, content: TemplateRef<unknown>): void {
    const initialValue = {
      id: item.id,
      id_Organizacion: item.id_Organizacion,
      codigo: item.codigo,
      nombre: item.nombre,
      descripcion: item.descripcion,
    };

    this.unidadOrganizacionalDialogMode.set('edit');
    this.unidadOrganizacionalDialogError.set('');
    this.unidadOrganizacionalFormInitialValue.set(initialValue);
    this.unidadOrganizacionalForm.reset(initialValue);
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', size: 'lg' });
  }

  resetUnidadOrganizacionalForm(): void {
    this.unidadOrganizacionalForm.reset(this.unidadOrganizacionalFormInitialValue());
  }

  saveUnidadOrganizacionalForm(modal: { close: () => void }): void {
    if (this.unidadOrganizacionalForm.invalid) {
      this.unidadOrganizacionalForm.markAllAsTouched();
      return;
    }

    this.savingUnidadOrganizacionalForm.set(true);
    this.unidadOrganizacionalDialogError.set('');

    const formValue = this.getUnidadOrganizacionalFormValue();
    const request$ = this.isUnidadOrganizacionalCreateMode()
      ? this.unidadOrganizacionalService.crearUnidadOrganizacional({
          id_Organizacion: formValue.id_Organizacion,
          codigo: formValue.codigo,
          nombre: formValue.nombre,
          descripcion: formValue.descripcion,
        })
      : this.unidadOrganizacionalService.modificarUnidadOrganizacional({
          id: formValue.id,
          nombre: formValue.nombre,
          descripcion: formValue.descripcion,
        });

    request$
      .pipe(
        finalize(() => this.savingUnidadOrganizacionalForm.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          modal.close();
          this.loadUnidadOrganizacionalPage();
          this.toastr.success(
            this.isUnidadOrganizacionalCreateMode()
              ? this.texts.feedback.createSuccess
              : this.texts.feedback.updateSuccess,
          );
        },
        error: (error: unknown) => {
          this.unidadOrganizacionalDialogError.set(formatApiError(error));
        },
      });
  }

  confirmDeleteUnidadOrganizacional(item: UnidadOrganizacionalCrudItem): void {
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

      this.processingUnidadOrganizacionalId.set(item.id);
      this.unidadOrganizacionalService.eliminarUnidadOrganizacional({ id: item.id })
        .pipe(
          finalize(() => this.processingUnidadOrganizacionalId.set(null)),
          takeUntilDestroyed(this.destroyRef),
        )
        .subscribe({
          next: () => {
            this.loadUnidadOrganizacionalPage();
            this.toastr.success(this.texts.feedback.deleteSuccess);
          },
          error: (error: unknown) => {
            this.toastr.error(formatApiError(error));
          },
        });
    });
  }

  confirmDeleteSelectedUnidadOrganizacionalRows(): void {
    const selectedRows = this.selectedUnidadOrganizacionalRows();
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

      this.processingUnidadOrganizacionalId.set('bulk');
      from(selectedRows.map((row) => row.id))
        .pipe(
          concatMap((id) =>
            this.unidadOrganizacionalService.eliminarUnidadOrganizacional({ id }).pipe(
              map(() => ({ success: true as const })),
              catchError((error: unknown) => of({ success: false as const, error })),
            ),
          ),
          toArray(),
          finalize(() => this.processingUnidadOrganizacionalId.set(null)),
          takeUntilDestroyed(this.destroyRef),
        )
        .subscribe((results) => {
          const failures = results.filter((item) => !item.success);
          this.selectedUnidadOrganizacionalRows.set([]);
          this.loadUnidadOrganizacionalPage();

          if (failures.length) {
            const firstFailure = failures[0] as { success: false; error: unknown };
            this.toastr.error(formatApiError(firstFailure.error), this.texts.feedback.partialDeleteError);
            return;
          }

          this.toastr.success(this.texts.feedback.deleteSelectedSuccess);
        });
    });
  }

  toggleUnidadOrganizacionalStatus(item: UnidadOrganizacionalCrudItem): void {
    this.processingUnidadOrganizacionalId.set(item.id);
    const request$ = item.activo
      ? this.unidadOrganizacionalService.desactivarUnidadOrganizacional({ id: item.id })
      : this.unidadOrganizacionalService.activarUnidadOrganizacional({ id: item.id });

    request$
      .pipe(
        finalize(() => this.processingUnidadOrganizacionalId.set(null)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.updateUnidadOrganizacionalRowState(item.id, !item.activo);
          this.toastr.success(
            item.activo ? this.texts.feedback.deactivateSuccess : this.texts.feedback.activateSuccess,
          );
        },
        error: (error: unknown) => {
          this.toastr.error(formatApiError(error));
        },
      });
  }

  isUnidadOrganizacionalFormControlInvalid(controlName: keyof UnidadOrganizacionalCrudFormValue): boolean {
    const control = this.unidadOrganizacionalForm.controls[controlName];
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  getUnidadOrganizacionalFormControlError(controlName: keyof UnidadOrganizacionalCrudFormValue): string {
    const control = this.unidadOrganizacionalForm.controls[controlName];
    if (!control?.errors) {
      return '';
    }

    if (control.errors['required']) {
      if (controlName === 'id_Organizacion') {
        return this.texts.validation.idOrganizacionRequired;
      }

      return controlName === 'codigo'
        ? this.texts.validation.codigoRequired
        : this.texts.validation.nombreRequired;
    }

    return '';
  }

  isUnidadOrganizacionalRowBusy(item: UnidadOrganizacionalCrudItem): boolean {
    return this.processingUnidadOrganizacionalId() === item.id || this.processingUnidadOrganizacionalId() === 'bulk';
  }

  getUnidadOrganizacionalStatusLabel(item: UnidadOrganizacionalCrudItem): string {
    return item.activo ? this.texts.status.active : this.texts.status.inactive;
  }

  openUnidadOrganizacionalTraceability(item: UnidadOrganizacionalCrudItem): void {
    void this.router.navigate(['/paneles/trazabilidad'], {
      queryParams: {
        entity: 'UnidadOrganizacional',
        aggregateId: item.id,
        source: this.texts.breadcrumbCurrent,
        sourceUrl: '/dominios/administracion/entidades/unidadorganizacional',
      },
    });
  }

  private getUnidadOrganizacionalFormValue(): UnidadOrganizacionalCrudFormValue {
    const rawValue = this.unidadOrganizacionalForm.getRawValue();
    return {
      id: rawValue.id?.trim() ?? '',
      id_Organizacion: rawValue.id_Organizacion?.trim() ?? '',
      codigo: rawValue.codigo?.trim() ?? '',
      nombre: rawValue.nombre?.trim() ?? '',
      descripcion: rawValue.descripcion?.trim() ?? '',
    };
  }

  private updateUnidadOrganizacionalRowState(id: string, activo: boolean): void {
    this.unidadOrganizacionalRows.update((rows) =>
      rows.map((row) => row.id === id ? { ...row, activo } : row),
    );

    this.selectedUnidadOrganizacionalRows.update((rows) =>
      rows.map((row) => row.id === id ? { ...row, activo } : row),
    );
  }

  private normalizeOrganizacionOptions(items: OrganizacionViewModel[]): UnidadOrganizacionalOrganizacionOption[] {
    return items
      .map((item) => ({
        id: typeof item.id === 'string' ? item.id.trim() : '',
        nombre: typeof item.nombre === 'string' ? item.nombre.trim() : '',
      }))
      .filter((item) => item.id && item.nombre)
      .sort((left, right) => left.nombre.localeCompare(right.nombre, 'es'));
  }
}
