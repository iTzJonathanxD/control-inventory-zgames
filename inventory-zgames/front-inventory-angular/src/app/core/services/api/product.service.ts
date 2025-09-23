import { HttpClient, HttpParams } from '@angular/common/http'
import { inject, Injectable, Injector } from '@angular/core'
import { environment } from '@environment/environment'
import { ToastrNotificationService } from '../ui/notification.service'
import {
  ApiData,
  ApiResponse,
} from '@core/interfaces/api/api-response.interface'
import { catchError, map, Observable, tap, throwError } from 'rxjs'
import { ApiMessage } from '@core/interfaces/api/message.interface'
import {
  Product,
  CreateProductRequest,
  UpdateProductRequest,
} from '@core/interfaces/api/product.interface'
import {
  BestSellingProduct,
  DashboardStats,
  MonthlySalesData,
} from '@core/interfaces/api/dashboard.interface'
@Injectable({
  providedIn: 'root',
})
export class ProductService {
  public API_URL = `${environment.apiBaseUrl}/products`
  private _httpClient = inject(HttpClient)
  private _injector = inject(Injector)
  private _notificationService!: ToastrNotificationService
  private get notificationService(): ToastrNotificationService {
    if (!this._notificationService) {
      this._notificationService = this._injector.get(ToastrNotificationService)
    }
    return this._notificationService
  }
  public createProduct(
    product: CreateProductRequest
  ): Observable<ApiResponse<Product>> {
    const endpoint = `${this.API_URL}/create`
    return this._httpClient
      .post<ApiResponse<Product>>(endpoint, product)
      .pipe(
        tap((res) =>
          this.showNotification(res.message, 'PRODUCTS.CREATE.TITLE')
        )
      )
  }
  public createProductWithImage(
    formData: FormData
  ): Observable<ApiResponse<Product>> {
    const endpoint = `${this.API_URL}/create`
    return this._httpClient
      .post<ApiResponse<Product>>(endpoint, formData)
      .pipe(
        tap((res) =>
          this.showNotification(res.message, 'PRODUCTS.CREATE.TITLE')
        )
      )
  }
  public updateProductWithImage(
    id: number,
    formData: FormData
  ): Observable<ApiResponse<Product>> {
    const endpoint = `${this.API_URL}/update/${id}`
    return this._httpClient
      .patch<ApiResponse<Product>>(endpoint, formData)
      .pipe(
        tap((res) => this.showNotification(res.message, 'PRODUCTS.EDIT.TITLE'))
      )
  }
  public uploadImage(
    file: File
  ): Observable<ApiResponse<{ imageUrl: string }>> {
    const endpoint = `${this.API_URL}/upload-image`
    const formData = new FormData()
    formData.append('image', file)
    return this._httpClient.post<ApiResponse<{ imageUrl: string }>>(
      endpoint,
      formData
    )
  }
  public getProducts(): Observable<ApiResponse<ApiData<Product[]>>> {
    const endpoint = `${this.API_URL}/get-all`
    return this._httpClient.get<ApiResponse<ApiData<Product[]>>>(endpoint)
  }
  public findAllProducts(
    page: number,
    limit: number,
    filter: {
      productName?: string
      codeName?: string
      description?: string
      categoryId?: number
      isActive?: boolean
      stockMin?: number
      stockCurrent?: number
      unitPrice?: number
    } = {}
  ): Observable<ApiResponse<ApiData<Product[]>>> {
    const endpoint = `${this.API_URL}/get-all`
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString())
    if (filter.productName) {
      params = params.set('productName', filter.productName)
    }
    if (filter.codeName) {
      params = params.set('codeName', filter.codeName)
    }
    if (filter.description) {
      params = params.set('description', filter.description)
    }
    if (filter.categoryId !== undefined && filter.categoryId !== null) {
      params = params.set('categoryId', filter.categoryId.toString())
    }
    if (filter.stockMin !== undefined && filter.stockMin !== null) {
      params = params.set('stockMin', filter.stockMin.toString())
    }
    if (filter.stockCurrent !== undefined && filter.stockCurrent !== null) {
      params = params.set('stockCurrent', filter.stockCurrent.toString())
    }
    if (filter.unitPrice !== undefined && filter.unitPrice !== null) {
      params = params.set('unitPrice', filter.unitPrice.toString())
    }
    if (filter.isActive !== undefined && filter.isActive !== null) {
      params = params.set('isActive', filter.isActive.toString())
    }
    return this._httpClient
      .get<ApiResponse<ApiData<Product[]>>>(endpoint, { params })
      .pipe(
        catchError((error) => {
          console.error('Error fetching products:', error)
          return throwError(() => new Error('Error al obtener productos'))
        }),
        map((res) => {
          if (res.data && res.data.result) {
            return {
              ...res,
              data: {
                ...res.data,
              },
            }
          } else {
            throw new Error('No se encontraron productos')
          }
        })
      )
  }
  public getProductById(id: string): Observable<ApiResponse<Product>> {
    const endpoint = `${this.API_URL}/${id}`
    return this._httpClient.get<ApiResponse<Product>>(endpoint)
  }
  public findProductById(id: number): Observable<ApiResponse<Product>> {
    const endpoint = `${this.API_URL}/${id}`
    return this._httpClient.get<ApiResponse<Product>>(endpoint)
  }
  public findLowStockProducts(): Observable<ApiResponse<Product[]>> {
    const endpoint = `${this.API_URL}/low-stock`
    return this._httpClient.get<ApiResponse<Product[]>>(endpoint)
  }
  public updateProduct(
    id: number,
    product: UpdateProductRequest
  ): Observable<ApiResponse<Product>> {
    const endpoint = `${this.API_URL}/update/${id}`
    return this._httpClient
      .patch<ApiResponse<Product>>(endpoint, product)
      .pipe(
        tap((res) => this.showNotification(res.message, 'PRODUCTS.EDIT.TITLE'))
      )
  }
  public toggleProductStatus(id: number): Observable<ApiResponse<Product>> {
    const endpoint = `${this.API_URL}/toggle-status/${id}`
    return this._httpClient.patch<ApiResponse<Product>>(endpoint, {})
  }
  public deleteProduct(id: number): Observable<ApiResponse<null>> {
    const endpoint = `${this.API_URL}/${id}`
    return this._httpClient
      .delete<ApiResponse<null>>(endpoint)
      .pipe(
        tap((res) => this.showNotification(res.message, 'PRODUCT.DELETE.TITLE'))
      )
  }
  public getDashboardStats(): Observable<ApiResponse<DashboardStats>> {
    const endpoint = `${this.API_URL}/dashboard-stats`
    return this._httpClient.get<ApiResponse<DashboardStats>>(endpoint)
  }
  public getBestSellingProducts(
    limit = 10
  ): Observable<ApiResponse<BestSellingProduct[]>> {
    const endpoint = `${this.API_URL}/best-selling`
    const params = new HttpParams().set('limit', limit.toString())
    return this._httpClient.get<ApiResponse<BestSellingProduct[]>>(endpoint, {
      params,
    })
  }
  public getMonthlySalesData(): Observable<ApiResponse<MonthlySalesData[]>> {
    const endpoint = `${this.API_URL}/monthly-sales`
    return this._httpClient.get<ApiResponse<MonthlySalesData[]>>(endpoint)
  }
  private showNotification(message: ApiMessage, title = 'PRODUCT.TITLE'): void {
    this.notificationService.showNotification({
      title,
      message,
      type: 'success',
    })
  }
}
