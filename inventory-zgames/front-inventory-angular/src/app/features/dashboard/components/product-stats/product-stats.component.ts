import { Component, type OnInit } from "@angular/core"
import { ProductService } from '@core/services/api/product.service'
import {
  BestSellingProduct,
  DashboardStats,
  MonthlySalesData,
} from '@core/interfaces/api/dashboard.interface'
import { CommonModule } from "@angular/common"
import { TranslateModule } from "@ngx-translate/core"
@Component({
  selector: "product-stats",
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: "./product-stats.component.html",
  styles: ``,
})
export class ProductStatsComponent implements OnInit {
  stats: DashboardStats | null = null
  loading = false
  constructor(private productService: ProductService) {}
  ngOnInit() {
    this.loadStats()
  }
  private loadStats() {
    this.loading = true
    this.productService.getDashboardStats().subscribe({
      next: (response) => {
        if (response) {
          this.stats = response.data
        }
        this.loading = false
      },
      error: (error) => {
        console.error("Error loading dashboard stats:", error)
        this.loading = false
      },
    })
  }
}
