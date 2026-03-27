// terminos-condiciones/terminos-condiciones.model.ts
export interface TerminosItemResponse {
  id:        number;
  contenido: string;
  orden:     number;
}

export interface TerminosParrafoResponse {
  id:        number;
  contenido: string;
  orden:     number;
}

export interface TerminosSeccionResponse {
  id:      number;
  numero:  string;
  titulo:  string;
  orden:   number;
  parrafos: TerminosParrafoResponse[];
  items:    TerminosItemResponse[];
}

export interface TerminosResponse {
  id:            number;
  version:       string;
  fechaVigencia: string;
  activo:        boolean;
  creadoEn:      string;
  actualizadoEn: string;
  secciones:     TerminosSeccionResponse[];
}

// ── DTOs para crear/editar ───────────────────────────────────────
export interface TerminosItemDto {
  id?:       number;
  contenido: string;
  orden:     number;
}

export interface TerminosParrafoDto {
  id?:       number;
  contenido: string;
  orden:     number;
}

export interface TerminosSeccionDto {
  id?:      number;
  numero:   string;
  titulo:   string;
  orden:    number;
  parrafos: TerminosParrafoDto[];
  items:    TerminosItemDto[];
}

export interface TerminosDto {
  version:       string;
  fechaVigencia: string;
  activo?:       boolean;
  secciones:     TerminosSeccionDto[];
}