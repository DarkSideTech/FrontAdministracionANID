import { Component, DestroyRef, TemplateRef, ViewChild, computed, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DatatableComponent, NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, concatMap, finalize, forkJoin, from, map, of, toArray } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { NgSelectModule } from '@ng-select/ng-select';
import Swal from 'sweetalert2';

import { AuthStore } from '@core/auth/auth-store.service';
import { EnumerationOption } from '@core/enumerations/enumeration.models';
import { EnumRolesBase } from '@core/enumerations/enum-roles';
import { formatApiError } from '@core/service/api-error.util';
import { EnumerationApi } from '@core/service/controllers/enumeration.api';
import { PROCESO_CRUD_PAGE_CONFIG } from '@core/service/controllers/proceso/proceso-crud.config';
import { ProcesoCrudCatalogs, ProcesoCrudFormValue, ProcesoCrudItem } from '@core/service/controllers/proceso/proceso-crud.models';
import { ProcesoCrudService } from '@core/service/controllers/proceso/proceso-crud.service';
import { GOV_CL_ICON_REGISTRY } from '@core/ui/gob-cl-icons';

type ProcesoDialogMode = 'create' | 'edit';

@Component({
  selector: 'app-administracion-proceso',
  templateUrl: './proceso.component.html',
  styleUrl: './proceso.component.scss',
  imports: [
    RouterLink,
    ReactiveFormsModule,
    NgxDatatableModule,
    NgSelectModule,
  ],
})
export class ProcesoComponent {
  @ViewChild(DatatableComponent, { static: false }) table!: DatatableComponent;

