export enum MovementType {
  ENTRY = 'entry',
  EXIT = 'exit',
  ADJUSTMENT = 'adjustment',
}
export interface InventoryMovement {
  id?: number
  movementType: MovementType
  quantity: number
  previousStock: number
  newStock: number
  reason?: string
  provider?: string
  unitCost?: number
  totalCost?: number
  productId: number
  userId: number
  product?: any
  user?: any
  createdAt?: Date | string
  updatedAt?: Date | string
}
export interface CreateMovementDto {
  movementType: MovementType
  quantity: number
  productId: number
  reason?: string
  provider?: string
  unitCost?: number
}
export interface MovementStats {
  totalMovements: number
  entries: number
  exits: number
  adjustments: number
  totalValue: number
}
export interface MovementFilters {
  page?: number
  limit?: number
  productId?: number
  movementType?: MovementType | string
  userId?: number
  startDate?: string
  endDate?: string
  quantity?: string
  previousStock?: number
  newStock?: number
}
export interface InventoryMovementModalData {
  movement?: InventoryMovement
  mode: 'create' | 'view' | 'edit'
  isEditForm: boolean
  movementType?: MovementType
}
