export enum UserRole {
  ADMIN = 1,
  VENTAS = 2,
  ALMACEN = 3
}

export const ROLE_NAMES = {
  [UserRole.ADMIN]: 'ADMIN',
  [UserRole.VENTAS]: 'VENTAS',
  [UserRole.ALMACEN]: 'ALMACEN'
};

export const ROLE_NAME_TO_ID: Record<string, UserRole> = {
  'administrador': UserRole.ADMIN,
  'ventas': UserRole.VENTAS,
  'almacen': UserRole.ALMACEN,
};