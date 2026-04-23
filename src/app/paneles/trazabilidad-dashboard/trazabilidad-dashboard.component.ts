import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ToastrService } from 'ngx-toastr';

import { formatApiError } from '@core/service/api-error.util';
import { TraceabilityService } from '@core/traceability/traceability.service';
import {
  PagedResult,
  TraceabilityEntityCatalogItem,
  TraceabilityEventDetail,
  TraceabilityEventListItem,
  TraceabilityFilterOptions,
  TraceabilitySearchRequest,
} from '@core/traceability/traceability.models';

@Component({
  selector: 'app-trazabilidad-dashboard',
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    NgxDatatableModule,
  ],
  templateUrl: './trazabilidad-dashboard.component.html',
  styleUrl: './trazabilidad-dashboard.component.scss',
})
export class TrazabilidadDashboardComponent {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toastr = inject(ToastrService);
  private readonly traceabilityService = inject(TraceabilityService);

  readonly filterForm = this.fb.nonNullable.group({
    entityKey: '',
    aggregateId: '',
    fromUtc: '',
    toUtc: '',
    operationType: '',
    eventType: '',
    commandType: '',
    pageSize: 50,
    sortDirection: 'desc',
  });

  entities: TraceabilityEntityCatalogItem[] = [];
  filterOptions: TraceabilityFilterOptions = {
    operationTypes: [],
    eventTypes: [],
    commandTypes: [],
  };
  resultPage: PagedResult<TraceabilityEventListItem> = {
    page: 1,
    pageSize: 50,
    totalCount: 0,
    items: [],
  };
  selectedEvent: TraceabilityEventDetail | null = null;

  loadingEntities = false;
  loadingFilters = false;
  loadingResults = false;
  loadingDetail = false;
  loadingTimeline = false;
  sourceName = '';
  sourceUrl = '';
  private initialPage = 1;

  readonly scrollBarHorizontal = window.innerWidth < 1400;

  constructor() {
    this.applyQueryParams();
    this.loadEntities();
  }

  get hasResults(): boolean {
    return this.resultPage.items.length > 0;
  }

  get totalPages(): number {
    if (this.resultPage.totalCount <= 0 || this.resultPage.pageSize <= 0) {
      return 1;
    }

    return Math.max(1, Math.ceil(this.resultPage.totalCount / this.resultPage.pageSize));
  }

  get canGoPrevious(): boolean {
    return this.resultPage.page > 1;
  }

  get canGoNext(): boolean {
    return this.resultPage.page < this.totalPages;
  }

  get hasRequiredScope(): boolean {
    return Boolean(this.filterForm.controls.entityKey.value) && isGuid(this.filterForm.controls.aggregateId.value);
  }

  get hasSourceNavigation(): boolean {
    return Boolean(this.sourceName.trim() && this.sourceUrl.trim());
  }

  get backButtonLabel(): string {
    return this.sourceName.trim() ? `Volver a ${this.sourceName.trim()}` : 'Volver';
  }

  onSearch(): void {
    if (!this.validateRequiredScope()) {
      return;
    }

    this.search(1);
  }

  onLoadFilters(): void {
    if (!this.validateRequiredScope()) {
      return;
    }

    this.loadFilterOptions();
  }

  onClear(): void {
    this.filterForm.reset({
      entityKey: '',
      aggregateId: '',
      fromUtc: '',
      toUtc: '',
      operationType: '',
      eventType: '',
      commandType: '',
      pageSize: 50,
      sortDirection: 'desc',
    });

    this.selectedEvent = null;
    this.resultPage = {
      page: 1,
      pageSize: 50,
      totalCount: 0,
      items: [],
    };
    this.filterOptions = {
      operationTypes: [],
      eventTypes: [],
      commandTypes: [],
    };

    this.syncQueryParams(1);
  }

  onBackToSource(): void {
    if (!this.hasSourceNavigation) {
      return;
    }

    void this.router.navigateByUrl(this.sourceUrl);
  }

  onPreviousPage(): void {
    if (!this.canGoPrevious) {
      return;
    }

    this.search(this.resultPage.page - 1);
  }

  onNextPage(): void {
    if (!this.canGoNext) {
      return;
    }

    this.search(this.resultPage.page + 1);
  }

  onPageSizeChange(): void {
    this.search(1);
  }

