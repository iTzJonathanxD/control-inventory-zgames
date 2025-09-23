export interface UserDebtResponse {
  userId: number
  debt: number
}
export interface AddDebtRequest {
  amount: number
  reason?: string
}
export interface ReduceDebtRequest {
  amount: number
  reason?: string
}
export interface DebtOperationResponse {
  message: string
  userId: number
  newDebt: number
  reason?: string
}
export interface ClearDebtResponse {
  message: string
  userId: number
  debt: number
}
export interface UserWithDebt {
  id: number
  firstName: string
  lastName: string
  email: string
  debt: number
}
