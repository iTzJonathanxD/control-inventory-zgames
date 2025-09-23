import { Component, OnInit, OnDestroy, Inject, inject } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Subject, takeUntil } from 'rxjs'
import { ToastrService } from 'ngx-toastr'
import {
  NgbPaginationModule,
  NgbTooltipModule,
  NgbModule,
  NgbToastModule,
} from '@ng-bootstrap/ng-bootstrap'
import { CategoryService } from '@core/services/api/category.service'
import { AlertService } from '@core/services/ui/alert.service'
import { BootstrapModalService } from '@core/services/ui/bootstrap-modal.service'
import {
  Category,
  CategoryModalData,
} from '@core/interfaces/api/category.interface'
import { CategoryFormComponent } from '../../forms/category-form/category-form.component'
import { PageTitleComponent } from '@/app/shared/components/layouts/page-title/page-title.component'
import { FormsModule } from '@angular/forms'
import { TranslateModule } from '@ngx-translate/core'
import {
  COLUMNS_CATEGORY_TABLE,
  PRODUCT_TABLE_COLUMNS,
} from '@core/helpers/ui/constants'
import { TooglePanelComponent } from '@/app/shared/components/accordions/toogle-panel/toogle-panel.component'
import { FilterCommunicationService } from '@core/services/ui/filter-comumunication.service'
import { CategoriesFilterFormComponent } from '../../filter/categories-filter-form/categories-filter-form.component'
import { PERMISSIONS } from '@/app/shared/data/config/constants.permission'
import { Store } from '@ngrx/store'
import { AppState } from '@core/states'
import {
  selectAuth,
  selectUser,
  selectUserPermissions,
} from '@core/states/auth/auth.selectors'
import { LoadingSpinnerComponent } from '../../../../../shared/components/ui/loading-spinner/loading-spinner.component'
@Component({
  selector: 'app-category-table',
  templateUrl: './category-table.component.html',
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
export class CategoryTableComponent implements OnInit, OnDestroy {
  public readonly Math = Math
  public categories: Category[] = []
  public isLoading = false
  public collectionSize = 0
  public page = 1
  public limit = 10
  public filters: Record<string, any> = {}
  public userPermissions: string[] = []
  public readonly PERMISSIONS = PERMISSIONS
  private readonly store = inject(Store<AppState>)
  private readonly destroy$ = new Subject<void>()
  public readonly columnsTable = COLUMNS_CATEGORY_TABLE
  public readonly filterComponent = CategoriesFilterFormComponent
  private readonly categoryService = inject(CategoryService)
  private readonly toastrService = inject(ToastrService)
  private readonly alertService = inject(AlertService)
  private readonly bootstrapModalService = inject(
    BootstrapModalService<CategoryModalData>
  )
  private readonly filterCommunicationService = inject(
    FilterCommunicationService
  )
  public get visibleColumns() {
    return this.columnsTable.filter((column) => column.visible)
  }
  ngOnInit(): void {
    this.subscribeToFilterChanges()
    this.subscribeToAuthState()
    this.loadCategories()
  }
  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }
  public loadCategories(): void {
    this.isLoading = true
    const minLoadingTime = 600
    const startTime = Date.now()
    const currentFilters = {
      ...this.filters,
      ...this.filterCommunicationService.getCurrentFilter(),
    }
    const cleanFilters = this.cleanEmptyFilters(currentFilters)
    this.categoryService
      .findAllCategories(this.page, this.limit, cleanFilters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.categories = response.data?.result || []
          this.collectionSize = response.data?.meta?.totalItems || 0
          const elapsedTime = Date.now() - startTime
          const remainingTime = Math.max(0, minLoadingTime - elapsedTime)
          setTimeout(() => {
            this.isLoading = false
          }, remainingTime)
        },
        error: (error) => {
          console.error('Error loading categories:', error)
          this.toastrService.error('Error al cargar categorías', 'Error')
          const elapsedTime = Date.now() - startTime
          const remainingTime = Math.max(0, minLoadingTime - elapsedTime)
          setTimeout(() => {
            this.isLoading = false
          }, remainingTime)
        },
      })
  }
  private subscribeToFilterChanges(): void {
    this.filterCommunicationService
      .getFilterObservable()
      .pipe(takeUntil(this.destroy$))
      .subscribe((filters) => {
        if (!filters || Object.keys(filters).length === 0) {
          this.filters = {}
        } else {
          this.filters = { ...filters }
        }
        this.page = 1
        this.reloadTable()
      })
  }
  public applyFilters(filters: Record<string, any>): void {
    this.filterCommunicationService.changeFilter(filters)
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
          this.loadCategories()
        }
      })
  }
  public hasPermission(permission: string): boolean {
    return this.userPermissions.includes(permission)
  }
  public clearFilters(): void {
    this.filterCommunicationService.resetFilter()
    this.filters = {}
    this.reloadTable()
  }
  public getCurrentFilters(): Record<string, any> {
    return {
      ...this.filters,
      ...this.filterCommunicationService.getCurrentFilter(),
    }
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
  public onPageChange(page: number): void {
    this.page = page
    this.loadCategories()
  }
  public onLimitChange(limit: number): void {
    this.limit = limit
    this.page = 1
    this.loadCategories()
  }
  public reloadTable(): void {
    this.isLoading = true
    this.loadCategories()
  }
  public openCreateCategoryModal(): void {
    this.openCategoryModal({
      mode: 'create',
      isEditForm: false,
    })
  }
  public openEditCategoryModal(category: Category): void {
    this.openCategoryModal({
      category,
      mode: 'edit',
      isEditForm: true,
    })
  }
  public openViewCategoryModal(category: Category): void {
    this.openCategoryModal({
      category,
      mode: 'view',
      isEditForm: false,
    })
  }
  private openCategoryModal(data: any): void {
    this.bootstrapModalService.openModal({
      component: CategoryFormComponent,
      data,
      options: {
        size: 'lg',
        backdrop: 'static',
      },
    })
  }
  public toggleCategoryStatus(category: Category): void {
    const action = category.isActive ? 'desactivar' : 'activar'
    const message = `¿Desea ${action} la categoría "${category.categoryName}"?`
    this.alertService
      .showConfirmAlert(message, 'Esta acción es reversible')
      .then((result) => {
        if (result.isConfirmed) {
          this.executeToggleCategoryStatus(category)
        }
      })
  }
  private executeToggleCategoryStatus(category: Category): void {
    if (!category.id) return
    this.categoryService.toggleCategoryStatus(category.id).subscribe({
      next: () => {
        this.loadCategories()
        this.toastrService.success('Estado actualizado correctamente', 'Éxito')
      },
      error: () => {
        this.toastrService.error('Error al actualizar el estado', 'Error')
      },
    })
  }
  public deleteCategory(category: Category): void {
    if (!category.id) return
    const message = `¿Está seguro de eliminar la categoría "${category.categoryName}"?`
    const subMessage = 'Esta acción no se puede deshacer'
    this.alertService
      .showConfirmAlert(message, subMessage, 'warning')
      .then((result) => {
        if (result.isConfirmed) {
          this.executeDeleteCategory(category)
        }
      })
  }
  private executeDeleteCategory(category: Category): void {
    if (!category.id) return
    this.categoryService.deleteCategory(category.id).subscribe({
      next: () => {
        this.loadCategories()
        this.toastrService.success('Categoría eliminada correctamente', 'Éxito')
      },
      error: () => {
        this.toastrService.error('Error al eliminar la categoría', 'Error')
      },
    })
  }
  public deleteSelectedCategories(selectedCategories: Category[]): void {
    if (selectedCategories.length === 0) {
      this.toastrService.warning(
        'No se han seleccionado categorías para eliminar',
        'Advertencia'
      )
      return
    }
    const message = `¿Está seguro de eliminar estas ${selectedCategories.length} categorías?`
    const subMessage = 'Esta acción no se puede deshacer'
    this.alertService
      .showConfirmAlert(message, subMessage, 'warning')
      .then((result) => {
        if (result.isConfirmed) {
        }
      })
  }
}
