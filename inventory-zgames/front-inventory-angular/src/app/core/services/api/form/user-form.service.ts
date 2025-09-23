import { Injectable } from '@angular/core'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { ModalMode, User } from '@core/interfaces/api/user.interface'
@Injectable({
  providedIn: 'root',
})
export class UserFormService {
  private readonly FIELD_GROUPS = {
    editable: [
      'username',
      'firstName',
      'lastName',
      'email',
      'address',
      'phone',
      'roleId',
      'companyId',
      'isActive',
      'profilePhoto',
    ],
    readOnly: [
      'id',
      'isLocked',
      'createdAt',
      'updatedAt',
      'failedLoginAttempts',
    ],
    password: 'password',
  } as const
  private readonly VALIDATORS = {
    required: Validators.required,
    email: Validators.email,
    minLength3: Validators.minLength(3),
    minLength8: Validators.minLength(8),
  } as const
  constructor(private fb: FormBuilder) {}
  createUserForm(): FormGroup {
    return this.fb.group({
      id: [{ value: '', disabled: true }],
      username: ['', [this.VALIDATORS.required, this.VALIDATORS.minLength3]],
      firstName: ['', this.VALIDATORS.required],
      lastName: ['', this.VALIDATORS.required],
      email: ['', [this.VALIDATORS.required, this.VALIDATORS.email]],
      password: ['', [this.VALIDATORS.required, this.VALIDATORS.minLength8]],
      address: [''],
      phone: ['', this.VALIDATORS.required],
      roleId: ['', this.VALIDATORS.required],
      companyId: ['', this.VALIDATORS.required],
      isLocked: [{ value: '', disabled: true }],
      isActive: [true],
      profilePhoto: [''],
      createdAt: [{ value: '', disabled: true }],
      updatedAt: [{ value: '', disabled: true }],
      failedLoginAttempts: [{ value: 0, disabled: true }],
    })
  }
  patchUserForm(form: FormGroup, user: User): void {
    form.patchValue({
      ...user,
      id: user.id || '',
      username: user.username || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      address: user.address || '',
      phone: user.phone || '',
      roleId: user.roleId || '',
      companyId: user.companyId || '',
      isLocked: user.isLocked ? 'Bloqueado' : 'Desbloqueado',
      isActive: user.isActive ?? true,
      profilePhoto: user.profilePhoto || '',
      createdAt: user.createdAt ? this.formatDate(user.createdAt) : '',
      updatedAt: user.updatedAt ? this.formatDate(user.updatedAt) : '',
      failedLoginAttempts: user.failedLoginAttempts || 0,
    })
  }
  configureFormFields(form: FormGroup, mode: ModalMode): void {
    const configurations = {
      view: () =>
        this.toggleFields(form, Object.keys(form.controls) as string[], false),
      edit: () => {
        this.toggleFields(form, this.FIELD_GROUPS.editable, true)
        this.configurePasswordField(form, false)
      },
      create: () => {
        this.toggleFields(form, this.FIELD_GROUPS.editable, true)
        this.configurePasswordField(form, true)
        this.toggleFields(form, this.FIELD_GROUPS.readOnly, false)
      },
    }
    configurations[mode]?.()
  }
  buildUserData(formData: any, isCreate: boolean): Partial<User> {
    const baseData: Partial<User> = {
      username: formData.username?.trim(),
      firstName: formData.firstName?.trim(),
      lastName: formData.lastName?.trim(),
      email: formData.email?.trim(),
      address: formData.address?.trim(),
      phone: formData.phone?.trim(),
      roleId: formData.roleId,
      companyId: formData.companyId,
      isActive: formData.isActive,
      profilePhoto: formData.profilePhoto?.trim(),
    }
    return isCreate && formData.password
      ? { ...baseData, password: formData.password?.trim() }
      : baseData
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
  private configurePasswordField(form: FormGroup, enable: boolean): void {
    const passwordControl = form.get(this.FIELD_GROUPS.password)
    if (enable) {
      passwordControl?.enable()
      passwordControl?.setValidators([
        this.VALIDATORS.required,
        this.VALIDATORS.minLength8,
      ])
    } else {
      passwordControl?.disable()
      passwordControl?.clearValidators()
    }
    passwordControl?.updateValueAndValidity()
  }
  private formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString()
  }
}
