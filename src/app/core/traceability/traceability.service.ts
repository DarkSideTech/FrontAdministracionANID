import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { TraceabilityApi } from '@core/service/controllers/traceability.api';
import {
  PagedResult,
  TraceabilityActor,
  TraceabilityChangeItem,
  TraceabilityEntityCatalogItem,
  TraceabilityEventDetail,
  TraceabilityEventListItem,
  TraceabilityFilterOptions,
  TraceabilityFilterValuesRequest,
  TraceabilitySearchRequest,
} from './traceability.models';

@Injectable({ providedIn: 'root' })
export class TraceabilityService {
  private readonly api = inject(TraceabilityApi);

  getEntities(): Observable<TraceabilityEntityCatalogItem[]> {
    return this.api.getEntities().pipe(
      map((response) => normalizeEntities(response)),
    );
  }

  getFilterOptions(request: TraceabilityFilterValuesRequest): Observable<TraceabilityFilterOptions> {
    return this.api.getFilterOptions({ body: request }).pipe(
      map((response) => normalizeFilterOptions(response)),
    );
  }

  search(request: TraceabilitySearchRequest): Observable<PagedResult<TraceabilityEventListItem>> {
    return this.api.search({ body: request }).pipe(
      map((response) => normalizePagedResult(response)),
    );
  }

  getAggregateTimeline(
    entityKey: string | null | undefined,
    aggregateId: string,
    fromUtc?: string | null,
    toUtc?: string | null,
  ): Observable<TraceabilityEventListItem[]> {
    return this.api.getAggregateTimeline({ aggregateId, entityKey, fromUtc, toUtc }).pipe(
      map((response) => normalizeEvents(response)),
    );
  }

  getEvent(id: string): Observable<TraceabilityEventDetail | null> {
    return this.api.getEvent({ id }).pipe(
      map((response) => normalizeEventDetail(response)),
    );
  }
}

function normalizeEntities(value: unknown): TraceabilityEntityCatalogItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => {
    const parsed = toRecord(item);
    return {
      entityKey: normalizeString(pick(parsed, 'EntityKey', 'entityKey')),
      displayName: normalizeString(pick(parsed, 'DisplayName', 'displayName')),
      aggregateType: normalizeString(pick(parsed, 'AggregateType', 'aggregateType')),
      enabled: normalizeBoolean(pick(parsed, 'Enabled', 'enabled'), true),
    };
  });
}

function normalizeFilterOptions(value: unknown): TraceabilityFilterOptions {
  const parsed = toRecord(value);

  return {
    operationTypes: normalizeStringArray(pick(parsed, 'OperationTypes', 'operationTypes')),
    eventTypes: normalizeStringArray(pick(parsed, 'EventTypes', 'eventTypes')),
    commandTypes: normalizeStringArray(pick(parsed, 'CommandTypes', 'commandTypes')),
  };
}

function normalizePagedResult(value: unknown): PagedResult<TraceabilityEventListItem> {
  const parsed = toRecord(value);

  return {
    page: normalizeNumber(pick(parsed, 'Page', 'page'), 1),
    pageSize: normalizeNumber(pick(parsed, 'PageSize', 'pageSize'), 50),
    totalCount: normalizeNumber(pick(parsed, 'TotalCount', 'totalCount'), 0),
    items: normalizeEvents(pick(parsed, 'Items', 'items')),
  };
}

function normalizeEvents(value: unknown): TraceabilityEventListItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => {
    const parsed = toRecord(item);
    return {
      id: normalizeString(pick(parsed, 'Id', 'id')),
      aggregateId: normalizeString(pick(parsed, 'AggregateId', 'aggregateId')),
      aggregateType: normalizeString(pick(parsed, 'AggregateType', 'aggregateType')),
      aggregateRevision: normalizeNumber(pick(parsed, 'AggregateRevision', 'aggregateRevision'), 0),
      eventType: normalizeString(pick(parsed, 'EventType', 'eventType')),
      commandType: normalizeString(pick(parsed, 'CommandType', 'commandType')),
      operationType: normalizeString(pick(parsed, 'OperationType', 'operationType')),
      occurredAtUtc: normalizeString(pick(parsed, 'OccurredAtUtc', 'occurredAtUtc')),
      persistedAtUtc: normalizeString(pick(parsed, 'PersistedAtUtc', 'persistedAtUtc')),
      actorUsername: normalizeString(pick(parsed, 'ActorUsername', 'actorUsername')),
      actorEmail: normalizeString(pick(parsed, 'ActorEmail', 'actorEmail')),
      requestPath: normalizeString(pick(parsed, 'RequestPath', 'requestPath')),
      changeCount: normalizeNumber(pick(parsed, 'ChangeCount', 'changeCount'), 0),
    };
  });
}

function normalizeEventDetail(value: unknown): TraceabilityEventDetail | null {
  const parsed = toRecord(value);
  if (!Object.keys(parsed).length) {
    return null;
  }

  return {
    id: normalizeString(pick(parsed, 'Id', 'id')),
    correlationId: normalizeString(pick(parsed, 'CorrelationId', 'correlationId')),
    aggregateId: normalizeString(pick(parsed, 'AggregateId', 'aggregateId')),
    aggregateType: normalizeString(pick(parsed, 'AggregateType', 'aggregateType')),
    aggregateRevision: normalizeNumber(pick(parsed, 'AggregateRevision', 'aggregateRevision'), 0),
    eventType: normalizeString(pick(parsed, 'EventType', 'eventType')),
    commandType: normalizeString(pick(parsed, 'CommandType', 'commandType')),
    operationType: normalizeString(pick(parsed, 'OperationType', 'operationType')),
    occurredAtUtc: normalizeString(pick(parsed, 'OccurredAtUtc', 'occurredAtUtc')),
    persistedAtUtc: normalizeString(pick(parsed, 'PersistedAtUtc', 'persistedAtUtc')),
    requestPath: normalizeString(pick(parsed, 'RequestPath', 'requestPath')),
    snapshotJson: normalizeString(pick(parsed, 'SnapshotJson', 'snapshotJson')),
    actor: normalizeActor(pick(parsed, 'Actor', 'actor')),
    changes: normalizeChanges(pick(parsed, 'Changes', 'changes')),
  };
}

function normalizeActor(value: unknown): TraceabilityActor {
  const parsed = toRecord(value);
  return {
    userId: normalizeString(pick(parsed, 'UserId', 'userId')),
    username: normalizeString(pick(parsed, 'Username', 'username')),
    email: normalizeString(pick(parsed, 'Email', 'email')),
  };
}

function normalizeChanges(value: unknown): TraceabilityChangeItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => {
    const parsed = toRecord(item);
    return {
      order: normalizeNumber(pick(parsed, 'Order', 'order'), 0),
      path: normalizeString(pick(parsed, 'Path', 'path')),
      valueType: normalizeString(pick(parsed, 'ValueType', 'valueType')),
      newValueJson: normalizeString(pick(parsed, 'NewValueJson', 'newValueJson')),
    };
  });
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => normalizeString(item))
    .filter((item): item is string => Boolean(item));
}

function pick(source: Record<string, unknown>, ...keys: string[]): unknown {
  for (const key of keys) {
    if (source[key] !== undefined) {
      return source[key];
    }
  }

  return undefined;
}

function toRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function normalizeString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function normalizeBoolean(value: unknown, fallback = false): boolean {
  return typeof value === 'boolean' ? value : fallback;
}
