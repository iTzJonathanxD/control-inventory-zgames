import { Component, inject, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms'
import { Router } from '@angular/router'
import { TranslateModule } from '@ngx-translate/core'
import { ProductService } from '@core/services/api/product.service'
import { CategoryService } from '@core/services/api/category.service'
import { ToastrNotificationService } from '@core/services/ui/notification.service'
import { Category } from '@core/interfaces/api/category.interface'
import { CreateProductRequest } from '@core/interfaces/api/product.interface'
import { LoadingSpinnerComponent } from '../../../../shared/components/ui/loading-spinner/loading-spinner.component'
@Component({
  selector: 'app-product-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './product-create.component.html',
  styleUrls: ['./product-create.component.scss'],
})
export class ProductCreateComponent implements OnInit {
  private fb = inject(FormBuilder)
  private router = inject(Router)
  private productService = inject(ProductService)
  private categoryService = inject(CategoryService)
  private notificationService = inject(ToastrNotificationService)
  productForm!: FormGroup
  categories: Category[] = []
  loading = false
  selectedImage: File | null = null
  imagePreview: string | null = null
  ngOnInit() {
    this.initForm()
    this.loadCategories()
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
  onSubmit() {
    if (this.productForm.valid) {
      this.loading = true
      const formValue = this.productForm.value
      const formData = new FormData()
      formData.append('productName', formValue.productName)
      formData.append('codeName', formValue.codeName)
      formData.append('description', formValue.description)
      formData.append('stockMin', Number(formValue.stockMin).toString())
      formData.append('stockCurrent', Number(formValue.stockCurrent).toString())
      formData.append('unitPrice', Number(formValue.unitPrice || 0).toString())
      formData.append('categoryId', Number(formValue.categoryId).toString())
      formData.append('isActive', Boolean(formValue.isActive).toString())
      if (formValue.weight) {
        formData.append('weight', Number(formValue.weight).toString())
      }
      if (this.selectedImage) {
        formData.append('image', this.selectedImage)
      }
      this.productService.createProductWithImage(formData).subscribe({
        next: (response) => {
          this.loading = false
          this.notificationService.showNotification({
            title: 'Éxito',
            message: 'Producto creado correctamente',
            type: 'success',
          })
          this.router.navigate(['/products-management'])
        },
        error: (error) => {
          this.loading = false
          console.error('Error creating product:', error)
          this.notificationService.showNotification({
            title: 'Error',
            message: 'Error al crear el producto',
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
  goBack() {
    this.router.navigate(['/products-management'])
  }
}