  onViewDetail(row: TraceabilityEventListItem): void {
    if (!row.id) {
      return;
    }

    this.loadingDetail = true;
    this.traceabilityService
      .getEvent(row.id)
      .pipe(finalize(() => (this.loadingDetail = false)))
      .subscribe({
        next: (detail) => {
          this.selectedEvent = detail;
          if (!detail) {
            this.toastr.error('No fue posible cargar el detalle del evento seleccionado.', '');
          }
        },
        error: (error) => {
          this.selectedEvent = null;
          this.toastr.error(formatApiError(error), '');
        },
      });
  }

  onLoadTimeline(): void {
    if (!this.validateRequiredScope()) {
      return;
    }

    const entityKey = this.filterForm.controls.entityKey.value;
    const aggregateId = this.filterForm.controls.aggregateId.value;

    this.loadingTimeline = true;
    this.traceabilityService
      .getAggregateTimeline(
        entityKey,
        aggregateId,
        toIsoStringOrNull(this.filterForm.controls.fromUtc.value),
        toIsoStringOrNull(this.filterForm.controls.toUtc.value),
      )
      .pipe(finalize(() => (this.loadingTimeline = false)))
      .subscribe({
        next: (items) => {
          const pageSize = this.filterForm.controls.pageSize.value;
          this.selectedEvent = null;
          this.resultPage = {
            page: 1,
            pageSize,
            totalCount: items.length,
            items,
          };
          this.syncQueryParams(1);
        },
        error: (error) => {
          this.toastr.error(formatApiError(error), '');
        },
      });
  }

  formatDate(value: string): string {
    if (!value) {
      return 'Sin dato';
    }

    const parsedDate = new Date(value);
    return Number.isNaN(parsedDate.getTime()) ? value : parsedDate.toLocaleString('es-CL');
  }

  prettyPrintJson(value: string): string {
    if (!value) {
      return '';
    }

    try {
      return JSON.stringify(JSON.parse(value), null, 2);
    } catch {
      return value;
    }
  }

  private applyQueryParams(): void {
    const params = this.route.snapshot.queryParamMap;
    const requestedEntity = params.get('entity') ?? params.get('source') ?? '';

    this.sourceName = params.get('source') ?? '';
    this.sourceUrl = params.get('sourceUrl') ?? '';
    this.initialPage = parsePositiveInt(params.get('page'), 1);

    this.filterForm.patchValue({
      entityKey: requestedEntity,
      aggregateId: params.get('aggregateId') ?? '',
      fromUtc: params.get('from') ?? '',
      toUtc: params.get('to') ?? '',
      operationType: params.get('operationType') ?? '',
      eventType: params.get('eventType') ?? '',
      commandType: params.get('commandType') ?? '',
      pageSize: parsePositiveInt(params.get('pageSize'), 50),
      sortDirection: params.get('sortDirection') ?? 'desc',
    });
  }

  private hasInitialCriteria(): boolean {
    const value = this.filterForm.getRawValue();
    return Boolean(value.entityKey) && isGuid(value.aggregateId);
  }

  private loadEntities(): void {
    this.loadingEntities = true;
    this.traceabilityService
      .getEntities()
      .pipe(finalize(() => (this.loadingEntities = false)))
      .subscribe({
        next: (entities) => {
          this.entities = entities.filter((item) => item.enabled);
          const resolvedEntityKey = this.resolveEntityKey(this.filterForm.controls.entityKey.value);

          if (resolvedEntityKey !== this.filterForm.controls.entityKey.value) {
            this.filterForm.controls.entityKey.setValue(resolvedEntityKey);
          }

          if (this.hasInitialCriteria()) {
            this.loadFilterOptions(() => {
              this.search(this.initialPage, false);
            });
          }
        },
        error: (error) => {
          this.entities = [];
          this.toastr.error(formatApiError(error), '');
        },
      });
  }

  private loadFilterOptions(onLoaded?: () => void): void {
    if (!this.hasRequiredScope) {
      this.filterOptions = {
        operationTypes: [],
        eventTypes: [],
        commandTypes: [],
      };
      onLoaded?.();
      return;
    }

    this.loadingFilters = true;
    this.traceabilityService
      .getFilterOptions({
        entityKey: emptyToNull(this.filterForm.controls.entityKey.value),
        aggregateId: normalizeGuidOrNull(this.filterForm.controls.aggregateId.value),
        fromUtc: toIsoStringOrNull(this.filterForm.controls.fromUtc.value),
        toUtc: toIsoStringOrNull(this.filterForm.controls.toUtc.value),
      })
      .pipe(finalize(() => (this.loadingFilters = false)))
      .subscribe({
        next: (options) => {
          this.filterOptions = options;
          this.reconcileSelectedFilterValue('operationType', options.operationTypes);
          this.reconcileSelectedFilterValue('eventType', options.eventTypes);
          this.reconcileSelectedFilterValue('commandType', options.commandTypes);
          onLoaded?.();
        },
        error: (error) => {
          this.filterOptions = {
            operationTypes: [],
            eventTypes: [],
            commandTypes: [],
          };
          this.toastr.error(formatApiError(error), '');
        },
      });
  }

