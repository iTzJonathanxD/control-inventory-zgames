import { Injectable } from '@angular/core'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { Category, CategoryFormData, CategoryModalMode } from '@core/interfaces/api/category.interface'
@Injectable({
  providedIn: 'root',
})
export class CategoryFormService {
  private readonly FIELD_GROUPS = {
    editable: ['categoryName', 'description', 'isActive'],
    readOnly: ['id', 'productCount', 'createdAt', 'updatedAt'],
  } as const
  private readonly VALIDATORS = {
    required: Validators.required,
    minLength2: Validators.minLength(2),
    maxLength100: Validators.maxLength(100),
    maxLength500: Validators.maxLength(500),
  } as const
  constructor(private fb: FormBuilder) {}
  createCategoryForm(): FormGroup {
    return this.fb.group({
      id: [{ value: '', disabled: true }],
      categoryName: [
        '',
        [
          this.VALIDATORS.required,
          this.VALIDATORS.minLength2,
          this.VALIDATORS.maxLength100,
        ],
      ],
      description: ['', [this.VALIDATORS.maxLength500]],
      isActive: [true],
      productCount: [{ value: 0, disabled: true }],
      createdAt: [{ value: '', disabled: true }],
      updatedAt: [{ value: '', disabled: true }],
    })
  }
  patchCategoryForm(form: FormGroup, category: Category): void {
    form.patchValue({
      ...category,
      id: category.id || '',
      categoryName: category.categoryName || '',
      description: category.description || '',
      isActive: category.isActive ?? true,
      createdAt: category.createdAt ? this.formatDate(category.createdAt) : '',
      updatedAt: category.updatedAt ? this.formatDate(category.updatedAt) : '',
    })
  }
  configureFormFields(form: FormGroup, mode: CategoryModalMode): void {
    const configurations = {
      view: () =>
        this.toggleFields(form, Object.keys(form.controls) as string[], false),
      edit: () => {
        this.toggleFields(form, this.FIELD_GROUPS.editable, true)
        this.toggleFields(form, this.FIELD_GROUPS.readOnly, false)
      },
      create: () => {
        this.toggleFields(form, this.FIELD_GROUPS.editable, true)
        this.toggleFields(form, this.FIELD_GROUPS.readOnly, false)
      },
    }
    configurations[mode]?.()
  }
  buildCategoryData(formData: CategoryFormData): Partial<Category> {
    return {
      categoryName: formData.categoryName?.trim(),
      description: formData.description?.trim() || undefined,
      isActive: formData.isActive,
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
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }
}
