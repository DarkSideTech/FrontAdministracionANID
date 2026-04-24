import { Component, DestroyRef, TemplateRef, ViewChild, computed, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DatatableComponent, NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, forkJoin } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

import { AccountAuthService } from '@core/auth/account-auth.service';
import { AuthStore } from '@core/auth/auth-store.service';
import { EnumerationOption } from '@core/enumerations/enumeration.models';
import { EnumerationService } from '@core/enumerations/enumeration.service';
import { EnumRolesBase } from '@core/enumerations/enum-roles';
import { formatApiError } from '@core/service/api-error.util';
import { EnumerationApi } from '@core/service/controllers/enumeration.api';
import { USUARIO_CRUD_PAGE_CONFIG } from '@core/service/controllers/usuario/usuario-crud.config';
import { UsuarioCrudFormValue, UsuarioCrudItem, UsuarioEmailChangeFormValue } from '@core/service/controllers/usuario/usuario-crud.models';
import { UsuarioCrudService } from '@core/service/controllers/usuario/usuario-crud.service';
import { GOV_CL_ICON_REGISTRY } from '@core/ui/gob-cl-icons';

@Component({
  selector: 'app-administracion-usuario',
  templateUrl: './usuario.component.html',
  styleUrl: './usuario.component.scss',
  imports: [
    RouterLink,
    ReactiveFormsModule,
    NgxDatatableModule,
  ],
})
export class UsuarioComponent {
  @ViewChild(DatatableComponent, { static: false }) table!: DatatableComponent;

