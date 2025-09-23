import { Component, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import {
  ReactiveFormsModule,
  FormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms'
import { Router, RouterModule } from '@angular/router'
import { TranslateModule } from '@ngx-translate/core'
import { CartService } from '../../../../core/services/api/cart.service'
import { OrderService } from '../../../../core/services/api/order.service'
import { Cart } from '../../../../core/interfaces/api/cart.model'
import { CreateOrderDto } from '../../../../core/interfaces/api/order.model'
import { environment } from '../../../../../environments/environment'
import { ImageUrlService } from '../../../../core/services/ui/image-url.service'
@Component({
  selector: 'app-checkout-view',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    TranslateModule,
    RouterModule,
  ],
  templateUrl: './checkout-view.component.html',
  styleUrls: ['./checkout-view.component.scss'],
})
export class CheckoutViewComponent implements OnInit {
  checkoutForm: FormGroup
  cart: Cart | null = null
  isProcessing = false
  sameAsShipping = true
  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private orderService: OrderService,
    private router: Router,
    private imageUrlService: ImageUrlService
  ) {
    this.checkoutForm = this.fb.group({
      shippingAddress: this.fb.group({
        street: [''],
        city: [''],
        state: [''],
        zipCode: [''],
        country: [''],
      }),
      billingAddress: this.fb.group({
        street: [''],
        city: [''],
        state: [''],
        zipCode: [''],
        country: [''],
      }),
      notes: [''],
    })
  }
  ngOnInit() {
    this.cartService.cart$.subscribe((cart) => {
      this.cart = cart
      if (!cart || cart.items.length === 0) {
        this.router.navigate(['/cart'])
      }
    })
    this.cartService.getUserCart().subscribe()
  }
  getFieldError(fieldPath: string): string | null {
    const field = this.getNestedFormControl(fieldPath)
    if (field && field.invalid && (field.dirty || field.touched)) {
      if (field.errors?.['required']) {
        return 'Este campo es requerido'
      }
    }
    return null
  }
  private getNestedFormControl(path: string) {
    const keys = path.split('.')
    let control: any = this.checkoutForm
    for (const key of keys) {
      control = control.get(key)
      if (!control) break
    }
    return control
  }
  onSameAsShippingChange() {
    const billingAddress = this.checkoutForm.get('billingAddress')
    const shippingAddress = this.checkoutForm.get('shippingAddress')
    if (this.sameAsShipping && billingAddress && shippingAddress) {
      billingAddress.patchValue(shippingAddress.value)
      billingAddress.clearValidators()
    } else if (billingAddress) {
      const billingGroup = billingAddress as FormGroup
      Object.keys(billingGroup.controls).forEach((key) => {
        billingGroup.get(key)?.clearValidators()
        billingGroup.get(key)?.updateValueAndValidity()
      })
    }
  }
  trackByItemId(index: number, item: any): any {
    return item.id || index
  }
  getProductImageUrl(imagePath: string | undefined): string {
    return this.imageUrlService.getProductImageUrl(imagePath)
  }
  getFinalTotal(subtotal: number): number {
    return subtotal
  }
  onSubmit() {
    if (this.cart) {
      console.log('Starting checkout process...')
      this.isProcessing = true
      const processAddress = (address: any) => {
        return {
          street: address.street || 'N/A',
          city: address.city || 'N/A',
          state: address.state || 'N/A',
          zipCode: address.zipCode || 'N/A',
          country: address.country || 'N/A',
        }
      }
      const shippingAddress = processAddress(
        this.checkoutForm.value.shippingAddress
      )
      const billingAddress = this.sameAsShipping
        ? shippingAddress
        : processAddress(this.checkoutForm.value.billingAddress)
      const orderData: CreateOrderDto = {
        shippingAddress: shippingAddress,
        billingAddress: billingAddress,
        notes: this.checkoutForm.value.notes || 'N/A',
      }
      console.log('Sending order data:', orderData)
      this.orderService.createFromCart(orderData).subscribe({
        next: (order) => {
          console.log('Order created successfully:', order)
          this.isProcessing = false
          this.router.navigate(['/payment', order.id]).then((success) => {
            if (success) {
              console.log('Navigation to payment successful')
            } else {
              console.error('Navigation to payment failed')
            }
          })
        },
        error: (error) => {
          console.error('Error creating order:', error)
          alert('Error al crear la orden. Por favor intenta de nuevo.')
          this.isProcessing = false
        },
        complete: () => {
          this.isProcessing = false
        },
      })
    } else {
      console.error('No cart found')
    }
  }
}
