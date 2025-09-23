import { CommonModule } from '@angular/common'
import { Component, inject, OnInit } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { NgbModule } from '@ng-bootstrap/ng-bootstrap'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { Router } from '@angular/router'
import { ProductService } from '../../../../core/services/api/product.service'
import { ToastrNotificationService } from '../../../../core/services/ui/notification.service'
import { Product } from '../../../../core/interfaces/api/product.interface'
import { environment } from '../../../../../environments/environment'
import { CartService } from '@core/services/api/cart.service'
import { ImageUrlService } from '../../../../core/services/ui/image-url.service'
import { LoadingSpinnerComponent } from '../../../../shared/components/ui/loading-spinner/loading-spinner.component'
import { AddToCartDto } from '@core/interfaces/api/cart.model'
@Component({
  selector: 'app-product-catalog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    NgbModule,
    LoadingSpinnerComponent,
  ],
  templateUrl: './product-catalog.component.html',
  styleUrls: ['./product-catalog.component.scss'],
})
export class ProductCatalogComponent implements OnInit {
  products: Product[] = []
  filteredProducts: Product[] = []
  categories: string[] = []
  searchTerm = ''
  selectedCategory = ''
  sortBy = 'productName'
  minPrice = 0
  maxPrice = 1000
  isLoading = true
  isAddingToCart: { [key: number]: boolean } = {}
  private router = inject(Router)
  private productService = inject(ProductService)
  private cartService = inject(CartService)
  private notificationService = inject(ToastrNotificationService)
  private translateService = inject(TranslateService)
  private imageUrlService = inject(ImageUrlService)
  ngOnInit(): void {
    this.loadProducts()
    this.cartService.getUserCart().subscribe()
  }
  private loadProducts(): void {
    this.isLoading = true
    this.productService.getProducts().subscribe({
      next: (response) => {
        const products = response.data?.result || []
        this.products = products.filter((p: Product) => p.stockCurrent > 0) // Solo productos con stock
        this.filteredProducts = [...this.products]
        this.categories = [
          ...new Set(
            products
              .map((p: Product) => p.category?.categoryName)
              .filter(Boolean)
          ),
        ] as string[]
        this.updatePriceRange()
        this.isLoading = false
      },
      error: (error: any) => {
        console.error('Error loading products:', error)
        this.notificationService.showError('Error al cargar los productos')
        this.isLoading = false
      },
    })
  }
  private updatePriceRange(): void {
    if (this.products.length > 0) {
      const prices = this.products.map((p) => p.unitPrice)
      this.minPrice = Math.floor(Math.min(...prices))
      this.maxPrice = Math.ceil(Math.max(...prices))
    }
  }
  onSearch(): void {
    this.applyFilters()
  }
  onCategoryChange(): void {
    this.applyFilters()
  }
  onSortChange(): void {
    this.applyFilters()
  }
  onPriceRangeChange(): void {
    this.applyFilters()
  }
  private applyFilters(): void {
    let filtered = [...this.products]
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase()
      filtered = filtered.filter(
        (product) =>
          product.productName.toLowerCase().includes(term) ||
          product.description?.toLowerCase().includes(term) ||
          product.category?.categoryName.toLowerCase().includes(term)
      )
    }
    if (this.selectedCategory) {
      filtered = filtered.filter(
        (product) => product.category?.categoryName === this.selectedCategory
      )
    }
    filtered = filtered.filter(
      (product) =>
        product.unitPrice >= this.minPrice && product.unitPrice <= this.maxPrice
    )
    filtered.sort((a, b) => {
      switch (this.sortBy) {
        case 'unitPrice-asc':
          return a.unitPrice - b.unitPrice
        case 'unitPrice-desc':
          return b.unitPrice - a.unitPrice
        case 'stockCurrent':
          return b.stockCurrent - a.stockCurrent
        case 'productName':
        default:
          return a.productName.localeCompare(b.productName)
      }
    })
    this.filteredProducts = filtered
  }
  addToCart(product: Product, quantity: number = 1): void {
    if (!product.id) return
    if (quantity > product.stockCurrent) {
      const errorMessage = this.translateService.instant(
        'CART.INSUFFICIENT_STOCK'
      )
      this.notificationService.showError(errorMessage)
      return
    }
    this.isAddingToCart[product.id] = true
    const addToCartDto: AddToCartDto = {
      productId: product.id,
      quantity: quantity,
    }
    this.cartService.addToCart(addToCartDto).subscribe({
      next: () => {
        const successMessage = this.translateService.instant(
          'USER_PRODUCTS.PRODUCT_ADDED'
        )
        this.notificationService.showSuccess(successMessage)
        product.stockCurrent -= quantity
        if (product.id) {
          this.quantities[product.id] = 1
          this.isAddingToCart[product.id] = false
        }
        this.loadProducts()
      },
      error: (error: any) => {
        console.error('Error adding to cart:', error)
        const errorMessage =
          error.error?.message ||
          this.translateService.instant('GLOBAL.NOTIFICATIONS.ERROR')
        this.notificationService.showError(errorMessage)
        if (product.id) {
          this.isAddingToCart[product.id] = false
        }
      },
    })
  }
  getProductImageUrl(imagePath: string | null): string {
    return this.imageUrlService.getProductImageUrl(imagePath)
  }
  clearFilters(): void {
    this.searchTerm = ''
    this.selectedCategory = ''
    this.sortBy = 'productName'
    this.updatePriceRange()
    this.applyFilters()
  }
  getStockBadgeClass(stock: number): string {
    if (stock === 0) return 'bg-danger'
    if (stock <= 5) return 'bg-warning'
    return 'bg-success'
  }
  getStockText(stock: number): string {
    if (stock === 0) return 'USER_PRODUCTS.OUT_OF_STOCK'
    if (stock <= 5) return 'USER_PRODUCTS.LOW_STOCK'
    return 'USER_PRODUCTS.IN_STOCK'
  }
  getStockTextClass(stock: number): string {
    if (stock === 0) return 'text-danger'
    if (stock <= 5) return 'text-warning'
    return 'text-success'
  }
  private quantities: { [key: number]: number } = {}
  getQuantity(productId: number): number {
    return this.quantities[productId] || 1
  }
  setQuantity(productId: number, event: any): void {
    const value = parseInt(event.target.value) || 1
    const product = this.products.find((p) => p.id === productId)
    if (product) {
      this.quantities[productId] = Math.min(
        Math.max(1, value),
        product.stockCurrent
      )
    }
  }
  increaseQuantity(productId: number): void {
    const product = this.products.find((p) => p.id === productId)
    if (product) {
      const current = this.getQuantity(productId)
      if (current < product.stockCurrent) {
        this.quantities[productId] = current + 1
      }
    }
  }
  decreaseQuantity(productId: number): void {
    const current = this.getQuantity(productId)
    if (current > 1) {
      this.quantities[productId] = current - 1
    }
  }
  trackByProductId(_index: number, product: Product): number {
    return product.id || 0
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
