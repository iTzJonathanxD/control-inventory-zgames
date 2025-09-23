import { Component, inject, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import { TranslateModule } from '@ngx-translate/core'
import { ProductService } from '@core/services/api/product.service'
import { CategoryService } from '@core/services/api/category.service'
import { ToastrNotificationService } from '@core/services/ui/notification.service'
import { Category } from '@core/interfaces/api/category.interface'
import {
  Product,
  UpdateProductRequest,
} from '@core/interfaces/api/product.interface'
import { ImageUrlService } from '../../../../core/services/ui/image-url.service'
import { LoadingSpinnerComponent } from '../../../../shared/components/ui/loading-spinner/loading-spinner.component'
@Component({
  selector: 'app-product-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    LoadingSpinnerComponent,
  ],
  templateUrl: './product-edit.component.html',
  styleUrls: ['./product-edit.component.scss'],
})
export class ProductEditComponent implements OnInit {
  private fb = inject(FormBuilder)
  private router = inject(Router)
  private route = inject(ActivatedRoute)
  private productService = inject(ProductService)
  private categoryService = inject(CategoryService)
  private notificationService = inject(ToastrNotificationService)
  private imageUrlService = inject(ImageUrlService)
  productForm!: FormGroup
  categories: Category[] = []
  product: Product | null = null
  productId!: number
  loading = false
  saving = false
  selectedImage: File | null = null
  imagePreview: string | null = null
  ngOnInit() {
    this.productId = parseInt(this.route.snapshot.paramMap.get('id') || '0')
    this.initForm()
    this.loadCategories()
    this.loadProduct()
  }
  initForm() {
    this.productForm = this.fb.group({
      productName: ['', [Validators.required, Validators.minLength(3)]],
      codeName: ['', [Validators.required]],
      description: ['', [Validators.required]],
      stockMin: [0, [Validators.required, Validators.min(0)]],
      stockCurrent: [0, [Validators.required, Validators.min(0)]],
      unitPrice: [0, [Validators.min(0)]],
      weight: [null, [Validators.min(0)]],
      rating: [null, [Validators.min(0), Validators.max(5)]],
      categoryId: ['', [Validators.required]],
      isActive: [true],
    })
  }
  loadCategories() {
    this.categoryService.getCategories().subscribe({
      next: (response) => {
        this.categories = response.data.result || []
      },
      error: (error) => {
        console.error('Error loading categories:', error)
      },
    })
  }
  loadProduct() {
    this.loading = true
    this.productService.getProductById(this.productId.toString()).subscribe({
      next: (response) => {
        this.product = response.data
        this.populateForm()
        this.loading = false
      },
      error: (error) => {
        console.error('Error loading product:', error)
        this.loading = false
        this.router.navigate(['/products-management'])
      },
    })
  }
  populateForm() {
    if (this.product) {
      this.productForm.patchValue({
        productName: this.product.productName,
        codeName: this.product.codeName,
        description: this.product.description,
        stockMin: this.product.stockMin,
        stockCurrent: this.product.stockCurrent,
        unitPrice: this.product.unitPrice,
        weight: this.product.weight,
        rating: this.product.rating,
        categoryId: this.product.categoryId,
        isActive: this.product.isActive,
      })
    }
  }
  onSubmit() {
    if (this.productForm.valid && this.product) {
      this.saving = true
      const formValue = this.productForm.value
      const productData: UpdateProductRequest = {
        id: this.productId,
        productName: formValue.productName,
        codeName: formValue.codeName,
        description: formValue.description,
        stockMin: formValue.stockMin,
        stockCurrent: formValue.stockCurrent,
        unitPrice: formValue.unitPrice || 0,
        categoryId: parseInt(formValue.categoryId),
        isActive: formValue.isActive,
        weight: formValue.weight || undefined,
        rating: formValue.rating || undefined,
      }
      this.productService.updateProduct(this.productId, productData).subscribe({
        next: (response) => {
          this.saving = false
          this.notificationService.showNotification({
            title: 'Éxito',
            message: 'Producto actualizado correctamente',
            type: 'success',
          })
          this.router.navigate(['/products-management'])
        },
        error: (error) => {
          this.saving = false
          console.error('Error updating product:', error)
          this.notificationService.showNotification({
            title: 'Error',
            message: 'Error al actualizar el producto',
            type: 'error',
          })
        },
      })
    }
  }
  onImageSelected(event: any) {
    const file = event.target.files[0]
    if (file) {
      this.selectedImage = file
      const reader = new FileReader()
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result
      }
      reader.readAsDataURL(file)
    }
  }
  removeImage() {
    this.selectedImage = null
    this.imagePreview = null
    const fileInput = document.getElementById('image') as HTMLInputElement
    if (fileInput) {
      fileInput.value = ''
    }
  }
  getProductImageUrl(imagePath?: string): string {
    return this.imageUrlService.getProductImageUrl(imagePath)
  }
  goBack() {
    this.router.navigate(['/products-management'])
  }
}
