
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

export interface TransferenciaInterfaceResponse {
  id: number;
  originHeadquartersId: string;
  originWarehouseId: number;
  destinationHeadquartersId: string;
  destinationWarehouseId: number;
  items: TransferenciaItem[];
  observation: string;
  status: string;
  requestDate: string;
  totalQuantity: number;
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
