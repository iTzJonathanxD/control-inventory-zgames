import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ActivatedRoute, Router, RouterModule } from '@angular/router'
import { TranslateModule } from '@ngx-translate/core'
import { OrderService } from '../../../../core/services/api/order.service'
import { Order, OrderStatus } from '../../../../core/interfaces/api/order.model'
import {
  Payment,
  PaymentStatus,
} from '../../../../core/interfaces/api/payment.model'
import { ImageUrlService } from '../../../../core/services/ui/image-url.service'
import { LoadingSpinnerComponent } from '../../../../shared/components/ui/loading-spinner/loading-spinner.component'
@Component({
  selector: 'app-order-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    LoadingSpinnerComponent,
  ],
  templateUrl: './order-details.component.html',
  styleUrls: ['./order-details.component.scss'],
})
export class OrderDetailsComponent implements OnInit {
  order: Order | null = null
  isLoading = true
  selectedImage: string | null = null
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService,
    private imageUrlService: ImageUrlService
  ) {}
  ngOnInit() {
    this.route.params.subscribe((params) => {
      const orderId = +params['id']
      if (orderId) {
        this.loadOrderDetails(orderId)
      }
    })
  }
  loadOrderDetails(orderId: number) {
    this.isLoading = true
    this.orderService.getOrderById(orderId).subscribe({
      next: (order) => {
        this.order = order
        this.isLoading = false
      },
      error: (error) => {
        console.error('Error loading order details:', error)
        this.isLoading = false
        this.router.navigate(['/orders'])
      },
    })
  }
  getOrderPayments(): Payment[] {
    return (this.order?.payments as Payment[]) || []
  }
  getOrderStatusClass(status: OrderStatus): string {
    const classes = {
      [OrderStatus.PENDING]: 'status-pending',
      [OrderStatus.CONFIRMED]: 'status-confirmed',
      [OrderStatus.PROCESSING]: 'status-processing',
      [OrderStatus.SHIPPED]: 'status-shipped',
      [OrderStatus.DELIVERED]: 'status-delivered',
      [OrderStatus.CANCELLED]: 'status-cancelled',
      [OrderStatus.REFUNDED]: 'status-refunded',
    }
    return classes[status] || 'status-pending'
  }
  getOrderStatusText(status: OrderStatus): string {
    const statusMap = {
      pending: 'Pendiente',
      confirmed: 'Confirmada',
      processing: 'Procesando',
      shipped: 'Enviada',
      delivered: 'Entregada',
      cancelled: 'Cancelada',
      refunded: 'Reembolsada',
    }
    return statusMap[status] || status
  }
  getPaymentStatusClass(status: PaymentStatus | string): string {
    const classes: Record<string, string> = {
      pending: 'payment-pending',
      processing: 'payment-processing',
      completed: 'payment-completed',
      failed: 'payment-failed',
      cancelled: 'payment-cancelled',
      refunded: 'payment-refunded',
    }
    return classes[status as string] || 'payment-pending'
  }
  getPaymentStatusText(status: PaymentStatus | string): string {
    const statusMap: Record<string, string> = {
      pending: 'Pendiente',
      processing: 'Procesando',
      completed: 'Completado',
      failed: 'Fallido',
      cancelled: 'Cancelado',
      refunded: 'Reembolsado',
    }
    return statusMap[status as string] || status
  }
  getPaymentMethodText(method: string): string {
    const texts: Record<string, string> = {
      credit_card: 'Tarjeta de Crédito',
      debit_card: 'Tarjeta de Débito',
      paypal: 'PayPal',
      bank_transfer: 'Transferencia Bancaria',
      cash: 'Efectivo',
    }
    return texts[method] || method
  }
  canCancelOrder(): boolean {
    if (!this.order) return false
    return [OrderStatus.PENDING, OrderStatus.CONFIRMED].includes(
      this.order.status
    )
  }
  cancelOrder() {
    if (
      !this.order ||
      !confirm('¿Estás seguro de que quieres cancelar esta orden?')
    ) {
      return
    }
    this.orderService.cancelOrder(this.order.id).subscribe({
      next: (updatedOrder) => {
        this.order = updatedOrder
        alert('Orden cancelada exitosamente')
      },
      error: (error) => {
        console.error('Error canceling order:', error)
        alert('Error al cancelar la orden')
      },
    })
  }
  getProductImageUrl(imagePath?: string): string {
    return this.imageUrlService.getProductImageUrl(imagePath)
  }
  getEvidenceImageUrl(imagePath: string): string {
    return this.imageUrlService.getEvidenceImageUrl(imagePath)
  }
  openImageModal(imageUrl: string) {
    this.selectedImage = imageUrl
  }
  closeImageModal() {
    this.selectedImage = null
  }
  goBack() {
    this.router.navigate(['/orders'])
  }
}
