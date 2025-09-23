import { CommonModule } from '@angular/common'
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  type OnDestroy,
  type OnInit,
} from '@angular/core'
import { FormsModule } from '@angular/forms'
import { NgbModule } from '@ng-bootstrap/ng-bootstrap'
import { TranslateModule } from '@ngx-translate/core'
import {
  BehaviorSubject,
  catchError,
  debounceTime,
  distinctUntilChanged,
  of,
  Subject,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs'
import type { Module } from '@core/interfaces/api/module.interface'
import { ModuleService } from '@core/services/api/module.service'
import { SelectionService } from '@core/services/ui/selection.service'
import { BootstrapModalService } from '@core/services/ui/bootstrap-modal.service'
import { ModuleFormComponent } from '../../forms/module-form/module-form.component'
import { MODAL_TYPE } from '@core/helpers/global/global.constants'
import { PermissionFormComponent } from '../../forms/permission-form/permission-form.component'
import { ToastrNotificationService } from '@core/services/ui/notification.service'
@Component({
  selector: 'module-area',
  standalone: true,
  imports: [CommonModule, TranslateModule, NgbModule, FormsModule],
  templateUrl: './module-area.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ModuleAreaComponent implements OnInit, OnDestroy {
  public modules$: BehaviorSubject<Module[]> = new BehaviorSubject<Module[]>([])
  public searchTerm = ''
  public isLoading = false
  public selectedRoleId: number | null = null
  public selectedModuleId: number | null = null
  private searchSubject = new Subject<string>()
  private destroy$ = new Subject<void>()
  private _moduleService = inject(ModuleService)
  private _selectionService = inject(SelectionService)
  private _bootstrapModalService = inject(BootstrapModalService)
  private _notificationService = inject(ToastrNotificationService)
  ngOnInit(): void {
    this.initializeSubscriptions()
    this.loadAllModules()
  }
  private initializeSubscriptions(): void {
    this.subscribeToModalClose()
    this.subscribeToRoleSelection()
    this.subscribeToModuleSearch()
  }
  private subscribeToModalClose(): void {
    this._bootstrapModalService
      .getModalClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.selectedRoleId) {
          this.getModulesByRole()
        } else {
          this.loadAllModules()
        }
      })
  }
  private subscribeToRoleSelection(): void {
    this._selectionService.selectedRoleId$
      .pipe(takeUntil(this.destroy$))
      .subscribe((roleId) => {
        this.selectedRoleId = roleId
        this.selectedModuleId = null
        this._selectionService.setModuleId(null)
        if (roleId) {
          this.getModulesByRole()
        } else {
          this.loadAllModules()
        }
      })
  }
  private subscribeToModuleSearch(): void {
    this.searchSubject
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        tap(() => (this.isLoading = true)),
        switchMap((term) => {
          const filter: any = { page: 1, limit: 50 }
          if (term.trim()) {
            filter.moduleName = term.trim()
          }
          return this._moduleService.findModules(filter).pipe(
            catchError((error) => {
              this._notificationService.showNotification({
                type: 'error',
                title: 'Error',
                message: 'Error al buscar módulos',
              })
              return of({ data: { result: [] } })
            })
          )
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((response) => {
        this.isLoading = false
        this.modules$.next(response.data.result || [])
      })
  }
  private loadAllModules(): void {
    this.isLoading = true
    const filter = { page: 1, limit: 50 }
    this._moduleService
      .findModules(filter)
      .pipe(
        tap((response) => {
          this.isLoading = false
          this.modules$.next(response.data.result || [])
        }),
        catchError((error) => {
          this.isLoading = false
          this.modules$.next([])
          this._notificationService.showNotification({
            type: 'error',
            title: 'Error',
            message: 'Error al cargar los módulos',
          })
          return of({ data: { result: [] } })
        }),
        takeUntil(this.destroy$)
      )
      .subscribe()
  }
  private getModulesByRole(): void {
    if (!this.selectedRoleId) {
      this.loadAllModules()
      return
    }
    this.isLoading = true
    this._moduleService
      .getModulesByRole(this.selectedRoleId)
      .pipe(
        tap((response) => {
          this.isLoading = false
          this.modules$.next(response.data.result || [])
        }),
        catchError((error) => {
          this.isLoading = false
          this.modules$.next([])
          this._notificationService.showNotification({
            type: 'error',
            title: 'Error',
            message: 'Error al cargar módulos del rol',
          })
          return of({ data: { result: [] } })
        }),
        takeUntil(this.destroy$)
      )
      .subscribe()
  }
  public selectModule(moduleId: number): void {
    this.selectedModuleId = moduleId
    this._selectionService.setModuleId(moduleId)
  }
  public onSearchInput(): void {
    this.searchSubject.next(this.searchTerm)
  }
  public searchModules(): void {
    this.searchSubject.next(this.searchTerm)
  }
  public toggleModuleForRole(moduleId: number): void {
    if (!this.selectedRoleId) {
      this._notificationService.showNotification({
        type: 'warning',
        title: 'Advertencia',
        message: 'Seleccione un rol primero',
      })
      return
    }
    this._moduleService
      .toggleModuleStatus(this.selectedRoleId, moduleId)
      .pipe(
        tap(() => {
          this.getModulesByRole()
        }),
        catchError((error) => {
          console.error('error toggling module status:', error)
          return of(null)
        }),
        takeUntil(this.destroy$)
      )
      .subscribe()
  }
  openModal(): void {
    this._bootstrapModalService.openModal({
      component: ModuleFormComponent,
      data: {
        roleId: this.selectedRoleId,
        modalType: MODAL_TYPE.MODULE_FORM,
      },
    })
  }
  openModalPermission(moduleId: number, event: Event): void {
    event.stopPropagation()
    this._bootstrapModalService.openModal({
      component: PermissionFormComponent,
      data: {
        moduleId,
        modalType: MODAL_TYPE.PERMISSION_FORM,
      },
    })
  }
  public openEditModal(moduleId: number, event: Event): void {
    event.stopPropagation()
    this._bootstrapModalService.openModal({
      component: ModuleFormComponent,
      data: {
        moduleId,
        modalType: MODAL_TYPE.MODULE_FORM,
      },
    })
  }
  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }
}
