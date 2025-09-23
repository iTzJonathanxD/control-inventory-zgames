import { CommonModule } from '@angular/common'
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  type OnInit,
  type OnDestroy,
} from '@angular/core'
import {
  FormsModule,
  ReactiveFormsModule,
  UntypedFormBuilder,
  type UntypedFormGroup,
  Validators,
} from '@angular/forms'
import { RoleService } from '@core/services/api/role.service'
import { BootstrapModalService } from '@core/services/ui/bootstrap-modal.service'
import { ToastrNotificationService } from '@core/services/ui/notification.service'
import { TranslatePipe } from '@ngx-translate/core'
import { type Subscription, finalize, takeUntil, Subject } from 'rxjs'
@Component({
  selector: 'role-form',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule, TranslatePipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './role-form.component.html',
})
export class RoleFormComponent implements OnInit, OnDestroy {
  roleForm!: UntypedFormGroup
  isEditMode = false
  roleId: string | null = null
  private modalData!: Subscription
  public isLoading = false
  public isLoadingButton = false
  private destroy$ = new Subject<void>()
  private formBuilder = inject(UntypedFormBuilder)
  private _bsModalService = inject(BootstrapModalService)
  private _roleService = inject(RoleService)
  private _notificationService = inject(ToastrNotificationService)
  ngOnInit(): void {
    this.getConfigForm()
    this.getRoleData()
  }
  private getConfigForm(): void {
    this.roleForm = this.formBuilder.group({
      roleName: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.maxLength(500)]],
    })
  }
  private getRoleData(): void {
    this.modalData = this._bsModalService
      .getDataIssued()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        if (data?.roleId) {
          this.roleId = data.roleId
          this.isEditMode = true
          this.loadRoleData()
        }
      })
  }
  private loadRoleData(): void {
    if (!this.roleId) return
    this.isLoading = true
    this._roleService
      .getRoleById(this.roleId)
      .pipe(
        finalize(() => (this.isLoading = false)),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (res) => {
          const roleData = res.data.result
          if (roleData) {
            this.roleForm.patchValue({
              roleName: roleData.roleName,
              description: roleData.description || '',
            })
          }
        },
        error: (error) => {
          console.error('Error loading role data:', error)
          this._notificationService.showNotification({
            type: 'error',
            title: 'ERROR.TITLE',
            message: 'Error loading role data',
          })
        },
      })
  }
  public onSubmit(): void {
    if (this.roleForm.valid) {
      if (this.isEditMode && this.roleId) {
        this.updateRole()
      } else {
        this.createRole()
      }
    } else {
      this.markFormGroupTouched()
    }
  }
  private createRole(): void {
    this.isLoadingButton = true
    this._roleService
      .createRole(this.roleForm.value)
      .pipe(
        finalize(() => (this.isLoadingButton = false)),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: () => {
          this.afterSubmitForm()
        },
        error: (error) => {
          console.error('Error creating role:', error)
        },
      })
  }
  private updateRole(): void {
    this.isLoadingButton = true
    this._roleService
      .updateRole(this.roleId!, this.roleForm.value)
      .pipe(
        finalize(() => (this.isLoadingButton = false)),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: () => {
          this.afterSubmitForm()
        },
        error: (error) => {
          console.error('Error updating role:', error)
        },
      })
  }
  private markFormGroupTouched(): void {
    Object.keys(this.roleForm.controls).forEach((key) => {
      const control = this.roleForm.get(key)
      control?.markAsTouched()
    })
  }
  private afterSubmitForm(): void {
    this.closeModal()
  }
  public closeModal(): void {
    this._bsModalService.closeModal()
  }
  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
    if (this.modalData) {
      this.modalData.unsubscribe()
    }
  }
}
