import { UserRole } from '../constants/roles.constants';

export interface RouteConfig {
  path: string;
  allowedRoles: UserRole[];
  label: string;
  icon?: string;
  children?: RouteConfig[];
  isSection?: boolean;
}
