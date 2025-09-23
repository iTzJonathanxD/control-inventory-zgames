import { inject, Injectable } from '@angular/core'
import { Actions, createEffect, ofType } from '@ngrx/effects'
import { of, tap, exhaustMap } from 'rxjs'
import { LAYOUT_COLOR_TYPES } from './layout'
import { changeTheme, loadPreviewThemeSuccess } from './layout-action'
@Injectable()
export class LayoutEffects {
  private _actions$ = inject(Actions)
  private saveThemeToLocalStorage$ = createEffect(
    () =>
      this._actions$.pipe(
        ofType(changeTheme),
        tap(({ color }) => {
          localStorage.setItem('layout_theme', color)
        })
      ),
    { dispatch: false }
  )
  private loadThemeFromLocalStorage$ = createEffect(() =>
    this._actions$.pipe(
      ofType('[Layout] Load Preview Theme'),
      exhaustMap(() => {
        const storedTheme = localStorage.getItem(
          'layout_theme'
        ) as LAYOUT_COLOR_TYPES
        const theme = storedTheme ?? LAYOUT_COLOR_TYPES.LIGHTMODE
        return of(loadPreviewThemeSuccess({ color: theme }))
      })
    )
  )
}
