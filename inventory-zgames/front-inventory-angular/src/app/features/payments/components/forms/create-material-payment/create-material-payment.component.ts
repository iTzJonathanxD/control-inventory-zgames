import { Component, OnInit, OnDestroy, inject } from '@angular/core'
import { FormGroup, FormBuilder, Validators } from '@angular/forms'
import { CommonModule } from '@angular/common'
import { ReactiveFormsModule } from '@angular/forms'
import { Subject, takeUntil } from 'rxjs'
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap'
import { ToastrService } from 'ngx-toastr'
import { TranslateService, TranslateModule } from '@ngx-translate/core'
import { Store } from '@ngrx/store'
import {
  Payment,
  PaymentModalData,
  PaymentStatus,
  PaymentMethod,
} from '@core/interfaces/api/payment.model'
import { User } from '@core/interfaces/api/user.interface'
import { PaymentService } from '@core/services/api/payment.service'
import { UserService } from '@core/services/api/user.service'
import { BootstrapModalService } from '@core/services/ui/bootstrap-modal.service'
import { AppState } from '@core/states'
import {
  selectAuth,
  selectUserPermissions,
} from '@core/states/auth/auth.selectors'
import { PERMISSIONS } from '@/app/shared/data/config/constants.permission'
type ModalMode = 'create' | 'edit' | 'view' | 'process' | 'reject'
@Component({
  selector: 'app-create-material-payment',
  templateUrl: './create-material-payment.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
})
export class CreateMaterialPaymentComponent implements OnInit, OnDestroy {
  public paymentDetailsForm!: FormGroup
  public validate = false
  public isLoading = false
  public modalMode: ModalMode = 'create'
  public modalData?: PaymentModalData
  public selectedPayment?: Payment
  public users: User[] = []
  public userPermissions: string[] = []
  public readonly PERMISSIONS = PERMISSIONS
  public readonly PaymentStatus = PaymentStatus
  public readonly PaymentMethod = PaymentMethod
  public paymentMethods = [
    { value: 'credit_card', label: 'Tarjeta de Crédito' },
    { value: 'debit_card', label: 'Tarjeta de Débito' },
    { value: 'paypal', label: 'PayPal' },
    { value: 'bank_transfer', label: 'Transferencia Bancaria' },
    { value: 'cash', label: 'Efectivo' },
  ]
  public paymentStatuses = [
    { value: 'pending', label: 'Pendiente' },
    { value: 'processing', label: 'Procesando' },
    { value: 'completed', label: 'Completado' },
    { value: 'failed', label: 'Fallido' },
    { value: 'cancelled', label: 'Cancelado' },
    { value: 'refunded', label: 'Reembolsado' },
  ]
  private readonly destroy$ = new Subject<void>()
  private readonly activeModal = inject(NgbActiveModal)
  private readonly bootstrapModalService = inject(
    BootstrapModalService<PaymentModalData>
  )
  private readonly fb = inject(FormBuilder)
  private readonly paymentService = inject(PaymentService)
  private readonly userService = inject(UserService)
  private readonly toastr = inject(ToastrService)
  private readonly translate = inject(TranslateService)
  private readonly store = inject(Store<AppState>)
  ngOnInit(): void {
    this.initForm()
    this.initModalData()
    this.loadInitialData()
    this.subscribeToAuthState()
  }
  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }
  private initForm(): void {
    this.paymentDetailsForm = this.fb.group({
      orderId: [null, [Validators.required]],
      amount: [0, [Validators.required, Validators.min(0.01)]],
      method: ['', [Validators.required]],
      status: ['pending', [Validators.required]],
      transactionId: [''],
      notes: [''],
      evidenceImages: [[]],
    })
  }
  private initModalData(): void {
    this.bootstrapModalService
      .getDataIssued()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        if (!data) return
        this.modalData = data
        this.modalMode = data.mode ?? 'create'
        this.selectedPayment = data.payment
        this.applyModeToForm()
      })
  }
  private applyModeToForm(): void {
    if (
      this.selectedPayment &&
      (this.modalMode === 'edit' || this.modalMode === 'view')
    ) {
      this.patchPaymentForm(this.selectedPayment)
    }
    this.configureFormFields(this.modalMode)
  }
  private patchPaymentForm(payment: Payment): void {
    this.paymentDetailsForm.patchValue({
      orderId: payment.orderId,
      amount: payment.amount,
      method: payment.method,
      status: payment.status,
      transactionId: payment.transactionId || '',
      notes: '', // Generic notes field
      evidenceImages: payment.evidenceImages || [],
    })
  }
  private configureFormFields(mode: ModalMode): void {
    if (mode === 'view') {
      this.paymentDetailsForm.disable()
    } else {
      this.paymentDetailsForm.enable()
    }
  }
  private loadInitialData(): void {
    this.loadUsers()
  }
  private loadUsers(): void {
    this.userService
      .findAllUsers(1, 1000) // Load all users for dropdown
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => (this.users = res.data?.result ?? []),
        error: (err) => this.handleLoadError('usuarios', err),
      })
  }
  private subscribeToAuthState(): void {
    this.store
      .select(selectUserPermissions)
      .pipe(takeUntil(this.destroy$))
      .subscribe((permissions) => {
        this.userPermissions = permissions || []
      })
  }
  public hasPermission(permission: string): boolean {
    return this.userPermissions.includes(permission)
  }
  private handleLoadError(entity: string, error: any): void {
    console.error(`Error cargando ${entity}:`, error)
    const msg = this.translate.instant('common.error') + ` al cargar ${entity}`
    this.toastr.error(msg)
  }
  public submit(): void {
    this.paymentDetailsForm.markAllAsTouched()
    if (this.paymentDetailsForm.invalid) {
      this.validate = true
      this.toastr.warning(
        this.translate.instant('Messages.CompleteRequiredFields'),
        this.translate.instant('common.warning')
      )
      return
    }
    const data = this.paymentDetailsForm.getRawValue()
    this.modalMode === 'create'
      ? this.createPayment(data)
      : this.updatePayment(data)
  }
  private createPayment(formData: any): void {
    this.toggleLoading(true)
    console.log('🔍 Frontend - Payment form data received:', formData)
    const payload = this.buildPaymentData(formData, true)
    console.log('📤 Frontend - Payment payload being sent:', payload)
    this.paymentService
      .createPayment(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () =>
          this.handleSuccess(
            'Messages.PaymentCreated',
            'Pago creado exitosamente'
          ),
        error: (err) =>
          this.handleError(
            'Messages.ErrorCreatingPayment',
            'Error al crear pago',
            err
          ),
        complete: () => this.toggleLoading(false),
      })
  }
  private updatePayment(formData: any): void {
    if (!this.selectedPayment?.id) {
      this.toastr.error('ID de pago inválido')
      return
    }
    this.toggleLoading(true)
    const payload = this.buildPaymentData(formData, false)
    this.paymentService
      .updatePayment(this.selectedPayment.id, payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () =>
          this.handleSuccess(
            'Messages.PaymentUpdated',
            'Pago actualizado exitosamente'
          ),
        error: (err) =>
          this.handleError(
            'Messages.ErrorUpdatingPayment',
            'Error al actualizar pago',
            err
          ),
        complete: () => this.toggleLoading(false),
      })
  }
  private buildPaymentData(formData: any, isCreating: boolean): any {
    const baseData = {
      orderId: formData.orderId,
      amount: formData.amount,
      method: formData.method,
      status: formData.status,
      transactionId: formData.transactionId || null,
      notes: formData.notes || null,
      evidenceImages: formData.evidenceImages || [],
    }
    if (isCreating) {
      baseData.status = 'pending' // Always start as pending for new payments
    }
    return baseData
  }
  private toggleLoading(state: boolean): void {
    this.isLoading = state
  }
  private handleSuccess(key: string, fallback: string): void {
    const msg = this.translate.instant(key) || fallback
    this.toastr.success(msg, this.translate.instant('common.success'))
    this.activeModal.close(true)
  }
  private handleError(key: string, fallback: string, error?: any): void {
    console.error('Error en operación de pago:', error)
    const msg = this.translate.instant(key) || fallback
    this.toastr.error(msg, this.translate.instant('common.error'))
  }
  public toggleEditMode(): void {
    this.modalMode = this.modalMode === 'view' ? 'edit' : 'view'
    this.configureFormFields(this.modalMode)
  }
  public closeModal(): void {
    this.activeModal.close()
  }
  public isFieldInvalid(field: string): boolean {
    const ctrl = this.paymentDetailsForm.get(field)
    return (
      !!ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched || this.validate)
    )
  }
  public getFieldError(field: string): string {
    const errs = this.paymentDetailsForm.get(field)?.errors ?? {}
    if (errs['required']) return `${field} es requerido`
    if (errs['email']) return 'Email inválido'
    if (errs['min']) return `Valor mínimo: ${errs['min'].min}`
    if (errs['max']) return `Valor máximo: ${errs['max'].max}`
    if (errs['pattern']) return 'Formato inválido'
    return ''
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
    const map: Record<ModalMode, string> = {
      create: 'PAYMENT.INFO.CREATE_PAYMENT',
      edit: 'PAYMENT.INFO.EDIT_PAYMENT',
      view: 'PAYMENT.INFO.VIEW_DETAILS',
      process: 'PAYMENT.INFO.PROCESS_PAYMENT',
      reject: 'PAYMENT.INFO.REJECT_PAYMENT',
    }
    return this.translate.instant(map[this.modalMode]) || 'Pago'
  }
  public formatCurrency(amount: number | string): string {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
    return new Intl.NumberFormat('es-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numAmount)
  }
  public getPaymentStatusText(status: PaymentStatus | string): string {
    const statusOption = this.paymentStatuses.find((s) => s.value === status)
    return statusOption?.label || status
  }
  public getPaymentMethodText(method: PaymentMethod | string): string {
    const methodOption = this.paymentMethods.find((m) => m.value === method)
    return methodOption?.label || method
  }
  public canProcessPayment(): boolean {
    if (!this.selectedPayment) return false
    return (
      this.selectedPayment.status === PaymentStatus.PENDING ||
      this.selectedPayment.status === 'pending'
    )
  }
  public canRejectPayment(): boolean {
    if (!this.selectedPayment) return false
    return (
      this.selectedPayment.status === PaymentStatus.PENDING ||
      this.selectedPayment.status === 'pending'
    )
  }
  public getImageUrl(imagePath: string): string {
    if (imagePath.startsWith('http')) {
      return imagePath
    }
    return `assets/images/evidence/${imagePath}`
  }
  public viewImageFullSize(imagePath: string): void {
    const imageUrl = this.getImageUrl(imagePath)
    window.open(imageUrl, '_blank')
  }
  public processPayment(): void {
    if (!this.selectedPayment) return
    this.isLoading = true
    this.paymentService.processPayment(this.selectedPayment.id).subscribe({
      next: (updatedPayment: Payment) => {
        this.toastr.success(
          this.translate.instant('PAYMENT.SUCCESS.PROCESSED'),
          this.translate.instant('PAYMENT.SUCCESS.TITLE')
        )
        this.selectedPayment = updatedPayment
        this.activeModal.close(updatedPayment)
        this.isLoading = false
      },
      error: (error) => {
        console.error('Error processing payment:', error)
        this.toastr.error(
          this.translate.instant('PAYMENT.ERROR.PROCESS_FAILED'),
          this.translate.instant('PAYMENT.ERROR.TITLE')
        )
        this.isLoading = false
      },
    })
  }
  public rejectPayment(): void {
    if (!this.selectedPayment) return
    const reason = prompt(
      this.translate.instant('PAYMENT.FORM.REJECTION_REASON')
    )
    if (reason === null) return // Usuario canceló
    this.isLoading = true
    this.paymentService
      .rejectPayment(this.selectedPayment.id, reason)
      .subscribe({
        next: (updatedPayment: Payment) => {
          this.toastr.success(
            this.translate.instant('PAYMENT.SUCCESS.REJECTED'),
            this.translate.instant('PAYMENT.SUCCESS.TITLE')
          )
          this.selectedPayment = updatedPayment
          this.activeModal.close(updatedPayment)
          this.isLoading = false
        },
        error: (error) => {
          console.error('Error rejecting payment:', error)
          this.toastr.error(
            this.translate.instant('PAYMENT.ERROR.REJECT_FAILED'),
            this.translate.instant('PAYMENT.ERROR.TITLE')
          )
          this.isLoading = false
        },
      })
  }
  public getStatusBadgeClass(status: PaymentStatus | string): string {
    const statusClasses: Record<string, string> = {
      pending: 'bg-warning text-dark',
      processing: 'bg-info text-white',
      completed: 'bg-success text-white',
      failed: 'bg-danger text-white',
      cancelled: 'bg-secondary text-white',
      refunded: 'bg-primary text-white',
    }
    return `${statusClasses[status as string] || 'bg-secondary text-white'} rounded-pill fs-6 fw-semibold px-2 py-1`
  }
}
