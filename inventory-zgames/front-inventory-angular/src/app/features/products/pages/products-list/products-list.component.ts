import { Component, inject, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { Router } from '@angular/router'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import {
  NgbModule,
  NgbTooltipModule,
  NgbPaginationModule,
  NgbModal,
} from '@ng-bootstrap/ng-bootstrap'
import { Product } from '@core/interfaces/api/product.interface'
import { ProductService } from '@core/services/api/product.service'
import { MovementService } from '@core/services/api/movement.service'
import { ToastrNotificationService } from '@core/services/ui/notification.service'
import { PageTitleComponent } from '@/app/shared/components/layouts/page-title/page-title.component'
import { environment } from '@environment/environment'
import { ImageUrlService } from '../../../../core/services/ui/image-url.service'
import { LoadingSpinnerComponent } from '../../../../shared/components/ui/loading-spinner/loading-spinner.component'
import {
  MovementType,
  CreateMovementDto,
} from '@core/interfaces/api/movement.interface'
import { InventoryMovementModalComponent } from '../../../../shared/components/modals/inventory-movement-modal/inventory-movement-modal.component'
@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    NgbModule,
    NgbTooltipModule,
    NgbPaginationModule,
    PageTitleComponent,
    LoadingSpinnerComponent,
  ],
  templateUrl: './products-list.component.html',
  styleUrls: ['./products-list.component.scss'],
})
export class ProductsListComponent implements OnInit {
  public readonly Math = Math
  private router = inject(Router)
  private productService = inject(ProductService)
  private movementService = inject(MovementService)
  private modalService = inject(NgbModal)
  private notificationService = inject(ToastrNotificationService)
  private imageUrlService = inject(ImageUrlService)
  private translateService = inject(TranslateService)
  products: Product[] = []
  filteredProducts: Product[] = []
  categories: any[] = []
  isLoading = false
  currentPage = 1
  itemsPerPage = 10
  totalItems = 0
  searchTerm = ''
  selectedCategory = ''
  sortBy = 'productName'
  ngOnInit() {
    this.loadProducts()
  }
  loadProducts() {
    this.isLoading = true
    const minLoadingTime = 800
    const startTime = Date.now()
    this.productService.getProducts().subscribe({
      next: (response) => {
        this.products = response.data?.result || []
        this.filteredProducts = [...this.products]
        this.extractCategories()
        const elapsedTime = Date.now() - startTime
        const remainingTime = Math.max(0, minLoadingTime - elapsedTime)
        setTimeout(() => {
          this.isLoading = false
        }, remainingTime)
      },
      error: (error) => {
        console.error('Error loading products:', error)
        const elapsedTime = Date.now() - startTime
        const remainingTime = Math.max(0, minLoadingTime - elapsedTime)
        setTimeout(() => {
          this.isLoading = false
        }, remainingTime)
      },
    })
  }
  private extractCategories() {
    const categorySet = new Set()
    this.products.forEach((product) => {
      if (product.category) {
        categorySet.add(JSON.stringify(product.category))
      }
    })
    this.categories = Array.from(categorySet).map((cat) =>
      JSON.parse(cat as string)
    )
  }
  navigateToCreate() {
    this.router.navigate(['/products-management/create'])
  }
  viewProduct(id: number) {
    this.router.navigate(['/products-management/view', id])
  }
  editProduct(id: number) {
    this.router.navigate(['/products-management/edit', id])
  }
  deleteProduct(id: number) {
    if (confirm('¿Está seguro de que desea eliminar este producto?')) {
      this.productService.deleteProduct(id).subscribe({
        next: () => {
          this.loadProducts()
          this.notificationService.showNotification({
            title: 'Éxito',
            message: 'Producto eliminado correctamente',
            type: 'success',
          })
        },
        error: (error) => {
          console.error('Error deleting product:', error)
        },
      })
    }
  }
  onSearch() {
    this.applyFilters()
  }
  onCategoryFilter() {
    this.applyFilters()
  }
  onSort() {
    this.applyFilters()
  }
  clearFilters() {
    this.searchTerm = ''
    this.selectedCategory = ''
    this.sortBy = 'productName'
    this.applyFilters()
  }
  private applyFilters() {
    let filtered = [...this.products]
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase()
      filtered = filtered.filter(
        (product) =>
          product.productName.toLowerCase().includes(term) ||
          product.codeName?.toLowerCase().includes(term) ||
          product.description?.toLowerCase().includes(term)
      )
    }
    if (this.selectedCategory) {
      filtered = filtered.filter(
        (product) => product.category?.id?.toString() === this.selectedCategory
      )
    }
    filtered.sort((a, b) => {
      switch (this.sortBy) {
        case 'unitPrice':
          return a.unitPrice - b.unitPrice
        case 'stockCurrent':
          return b.stockCurrent - a.stockCurrent
        case 'productName':
        default:
          return a.productName.localeCompare(b.productName)
      }
    })
    this.totalItems = filtered.length
    this.filteredProducts = filtered
  }
  getProductImageUrl(imagePath: string | null): string {
    return this.imageUrlService.getProductImageUrl(imagePath)
  }
  getStatusBadgeClass(product: Product): string {
    if (!product.isActive) return 'status-inactive'
    if (product.stockCurrent === 0) return 'status-out-of-stock'
    if (product.stockCurrent <= 5) return 'status-low-stock'
    return 'status-in-stock'
  }
  getStatusText(product: Product): string {
    if (!product.isActive) return 'Inactivo'
    if (product.stockCurrent === 0) return 'Sin stock'
    if (product.stockCurrent <= 5) return 'Poco stock'
    return 'En stock'
  }
  getStockClass(stock: number): string {
    if (stock === 0) return 'stock-empty'
    if (stock <= 5) return 'stock-low'
    return 'stock-good'
  }
  trackByProductId(index: number, product: Product): number {
    return product.id || index
  }
  quickView(product: Product) {
    console.log('Quick view:', product)
  }
  cloneProduct(id: number) {
    this.router.navigate(['/products-management/create'], {
      queryParams: { clone: id },
    })
  }
  onPageChange(page: number): void {
    this.currentPage = page
  }
  onItemsPerPageChange(itemsPerPage: number): void {
    this.itemsPerPage = itemsPerPage
    this.currentPage = 1
  }
  reloadTable(): void {
    this.loadProducts()
  }
  getStockBadgeClass(stock: number): string {
    if (stock === 0) return 'bg-danger'
    if (stock <= 5) return 'bg-warning text-dark'
    return 'bg-success'
  }
  openEntryModal(product: Product): void {
    const modalRef = this.modalService.open(InventoryMovementModalComponent, {
      size: 'lg',
      centered: true,
      backdrop: 'static',
    })
    modalRef.componentInstance.setData({
      product: product,
      movementType: MovementType.ENTRY,
      mode: 'quick',
    })
    modalRef.result.then(
      (result) => {
        if (result) {
          this.loadProducts() // Recargar productos para actualizar stock
        }
      },
      () => {
      }
    )
  }
  openExitModal(product: Product): void {
    if (product.stockCurrent <= 0) {
      this.notificationService.showWarning(
        this.translateService.instant(
          'INVENTORY.MESSAGES.EXIT.INSUFFICIENT_STOCK_MESSAGE'
        ),
        this.translateService.instant(
          'INVENTORY.MESSAGES.EXIT.INSUFFICIENT_STOCK_TITLE'
        )
      )
      return
    }
    const modalRef = this.modalService.open(InventoryMovementModalComponent, {
      size: 'lg',
      centered: true,
      backdrop: 'static',
    })
    modalRef.componentInstance.setData({
      product: product,
      movementType: MovementType.EXIT,
      mode: 'quick',
    })
    modalRef.result.then(
      (result) => {
        if (result) {
          this.loadProducts() // Recargar productos para actualizar stock
        }
      },
      () => {
      }
    )
  }
}
