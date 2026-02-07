export interface AuthInterface {
    username: string;
    password: string;
}

export interface AuthInterfaceResponse {
    token: string;
    user: AuthUserBackend;
}

export interface AuthUserBackend {
    id: number;
    nombre_usuario: string;
    email: string;
    rol_nombre: string;
}