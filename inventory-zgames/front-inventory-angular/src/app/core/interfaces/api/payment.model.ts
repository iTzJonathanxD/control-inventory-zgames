export enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  PAYPAL = 'paypal',
  BANK_TRANSFER = 'bank_transfer',
  CASH = 'cash',
}
export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}
export interface Payment {
  id: number
  orderId: number
  userId?: number
  companyId?: number
  amount: number | string
  method: PaymentMethod | string
  paymentMethod?: PaymentMethod | string // Alias para compatibilidad
  status: PaymentStatus | string
  reference?: string
  description?: string
  isVerified?: boolean
  transactionId?: string
  evidenceImages?: string[]
  evidenceNotes?: string
  metadata?: Record<string, any>
  processedAt?: Date | string
  createdAt: Date | string
  updatedAt: Date | string
  order?: any // Referencia a la orden
  user?: any // Referencia al usuario
  company?: any // Referencia a la empresa
}
export interface CreatePaymentDto {
  orderId: number
  userId?: number
  companyId?: number
  amount: number
  method: PaymentMethod
  paymentMethod?: PaymentMethod
  reference?: string
  description?: string
  evidenceNotes?: string
  isVerified?: boolean
}
export interface UpdatePaymentDto {
  amount?: number
  method?: PaymentMethod
  status?: PaymentStatus
  reference?: string
  description?: string
  isVerified?: boolean
  evidenceNotes?: string
}
export interface PaymentEvidence {
  payment: Payment
  evidenceUrls: string[]
}
export interface PaymentFilter {
  startDate?: string
  endDate?: string
  minAmount?: number
  maxAmount?: number
  status?: PaymentStatus[]
  method?: PaymentMethod[]
  isVerified?: boolean
  companyId?: number
  userId?: number
  orderId?: number
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'ASC' | 'DESC'
}
export interface PaymentModalData {
  mode: 'view' | 'edit' | 'create' | 'process' | 'reject'
  payment?: Payment
  title?: string
  isEditForm?: boolean
}
