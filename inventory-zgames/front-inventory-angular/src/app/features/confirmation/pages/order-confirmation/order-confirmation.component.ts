import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule, ActivatedRoute } from '@angular/router'
import { TranslateModule } from '@ngx-translate/core'
import { OrderService } from '../../../../core/services/api/order.service'
import { Order } from '../../../../core/interfaces/api/order.model'
import { ImageUrlService } from '../../../../core/services/ui/image-url.service'
@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './order-confirmation.component.html',
  styleUrls: ['./order-confirmation.component.scss'],
})
export class OrderConfirmationComponent implements OnInit {
  order: Order | null = null
  isLoading = true
  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
    private imageUrlService: ImageUrlService
  ) {}
  ngOnInit() {
    const orderId = this.route.snapshot.paramMap.get('id')
    if (orderId) {
      this.loadOrder(parseInt(orderId))
    }
  }
  loadOrder(orderId: number) {
    this.isLoading = true
    this.orderService.getOrderById(orderId).subscribe({
      next: (order) => {
        this.order = order
        this.isLoading = false
      },
      error: (error) => {
        console.error('Error loading order:', error)
        this.isLoading = false
      },
    })
  }
  getProductImageUrl(imagePath?: string): string {
    return this.imageUrlService.getProductImageUrl(imagePath)
  }
  downloadReceipt() {
    if (this.order) {
      console.log('Downloading receipt for order:', this.order.id)
    }
  }
}
