import { MsgTranslate, ApiMessage } from './message.interface'
export interface ApiResponse<T> {
  success: boolean
  message: ApiMessage
  data: T
}
export interface ApiData<T> {
  result: T
  meta: {
    totalItems: number
    itemCount: number
    itemsPerPage: number
    totalPages: number
    currentPage: number
  }
}
