export interface UsuarioInterface {

}

export interface UsuarioInterfaceResponse {
    id_usuario: number,
    usu_nom: string,
    ape_mat: string,
    ape_pat: string,
    nombreCompleto: string,
    dni: number,
    email: string,
    celular: number,
    direccion: string,
    genero: string,
    fec_nac: string,
    activo: boolean,
    id_sede: number,
    sedeNombre: string
}

export interface UsuarioResponse {
  users: UsuarioInterfaceResponse[];
  total: number;
}