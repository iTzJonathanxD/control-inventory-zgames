export interface Category {
  id?: number
  categoryName: string
  description?: string
  isActive: boolean
  createdAt?: Date
  updatedAt?: Date
}
export type CategoryModalMode = 'create' | 'edit' | 'view'
export interface CategoryModalData {
  category?: Category
  mode: CategoryModalMode
  isEditForm: boolean
}
export interface CategoryFormData {
  categoryName: string
  description: string
  isActive: boolean
}
