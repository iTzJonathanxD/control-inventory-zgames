import { Component, inject, OnInit, OnDestroy } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { TranslateModule } from '@ngx-translate/core'
import { NgbModule } from '@ng-bootstrap/ng-bootstrap'
import { Subject } from 'rxjs'
import { CategoryService } from '@core/services/api/category.service'
import { Category } from '@core/interfaces/api/category.interface'
import { FilterCommunicationService } from '@core/services/ui/filter-comumunication.service'
@Component({
  selector: 'app-product-filter-form',
  templateUrl: './product-filter-form.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, NgbModule],
})
export class ProductFilterFormComponent implements OnInit, OnDestroy {
  public filters = {
    productName: '',
    codeName: '',
    description: '',
    categoryId: '',
    isActive: '',
    stockMin: null,
    stockCurrent: null,
    unitPrice: null,
  }
  public categories: Category[] = []
  public isLoading = false
  private readonly destroy$ = new Subject<void>()
  private _filterCommunicationService = inject(FilterCommunicationService)
  private readonly categoryService = inject(CategoryService)
  ngOnInit(): void {
    this.loadCategories()
    this.loadCurrentFilters()
  }
  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }
  private loadCategories(): void {
    this.categoryService.findAllCategories(1, 100, {}).subscribe({
      next: (response) => {
        this.categories = response.data?.result || response.data || []
      },
      error: (error) => {
        console.error('Error loading categories:', error)
      },
    })
  }
  private loadCurrentFilters(): void {
    const currentFilters = this._filterCommunicationService.getCurrentFilter()
    this.filters = { ...this.filters, ...currentFilters }
  }
  public applyFilters(): void {
    const cleanFilters = this.cleanEmptyFilters(this.filters)
    this._filterCommunicationService.changeFilter(cleanFilters)
  }
  public clearFilters(): void {
    this.filters = {
      productName: '',
      codeName: '',
      description: '',
      categoryId: '',
      isActive: '',
      stockMin: null,
      stockCurrent: null,
      unitPrice: null,
    }
    this._filterCommunicationService.resetFilter()
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
}
