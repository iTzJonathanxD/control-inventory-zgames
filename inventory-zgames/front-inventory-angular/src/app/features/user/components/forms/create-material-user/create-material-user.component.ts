import { Component, OnInit, OnDestroy, inject } from '@angular/core'
import { FormGroup } from '@angular/forms'
import { CommonModule } from '@angular/common'
import { ReactiveFormsModule } from '@angular/forms'
import { Subject, takeUntil } from 'rxjs'
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap'
import { ToastrService } from 'ngx-toastr'
import { TranslateService, TranslateModule } from '@ngx-translate/core'
import { select, Store } from '@ngrx/store'
import {
  ModalMode,
  User,
  UserModalData,
} from '@core/interfaces/api/user.interface'
import { Role } from '@core/interfaces/api/rol.interface'
import { Company } from '@core/interfaces/api/company.interface'
import { UserService } from '@core/services/api/user.service'
import { RoleService } from '@core/services/api/role.service'
import { CompanyService } from '@core/services/api/company.service'
import { BootstrapModalService } from '@core/services/ui/bootstrap-modal.service'
import { UserFormService } from '@core/services/api/form/user-form.service'
import { AppState } from '@core/states'
import {
  selectAuth,
  selectUserPermissions,
} from '@core/states/auth/auth.selectors'
import { PERMISSIONS } from '@/app/shared/data/config/constants.permission'
@Component({
  selector: 'app-create-material-user',
  templateUrl: './create-material-user.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
})
export class CreateMaterialUserComponent implements OnInit, OnDestroy {
  public userDetailsForm!: FormGroup
  public validate = false
  public isLoading = false
  public modalMode: ModalMode = 'create'
  public modalData?: UserModalData
  public selectedUser?: User
  public roles: Role[] = []
  public companies: Company[] = []
  public userPermissions: string[] = []
  public readonly PERMISSIONS = PERMISSIONS
  private readonly destroy$ = new Subject<void>()
  private readonly activeModal = inject(NgbActiveModal)
  private readonly bootstrapModalService = inject(
    BootstrapModalService<UserModalData>
  )
  private readonly userFormService = inject(UserFormService)
  private readonly userService = inject(UserService)
  private readonly roleService = inject(RoleService)
  private readonly companyService = inject(CompanyService)
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
    this.userDetailsForm = this.userFormService.createUserForm()
  }
  private initModalData(): void {
    this.bootstrapModalService
      .getDataIssued()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        if (!data) return
        this.modalData = data
        this.modalMode = data.mode ?? 'create'
        this.selectedUser = data.user
        this.applyModeToForm()
      })
  }
  private applyModeToForm(): void {
    if (
      this.selectedUser &&
      (this.modalMode === 'edit' || this.modalMode === 'view')
    ) {
      this.userFormService.patchUserForm(
        this.userDetailsForm,
        this.selectedUser
      )
    }
    this.userFormService.configureFormFields(
      this.userDetailsForm,
      this.modalMode
    )
  }
  private loadInitialData(): void {
    this.loadRoles()
    this.loadCompanies()
  }
  private loadRoles(): void {
    this.roleService
      .getAllRoles()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => (this.roles = res.data?.result ?? []),
        error: (err) => this.handleLoadError('roles', err),
      })
  }
  private loadCompanies(): void {
    this.companyService
      .getCompanies()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => (this.companies = res.data?.result ?? []),
        error: (err) => this.handleLoadError('empresas', err),
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
    this.userDetailsForm.markAllAsTouched()
    if (this.userDetailsForm.invalid) {
      this.validate = true
      this.toastr.warning(
        this.translate.instant('Messages.CompleteRequiredFields'),
        this.translate.instant('common.warning')
      )
      return
    }
    const data = this.userDetailsForm.getRawValue()
    this.modalMode === 'create' ? this.createUser(data) : this.updateUser(data)
  }
  private createUser(formData: any): void {
    this.toggleLoading(true)
    console.log('🔍 Frontend - Form data received:', {
      ...formData,
      password: '***HIDDEN***',
    })
    console.log('🔑 Frontend - Password length:', formData.password?.length)
    console.log(
      '🔑 Frontend - Password starts with space:',
      formData.password?.startsWith(' ')
    )
    console.log(
      '🔑 Frontend - Password ends with space:',
      formData.password?.endsWith(' ')
    )
    const payload = this.userFormService.buildUserData(formData, true)
    console.log('📤 Frontend - Payload being sent:', {
      ...payload,
      password: '***HIDDEN***',
    })
    console.log(
      '🔑 Frontend - Payload password length:',
      (payload as any).password?.length
    )
    this.userService
      .createUser(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () =>
          this.handleSuccess(
            'Messages.UserCreated',
            'Usuario creado exitosamente'
          ),
        error: (err) =>
          this.handleError(
            'Messages.ErrorCreatingUser',
            'Error al crear usuario',
            err
          ),
        complete: () => this.toggleLoading(false),
      })
  }
  private updateUser(formData: any): void {
    if (!this.selectedUser?.id) {
      this.toastr.error('ID de usuario inválido')
      return
    }
    this.toggleLoading(true)
    const payload = this.userFormService.buildUserData(formData, false)
    this.userService
      .updateUser(this.selectedUser.id, payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () =>
          this.handleSuccess(
            'Messages.UserUpdated',
            'Usuario actualizado exitosamente'
          ),
        error: (err) =>
          this.handleError(
            'Messages.ErrorUpdatingUser',
            'Error al actualizar usuario',
            err
          ),
        complete: () => this.toggleLoading(false),
      })
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
    console.error('Error en operación:', error)
    const msg = this.translate.instant(key) || fallback
    this.toastr.error(msg, this.translate.instant('common.error'))
  }
  public toggleEditMode(): void {
    this.modalMode = this.modalMode === 'view' ? 'edit' : 'view'
    this.userFormService.configureFormFields(
      this.userDetailsForm,
      this.modalMode
    )
  }
  public closeModal(): void {
    this.activeModal.close()
  }
  public isFieldInvalid(field: string): boolean {
    const ctrl = this.userDetailsForm.get(field)
    return (
      !!ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched || this.validate)
    )
  }
  public getFieldError(field: string): string {
    const errs = this.userDetailsForm.get(field)?.errors ?? {}
    if (errs['required']) return `${field} es requerido`
    if (errs['email']) return 'Email inválido'
    if (errs['minlength'])
      return `Mínimo ${errs['minlength'].requiredLength} caracteres`
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
    const map = {
      create: 'USER.INFO.CREATE_USER',
      edit: 'USER.INFO.EDIT_USER',
      view: 'USER.INFO.VIEW_DETAILS',
    }
    return this.translate.instant(map[this.modalMode]) || 'Usuario'
  }
  public get showPasswordField(): boolean {
    return this.isCreateMode
  }
}
