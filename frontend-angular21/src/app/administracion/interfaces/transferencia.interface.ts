
export interface TransferenciaItem {
  productId: number;
  series: string[];
  quantity: number;
}

export interface TransferenciaItemRequest {
  productId: number;
  series: string[];
}

export interface TransferenciaItems {
  items: TransferenciaItem[];
}

export interface TransferenciaProductoCategoriaResponse {
  id_categoria: number;
  nombre: string;
}

export interface TransferenciaProductoResponse {
  id_producto: number;
  categoria: TransferenciaProductoCategoriaResponse | TransferenciaProductoCategoriaResponse[];
  codigo: string;
  nomProducto?: string;
  descripcion: string;
}

export interface TransferenciaItemResponse {
  series: string[];
  quantity: number;
  producto: TransferenciaProductoResponse | TransferenciaProductoResponse[];
}

export interface TransferenciaCreatorUserResponse {
  idUsuario: number;
  usuNom?: string;
  nombres?: string;
  apePat?: string;
  apeMat?: string;
  apellidos?: string;
}

export interface TransferenciaSedeResumenResponse {
  id_sede: string;
  nomSede: string;
}

export interface TransferenciaWarehouseResumenResponse {
  id_almacen: number;
  nomAlm: string;
}

export interface TransferenciaInterfaceResponse {
  id: number;
  originHeadquartersId?: string;
  originWarehouseId?: number;
  destinationHeadquartersId?: string;
  destinationWarehouseId?: number;
  origin?: TransferenciaSedeResumenResponse;
  originWarehouse?: TransferenciaWarehouseResumenResponse;
  destination?: TransferenciaSedeResumenResponse;
  destinationWarehouse?: TransferenciaWarehouseResumenResponse;
  items?: TransferenciaItemResponse[];
  observation?: string;
  status?: string;
  requestDate?: string;
  totalQuantity?: number;
  nomProducto?: string;
  creatorUser?: TransferenciaCreatorUserResponse | TransferenciaCreatorUserResponse[];
}

export interface TransferenciaRequest {
  originHeadquartersId: string;
  originWarehouseId: number;
  destinationHeadquartersId: string;
  destinationWarehouseId: number;
  userId: number;
  observation: string;
  items: TransferenciaItemRequest[];
}

export type TransferTargetStatus =
  | 'DISPONIBLE'
  | 'TRANSFERIDO'
  | 'VENDIDO'
  | 'MERMA'
  | 'BAJA';

export type TransferStatus =
  | 'SOLICITADA'
  | 'APROBADA'
  | 'RECHAZADA'
  | 'COMPLETADA';

export interface TransferenciaBulkStatusRequest {
  series: string[];
  targetStatus: TransferTargetStatus;
  transferStatus: TransferStatus;
}
