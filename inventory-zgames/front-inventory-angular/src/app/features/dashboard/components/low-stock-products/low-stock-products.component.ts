import { Component, OnInit } from "@angular/core"
import { ProductService } from '@core/services/api/product.service'
import { Product } from "@core/interfaces/api/product.interface"
import { CommonModule } from "@angular/common"
import { TranslateModule } from "@ngx-translate/core"
@Component({
  selector: "low-stock-products",
  standalone: true,
  imports: [CommonModule,TranslateModule],
  templateUrl: "./low-stock-products.component.html",
  styles: ``,
})
export class LowStockProductsComponent implements OnInit {
  lowStockProducts: Product[] = []
  loading = false
  constructor(private productService: ProductService) {}
  ngOnInit() {
    this.loadLowStockProducts()
  }
  private loadLowStockProducts() {
    this.loading = true
    this.productService.findLowStockProducts().subscribe({
      next: (response) => {
        if (response) {
          this.lowStockProducts = response.data
        }
        this.loading = false
      },
      error: (error) => {
        console.error("Error loading low stock products:", error)
        this.loading = false
      },
    })
  }
}