  private readonly procesoService = inject(ProcesoCrudService);
  private readonly enumerationApi = inject(EnumerationApi);
  private readonly formBuilder = inject(FormBuilder);
  private readonly modalService = inject(NgbModal);
  private readonly toastr = inject(ToastrService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly authStore = inject(AuthStore);

  readonly config = PROCESO_CRUD_PAGE_CONFIG;
  readonly icons = GOV_CL_ICON_REGISTRY;
  readonly texts = this.config.texts;
  readonly procesoActionVisibility = this.config.actionVisibility;

  readonly loadingProcesoPage = signal(false);
  readonly loadingProcesoCatalogs = signal(false);
  readonly savingProcesoForm = signal(false);
  readonly processingProcesoId = signal<string | null>(null);
  readonly procesoPageError = signal('');
  readonly procesoDialogError = signal('');
  readonly procesoSearchTerm = signal('');
  readonly procesoDialogMode = signal<ProcesoDialogMode>('create');
  readonly procesoRows = signal<ProcesoCrudItem[]>([]);
  readonly selectedProcesoRows = signal<ProcesoCrudItem[]>([]);
  readonly nivelesDeProceso = signal<EnumerationOption[]>([]);
  readonly modosDeDespliegue = signal<EnumerationOption[]>([]);
  readonly procesoPageLimit = signal(this.config.defaultPageLimit);
  readonly procesoPageSizeOptions = this.config.pageSizeOptions;
  readonly procesoFormInitialValue = signal<ProcesoCrudFormValue>({ ...this.config.initialFormValue });

  readonly filteredProcesoRows = computed(() => {
    const term = this.procesoSearchTerm().trim().toLowerCase();

    if (!term) {
      return this.procesoRows();
    }

    return this.procesoRows().filter((item) =>
      [
        item.codigo,
        item.nombre,
        item.descripcion,
        item.nivelDeProceso,
        item.comoDesplegarUrlDeProceso,
        item.activo ? this.texts.status.active : this.texts.status.inactive,
      ].some((field) => field.toLowerCase().includes(term)),
    );
  });

  readonly selectedProcesoCount = computed(() => this.selectedProcesoRows().length);
  readonly hasSelectedProcesoRows = computed(() => this.selectedProcesoCount() > 0);
  readonly hasProcesoSearchTerm = computed(() => this.procesoSearchTerm().trim().length > 0);
  readonly isProcesoCreateMode = computed(() => this.procesoDialogMode() === 'create');
  readonly canViewProcesoTraceability = computed(() =>
    this.authStore.hasOrganizationSession() && this.authStore.hasRole(EnumRolesBase.Administrador),
  );
  readonly areAllProcesoRowsSelected = computed(() => {
    const rows = this.filteredProcesoRows();
    return rows.length > 0 && rows.every((row) => this.selectedProcesoRows().some((selected) => selected.id === row.id));
  });
  readonly scrollBarHorizontal = window.innerWidth < 1200;

  readonly procesoForm = this.formBuilder.group({
    id: [''],
    idMacro_Proceso: ['', [Validators.required]],
    codigo: ['', [Validators.required]],
    nombre: ['', [Validators.required]],
    descripcion: [''],
    contexto: [''],
    nivelDeProceso: ['', [Validators.required]],
    url: ['', [Validators.required]],
    token: ['', [Validators.required]],
    comoDesplegarUrlDeProceso: ['', [Validators.required]],
    maximaAsignacionDeRoles: ['', [Validators.required]],
  });

  constructor() {
    this.loadProcesoPage();
    this.loadProcesoCatalogs();
  }

  loadProcesoPage(): void {
    this.loadingProcesoPage.set(true);
    this.procesoPageError.set('');

    this.procesoService.buscarProcesoLista()
      .pipe(
        finalize(() => this.loadingProcesoPage.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (items) => {
          this.procesoRows.set(items);
          this.selectedProcesoRows.set([]);
        },
        error: (error: unknown) => {
          this.procesoPageError.set(formatApiError(error) || this.texts.feedback.loadError);
        },
      });
  }

  loadProcesoCatalogs(): void {
    this.loadingProcesoCatalogs.set(true);

    forkJoin({
      nivelesDeProceso: this.enumerationApi.buscarTodosLosValoresEnumNivelDeProceso().pipe(
        map((values) => this.toEnumerationOptions(values)),
      ),
      modosDeDespliegue: this.enumerationApi.buscarTodosLosValoresEnumComoDesplegarUrlDeProceso().pipe(
        map((values) => this.toEnumerationOptions(values)),
      ),
    })
      .pipe(
        finalize(() => this.loadingProcesoCatalogs.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (catalogs) => {
          this.nivelesDeProceso.set(catalogs.nivelesDeProceso);
          this.modosDeDespliegue.set(catalogs.modosDeDespliegue);
        },
        error: (error: unknown) => {
          this.toastr.error(formatApiError(error), this.texts.feedback.catalogsLoadError);
        },
      });
  }

  onProcesoSearchChange(value: string): void {
    this.procesoSearchTerm.set(value);
    if (this.table) {
      this.table.offset = 0;
    }
  }

  clearProcesoSearch(): void {
    this.procesoSearchTerm.set('');
    if (this.table) {
      this.table.offset = 0;
    }
  }

  onProcesoToggleSelection(row: ProcesoCrudItem, checked: boolean): void {
    const selectedMap = new Map(this.selectedProcesoRows().map((item) => [item.id, item] as const));

    if (checked) {
      selectedMap.set(row.id, row);
    } else {
      selectedMap.delete(row.id);
    }

    this.selectedProcesoRows.set(Array.from(selectedMap.values()));
  }

  onProcesoToggleAllSelection(checked: boolean): void {
    this.selectedProcesoRows.set(checked ? [...this.filteredProcesoRows()] : []);
  }

  isProcesoRowSelected(row: ProcesoCrudItem): boolean {
    return this.selectedProcesoRows().some((item) => item.id === row.id);
  }

  toggleProcesoDetail(row: ProcesoCrudItem): void {
    this.table.rowDetail.toggleExpandRow(row);
  }

  onProcesoDetailToggle(_event: unknown): void {}

  onProcesoPageChange(event: { page: number }): void {
    this.table.offset = event.page - 1;
  }

  changeProcesoPageLimit(value: string): void {
    this.procesoPageLimit.set(Number(value));
    if (this.table) {
      this.table.offset = 0;
    }
  }

  openCreateProcesoDialog(content: TemplateRef<unknown>): void {
    const initialValue = { ...this.config.initialFormValue };
    this.procesoDialogMode.set('create');
    this.procesoDialogError.set('');
    this.procesoFormInitialValue.set(initialValue);
    this.procesoForm.reset(initialValue);
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', size: 'lg' });
  }

  openEditProcesoDialog(item: ProcesoCrudItem, content: TemplateRef<unknown>): void {
    const initialValue = {
      id: item.id,
      idMacro_Proceso: item.idMacro_Proceso,
      codigo: item.codigo,
      nombre: item.nombre,
      descripcion: item.descripcion,
      contexto: item.contexto,
      nivelDeProceso: item.nivelDeProceso,
      url: item.url,
      token: item.token,
      comoDesplegarUrlDeProceso: item.comoDesplegarUrlDeProceso,
      maximaAsignacionDeRoles: item.maximaAsignacionDeRoles !== null ? String(item.maximaAsignacionDeRoles) : '',
    };

    this.procesoDialogMode.set('edit');
    this.procesoDialogError.set('');
    this.procesoFormInitialValue.set(initialValue);
    this.procesoForm.reset(initialValue);
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', size: 'lg' });
  }

  resetProcesoForm(): void {
    this.procesoForm.reset(this.procesoFormInitialValue());
  }

  saveProcesoForm(modal: { close: () => void }): void {
    if (this.procesoForm.invalid) {
      this.procesoForm.markAllAsTouched();
      return;
    }

    this.savingProcesoForm.set(true);
    this.procesoDialogError.set('');

    const formValue = this.getProcesoFormValue();
    const maximaAsignacionDeRoles = Number(formValue.maximaAsignacionDeRoles);

    const request$ = this.isProcesoCreateMode()
      ? this.procesoService.crearProceso({
          idMacro_Proceso: formValue.idMacro_Proceso,
          codigo: formValue.codigo,
          nombre: formValue.nombre,
          descripcion: formValue.descripcion,
          contexto: formValue.contexto,
          nivelDeProceso: formValue.nivelDeProceso,
          url: formValue.url,
          token: formValue.token,
          comoDesplegarUrlDeProceso: formValue.comoDesplegarUrlDeProceso,
          maximaAsignacionDeRoles,
        })
      : this.procesoService.modificarProceso({
          id: formValue.id,
          nombre: formValue.nombre,
          descripcion: formValue.descripcion,
          contexto: formValue.contexto,
          nivelDeProceso: formValue.nivelDeProceso,
          url: formValue.url,
          token: formValue.token,
          comoDesplegarUrlDeProceso: formValue.comoDesplegarUrlDeProceso,
          maximaAsignacionDeRoles,
        });

    request$
      .pipe(
        finalize(() => this.savingProcesoForm.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          modal.close();
          this.loadProcesoPage();
          this.toastr.success(
            this.isProcesoCreateMode()
              ? this.texts.feedback.createSuccess
              : this.texts.feedback.updateSuccess,
          );
        },
        error: (error: unknown) => {
          this.procesoDialogError.set(formatApiError(error));
        },
      });
  }

