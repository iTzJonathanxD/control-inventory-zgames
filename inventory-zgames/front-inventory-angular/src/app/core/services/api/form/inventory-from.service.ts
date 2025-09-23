import { Injectable } from '@angular/core'
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms'
import {
  type InventoryMovement,
  MovementType,
  type CreateMovementDto,
} from '@core/interfaces/api/movement.interface'
@Injectable({
  providedIn: 'root',
})
export class InventoryFormService {
  private readonly FIELD_GROUPS = {
    editable: [
      'productId',
      'quantity',
      'reason',
      'userId',
      'provider',
      'responsible',
    ],
    entryOnly: ['unitCost'],
    exitOnly: ['responsible'],
    calculated: ['previousStock', 'newStock', 'totalCost'],
    readOnly: ['id', 'movementType', 'createdAt', 'updatedAt'],
  } as const
  private readonly VALIDATORS = {
    required: Validators.required,
    min0: Validators.min(0),
    min1: Validators.min(1),
    minLength3: Validators.minLength(3),
    positiveNumber: (control: AbstractControl) => {
      const value = control.value
      if (value !== null && (isNaN(value) || value < 0)) {
        return { positiveNumber: true }
      }
      return null
    },
  } as const
  constructor(private readonly fb: FormBuilder) {}
  createMovementForm(): FormGroup {
    return this.fb.group({
      id: [{ value: null, disabled: true }],
      movementType: [MovementType.ENTRY, this.VALIDATORS.required],
      productId: [null, this.VALIDATORS.required],
      quantity: [null, [this.VALIDATORS.required, this.VALIDATORS.min1]],
      previousStock: [{ value: 0, disabled: true }],
      newStock: [{ value: 0, disabled: true }],
      reason: [''],
      unitCost: [null, [this.VALIDATORS.min0]],
      totalCost: [{ value: 0, disabled: true }],
      userId: [null, this.VALIDATORS.required],
      provider: [''],
      responsible: [''],
      createdAt: [{ value: '', disabled: true }],
      updatedAt: [{ value: '', disabled: true }],
    })
  }
  patchMovementForm(form: FormGroup, movement: InventoryMovement): void {
    const patchData = {
      id: movement.id || null,
      movementType: movement.movementType || MovementType.ENTRY,
      productId: movement.productId || null,
      quantity: movement.quantity || null,
      previousStock: movement.previousStock || 0,
      newStock: movement.newStock || 0,
      reason: movement.reason || '',
      provider: movement.provider || '',
      unitCost: movement.unitCost || null,
      totalCost: movement.totalCost || 0,
      userId: movement.userId || null,
      createdAt: movement.createdAt ? this.formatDate(movement.createdAt) : '',
      updatedAt: movement.updatedAt ? this.formatDate(movement.updatedAt) : '',
    }
    form.patchValue(patchData)
  }
  configureFormFields(
    form: FormGroup,
    mode: 'create' | 'edit' | 'view',
    movementType: MovementType
  ): void {
    this.resetFormState(form)
    const configurations = {
      view: () => {
        this.toggleFields(form, Object.keys(form.controls), false)
      },
      edit: () => {
        this.toggleFields(form, this.FIELD_GROUPS.editable, true)
        this.configureMovementTypeFields(form, movementType)
      },
      create: () => {
        this.toggleFields(form, this.FIELD_GROUPS.editable, true)
        this.configureMovementTypeFields(form, movementType)
      },
    }
    configurations[mode]?.()
  }
  buildMovementData(formData: any): CreateMovementDto {
    if (!formData.productId || !formData.quantity || !formData.movementType) {
      throw new Error('Missing required fields for movement creation')
    }
    const baseData: CreateMovementDto = {
      movementType: formData.movementType,
      productId: Number(formData.productId),
      quantity: Number(formData.quantity),
      reason: formData.reason?.trim() || '',
      provider: formData.provider?.trim() || '',
    }
    if (formData.movementType === MovementType.ENTRY && formData.unitCost) {
      baseData.unitCost = Number(formData.unitCost)
    }
    return baseData
  }
  private resetFormState(form: FormGroup): void {
    this.toggleFields(
      form,
      [...this.FIELD_GROUPS.calculated, ...this.FIELD_GROUPS.readOnly],
      false
    )
  }
  private configureMovementTypeFields(
    form: FormGroup,
    movementType: MovementType
  ): void {
    this.clearConditionalValidators(form)
    switch (movementType) {
      case MovementType.ENTRY:
        this.configureEntryFields(form)
        break
      case MovementType.EXIT:
        this.configureExitFields(form)
        break
      case MovementType.ADJUSTMENT:
        this.configureAdjustmentFields(form)
        break
    }
    this.updateFormValidators(form)
  }
  private configureEntryFields(form: FormGroup): void {
    this.toggleFields(form, this.FIELD_GROUPS.entryOnly, true)
    form.get('provider')?.enable()
    form.get('responsible')?.disable()
    const unitCostControl = form.get('unitCost')
    if (unitCostControl) {
      unitCostControl.setValidators([
        this.VALIDATORS.required,
        this.VALIDATORS.min0,
      ])
    }
  }
  private configureExitFields(form: FormGroup): void {
    this.toggleFields(form, this.FIELD_GROUPS.entryOnly, false)
    form.get('provider')?.disable()
    form.get('responsible')?.enable()
    const unitCostControl = form.get('unitCost')
    if (unitCostControl) {
      unitCostControl.clearValidators()
      unitCostControl.setValue(null)
    }
  }
  private configureAdjustmentFields(form: FormGroup): void {
    this.toggleFields(
      form,
      [...this.FIELD_GROUPS.entryOnly, ...this.FIELD_GROUPS.exitOnly],
      false
    )
    form.get('provider')?.disable()
    form.get('responsible')?.disable()
    const unitCostControl = form.get('unitCost')
    if (unitCostControl) {
      unitCostControl.clearValidators()
      unitCostControl.setValue(null)
    }
  }
  private clearConditionalValidators(form: FormGroup): void {
    const conditionalFields = ['unitCost', 'provider', 'responsible']
    conditionalFields.forEach((fieldName) => {
      const control = form.get(fieldName)
      if (control) {
        control.clearValidators()
      }
    })
  }
  private updateFormValidators(form: FormGroup): void {
    Object.keys(form.controls).forEach((key) => {
      const control = form.get(key)
      if (control) {
        control.updateValueAndValidity({ emitEvent: false })
      }
    })
  }
  private toggleFields(
    form: FormGroup,
    fields: readonly string[] | string[],
    enable: boolean
  ): void {
    fields.forEach((field) => {
      const control = form.get(field)
      if (control) {
        if (enable) {
          control.enable({ emitEvent: false })
        } else {
          control.disable({ emitEvent: false })
        }
      }
    })
  }
  private formatDate(date: string | Date): string {
    if (!date) return ''
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date
      if (isNaN(dateObj.getTime())) {
        return ''
      }
      return dateObj.toLocaleString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    } catch (error) {
      console.error('Error formatting date:', error)
      return ''
    }
  }
  calculateNewStock(
    previousStock: number,
    quantity: number,
    movementType: MovementType
  ): number {
    const prevStock = Number(previousStock) || 0
    const qty = Number(quantity) || 0
    switch (movementType) {
      case MovementType.ENTRY:
        return prevStock + qty
      case MovementType.EXIT:
        return Math.max(0, prevStock - qty) 
      case MovementType.ADJUSTMENT:
        return qty
      default:
        return prevStock
    }
  }
  calculateTotalCost(quantity: number, unitCost: number): number {
    const qty = Number(quantity) || 0
    const cost = Number(unitCost) || 0
    return qty * cost
  }
  isValidMovementData(formData: any): boolean {
    const requiredFields = ['movementType', 'productId', 'quantity']
    return requiredFields.every(
      (field) =>
        formData[field] !== null &&
        formData[field] !== undefined &&
        formData[field] !== ''
    )
  }
  getValidationErrors(form: FormGroup): string[] {
    const errors: string[] = []
    Object.keys(form.controls).forEach((key) => {
      const control = form.get(key)
      if (control && control.invalid && control.touched) {
        if (control.errors?.['required']) {
          errors.push(`${key} es requerido`)
        }
        if (control.errors?.['min']) {
          errors.push(`${key} debe ser mayor a ${control.errors['min'].min}`)
        }
        if (control.errors?.['minlength']) {
          errors.push(
            `${key} debe tener al menos ${control.errors['minlength'].requiredLength} caracteres`
          )
        }
        if (control.errors?.['positiveNumber']) {
          errors.push(`${key} debe ser un número positivo`)
        }
      }
    })
    return errors
  }
}
