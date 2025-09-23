import {
  Component,
  HostListener,
  inject,
  type OnInit,
  type OnDestroy,
  ChangeDetectorRef,
  type AfterViewInit,
} from '@angular/core'
import { CommonModule } from '@angular/common'
import { PageTitleComponent } from '@/app/shared/components/layouts/page-title/page-title.component'
import { RoleLeftSideBarComponent } from '../../components/hierarchical-list/role-left-side-bar/role-left-side-bar.component'
import { ModuleAreaComponent } from '../../components/hierarchical-list/module-area/module-area.component'
import { PermissionRigthSideBarComponent } from '../../components/hierarchical-list/permission-rigth-side-bar/permission-rigth-side-bar.component'
import { TranslatePipe } from '@ngx-translate/core'
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap'
import { SelectionService } from '@core/services/ui/selection.service'
import { Subject, takeUntil } from 'rxjs'
@Component({
  selector: 'roles-and-permissions',
  standalone: true,
  imports: [
    CommonModule,
    PageTitleComponent,
    RoleLeftSideBarComponent,
    ModuleAreaComponent,
    PermissionRigthSideBarComponent,
    TranslatePipe,
    NgbNavModule,
  ],
  templateUrl: './roles-and-permissions.component.html',
  styleUrl: './roles-and-permissions.component.scss',
})
export class RolesAndPermissionsComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  public activeTab: 'role' | 'module' | 'permission' = 'role'
  public selectedRoleId: number | null = null
  public selectedModuleId: number | null = null
  public isSmallScreen = false
  private _selectionService = inject(SelectionService)
  private _cdr = inject(ChangeDetectorRef)
  private destroy$ = new Subject<void>()
  ngOnInit(): void {
    this.checkScreenSize()
    this.initializeSubscriptions()
  }
  ngAfterViewInit(): void {
    setTimeout(() => {
      this._cdr.detectChanges()
    })
  }
  private initializeSubscriptions(): void {
    this._selectionService.selectedRoleId$
      .pipe(takeUntil(this.destroy$))
      .subscribe((roleId) => {
        setTimeout(() => {
          this.selectedRoleId = roleId
          if (roleId && this.isSmallScreen && this.activeTab === 'role') {
            this.setActiveTab('module')
          }
          this._cdr.detectChanges()
        })
      })
    this._selectionService.selectedModuleId$
      .pipe(takeUntil(this.destroy$))
      .subscribe((moduleId) => {
        setTimeout(() => {
          this.selectedModuleId = moduleId
          if (moduleId && this.isSmallScreen && this.activeTab === 'module') {
            this.setActiveTab('permission')
          }
          this._cdr.detectChanges()
        })
      })
  }
  private checkScreenSize(): void {
    const wasSmallScreen = this.isSmallScreen
    this.isSmallScreen = window.innerWidth <= 768
    if (wasSmallScreen !== this.isSmallScreen) {
      this.activeTab = 'role'
      this._cdr.detectChanges()
    }
  }
  public setActiveTab(tab: 'role' | 'module' | 'permission'): void {
    this.activeTab = tab
  }
  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    this.checkScreenSize()
  }
  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }
}
