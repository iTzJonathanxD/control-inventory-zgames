import { CommonModule } from '@angular/common'
import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  OnDestroy,
  OnInit,
} from '@angular/core'
import { FormsModule } from '@angular/forms'
import { MODAL_TYPE } from '@core/helpers/global/global.constants'
import { Permission } from '@core/interfaces/api/permission.interface'
import { PermissionService } from '@core/services/api/permission.service'
import { BootstrapModalService } from '@core/services/ui/bootstrap-modal.service'
import { SelectionService } from '@core/services/ui/selection.service'
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
import { PermissionFormComponent } from '../../forms/permission-form/permission-form.component'
@Component({
  selector: 'permission-rigth-side-bar',
  standalone: true,
  imports: [CommonModule, TranslateModule, NgbModule, FormsModule],
  templateUrl: './permission-rigth-side-bar.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PermissionRigthSideBarComponent implements OnInit, OnDestroy {
  public permissions$: BehaviorSubject<Permission[]> = new BehaviorSubject<
    Permission[]
  >([])
  public searchTerm: string = ''
  public isLoading: boolean = false
  public selectedModuleId: number | null = null
  public selectedRoleId: number | null = null
  public currentPage: number = 1
  public pageSize: number = 10
  private searchSubject = new Subject<string>()
  private destroy$ = new Subject<void>()
  private _permissionsService = inject(PermissionService)
  private _selectionService = inject(SelectionService)
  private _bootstrapModalService = inject(BootstrapModalService)
  ngOnInit(): void {
    this.initializeSubscriptions()
  }
  private initializeSubscriptions(): void {
    this.subscribeToModalCloseForPermissions()
    this.subscribeToRoleSelectionForPermissions()
    this.subscribeToModuleSelectionForPermissions()
    this.subscribeToPermissionSearch()
  }
  private subscribeToModalCloseForPermissions(): void {
    this._bootstrapModalService.getModalClosed().subscribe(() => {
      this._bootstrapModalService.getDataIssued().subscribe((data) => {
        if (data?.modalType === MODAL_TYPE.PERMISSION_FORM) {
          this.loadPermissionsByModule()
        }
      })
    })
  }
  private subscribeToRoleSelectionForPermissions(): void {
    this._selectionService.selectedRoleId$
      .pipe(takeUntil(this.destroy$))
      .subscribe((roleId) => {
        this.selectedRoleId = roleId
        this.permissions$.next([])
      })
  }
  private subscribeToModuleSelectionForPermissions(): void {
    this._selectionService.selectedModuleId$
      .pipe(takeUntil(this.destroy$))
      .subscribe((moduleId) => {
        this.selectedModuleId = moduleId
        if (moduleId) {
          this.loadPermissionsByModule()
        } else {
          this.permissions$.next([])
        }
      })
  }
  private subscribeToPermissionSearch(): void {
    this.searchSubject
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((term) =>
          this._permissionsService.getPermissionsByRoleAndModule(
            this.selectedRoleId!,
            this.selectedModuleId!,
            term,
            this.currentPage,
            this.pageSize
          )
        ),
        takeUntil(this.destroy$)
      )
      .subscribe((response) => {
        this.permissions$.next(response.data.result)
      })
  }
  private loadPermissionsByModule(): void {
    if (!this.selectedRoleId || !this.selectedModuleId) return
    this.isLoading = true
    this._permissionsService
      .getPermissionsByRoleAndModule(
        this.selectedRoleId,
        this.selectedModuleId,
        this.searchTerm,
        this.currentPage,
        this.pageSize
      )
      .pipe(
        tap((response) => {
          this.isLoading = false
          this.permissions$.next(response.data.result)
        }),
        catchError((err) => {
          this.isLoading = false
          return of([])
        })
      )
      .subscribe()
      .add(() => (this.isLoading = false))
  }
  public selectModule(moduleId: number): void {
    this.selectedModuleId = moduleId
    this._selectionService.setModuleId(moduleId)
  }
  public onSearchInput(): void {
    this.searchSubject.next(this.searchTerm)
  }
  public searchPermissions(): void {
    this.isLoading = true
    this._permissionsService
      .getPermissionsByRoleAndModule(
        this.selectedRoleId!,
        this.selectedModuleId!,
        this.searchTerm,
        this.currentPage,
        this.pageSize
      )
      .subscribe((response) => {
        this.isLoading = false
        this.permissions$.next(response.data.result)
      })
  }
  public togglePermissionStatus(permissionId: number): void {
    if (!this.selectedRoleId) return
    this.isLoading = true
    this._permissionsService
      .togglePermissionStatus(this.selectedRoleId, permissionId)
      .pipe(
        tap(() => {
          this.loadPermissionsByModule()
        }),
        catchError((err) => {
          this.isLoading = false
          return of([])
        })
      )
      .subscribe(() => {
        this.isLoading = false
      })
  }
  public openEditModal(permissionId: string, event: Event): void {
    event.stopPropagation()
    this._bootstrapModalService.openModal({
      component: PermissionFormComponent,
      data: { permissionId, modalType: MODAL_TYPE.PERMISSION_FORM },
    })
  }
  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }
}
