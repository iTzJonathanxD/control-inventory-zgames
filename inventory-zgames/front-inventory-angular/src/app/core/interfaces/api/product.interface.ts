import { Category } from './category.interface'
import { InventoryMovement } from './movement.interface'
export interface Product {
  id?: number
  productName: string
  codeName: string
  description: string
  stockMin: number
  stockCurrent: number
  unitPrice: number
  isActive: boolean
  image?: string
  rating?: number
  weight?: number
  specifications?: Record<string, any>
  createdById?: number
  categoryId: number
  category?: Category
  createdAt?: Date
  updatedAt?: Date
  movements?: InventoryMovement[]
}
export type ProductModalMode = 'create' | 'edit' | 'view'
export interface ProductModalData {
  product?: Product
  mode?: ProductModalMode
  isEditForm?: boolean
}
export interface BulkUploadResult {
  success: number
  errors: number
  details: string[]
}
export interface ProductFormData {
  id?: number
  productName: string
  codeName: string
  description: string
  stockMin: number
  stockCurrent: number
  unitPrice: number
  isActive: boolean
  image?: string
  rating?: number
  weight?: number
  specifications?: Record<string, any>
  categoryId: number
}
export interface CreateProductRequest {
  productName: string
  codeName: string
  description: string
  stockMin: number
  stockCurrent: number
  unitPrice?: number
  categoryId: number
  isActive?: boolean
  image?: string
  rating?: number
  weight?: number
  specifications?: Record<string, any>
}
export interface UpdateProductRequest extends Partial<CreateProductRequest> {
  id: number
}
export interface ExportOptions {
  format: 'pdf' | 'excel'
  includeMovements?: boolean
  includeAlerts?: boolean
  dateRange?: {
    start: Date
    end: Date
  }
}
