export enum RemissionType { REMITENTE = 0, TRANSPORTISTA = 1 }
export enum TransportMode { PUBLICO = 0, PRIVADO = 1 }

export interface CreateRemissionDto {
  id_comprobante_ref: number;
  id_almacen_origen: number;
  id_sede_origen: string;
  id_usuario: number;
  tipo_guia: RemissionType;
  modalidad: TransportMode;
  fecha_inicio_traslado: string;
  motivo_traslado: string;
  unidad_peso: string;
  peso_bruto_total: number;
  datos_traslado: {
    ubigeo_origen: string;
    direccion_origen: string;
    ubigeo_destino: string;
    direccion_destino: string;
  };
  datos_transporte: {
    nombre_completo?: string;
    tipo_documento?: string;
    numero_documento?: string;
    licencia?: string;
    placa?: string;
    ruc?: string;
    razon_social?: string;
  };
  items: RemissionItemDto[];
}

export interface RemissionItemDto {
  id_producto: number;
  cod_prod: string;
  cantidad: number;
  peso_total: number;
  peso_unitario: number;
}
