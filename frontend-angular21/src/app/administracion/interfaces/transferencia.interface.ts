export type TransferStatus = 'SOLICITADA' | 'APROBADA' | 'RECHAZADA' | 'COMPLETADA';
export type UnitStatus = 'DISPONIBLE' | 'RESERVADA' | 'TRANSFERIDA' | 'INACTIVA';
export type TransferRole = 'ADMINISTRADOR' | 'JEFE DE ALMACEN';

export interface RequestTransferAggregatedItemDto {
  productId: number;
  quantity: number;
}

export interface RequestTransferAggregatedDto {
  originHeadquartersId: string;
  originWarehouseId: number;
  destinationHeadquartersId: string;
  destinationWarehouseId: number;
  observation?: string | null;
  userId: number;
  items: RequestTransferAggregatedItemDto[];
}

export interface ApproveTransferDto {
  userId: number;
}

export interface RejectTransferDto {
  userId: number;
  reason: string;
}

export interface ConfirmReceiptTransferDto {
  userId: number;
}

export interface TransferCategoryDto {
  id?: number;
  id_categoria?: number;
  nombre?: string;
  name?: string;
}

export interface TransferProductDto {
  id?: number;
  id_producto?: number;
  codigo?: string;
  sku?: string;
  descripcion?: string;
  nomProducto?: string;
  nombre?: string;
  categoria?: TransferCategoryDto | TransferCategoryDto[];
}

export interface TransferUserDto {
  id?: number;
  idUsuario?: number;
  userId?: number;
  usuNom?: string;
  nombres?: string;
  apePat?: string;
  apeMat?: string;
  apellidos?: string;
  fullName?: string;
}

export interface TransferHeadquarterDto {
  id?: string | number;
  id_sede?: string | number;
  nomSede?: string;
  nombre?: string;
  codigo?: string;
}

export interface TransferWarehouseDto {
  id?: number;
  id_almacen?: number;
  nomAlm?: string;
  nombre?: string;
  codigo?: string;
}

export interface TransferItemResponse {
  productId?: number;
  series: string[];
  quantity: number;
  producto?:
    | TransferProductDto
    | TransferProductDto[]
    | Record<string, unknown>
    | Array<Record<string, unknown>>;
}

export interface TransferResponseDto {
  id: number;
  creatorUserId?: number;
  approveUserId?: number | null;
  originHeadquartersId: string;
  originWarehouseId: number;
  destinationHeadquartersId: string;
  destinationWarehouseId: number;
  items: TransferItemResponse[];
  totalQuantity: number;
  status: TransferStatus;
  observation?: string | null;
  requestDate: string;
  responseDate?: string | null;
  completionDate?: string | null;
  rejectionReason?: string | null;
  creatorUser?: TransferUserDto | TransferUserDto[];
  approveUser?: TransferUserDto | TransferUserDto[];
  origin?: TransferHeadquarterDto;
  destination?: TransferHeadquarterDto;
  originWarehouse?: TransferWarehouseDto;
  destinationWarehouse?: TransferWarehouseDto;
}

export interface TransferListResponseDto {
  id: number;
  creatorUserId?: number;
  approveUserId?: number | null;
  originHeadquartersId: string;
  originWarehouseId: number;
  destinationHeadquartersId: string;
  destinationWarehouseId: number;
  totalQuantity: number;
  status: TransferStatus;
  observation?: string | null;
  nomProducto?: string | null;
  requestDate: string;
  responseDate?: string | null;
  completionDate?: string | null;
  creatorUser?: TransferUserDto | TransferUserDto[];
  approveUser?: TransferUserDto | TransferUserDto[];
  origin?: TransferHeadquarterDto;
  destination?: TransferHeadquarterDto;
  items?: TransferItemResponse[];
}

export interface TransferByIdResponseDto extends TransferResponseDto {}

export interface TransferConflictInfo {
  requested?: number;
  available?: number;
  productId?: number;
  warehouseId?: number;
}

export interface TransferApiError {
  status: number;
  message: string;
  backendMessage?: string;
  conflict?: TransferConflictInfo;
}

// Alias para compatibilidad con código existente
export type TransferRequestItemDto = RequestTransferAggregatedItemDto;
export type TransferRequestDto = RequestTransferAggregatedDto;
export type TransferenciaItemRequest = RequestTransferAggregatedItemDto;
export type ApproveTransferRequestDto = ApproveTransferDto;
export type RejectTransferRequestDto = RejectTransferDto;
export type ConfirmReceiptRequestDto = ConfirmReceiptTransferDto;
export type TransferenciaProductoCategoriaResponse = TransferCategoryDto;
export type TransferenciaProductoResponse = TransferProductDto;
export type TransferResponseItemDto = TransferItemResponse;
export type TransferenciaItemResponse = TransferItemResponse;
export type TransferenciaUserResponse = TransferUserDto;
export type TransferenciaSedeResumenResponse = TransferHeadquarterDto;
export type TransferenciaWarehouseResumenResponse = TransferWarehouseDto;
export type TransferenciaRequest = RequestTransferAggregatedDto;
export type TransferenciaInterfaceResponse = TransferResponseDto;
export type TransferenciaCreatorUserResponse = TransferUserDto;