  confirmDeleteProceso(item: ProcesoCrudItem): void {
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

      this.processingProcesoId.set(item.id);
      this.procesoService.eliminarProceso({ id: item.id })
        .pipe(
          finalize(() => this.processingProcesoId.set(null)),
          takeUntilDestroyed(this.destroyRef),
        )
        .subscribe({
          next: () => {
            this.loadProcesoPage();
            this.toastr.success(this.texts.feedback.deleteSuccess);
          },
          error: (error: unknown) => {
            this.toastr.error(formatApiError(error));
          },
        });
    });
  }

  confirmDeleteSelectedProcesoRows(): void {
    const selectedRows = this.selectedProcesoRows();
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

      this.processingProcesoId.set('bulk');
      from(selectedRows.map((row) => row.id))
        .pipe(
          concatMap((id) =>
            this.procesoService.eliminarProceso({ id }).pipe(
              map(() => ({ success: true as const })),
              catchError((error: unknown) => of({ success: false as const, error })),
            ),
          ),
          toArray(),
          finalize(() => this.processingProcesoId.set(null)),
          takeUntilDestroyed(this.destroyRef),
        )
        .subscribe((results) => {
          const failures = results.filter((item) => !item.success);
          this.selectedProcesoRows.set([]);
          this.loadProcesoPage();

          if (failures.length) {
            const firstFailure = failures[0] as { success: false; error: unknown };
            this.toastr.error(formatApiError(firstFailure.error), this.texts.feedback.partialDeleteError);
            return;
          }

          this.toastr.success(this.texts.feedback.deleteSelectedSuccess);
        });
    });
  }

  toggleProcesoStatus(item: ProcesoCrudItem): void {
    this.processingProcesoId.set(item.id);
    const request$ = item.activo
      ? this.procesoService.desactivarProceso({ id: item.id })
      : this.procesoService.activarProceso({ id: item.id });

    request$
      .pipe(
        finalize(() => this.processingProcesoId.set(null)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.updateProcesoRowState(item.id, !item.activo);
          this.toastr.success(
            item.activo ? this.texts.feedback.deactivateSuccess : this.texts.feedback.activateSuccess,
          );
        },
        error: (error: unknown) => {
          this.toastr.error(formatApiError(error));
        },
      });
  }

  isProcesoFormControlInvalid(controlName: keyof ProcesoCrudFormValue): boolean {
    const control = this.procesoForm.controls[controlName];
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  getProcesoFormControlError(controlName: keyof ProcesoCrudFormValue): string {
    const control = this.procesoForm.controls[controlName];
    if (!control?.errors) {
      return '';
    }

    if (control.errors['required']) {
      switch (controlName) {
        case 'idMacro_Proceso':
          return this.texts.validation.idMacroProcesoRequired;
        case 'codigo':
          return this.texts.validation.codigoRequired;
        case 'nombre':
          return this.texts.validation.nombreRequired;
        case 'nivelDeProceso':
          return this.texts.validation.nivelDeProcesoRequired;
        case 'url':
          return this.texts.validation.urlRequired;
        case 'token':
          return this.texts.validation.tokenRequired;
        case 'comoDesplegarUrlDeProceso':
          return this.texts.validation.comoDesplegarRequired;
        case 'maximaAsignacionDeRoles':
          return this.texts.validation.maximaAsignacionRequired;
        default:
          return '';
      }
    }

    return '';
  }

  isProcesoRowBusy(item: ProcesoCrudItem): boolean {
    return this.processingProcesoId() === item.id || this.processingProcesoId() === 'bulk';
  }

  getProcesoStatusLabel(item: ProcesoCrudItem): string {
    return item.activo ? this.texts.status.active : this.texts.status.inactive;
  }

  openProcesoTraceability(item: ProcesoCrudItem): void {
    void this.router.navigate(['/paneles/trazabilidad'], {
      queryParams: {
        entity: 'Proceso',
        aggregateId: item.id,
        source: this.texts.breadcrumbCurrent,
        sourceUrl: '/dominios/administracion/entidades/proceso',
      },
    });
  }

  private getProcesoFormValue(): ProcesoCrudFormValue {
    const rawValue = this.procesoForm.getRawValue();
    return {
      id: rawValue.id?.trim() ?? '',
      idMacro_Proceso: rawValue.idMacro_Proceso?.trim() ?? '',
      codigo: rawValue.codigo?.trim() ?? '',
      nombre: rawValue.nombre?.trim() ?? '',
      descripcion: rawValue.descripcion?.trim() ?? '',
      contexto: rawValue.contexto?.trim() ?? '',
      nivelDeProceso: rawValue.nivelDeProceso?.trim() ?? '',
      url: rawValue.url?.trim() ?? '',
      token: rawValue.token?.trim() ?? '',
      comoDesplegarUrlDeProceso: rawValue.comoDesplegarUrlDeProceso?.trim() ?? '',
      maximaAsignacionDeRoles: rawValue.maximaAsignacionDeRoles?.trim() ?? '',
    };
  }

  private updateProcesoRowState(id: string, activo: boolean): void {
    this.procesoRows.update((rows) =>
      rows.map((row) => row.id === id ? { ...row, activo } : row),
    );

    this.selectedProcesoRows.update((rows) =>
      rows.map((row) => row.id === id ? { ...row, activo } : row),
    );
  }

  private toEnumerationOptions(values: string[]): EnumerationOption[] {
    return values
      .map((value) => value?.trim())
      .filter((value): value is string => Boolean(value))
      .map((value) => ({
        value,
        label: formatEnumerationLabel(value),
      }));
  }
}

function formatEnumerationLabel(value: string): string {
  const trimmedValue = value.trim();
  if (!trimmedValue) {
    return '';
  }

  const useSlashSeparator = /[a-záéíóúüñ]/i.test(trimmedValue) && /_[a-záéíóúüñ]/i.test(trimmedValue);
  const parts = trimmedValue.split('_').filter(Boolean);

  if (useSlashSeparator) {
    return parts
      .map((part) => formatMixedCaseSegment(part))
      .join('/');
  }

  return parts
    .map((part) => formatUpperSnakeSegment(part))
    .join(' ');
}

function formatMixedCaseSegment(value: string): string {
  if (value.length === 1) {
    return value.toLowerCase();
  }

  const normalizedValue = value.toLowerCase();
  return normalizedValue.replace(/^\p{L}/u, (match) => match.toUpperCase());
}

function formatUpperSnakeSegment(value: string): string {
  const normalizedValue = value.toLowerCase();
  return normalizedValue.replace(/\b\p{L}/gu, (match) => match.toUpperCase());
}
