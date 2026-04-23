export interface TraceabilityEntityCatalogItem {
  entityKey: string;
  displayName: string;
  aggregateType: string;
  enabled: boolean;
}

export interface TraceabilityFilterValuesRequest {
  entityKey?: string | null;
  aggregateId?: string | null;
  fromUtc?: string | null;
  toUtc?: string | null;
}

export interface TraceabilitySearchRequest extends TraceabilityFilterValuesRequest {
  operationTypes?: string[];
  eventTypes?: string[];
  commandTypes?: string[];
  correlationId?: string | null;
  actorUserId?: string | null;
  page?: number;
  pageSize?: number;
  sortDirection?: string | null;
}

export interface TraceabilityFilterOptions {
  operationTypes: string[];
  eventTypes: string[];
  commandTypes: string[];
}

export interface TraceabilityEventListItem {
  id: string;
  aggregateId: string;
  aggregateType: string;
  aggregateRevision: number;
  eventType: string;
  commandType: string;
  operationType: string;
  occurredAtUtc: string;
  persistedAtUtc: string;
  actorUsername: string;
  actorEmail: string;
  requestPath: string;
  changeCount: number;
}

export interface TraceabilityActor {
  userId: string;
  username: string;
  email: string;
}

export interface TraceabilityChangeItem {
  order: number;
  path: string;
  valueType: string;
  newValueJson: string;
}

export interface TraceabilityEventDetail {
  id: string;
  correlationId: string;
  aggregateId: string;
  aggregateType: string;
  aggregateRevision: number;
  eventType: string;
  commandType: string;
  operationType: string;
  occurredAtUtc: string;
  persistedAtUtc: string;
  requestPath: string;
  snapshotJson: string;
  actor: TraceabilityActor;
  changes: TraceabilityChangeItem[];
}

export interface PagedResult<T> {
  page: number;
  pageSize: number;
  totalCount: number;
  items: T[];
}
