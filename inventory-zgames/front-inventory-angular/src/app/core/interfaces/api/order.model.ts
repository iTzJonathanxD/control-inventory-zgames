import { Payment } from './payment.model'
export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}
export interface OrderItem {
  id: number
  orderId: number
  productId: number
  quantity: number
  unitPrice: number
  totalPrice: number
  productName: string
  productSnapshot: {
    id: number
    name: string
    price: number
    image?: string
    category: string
    sku?: string
  }
  createdAt: Date
  updatedAt: Date
}
export interface Order {
  id: number
  orderNumber: string
  userId: number
  subtotal: number
  taxAmount: number
  shippingAmount: number
  totalAmount: number
  status: OrderStatus
  shippingAddress?: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  billingAddress?: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  notes?: string
  items: OrderItem[]
  payments?: Payment[]
  createdAt: Date
  updatedAt: Date
}
export interface CreateOrderDto {
  shippingAddress?: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  billingAddress?: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  notes?: string
}
