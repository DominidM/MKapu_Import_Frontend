export interface Categoria {
  id_categoria: number;
  nombre: string;
<<<<<<< HEAD
  descripcion?: string;
=======
  descripcion: string;
>>>>>>> 41e708d8501d2a3c6685bc3a5a1cd999923d2339
  activo: boolean;
}

export interface CategoriaResponse {
  categories: Categoria[];
  total: number;
}