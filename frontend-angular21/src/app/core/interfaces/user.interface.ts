import { UserRole } from '../constants/roles.constants';

export interface User {
  userId: number;
  username: string;
  roleId: UserRole;
  email?: string;
}
