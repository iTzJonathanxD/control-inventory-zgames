import { Component, inject, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule, Router } from '@angular/router'
import { FormsModule } from '@angular/forms'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { Cart, CartItem } from '../../../../core/interfaces/api/cart.model'
import { Observable } from 'rxjs'
import { environment } from '../../../../../environments/environment'
import { CartService } from '@core/services/api/cart.service'
import { ImageUrlService } from '../../../../core/services/ui/image-url.service'
import { LoadingSpinnerComponent } from '../../../../shared/components/ui/loading-spinner/loading-spinner.component'
@Component({
  selector: 'app-cart-view',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    TranslateModule,
    LoadingSpinnerComponent,
  ],
  templateUrl: './cart-view.component.html',
  styleUrls: ['./cart-view.component.scss'],
})
export class CartViewComponent implements OnInit {
  cart$: Observable<Cart | null>
  isUpdating: { [key: number]: boolean } = {}
  isRemoving: { [key: number]: boolean } = {}
  isClearing = false
  isLoading = true
  private translate = inject(TranslateService)
  private router = inject(Router)
  private imageUrlService = inject(ImageUrlService)
  constructor(private cartService: CartService) {
    this.cart$ = this.cartService.cart$
  }
  ngOnInit() {
    const minLoadingTime = 600
    const startTime = Date.now()
    this.cartService.fixCartInconsistencies().subscribe({
      next: () => {
        this.cartService.ensureCartSync().subscribe({
          next: () => {
            const elapsedTime = Date.now() - startTime
            const remainingTime = Math.max(0, minLoadingTime - elapsedTime)
            setTimeout(() => {
              this.isLoading = false
            }, remainingTime)
          },
          error: () => {
            const elapsedTime = Date.now() - startTime
            const remainingTime = Math.max(0, minLoadingTime - elapsedTime)
            setTimeout(() => {
              this.isLoading = false
            }, remainingTime)
          },
        })
      },
      error: () => {
        this.cartService.ensureCartSync().subscribe({
          next: () => {
            const elapsedTime = Date.now() - startTime
            const remainingTime = Math.max(0, minLoadingTime - elapsedTime)
            setTimeout(() => {
              this.isLoading = false
            }, remainingTime)
          },
          error: () => {
            const elapsedTime = Date.now() - startTime
            const remainingTime = Math.max(0, minLoadingTime - elapsedTime)
            setTimeout(() => {
              this.isLoading = false
            }, remainingTime)
          },
        })
      },
    })
  }
  updateQuantity(item: CartItem, newQuantity: number | string) {
    const quantity =
      typeof newQuantity === 'string' ? parseInt(newQuantity) : newQuantity
    if (quantity <= 0) {
      alert('La cantidad debe ser mayor a 0')
      return
    }
    if (quantity > (item.product?.stockCurrent || 0)) {
      alert(
        `Stock insuficiente. Stock disponible: ${item.product?.stockCurrent || 0}`
      )
      return
    }
    this.isUpdating[item.id] = true
    this.cartService.updateCartItem(item.id, { quantity }).subscribe({
      next: () => {
        this.isUpdating[item.id] = false
      },
      error: (error) => {
        console.error('Error updating cart item:', error)
        const errorMessage =
          error.error?.message || 'Error al actualizar el carrito'
        alert(errorMessage)
        this.isUpdating[item.id] = false
      },
    })
  }
  removeItem(itemId: number) {
    this.translate.get('CART.CONFIRM_REMOVE').subscribe((message) => {
      if (confirm(message)) {
        this.isRemoving[itemId] = true
        this.cartService.removeCartItem(itemId).subscribe({
          next: () => {
            this.isRemoving[itemId] = false
          },
          error: () => {
            this.isRemoving[itemId] = false
          },
        })
      }
    })
  }
  clearCart() {
    this.translate.get('CART.CONFIRM_CLEAR').subscribe((message) => {
      if (confirm(message)) {
        this.isClearing = true
        this.cartService.clearCart().subscribe({
          next: () => {
            this.isClearing = false
          },
          error: () => {
            this.isClearing = false
          },
        })
      }
    })
  }
  proceedToCheckout() {
    this.router.navigate(['/checkout'])
  }
  getProductImageUrl(imagePath: string | null): string {
    return this.imageUrlService.getProductImageUrl(imagePath)
  }
  getFinalTotal(subtotal: number): number {
    return subtotal
  }
  trackByItemId(index: number, item: CartItem): number {
    return item.id
  }
}
