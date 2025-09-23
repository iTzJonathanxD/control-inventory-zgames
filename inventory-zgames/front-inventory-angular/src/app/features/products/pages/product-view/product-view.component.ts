import { Component, inject, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ActivatedRoute, Router } from '@angular/router'
import { TranslateModule } from '@ngx-translate/core'
import { ProductService } from '@core/services/api/product.service'
import { Product } from '@core/interfaces/api/product.interface'
import { ImageUrlService } from '../../../../core/services/ui/image-url.service'
@Component({
  selector: 'app-product-view',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './product-view.component.html',
  styleUrls: ['./product-view.component.scss'],
})
export class ProductViewComponent implements OnInit {
  private router = inject(Router)
  private route = inject(ActivatedRoute)
  private productService = inject(ProductService)
  private imageUrlService = inject(ImageUrlService)
  product: Product | null = null
  productId!: number
  loading = false
  ngOnInit() {
    this.productId = parseInt(this.route.snapshot.paramMap.get('id') || '0')
    this.loadProduct()
  }
  loadProduct() {
    this.loading = true
    this.productService.getProductById(this.productId.toString()).subscribe({
      next: (response) => {
        this.product = response.data
        this.loading = false
      },
      error: (error) => {
        console.error('Error loading product:', error)
        this.loading = false
        this.router.navigate(['/products-management'])
      },
    })
  }
  editProduct() {
    this.router.navigate(['/products-management/edit', this.productId])
  }
  goBack() {
    this.router.navigate(['/products-management'])
  }
  isLowStock(): boolean {
    return this.product
      ? this.product.stockCurrent <= this.product.stockMin
      : false
  }
  getStars(rating: number): string[] {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0
    for (let i = 0; i < fullStars; i++) {
      stars.push('★')
    }
    if (hasHalfStar) {
      stars.push('☆')
    }
    while (stars.length < 5) {
      stars.push('☆')
    }
    return stars
  }
  hasSpecifications(): boolean {
    return !!(
      this.product?.specifications &&
      Object.keys(this.product.specifications).length > 0
    )
  }
  getSpecifications(): { key: string; value: any }[] {
    if (!this.product?.specifications) return []
    return Object.entries(this.product.specifications).map(([key, value]) => ({
      key,
      value,
    }))
  }
  getProductImageUrl(imagePath?: string): string {
    return this.imageUrlService.getProductImageUrl(imagePath)
  }
}
