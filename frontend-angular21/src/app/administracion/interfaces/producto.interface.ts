export interface ProductoInterface {
  id_producto: number;
  id_categoria: number;
  categoriaNombre: string;
  codigo: string;
  anexo: string;
  descripcion: string;
  pre_compra: number;
  pre_venta: number;
  pre_unit: number;
  pre_may: number;
  pre_caja: number;
  uni_med: string;
  estado: boolean;
  fec_creacion: string;   // viene como string (YYYY-MM-DD)
  fec_actual: string;     // igual
  profitMargin: number;
}

export interface ProductoMeta {
  totalItems: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
}

export interface ProductoResponse {
  products: ProductoInterface[];
  total: number;
  meta: ProductoMeta;
}
