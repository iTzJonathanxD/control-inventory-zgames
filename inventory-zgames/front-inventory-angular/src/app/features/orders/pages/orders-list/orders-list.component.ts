import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Router, RouterModule } from '@angular/router'
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
  selector: 'app-orders-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    LoadingSpinnerComponent,
  ],
  templateUrl: './orders-list.component.html',
  styleUrls: ['./orders-list.component.scss'],
})
export class OrdersListComponent implements OnInit {
  orders: Order[] = []
  isLoading = true
  constructor(
    private orderService: OrderService,
    private router: Router,
    private imageUrlService: ImageUrlService
  ) {}
  ngOnInit() {
    this.loadOrders()
  }
  loadOrders() {
    this.isLoading = true
    const minLoadingTime = 800
    const startTime = Date.now()
    this.orderService.getUserOrders().subscribe({
      next: (orders) => {
        this.orders = orders
        console.log('Orders loaded:', orders) // Debug log
        const elapsedTime = Date.now() - startTime
        const remainingTime = Math.max(0, minLoadingTime - elapsedTime)
        setTimeout(() => {
          this.isLoading = false
        }, remainingTime)
      },
      error: (error) => {
        console.error('Error loading orders:', error)
        const elapsedTime = Date.now() - startTime
        const remainingTime = Math.max(0, minLoadingTime - elapsedTime)
        setTimeout(() => {
          this.isLoading = false
        }, remainingTime)
      },
    })
  }
  getOrderPayments(orderId: number): Payment[] {
    const order = this.orders.find((o) => o.id === orderId)
    return (order?.payments as Payment[]) || []
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
  canMakePayment(order: Order): boolean {
    return order.status === OrderStatus.PENDING
  }
  canCancelOrder(order: Order): boolean {
    return [OrderStatus.PENDING, OrderStatus.CONFIRMED].includes(order.status)
  }
  cancelOrder(orderId: number) {
    if (confirm('¿Estás seguro de que quieres cancelar esta orden?')) {
      this.orderService.cancelOrder(orderId).subscribe({
        next: (updatedOrder) => {
          const orderIndex = this.orders.findIndex(
            (order) => order.id === orderId
          )
          if (orderIndex !== -1) {
            this.orders[orderIndex] = updatedOrder
          }
          alert('Orden cancelada exitosamente')
        },
        error: (error) => {
          console.error('Error canceling order:', error)
          alert('Error al cancelar la orden')
        },
      })
    }
  }
  trackByOrderId(index: number, order: Order): number {
    return order.id
  }
  viewOrderDetails(orderId: number) {
    this.router.navigate(['/orders', orderId])
  }
  getProductImageUrl(imagePath?: string): string {
    return this.imageUrlService.getProductImageUrl(imagePath)
  }
  getOverallPaymentStatusClass(orderId: number): string {
    const payments = this.getOrderPayments(orderId)
    if (payments.length === 0) {
      return 'payment-none'
    }
    const hasCompleted = payments.some(
      (p) => p.status === PaymentStatus.COMPLETED || p.status === 'completed'
    )
    const hasPending = payments.some(
      (p) => p.status === PaymentStatus.PENDING || p.status === 'pending'
    )
    const hasProcessing = payments.some(
      (p) => p.status === PaymentStatus.PROCESSING || p.status === 'processing'
    )
    const hasFailed = payments.some(
      (p) => p.status === PaymentStatus.FAILED || p.status === 'failed'
    )
    if (hasCompleted) return 'payment-completed'
    if (hasProcessing) return 'payment-processing'
    if (hasPending) return 'payment-pending'
    if (hasFailed) return 'payment-failed'
    return 'payment-none'
  }
  getOverallPaymentStatusText(orderId: number): string {
    const payments = this.getOrderPayments(orderId)
    if (payments.length === 0) {
      return 'Sin Pago'
    }
    const hasCompleted = payments.some(
      (p) => p.status === PaymentStatus.COMPLETED || p.status === 'completed'
    )
    const hasPending = payments.some(
      (p) => p.status === PaymentStatus.PENDING || p.status === 'pending'
    )
    const hasProcessing = payments.some(
      (p) => p.status === PaymentStatus.PROCESSING || p.status === 'processing'
    )
    const hasFailed = payments.some(
      (p) => p.status === PaymentStatus.FAILED || p.status === 'failed'
    )
    if (hasCompleted) return 'Pagado'
    if (hasProcessing) return 'Procesando'
    if (hasPending) return 'Pendiente'
    if (hasFailed) return 'Fallido'
    return 'Sin Pago'
  }
}
