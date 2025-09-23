import { Injectable } from '@angular/core'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import {
  Product,
  ProductModalData,
  ProductModalMode,
  CreateProductRequest,
  UpdateProductRequest,
} from '@core/interfaces/api/product.interface'
@Injectable({
  providedIn: 'root',
})
export class ProductFormService {
  private readonly FIELD_GROUPS = {
    editable: [
      'productName',
      'codeName',
      'description',
      'stockMin',
      'stockCurrent',
      'unitPrice',
      'categoryId',
      'isActive',
    ],
    readOnly: ['id', 'createdAt', 'updatedAt'],
  } as const
  private readonly VALIDATORS = {
    required: Validators.required,
    minLength3: Validators.minLength(3),
    min0: Validators.min(0),
    min1: Validators.min(1),
    pattern: {
      code: Validators.pattern(/^[A-Z0-9-_]+$/),
      price: Validators.pattern(/^\d+(\.\d{1,2})?$/),
    },
  } as const
  constructor(private fb: FormBuilder) {}
  createProductForm(): FormGroup {
    return this.fb.group({
      id: [{ value: '', disabled: true }],
      productName: ['', [this.VALIDATORS.required, this.VALIDATORS.minLength3]],
      codeName: ['', [this.VALIDATORS.required, this.VALIDATORS.pattern.code]],
      description: ['', this.VALIDATORS.required],
      stockMin: [0, [this.VALIDATORS.required, this.VALIDATORS.min0]],
      stockCurrent: [0, [this.VALIDATORS.required, this.VALIDATORS.min0]],
      unitPrice: [0, [this.VALIDATORS.required, this.VALIDATORS.min0]],
      categoryId: ['', this.VALIDATORS.required],
      isActive: [true],
      createdAt: [{ value: '', disabled: true }],
      updatedAt: [{ value: '', disabled: true }],
    })
  }
  patchProductForm(form: FormGroup, product: Product): void {
    form.patchValue({
      ...product,
      id: product.id || '',
      productName: product.productName || '',
      codeName: product.codeName || '',
      description: product.description || '',
      stockMin: product.stockMin || 0,
      stockCurrent: product.stockCurrent || 0,
      unitPrice: product.unitPrice || 0,
      categoryId: product.categoryId || '',
      isActive: product.isActive ?? true,
      createdAt: product.createdAt ? this.formatDate(product.createdAt) : '',
      updatedAt: product.updatedAt ? this.formatDate(product.updatedAt) : '',
    })
  }
  configureFormFields(form: FormGroup, mode: ProductModalMode): void {
    const configurations = {
      view: () =>
        this.toggleFields(form, Object.keys(form.controls) as string[], false),
      edit: () => this.toggleFields(form, this.FIELD_GROUPS.editable, true),
      create: () => {
        this.toggleFields(form, this.FIELD_GROUPS.editable, true)
        this.toggleFields(form, this.FIELD_GROUPS.readOnly, false)
      },
    }
    configurations[mode]?.()
  }
  buildProductData(formData: any): CreateProductRequest {
    return {
      productName: formData.productName?.trim() || '',
      codeName: formData.codeName?.trim().toUpperCase() || '',
      description: formData.description?.trim() || '',
      stockMin: Number(formData.stockMin) || 0,
      stockCurrent: Number(formData.stockCurrent) || 0,
      unitPrice: Number(formData.unitPrice) || 0,
      categoryId: Number(formData.categoryId),
      isActive: formData.isActive ?? true,
    }
  }
  buildUpdateProductData(
    formData: any,
    productId: number
  ): UpdateProductRequest {
    return {
      id: productId,
      productName: formData.productName?.trim() || '',
      codeName: formData.codeName?.trim().toUpperCase() || '',
      description: formData.description?.trim() || '',
      stockMin: Number(formData.stockMin) || 0,
      stockCurrent: Number(formData.stockCurrent) || 0,
      unitPrice: Number(formData.unitPrice) || 0,
      categoryId: Number(formData.categoryId),
      isActive: formData.isActive ?? true,
    }
  }
  private toggleFields(
    form: FormGroup,
    fields: readonly string[],
    enable: boolean
  ): void {
    fields.forEach((field) => {
      const control = form.get(field)
      enable ? control?.enable() : control?.disable()
    })
  }
  private formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString()
  }
}
