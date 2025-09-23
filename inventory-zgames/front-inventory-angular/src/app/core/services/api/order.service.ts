import { Injectable, inject } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'
import { environment } from '../../../../environments/environment'
import { Order, CreateOrderDto } from '../../interfaces/api/order.model'
import { CartService } from './cart.service'
@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private readonly apiUrl = `${environment.apiBaseUrl}/orders`
  private readonly cartService = inject(CartService)
  constructor(private http: HttpClient) {}
  createFromCart(createOrderDto: CreateOrderDto): Observable<Order> {
    return this.http
      .post<Order>(`${this.apiUrl}/from-cart`, createOrderDto)
      .pipe(
        tap((order) => {
          console.log('Order created successfully:', order)
        })
      )
  }
  getUserOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.apiUrl)
  }
  getOrderById(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${id}`)
  }
  cancelOrder(id: number): Observable<Order> {
    return this.http.patch<Order>(`${this.apiUrl}/${id}/cancel`, {})
  }
  getAllOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/admin/all`)
  }
  updateOrderStatus(id: number, status: string): Observable<Order> {
    return this.http.patch<Order>(`${this.apiUrl}/${id}/status`, { status })
  }
}
