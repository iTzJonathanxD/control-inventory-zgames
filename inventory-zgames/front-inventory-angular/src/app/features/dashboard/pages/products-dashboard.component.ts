import { Component, CUSTOM_ELEMENTS_SCHEMA,OnInit } from '@angular/core'
import { ProductStatsComponent } from '../components/product-stats/product-stats.component'
import { SalesOverviewComponent } from '../components/sales-overview/sales-overview.component'
import { LowStockProductsComponent } from '../components/low-stock-products/low-stock-products.component'
import { RouterLink } from '@angular/router'
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap'
import { CommonModule } from '@angular/common'
import { ProductService } from '@core/services/api/product.service'
import { TranslateModule } from '@ngx-translate/core'
@Component({
  selector: 'app-products-dashboard',
  standalone: true,
  imports: [
    ProductStatsComponent,
    SalesOverviewComponent,
    LowStockProductsComponent,
    NgbDropdownModule,
    CommonModule,
    TranslateModule,
  ],
  templateUrl: './products-dashboard.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ProductsDashboardComponent implements OnInit {
  showAlerts = false
  lowStockCount = 0
  constructor(private productService: ProductService) {}
  ngOnInit() {
    this.checkLowStockAlerts()
  }
  private checkLowStockAlerts() {
    this.productService.findLowStockProducts().subscribe({
      next: (response) => {
        if (response.data.length > 0) {
          this.lowStockCount = response.data.length
          this.showAlerts = true
        }
      },
      error: (error) => {
        console.error('Error checking low stock alerts:', error)
      },
    })
  }
  dismissAlert() {
    this.showAlerts = false
  }
}
