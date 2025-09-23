import { CommonModule } from '@angular/common'
import { Component, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core'
import { Router } from '@angular/router'
import { Store } from '@ngrx/store'
import { NgbModule } from '@ng-bootstrap/ng-bootstrap'
import { TranslateModule } from '@ngx-translate/core'
import { UserTableComponent } from '../components/tables/tables-users/user-table.component'
import { AppState } from '../../../core/states'
import { selectUserPermissions } from '../../../core/states/auth/auth.selectors'
import { PERMISSIONS } from '../../../shared/data/config/constants.permission'
@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule, TranslateModule, NgbModule, UserTableComponent],
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class UserComponent {
  public readonly PERMISSIONS = PERMISSIONS
  public userPermissions: string[] = []
  private readonly router = inject(Router)
  private readonly store = inject(Store<AppState>)
  constructor() {
    this.store.select(selectUserPermissions).subscribe((permissions) => {
      this.userPermissions = permissions || []
    })
  }
  public hasPermission(permission: string): boolean {
    return this.userPermissions.includes(permission)
  }
  public navigateToWhatsAppConfig(): void {
    this.router.navigate(['/whatsapp/configuration'])
  }
}
