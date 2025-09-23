import { Component, inject, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap'
import { TranslateModule } from '@ngx-translate/core'
import {
  Payment,
  PaymentModalData,
  PaymentStatus,
} from '../../../../../core/interfaces/api/payment.model'
@Component({
  selector: 'app-payment-modal',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './payment-modal.component.html',
  styleUrl: './payment-modal.component.scss',
})
export class PaymentModalComponent implements OnInit {
  public payment?: Payment
  public mode: 'view' | 'edit' | 'create' | 'process' | 'reject' = 'view'
  public title: string = 'Payment Details'
  private readonly activeModal = inject(NgbActiveModal)
  ngOnInit(): void {}
  public setModalData(data: PaymentModalData): void {
    this.payment = data.payment
    this.mode = data.mode || 'view'
    this.title = data.title || 'Payment Details'
  }
  public closeModal(): void {
    this.activeModal.dismiss()
  }
  public confirmAction(): void {
    this.activeModal.close({ success: true, payment: this.payment })
  }
  public getPaymentStatusClass(status: PaymentStatus | string): string {
    const statusMap: Record<string, string> = {
      pending: 'badge-warning',
      processing: 'badge-info',
      completed: 'badge-success',
      failed: 'badge-danger',
      cancelled: 'badge-secondary',
      refunded: 'badge-dark',
    }
    return statusMap[status as string] || 'badge-secondary'
  }
  public getPaymentStatusText(status: PaymentStatus | string): string {
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
  public formatCurrency(amount: number | string): string {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
    return new Intl.NumberFormat('es-US', {
      style: 'currency',
      currency: 'USD',
    }).format(numAmount)
  }
}
