import { HttpClient, HttpParams } from '@angular/common/http'
import { inject, Injectable, Injector } from '@angular/core'
import { environment } from '@environment/environment'
import { ToastrNotificationService } from '../ui/notification.service'
import type {
  ApiData,
  ApiResponse,
} from '@core/interfaces/api/api-response.interface'
import { map, Observable, tap } from 'rxjs'
import type { ApiMessage } from '@core/interfaces/api/message.interface'
import type { Category } from '@core/interfaces/api/category.interface'
@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  public API_URL = `${environment.apiBaseUrl}/categories`
  private _httpClient = inject(HttpClient)
  private _injector = inject(Injector)
  private get notificationService(): ToastrNotificationService {
    return this._injector.get(ToastrNotificationService)
  }
  public getCategoriesAsNgSelect(): Observable<
    { label: string; value: number }[]
  > {
    return this.getActiveCategories().pipe(
      map((res) => {
        const items =
          res && res.data && res.data.meta && res.data.meta.totalItems
            ? res.data.result
            : []
        const mapped = items.map((cat: any) => ({
          label: cat.categoryName || cat.name,
          value: cat.id,
        }))
        console.log('[CategoryService] Categorías para NgSelect:', mapped)
        return mapped
      })
    )
  }
  public createCategory(category: object): Observable<ApiResponse<Category>> {
    const endpoint = `${this.API_URL}/create`
    return this._httpClient
      .post<ApiResponse<Category>>(endpoint, category)
      .pipe(
        tap((res) =>
          this.showNotification(res.message, 'CATEGORY.CREATE.TITLE')
        )
      )
  }
  public getCategories(): Observable<ApiResponse<ApiData<Category[]>>> {
    const endpoint = `${this.API_URL}/get-all`
    return this._httpClient.get<ApiResponse<ApiData<Category[]>>>(endpoint)
  }
  public findCategories(
    filter: object
  ): Observable<ApiResponse<ApiData<Category[]>>> {
    const endpoint = `${this.API_URL}/get-all`
    const params = new HttpParams({ fromObject: { ...filter } })
    return this._httpClient.get<ApiResponse<ApiData<Category[]>>>(endpoint, {
      params,
    })
  }
  public toggleCategoryStatus(id: number): Observable<ApiResponse<Category>> {
    const endpoint = `${this.API_URL}/toggle-status/${id}`
    return this._httpClient
      .patch<ApiResponse<Category>>(endpoint, {})
      .pipe(
        tap((res) =>
          this.showNotification(res.message, 'CATEGORY.TOGGLE.TITLE')
        )
      )
  }
  public findAllCategories(
    page: number,
    limit: number,
    filter: {
      categoryName?: string
      description?: string
      isActive?: boolean
      fromDate?: string
      toDate?: string
    } = {}
  ): Observable<ApiResponse<ApiData<Category[]>>> {
    const endpoint = `${this.API_URL}/get-all`
    let params = new HttpParams().set('page', page).set('limit', limit)
    if (filter.categoryName)
      params = params.set('categoryName', filter.categoryName)
    if (filter.description)
      params = params.set('description', filter.description)
    if (filter.isActive !== undefined)
      params = params.set('isActive', filter.isActive.toString())
    if (filter.fromDate) params = params.set('fromDate', filter.fromDate)
    if (filter.toDate) params = params.set('toDate', filter.toDate)
    return this._httpClient
      .get<ApiResponse<ApiData<Category[]>>>(endpoint, { params })
      .pipe(
        map((res) => {
          if (res.data) {
            return res
          } else {
            throw new Error('No categories found')
          }
        })
      )
  }
  public getCategoryById(id: string): Observable<ApiResponse<Category>> {
    const endpoint = `${this.API_URL}/get-category/${id}`
    return this._httpClient.get<ApiResponse<Category>>(endpoint).pipe(
      map((res) => {
        if (res.data) {
          return res
        } else {
          throw new Error('Category not found')
        }
      }),
      tap((res) => this.showNotification(res.message, 'CATEGORY.GET.TITLE'))
    )
  }
  public deleteCategory(id: number): Observable<ApiResponse<Category>> {
    const endpoint = `${this.API_URL}/delete/${id}`
    return this._httpClient
      .delete<ApiResponse<Category>>(endpoint)
      .pipe(
        tap((res) =>
          this.showNotification(res.message, 'CATEGORY.DELETE.TITLE')
        )
      )
  }
  public updateCategory(
    id: number,
    category: object
  ): Observable<ApiResponse<Category>> {
    const endpoint = `${this.API_URL}/update/${id}`
    return this._httpClient
      .patch<ApiResponse<Category>>(endpoint, category)
      .pipe(
        tap((res) =>
          this.showNotification(res.message, 'CATEGORY.UPDATE.TITLE')
        )
      )
  }
  public updateCategoryWithImage(
    id: string,
    categoryData: FormData
  ): Observable<ApiResponse<Category>> {
    const endpoint = `${this.API_URL}/update/${id}`
    return this._httpClient
      .patch<ApiResponse<Category>>(endpoint, categoryData)
      .pipe(
        tap((res) =>
          this.showNotification(res.message, 'CATEGORY.UPDATE.TITLE')
        )
      )
  }
  public getCategoriesForSelect(): Observable<ApiResponse<Category[]>> {
    const endpoint = `${this.API_URL}/get-for-select`
    return this._httpClient.get<ApiResponse<Category[]>>(endpoint).pipe(
      map((res) => {
        if (res.data) {
          return res
        } else {
          throw new Error('No categories available for selection')
        }
      })
    )
  }
  public getActiveCategories(): Observable<ApiResponse<ApiData<Category[]>>> {
    const endpoint = `${this.API_URL}/get-active`
    return this._httpClient
      .get<ApiResponse<ApiData<Category[]>>>(endpoint)
      .pipe(
        map((res) => {
          if (res.data) {
            return res
          } else {
            throw new Error('No active categories found')
          }
        })
      )
  }
  public bulkDeleteCategories(ids: string[]): Observable<ApiResponse<void>> {
    const endpoint = `${this.API_URL}/bulk-delete`
    return this._httpClient
      .delete<ApiResponse<void>>(endpoint, { body: { ids } })
      .pipe(
        tap((res) =>
          this.showNotification(res.message, 'CATEGORY.BULK_DELETE.TITLE')
        )
      )
  }
  public bulkToggleStatus(
    ids: string[],
    status: boolean
  ): Observable<ApiResponse<void>> {
    const endpoint = `${this.API_URL}/bulk-toggle-status`
    return this._httpClient
      .put<ApiResponse<void>>(endpoint, { ids, status })
      .pipe(
        tap((res) =>
          this.showNotification(res.message, 'CATEGORY.BULK_TOGGLE.TITLE')
        )
      )
  }
  public getCategoryStats(): Observable<ApiResponse<any>> {
    const endpoint = `${this.API_URL}/stats`
    return this._httpClient.get<ApiResponse<any>>(endpoint).pipe(
      map((res) => {
        if (res.data) {
          return res
        } else {
          throw new Error('Category statistics not available')
        }
      })
    )
  }
  public searchCategories(
    searchTerm: string
  ): Observable<ApiResponse<Category[]>> {
    const endpoint = `${this.API_URL}/search`
    const params = new HttpParams().set('q', searchTerm)
    return this._httpClient
      .get<ApiResponse<Category[]>>(endpoint, { params })
      .pipe(
        map((res) => {
          if (res.data) {
            return res
          } else {
            throw new Error('No categories found matching search criteria')
          }
        })
      )
  }
  public importCategories(file: FormData): Observable<ApiResponse<any>> {
    const endpoint = `${this.API_URL}/import`
    return this._httpClient
      .post<ApiResponse<any>>(endpoint, file)
      .pipe(
        tap((res) =>
          this.showNotification(res.message, 'CATEGORY.IMPORT.TITLE')
        )
      )
  }
  private showNotification(
    message: ApiMessage,
    title = 'CATEGORY.TITLE'
  ): void {
    this.notificationService.showNotification({
      title,
      message,
      type: 'success',
    })
  }
}
