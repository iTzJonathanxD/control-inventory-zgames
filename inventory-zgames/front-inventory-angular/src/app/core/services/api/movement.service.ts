import { Injectable, inject } from '@angular/core'
import { HttpClient, HttpParams } from '@angular/common/http'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { environment } from '@environment/environment'
import {
  InventoryMovement,
  CreateMovementDto,
  MovementStats,
  MovementFilters,
} from '@core/interfaces/api/movement.interface'
import {
  ApiData,
  ApiResponse,
} from '@core/interfaces/api/api-response.interface'
@Injectable({
  providedIn: 'root',
})
export class MovementService {
  private readonly _httpClient = inject(HttpClient)
  public API_URL = `${environment.apiBaseUrl}/inventory-movements`
  createMovement(
    movementData: CreateMovementDto
  ): Observable<ApiResponse<InventoryMovement>> {
    return this._httpClient.post<ApiResponse<InventoryMovement>>(
      `${this.API_URL}/create`,
      movementData
    )
  }
  getAllMovements(
    filters: MovementFilters = {}
  ): Observable<ApiResponse<ApiData<InventoryMovement[]>>> {
    let params = new HttpParams()
    if (filters.page) params = params.set('page', filters.page.toString())
    if (filters.limit) params = params.set('limit', filters.limit.toString())
    if (filters.productId)
      params = params.set('productId', filters.productId.toString())
    if (filters.movementType)
      params = params.set('movementType', filters.movementType)
    if (filters.startDate) params = params.set('startDate', filters.startDate)
    if (filters.endDate) params = params.set('endDate', filters.endDate)
    return this._httpClient.get<ApiResponse<ApiData<InventoryMovement[]>>>(
      `${this.API_URL}/get-all`,
      { params }
    )
  }
  getProductMovements(
    productId: number,
    page = 1,
    limit = 10
  ): Observable<ApiResponse<ApiData<InventoryMovement[]>>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString())
    return this._httpClient.get<ApiResponse<ApiData<InventoryMovement[]>>>(
      `${this.API_URL}/product/${productId}`,
      { params }
    )
  }
  public findAllMovementsType(
    page: number,
    limit: number,
    movementType: string
  ): Observable<ApiResponse<ApiData<InventoryMovement[]>>> {
    const endpoint = `${this.API_URL}/get-all`
    let params = new HttpParams().set('page', page).set('limit', limit)
    if (movementType) params = params.set('movementType', movementType)
    return this._httpClient
      .get<ApiResponse<ApiData<InventoryMovement[]>>>(endpoint, { params })
      .pipe(
        map((res) => {
          if (res.data) {
            return res
          } else {
            throw new Error('No products found')
          }
        })
      )
  }
  public findAllMovements(
    page: number,
    limit: number,
    filter: {
      productId?: number
      movementType?: string
      userId?: number
      startDate?: string
      endDate?: string
      quantity?: string
      previousStock?: number
      newStock?: number
    } = {}
  ): Observable<ApiResponse<ApiData<InventoryMovement[]>>> {
    const endpoint = `${this.API_URL}/get-all`
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString())
    if (filter.productId !== undefined)
      params = params.set('productId', filter.productId.toString())
    if (filter.movementType)
      params = params.set('movementType', filter.movementType)
    if (filter.userId !== undefined)
      params = params.set('userId', filter.userId.toString())
    if (filter.startDate) params = params.set('startDate', filter.startDate)
    if (filter.endDate) params = params.set('endDate', filter.endDate)
    if (filter.quantity) params = params.set('quantity', filter.quantity)
    if (filter.previousStock !== undefined)
      params = params.set('previousStock', filter.previousStock.toString())
    if (filter.newStock !== undefined)
      params = params.set('newStock', filter.newStock.toString())
    return this._httpClient
      .get<ApiResponse<ApiData<InventoryMovement[]>>>(endpoint, { params })
      .pipe(
        map((res) => {
          if (res.data) {
            return res
          } else {
            throw new Error('No products found')
          }
        })
      )
  }
  getMovementStats(
    startDate?: string,
    endDate?: string
  ): Observable<ApiResponse<MovementStats>> {
    let params = new HttpParams()
    if (startDate) params = params.set('startDate', startDate)
    if (endDate) params = params.set('endDate', endDate)
    return this._httpClient.get<ApiResponse<MovementStats>>(
      `${this.API_URL}/stats`,
      {
        params,
      }
    )
  }
  getMovementById(id: number): Observable<ApiResponse<InventoryMovement>> {
    return this._httpClient.get<ApiResponse<InventoryMovement>>(
      `${this.API_URL}/${id}`
    )
  }
  public updateMovement(
    id: number,
    user: object
  ): Observable<ApiResponse<InventoryMovement>> {
    const endpoint = `${this.API_URL}/update/${id}`
    return this._httpClient
      .put<ApiResponse<InventoryMovement>>(endpoint, user)
      .pipe()
  }
}
