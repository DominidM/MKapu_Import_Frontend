
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
  categoria: TransferenciaProductoCategoriaResponse[];
  codigo: string;
  anexo: string;
  descripcion: string;
}

export interface TransferenciaItemResponse {
  series: string[];
  quantity: number;
  producto: TransferenciaProductoResponse[];
}

export interface TransferenciaCreatorUserResponse {
  idUsuario: number;
  usuNom?: string;
  nombres?: string;
  apePat?: string;
  apeMat?: string;
  apellidos?: string;
}

export interface TransferenciaInterfaceResponse {
  id: number;
  originHeadquartersId: string;
  originWarehouseId: number;
  destinationHeadquartersId: string;
  destinationWarehouseId: number;
  items: TransferenciaItemResponse[];
  observation: string;
  status: string;
  requestDate: string;
  totalQuantity: number;
  creatorUser: TransferenciaCreatorUserResponse[];
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
