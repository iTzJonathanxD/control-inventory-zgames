import {
  Component,
  inject,
  Input,
  OnDestroy,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core'
import {
  NgbModule,
  NgbPaginationModule,
  NgbToastModule,
  NgbTooltipModule,
} from '@ng-bootstrap/ng-bootstrap'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { TranslateModule } from '@ngx-translate/core'
import { Subject, takeUntil } from 'rxjs'
import { ToastrService } from 'ngx-toastr'
import { Store } from '@ngrx/store'
import { BootstrapModalService } from '@core/services/ui/bootstrap-modal.service'
import { FilterCommunicationService } from '@core/services/ui/filter-comumunication.service'
import { AppState } from '@core/states'
import { selectAuth } from '@core/states/auth/auth.selectors'
import {
  ApiData,
  ApiResponse,
} from '@core/interfaces/api/api-response.interface'
import { COLUMNS_INVENTORY_TABLE } from '@core/helpers/ui/constants'
import { PageTitleComponent } from '@/app/shared/components/layouts/page-title/page-title.component'
import { MovementService } from '@core/services/api/movement.service'
import {
  InventoryMovement,
  MovementType,
} from '@core/interfaces/api/movement.interface'
import { CreateInventoryMovementComponent } from '../../forms/create-inventory-movement/create-inventory-movement.component'
import { ExportService } from '@core/services/ui/export.service'
import { TooglePanelComponent } from '@/app/shared/components/accordions/toogle-panel/toogle-panel.component'
import { InventoryFilterFormComponent } from '../../filter/inventory-filter-form/inventory-filter-form.component'
@Component({
  selector: 'app-inventory-table',
  templateUrl: './inventory-table.component.html',
  styleUrls: ['./inventory-table.component.scss'],
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
  ],
})
export class InventoryTableComponent implements OnInit, OnChanges, OnDestroy {
  @Input() filters: Record<string, any> = {}
  public readonly columnsTable = COLUMNS_INVENTORY_TABLE
  public readonly Math = Math
  public readonly MovementType = MovementType
  public isLoading = true
  public movements: InventoryMovement[] = []
  public collectionSize = 0
  public page = 1
  public limit = 10
  public userPermissions: string[] = []
  public isExporting = false
  private readonly destroy$ = new Subject<void>()
  private readonly inventoryService = inject(MovementService)
  private readonly bootstrapModalService = inject(BootstrapModalService<any>)
  private readonly toastrService = inject(ToastrService)
  private readonly store = inject(Store<AppState>)
  private readonly filterCommunicationService = inject(
    FilterCommunicationService
  )
  public readonly filterComponent = InventoryFilterFormComponent
  private readonly exportService = inject(ExportService)
  public get visibleColumns() {
    return this.columnsTable.filter((column) => column.visible)
  }
  ngOnInit(): void {
    this.subscribeToEvents()
    this.subscribeToFilterChanges()
    this.initializeData()
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['filters'] && !changes['filters'].firstChange) {
      this.resetPaginationAndReload()
    }
  }
  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }
  private subscribeToEvents(): void {
    this.subscribeToModalEvents()
    this.subscribeToAuthState()
  }
  private subscribeToModalEvents(): void {
    this.bootstrapModalService
      .getModalClosedListener()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.reloadTable())
  }
  private subscribeToAuthState(): void {
    this.store
      .select(selectAuth)
      .pipe(takeUntil(this.destroy$))
      .subscribe((authState) => {
        if (authState) {
          this.loadAllMovements()
        }
      })
  }
  private initializeData(): void {
    this.loadAllMovements()
  }
  private subscribeToFilterChanges(): void {
    this.filterCommunicationService
      .getFilterObservable()
      .pipe(takeUntil(this.destroy$))
      .subscribe((filters) => {
        if (!filters || Object.keys(filters).length === 0) {
          this.filters = {}
          this.resetPaginationAndReload()
        } else {
          this.filters = { ...filters }
          this.resetPaginationAndReload()
        }
      })
  }
  public applyFilters(filters: Record<string, any>): void {
    this.filterCommunicationService.changeFilter(filters)
  }
  public clearFilters(): void {
    this.filterCommunicationService.resetFilter()
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
  public loadAllMovements(): void {
    this.isLoading = true
    const currentFilters = {
      ...this.filters,
      ...this.filterCommunicationService.getCurrentFilter(),
    }
    const cleanFilters = this.cleanEmptyFilters(currentFilters)
    this.inventoryService
      .findAllMovements(this.page, this.limit, cleanFilters)
      .subscribe({
        next: (response) => this.handleMovementsResponse(response),
        error: (error) => this.handleMovementsError(error),
      })
  }
  private handleMovementsResponse(
    response: ApiResponse<ApiData<InventoryMovement[]>>
  ): void {
    const movements = response.data?.result || response.data || []
    const totalCount =
      response.data?.meta?.totalItems ||
      (Array.isArray(movements) ? movements.length : 0)
    if (!Array.isArray(movements)) {
      console.error('Movements data is not an array:', movements)
      this.resetMovementsData()
      return
    }
    this.movements = movements.map((movement: InventoryMovement) => ({
      ...movement,
      productName: this.sanitizeText(
        movement.product?.productName || 'Sin nombre',
        30
      ),
      responsibleName: this.sanitizeText(
        `${movement.user?.firstName || ''} ${movement.user?.lastName || ''}`.trim() ||
          'No asignado',
        40
      ),
      formattedQuantity: movement.quantity.toString(),
      movementTypeLabel: this.getMovementTypeLabel(movement.movementType),
    }))
    this.collectionSize = totalCount
    this.isLoading = false
  }
  private getMovementTypeLabel(type: MovementType): string {
    switch (type) {
      case MovementType.ENTRY:
        return 'Entrada'
      case MovementType.EXIT:
        return 'Salida'
      case MovementType.ADJUSTMENT:
        return 'Ajuste'
      default:
        return 'Desconocido'
    }
  }
  private handleMovementsError(error: any): void {
    console.error('Error loading inventory movements:', error)
    this.toastrService.error(
      'Error al cargar movimientos de inventario.',
      'Error'
    )
    this.resetMovementsData()
  }
  private resetMovementsData(): void {
    this.movements = []
    this.collectionSize = 0
    this.isLoading = false
  }
  private sanitizeText(text: string, maxLength = 50): string {
    if (!text) return '-'
    const cleanText = text.replace(/(.)\1{10,}/g, '$1...')
    return cleanText.length > maxLength
      ? cleanText.substring(0, maxLength) + '...'
      : cleanText
  }
  public onPageChange(page: number): void {
    this.page = page
    this.loadAllMovements()
  }
  public onLimitChange(limit: number): void {
    this.limit = limit
    this.resetPaginationAndReload()
  }
  private resetPaginationAndReload(): void {
    this.page = 1
    this.loadAllMovements()
  }
  public reloadTable(): void {
    this.isLoading = true
    this.loadAllMovements()
  }
  public openCreateEntryModal(): void {
    this.openModal({
      mode: 'create',
      isEditForm: false,
      movementType: MovementType.ENTRY,
    })
  }
  public openCreateExitModal(): void {
    this.openModal({
      mode: 'create',
      isEditForm: false,
      movementType: MovementType.EXIT,
    })
  }
  public openEditMovementModal(movement: InventoryMovement): void {
    this.openModal({
      movement,
      mode: 'edit',
      isEditForm: false,
      movementType: MovementType.ADJUSTMENT,
    })
  }
  public openCreateAdjustmentModal(): void {
    this.openModal({
      mode: 'create',
      isEditForm: false,
      movementType: MovementType.ADJUSTMENT,
    })
  }
  public openViewMovementModal(movement: InventoryMovement): void {
    this.openModal({
      movement,
      mode: 'view',
      isEditForm: false,
    })
  }
  private openModal(data: any): void {
    this.bootstrapModalService.openModal({
      component: CreateInventoryMovementComponent,
      data,
      options: {
        size: 'xl',
        backdrop: 'static',
      },
    })
  }
  public getMovementTypeClasses(type: MovementType): Record<string, boolean> {
    switch (type) {
      case MovementType.ENTRY:
        return { 'bg-success': true, 'text-white': true }
      case MovementType.EXIT:
        return { 'bg-danger': true, 'text-white': true }
      case MovementType.ADJUSTMENT:
        return { 'bg-warning': true, 'text-dark': true }
      default:
        return { 'bg-secondary': true, 'text-white': true }
    }
  }
  public async exportToPDF(): Promise<void> {
    if (this.isExporting) return
    try {
      this.isExporting = true
      this.toastrService.info('Generando reporte PDF...', 'Exportando')
      const allMovements = await this.getAllMovementsForExport()
      await this.exportService.exportToPDF(allMovements, this.filters)
      this.toastrService.success('Reporte PDF generado correctamente', 'Éxito')
    } catch (error) {
      console.error('Error al exportar PDF:', error)
      this.toastrService.error('Error al generar el reporte PDF', 'Error')
    } finally {
      this.isExporting = false
    }
  }
  public async exportToExcel(): Promise<void> {
    if (this.isExporting) return
    try {
      this.isExporting = true
      this.toastrService.info('Generando archivo Excel...', 'Exportando')
      const allMovements = await this.getAllMovementsForExport()
      this.exportService.exportToExcel(allMovements, this.filters)
      this.toastrService.success(
        'Archivo Excel generado correctamente',
        'Éxito'
      )
    } catch (error) {
      console.error('Error al exportar Excel:', error)
      this.toastrService.error('Error al generar el archivo Excel', 'Error')
    } finally {
      this.isExporting = false
    }
  }
  private async getAllMovementsForExport(): Promise<InventoryMovement[]> {
    try {
      const response = await this.inventoryService
        .findAllMovements(1, 10000, this.filters)
        .toPromise()
      const movements = response?.data?.result || response?.data || []
      if (Array.isArray(movements)) {
        return movements as InventoryMovement[]
      } else {
        return []
      }
    } catch (error) {
      console.error('Error al obtener movimientos para exportar:', error)
      throw error
    }
  }
}
