import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable, BehaviorSubject } from 'rxjs'
import { tap } from 'rxjs/operators'
import { environment } from '../../../../environments/environment'
import {
  Cart,
  AddToCartDto,
  UpdateCartItemDto,
} from '../../interfaces/api/cart.model'
@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly apiUrl = `${environment.apiBaseUrl}/cart`
  private cartSubject = new BehaviorSubject<Cart | null>(null)
  public cart$ = this.cartSubject.asObservable()
  constructor(private http: HttpClient) {}
  getUserCart(): Observable<Cart> {
    return this.http.get<Cart>(this.apiUrl).pipe(
      tap((cart) => {
        console.log('Cart loaded:', cart)
        this.cartSubject.next(cart)
      })
    )
  }
  addToCart(addToCartDto: AddToCartDto): Observable<Cart> {
    return this.http
      .post<Cart>(`${this.apiUrl}/add`, addToCartDto)
      .pipe(tap((cart) => this.cartSubject.next(cart)))
  }
  updateCartItem(
    itemId: number,
    updateDto: UpdateCartItemDto
  ): Observable<Cart> {
    return this.http
      .patch<Cart>(`${this.apiUrl}/items/${itemId}`, updateDto)
      .pipe(tap((cart) => this.cartSubject.next(cart)))
  }
  removeCartItem(itemId: number): Observable<Cart> {
    return this.http
      .delete<Cart>(`${this.apiUrl}/items/${itemId}`)
      .pipe(tap((cart) => this.cartSubject.next(cart)))
  }
  clearCart(): Observable<Cart> {
    return this.http.delete<Cart>(`${this.apiUrl}/clear`).pipe(
      tap((cart) => {
        console.log('Cart cleared, updating state:', cart)
        if (cart) {
          cart.items = []
          cart.totalAmount = 0
        }
        this.cartSubject.next(cart)
      })
    )
  }
  forceCartCleanup(): void {
    const emptyCart = {
      id: 0,
      userId: 0,
      status: 'active' as any,
      totalAmount: 0,
      items: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    console.log('Forcing cart cleanup - setting empty cart state')
    this.cartSubject.next(emptyCart)
  }
  getCartItemCount(): number {
    const cart = this.cartSubject.value
    return cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0
  }
  getCartTotal(): number {
    const cart = this.cartSubject.value
    return cart?.totalAmount || 0
  }
  refreshCart(): Observable<Cart> {
    return this.getUserCart()
  }
  getCurrentCart(): Cart | null {
    return this.cartSubject.value
  }
  ensureCartSync(): Observable<Cart> {
    console.log('Ensuring cart synchronization...')
    return this.getUserCart().pipe(
      tap((cart) => {
        console.log('Cart synchronized:', cart)
      })
    )
  }
  fixCartInconsistencies(): Observable<Cart> {
    return this.http.post<Cart>(`${this.apiUrl}/fix-inconsistencies`, {}).pipe(
      tap((cart) => {
        console.log('Cart inconsistencies fixed:', cart)
        this.cartSubject.next(cart)
      })
    )
  }
}
