import { Component, OnInit, OnDestroy, inject } from '@angular/core'
import { FormGroup, ReactiveFormsModule } from '@angular/forms'
import { CommonModule } from '@angular/common'
import { Subject, takeUntil } from 'rxjs'
import { ToastrService } from 'ngx-toastr'
import { TranslateService, TranslateModule } from '@ngx-translate/core'
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap'
import { Product } from '@core/interfaces/api/product.interface'
import { User } from '@core/interfaces/api/user.interface'
import { ProductService } from '@core/services/api/product.service'
import { UserService } from '@core/services/api/user.service'
import { BootstrapModalService } from '@core/services/ui/bootstrap-modal.service'
import {
  InventoryMovement,
  InventoryMovementModalData,
  MovementType,
} from '@core/interfaces/api/movement.interface'
import { MovementService } from '@core/services/api/movement.service'
import { InventoryFormService } from '@core/services/api/form/inventory-from.service'
@Component({
  selector: 'app-create-inventory-movement',
  templateUrl: './create-inventory-movement.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, NgbModule],
})
export class CreateInventoryMovementComponent implements OnInit, OnDestroy {
  public movementForm!: FormGroup
  public validate = false
  public isLoading = false
  public modalMode: 'create' | 'edit' | 'view' = 'create'
  public modalData?: InventoryMovementModalData
  public selectedMovement?: InventoryMovement
  public movementType: MovementType = MovementType.ENTRY
  public products: Product[] = []
  public users: User[] = []
  public readonly MovementType = MovementType
  private readonly destroy$ = new Subject<void>()
  private readonly inventoryService = inject(MovementService)
  private readonly productService = inject(ProductService)
  private readonly userService = inject(UserService)
  private readonly inventoryFormService = inject(InventoryFormService)
  private readonly toastrService = inject(ToastrService)
  private readonly bootstrapModalService = inject(
    BootstrapModalService<InventoryMovementModalData>
  )
  private readonly translateService = inject(TranslateService)
  private readonly activeModal = inject(NgbActiveModal)
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
    this.loadInitialData()
  }
  private initForm(): void {
    this.movementForm = this.inventoryFormService.createMovementForm()
  }
  private initModalData(): void {
    this.bootstrapModalService
      .getDataIssued()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        if (data) {
          this.modalData = data
          this.modalMode = data.mode || 'create'
          this.selectedMovement = data.movement
          this.movementType = data.movementType || MovementType.ENTRY
          this.movementForm.get('movementType')?.setValue(this.movementType)
          this.setupFormBasedOnMode()
        }
      })
  }
  private setupFormBasedOnMode(): void {
    if (
      this.selectedMovement &&
      (this.modalMode === 'edit' || this.modalMode === 'view')
    ) {
      this.inventoryFormService.patchMovementForm(
        this.movementForm,
        this.selectedMovement
      )
      this.movementType = this.selectedMovement.movementType
    }
    this.inventoryFormService.configureFormFields(
      this.movementForm,
      this.modalMode,
      this.movementType
    )
  }
  private loadInitialData(): void {
    this.loadProducts()
    this.loadUsers()
  }
  private loadProducts(): void {
    this.isLoading = true
    this.productService
      .findAllProducts(1, 1000) 
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.products = response.data?.result || []
          this.isLoading = false
        },
        error: (error) => {
          console.error('Error loading products:', error)
          this.showErrorMessage('Error al cargar los productos')
          this.isLoading = false
        },
      })
  }
  private loadUsers(): void {
    this.userService
      .findAllUsers(1, 1000) 
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.users = response.data?.result || []
        },
        error: (error) => {
          console.error('Error loading users:', error)
          this.showErrorMessage('Error al cargar los usuarios')
        },
      })
  }
  public onProductChange(event: any): void {
    const productId = event.target.value
    if (!productId) return
    const selectedProduct = this.products.find(
      (p) => p.id === Number(productId)
    )
    if (selectedProduct) {
      this.movementForm
        .get('previousStock')
        ?.setValue(selectedProduct.stockCurrent || 0)
      this.calculateNewStock()
    }
  }
  public onQuantityChange(): void {
    this.calculateNewStock()
    this.calculateTotalCost()
  }
  public onUnitCostChange(): void {
    this.calculateTotalCost()
  }
  private calculateNewStock(): void {
    const previousStock = this.movementForm.get('previousStock')?.value || 0
    const quantity = this.movementForm.get('quantity')?.value || 0
    let newStock = previousStock
    switch (this.movementType) {
      case MovementType.ENTRY:
        newStock = previousStock + quantity
        break
      case MovementType.EXIT:
        newStock = previousStock - quantity
        break
      case MovementType.ADJUSTMENT:
        newStock = previousStock + quantity
        break
    }
    this.movementForm.get('newStock')?.setValue(newStock)
  }
  private calculateTotalCost(): void {
    const quantity = this.movementForm.get('quantity')?.value || 0
    const unitCost = this.movementForm.get('unitCost')?.value || 0
    const totalCost = quantity * unitCost
    this.movementForm.get('totalCost')?.setValue(totalCost)
  }
  public submit(): void {
    if (!this.isFormValid()) {
      this.handleInvalidForm()
      return
    }
    const formData = this.movementForm.getRawValue()
    switch (this.modalMode) {
      case 'create':
        this.createMovement(formData)
        break
      case 'edit':
        this.updateMovement(formData)
        break
    }
  }
  private createMovement(formData: any): void {
    this.setLoadingState(true)
    const movementData = this.inventoryFormService.buildMovementData(formData)
    this.inventoryService
      .createMovement(movementData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.handleSuccess(
            'Messages.MovementCreated',
            'Movimiento registrado exitosamente'
          )
        },
        complete: () => {
          this.setLoadingState(false)
        },
      })
  }
  private updateMovement(formData: any): void {
    if (!this.selectedMovement?.id) {
      this.handleError('', 'No se puede actualizar: ID de movimiento no válido')
      return
    }
    this.setLoadingState(true)
    const movementData = this.inventoryFormService.buildMovementData(formData)
    this.inventoryService
      .updateMovement(this.selectedMovement.id, movementData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.handleSuccess(
            'Messages.MovementUpdated',
            'Movimiento actualizado exitosamente'
          )
        },
        complete: () => {
          this.setLoadingState(false)
        },
      })
  }
  public toggleEditMode(): void {
    this.modalMode = this.modalMode === 'view' ? 'edit' : 'view'
    this.inventoryFormService.configureFormFields(
      this.movementForm,
      this.modalMode,
      this.movementType
    )
  }
  public closeModal(): void {
    this.activeModal.close()
  }
  private setLoadingState(loading: boolean): void {
    this.isLoading = loading
  }
  private isFormValid(): boolean {
    this.movementForm.markAllAsTouched()
    return this.movementForm.valid
  }
  private handleInvalidForm(): void {
    this.validate = true
    this.showWarningMessage(
      'Messages.CompleteRequiredFields',
      'Complete los campos requeridos'
    )
  }
  public isFieldInvalid(fieldName: string): boolean {
    const field = this.movementForm.get(fieldName)
    return !!(
      field &&
      field.invalid &&
      (field.dirty || field.touched || this.validate)
    )
  }
  public getFieldError(fieldName: string): string {
    const field = this.movementForm.get(fieldName)
    if (field?.errors) {
      if (field.errors['required']) return `${fieldName} es requerido`
      if (field.errors['minlength'])
        return `Mínimo ${field.errors['minlength'].requiredLength} caracteres`
      if (field.errors['min']) return `Valor mínimo: ${field.errors['min'].min}`
      if (field.errors['pattern']) return 'Formato inválido'
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
  private showErrorMessage(message: string): void {
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
  public get isEntryMode(): boolean {
    return this.movementType === MovementType.ENTRY
  }
  public get isExitMode(): boolean {
    return this.movementType === MovementType.EXIT
  }
  public get isAdjustmentMode(): boolean {
    return this.movementType === MovementType.ADJUSTMENT
  }
  public getMovementTypeClass(): string {
    switch (this.movementType) {
      case MovementType.ENTRY:
        return 'text-success'
      case MovementType.EXIT:
        return 'text-danger'
      case MovementType.ADJUSTMENT:
        return 'text-warning'
      default:
        return ''
    }
  }
  public getMovementTypeIcon(): string {
    switch (this.movementType) {
      case MovementType.ENTRY:
        return 'fa-arrow-circle-down'
      case MovementType.EXIT:
        return 'fa-arrow-circle-up'
      case MovementType.ADJUSTMENT:
        return 'fa-exchange'
      default:
        return 'fa-question-circle'
    }
  }
  public get formTitle(): string {
    const baseTitle = this.getMovementTypeTitle()
    switch (this.modalMode) {
      case 'create':
        return (
          this.translateService.instant('INVENTORY.MODAL.CREATE_TITLE', {
            type: baseTitle,
          }) || `Registrar ${baseTitle}`
        )
      case 'edit':
        return (
          this.translateService.instant('INVENTORY.MODAL.EDIT_TITLE', {
            type: baseTitle,
          }) || `Editar ${baseTitle}`
        )
      case 'view':
        return (
          this.translateService.instant('INVENTORY.MODAL.VIEW_TITLE', {
            type: baseTitle,
          }) || `Ver ${baseTitle}`
        )
      default:
        return baseTitle
    }
  }
  private getMovementTypeTitle(): string {
    switch (this.movementType) {
      case MovementType.ENTRY:
        return (
          this.translateService.instant('INVENTORY.MOVEMENT_TYPE.ENTRY') ||
          'Entrada'
        )
      case MovementType.EXIT:
        return (
          this.translateService.instant('INVENTORY.MOVEMENT_TYPE.EXIT') ||
          'Salida'
        )
      case MovementType.ADJUSTMENT:
        return (
          this.translateService.instant('INVENTORY.MOVEMENT_TYPE.ADJUSTMENT') ||
          'Ajuste'
        )
      default:
        return (
          this.translateService.instant('INVENTORY.MOVEMENT_TYPE.MOVEMENT') ||
          'Movimiento'
        )
    }
  }
}
