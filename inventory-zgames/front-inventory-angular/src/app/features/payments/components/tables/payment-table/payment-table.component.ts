import {
  Component,
  inject,
  Input,
  OnDestroy,
  OnInit,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef,
} from '@angular/core'
import {
  NgbModule,
  NgbPaginationModule,
  NgbToastModule,
  NgbTooltipModule,
} from '@ng-bootstrap/ng-bootstrap'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { TranslateModule } from '@ngx-translate/core'
import { Subject, takeUntil } from 'rxjs'
import { ToastrService } from 'ngx-toastr'
import { Store } from '@ngrx/store'
import { Router } from '@angular/router'
import { PaymentService } from '@core/services/api/payment.service'
import { BootstrapModalService } from '@core/services/ui/bootstrap-modal.service'
import { FilterCommunicationService } from '@core/services/ui/filter-comumunication.service'
import { AppState } from '@core/states'
import {
  selectAuth,
  selectUserPermissions,
} from '@core/states/auth/auth.selectors'
import {
  Payment,
  PaymentStatus,
  PaymentMethod,
  PaymentModalData,
} from '@core/interfaces/api/payment.model'
import {
  ApiData,
  ApiResponse,
} from '@core/interfaces/api/api-response.interface'
import { CreateMaterialPaymentComponent } from '../../forms/create-material-payment/create-material-payment.component'
import { PaymentFilterFormComponent } from '../../filter/payment-filter-form/payment-filter-form.component'
import { COLUMS_PAYMENT_TABLE } from '@core/helpers/ui/constants'
import { PAYMENT_BUTTONS_PERMISSIONS } from '@/app/shared/data/config/constants-buttons.permission'
import { AlertService } from '@core/services/ui/alert.service'
import { TooglePanelComponent } from '@/app/shared/components/accordions/toogle-panel/toogle-panel.component'
import { PageTitleComponent } from '@/app/shared/components/layouts/page-title/page-title.component'
import { LoadingSpinnerComponent } from '@/app/shared/components/ui/loading-spinner/loading-spinner.component'
import { PERMISSIONS } from '@/app/shared/data/config/constants.permission'
import { environment } from '@environment/environment'
@Component({
  selector: 'app-payment-table',
  templateUrl: './payment-table.component.html',
  styleUrl: './payment-table.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    NgbModule,
    NgbToastModule,
    NgbPaginationModule,
    NgbTooltipModule,
    FormsModule,
    TooglePanelComponent,
    LoadingSpinnerComponent,
  ],
})
export class PaymentTableComponent implements OnInit, OnChanges, OnDestroy {
  @Input() filters: Record<string, any> = {}
  public readonly filterComponent = PaymentFilterFormComponent
  public readonly columnsTable = COLUMS_PAYMENT_TABLE
  public readonly PAYMENT_BUTTONS_PERMISSIONS = PAYMENT_BUTTONS_PERMISSIONS
  public readonly Math = Math
  public isLoading = true
  public payments: Payment[] = []
  public collectionSize = 0
  public page = 1
  public limit = 10
  public userPermissions: string[] = []
  public readonly PERMISSIONS = PERMISSIONS
  private readonly destroy$ = new Subject<void>()
  private readonly paymentService = inject(PaymentService)
  private readonly bootstrapModalService = inject(
    BootstrapModalService<PaymentModalData>
  )
  private readonly toastrService = inject(ToastrService)
  private readonly alertService = inject(AlertService)
  private readonly store = inject(Store<AppState>)
  private readonly filterCommunicationService = inject(
    FilterCommunicationService
  )
  private readonly router = inject(Router)
  private readonly changeDetectorRef = inject(ChangeDetectorRef)
  public get visibleColumns() {
    return this.columnsTable.filter((column) => column.visible)
  }
  ngOnInit(): void {
    this.subscribeToEvents()
    this.subscribeToFilterChanges()
    this.initializeData()
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['filters'] && !changes['filters'].firstChange) {
      this.resetPaginationAndReload()
    }
  }
  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }
  private initializeData(): void {
    console.log('🏁 Table - Initialized, waiting for user to apply filters')
  }
  private subscribeToEvents(): void {
    this.subscribeToModalEvents()
    this.subscribeToAuthState()
  }
  private subscribeToModalEvents(): void {
    this.bootstrapModalService
      .getModalClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        if (result !== null) {
          this.reloadTable()
        }
      })
  }
  private subscribeToAuthState(): void {
    this.store
      .select(selectUserPermissions)
      .pipe(takeUntil(this.destroy$))
      .subscribe((permissions) => {
        this.userPermissions = permissions || []
      })
    this.store
      .select(selectAuth)
      .pipe(takeUntil(this.destroy$))
      .subscribe((authState) => {
        if (authState) {
          this.loadAllPayments()
        }
      })
  }
  public hasPermission(permission: string): boolean {
    return this.userPermissions.includes(permission)
  }
  private subscribeToFilterChanges(): void {
    this.filterCommunicationService
      .getFilterObservable()
      .pipe(takeUntil(this.destroy$))
      .subscribe((filters) => {
        console.log('🎯 Table - Received filters from service:', filters)
        if (!filters || Object.keys(filters).length === 0) {
          this.filters = {}
          console.log('🔄 Table - Resetting filters and reloading')
          this.resetPaginationAndReload()
        } else {
          this.filters = { ...filters }
          console.log('✅ Table - Applied filters:', this.filters)
          this.resetPaginationAndReload()
        }
      })
  }
  public loadAllPayments(): void {
    console.log('Loading payments with filters:', this.filters)
    console.log('Page:', this.page, 'Limit:', this.limit)
    this.isLoading = true
    const currentFilters = {
      ...this.filters,
      ...this.filterCommunicationService.getCurrentFilter(),
    }
    const cleanFilters = this.cleanEmptyFilters(currentFilters)
    console.log('Clean filters:', cleanFilters)
    this.paymentService
      .findAllPayments(this.page, this.limit, cleanFilters)
      .subscribe({
        next: (response) => {
          console.log('Raw response from service:', response)
          this.handlePaymentsResponse(response)
        },
        error: (error) => {
          console.error('Service error:', error)
          this.handlePaymentsError(error)
        },
      })
  }
  private cleanEmptyFilters(filters: Record<string, any>): Record<string, any> {
    const cleaned: Record<string, any> = {}
    Object.keys(filters).forEach((key) => {
      const value = filters[key]
      if (
        value !== null &&
        value !== undefined &&
        value !== '' &&
        !(Array.isArray(value) && value.length === 0)
      ) {
        cleaned[key] = value
      }
    })
    return cleaned
  }
  public applyFilters(filters: Record<string, any>): void {
    this.filterCommunicationService.changeFilter(filters)
  }
  public clearFilters(): void {
    this.filterCommunicationService.resetFilter()
  }
  public getCurrentFilters(): Record<string, any> {
    return {
      ...this.filters,
      ...this.filterCommunicationService.getCurrentFilter(),
    }
  }
  private handlePaymentsResponse(response: any): void {
    console.log('Payments Response:', response) // Para debugging
    let payments: Payment[] = []
    let totalCount = 0
    if (Array.isArray(response)) {
      payments = response
      totalCount = response.length
    } else if (response.data) {
      if (Array.isArray(response.data)) {
        payments = response.data
        totalCount = response.data.length
      } else if (response.data.result && Array.isArray(response.data.result)) {
        payments = response.data.result
        totalCount =
          response.data.meta?.totalItems || response.data.result.length
      }
    }
    if (!Array.isArray(payments)) {
      console.error('Payments data is not an array:', response)
      this.resetPaymentsData()
      return
    }
    this.payments = payments.map((payment: Payment) => ({
      ...payment,
      transactionId: this.sanitizeText(payment.transactionId || '', 20),
      amount: payment.amount || 0,
      statusText: this.getPaymentStatusText(payment.status),
      methodText: this.getPaymentMethodText(payment.method),
    }))
    this.collectionSize = totalCount
    this.isLoading = false
    console.log('🔄 Final payments assigned:', this.payments) // Para debugging
    console.log('🔄 Final collection size:', this.collectionSize) // Para debugging
    console.log('🔄 Loading state:', this.isLoading) // Para debugging
    console.log('🔄 Payments array length:', this.payments.length) // Para debugging
    console.log('🔄 Is payments array?:', Array.isArray(this.payments)) // Para debugging
    this.changeDetectorRef.detectChanges()
  }
  private handlePaymentsError(error: any): void {
    console.error('Error loading payments:', error)
    this.toastrService.error('Error al cargar pagos.', 'Error')
    this.resetPaymentsData()
  }
  private resetPaymentsData(): void {
    this.payments = []
    this.collectionSize = 0
    this.isLoading = false
  }
  private sanitizeText(text: string, maxLength = 50): string {
    if (!text) return '-'
    const cleanText = text.replace(/(.)\1{10,}/g, '$1...')
    return cleanText.length > maxLength
      ? cleanText.substring(0, maxLength) + '...'
      : cleanText
  }
  public onPageChange(page: number): void {
    this.page = page
    this.loadAllPayments()
  }
  public onLimitChange(limit: number): void {
    this.limit = limit
    this.resetPaginationAndReload()
  }
  private resetPaginationAndReload(): void {
    this.page = 1
    this.loadAllPayments()
  }
  public reloadTable(): void {
    this.isLoading = true
    this.loadAllPayments()
  }
  public openCreatePaymentModal(): void {
    this.openModal({
      mode: 'create',
      isEditForm: false,
      title: 'Crear Nuevo Pago',
    })
  }
  public openViewPaymentModal(payment: Payment): void {
    this.openModal({
      payment,
      mode: 'view',
      isEditForm: false,
      title: 'Ver Pago',
    })
  }
  public openEditPaymentModal(payment: Payment): void {
    this.openModal({
      payment,
      mode: 'edit',
      isEditForm: true,
      title: 'Editar Pago',
    })
  }
  private openModal(data: PaymentModalData): void {
    this.bootstrapModalService.openModal({
      component: CreateMaterialPaymentComponent,
      data,
      options: {
        size: 'xl',
        backdrop: 'static',
      },
    })
  }
  public processPayment(payment: Payment): void {
    const message = `¿Procesar el pago de ${this.formatCurrency(payment.amount)}?`
    this.alertService
      .showConfirmAlert(message, 'Esta acción marcará el pago como completado')
      .then((result) => {
        if (result.isConfirmed) {
          this.executeProcessPayment(payment)
        }
      })
  }
  private executeProcessPayment(payment: Payment): void {
    this.paymentService.processPayment(payment.id).subscribe({
      next: (response) => {
        this.toastrService.success('Pago procesado exitosamente', 'Éxito')
        this.reloadTable()
      },
      error: (error) => {
        console.error('Error processing payment:', error)
        this.toastrService.error('Error al procesar el pago', 'Error')
      },
    })
  }
  public rejectPayment(payment: Payment): void {
    const message = `¿Rechazar el pago de ${this.formatCurrency(payment.amount)}?`
    this.alertService
      .showConfirmAlert(message, 'Esta acción marcará el pago como rechazado')
      .then((result) => {
        if (result.isConfirmed) {
          this.executeRejectPayment(payment)
        }
      })
  }
  private executeRejectPayment(payment: Payment): void {
    this.paymentService
      .rejectPayment(payment.id, 'Rechazado por administrador')
      .subscribe({
        next: (response) => {
          this.toastrService.success('Pago rechazado exitosamente', 'Éxito')
          this.reloadTable()
        },
        error: (error) => {
          console.error('Error rejecting payment:', error)
          this.toastrService.error('Error al rechazar el pago', 'Error')
        },
      })
  }
  public refundPayment(payment: Payment): void {
    const message = `¿Reembolsar el pago de ${this.formatCurrency(payment.amount)}?`
    this.alertService
      .showConfirmAlert(message, 'Esta acción iniciará el proceso de reembolso')
      .then((result) => {
        if (result.isConfirmed) {
          this.executeRefundPayment(payment)
        }
      })
  }
  private executeRefundPayment(payment: Payment): void {
    this.paymentService.refundPayment(payment.id).subscribe({
      next: (response) => {
        this.toastrService.success('Reembolso iniciado exitosamente', 'Éxito')
        this.reloadTable()
      },
      error: (error) => {
        console.error('Error refunding payment:', error)
        this.toastrService.error('Error al procesar el reembolso', 'Error')
      },
    })
  }
  public trackByColumn(index: number, column: any): any {
    return column.field
  }
  public trackByPayment(index: number, payment: Payment): number {
    return payment.id
  }
  public getPaymentStatusClass(status: PaymentStatus | string): string {
    const statusMap: Record<string, string> = {
      pending: 'bg-warning',
      processing: 'bg-info',
      completed: 'bg-success',
      failed: 'bg-danger',
      cancelled: 'bg-secondary',
      refunded: 'bg-dark',
    }
    return statusMap[status as string] || 'bg-secondary'
  }
  public getPaymentStatusIcon(status: PaymentStatus | string): string {
    const iconMap: Record<string, string> = {
      pending: 'fa fa-clock me-1',
      processing: 'fa fa-spinner me-1',
      completed: 'fa fa-check me-1',
      failed: 'fa fa-times me-1',
      cancelled: 'fa fa-ban me-1',
      refunded: 'fa fa-undo me-1',
    }
    return iconMap[status as string] || 'fa fa-question me-1'
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
  public getPaymentMethodText(method: PaymentMethod | string): string {
    const methodMap: Record<string, string> = {
      credit_card: 'Tarjeta de Crédito',
      debit_card: 'Tarjeta de Débito',
      paypal: 'PayPal',
      bank_transfer: 'Transferencia Bancaria',
      cash: 'Efectivo',
    }
    return methodMap[method as string] || method
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
  public canProcessPayment(payment: Payment): boolean {
    return (
      payment.status === PaymentStatus.PENDING || payment.status === 'pending'
    )
  }
  public canRejectPayment(payment: Payment): boolean {
    return (
      payment.status === PaymentStatus.PENDING || payment.status === 'pending'
    )
  }
  public canRefundPayment(payment: Payment): boolean {
    return (
      payment.status === PaymentStatus.COMPLETED ||
      payment.status === 'completed'
    )
  }
  public hasEvidenceImages(payment: Payment): boolean {
    return !!(payment.evidenceImages && payment.evidenceImages.length > 0)
  }
  public getEvidenceImageUrl(imagePath: string): string {
    return `${environment.apiBaseUrl}/files/evidence/${imagePath}`
  }
  public openEvidenceModal(payment: Payment): void {
    console.log('Opening evidence modal for payment:', payment.id)
  }
  public navigateToOrder(orderId: number): void {
    if (orderId) {
      this.router.navigate(['/orders', orderId])
    }
  }
  public navigateToUser(userId?: number): void {
    if (userId) {
      this.router.navigate(['/users-management/users', userId])
    }
  }
}
