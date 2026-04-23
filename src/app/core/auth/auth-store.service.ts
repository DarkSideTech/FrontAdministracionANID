import { computed, effect, Injectable, signal } from '@angular/core';

import type { ActiveProcess, AuthSnapshot, CurrentUserPayload, ProfileLoginPayload } from './auth.models';

const STORAGE_KEY = 'aut2-base-web.session';

const EMPTY_STATE: AuthSnapshot = {
  isAuthenticated: false,
  accessTokenExpiration: null,
  user: null,
  sessionKind: null,
  organizations: [],
  organizationalUnits: [],
  activeProcesses: [],
  selectedOrganizationCode: null,
  selectedOrganizationName: null,
  selectedUnitCode: null,
  selectedUnitName: null,
  selectedEntityId: null,
  selectedEntityRole: null,
  organizationSelectionRequired: true,
};

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly state = signal<AuthSnapshot>(this.restoreState());

  readonly snapshot = computed(() => this.state());
  readonly isAuthenticated = computed(() => this.state().isAuthenticated);
  readonly accessTokenExpiration = computed(() => this.state().accessTokenExpiration);
  readonly user = computed(() => this.state().user);
  readonly sessionKind = computed(() => this.state().sessionKind);
  readonly organizations = computed(() => this.state().organizations);
  readonly organizationalUnits = computed(() => this.state().organizationalUnits);
  readonly activeProcesses = computed(() => this.state().activeProcesses);
  readonly allRoles = computed(() => resolveAuthorizationRoles(this.state().user?.roles ?? [], this.state().activeProcesses));
  readonly selectedOrganizationCode = computed(() => this.state().selectedOrganizationCode);
  readonly selectedOrganizationName = computed(() => this.state().selectedOrganizationName);
  readonly selectedUnitCode = computed(() => this.state().selectedUnitCode);
  readonly selectedUnitName = computed(() => this.state().selectedUnitName);
  readonly selectedEntityId = computed(() => this.state().selectedEntityId);
  readonly selectedEntityRole = computed(() => this.state().selectedEntityRole);
  readonly organizationSelectionRequired = computed(() => this.state().organizationSelectionRequired);
  readonly hasSession = computed(() => this.state().isAuthenticated);
  readonly hasOrganizationSession = computed(
    () =>
      this.state().isAuthenticated &&
      !this.state().organizationSelectionRequired &&
      Boolean(this.state().selectedOrganizationCode),
  );

  constructor() {
    effect(() => {
      const snapshot = this.state();
      if (!snapshot.isAuthenticated) {
        sessionStorage.removeItem(STORAGE_KEY);
        return;
      }

      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    });
  }

  applyProfile(payload: ProfileLoginPayload): void {
    const activeProcesses = payload.ProcesosActivos ?? [];
    const selectedOrganizationCode = payload.CodigoOrganizacionSeleccionada ?? null;
    const selectedEntityRole = payload.EntidadRolSeleccionado ?? null;
    const organizationSelectionRequired = deriveOrganizationSelectionRequired(
      payload.SeleccionOrganizacionRequerida,
      selectedOrganizationCode,
    );

    this.state.set({
      isAuthenticated: true,
      accessTokenExpiration: payload.AccessTokenExpiracion ?? null,
      user: payload.User
        ? {
            ...payload.User,
            roles: resolveAuthorizationRoles(payload.User.roles ?? [], activeProcesses),
          }
        : null,
      sessionKind: organizationSelectionRequired ? 'LOGIN' : 'LOGIN_ORGANIZATION',
      organizations: payload.OrganizacionesPorUsuario ?? [],
      organizationalUnits: payload.UnidadesOrganizacionalesPorUsuario ?? [],
      activeProcesses,
      selectedOrganizationCode,
      selectedOrganizationName: payload.NombreOrganizacionSeleccionada ?? null,
      selectedUnitCode: payload.CodigoUnidadOrganizacionalSeleccionada ?? null,
      selectedUnitName: payload.NombreUnidadOrganizacionalSeleccionada ?? null,
      selectedEntityId: payload.IdEntidadSeleccionada ?? null,
      selectedEntityRole,
      organizationSelectionRequired,
    });
  }

  applyCurrentUser(payload: CurrentUserPayload): void {
    if (!payload.IsAuthenticated) {
      this.clear();
      return;
    }

    const selectedOrganizationCode = payload.OrganizacionSeleccionada ?? null;
    const activeProcesses = payload.ProcesosActivos ?? [];
    const selectedEntityRole = payload.EntidadRolSeleccionado ?? null;
    const organizationSelectionRequired = deriveOrganizationSelectionRequired(
      payload.SeleccionOrganizacionRequerida ?? payload.SeleccionOrganizacionrequerida ?? null,
      selectedOrganizationCode,
    );
    const currentUser = payload.User ?? null;
    const previousUser = this.state().user;

    this.state.set({
      isAuthenticated: true,
      accessTokenExpiration: payload.ExpiresAtUtc ?? null,
      user: currentUser
        ? {
            ...previousUser,
            ...currentUser,
            roles: resolveAuthorizationRoles(currentUser.roles ?? previousUser?.roles ?? [], activeProcesses),
            unidadesOrganizacionales: currentUser.unidadesOrganizacionales ?? previousUser?.unidadesOrganizacionales ?? [],
          }
        : {
            ...previousUser,
            id: payload.UserId ?? null,
            email: payload.Email ?? previousUser?.email ?? null,
            nombreADesplegar: payload.NombreADesplegar ?? previousUser?.nombreADesplegar ?? null,
            roles: resolveAuthorizationRoles(previousUser?.roles ?? [], activeProcesses),
            unidadesOrganizacionales: previousUser?.unidadesOrganizacionales ?? [],
          },
      sessionKind: organizationSelectionRequired ? 'LOGIN' : 'LOGIN_ORGANIZATION',
      organizations: payload.OrganizacionesPorUsuario ?? [],
      organizationalUnits: payload.UnidadesOrganizacionalesPorUsuario ?? [],
      activeProcesses,
      selectedOrganizationCode,
      selectedOrganizationName: payload.NombreOrganizacionSeleccionada ?? null,
      selectedUnitCode: payload.CodigoUnidadOrganizacionalSeleccionada ?? null,
      selectedUnitName: payload.NombreUnidadOrganizacionalSeleccionada ?? null,
      selectedEntityId: payload.EntidadIdSeleccionada ?? null,
      selectedEntityRole,
      organizationSelectionRequired,
    });
  }

  clear(): void {
    this.state.set(EMPTY_STATE);
  }

  getRolesForProcess(processCode: string): string[] {
    const normalizedProcessCode = normalizeKey(processCode);
    const process = this.state().activeProcesses.find(
      (item) => normalizeKey(item.Codigo) === normalizedProcessCode,
    );
    return process?.Roles?.filter((role): role is string => Boolean(role)) ?? [];
  }

  getAllRoles(): string[] {
    return this.allRoles();
  }

  hasRole(role: string): boolean {
    return this.allRoles().includes(normalizeRole(role));
  }

  findActiveProcess(processCode: string): ActiveProcess | null {
    const normalizedProcessCode = normalizeKey(processCode);
    return (
      this.state().activeProcesses.find(
        (item) => normalizeKey(item.Codigo) === normalizedProcessCode,
      ) ?? null
    );
  }

  private restoreState(): AuthSnapshot {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return EMPTY_STATE;
    }

    try {
      const parsed = JSON.parse(raw) as Partial<AuthSnapshot>;
      const selectedOrganizationCode = parsed.selectedOrganizationCode ?? null;

      return {
        isAuthenticated: parsed.isAuthenticated ?? false,
        accessTokenExpiration: parsed.accessTokenExpiration ?? null,
        user: parsed.user ?? null,
        sessionKind:
          (parsed.sessionKind as AuthSnapshot['sessionKind']) ??
          (deriveOrganizationSelectionRequired(
            parsed.organizationSelectionRequired ?? null,
            selectedOrganizationCode,
          )
            ? 'LOGIN'
            : 'LOGIN_ORGANIZATION'),
        organizations: parsed.organizations ?? [],
        organizationalUnits: parsed.organizationalUnits ?? [],
        activeProcesses: parsed.activeProcesses ?? [],
        selectedOrganizationCode,
        selectedOrganizationName: parsed.selectedOrganizationName ?? null,
        selectedUnitCode: parsed.selectedUnitCode ?? null,
        selectedUnitName: parsed.selectedUnitName ?? null,
        selectedEntityId: parsed.selectedEntityId ?? null,
        selectedEntityRole: (parsed.selectedEntityRole as AuthSnapshot['selectedEntityRole']) ?? null,
        organizationSelectionRequired: deriveOrganizationSelectionRequired(
          parsed.organizationSelectionRequired ?? null,
          selectedOrganizationCode,
        ),
      };
    } catch {
      sessionStorage.removeItem(STORAGE_KEY);
      return EMPTY_STATE;
    }
  }
}

