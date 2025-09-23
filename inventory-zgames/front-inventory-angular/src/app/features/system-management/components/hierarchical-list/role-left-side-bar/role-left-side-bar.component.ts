import { CommonModule } from '@angular/common'
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  type OnDestroy,
  type OnInit,
} from '@angular/core'
import { FormsModule } from '@angular/forms'
import { RoleService } from '@core/services/api/role.service'
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
  finalize,
} from 'rxjs'
import { RoleFormComponent } from '../../forms/role-form/role-form.component'
import { MODAL_TYPE } from '@core/helpers/global/global.constants'
import { Role } from '@core/interfaces/api/rol.interface'
@Component({
  selector: 'role-left-side-bar',
  standalone: true,
  imports: [CommonModule, TranslateModule, NgbModule, FormsModule],
  templateUrl: './role-left-side-bar.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class RoleLeftSideBarComponent implements OnInit, OnDestroy {
  public roles$: BehaviorSubject<Role[]> = new BehaviorSubject<Role[]>([])
  public searchTerm = ''
  public isLoading = false
  public selectedRoleId: number | null = null
  private searchSubject = new Subject<string>()
  private destroy$ = new Subject<void>()
  private _roleService = inject(RoleService)
  private _selectionService = inject(SelectionService)
  private _bootstrapModalService = inject(BootstrapModalService)
  ngOnInit(): void {
    this.initializeSubscriptions()
    this.loadRoles()
  }
  private initializeSubscriptions(): void {
    this.subscribeToModalCloseForRoles()
    this.subscribeToRoleSelection()
    this.subscribeToRoleSearch()
  }
  private subscribeToModalCloseForRoles(): void {
    this._bootstrapModalService
      .getModalClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this._bootstrapModalService
          .getDataIssued()
          .pipe(takeUntil(this.destroy$))
          .subscribe((data) => {
            if (data?.modalType === MODAL_TYPE.ROLE_FORM) {
              this.loadRoles()
            }
          })
      })
  }
  private subscribeToRoleSelection(): void {
    this._selectionService.selectedRoleId$
      .pipe(takeUntil(this.destroy$))
      .subscribe((roleId) => {
        this.selectedRoleId = roleId
      })
  }
  private subscribeToRoleSearch(): void {
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap(() => (this.isLoading = true)),
        switchMap((term) =>
          this._roleService.getAllRoles(term).pipe(
            catchError((error) => {
              console.error('Search error:', error)
              return of({ data: { result: [] } })
            }),
            finalize(() => (this.isLoading = false))
          )
        ),
        takeUntil(this.destroy$)
      )
      .subscribe((response) => {
        this.roles$.next(response.data.result)
      })
  }
  private loadRoles(): void {
    this.isLoading = true
    this._roleService
      .getAllRoles(this.searchTerm)
      .pipe(
        tap((response) => {
          this.roles$.next(response.data.result)
        }),
        catchError((err) => {
          console.error('Error loading roles:', err)
          this.roles$.next([])
          return of([])
        }),
        finalize(() => (this.isLoading = false)),
        takeUntil(this.destroy$)
      )
      .subscribe()
  }
  public selectRole(roleId: number): void {
    if (this.selectedRoleId !== roleId) {
      this._selectionService.setRoleId(roleId)
    }
  }
  public onSearchInput(): void {
    this.searchSubject.next(this.searchTerm)
  }
  public searchRoles(): void {
    this.searchSubject.next(this.searchTerm)
  }
  public toggleRoleStatus(id: number, event?: Event): void {
    if (event) {
      event.stopPropagation()
    }
    this.isLoading = true
    this._roleService
      .toggleRoleStatus(id)
      .pipe(
        tap(() => {
          if (this.selectedRoleId === id) {
            this._selectionService.setRoleId(null)
            this._selectionService.setModuleId(null)
          }
        }),
        finalize(() => {
          this.isLoading = false
          this.loadRoles()
        }),
        takeUntil(this.destroy$)
      )
      .subscribe()
  }
  public openModal(): void {
    this._bootstrapModalService.openModal({
      component: RoleFormComponent,
      data: { modalType: MODAL_TYPE.ROLE_FORM },
    })
  }
  public openEditModal(roleId: string, event: Event): void {
    event.stopPropagation()
    this._bootstrapModalService.openModal({
      component: RoleFormComponent,
      data: { roleId, modalType: MODAL_TYPE.ROLE_FORM },
    })
  }
  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }
}
