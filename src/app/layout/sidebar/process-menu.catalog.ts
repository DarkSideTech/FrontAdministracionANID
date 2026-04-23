import { RouteInfo } from './sidebar.metadata';
import { ROUTES } from './sidebar-items';

export interface ProcessMenuGroupDefinition {
  macroCode: string;
  legacyTitle: string;
  childPrefixes: string[];
}

export const ADMINISTRATION_TITLE = 'Administración';

export const PROCESS_MENU_GROUPS: ProcessMenuGroupDefinition[] = [
  {
    macroCode: 'POSTULACION',
    legacyTitle: 'Postulación',
    childPrefixes: ['POS_'],
  },
  {
    macroCode: 'SELECCION_FORMALIZACION',
    legacyTitle: 'Selección Formalización',
    childPrefixes: ['SFO_'],
  },
  {
    macroCode: 'SEGUIMIENTO_FINANCIERO',
    legacyTitle: 'Seguimiento Financiero',
    childPrefixes: ['SFI_'],
  },
  {
    macroCode: 'SEGUIMIENTO_TECNICO',
    legacyTitle: 'Seguimiento Técnico',
    childPrefixes: ['STE_'],
  },
  {
    macroCode: 'VIN_SCIELO',
    legacyTitle: 'Productividad Científica',
    childPrefixes: ['VIN_'],
  },
  {
    macroCode: 'EXPEDIENTE',
    legacyTitle: 'Expediente',
    childPrefixes: ['EXP_'],
  },
];

export function normalizeProcessCode(value: string | null | undefined): string {
  return (value ?? '').trim().toUpperCase();
}

export function getLegacySidebarRoot(title: string): RouteInfo | undefined {
  return ROUTES.find((item) => item.title === title);
}

export function getProcessGroupDefinitionByMacroCode(
  macroCode: string | null | undefined,
): ProcessMenuGroupDefinition | undefined {
  const normalizedMacroCode = normalizeProcessCode(macroCode);
  return PROCESS_MENU_GROUPS.find((item) => item.macroCode === normalizedMacroCode);
}

export function getProcessGroupDefinitionBySystemCode(
  systemCode: string | null | undefined,
): ProcessMenuGroupDefinition | undefined {
  const normalizedSystemCode = normalizeProcessCode(systemCode);
  return PROCESS_MENU_GROUPS.find((item) =>
    item.childPrefixes.some((prefix) => normalizedSystemCode.startsWith(prefix)),
  );
}

export function getProcessGroupOrder(macroCode: string): number {
  const index = PROCESS_MENU_GROUPS.findIndex(
    (item) => item.macroCode === normalizeProcessCode(macroCode),
  );

  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
}
