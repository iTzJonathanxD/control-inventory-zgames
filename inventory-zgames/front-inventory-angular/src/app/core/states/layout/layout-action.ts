import { createAction, props } from '@ngrx/store'
import { LAYOUT_COLOR_TYPES } from './layout'
export const changelayout = createAction(
  '[Layout] Set Layout',
  props<{ layout: string }>()
)
export const changetheme = createAction(
  '[Layout] Set Color',
  props<{ color: string }>()
)
export const changemode = createAction(
  '[Layout] Set Mode',
  props<{ mode: string }>()
)
export const changetopbarcolor = createAction(
  '[Layout] Set Topbar',
  props<{ topbar: string }>()
)
export const changemenucolor = createAction(
  '[Layout] Set Menu',
  props<{ menu: string }>()
)
export const changesidebarsize = createAction(
  '[Layout] Set size',
  props<{ size: string }>()
)
export const resetState = createAction('[App] Reset State')
export const changeTheme = createAction(
  '[Layout] Set Color',
  props<{ color: LAYOUT_COLOR_TYPES }>()
)
export const loadPreviewTheme = createAction('[Layout] Load Preview Theme')
export const loadPreviewThemeSuccess = createAction(
  '[Layout] Load Preview Theme Success',
  props<{ color: LAYOUT_COLOR_TYPES }>()
)
