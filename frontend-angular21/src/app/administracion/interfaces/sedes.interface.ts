export interface SedeInterface {
  id_sede: number;
  codigo: string;
  nombre: string;
  ciudad: string;
  departamento: string;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SedeResponse {
  headquarters: SedeInterface[];
  total: number;
}