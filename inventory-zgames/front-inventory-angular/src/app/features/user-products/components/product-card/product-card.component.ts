import { CommonModule } from '@angular/common'
import { Component, Input } from '@angular/core'
import { NgbModule } from '@ng-bootstrap/ng-bootstrap'
import { TranslateModule } from '@ngx-translate/core'
export interface Product {
  id: number
  name: string
  description: string
  price: number
  category: string
  image: string
  stock: number
  rating: number
  isAvailable: boolean
}
@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, TranslateModule, NgbModule],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss',
})
export class ProductCardComponent {
  @Input() product!: Product
  getStarArray(): number[] {
    return Array(5)
      .fill(0)
      .map((_, i) => i + 1)
  }
  isStarFilled(star: number): boolean {
    return star <= Math.floor(this.product.rating)
  }
  isStarHalf(star: number): boolean {
    return (
      star === Math.ceil(this.product.rating) && this.product.rating % 1 !== 0
    )
  }
  getStockStatus(): { class: string; text: string } {
    if (!this.product.isAvailable || this.product.stock === 0) {
      return { class: 'danger', text: 'USER_PRODUCTS.OUT_OF_STOCK' }
    } else if (this.product.stock <= 5) {
      return { class: 'warning', text: 'USER_PRODUCTS.LOW_STOCK' }
    } else {
      return { class: 'success', text: 'USER_PRODUCTS.IN_STOCK' }
    }
  }
}