  private reconcileSelectedFilterValue(
    controlName: 'operationType' | 'eventType' | 'commandType',
    options: string[],
  ): void {
    const control = this.filterForm.controls[controlName];
    const currentValue = control.value;
    if (!currentValue) {
      return;
    }

    if (!options.includes(currentValue)) {
      control.setValue('');
    }
  }

  private search(page: number, syncQueryParams = true): void {
    if (!this.hasRequiredScope) {
      this.resultPage = {
        page: 1,
        pageSize: this.filterForm.controls.pageSize.value,
        totalCount: 0,
        items: [],
      };
      return;
    }

    this.loadingResults = true;
    this.selectedEvent = null;

    const request = this.buildSearchRequest(page);
    this.traceabilityService
      .search(request)
      .pipe(finalize(() => (this.loadingResults = false)))
      .subscribe({
        next: (result) => {
          this.resultPage = result;
          if (syncQueryParams) {
            this.syncQueryParams(page);
          }
        },
        error: (error) => {
          this.resultPage = {
            page,
            pageSize: request.pageSize ?? 50,
            totalCount: 0,
            items: [],
          };
          this.toastr.error(formatApiError(error), '');
        },
      });
  }

  private buildSearchRequest(page: number): TraceabilitySearchRequest {
    const value = this.filterForm.getRawValue();

    return {
      entityKey: emptyToNull(value.entityKey),
      aggregateId: normalizeGuidOrNull(value.aggregateId),
      fromUtc: toIsoStringOrNull(value.fromUtc),
      toUtc: toIsoStringOrNull(value.toUtc),
      operationTypes: value.operationType ? [value.operationType] : [],
      eventTypes: value.eventType ? [value.eventType] : [],
      commandTypes: value.commandType ? [value.commandType] : [],
      page,
      pageSize: value.pageSize,
      sortDirection: value.sortDirection || 'desc',
    };
  }

  private validateRequiredScope(): boolean {
    const entityKey = this.filterForm.controls.entityKey.value;
    const aggregateId = this.filterForm.controls.aggregateId.value;

    if (!entityKey.trim()) {
      this.toastr.error('Debes seleccionar una entidad para consultar la trazabilidad.', '');
      return false;
    }

    if (!aggregateId.trim()) {
      this.toastr.error('Debes ingresar un AggregateId para consultar la trazabilidad.', '');
      return false;
    }

    if (!isGuid(aggregateId)) {
      this.toastr.error('El AggregateId debe ser un GUID valido.', '');
      return false;
    }

    return true;
  }

  private syncQueryParams(page: number): void {
    const value = this.filterForm.getRawValue();

    void this.router.navigate([], {
      relativeTo: this.route,
      replaceUrl: true,
      queryParams: removeEmptyQueryParams({
        entity: value.entityKey,
        aggregateId: value.aggregateId,
        from: value.fromUtc,
        to: value.toUtc,
        operationType: value.operationType,
        eventType: value.eventType,
        commandType: value.commandType,
        page,
        pageSize: value.pageSize,
        sortDirection: value.sortDirection,
        source: this.sourceName || '',
        sourceUrl: this.sourceUrl || '',
      }),
    });
  }

  private resolveEntityKey(value: string): string {
    const trimmedValue = value.trim();
    if (!trimmedValue) {
      return '';
    }

    const normalizedValue = normalizeEntityHint(trimmedValue);
    const match = this.entities.find((entity) =>
      [entity.entityKey, entity.displayName, entity.aggregateType]
        .map((candidate) => normalizeEntityHint(candidate))
        .includes(normalizedValue),
    );

    return match?.entityKey ?? trimmedValue;
  }
}

function removeEmptyQueryParams(params: Record<string, string | number>): Record<string, string | number> {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined),
  );
}

function toIsoStringOrNull(value: string): string | null {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function normalizeGuidOrNull(value: string): string | null {
  return isGuid(value) ? value.trim() : null;
}

function emptyToNull(value: string): string | null {
  const trimmedValue = value.trim();
  return trimmedValue ? trimmedValue : null;
}

function isGuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value.trim());
}

function parsePositiveInt(value: string | null, fallback: number): number {
  if (!value) {
    return fallback;
  }

  const parsedValue = Number.parseInt(value, 10);
  return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : fallback;
}

function normalizeEntityHint(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}
