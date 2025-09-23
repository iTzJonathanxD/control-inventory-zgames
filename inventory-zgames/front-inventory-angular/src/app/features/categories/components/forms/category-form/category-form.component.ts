import { Component, OnInit, OnDestroy } from '@angular/core'
import { FormGroup, ReactiveFormsModule } from '@angular/forms'
import { CommonModule } from '@angular/common'
import { Subject, takeUntil } from 'rxjs'
import { ToastrService } from 'ngx-toastr'
import { TranslateService, TranslateModule } from '@ngx-translate/core'
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap'
import { Category, CategoryModalData, CategoryModalMode } from '@core/interfaces/api/category.interface'
import { CategoryService } from '@core/services/api/category.service'
import { CategoryFormService } from '@core/services/api/form/category-form.service'
import { BootstrapModalService } from '@core/services/ui/bootstrap-modal.service'
@Component({
  selector: 'app-category-form',
  templateUrl: './category-form.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, NgbModule],
})
export class CategoryFormComponent implements OnInit, OnDestroy {
  public categoryDetailsForm!: FormGroup
  public validate = false
  public isLoading = false
  public modalMode: CategoryModalMode = 'create'
  public modalData?: CategoryModalData
  public selectedCategory?: Category
  private readonly destroy$ = new Subject<void>()
  constructor(
    private readonly categoryService: CategoryService,
    private readonly categoryFormService: CategoryFormService,
    private readonly toastrService: ToastrService,
    private readonly bootstrapModalService: BootstrapModalService<CategoryModalData>,
    private readonly translateService: TranslateService,
    private readonly activeModal: NgbActiveModal
  ) {}
  ngOnInit(): void {
    this.initializeComponent()
  }
  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }
  private initializeComponent(): void {
    this.initForm()
    this.initModalData()
  }
  private initForm(): void {
    this.categoryDetailsForm = this.categoryFormService.createCategoryForm()
  }
  private initModalData(): void {
    this.bootstrapModalService
      .getDataIssued()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        if (data) {
          this.modalData = data
          this.modalMode = data.mode || 'create'
          this.selectedCategory = data.category
          this.setupFormBasedOnMode()
        }
      })
  }
  private setupFormBasedOnMode(): void {
    if (
      this.selectedCategory &&
      (this.modalMode === 'edit' || this.modalMode === 'view')
    ) {
      this.categoryFormService.patchCategoryForm(
        this.categoryDetailsForm,
        this.selectedCategory
      )
    }
    this.categoryFormService.configureFormFields(
      this.categoryDetailsForm,
      this.modalMode
    )
  }
  public submit(): void {
    if (!this.isFormValid()) {
      this.handleInvalidForm()
      return
    }
    const formData = this.categoryDetailsForm.getRawValue()
    switch (this.modalMode) {
      case 'create':
        this.createCategory(formData)
        break
      case 'edit':
        this.updateCategory(formData)
        break
    }
  }
  private createCategory(formData: any): void {
    this.setLoadingState(true)
    const categoryData = this.categoryFormService.buildCategoryData(formData)
    this.categoryService
      .createCategory(categoryData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.handleSuccess(
            'Messages.CategoryCreated',
            'Categoría creada exitosamente'
          )
        },
        error: (error) => {
          console.error('Error creating category:', error)
          this.handleError(
            'Messages.ErrorCreatingCategory',
            'Error al crear categoría'
          )
        },
        complete: () => {
          this.setLoadingState(false)
        },
      })
  }
  private updateCategory(formData: any): void {
    if (!this.selectedCategory?.id) {
      this.handleError('', 'No se puede actualizar: ID de categoría no válido')
      return
    }
    this.setLoadingState(true)
    const categoryData = this.categoryFormService.buildCategoryData(formData)
    this.categoryService
      .updateCategory(this.selectedCategory.id, categoryData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.handleSuccess(
            'Messages.CategoryUpdated',
            'Categoría actualizada exitosamente'
          )
        },
        error: (error) => {
          console.error('Error updating category:', error)
          this.handleError(
            'Messages.ErrorUpdatingCategory',
            'Error al actualizar categoría'
          )
        },
        complete: () => {
          this.setLoadingState(false)
        },
      })
  }
  public toggleEditMode(): void {
    this.modalMode = this.modalMode === 'view' ? 'edit' : 'view'
    this.categoryFormService.configureFormFields(
      this.categoryDetailsForm,
      this.modalMode
    )
  }
  public closeModal(): void {
    this.activeModal.close()
  }
  private setLoadingState(loading: boolean): void {
    this.isLoading = loading
  }
  private isFormValid(): boolean {
    this.categoryDetailsForm.markAllAsTouched()
    return this.categoryDetailsForm.valid
  }
  private handleInvalidForm(): void {
    this.validate = true
    this.showWarningMessage(
      'Messages.CompleteRequiredFields',
      'Complete los campos requeridos'
    )
  }
  public isFieldInvalid(fieldName: string): boolean {
    const field = this.categoryDetailsForm.get(fieldName)
    return !!(
      field &&
      field.invalid &&
      (field.dirty || field.touched || this.validate)
    )
  }
  public getFieldError(fieldName: string): string {
    const field = this.categoryDetailsForm.get(fieldName)
    if (field?.errors) {
      if (field.errors['required']) return `${fieldName} es requerido`
      if (field.errors['minlength'])
        return `Mínimo ${field.errors['minlength'].requiredLength} caracteres`
      if (field.errors['maxlength'])
        return `Máximo ${field.errors['maxlength'].requiredLength} caracteres`
    }
    return ''
  }
  private handleSuccess(translationKey: string, fallbackMessage: string): void {
    const message =
      this.translateService.instant(translationKey) || fallbackMessage
    const title = this.translateService.instant('common.success') || 'Éxito'
    this.toastrService.success(message, title)
    this.activeModal.close(true)
  }
  private handleError(translationKey: string, fallbackMessage: string): void {
    const message = translationKey
      ? this.translateService.instant(translationKey) || fallbackMessage
      : fallbackMessage
    const title = this.translateService.instant('common.error') || 'Error'
    this.toastrService.error(message, title)
  }
  private showWarningMessage(
    translationKey: string,
    fallbackMessage: string
  ): void {
    const message =
      this.translateService.instant(translationKey) || fallbackMessage
    const title =
      this.translateService.instant('common.warning') || 'Advertencia'
    this.toastrService.warning(message, title)
  }
  public get isViewMode(): boolean {
    return this.modalMode === 'view'
  }
  public get isCreateMode(): boolean {
    return this.modalMode === 'create'
  }
  public get canEdit(): boolean {
    return this.modalMode === 'edit'
  }
  public get formTitle(): string {
    const titleMap = {
      create:
        this.translateService.instant('CATEGORY.INFO.CREATE_CATEGORY') ||
        'Crear Categoría',
      edit:
        this.translateService.instant('CATEGORY.INFO.EDIT_CATEGORY') ||
        'Editar Categoría',
      view:
        this.translateService.instant('CATEGORY.INFO.VIEW_DETAILS') ||
        'Ver Categoría',
    }
    return titleMap[this.modalMode] || 'Categoría'
  }
}
