import {
  Component,
  inject,
  Input,
  OnDestroy,
  OnInit,
  OnChanges,
  SimpleChanges,
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
import { UserService } from '@core/services/api/user.service'
import { BootstrapModalService } from '@core/services/ui/bootstrap-modal.service'
import { FilterCommunicationService } from '@core/services/ui/filter-comumunication.service'
import { AppState } from '@core/states'
import {
  selectAuth,
  selectUserPermissions,
} from '@core/states/auth/auth.selectors'
import { User, UserModalData } from '@core/interfaces/api/user.interface'
import {
  ApiData,
  ApiResponse,
} from '@core/interfaces/api/api-response.interface'
import { CreateMaterialUserComponent } from '../../forms/create-material-user/create-material-user.component'
import { UserFilterFormComponent } from '../../filter/user-filter-form/user-filter-form.component'
import { COLUMS_USER_TABLE } from '@core/helpers/ui/constants'
import { USER_BUTTONS_PERMISSIONS } from '@/app/shared/data/config/constants-buttons.permission'
import { AlertService } from '@core/services/ui/alert.service'
import { TooglePanelComponent } from '@/app/shared/components/accordions/toogle-panel/toogle-panel.component'
import { PageTitleComponent } from '@/app/shared/components/layouts/page-title/page-title.component'
import { LoadingSpinnerComponent } from '@/app/shared/components/ui/loading-spinner/loading-spinner.component'
import { PERMISSIONS } from '@/app/shared/data/config/constants.permission'
import { WhatsAppService } from '@core/services/api/whatsapp.service'
import { Router } from '@angular/router'
@Component({
  selector: 'app-user-table',
  templateUrl: './user-table.component.html',
  styleUrl: './user-table.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    NgbModule,
    NgbToastModule,
    NgbPaginationModule,
    NgbTooltipModule,
    FormsModule,
    PageTitleComponent,
    TooglePanelComponent,
    LoadingSpinnerComponent,
  ],
})
export class UserTableComponent implements OnInit, OnChanges, OnDestroy {
  @Input() filters: Record<string, any> = {}
  public readonly filterComponent = UserFilterFormComponent
  public readonly columnsTable = COLUMS_USER_TABLE
  public readonly USER_BUTTONS_PERMISSIONS = USER_BUTTONS_PERMISSIONS
  public readonly Math = Math
  public isLoading = true
  public users: User[] = []
  public collectionSize = 0
  public page = 1
  public limit = 10
  public userPermissions: string[] = []
  public readonly PERMISSIONS = PERMISSIONS
  private readonly destroy$ = new Subject<void>()
  private readonly userService = inject(UserService)
  private readonly bootstrapModalService = inject(
    BootstrapModalService<UserModalData>
  )
  private readonly toastrService = inject(ToastrService)
  private readonly alertService = inject(AlertService)
  private readonly store = inject(Store<AppState>)
  private readonly filterCommunicationService = inject(
    FilterCommunicationService
  )
  private readonly whatsappService = inject(WhatsAppService)
  private readonly router = inject(Router)
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
    this.loadAllUsers()
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
          this.loadAllUsers()
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
        if (!filters || Object.keys(filters).length === 0) {
          this.filters = {}
          this.resetPaginationAndReload()
        } else {
          this.filters = { ...filters }
          this.resetPaginationAndReload()
        }
      })
  }
  public loadAllUsers(): void {
    this.isLoading = true
    const currentFilters = {
      ...this.filters,
      ...this.filterCommunicationService.getCurrentFilter(),
    }
    const cleanFilters = this.cleanEmptyFilters(currentFilters)
    this.userService
      .findAllUsers(this.page, this.limit, cleanFilters)
      .subscribe({
        next: (response) => this.handleUsersResponse(response),
        error: (error) => this.handleUsersError(error),
      })
  }
  private cleanEmptyFilters(filters: Record<string, any>): Record<string, any> {
    const cleaned: Record<string, any> = {}
    Object.keys(filters).forEach((key) => {
      const value = filters[key]
      if (value === null || value === undefined) {
        return
      }
      if (value === '' || (typeof value === 'string' && value.trim() === '')) {
        return
      }
      if (Array.isArray(value) && value.length === 0) {
        return
      }
      cleaned[key] = value
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
  private handleUsersResponse(response: ApiResponse<ApiData<User[]>>): void {
    const users = response.data?.result || response.data || []
    const totalCount =
      response.data?.meta?.totalItems ||
      (Array.isArray(users) ? users.length : 0)
    if (!Array.isArray(users)) {
      console.error('Users data is not an array:', users)
      this.resetUsersData()
      return
    }
    this.users = users.map((user: User) => ({
      ...user,
      username: this.sanitizeText(user.username, 20),
      firstName: this.sanitizeText(user.firstName, 20),
      lastName: this.sanitizeText(user.lastName, 20),
      email: user.email,
      phone: this.sanitizeText(user.phone ? user.phone : '', 20),
      fullName: this.sanitizeText(
        `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        40
      ),
      debt: user.debt || 0,
      roleName: user.role?.roleName || user.roleId?.roleName || 'Sin rol',
      companyName:
        user.company?.companyName ||
        user.companyId?.companyName ||
        'Sin empresa',
    }))
    this.collectionSize = totalCount
    this.isLoading = false
  }
  private handleUsersError(error: any): void {
    console.error('Error loading users:', error)
    this.toastrService.error('Error al cargar usuarios.', 'Error')
    this.resetUsersData()
  }
  private resetUsersData(): void {
    this.users = []
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
    this.loadAllUsers()
  }
  public onLimitChange(limit: number): void {
    this.limit = limit
    this.resetPaginationAndReload()
  }
  private resetPaginationAndReload(): void {
    this.page = 1
    this.loadAllUsers()
  }
  public reloadTable(): void {
    this.isLoading = true
    this.loadAllUsers()
  }
  public openCreateUserModal(): void {
    this.openModal({
      mode: 'create',
      isEditForm: false,
    })
  }
  public openViewUserModal(user: User): void {
    this.openModal({
      user,
      mode: 'view',
      isEditForm: false,
    })
  }
  public openEditUserModal(user: User): void {
    this.openModal({
      user,
      mode: 'edit',
      isEditForm: true,
    })
  }
  private openModal(data: Partial<UserModalData>): void {
    this.bootstrapModalService.openModal({
      component: CreateMaterialUserComponent,
      data,
      options: {
        size: 'xl',
        backdrop: 'static',
      },
    })
  }
  public toggleUserStatus(user: User): void {
    const action = user.isActive ? 'desactivar' : 'activar'
    const message = `¿Desea ${action} al usuario "${user.username}"?`
    this.alertService
      .showConfirmAlert(message, 'Esta acción es reversible')
      .then((result) => {
        if (result.isConfirmed) {
          this.executeToggleUserStatus(user)
        }
      })
  }
  private executeToggleUserStatus(user: User): void {
    this.userService.toggleUserStatus(user.id!).subscribe({
      next: (response) => {
        this.reloadTable()
      },
      error: () => {
        this.toastrService.error('Error al actualizar el estado', 'Error')
      },
    })
  }
  public getCompanyClasses(companyName: string): Record<string, boolean> {
    const isNoCompany = !companyName || companyName === 'Sin empresa'
    return isNoCompany
      ? { 'bg-secondary': true, 'text-white': true }
      : { 'bg-info': true, 'text-white': true }
  }
  public formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }
  public sendDebtMessage(user: User): void {
    if (!user.phone) {
      this.toastrService.error(
        'El usuario no tiene número de teléfono configurado',
        'Error'
      )
      return
    }
    if (!user.debt || parseFloat(user.debt.toString()) <= 0) {
      this.toastrService.warning(
        'El usuario no tiene deudas pendientes',
        'Advertencia'
      )
      return
    }
    const message = `¿Enviar mensaje de deuda a ${user.firstName} ${user.lastName}?`
    this.alertService
      .showConfirmAlert(
        message,
        'Se enviará un mensaje de WhatsApp con el recordatorio de deuda'
      )
      .then((result) => {
        if (result.isConfirmed) {
          this.executeSendDebtMessage(user)
        }
      })
  }
  private executeSendDebtMessage(user: User): void {
    this.whatsappService
      .sendDebtMessage({ userId: user.id! })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.toastrService.success(
            `Mensaje de deuda enviado exitosamente a ${user.firstName} ${user.lastName}`,
            'Éxito'
          )
        },
        error: (error) => {
          console.error('Error sending debt message:', error)
          let errorMessage = 'Error al enviar mensaje de deuda'
          if (error.error?.message) {
            errorMessage = error.error.message
          }
          this.toastrService.error(errorMessage, 'Error')
        },
      })
  }
  public hasDebt(user: User): boolean {
    return !!(user.debt && parseFloat(user.debt.toString()) > 0)
  }
  public hasPhoneNumber(user: User): boolean {
    return !!(user.phone && user.phone.trim() !== '')
  }
  public canSendWhatsAppMessage(user: User): boolean {
    return this.hasDebt(user) && this.hasPhoneNumber(user)
  }
  public openWhatsAppConfig(): void {
    this.router.navigate(['/whatsapp/configuration'])
  }
}
