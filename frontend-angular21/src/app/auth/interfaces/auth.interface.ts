export interface AuthInterface {
    username: string;
    password: string;
}

export interface AuthInterfaceResponse {
    token: string;
    user: User;
}

export interface User {
    id: string;
    nombre_usuario: string;
    email: string;
    rol_nombre: string;
}
