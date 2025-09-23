import { FlatpickrDirective } from '@/app/shared/directives/flatpickr.directive'
import { CommonModule } from '@angular/common'
import { Component, inject, OnInit } from '@angular/core'
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms'
import { NgSelect } from '@core/interfaces/ui/ui.interface'
import { FilterCommunicationService } from '@core/services/ui/filter-comumunication.service'
import { NgSelectModule } from '@ng-select/ng-select'
import { TranslatePipe } from '@ngx-translate/core'
import { Observable, of } from 'rxjs'
import { format } from 'date-fns'
import { MOVEMENT_TYPE_OPTIONS } from '@core/helpers/global/global.constants'
import { CategoryService } from '@core/services/api/category.service'
@Component({
  selector: 'inventory-filter-form',
  standalone: true,
  imports: [
    TranslatePipe,
    NgSelectModule,
    CommonModule,
    ReactiveFormsModule,
    FlatpickrDirective,
  ],
  templateUrl: './inventory-filter-form.component.html',
})
export class InventoryFilterFormComponent implements OnInit {
  public inventoryFilterForm!: FormGroup
  public currentDatePlaceholder = ''
  public endOfMonthPlaceholder = ''
  public defaultFromDate = ''
  public defaultToDate = ''
  private _formBuilder = inject(FormBuilder)
  private _filterCommunicationService = inject(FilterCommunicationService)
  private _categoryService = inject(CategoryService)
  public movementTypes$: Observable<NgSelect<string>[]> = of(
    Object.entries(MOVEMENT_TYPE_OPTIONS).map(([key, value]) => ({
      label: value,
      value: key,
    }))
  )
  public categories$: Observable<NgSelect<number>[]> =
    this._categoryService.getCategoriesAsNgSelect()
  ngOnInit(): void {
    this.setDefaultDates()
    this.inventoryFilterForm = this.getConfigFilterForm()
  }
  private getConfigFilterForm(): FormGroup {
    return this._formBuilder.group({
      productName: [''],
      categoryId: [null],
      movementType: [null],
      fromDate: [this.defaultFromDate],
      toDate: [this.defaultToDate],
    })
  }
  private setDefaultDates(): void {
    const now = new Date()
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
      0
    )
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59
    )
    this.defaultFromDate = format(startOfDay, 'yyyy-MM-dd HH:mm')
    this.defaultToDate = format(endOfMonth, 'yyyy-MM-dd HH:mm')
    this.currentDatePlaceholder = this.defaultFromDate
    this.endOfMonthPlaceholder = this.defaultToDate
  }
  public onReset(): void {
    this.inventoryFilterForm.reset({
      productName: '',
      categoryId: null,
      movementType: null,
      fromDate: this.defaultFromDate,
      toDate: this.defaultToDate,
    })
    const filter = {
      productName: '',
      categoryId: null,
      movementType: null,
      startDate: this.defaultFromDate,
      endDate: this.defaultToDate,
      _forceReload: Date.now(),
    }
    this._filterCommunicationService.changeFilter({ ...filter })
  }
  public onSubmit(): void {
    if (!this.inventoryFilterForm.valid) return
    const form = this.inventoryFilterForm.value
    const filter: any = {}
    if (form.productName) filter.productName = form.productName
    if (form.categoryId) filter.categoryId = form.categoryId
    if (form.movementType) filter.movementType = form.movementType
    filter.startDate = form.fromDate || this.defaultFromDate
    filter.endDate = form.toDate || this.defaultToDate
    const cleanedFilter = Object.fromEntries(
      Object.entries(filter).filter(
        ([_, value]) => value !== null && value !== ''
      )
    )
    this._filterCommunicationService.changeFilter(cleanedFilter)
  }
}
