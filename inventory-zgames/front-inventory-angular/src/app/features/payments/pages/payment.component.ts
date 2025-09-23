import { CommonModule } from '@angular/common'
import { Component, OnInit, OnDestroy, inject } from '@angular/core'
import { Router } from '@angular/router'
import { Store } from '@ngrx/store'
import { Subject, takeUntil } from 'rxjs'
import { NgbModule } from '@ng-bootstrap/ng-bootstrap'
import { TranslateModule } from '@ngx-translate/core'
import { PaymentTableComponent } from '../components/tables/payment-table/payment-table.component'
import { PageTitleComponent } from '@/app/shared/components/layouts/page-title/page-title.component'
import { AppState } from '@core/states'
import { selectUserPermissions } from '@core/states/auth/auth.selectors'
import { PERMISSIONS } from '@/app/shared/data/config/constants.permission'
@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    NgbModule,
    PaymentTableComponent,
    PageTitleComponent,
  ],
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss'],
})
export class PaymentComponent implements OnInit, OnDestroy {
  public readonly PERMISSIONS = PERMISSIONS
  public userPermissions: string[] = []
  public filters: Record<string, any> = {}
  private readonly destroy$ = new Subject<void>()
  private readonly router = inject(Router)
  private readonly store = inject(Store<AppState>)
  ngOnInit(): void {
    this.subscribeToAuthState()
  }
  ngOnDestroy(): void {
    this.destroy$.next()
    this.destroy$.complete()
  }
  private subscribeToAuthState(): void {
    this.store
      .select(selectUserPermissions)
      .pipe(takeUntil(this.destroy$))
      .subscribe((permissions) => {
        this.userPermissions = permissions || []
      })
  }
  public hasPermission(permission: string): boolean {
    return this.userPermissions.includes(permission)
  }
  public onFiltersChanged(filters: Record<string, any>): void {
    this.filters = { ...filters }
  }
  public navigateToPaymentReports(): void {
    this.router.navigate(['/payments/reports'])
  }
  public navigateToPaymentStats(): void {
    this.router.navigate(['/payments/statistics'])
  }
}
