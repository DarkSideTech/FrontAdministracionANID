import { inject, Injectable } from '@angular/core';

import { ActiveProcess } from '@core/auth/auth.models';
import { AuthStore } from '@core/auth/auth-store.service';
import { ProcessNavigationService } from '@core/processes/process-navigation.service';
import {
  ADMINISTRATION_TITLE,
  getLegacySidebarRoot,
  getProcessGroupDefinitionByMacroCode,
  getProcessGroupDefinitionBySystemCode,
  getProcessGroupOrder,
  normalizeProcessCode,
  ProcessMenuGroupDefinition,
} from './process-menu.catalog';
import { RouteInfo } from './sidebar.metadata';

interface ProcessBucket {
  bucketKey: string;
  macroCode: string;
  definition?: ProcessMenuGroupDefinition;
  macroProcess?: ActiveProcess;
  systems: ActiveProcess[];
}

@Injectable({ providedIn: 'root' })
export class SidebarMenuService {
  private readonly authStore = inject(AuthStore);
  private readonly processNavigationService = inject(ProcessNavigationService);

  getMenuItems(): RouteInfo[] {
    return [
      ...this.buildAdministrationMenu(),
      ...this.buildProcessMenuItems(this.authStore.activeProcesses()),
    ];
  }

  private buildAdministrationMenu(): RouteInfo[] {
    const administration = getLegacySidebarRoot(ADMINISTRATION_TITLE);
    return administration ? [this.cloneStaticRoute(administration)] : [];
  }

  private buildProcessMenuItems(activeProcesses: ActiveProcess[]): RouteInfo[] {
    const buckets = this.buildBuckets(activeProcesses);

    return Array.from(buckets.values())
      .filter((bucket) => bucket.macroCode !== 'ADMINISTRACION')
      .sort((left, right) => this.compareBuckets(left, right))
      .map((bucket) => this.toMacroRoute(bucket));
  }

  private buildBuckets(activeProcesses: ActiveProcess[]): Map<string, ProcessBucket> {
    const buckets = new Map<string, ProcessBucket>();

    const macroProcesses = activeProcesses.filter(
      (process) => this.normalizeLevel(process.NivelDeProceso) === 'NIVEL_MACRO',
    );
    const systemProcesses = activeProcesses.filter(
      (process) => this.normalizeLevel(process.NivelDeProceso) === 'NIVEL_SISTEMA',
    );

    for (const macroProcess of macroProcesses) {
      const macroCode = normalizeProcessCode(macroProcess.Codigo);
      if (!macroCode) {
        continue;
      }

      const bucketKey = this.resolveBucketKey(macroProcess, macroCode);
      const bucket = this.getOrCreateBucket(buckets, bucketKey, macroCode);
      bucket.macroCode = macroCode;
      bucket.definition = getProcessGroupDefinitionByMacroCode(macroCode);
      bucket.macroProcess = macroProcess;
    }

    for (const systemProcess of systemProcesses) {
      const processCode = normalizeProcessCode(systemProcess.Codigo);
      if (!processCode) {
        continue;
      }

      const fallbackMacroCode = this.resolveLegacyMacroCode(processCode);
      const bucketKey = this.resolveParentBucketKey(systemProcess, fallbackMacroCode);
      if (!bucketKey) {
        continue;
      }

      const bucket = this.getOrCreateBucket(buckets, bucketKey, fallbackMacroCode);
      if (!bucket.macroCode && fallbackMacroCode) {
        bucket.macroCode = fallbackMacroCode;
        bucket.definition = getProcessGroupDefinitionByMacroCode(fallbackMacroCode);
      }

      bucket.systems.push(systemProcess);
    }

    return buckets;
  }

  private getOrCreateBucket(
    buckets: Map<string, ProcessBucket>,
    bucketKey: string,
    macroCode: string,
  ): ProcessBucket {
    const existingBucket = buckets.get(bucketKey);
    if (existingBucket) {
      return existingBucket;
    }

    const nextBucket: ProcessBucket = {
      bucketKey,
      macroCode,
      definition: getProcessGroupDefinitionByMacroCode(macroCode),
      systems: [],
    };

    buckets.set(bucketKey, nextBucket);
    return nextBucket;
  }

  private toMacroRoute(bucket: ProcessBucket): RouteInfo {
    const legacyRoot = bucket.definition
      ? getLegacySidebarRoot(bucket.definition.legacyTitle)
      : undefined;
    const title = (bucket.macroProcess?.Codigo ?? bucket.macroCode).trim();
    const tooltip = (bucket.macroProcess?.NombreProceso ?? title).trim();

    return {
      path: '',
      title,
      tooltip,
      iconType: legacyRoot?.iconType ?? 'feather',
      icon: legacyRoot?.icon ?? '',
      customSvg: legacyRoot?.customSvg,
      class: legacyRoot?.class ?? 'menu-toggle',
      groupTitle: false,
      badge: '',
      badgeClass: '',
      submenu: bucket.systems.map((process) => this.toSystemRoute(process)),
      active: false,
      collapsed: false,
      navigationMode: 'none',
      processCode: bucket.macroCode,
    };
  }

  private toSystemRoute(process: ActiveProcess): RouteInfo {
    const target = this.processNavigationService.buildMenuTarget(process);
    const title = (process.Codigo ?? '').trim() || 'Proceso';
    const tooltip = (process.NombreProceso ?? title).trim();

    return {
      path: target.path,
      title,
      tooltip,
      iconType: '',
      icon: '',
      class: 'ml-menu',
      groupTitle: false,
      badge: '',
      badgeClass: '',
      submenu: [],
      active: false,
      collapsed: false,
      href: target.href,
      target: target.target,
      rel: target.rel,
      navigationMode: target.navigationMode,
      processCode: normalizeProcessCode(process.Codigo),
    };
  }

  private cloneStaticRoute(item: RouteInfo): RouteInfo {
    const hasInternalPath = Boolean(item.path?.trim()) && item.submenu.length === 0;

    return {
      ...item,
      active: false,
      collapsed: false,
      tooltip: item.tooltip ?? item.title,
      navigationMode: hasInternalPath ? 'internal' : 'none',
      submenu: item.submenu.map((child) => this.cloneStaticRoute(child)),
    };
  }

  private compareBuckets(left: ProcessBucket, right: ProcessBucket): number {
    const byCatalogOrder = getProcessGroupOrder(left.macroCode) - getProcessGroupOrder(right.macroCode);
    if (byCatalogOrder !== 0) {
      return byCatalogOrder;
    }

    return left.macroCode.localeCompare(right.macroCode);
  }

  private resolveLegacyMacroCode(processCode: string): string {
    const definition = getProcessGroupDefinitionBySystemCode(processCode);
    if (definition) {
      return definition.macroCode;
    }

    const separatorIndex = processCode.indexOf('_');
    return separatorIndex > 0 ? processCode.slice(0, separatorIndex) : processCode;
  }

  private normalizeLevel(level: string | null | undefined): string {
    return (level ?? '').trim().toUpperCase();
  }

  private resolveBucketKey(process: ActiveProcess, fallbackCode: string): string {
    return this.normalizeIdentifier(process.IdProceso) || this.normalizeIdentifier(process.IdMacroProceso) || fallbackCode;
  }

  private resolveParentBucketKey(process: ActiveProcess, fallbackCode: string): string {
    return this.normalizeIdentifier(process.IdMacroProceso) || fallbackCode;
  }

  private normalizeIdentifier(value: string | null | undefined): string {
    return (value ?? '').trim().toUpperCase();
  }
}
