export interface GovClSvgIcon {
  viewBox: string;
  paths: string[];
}

// Registro centralizado de iconos de accion.
// Hoy usa SVG inline para no depender de un font externo no presente en el repo.
// Cuando la fuente gob-cl este disponible, el reemplazo debe concentrarse aqui.
export const GOV_CL_ICON_REGISTRY = {
  search: {
    viewBox: '0 0 24 24',
    paths: [
      'M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3C5.91 3 3 5.91 3 9.5C3 13.09 5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5C5 7.01 7.01 5 9.5 5C11.99 5 14 7.01 14 9.5C14 11.99 11.99 14 9.5 14Z',
    ],
  },
  create: {
    viewBox: '0 0 24 24',
    paths: [
      'M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z',
    ],
  },
  refresh: {
    viewBox: '0 0 24 24',
    paths: [
      'M17.65 6.35C16.2 4.9 14.21 4 12 4V1L7 6L12 11V7C13.66 7 15.14 7.69 16.22 8.78C18.46 11.02 18.46 14.64 16.22 16.88C13.98 19.12 10.36 19.12 8.12 16.88C7.04 15.8 6.35 14.32 6.35 12.66H4C4 14.87 4.9 16.86 6.35 18.31C9.57 21.53 14.79 21.53 18 18.31C21.21 15.1 21.21 9.58 17.65 6.35Z',
    ],
  },
  edit: {
    viewBox: '0 0 24 24',
    paths: [
      'M3 17.25V21H6.75L17.81 9.94L14.06 6.19L3 17.25ZM5.92 19H5V18.08L14.06 9.02L14.98 9.94L5.92 19ZM20.71 5.63L18.37 3.29C18.17 3.09 17.92 3 17.66 3C17.4 3 17.15 3.1 16.96 3.29L15.13 5.12L18.88 8.87L20.71 7.04C21.1 6.65 21.1 6.02 20.71 5.63Z',
    ],
  },
  delete: {
    viewBox: '0 0 24 24',
    paths: [
      'M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM8 9H16V19H8V9ZM15.5 4L14.5 3H9.5L8.5 4H5V6H19V4H15.5Z',
    ],
  },
  activate: {
    viewBox: '0 0 24 24',
    paths: [
      'M12 2C6.49 2 2 6.49 2 12S6.49 22 12 22S22 17.51 22 12S17.51 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z',
    ],
  },
  deactivate: {
    viewBox: '0 0 24 24',
    paths: [
      'M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22S22 17.52 22 12S17.52 2 12 2ZM7 11H17V13H7V11Z',
    ],
  },
  expandMore: {
    viewBox: '0 0 24 24',
    paths: [
      'M7.41 8.295L12 12.875L16.59 8.295L18 9.705L12 15.705L6 9.705L7.41 8.295Z',
    ],
  },
  expandLess: {
    viewBox: '0 0 24 24',
    paths: [
      'M7.41 15.705L12 11.125L16.59 15.705L18 14.295L12 8.295L6 14.295L7.41 15.705Z',
    ],
  },
  clear: {
    viewBox: '0 0 24 24',
    paths: [
      'M18.3 5.71L12 12L5.71 5.71L4.3 7.12L10.59 13.41L4.3 19.7L5.71 21.11L12 14.82L18.3 21.11L19.71 19.7L13.42 13.41L19.71 7.12L18.3 5.71Z',
    ],
  },
  traceability: {
    viewBox: '0 0 24 24',
    paths: [
      'M14 7L12.59 8.41L15.17 11H4V13H15.17L12.59 15.59L14 17L19 12L14 7Z',
      'M19 19H5V5H19V9H21V5C21 3.9 20.1 3 19 3H5C3.89 3 3 3.9 3 5V19C3 20.1 3.89 21 5 21H19C20.1 21 21 20.1 21 19V15H19V19Z',
    ],
  },
} as const satisfies Record<string, GovClSvgIcon>;
