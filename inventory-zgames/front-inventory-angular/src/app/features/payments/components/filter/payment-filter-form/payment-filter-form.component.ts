import { Component, inject, OnDestroy, OnInit } from '@angular/core'
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms'
import { CommonModule } from '@angular/common'
import { TranslatePipe } from '@ngx-translate/core'
import { NgSelectModule } from '@ng-select/ng-select'
import { Observable, Subject, of } from 'rxjs'
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators'
import { format } from 'date-fns'
import {
  PaymentMethod,
  PaymentStatus,
} from '../../../../../core/interfaces/api/payment.model'
import { CompanyService } from '../../../../../core/services/api/company.service'
import { Company } from '../../../../../core/interfaces/api/company.interface'
import { FilterCommunicationService } from '../../../../../core/services/ui/filter-comumunication.service'
interface NgSelect<T> {
  label: string
  value: T
}
const STATUS_OPTIONS: NgSelect<PaymentStatus>[] = [
  { label: 'Pendiente', value: PaymentStatus.PENDING },
  { label: 'Procesando', value: PaymentStatus.PROCESSING },
  { label: 'Completado', value: PaymentStatus.COMPLETED },
  { label: 'Fallido', value: PaymentStatus.FAILED },
  { label: 'Cancelado', value: PaymentStatus.CANCELLED },
  { label: 'Reembolsado', value: PaymentStatus.REFUNDED },
]
const METHOD_OPTIONS: NgSelect<PaymentMethod>[] = [
  { label: 'Tarjeta de Crédito', value: PaymentMethod.CREDIT_CARD },
  { label: 'Tarjeta de Débito', value: PaymentMethod.DEBIT_CARD },
  { label: 'PayPal', value: PaymentMethod.PAYPAL },
  { label: 'Transferencia Bancaria', value: PaymentMethod.BANK_TRANSFER },
  { label: 'Efectivo', value: PaymentMethod.CASH },
]
const VERIFIED_OPTIONS: NgSelect<boolean>[] = [
  { label: 'Verificado', value: true },
  { label: 'No Verificado', value: false },
]
@Component({
  selector: 'payment-filter-form',
  standalone: true,
  imports: [TranslatePipe, NgSelectModule, CommonModule, ReactiveFormsModule],
  providers: [],
  templateUrl: './payment-filter-form.component.html',
  styleUrl: './payment-filter-form.component.scss',
})
export class PaymentFilterFormComponent implements OnInit, OnDestroy {
  public paymentFilterForm: FormGroup | undefined = undefined
  public currentDatePlaceholder: string = ''
  public endOfMonthPlaceholder: string = ''
  public defaultFromDate: string = ''
  public defaultToDate: string = ''
  public status$: Observable<NgSelect<PaymentStatus>[]> = of(STATUS_OPTIONS)
  public methods$: Observable<NgSelect<PaymentMethod>[]> = of(METHOD_OPTIONS)
  public verified$: Observable<NgSelect<boolean>[]> = of(VERIFIED_OPTIONS)
  public companies$: Observable<Company[]> = of([])
  private readonly destroy$ = new Subject<void>()
  private _formBuilder = inject(FormBuilder)
  private _companyService = inject(CompanyService)
  private _filterCommunicationService = inject(FilterCommunicationService)
  ngOnInit(): void {
    console.log('🚀 Filter Form - Initializing component')
    this.setDefaultDates()
    this.loadSelectOptions()
    this.paymentFilterForm = this.getConfigFilterForm()
    console.log(
      '✅ Filter Form - Component initialized',
      this.paymentFilterForm?.value
    )
  }
  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }
  private getConfigFilterForm(): FormGroup {
    return this._formBuilder.group({
      id: [''],
      orderId: [''],
      transactionId: [''],
      amountFrom: [''],
      amountTo: [''],
      status: [null],
      method: [null],
      isVerified: [null],
      companyId: [null],
      userId: [''],
      fromDate: [''],
      toDate: [''],
      processedFromDate: [''],
      processedToDate: [''],
    })
  }
  private setDefaultDates(): void {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0)
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59
    )
    this.defaultFromDate = format(startOfMonth, 'yyyy-MM-dd HH:mm')
    this.defaultToDate = format(endOfMonth, 'yyyy-MM-dd HH:mm')
    this.currentDatePlaceholder = this.defaultFromDate
    this.endOfMonthPlaceholder = this.defaultToDate
  }
  private loadSelectOptions(): void {
    this.loadCompanies()
  }
  private loadCompanies(): void {
    this._companyService
      .getCompanies()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.companies$ = of(response.data?.result || [])
        },
        error: (error) => {
          console.error('Error loading companies:', error)
          this.companies$ = of([])
        },
      })
  }
  private subscribeToFormChanges(): void {
    this.paymentFilterForm?.valueChanges
      .pipe(
        debounceTime(300),
        takeUntil(this.destroy$)
      )
      .subscribe((formValue) => {
        console.log('⚡ Filter Form - Form changed:', formValue)
        this.applyFilters(formValue)
      })
  }
  private applyFilters(formValue: any): void {
    console.log('🔍 Filter Form - Raw form value:', formValue)
    const formattedFilters = this.formatDatesInFilters(formValue)
    console.log('📅 Filter Form - Formatted filters:', formattedFilters)
    const cleanFilters = this.cleanFilterValues(formattedFilters)
    console.log('✨ Filter Form - Clean filters:', cleanFilters)
    this._filterCommunicationService.changeFilter(cleanFilters)
  }
  private formatDatesInFilters(filterValues: any): any {
    const formatted = { ...filterValues }
    if (formatted.fromDate && formatted.fromDate.trim() !== '') {
      formatted.fromDate = format(
        new Date(formatted.fromDate),
        'yyyy-MM-dd HH:mm'
      )
    } else {
      delete formatted.fromDate
    }
    if (formatted.toDate && formatted.toDate.trim() !== '') {
      formatted.toDate = format(new Date(formatted.toDate), 'yyyy-MM-dd HH:mm')
    } else {
      delete formatted.toDate
    }
    if (
      formatted.processedFromDate &&
      formatted.processedFromDate.trim() !== ''
    ) {
      formatted.processedFromDate = format(
        new Date(formatted.processedFromDate),
        'yyyy-MM-dd HH:mm'
      )
    } else {
      delete formatted.processedFromDate
    }
    if (formatted.processedToDate && formatted.processedToDate.trim() !== '') {
      formatted.processedToDate = format(
        new Date(formatted.processedToDate),
        'yyyy-MM-dd HH:mm'
      )
    } else {
      delete formatted.processedToDate
    }
    return formatted
  }
  public onReset(): void {
    console.log('🔄 Filter Form - Resetting form')
    this.paymentFilterForm?.reset()
    this.setDefaultFormValues()
    this._filterCommunicationService.resetFilter()
    console.log('✅ Filter Form - Reset complete')
  }
  private setDefaultFormValues(): void {
    this.paymentFilterForm?.patchValue({
      id: '',
      orderId: '',
      transactionId: '',
      amountFrom: '',
      amountTo: '',
      fromDate: '',
      toDate: '',
      processedFromDate: '',
      processedToDate: '',
      status: null,
      method: null,
      isVerified: null,
      companyId: null,
      userId: '',
    })
  }
  public loadAllData(): void {
    console.log('📋 Cargando todos los datos sin filtros...')
    this._filterCommunicationService.changeFilter({})
  }
  public onSubmit(): void {
    console.log('🔍 Filter Form - Submit button clicked')
    if (!this.paymentFilterForm?.valid) {
      console.log('❌ Filter Form - Form is invalid')
      return
    }
    const filterValues = { ...this.paymentFilterForm.value }
    console.log('📝 Filter Form - Form values on submit:', filterValues)
    this.applyFilters(filterValues)
  }
  private cleanFilterValues(filterValues: any): Record<string, any> {
    const cleaned: Record<string, any> = {}
    for (const [key, value] of Object.entries(filterValues)) {
      if (this.isValidFilterValue(value)) {
        cleaned[key] = value
      }
    }
    return cleaned
  }
  private isValidFilterValue(value: any): boolean {
    if (value === null || value === undefined || value === '') {
      return false
    }
    if (Array.isArray(value) && value.length === 0) {
      return false
    }
    return true
  }
  public getCompanyName(companyId: number): string {
    let companyName = 'N/A'
    this.companies$
      .subscribe((companies) => {
        const company = companies.find((c) => c.id === companyId.toString())
        companyName = company?.companyName || 'N/A'
      })
      .unsubscribe()
    return companyName
  }
}