  private readonly usuarioService = inject(UsuarioCrudService);
  private readonly enumerationService = inject(EnumerationService);
  private readonly enumerationApi = inject(EnumerationApi);
  private readonly accountAuthService = inject(AccountAuthService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly modalService = inject(NgbModal);
  private readonly toastr = inject(ToastrService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly authStore = inject(AuthStore);
  private usuarioLoadRequestId = 0;

  readonly config = USUARIO_CRUD_PAGE_CONFIG;
  readonly icons = GOV_CL_ICON_REGISTRY;
  readonly texts = this.config.texts;
  readonly usuarioActionVisibility = this.config.actionVisibility;

  readonly loadingUsuarioPage = signal(false);
  readonly loadingUsuarioCatalogs = signal(false);
  readonly savingUsuarioForm = signal(false);
  readonly savingUsuarioEmailChange = signal(false);
  readonly processingUsuarioId = signal<string | null>(null);
  readonly usuarioPageError = signal('');
  readonly usuarioDialogError = signal('');
  readonly usuarioEmailDialogError = signal('');
  readonly usuarioSearchTerm = signal('');
  readonly usuarioRows = signal<UsuarioCrudItem[]>([]);
  readonly selectedUsuarioRows = signal<UsuarioCrudItem[]>([]);
  readonly usuarioPageLimit = signal(this.config.defaultPageLimit);
  readonly usuarioCurrentPage = signal(1);
  readonly usuarioTotalCount = signal(0);
  readonly usuarioPageSizeOptions = this.config.pageSizeOptions;
  readonly usuarioFormInitialValue = signal<UsuarioCrudFormValue>({ ...this.config.initialFormValue });

  readonly tipoDeUsuarioOptions = signal<EnumerationOption[]>([]);
  readonly nacionalidadOptions = signal<EnumerationOption[]>([]);
  readonly documentoDeIdentidadOptions = signal<EnumerationOption[]>([]);
  readonly sexoDeclarativoOptions = signal<EnumerationOption[]>([]);
  readonly sexoRegistralOptions = signal<EnumerationOption[]>([]);
  readonly estadoDeUsuarioOptions = signal<EnumerationOption[]>([]);

  readonly selectedUsuarioCount = computed(() => this.selectedUsuarioRows().length);
  readonly hasUsuarioSearchTerm = computed(() => this.usuarioSearchTerm().trim().length > 0);
  readonly canViewUsuarioTraceability = computed(() =>
    this.authStore.hasOrganizationSession() && this.authStore.hasRole(EnumRolesBase.Administrador),
  );
  readonly areAllUsuarioRowsSelected = computed(() => {
    const rows = this.usuarioRows();
    return rows.length > 0 && rows.every((row) => this.selectedUsuarioRows().some((selected) => selected.idUsuario === row.idUsuario));
  });
  readonly scrollBarHorizontal = window.innerWidth < 1400;

  readonly usuarioForm = this.formBuilder.group({
    idUsuario: [''],
    correoElectronico: [{ value: '', disabled: true }],
    numeroDeTelefono: ['', [Validators.minLength(8), Validators.maxLength(100)]],
    nacionalidad: ['', Validators.required],
    tipoDeUsuario: ['', Validators.required],
    documentoDeIdentidad: ['', Validators.required],
    numeroDeDocumento: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
    codigoValidadorDocumento: ['', [Validators.required, Validators.maxLength(100)]],
    primerNombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    segundoNombre: [''],
    primerApellido: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    segundoApellido: [''],
    sexoDeclarativo: ['', Validators.required],
    sexoRegistral: ['', Validators.required],
    fechaDeNacimiento: ['', Validators.required],
  });

  readonly usuarioEmailChangeForm = this.formBuilder.group({
    idUsuario: [''],
    correoElectronicoActual: [{ value: '', disabled: true }],
    nuevoCorreoElectronico: ['', [Validators.required, Validators.email]],
  });

  constructor() {
    this.usuarioForm.controls.tipoDeUsuario.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => this.applyUsuarioEditabilityRules(value ?? ''));

    this.loadUsuarioInitialData();
  }

  loadUsuarioInitialData(): void {
    this.loadingUsuarioCatalogs.set(true);
    this.usuarioPageError.set('');

    forkJoin({
      csrf: this.accountAuthService.ensureCsrfToken(),
      profileCatalogs: this.enumerationService.loadProfileCatalogs(),
      estados: this.enumerationApi.buscarTodosLosValoresEnumEstadoDeUsuario(),
    })
      .pipe(
        finalize(() => this.loadingUsuarioCatalogs.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: ({ profileCatalogs, estados }) => {
          this.tipoDeUsuarioOptions.set(profileCatalogs.tipoDeUsuario);
          this.nacionalidadOptions.set(profileCatalogs.nacionalidades);
          this.documentoDeIdentidadOptions.set(profileCatalogs.documentosDeIdentidad);
          this.sexoDeclarativoOptions.set(profileCatalogs.sexoDeclarativo);
          this.sexoRegistralOptions.set(profileCatalogs.sexoRegistral);
          this.estadoDeUsuarioOptions.set(this.toOptions(estados));
          this.loadUsuarioPage();
        },
        error: (error: unknown) => {
          this.usuarioPageError.set(formatApiError(error) || this.texts.feedback.loadError);
        },
      });
  }

  loadUsuarioPage(): void {
    const requestId = ++this.usuarioLoadRequestId;
    this.loadingUsuarioPage.set(true);
    this.usuarioPageError.set('');

    this.usuarioService.buscarUsuariosPaginados({
      numeroDePagina: this.usuarioCurrentPage(),
      cantidadPorPagina: this.usuarioPageLimit(),
      busqueda: this.usuarioSearchTerm().trim(),
    })
      .pipe(
        finalize(() => {
          if (requestId === this.usuarioLoadRequestId) {
            this.loadingUsuarioPage.set(false);
          }
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (page) => {
          if (requestId !== this.usuarioLoadRequestId) {
            return;
          }

          this.usuarioRows.set(page.items);
          this.usuarioTotalCount.set(page.total);
          this.usuarioCurrentPage.set(page.numeroDePagina);
          this.selectedUsuarioRows.set([]);
        },
        error: (error: unknown) => {
          if (requestId !== this.usuarioLoadRequestId) {
            return;
          }

          this.usuarioRows.set([]);
          this.usuarioTotalCount.set(0);
          this.selectedUsuarioRows.set([]);
          this.usuarioPageError.set(formatApiError(error) || this.texts.feedback.loadError);
        },
      });
  }

  onUsuarioSearchChange(value: string): void {
    this.usuarioSearchTerm.set(value);
    this.usuarioCurrentPage.set(1);
    this.loadUsuarioPage();
  }

  clearUsuarioSearch(): void {
    this.usuarioSearchTerm.set('');
    this.usuarioCurrentPage.set(1);
    this.loadUsuarioPage();
  }

  onUsuarioToggleSelection(row: UsuarioCrudItem, checked: boolean): void {
    const selectedMap = new Map(this.selectedUsuarioRows().map((item) => [item.idUsuario, item] as const));

    if (checked) {
      selectedMap.set(row.idUsuario, row);
    } else {
      selectedMap.delete(row.idUsuario);
    }

    this.selectedUsuarioRows.set(Array.from(selectedMap.values()));
  }

  onUsuarioToggleAllSelection(checked: boolean): void {
    this.selectedUsuarioRows.set(checked ? [...this.usuarioRows()] : []);
  }

  isUsuarioRowSelected(row: UsuarioCrudItem): boolean {
    return this.selectedUsuarioRows().some((item) => item.idUsuario === row.idUsuario);
  }

  toggleUsuarioDetail(row: UsuarioCrudItem): void {
    this.table.rowDetail.toggleExpandRow(row);
  }

  onUsuarioDetailToggle(_event: unknown): void {}

  onUsuarioPageChange(event: { page: number }): void {
    this.usuarioCurrentPage.set(event.page);
    this.loadUsuarioPage();
  }

  changeUsuarioPageLimit(value: string): void {
    this.usuarioPageLimit.set(Number(value));
    this.usuarioCurrentPage.set(1);
    this.loadUsuarioPage();
  }

  openEditUsuarioDialog(item: UsuarioCrudItem, content: TemplateRef<unknown>): void {
    const initialValue: UsuarioCrudFormValue = {
      idUsuario: item.idUsuario,
      correoElectronico: item.correoElectronico,
      numeroDeTelefono: item.numeroDeTelefono,
      nacionalidad: item.nacionalidad,
      tipoDeUsuario: item.tipoDeUsuario,
      documentoDeIdentidad: item.documentoDeIdentidad,
      numeroDeDocumento: item.numeroDeDocumento,
      codigoValidadorDocumento: item.codigoValidadorDocumento,
      primerNombre: item.primerNombre,
      segundoNombre: item.segundoNombre,
      primerApellido: item.primerApellido,
      segundoApellido: item.segundoApellido,
      sexoDeclarativo: item.sexoDeclarativo,
      sexoRegistral: item.sexoRegistral,
      fechaDeNacimiento: item.fechaDeNacimiento,
    };

    this.usuarioDialogError.set('');
    this.usuarioFormInitialValue.set(initialValue);
    this.usuarioForm.reset(initialValue);
    this.usuarioForm.controls.correoElectronico.disable({ emitEvent: false });
    this.applyUsuarioEditabilityRules(item.tipoDeUsuario);
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', size: 'lg' });
  }

  openEmailUsuarioDialog(item: UsuarioCrudItem, content: TemplateRef<unknown>): void {
    const initialValue: UsuarioEmailChangeFormValue = {
      idUsuario: item.idUsuario,
      correoElectronicoActual: item.correoElectronico,
      nuevoCorreoElectronico: '',
    };

    this.usuarioEmailDialogError.set('');
    this.usuarioEmailChangeForm.reset(initialValue);
    this.usuarioEmailChangeForm.controls.correoElectronicoActual.disable({ emitEvent: false });
    this.modalService.open(content, { ariaLabelledBy: 'modal-email-title', size: 'md' });
  }

  resetUsuarioForm(): void {
    this.usuarioForm.reset(this.usuarioFormInitialValue());
    this.usuarioForm.controls.correoElectronico.disable({ emitEvent: false });
    this.applyUsuarioEditabilityRules(this.usuarioFormInitialValue().tipoDeUsuario);
  }

  saveUsuarioForm(modal: { close: () => void }): void {
    if (this.usuarioForm.invalid) {
      this.usuarioForm.markAllAsTouched();
      return;
    }

    this.savingUsuarioForm.set(true);
    this.usuarioDialogError.set('');

    const formValue = this.getUsuarioFormValue();
    this.usuarioService.modificarUsuario({
      idUsuario: formValue.idUsuario,
      correoElectronico: formValue.correoElectronico,
      numeroDeTelefono: this.normalizeNullable(formValue.numeroDeTelefono),
      nacionalidad: formValue.nacionalidad,
      tipoDeUsuario: formValue.tipoDeUsuario,
      documentoDeIdentidad: formValue.documentoDeIdentidad,
      numeroDeDocumento: formValue.numeroDeDocumento,
      codigoValidadorDocumento: formValue.codigoValidadorDocumento,
      primerNombre: formValue.primerNombre,
      segundoNombre: this.normalizeNullable(formValue.segundoNombre),
      primerApellido: formValue.primerApellido,
      segundoApellido: this.normalizeNullable(formValue.segundoApellido),
      sexoDeclarativo: formValue.sexoDeclarativo,
      sexoRegistral: formValue.sexoRegistral,
      fechaDeNacimiento: formValue.fechaDeNacimiento,
    })
      .pipe(
        finalize(() => this.savingUsuarioForm.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          modal.close();
          this.loadUsuarioPage();
          this.toastr.success(this.texts.feedback.updateSuccess);
        },
        error: (error: unknown) => {
          this.usuarioDialogError.set(formatApiError(error));
        },
      });
  }

  saveUsuarioEmailForm(modal: { close: () => void }): void {
    this.usuarioEmailDialogError.set('');

    if (this.usuarioEmailChangeForm.invalid) {
      this.usuarioEmailChangeForm.markAllAsTouched();
      this.usuarioEmailDialogError.set('Ingresa un correo electronico valido para continuar.');
      return;
    }

    const formValue = this.getUsuarioEmailChangeFormValue();
    if (!formValue.idUsuario) {
      this.usuarioEmailDialogError.set('No fue posible determinar el usuario seleccionado.');
      return;
    }

    if (formValue.correoElectronicoActual
      && formValue.nuevoCorreoElectronico.localeCompare(formValue.correoElectronicoActual, undefined, { sensitivity: 'accent' }) === 0) {
      this.usuarioEmailDialogError.set('El nuevo correo electronico debe ser distinto al actual.');
      return;
    }

    this.savingUsuarioEmailChange.set(true);
    this.usuarioService.adminModificarCorreoElectronico({
      idUsuario: formValue.idUsuario,
      nuevoCorreoElectronico: formValue.nuevoCorreoElectronico,
    })
      .pipe(
        finalize(() => this.savingUsuarioEmailChange.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          modal.close();
          this.loadUsuarioPage();
          this.toastr.success(this.texts.feedback.emailChangeSuccess);
        },
        error: (error: unknown) => {
          this.usuarioEmailDialogError.set(formatApiError(error));
        },
      });
  }

