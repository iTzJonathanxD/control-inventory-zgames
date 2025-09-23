import { CommonModule } from '@angular/common'
import { Component, inject, OnInit } from '@angular/core'
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms'
import { FilterCommunicationService } from '@core/services/ui/filter-comumunication.service'
import { TranslatePipe } from '@ngx-translate/core'
import { FlatpickrDirective } from '@/app/shared/directives/flatpickr.directive'
import { format } from 'date-fns'
@Component({
  selector: 'categories-filter-form',
  standalone: true,
  imports: [
    TranslatePipe,
    CommonModule,
    ReactiveFormsModule,
    FlatpickrDirective,
  ],
  templateUrl: './categories-filter-form.component.html',
})
export class CategoriesFilterFormComponent implements OnInit {
  public categoriesFilterForm!: FormGroup
  public currentDatePlaceholder = ''
  public endOfMonthPlaceholder = ''
  public defaultFromDate = ''
  public defaultToDate = ''
  private _formBuilder = inject(FormBuilder)
  private _filterCommunicationService = inject(FilterCommunicationService)
  ngOnInit(): void {
    this.setDefaultDates()
    this.categoriesFilterForm = this._formBuilder.group({
      categoryName: [''],
      isActive: [null],
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
    this.categoriesFilterForm.reset({
      categoryName: '',
      isActive: null,
      fromDate: this.defaultFromDate,
      toDate: this.defaultToDate,
    })
    const filter = {
      categoryName: '',
      isActive: null,
      fromDate: this.defaultFromDate,
      toDate: this.defaultToDate,
      _forceReload: Date.now(),
    }
    this._filterCommunicationService.changeFilter({ ...filter })
  }
  public onSubmit(): void {
    if (!this.categoriesFilterForm.valid) return
    const form = this.categoriesFilterForm.value
    const filter: any = {}
    if (form.categoryName && form.categoryName.trim() !== '') {
      filter.categoryName = form.categoryName.trim()
    }
    if (form.isActive !== null && form.isActive !== undefined) {
      filter.isActive = form.isActive
    }
    if (form.fromDate) {
      filter.fromDate = form.fromDate
    } else {
      filter.fromDate = this.defaultFromDate
    }
    if (form.toDate) {
      filter.toDate = form.toDate
    } else {
      filter.toDate = this.defaultToDate
    }
    console.log('Categories filter being sent:', filter)
    this._filterCommunicationService.changeFilter(filter)
  }
}