function resolveAuthorizationRoles(seedRoles: string[], activeProcesses: ActiveProcess[]): string[] {
  const explicitRoles = normalizeRoleList(seedRoles);
  if (explicitRoles.length > 0) {
    return explicitRoles;
  }

  return collectProcessRoles(activeProcesses);
}

function collectProcessRoles(activeProcesses: ActiveProcess[]): string[] {
  const roles = new Set<string>();

  for (const process of activeProcesses) {
    for (const role of process.Roles ?? []) {
      const normalizedRole = normalizeRole(role);
      if (normalizedRole) {
        roles.add(normalizedRole);
      }
    }
  }

  return Array.from(roles);
}

function normalizeRoleList(roles: string[]): string[] {
  const result = new Set<string>();

  for (const role of roles) {
    const normalizedRole = normalizeRole(role);
    if (normalizedRole) {
      result.add(normalizedRole);
    }
  }

  return Array.from(result);
}

function normalizeRole(role: string | null | undefined): string {
  return (role ?? '').trim().toUpperCase();
}

function normalizeKey(value: string | null | undefined): string {
  return (value ?? '').trim().toUpperCase();
}

function deriveOrganizationSelectionRequired(
  requestedValue: boolean | null | undefined,
  selectedOrganizationCode: string | null | undefined,
): boolean {
  if (requestedValue === true) {
    return true;
  }

  return !((selectedOrganizationCode ?? '').trim());
}
