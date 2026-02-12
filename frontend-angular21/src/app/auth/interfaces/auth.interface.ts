export interface AuthInterface {
    username: string;
    password: string;
}

export interface AuthInterfaceResponse {
  access_token: string;
  account: AuthAccountBackend;
}

export interface AuthUserBackend {
    id: number;
    nombre_usuario: string;
    email: string;
    rol_nombre: string;
}

export interface AuthAccountBackend {
  id_cuenta: number;
  username: string;
  email_emp: string;
  activo: boolean;
  id_sede: number;
  sede_nombre: string;

  usuario: {
    id_usuario: number;
    nombres: string;
    ape_pat: string;
    ape_mat: string;
    dni: string;
    email: string;
  };

  roles: {
    id_rol: number;
    nombre: string;
  }[];

  permisos: {
    id_permiso: number;
    nombre: string;
  }[];
}