  toggleUsuarioStatus(item: UsuarioCrudItem): void {
    this.processingUsuarioId.set(item.idUsuario);
    const request$ = item.activo
      ? this.usuarioService.desactivarUsuario({ idUsuario: item.idUsuario })
      : this.usuarioService.activarUsuario({ idUsuario: item.idUsuario });

    request$
      .pipe(
        finalize(() => this.processingUsuarioId.set(null)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.updateUsuarioRowState(item.idUsuario, !item.activo);
          this.toastr.success(item.activo ? this.texts.feedback.deactivateSuccess : this.texts.feedback.activateSuccess);
        },
        error: (error: unknown) => {
          this.toastr.error(formatApiError(error));
        },
      });
  }

  isUsuarioFormControlInvalid(controlName: keyof UsuarioCrudFormValue): boolean {
    const control = this.usuarioForm.controls[controlName];
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  getUsuarioFormControlError(controlName: keyof UsuarioCrudFormValue): string {
    const control = this.usuarioForm.controls[controlName];
    if (!control?.errors) {
      return '';
    }

    if (control.errors['required']) {
      return this.texts.validation[controlName] ?? 'Campo requerido';
    }

    if (control.errors['minlength'] || control.errors['maxlength']) {
      return this.texts.validation[controlName] ?? 'Campo invalido';
    }

    return 'Campo invalido';
  }

  isUsuarioEmailFormControlInvalid(controlName: keyof UsuarioEmailChangeFormValue): boolean {
    const control = this.usuarioEmailChangeForm.controls[controlName];
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  isUsuarioRowBusy(item: UsuarioCrudItem): boolean {
    return this.processingUsuarioId() === item.idUsuario;
  }

  getUsuarioStatusLabel(item: UsuarioCrudItem): string {
    return item.activo ? this.texts.status.active : this.texts.status.inactive;
  }

  getUsuarioEstadoLabel(item: UsuarioCrudItem): string {
    const option = this.estadoDeUsuarioOptions().find((value) => value.value === item.estadoDeUsuario);
    return option?.label ?? item.estadoDeUsuario;
  }

  openUsuarioTraceability(item: UsuarioCrudItem): void {
    void this.router.navigate(['/paneles/trazabilidad'], {
      queryParams: {
        entity: 'Usuario',
        aggregateId: item.idUsuario,
        source: this.texts.breadcrumbCurrent,
        sourceUrl: '/dominios/administracion/entidades/usuario',
      },
    });
  }

  private getUsuarioFormValue(): UsuarioCrudFormValue {
    const rawValue = this.usuarioForm.getRawValue();
    return {
      idUsuario: rawValue.idUsuario?.trim() ?? '',
      correoElectronico: rawValue.correoElectronico?.trim() ?? '',
      numeroDeTelefono: rawValue.numeroDeTelefono?.trim() ?? '',
      nacionalidad: rawValue.nacionalidad?.trim() ?? '',
      tipoDeUsuario: rawValue.tipoDeUsuario?.trim() ?? '',
      documentoDeIdentidad: rawValue.documentoDeIdentidad?.trim() ?? '',
      numeroDeDocumento: rawValue.numeroDeDocumento?.trim() ?? '',
      codigoValidadorDocumento: rawValue.codigoValidadorDocumento?.trim() ?? '',
      primerNombre: rawValue.primerNombre?.trim() ?? '',
      segundoNombre: rawValue.segundoNombre?.trim() ?? '',
      primerApellido: rawValue.primerApellido?.trim() ?? '',
      segundoApellido: rawValue.segundoApellido?.trim() ?? '',
      sexoDeclarativo: rawValue.sexoDeclarativo?.trim() ?? '',
      sexoRegistral: rawValue.sexoRegistral?.trim() ?? '',
      fechaDeNacimiento: rawValue.fechaDeNacimiento?.trim() ?? '',
    };
  }

  private getUsuarioEmailChangeFormValue(): UsuarioEmailChangeFormValue {
    const rawValue = this.usuarioEmailChangeForm.getRawValue();
    return {
      idUsuario: rawValue.idUsuario?.trim() ?? '',
      correoElectronicoActual: rawValue.correoElectronicoActual?.trim() ?? '',
      nuevoCorreoElectronico: rawValue.nuevoCorreoElectronico?.trim() ?? '',
    };
  }

  private updateUsuarioRowState(idUsuario: string, activo: boolean): void {
    this.usuarioRows.update((rows) =>
      rows.map((row) => row.idUsuario === idUsuario ? { ...row, activo } : row),
    );

    this.selectedUsuarioRows.update((rows) =>
      rows.map((row) => row.idUsuario === idUsuario ? { ...row, activo } : row),
    );
  }

  private applyUsuarioEditabilityRules(tipoDeUsuario: string): void {
    const isNational = (tipoDeUsuario ?? '').trim().toUpperCase() === 'NACIONAL';

    [
      'numeroDeTelefono',
      'nacionalidad',
      'documentoDeIdentidad',
      'numeroDeDocumento',
      'codigoValidadorDocumento',
      'primerNombre',
      'segundoNombre',
      'primerApellido',
      'segundoApellido',
      'sexoDeclarativo',
      'sexoRegistral',
      'fechaDeNacimiento',
    ].forEach((controlName) => {
      this.usuarioForm.get(controlName)?.enable({ emitEvent: false });
    });

    if (isNational) {
      [
        'numeroDeTelefono',
        'nacionalidad',
        'documentoDeIdentidad',
        'numeroDeDocumento',
        'codigoValidadorDocumento',
        'primerNombre',
        'segundoNombre',
        'primerApellido',
        'segundoApellido',
        'sexoDeclarativo',
        'fechaDeNacimiento',
      ].forEach((controlName) => {
        this.usuarioForm.get(controlName)?.disable({ emitEvent: false });
      });
    }

    this.usuarioForm.controls.correoElectronico.disable({ emitEvent: false });
    this.usuarioForm.controls.tipoDeUsuario.disable({ emitEvent: false });
  }

  private normalizeNullable(value: string): string | null {
    const normalizedValue = value.trim();
    return normalizedValue ? normalizedValue : null;
  }

  private toOptions(values: string[]): EnumerationOption[] {
    return values
      .map((value) => value?.trim())
      .filter((value): value is string => Boolean(value))
      .map((value) => ({
        value,
        label: this.formatEnumerationLabel(value),
      }));
  }

  private formatEnumerationLabel(value: string): string {
    const trimmedValue = value.trim();
    if (!trimmedValue) {
      return '';
    }

    const useSlashSeparator = /[a-záéíóúüñ]/i.test(trimmedValue) && /_[a-záéíóúüñ]/i.test(trimmedValue);
    const parts = trimmedValue.split('_').filter(Boolean);

    if (useSlashSeparator) {
      return parts
        .map((part) => this.formatMixedCaseSegment(part))
        .join('/');
    }

    return parts
      .map((part) => this.formatUpperSnakeSegment(part))
      .join(' ');
  }

  private formatMixedCaseSegment(value: string): string {
    if (value.length === 1) {
      return value.toLowerCase();
    }

    const normalizedValue = value.toLowerCase();
    return normalizedValue.replace(/^\p{L}/u, (match) => match.toUpperCase());
  }

  private formatUpperSnakeSegment(value: string): string {
    const normalizedValue = value.toLowerCase();
    return normalizedValue.replace(/\b\p{L}/gu, (match) => match.toUpperCase());
  }
}
