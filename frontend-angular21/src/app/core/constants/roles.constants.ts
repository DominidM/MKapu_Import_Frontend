export enum UserRole {
  ADMIN = 1,
  ALMACEN = 2,
  VENTAS = 3,

}

export const ROLE_NAMES = {
  [UserRole.ADMIN]: 'ADMIN',
  [UserRole.ALMACEN]: 'ALMACEN',
  [UserRole.VENTAS]: 'VENTAS'

};

export const ROLE_NAME_TO_ID: Record<string, UserRole> = {
  'administrador': UserRole.ADMIN,
  'almacen': UserRole.ALMACEN,
  'ventas': UserRole.VENTAS
};