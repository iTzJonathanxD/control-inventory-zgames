export enum CartStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  ABANDONED = 'abandoned',
}
export interface CartItem {
  id: number
  cartId: number
  productId: number
  quantity: number
  unitPrice: number
  totalPrice: number
  product: any 
  createdAt: Date
  updatedAt: Date
}
export interface Cart {
  id: number
  userId: number
  status: CartStatus
  totalAmount: number
  items: CartItem[]
  createdAt: Date
  updatedAt: Date
}
export interface AddToCartDto {
  productId: number
  quantity: number
}
export interface UpdateCartItemDto {
  quantity: number
}
