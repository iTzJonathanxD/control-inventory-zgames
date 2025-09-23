import { CommonModule } from '@angular/common'
import { Component, OnInit } from '@angular/core'
import { RouterModule, Router, ActivatedRoute } from '@angular/router'
import { NgbModule } from '@ng-bootstrap/ng-bootstrap'
import { TranslateModule } from '@ngx-translate/core'
import { CartService } from '../../../../core/services/api/cart.service'
import { Observable } from 'rxjs'
import { Cart } from '@core/interfaces/api/cart.model'
@Component({
  selector: 'app-user-products-view',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, NgbModule],
  templateUrl: './user-products-view.component.html',
  styleUrls: ['./user-products-view.component.scss'],
})
export class UserProductsViewComponent implements OnInit {
  cart$: Observable<Cart | null>
  currentView = 'catalog'
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private cartService: CartService
  ) {
    this.cart$ = this.cartService.cart$
  }
  ngOnInit(): void {
    this.cartService.fixCartInconsistencies().subscribe({
      next: () => {
        this.cartService.ensureCartSync().subscribe()
      },
      error: (error) => {
        console.error('Error fixing cart inconsistencies:', error)
        this.cartService.ensureCartSync().subscribe()
      },
    })
    this.route.url.subscribe((segments) => {
      if (segments.length > 0) {
        this.currentView = segments[segments.length - 1].path
      }
    })
  }
  switchView(view: 'catalog' | 'table'): void {
    this.currentView = view
    this.router.navigate([view], { relativeTo: this.route })
  }
  getCartItemCount(): number {
    return this.cartService.getCartItemCount()
  }
  getCartTotal(): number {
    return this.cartService.getCartTotal()
  }
  goToCart(): void {
    this.router.navigate(['/cart'])
  }
}
