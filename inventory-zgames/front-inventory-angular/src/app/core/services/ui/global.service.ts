import { inject, Injectable } from '@angular/core'
import { Store } from '@ngrx/store'
import { catchError, filter, of, ReplaySubject, tap } from 'rxjs'
import { User } from '../../interfaces/api/user.interface'
import { selectUser } from '../../states/auth/auth.selectors'
import { AppState } from '@core/states'
@Injectable({
  providedIn: 'root',
})
export class GlobalService {
  public profile = new ReplaySubject<User>(1)
  private _store = inject(Store<AppState>)
  constructor() {
    this.getProfileByStore()
  }
  private getProfileByStore(): void {
    this._store
      .select(selectUser)
      .pipe(
        filter((user) => !!user),
        tap((user) => {
          this.profile.next(user!)
        }),
        catchError(() => {
          console.log('Error getting user')
          return of(null)
        })
      )
      .subscribe()
  }
}
