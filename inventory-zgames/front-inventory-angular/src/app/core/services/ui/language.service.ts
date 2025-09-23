import { inject, Injectable } from '@angular/core'
import { Store } from '@ngrx/store'
import { BehaviorSubject, catchError, filter, of, tap } from 'rxjs'
import { LanguageCode } from '../../interfaces/ui/language.interface'
import { AVAILABLE_LANGUAGES } from '@core/helpers/global/global.constants'
import { selectLanguage } from '@core/states/language/language.selectors'
import { AppState } from '@core/states'
@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  public code: BehaviorSubject<LanguageCode> =
    new BehaviorSubject<LanguageCode>(AVAILABLE_LANGUAGES.ES)
  private _store = inject(Store)
  constructor() {
    this.initializeLanguage()
  }
  private initializeLanguage(): void {
    this._store
      .select(selectLanguage)
      .pipe(
        filter((language) => !!language),
        tap((language) => this.code.next(language)),
        catchError(() => {
          this.code.next(AVAILABLE_LANGUAGES.ES)
          return of(AVAILABLE_LANGUAGES.ES)
        })
      )
      .subscribe()
  }
}
