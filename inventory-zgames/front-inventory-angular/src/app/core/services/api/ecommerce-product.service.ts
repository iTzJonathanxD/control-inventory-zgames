import { Injectable } from '@angular/core'
import { HttpClient, HttpParams } from '@angular/common/http'
import { Observable } from 'rxjs'
import { environment } from '../../../../environments/environment'
export interface EcommerceProduct {
  id: number
  name: string
  description: string
  price: number
  category: string
  image?: string
  stock: number
  rating?: number
  isAvailable: boolean
  isActive: boolean
  sku?: string
  weight?: number
  specifications?: Record<string, any>
  tags?: string[]
  createdAt: Date
  updatedAt: Date
}
export interface ProductsResponse {
  products: EcommerceProduct[]
  total: number
}
export interface ProductFilters {
  category?: string
  search?: string
  minPrice?: number
  maxPrice?: number
  sortBy?: string
  sortOrder?: 'ASC' | 'DESC'
  page?: number
  limit?: number
}
@Injectable({
  providedIn: 'root',
})
export class EcommerceProductService {
  private readonly apiUrl = `${environment.apiBaseUrl}/products`
  constructor(private http: HttpClient) {}
  getProducts(filters?: ProductFilters): Observable<ProductsResponse> {
    let params = new HttpParams()
    if (filters) {
      Object.keys(filters).forEach((key) => {
        const value = filters[key as keyof ProductFilters]
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString())
        }
      })
    }
    return this.http.get<ProductsResponse>(this.apiUrl, { params })
  }
  getProductById(id: number): Observable<EcommerceProduct> {
    return this.http.get<EcommerceProduct>(`${this.apiUrl}/${id}`)
  }
  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/categories`)
  }
  createProduct(
    product: Partial<EcommerceProduct>
  ): Observable<EcommerceProduct> {
    return this.http.post<EcommerceProduct>(this.apiUrl, product)
  }
  updateProduct(
    id: number,
    product: Partial<EcommerceProduct>
  ): Observable<EcommerceProduct> {
    return this.http.patch<EcommerceProduct>(`${this.apiUrl}/${id}`, product)
  }
  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
  }
}
