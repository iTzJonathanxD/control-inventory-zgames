import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { OrderService } from '../../../../core/services/api/order.service'
import { PaymentService } from '../../../../core/services/api/payment.service'
import { CartService } from '../../../../core/services/api/cart.service'
import { ToastrNotificationService } from '../../../../core/services/ui/notification.service'
import { Order } from '../../../../core/interfaces/api/order.model'
import {
  PaymentMethod,
  CreatePaymentDto,
} from '../../../../core/interfaces/api/payment.model'
import { ImageUrlService } from '../../../../core/services/ui/image-url.service'
@Component({
  selector: 'app-payment-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './payment-form.component.html',
  styleUrls: ['./payment-form.component.scss'],
})
export class PaymentFormComponent implements OnInit {
  paymentForm: FormGroup
  order: Order | null = null
  selectedFiles: File[] = []
  isProcessing = false
  paymentMethods = [
    { value: PaymentMethod.BANK_TRANSFER, label: 'Transferencia Bancaria' },
    { value: PaymentMethod.CASH, label: 'Efectivo' },
  ]
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService,
    private paymentService: PaymentService,
    private cartService: CartService,
    private translate: TranslateService,
    private imageUrlService: ImageUrlService,
    private toastrService: ToastrNotificationService
  ) {
    this.paymentForm = this.fb.group({
      method: [PaymentMethod.BANK_TRANSFER, Validators.required],
      evidenceNotes: [''],
    })
  }
  ngOnInit() {
    const orderId = this.route.snapshot.params['id']
    if (orderId) {
      this.orderService.getOrderById(+orderId).subscribe({
        next: (order) => {
          this.order = order
        },
        error: (error) => {
          console.error('Error loading order:', error)
          this.router.navigate(['/orders'])
        },
      })
    }
  }
  onFileSelect(event: any) {
    const files = Array.from(event.target.files) as File[]
    if (this.selectedFiles.length + files.length > 5) {
      this.translate.get('PAYMENT.MAX_FILES').subscribe((message) => {
        alert(message)
      })
      return
    }
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        this.translate
          .get('PAYMENT.FILE_TOO_LARGE', { name: file.name })
          .subscribe((message) => {
            alert(message)
          })
        continue
      }
      if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
        this.translate
          .get('PAYMENT.INVALID_FORMAT', { name: file.name })
          .subscribe((message) => {
            alert(message)
          })
        continue
      }
      this.selectedFiles.push(file)
    }
    event.target.value = ''
  }
  removeFile(index: number) {
    this.selectedFiles.splice(index, 1)
  }
  onSubmit() {
    if (this.paymentForm.valid && this.order && this.selectedFiles.length > 0) {
      console.log('Starting payment process...')
      this.isProcessing = true
      const paymentData: CreatePaymentDto = {
        orderId: this.order.id,
        amount: this.order.totalAmount,
        method: this.paymentForm.value.method,
        evidenceNotes: this.paymentForm.value.evidenceNotes,
      }
      console.log('Sending payment data:', paymentData)
      console.log('Files to upload:', this.selectedFiles.length)
      this.paymentService
        .createPayment(paymentData, this.selectedFiles)
        .subscribe({
          next: (payment) => {
            console.log('Payment created successfully:', payment)
            this.cartService.forceCartCleanup()
            this.toastrService.showSuccess('¡Pago enviado correctamente!')
            this.isProcessing = false
            this.router.navigate(['/user-products'])
          },
          error: (error) => {
            console.error('Error creating payment:', error)
            this.toastrService.showError(
              'Error processing payment. Please try again.',
              'Payment Error'
            )
            this.isProcessing = false
          },
          complete: () => {
            this.isProcessing = false
          },
        })
    } else {
      console.error('Form invalid or missing files')
      if (!this.paymentForm.valid) {
        console.error('Form errors:', this.paymentForm.errors)
      }
      if (this.selectedFiles.length === 0) {
        console.error('No files selected')
      }
    }
  }
  getEvidenceImageUrl(imagePath: string): string {
    return this.imageUrlService.getEvidenceImageUrl(imagePath)
  }
  previewImage(file: File): string {
    return URL.createObjectURL(file)
  }
}
