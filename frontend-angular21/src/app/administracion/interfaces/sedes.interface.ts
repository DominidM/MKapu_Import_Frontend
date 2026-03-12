export interface Headquarter {
  id_sede: number;
  codigo: string;
  nombre: string;
  ciudad: string;
  departamento: string;
  direccion: string;
  telefono: string;
  activo: boolean;
<<<<<<< HEAD
  almacenes?: AlmacenBasico[] | null;
=======
>>>>>>> 41e708d8501d2a3c6685bc3a5a1cd999923d2339
}

export interface HeadquarterResponse {
  headquarters: Headquarter[];
<<<<<<< HEAD
  total: number;
}

export interface AlmacenBasico {
  id_almacen: number;
  codigo: string;
  nombre?: string | null;
  departamento?: string | null;
  provincia?: string | null;
  ciudad?: string | null;
  direccion?: string | null;
  telefono?: string | null;
  activo: boolean;
}

export interface SedeAlmacenRelacion {
  id_sede: number;
  sede: { id_sede: number; codigo: string; nombre: string };
  almacenes: { id_almacen: number; almacen: AlmacenBasico }[];
=======
>>>>>>> 41e708d8501d2a3c6685bc3a5a1cd999923d2339
  total: number;
}