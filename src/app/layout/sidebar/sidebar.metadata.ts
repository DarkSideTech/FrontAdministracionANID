// Sidebar route metadata
export type MenuNavigationMode = 'internal' | 'iframe' | 'window' | 'redirect' | 'none';

export interface RouteInfo {
  path: string;
  title: string;
  iconType: string;
  icon: string;
  customSvg?: string;
  class: string;
  groupTitle: boolean;
  badge: string;
  badgeClass: string;
  submenu: RouteInfo[];
  active?: boolean;
  collapsed?: boolean;
  tooltip?: string;
  href?: string;
  target?: '_blank' | '_self';
  rel?: string;
  processCode?: string;
  navigationMode?: MenuNavigationMode;
}
