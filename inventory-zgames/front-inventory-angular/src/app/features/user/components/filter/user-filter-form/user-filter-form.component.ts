import { CommonModule } from '@angular/common'
import { Component, inject, OnInit, OnDestroy } from '@angular/core'
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms'
import {
  BLOCKED_OPTIONS,
  ACTIVE_OPTIONS,
  DEBT_OPTIONS,
} from '@core/helpers/global/global.constants'
import { NgSelect } from '@core/interfaces/ui/ui.interface'
import { FilterCommunicationService } from '@core/services/ui/filter-comumunication.service'
import { CompanyService } from '@core/services/api/company.service'
import { RoleService } from '@core/services/api/role.service'
import { NgSelectModule } from '@ng-select/ng-select'
import { TranslatePipe } from '@ngx-translate/core'
import { Observable, of, Subject, takeUntil } from 'rxjs'
import { Company } from '@core/interfaces/api/company.interface'
import { Role } from '@core/interfaces/api/rol.interface'
@Component({
  selector: 'user-filter-form',
  standalone: true,
  imports: [TranslatePipe, NgSelectModule, CommonModule, ReactiveFormsModule],
  providers: [],
  templateUrl: './user-filter-form.component.html',
})
export class UserFilterFormComponent implements OnInit, OnDestroy {
  public userFilterForm: FormGroup | undefined = undefined
  public blocked$: Observable<NgSelect<boolean>[]> = of(BLOCKED_OPTIONS)
  public active$: Observable<NgSelect<boolean>[]> = of(ACTIVE_OPTIONS)
  public debt$: Observable<NgSelect<boolean>[]> = of(DEBT_OPTIONS)
  public companies$: Observable<Company[]> = of([])
  public roles$: Observable<Role[]> = of([])
  private readonly destroy$ = new Subject<void>()
  private _formBuilder = inject(FormBuilder)
  private _filterCommunicationService = inject(FilterCommunicationService)
  private _companyService = inject(CompanyService)
  private _roleService = inject(RoleService)
  ngOnInit(): void {
    this.loadSelectOptions()
    this.userFilterForm = this.getConfigFilterForm()
  }
  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }
  private getConfigFilterForm(): FormGroup {
    return this._formBuilder.group({
      id: [''],
      username: [''],
      firstName: [''],
      lastName: [''],
      email: [''],
      phone: [''],
      address: [''],
      isLocked: [null],
      isActive: [null],
      debt: [null],
      failedLoginAttempts: [''],
      roleId: [null],
      companyId: [null],
      fullName: [''],
      roleName: [''],
      companyName: [''],
      createdAt: [''],
      updatedAt: [''],
    })
  }
  private loadSelectOptions(): void {
    this.loadCompanies()
    this.loadRoles()
  }
  private loadCompanies(): void {
    this._companyService
      .getCompanies()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          const companies = response?.data?.result || response?.data || []
          this.companies$ = of(Array.isArray(companies) ? companies : [])
        },
        error: (error) => {
          console.error('Error loading companies:', error)
          this.companies$ = of([])
        },
      })
  }
  private loadRoles(): void {
    this._roleService
      .getAllRoles()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          const roles = response?.data?.result || response?.data || []
          this.roles$ = of(Array.isArray(roles) ? roles : [])
        },
        error: (error) => {
          console.error('Error loading roles:', error)
          this.roles$ = of([])
        },
      })
  }
  public onReset(): void {
    this.userFilterForm?.reset()
    this.setDefaultFormValues()
    this._filterCommunicationService.resetFilter()
  }
  private setDefaultFormValues(): void {
    this.userFilterForm?.patchValue({
      isLocked: null,
      isActive: null,
      debt: null,
      roleId: null,
      companyId: null,
    })
  }
  public onSubmit(): void {
    if (!this.userFilterForm?.valid) return
    const filterValues = { ...this.userFilterForm.value }
    console.log('Filter values before cleaning:', filterValues)
    console.log('ID filter:', filterValues.id, 'Type:', typeof filterValues.id)
    const cleanedFilter = this.cleanFilterValues(filterValues)
    console.log('Cleaned filter being sent:', cleanedFilter)
    this._filterCommunicationService.changeFilter(cleanedFilter)
  }
  private cleanFilterValues(filterValues: any): Record<string, any> {
    const cleaned: Record<string, any> = {}
    Object.entries(filterValues).forEach(([key, value]) => {
      if (this.isValidFilterValue(value)) {
        cleaned[key] = value
      }
    })
    return cleaned
  }
  private isValidFilterValue(value: any): boolean {
    if (value === null || value === undefined) {
      return false
    }
    if (value === '' || (typeof value === 'string' && value.trim() === '')) {
      return false
    }
    if (Array.isArray(value) && value.length === 0) {
      return false
    }
    if (typeof value === 'number') {
      return true
    }
    if (typeof value === 'boolean') {
      return true
    }
    return true
  }
  public getCompanyName(companyId: number): string {
    return companyId ? `Company ${companyId}` : ''
  }
  public getRoleName(roleId: number): string {
    return roleId ? `Role ${roleId}` : ''
  }
}
