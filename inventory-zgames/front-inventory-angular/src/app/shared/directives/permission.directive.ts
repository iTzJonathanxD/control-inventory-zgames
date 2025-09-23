import {
  Directive,
  Input,
  TemplateRef,
  ViewContainerRef,
  OnChanges,
  SimpleChanges,
} from '@angular/core'
import { Store } from '@ngrx/store'
import { AppState } from '@core/states/index'
import { selectUserPermissions } from '@core/states/auth/auth.selectors'
@Directive({
  selector: '[hasPermission]',
})
export class PermissionDirective implements OnChanges {
  private permissions: any[] = []
  private isPermissionsLoaded = false
  private currentModules: string[] = []
  private currentPermissions: string[] = []
  private hasView = false
  constructor(
    private store: Store<AppState>,
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef
  ) {
    this.store.select(selectUserPermissions).subscribe((permissions) => {
      this.permissions = permissions || []
      this.isPermissionsLoaded = true
      this.evaluatePermission()
    })
  }
  @Input() set hasPermission(config: {
    modules?: string[]
    permissions?: string[]
  }) {
    this.currentModules = config.modules || []
    this.currentPermissions = config.permissions || []
    this.evaluatePermission()
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['hasPermission']) {
      this.evaluatePermission()
    }
  }
  private evaluatePermission() {
    if (this.isPermissionsLoaded) {
      if (this.checkPermission()) {
        if (!this.hasView) {
          this.viewContainer.createEmbeddedView(this.templateRef)
          this.hasView = true
        }
      } else {
        if (this.hasView) {
          this.viewContainer.clear()
          this.hasView = false
        }
      }
    }
  }
  private checkPermission(): boolean {
    const hasPermission = this.permissions.some((p) => {
      const matchesPermissionId =
        this.currentPermissions.length === 0 ||
        this.currentPermissions.includes(p.permissionId.identifier)
      const matchesModuleId =
        this.currentModules.length === 0 ||
        this.currentModules.includes(p.permissionId.moduleId._id)
      return matchesPermissionId && matchesModuleId
    })
    return hasPermission
  }
}
